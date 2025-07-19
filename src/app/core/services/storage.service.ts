// services/storage.service.ts
import { Injectable } from '@angular/core';
import { AllBlocksSessionStorage } from '../../models/theme.classic.blocks';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SESSION_STORAGE_KEY = 'allBlocks';

  saveToSessionStorage(data: AllBlocksSessionStorage): boolean {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to session storage:', error);
      return false; // Return success/failure
    }
  }

  // Add validation method
  validateSessionData(data: any): data is AllBlocksSessionStorage {
    return data && 
           typeof data === 'object' && 
           Array.isArray(data.allBlocks) &&
           data.allBlocks.every((block: any) => 
             block.hasOwnProperty('key') && 
             block.hasOwnProperty('show') && 
             block.hasOwnProperty('order') &&
             block.hasOwnProperty('store_id') &&
             block.hasOwnProperty('funnel_id') &&
             block.hasOwnProperty('data')
           );
  }

  getFromSessionStorage(): AllBlocksSessionStorage | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : null;
      
      // Validate data structure
      if (parsed && this.validateSessionData(parsed)) {
        return parsed;
      }
      
      if (parsed && !this.validateSessionData(parsed)) {
        console.warn('Invalid session storage data structure, clearing storage');
        this.clearSessionStorage();
      }
      
      return null;
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

  // Additional utility methods
  hasValidSessionData(): boolean {
    const data = this.getFromSessionStorage();
    return data !== null && data.allBlocks.length > 0;
  }

  getSessionDataSize(): number {
    try {
      const data = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      return data ? data.length : 0;
    } catch (error) {
      console.error('Error getting session data size:', error);
      return 0;
    }
  }
}