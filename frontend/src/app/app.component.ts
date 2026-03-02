import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  navItems: NavItem[] = [
    { label: 'Tokens & Context', icon: '🧩', route: '/tokens', badge: '01' },
    { label: 'JSON Schema', icon: '📐', route: '/json-schema', badge: '02' },
    { label: 'Temperature', icon: '🌡️', route: '/temperature', badge: '03' },
    { label: 'Few-Shot', icon: '🎯', route: '/few-shot', badge: '04' },
  ];
}


