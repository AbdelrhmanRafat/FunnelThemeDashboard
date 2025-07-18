// services/storage.service.ts
import { Injectable } from '@angular/core';
import { AllBlocksSessionStorage } from '../../models/theme.classic.blocks';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SESSION_STORAGE_KEY = 'allBlocks';

  saveToSessionStorage(data: AllBlocksSessionStorage): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }

  getFromSessionStorage(): AllBlocksSessionStorage | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return null;
    }
  }

  clearSessionStorage(): void {
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }
}