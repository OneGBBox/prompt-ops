import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'app-json-schema',
  imports: [CommonModule, FormsModule],
  templateUrl: './json-schema.component.html',
  styleUrl: './json-schema.component.css'
})
export class JsonSchemaComponent {
  userPrompt = 'A pair of wireless noise-cancelling headphones, priced at 299 dollars, highly rated';
  result: any = null;
  loading = false;
  error = '';
  showSystemPrompt = false;

  presets = [
    'A pair of wireless noise-cancelling headphones, priced at 299 dollars, highly rated',
    'Organic almond butter, small jar, affordable, healthy snack',
    'A vintage denim jacket, perfect for layering, great reviews',
    'USB-C fast charger, 65W, out of stock unfortunately',
  ];

  constructor(private api: ApiserviceService) { }

  generate() {
    if (!this.userPrompt.trim()) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.api.jsonSchema(this.userPrompt).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; },
    });
  }

  usePreset(p: string) {
    this.userPrompt = p;
  }

  get prettyJson(): string {
    return this.result?.parsed_json
      ? JSON.stringify(this.result.parsed_json, null, 2)
      : '';
  }

  get schemaStr(): string {
    return this.result?.schema
      ? JSON.stringify(this.result.schema, null, 2)
      : '';
  }

  schemaFields(): { key: string; type: string; required: boolean }[] {
    if (!this.result?.schema) return [];
    const props = this.result.schema.properties;
    const required: string[] = this.result.schema.required || [];
    return Object.keys(props).map(k => ({
      key: k,
      type: Array.isArray(props[k].type) ? props[k].type.join('|') :
        (props[k].enum ? props[k].enum.join(' | ') : props[k].type || (props[k].items ? 'array' : '?')),
      required: required.includes(k),
    }));
  }
}
