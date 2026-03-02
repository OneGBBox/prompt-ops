import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'app-temperature',
  imports: [CommonModule, FormsModule],
  templateUrl: './temperature.component.html',
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent {
  prompt = 'Write a one-sentence tagline for a coffee shop called "The Morning Ritual".';
  result: any = null;
  loading = false;
  error = '';

  presets = [
    'Write a one-sentence tagline for a coffee shop called "The Morning Ritual".',
    'Suggest a name for a new programming language.',
    'Describe the color blue in one sentence.',
    'What is 2 + 2? Give a short answer.',
    'Give a metaphor for learning something new.',
  ];
  constructor(private api: ApiserviceService) { }

  compare() {
    if (!this.prompt.trim()) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.api.temperature(this.prompt).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }

  usePreset(p: string) { this.prompt = p; }
}
