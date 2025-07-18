// services/themeselect.service.ts
import { Injectable } from '@angular/core';
import { Block } from '../../models/theme.classic.blocks';

@Injectable({
  providedIn: 'root'
})
export class ThemeSelectService {

  async loadMockDataByTheme(themeKey: string): Promise<Block[]> {
    try {
      console.log('loadMockDataByTheme called with themeKey:', themeKey);
      let mockData: any[];
  
      switch (themeKey) {
        case 'classic':
          console.log('Loading classicBlocks.json...');
          mockData = (await import('../mock/classicBlocks.json')).default.blocks;
          break;
        default:
          console.warn(`Unknown theme key: ${themeKey}, loading default theme`);
          mockData = (await import('../mock/classicBlocks.json')).default.blocks;
      }
  
      console.log('Loaded mock data:', mockData);
      return mockData;
    } catch (error) {
      console.error(`❌ Error loading mock data for theme: ${themeKey}`, error);
      return [];
    }
  }
}