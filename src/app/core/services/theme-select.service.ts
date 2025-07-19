// services/theme-select.service.ts
import { Injectable } from '@angular/core';
import { Block } from '../../models/theme.classic.blocks';

@Injectable({
  providedIn: 'root'
})
export class ThemeSelectService {
  private mockDataCache = new Map<string, Block[]>();

  async loadMockDataByTheme(themeKey: string): Promise<Block[]> {
    // Add caching to avoid repeated imports
    if (this.mockDataCache.has(themeKey)) {
      console.log(`📦 Loading cached mock data for theme: ${themeKey}`);
      return this.mockDataCache.get(themeKey)!;
    }

    try {
      console.log('loadMockDataByTheme called with themeKey:', themeKey);
      let mockData: any[];

      switch (themeKey) {
        case 'classic':
          console.log('Loading classicBlocks.json...');
          const classicData = await import('../mock/classicBlocks.json');
          mockData = classicData.default.blocks;
          break;

        default:
          console.warn(`Unknown theme key: ${themeKey}, loading default theme`);
          const defaultData = await import('../mock/classicBlocks.json');
          mockData = defaultData.default.blocks;
      }

      // Validate mock data structure
      if (!Array.isArray(mockData) || mockData.length === 0) {
        console.error('Invalid mock data structure or empty array');
        return [];
      }

      // Cache the result
      this.mockDataCache.set(themeKey, mockData);
      console.log(`✅ Loaded and cached mock data for theme: ${themeKey}, blocks count: ${mockData.length}`);
      return mockData;
    } catch (error) {
      console.error(`❌ Error loading mock data for theme: ${themeKey}`, error);
      
      // Try to load default theme as fallback
      if (themeKey !== 'classic') {
        console.log('Attempting to load classic theme as fallback...');
        return this.loadMockDataByTheme('classic');
      }
      
      return [];
    }
  }

  // Add method to clear cache if needed
  clearCache(): void {
    console.log('🗑️ Clearing theme cache');
    this.mockDataCache.clear();
  }

  // Add method to clear specific theme cache
  clearThemeCache(themeKey: string): void {
    console.log(`🗑️ Clearing cache for theme: ${themeKey}`);
    this.mockDataCache.delete(themeKey);
  }

  // Get available cached themes
  getCachedThemes(): string[] {
    return Array.from(this.mockDataCache.keys());
  }

  // Check if theme is cached
  isThemeCached(themeKey: string): boolean {
    return this.mockDataCache.has(themeKey);
  }

  // Get cache size info
  getCacheInfo(): { themes: string[], totalBlocks: number } {
    const themes = this.getCachedThemes();
    const totalBlocks = Array.from(this.mockDataCache.values())
      .reduce((total, blocks) => total + blocks.length, 0);
    
    return { themes, totalBlocks };
  }

  // Preload multiple themes
  async preloadThemes(themeKeys: string[]): Promise<void> {
    console.log(`🚀 Preloading themes: ${themeKeys.join(', ')}`);
    
    const loadPromises = themeKeys.map(themeKey => 
      this.loadMockDataByTheme(themeKey).catch(error => {
        console.error(`Failed to preload theme: ${themeKey}`, error);
        return [];
      })
    );

    await Promise.all(loadPromises);
    console.log('✅ Theme preloading completed');
  }

  // Get supported themes (you can expand this based on available mock files)
  getSupportedThemes(): string[] {
    return ['classic', 'modern', 'minimal'];
  }
}