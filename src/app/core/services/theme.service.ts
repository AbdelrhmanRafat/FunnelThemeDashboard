import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Theme } from '../../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Theme[] = [
    { id: 1, title: 'Theme 1', imageUrl: 'https://via.placeholder.com/300' },
    { id: 2, title: 'Theme 2', imageUrl: 'https://via.placeholder.com/300' },
    { id: 3, title: 'Theme 3', imageUrl: 'https://via.placeholder.com/300' },
    { id: 4, title: 'Theme 4', imageUrl: 'https://via.placeholder.com/300' },
    { id: 5, title: 'Theme 5', imageUrl: 'https://via.placeholder.com/300' },
    { id: 6, title: 'Theme 6', imageUrl: 'https://via.placeholder.com/300' }
  ];

  constructor() { }

  getThemes(): Observable<Theme[]> {
    return of(this.themes);
  }

  getTheme(id: number): Observable<Theme | undefined> {
    return of(this.themes.find(theme => theme.id === id));
  }
}
