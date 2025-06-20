import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpeechService } from '../services/speech/speech.service';

interface Balance {
  solde_principal: number;
  credit_communication: number;
  internet_mb: number;
  bonus_fidelite: number;
}

interface ChatMessage {
  type: 'user' | 'assistant' | 'error';
  text: string;
  audioId?: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  balance: Balance | null = null;
  response = '';
  error = '';
  loading = false;
  chatHistory: ChatMessage[] = [];
  textInput = '';
  currentAudioId: string | null = null;
  isPlaying = false;
  countdown = 0;
  listening = false;
  transcript = '';
  speechAvailable = false;

  private subscriptions: Subscription[] = [];
  private countdownSubscription?: Subscription;
  private autoSendTimer?: any;

  quickActions: QuickAction[] = [
    { label: 'Mon solde', action: () => this.sendMessage('Quel est mon solde ?') },
    { label: 'Historique', action: () => this.sendMessage('Montre mon historique') },
    { label: 'Recharge crédit', action: () => this.sendMessage('Recharge crédit') },
    { label: 'Forfait internet', action: () => this.sendMessage('Forfait internet') },
  ];

  constructor(
    private speechService: SpeechService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.fetchBalance();
    await this.initSpeechRecognition();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.autoSendTimer) {
      clearTimeout(this.autoSendTimer);
    }
    this.speechService.stopListening();
  }

  private async initSpeechRecognition() {
    try {
      this.speechAvailable = await this.speechService.isAvailable();
      if (!this.speechAvailable) {
        console.warn('Speech recognition not available');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      this.speechAvailable = false;
    }
  }

  private async fetchBalance() {
    try {
      const data = await this.http.get<Balance>('http://localhost:5000/solde').toPromise();
      this.balance = data || null;
    } catch (err) {
      console.error('Erreur lors de la récupération du solde:', err);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  async sendMessage(message: string) {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      text: message,
      timestamp: new Date()
    };
    this.chatHistory.push(userMessage);
    this.scrollToBottom();

    try {
      this.loading = true;
      this.error = '';

      const response = await this.http.post<any>('http://localhost:5000/process', {
        text: message
      }).toPromise();

      if (response) {
        const assistantMessage: ChatMessage = {
          type: 'assistant',
          text: response.response,
          audioId: response.audio_id,
          timestamp: new Date()
        };

        this.chatHistory.push(assistantMessage);
        this.currentAudioId = response.audio_id;

        // Auto-play audio after adding message
        setTimeout(() => {
          if (response.audio_id && !this.isPlaying) {
            this.playAudio(response.audio_id);
          }
        }, 300);

        await this.fetchBalance();
      }
    } catch (err: any) {
      this.error = err.message || 'Erreur serveur';
      const errorMessage: ChatMessage = {
        type: 'error',
        text: `Erreur: ${err.message || 'Erreur serveur'}`,
        timestamp: new Date()
      };
      this.chatHistory.push(errorMessage);
    } finally {
      this.loading = false;
      this.scrollToBottom();
    }
  }

  handleTextSubmit() {
    if (this.textInput.trim() && !this.loading) {
      this.sendMessage(this.textInput);
      this.textInput = '';
    }
  }

  async startListening() {
    if (!this.speechAvailable || this.listening || this.loading) return;

    try {
      this.transcript = '';
      this.listening = true;
      this.countdown = 6;

      // Start countdown
      this.countdownSubscription = interval(1000).subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.handleAutoSend();
        }
      });

      // Auto-send timer
      this.autoSendTimer = setTimeout(() => {
        this.handleAutoSend();
      }, 6000);

      // Start speech recognition
      const results = await this.speechService.startListening(
        (partialResults: string[]) => {
          if (partialResults && partialResults.length > 0) {
            this.transcript = partialResults[0];
          }
        },
        { language: 'fr-FR' }
      );

      if (results && results.length > 0) {
        this.transcript = results[0];
      }

    } catch (error) {
      console.error('Speech recognition error:', error);
      this.stopListening();
    }
  }

  async stopListening() {
    if (!this.listening) return;

    this.listening = false;
    this.countdown = 0;

    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.autoSendTimer) {
      clearTimeout(this.autoSendTimer);
    }

    try {
      await this.speechService.stopListening();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  private handleAutoSend() {
    if (this.transcript.trim()) {
      this.handleVoiceSubmit();
    } else {
      this.stopListening();
    }
  }

  handleVoiceSubmit() {
    if (this.transcript.trim()) {
      this.sendMessage(this.transcript);
      this.transcript = '';
    }
    this.stopListening();
  }

  async playAudio(audioId: string) {
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;
      const audio = new Audio(`http://localhost:5000/audio/${audioId}`);

      audio.onended = () => {
        this.isPlaying = false;
      };

      audio.onerror = () => {
        this.isPlaying = false;
      };

      await audio.play();
    } catch (err) {
      console.error('Erreur lecture audio:', err);
      this.isPlaying = false;
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleTextSubmit();
    }
  }
}
