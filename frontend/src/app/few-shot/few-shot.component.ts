import { Component } from '@angular/core';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'app-few-shot',
  imports: [],
  templateUrl: './few-shot.component.html',
  styleUrl: './few-shot.component.css'
})
export class FewShotComponent {
  userInput = 'My internet connection keeps dropping every hour';
  result: any = null;
  loading = false;
  error = '';
  showMessages = false;

  presets = [
    'My internet connection keeps dropping every hour',
    'The printer is not showing up on my computer',
    'I accidentally deleted an important file',
    'The video call software crashes on startup',
    'My keyboard has some keys that stopped working',
  ];

  constructor(private api: ApiserviceService) { }

  generate() {
    if (!this.userInput.trim()) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.api.fewShotGenerate(this.userInput).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }


  usePreset(p: string) { this.userInput = p; }

  get messagesJson(): string {
    return this.result?.messages_sent
      ? JSON.stringify(this.result.messages_sent, null, 2)
      : '';
  }

  outputLines(): { icon: string; label: string; value: string }[] {
    if (!this.result?.output) return [];
    return this.result.output.split('\n').map((line: string) => {
      const parts = line.split(': ');
      return {
        icon: parts[0]?.trim() || '',
        label: '',
        value: parts.slice(1).join(': ').trim(),
      };
    });
  }
}