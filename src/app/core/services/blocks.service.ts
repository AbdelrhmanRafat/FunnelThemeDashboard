import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import { AllBlockssessionStorage, Block, BlockData, BlockSessionStorage, FunnelRes, MockBlocks, Root } from '../../models/theme.classic.blocks';
import { getFunnelPage } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BlocksService {
  private blocksSubject: BehaviorSubject<BlockSessionStorage[]> = new BehaviorSubject<BlockSessionStorage[]>([]);
  public blocks$: Observable<BlockSessionStorage[]> = this.blocksSubject.asObservable();
  private readonly SESSION_STORAGE_KEY = 'allBlocks';

  constructor() {
    // Initialize from session storage if available
    this.initializeFromSessionStorage();
  }

  // ===== INITIALIZATION METHODS =====

  private initializeFromSessionStorage(): void {
    const sessionData = this.getFromSessionStorage();
    if (sessionData) {
      this.blocksSubject.next(sessionData.allBlocks);
    }
  }

  async initializeBlocksSession(funnelId: number): Promise<AllBlockssessionStorage> {
    try {
      // 1. Fetch API data
      const response = await getFunnelPage(funnelId);
      const funnelData : FunnelRes = response.data;
      // 2. Load mock data based on theme key
      const themeKey = funnelData.funnel_theme.key ?? 'classic'; 
      const mockBlocks = await this.loadMockDataByTheme(themeKey);
      
      
      // 3. Initialize session storage with mock data
      let sessionBlocks = this.transformMockToSessionStorage(mockBlocks, funnelData);
      
      // 4. Process API blocks and override/add to session storage
      const apiBlocks = funnelData?.blocks ?? []; // fallback to empty array
      sessionBlocks = this.processApiBlocks(apiBlocks, sessionBlocks);
            
      // 5. Create final structure
      const allBlocksData: AllBlockssessionStorage = {
        allBlocks: sessionBlocks
      };
      
      // 6. Save to session storage and update subject
      this.saveToSessionStorage(allBlocksData);
      this.blocksSubject.next(sessionBlocks);
      
      return allBlocksData;
    } catch (error) {
      console.error('Error initializing blocks session:', error);
      throw error;
    }
  }

  // ===== THEME-BASED MOCK DATA LOADING =====

  private async loadMockDataByTheme(themeKey: string): Promise<Block[]> {
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

  // ===== DATA TRANSFORMATION METHODS =====

  private transformMockToSessionStorage(
    mockBlocks: any[], 
    funnelData: FunnelRes
  ): BlockSessionStorage[] {
    return mockBlocks.map((mockBlock) => ({
      store_id: funnelData.store_id,
      funnel_id: funnelData.id,
      key: mockBlock.key,
      data: mockBlock.data,
      show: 0 // Mock data starts as hidden
    }));
  }

  private processApiBlocks(
    apiBlocks: Block[], 
    sessionBlocks: BlockSessionStorage[]
  ): BlockSessionStorage[] {
    
    apiBlocks.forEach((apiBlock) => {
      // Check if block already exists in session storage
      const existingBlockIndex = sessionBlocks.findIndex(
        sessionBlock => sessionBlock.key === apiBlock.key
      );
      
      // Create new session block from API data
      const newSessionBlock: BlockSessionStorage = {
        store_id: apiBlock.store_id,
        funnel_id: apiBlock.funnel_id,
        key: apiBlock.key,
        data: apiBlock.data,
        show: 1 // API blocks are visible
      };
      
      if (existingBlockIndex !== -1) {
        // Remove existing block
        sessionBlocks.splice(existingBlockIndex, 1);
      }
      
      // Add new block at the top (beginning of array)
      sessionBlocks.push(newSessionBlock);
    });
    
    return sessionBlocks;
  }

  // ===== SESSION STORAGE OPERATIONS =====

  private saveToSessionStorage(data: AllBlockssessionStorage): void {
    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }

   getFromSessionStorage(): AllBlockssessionStorage | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return null;
    }
  }

  // ===== REACTIVE BLOCK OPERATIONS (Your existing patterns) =====

  getBlocks(): Observable<BlockSessionStorage[]> {
    return this.blocks$.pipe(delay(200));
  }

  getBlockByKey(key: string): Observable<BlockSessionStorage | undefined> {
    return this.blocks$.pipe(
      map(blocks => blocks.find(block => block.key === key)),
      delay(200)
    );
  }

  getVisibleBlocks(): Observable<BlockSessionStorage[]> {
    return this.blocks$.pipe(
      map(blocks => blocks.filter(block => block.show === 1)),
      delay(200)
    );
  }

  getHiddenBlocks(): Observable<BlockSessionStorage[]> {
    return this.blocks$.pipe(
      map(blocks => blocks.filter(block => block.show === 0)),
      delay(200)
    );
  }

  // ===== CRUD OPERATIONS =====

  updateBlock(key: string, updatedData: Partial<BlockData>): Observable<{ success: boolean; message: string; data?: BlockSessionStorage }> {
    return this.blocks$.pipe(
      take(1),
      map(blocks => {
        const index = blocks.findIndex(block => block.key === key);
        
        if (index === -1) {
          throw new Error('Block not found');
        }

        const updatedBlock: BlockSessionStorage = {
          ...blocks[index],
          data: { ...blocks[index].data, ...updatedData }
        };

        blocks[index] = updatedBlock;
        
        // Update session storage
        const allBlocksData: AllBlockssessionStorage = { allBlocks: blocks };
        this.saveToSessionStorage(allBlocksData);
        
        // Update subject
        this.blocksSubject.next([...blocks]);

        return {
          success: true,
          message: 'Block updated successfully',
          data: updatedBlock
        };
      }),
      delay(300)
    );
  }

  toggleBlockVisibility(key: string): Observable<{ success: boolean; message: string; data?: BlockSessionStorage }> {
    return this.blocks$.pipe(
      take(1),
      map(blocks => {
        const index = blocks.findIndex(block => block.key === key);
        
        if (index === -1) {
          throw new Error('Block not found');
        }

        blocks[index].show = blocks[index].show === 1 ? 0 : 1;
        
        // Update session storage
        const allBlocksData: AllBlockssessionStorage = { allBlocks: blocks };
        this.saveToSessionStorage(allBlocksData);
        
        // Update subject
        this.blocksSubject.next([...blocks]);

        return {
          success: true,
          message: 'Block visibility updated successfully',
          data: blocks[index]
        };
      }),
      delay(200)
    );
  }

  // ===== REORDERING OPERATIONS (Adapted from your existing methods) =====

  updateBlockOrder(orderedBlockKeys: string[]): Observable<{ success: boolean; message: string; data?: BlockSessionStorage[] }> {
    return this.blocks$.pipe(
      take(1),
      map(currentBlocks => {
        // Create a new array with updated order
        const reorderedBlocks: BlockSessionStorage[] = [];
        
        // Add blocks in the new order
        orderedBlockKeys.forEach((key) => {
          const block = currentBlocks.find(b => b.key === key);
          if (block) {
            reorderedBlocks.push(block);
          }
        });
        
        // Add any blocks that weren't in the ordered list (safety check)
        currentBlocks.forEach(block => {
          if (!orderedBlockKeys.includes(block.key)) {
            reorderedBlocks.push(block);
          }
        });
        
        // Update session storage
        const allBlocksData: AllBlockssessionStorage = { allBlocks: reorderedBlocks };
        this.saveToSessionStorage(allBlocksData);
        
        // Update the subject with new order
        this.blocksSubject.next(reorderedBlocks);
        
        return {
          success: true,
          message: 'Block order updated successfully',
          data: reorderedBlocks
        };
      }),
      delay(200)
    );
  }

  moveBlockUp(key: string): Observable<{ success: boolean; message: string }> {
    return this.blocks$.pipe(
      take(1),
      map(blocks => {
        const currentIndex = blocks.findIndex(block => block.key === key);
        
        if (currentIndex <= 0) {
          throw new Error('Block is already at the top or not found');
        }
        
        // Swap with previous block
        [blocks[currentIndex - 1], blocks[currentIndex]] = [blocks[currentIndex], blocks[currentIndex - 1]];
        
        // Update session storage
        const allBlocksData: AllBlockssessionStorage = { allBlocks: blocks };
        this.saveToSessionStorage(allBlocksData);
        
        // Update subject
        this.blocksSubject.next([...blocks]);
        
        return {
          success: true,
          message: 'Block moved up successfully'
        };
      }),
      delay(200)
    );
  }

  moveBlockDown(key: string): Observable<{ success: boolean; message: string }> {
    return this.blocks$.pipe(
      take(1),
      map(blocks => {
        const currentIndex = blocks.findIndex(block => block.key === key);
        
        if (currentIndex === -1 || currentIndex >= blocks.length - 1) {
          throw new Error('Block is already at the bottom or not found');
        }
        
        // Swap with next block
        [blocks[currentIndex], blocks[currentIndex + 1]] = [blocks[currentIndex + 1], blocks[currentIndex]];
        
        // Update session storage
        const allBlocksData: AllBlockssessionStorage = { allBlocks: blocks };
        this.saveToSessionStorage(allBlocksData);
        
        // Update subject
        this.blocksSubject.next([...blocks]);
        
        return {
          success: true,
          message: 'Block moved down successfully'
        };
      }),
      delay(200)
    );
  }

  // ===== UTILITY METHODS =====

  searchBlocks(query: string): Observable<BlockSessionStorage[]> {
    return this.blocks$.pipe(
      map(blocks => blocks.filter(block => 
        block.key.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_ar?.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_en?.toLowerCase().includes(query.toLowerCase())
      )),
      delay(200)
    );
  }

  clearSessionStorage(): Observable<{ success: boolean; message: string }> {
    return of(null).pipe(
      map(() => {
        try {
          sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
          this.blocksSubject.next([]);
          return {
            success: true,
            message: 'Session storage cleared successfully'
          };
        } catch (error) {
          throw new Error('Failed to clear session storage');
        }
      }),
      delay(200)
    );
  }

  getTotalBlocksCount(): Observable<number> {
    return this.blocks$.pipe(
      map(blocks => blocks.length)
    );
  }

  getVisibleBlocksCount(): Observable<number> {
    return this.blocks$.pipe(
      map(blocks => blocks.filter(block => block.show === 1).length)
    );
  }

  // ===== ERROR SIMULATION (For testing) =====

  updateBlockOrderWithError(orderedBlockKeys: string[]): Observable<any> {
    return of(null).pipe(
      delay(200),
      switchMap(() => {
        // Simulate random errors for testing
        if (Math.random() < 0.2) { // 20% chance of error
          return throwError(() => new Error('Failed to update block order'));
        }
        return this.updateBlockOrder(orderedBlockKeys);
      })
    );
  }
}