import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Theme, CreateThemeRequest, UpdateThemeRequest } from '../../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Theme[] = [
    {
      id: 1,
      name_ar: "كلاسيك ثيم",
      name_en: "classic theme",
      key: "classic",
      description_ar: "كلاسيك ثيم",
      description_en: "classic theme",
      is_active: 1,
      image: "https://backend.dev.baseet.co/uploads/test theme",
      preview_url: "",
      created_at: "2025-07-13T16:24:04.000000Z",
      updated_at: "2025-07-13T16:24:04.000000Z",
      name: "كلاسيك ثيم"
    },
    {
      id: 2,
      name_ar: "ثيم مودرن",
      name_en: "modern theme",
      key: "modern",
      description_ar: "ثيم مودرن للتطبيقات العصرية",
      description_en: "modern theme for contemporary applications",
      is_active: 1,
      image: "https://source.unsplash.com/800x600/?modern,design",
      preview_url: "https://preview.example.com/modern",
      created_at: "2025-07-14T10:15:30.000000Z",
      updated_at: "2025-07-14T10:15:30.000000Z",
      name: "ثيم مودرن"
    },
    {
      id: 3,
      name_ar: "ثيم داكن",
      name_en: "dark theme",
      key: "dark",
      description_ar: "ثيم داكن للعيون الحساسة",
      description_en: "dark theme for sensitive eyes",
      is_active: 1,
      image: "https://source.unsplash.com/800x600/?dark,ui",
      preview_url: "",
      created_at: "2025-07-15T08:30:45.000000Z",
      updated_at: "2025-07-15T08:30:45.000000Z",
      name: "ثيم داكن"
    },
    {
      id: 4,
      name_ar: "ثيم ملون",
      name_en: "colorful theme",
      key: "colorful",
      description_ar: "ثيم ملون مبهج",
      description_en: "vibrant colorful theme",
      is_active: 0,
      image: "https://source.unsplash.com/800x600/?colorful,vibrant",
      preview_url: "https://preview.example.com/colorful",
      created_at: "2025-07-16T14:20:15.000000Z",
      updated_at: "2025-07-16T14:20:15.000000Z",
      name: "ثيم ملون"
    },
    {
      id: 5,
      name_ar: "ثيم أعمال",
      name_en: "business theme",
      key: "business",
      description_ar: "ثيم مخصص للأعمال",
      description_en: "professional business theme",
      is_active: 1,
      image: "https://source.unsplash.com/800x600/?business,professional",
      preview_url: "",
      created_at: "2025-07-17T11:45:20.000000Z",
      updated_at: "2025-07-17T11:45:20.000000Z",
      name: "ثيم أعمال"
    }
  ];

  private nextId = 6;

  constructor() { }

  // Get all themes
  getThemes(): Observable<Theme[]> {
    return of([...this.themes]).pipe(delay(300)); // Simulate API delay
  }

  // Get active themes only
  getActiveThemes(): Observable<Theme[]> {
    return of(this.themes.filter(theme => theme.is_active === 1)).pipe(delay(300));
  }

  // Get theme by ID
  getTheme(id: number): Observable<Theme | undefined> {
    const theme = this.themes.find(theme => theme.id === id);
    return of(theme).pipe(delay(200));
  }

  // Get theme by key
  getThemeByKey(key: string): Observable<Theme | undefined> {
    const theme = this.themes.find(theme => theme.key === key);
    return of(theme).pipe(delay(200));
  }

  // Create new theme
  createTheme(themeData: CreateThemeRequest): Observable<Theme> {
    // Check if key already exists
    const existingTheme = this.themes.find(theme => theme.key === themeData.key);
    if (existingTheme) {
      return throwError(() => new Error('Theme key already exists'));
    }

    const now = new Date().toISOString();
    const newTheme: Theme = {
      id: this.nextId++,
      ...themeData,
      created_at: now,
      updated_at: now,
      name: themeData.name_ar // Set default name to Arabic name
    };

    this.themes.push(newTheme);
    return of(newTheme).pipe(delay(500));
  }

  // Update theme
  updateTheme(themeData: UpdateThemeRequest): Observable<Theme> {
    const index = this.themes.findIndex(theme => theme.id === themeData.id);
    if (index === -1) {
      return throwError(() => new Error('Theme not found'));
    }

    // Check if key already exists in other themes
    if (themeData.key) {
      const existingTheme = this.themes.find(theme => theme.key === themeData.key && theme.id !== themeData.id);
      if (existingTheme) {
        return throwError(() => new Error('Theme key already exists'));
      }
    }

    const updatedTheme: Theme = {
      ...this.themes[index],
      ...themeData,
      updated_at: new Date().toISOString(),
      name: themeData.name_ar || this.themes[index].name_ar
    };

    this.themes[index] = updatedTheme;
    return of(updatedTheme).pipe(delay(500));
  }

  // Delete theme
  deleteTheme(id: number): Observable<boolean> {
    const index = this.themes.findIndex(theme => theme.id === id);
    if (index === -1) {
      return throwError(() => new Error('Theme not found'));
    }

    this.themes.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  // Toggle theme active status
  toggleThemeStatus(id: number): Observable<Theme> {
    const index = this.themes.findIndex(theme => theme.id === id);
    if (index === -1) {
      return throwError(() => new Error('Theme not found'));
    }

    const updatedTheme = {
      ...this.themes[index],
      is_active: this.themes[index].is_active === 1 ? 0 : 1,
      updated_at: new Date().toISOString()
    };

    this.themes[index] = updatedTheme;
    return of(updatedTheme).pipe(delay(300));
  }

  // Search themes
  searchThemes(query: string): Observable<Theme[]> {
    const searchQuery = query.toLowerCase();
    const filteredThemes = this.themes.filter(theme => 
      theme.name_ar.toLowerCase().includes(searchQuery) ||
      theme.name_en.toLowerCase().includes(searchQuery) ||
      theme.key.toLowerCase().includes(searchQuery) ||
      theme.description_ar.toLowerCase().includes(searchQuery) ||
      theme.description_en.toLowerCase().includes(searchQuery)
    );
    
    return of(filteredThemes).pipe(delay(200));
  }

  // Get themes with pagination
  getThemesPaginated(page: number = 1, limit: number = 10): Observable<{themes: Theme[], total: number, page: number, limit: number}> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedThemes = this.themes.slice(startIndex, endIndex);
    
    return of({
      themes: paginatedThemes,
      total: this.themes.length,
      page,
      limit
    }).pipe(delay(300));
  }
}