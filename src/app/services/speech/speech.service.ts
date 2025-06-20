import { Injectable } from '@angular/core';
import {
  SpeechRecognition as MobileSpeechRecognition,
  UtteranceOptions,
} from '@capacitor-community/speech-recognition';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private webRecognition?: any;
  private isListening = false;

  constructor() { }

  private isNative(): boolean {
    return Capacitor.getPlatform() !== 'web';
  }

  async isAvailable(): Promise<boolean> {
    if (this.isNative()) {
      return (await MobileSpeechRecognition.available()).available;
    }

    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  async hasPermission(): Promise<boolean> {
    if (this.isNative()) {
      const perms = await MobileSpeechRecognition.checkPermissions();
      return perms.speechRecognition === 'granted';
    }

    // Sur le Web, les permissions sont demandées au moment de l'utilisation
    return true;
  }

  async requestPermission(): Promise<void> {
    if (this.isNative()) {
      await MobileSpeechRecognition.requestPermissions();
    }
    // Web : rien à faire ici
  }

  async removeListeners(): Promise<void> {
    if (this.isNative()) {
      await MobileSpeechRecognition.removeAllListeners();
    } else {
      // Rien à nettoyer sur le Web ici
    }
  }

  async stopListening(): Promise<void> {
    if (this.isNative()) {
      await MobileSpeechRecognition.stop();
      await MobileSpeechRecognition.removeAllListeners();
    } else if (this.webRecognition && this.isListening) {
      this.webRecognition.stop();
      this.isListening = false;
    }
  }

  async startListening(
    onPartialResult?: (matches: string[]) => void,
    options?: UtteranceOptions
  ): Promise<string[] | undefined> {
    const available = await this.isAvailable();
    if (!available) throw new Error('Reconnaissance vocale non disponible.');

    if (!await this.hasPermission()) {
      await this.requestPermission();
      if (!await this.hasPermission()) {
        throw new Error('Permission micro non accordée.');
      }
    }

    if (this.isNative()) {
      const opts: UtteranceOptions = {
        language: 'fr-FR',
        maxResults: 2,
        prompt: 'Parlez maintenant',
        partialResults: true,
        popup: true,
        ...options,
      };

      await this.removeListeners();

      let partialHandle: PluginListenerHandle | null = null;
      if (onPartialResult) {
        partialHandle = await MobileSpeechRecognition.addListener(
          'partialResults',
          (data: { matches: string[] }) => onPartialResult(data.matches)
        );
      }

      const finalResult = await MobileSpeechRecognition.start(opts);

      if (partialHandle) await partialHandle.remove();

      return finalResult.matches;
    } else {
      return this.startWebRecognition(onPartialResult, options?.language || 'fr-FR');
    }
  }

  private startWebRecognition(
    onPartialResult?: (matches: string[]) => void,
    lang: string = 'fr-FR'
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const SpeechRecognitionConstructor: any =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        reject('Reconnaissance vocale non supportée sur ce navigateur.');
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      this.webRecognition = recognition;
      this.isListening = true;

      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 2;

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        const results: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          results.push(transcript);

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else if (onPartialResult) {
            onPartialResult([transcript]);
          }
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(event.error || 'Erreur reconnaissance vocale');
      };

      recognition.onend = () => {
        this.isListening = false;
        resolve([finalTranscript.trim()]);
      };

      recognition.start();
    });
  }
}
