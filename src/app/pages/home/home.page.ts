import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { Theme } from '../../models/theme.model';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,RouterLink],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomeComponent implements OnInit {
  private _themeService: ThemeService = inject(ThemeService);
  themes: Theme[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() { }

  ngOnInit(): void {
    this.loadThemes();
  }

  loadThemes(): void {
    this.isLoading = true;
    this.error = null;
    
    this._themeService.getActiveThemes().subscribe({
      next: (res: Theme[]) => {
        this.themes = res;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load themes';
        this.isLoading = false;
        console.error('Error loading themes:', error);
      }
    });
  }

  onThemeClick(theme: Theme): void {
    console.log('Theme clicked:', theme);
    // Additional logic for theme selection can be added here
  }

  toggleThemeStatus(themeId: number, event: Event): void {
    event.stopPropagation(); // Prevent navigation
    
    this._themeService.toggleThemeStatus(themeId).subscribe({
      next: (updatedTheme) => {
        const index = this.themes.findIndex(t => t.id === themeId);
        if (index !== -1) {
          this.themes[index] = updatedTheme;
        }
      },
      error: (error) => {
        console.error('Error toggling theme status:', error);
      }
    });
  }

  refreshThemes(): void {
    this.loadThemes();
  }
}