import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'app-tokens',
  imports: [CommonModule, FormsModule],
  templateUrl: './tokens.component.html',
  styleUrl: './tokens.component.css'
})
export class TokensComponent {
  text = 'The quick brown fox jumps over the lazy dog. Artificial intelligence is transforming the world.';
  result: any = null;
  loading = false;
  error = '';
  constructor(private api: ApiserviceService) { }

  countTokens() {
    if (!this.text.trim()) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.api.tokensContext(this.text).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }
  get windowPercent(): number {
    if (!this.result) return 0;
    return Math.min(100, (this.result.estimated_tokens / this.result.context_window_size) * 100);
  }

  getChunkColor(index: number): string {
    const colors = ['#7c6af5', '#f5a623', '#4ade80', '#f87171', '#60a5fa', '#e879f9'];
    return colors[index % colors.length];
  }
}
