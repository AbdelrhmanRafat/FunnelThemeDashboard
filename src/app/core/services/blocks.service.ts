// services/blocks.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { AllBlocksSessionStorage, Block, BlockData, BlockSessionStorage, FunnelRes } from '../../models/theme.classic.blocks';
import { getFunnelPage } from './api.service';
import { StorageService } from './storage.service';
import { ThemeSelectService } from './theme-select.service';

@Injectable({
  providedIn: 'root'
})
export class BlocksService {
  // Signals instead of BehaviorSubject
  private readonly _blocks = signal<BlockSessionStorage[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly blocks = this._blocks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed properties
  readonly visibleBlocks = computed(() => 
    this._blocks().filter(block => block.show === 1)
  );
  readonly hiddenBlocks = computed(() => 
    this._blocks().filter(block => block.show === 0)
  );
  readonly totalCount = computed(() => this._blocks().length);
  readonly visibleCount = computed(() => this.visibleBlocks().length);

  constructor(
    private storageService: StorageService,
    private themeSelectService: ThemeSelectService
  ) {
    this.initializeFromSessionStorage();
  }

  // ===== INITIALIZATION METHODS =====

  private initializeFromSessionStorage(): void {
    try {
      const sessionData = this.storageService.getFromSessionStorage();
      if (sessionData) {
        this._blocks.set(sessionData.allBlocks);
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
      this._error.set('Failed to load saved data');
    }
  }

  async initializeBlocksSession(funnelId: number): Promise<AllBlocksSessionStorage> {
    try {
      this._loading.set(true);
      this._error.set(null);

      // 1. Fetch API data
      const response = await getFunnelPage(funnelId);
      const funnelData: FunnelRes = response.data;

      // 2. Load mock data based on theme key
      const themeKey = funnelData.funnel_theme.key ?? 'classic';
      const mockBlocks = await this.themeSelectService.loadMockDataByTheme(themeKey);

      // 3. Initialize session storage with mock data
      let sessionBlocks = this.transformMockToSessionStorage(mockBlocks, funnelData);

      // 4. Process API blocks and override/add to session storage
      const apiBlocks = funnelData?.blocks ?? [];
      sessionBlocks = this.processApiBlocks(apiBlocks, sessionBlocks);

      // 5. Create final structure
      const allBlocksData: AllBlocksSessionStorage = {
        allBlocks: sessionBlocks
      };

      // 6. Save to session storage and update signal
      this.storageService.saveToSessionStorage(allBlocksData);
      this._blocks.set(sessionBlocks);

      return allBlocksData;
    } catch (error) {
      console.error('Error initializing blocks session:', error);
      this._error.set('Failed to initialize blocks session');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ===== DATA TRANSFORMATION METHODS =====

  private transformMockToSessionStorage(
    mockBlocks: any[],
    funnelData: FunnelRes
  ): BlockSessionStorage[] {
    return mockBlocks.map((mockBlock, index) => ({
      store_id: funnelData.store_id,
      funnel_id: funnelData.id,
      key: mockBlock.key,
      data: mockBlock.data,
      show: 0, // Mock data starts as hidden
      order: index // Add order starting from 0
    }));
  }

  private processApiBlocks(
    apiBlocks: Block[],
    sessionBlocks: BlockSessionStorage[]
  ): BlockSessionStorage[] {
    let maxOrder = Math.max(...sessionBlocks.map(b => b.order), -1);

    apiBlocks.forEach((apiBlock) => {
      // Check if block already exists in session storage
      const existingBlockIndex = sessionBlocks.findIndex(
        sessionBlock => sessionBlock.key === apiBlock.key
      );

      if (existingBlockIndex !== -1) {
        // Update existing block but preserve order
        sessionBlocks[existingBlockIndex] = {
          ...sessionBlocks[existingBlockIndex],
          store_id: apiBlock.store_id,
          funnel_id: apiBlock.funnel_id,
          data: apiBlock.data,
          show: 1 // API blocks are visible
        };
      } else {
        // Add new block with next order
        maxOrder++;
        sessionBlocks.push({
          store_id: apiBlock.store_id,
          funnel_id: apiBlock.funnel_id,
          key: apiBlock.key,
          data: apiBlock.data,
          show: 1,
          order: maxOrder
        });
      }
    });

    return sessionBlocks;
  }

  // ===== REACTIVE BLOCK OPERATIONS =====

  getBlocks(): Observable<BlockSessionStorage[]> {
    return of(this._blocks()).pipe(delay(200));
  }

  getBlockByKey(key: string): Observable<BlockSessionStorage | undefined> {
    return of(this._blocks().find(block => block.key === key)).pipe(delay(200));
  }

  getVisibleBlocks(): Observable<BlockSessionStorage[]> {
    return of(this.visibleBlocks()).pipe(delay(200));
  }

  getHiddenBlocks(): Observable<BlockSessionStorage[]> {
    return of(this.hiddenBlocks()).pipe(delay(200));
  }

  // ===== CRUD OPERATIONS =====

  updateBlock(key: string, updatedData: Partial<BlockData>): Observable<{ success: boolean; message: string; data?: BlockSessionStorage }> {
    return of(null).pipe(
      map(() => {
        const blocks = [...this._blocks()];
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
        const allBlocksData: AllBlocksSessionStorage = { allBlocks: blocks };
        this.storageService.saveToSessionStorage(allBlocksData);

        // Update signal
        this._blocks.set(blocks);

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
    return of(null).pipe(
      map(() => {
        const blocks = [...this._blocks()];
        const index = blocks.findIndex(block => block.key === key);

        if (index === -1) {
          throw new Error('Block not found');
        }

        blocks[index].show = blocks[index].show === 1 ? 0 : 1;

        // Update session storage
        const allBlocksData: AllBlocksSessionStorage = { allBlocks: blocks };
        this.storageService.saveToSessionStorage(allBlocksData);

        // Update signal
        this._blocks.set(blocks);

        return {
          success: true,
          message: 'Block visibility updated successfully',
          data: blocks[index]
        };
      }),
      delay(200)
    );
  }

  // ===== REORDERING OPERATIONS =====

  updateBlockOrder(orderedBlockKeys: string[]): Observable<{ success: boolean; message: string; data?: BlockSessionStorage[] }> {
    return of(null).pipe(
      map(() => {
        const currentBlocks = [...this._blocks()];
        const reorderedBlocks: BlockSessionStorage[] = [];

        // Add blocks in the new order with updated order values
        orderedBlockKeys.forEach((key, index) => {
          const block = currentBlocks.find(b => b.key === key);
          if (block) {
            reorderedBlocks.push({
              ...block,
              order: index
            });
          }
        });

        // Add any blocks that weren't in the ordered list
        currentBlocks.forEach(block => {
          if (!orderedBlockKeys.includes(block.key)) {
            reorderedBlocks.push({
              ...block,
              order: reorderedBlocks.length
            });
          }
        });

        // Update session storage
        const allBlocksData: AllBlocksSessionStorage = { allBlocks: reorderedBlocks };
        this.storageService.saveToSessionStorage(allBlocksData);

        // Update signal
        this._blocks.set(reorderedBlocks);

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
    return of(null).pipe(
      map(() => {
        const blocks = [...this._blocks()];
        const currentIndex = blocks.findIndex(block => block.key === key);

        if (currentIndex <= 0) {
          throw new Error('Block is already at the top or not found');
        }

        // Swap order values
        const temp = blocks[currentIndex].order;
        blocks[currentIndex].order = blocks[currentIndex - 1].order;
        blocks[currentIndex - 1].order = temp;

        // Sort by order to reflect the change
        blocks.sort((a, b) => a.order - b.order);

        // Update session storage
        const allBlocksData: AllBlocksSessionStorage = { allBlocks: blocks };
        this.storageService.saveToSessionStorage(allBlocksData);

        // Update signal
        this._blocks.set(blocks);

        return {
          success: true,
          message: 'Block moved up successfully'
        };
      }),
      delay(200)
    );
  }

  moveBlockDown(key: string): Observable<{ success: boolean; message: string }> {
    return of(null).pipe(
      map(() => {
        const blocks = [...this._blocks()];
        const currentIndex = blocks.findIndex(block => block.key === key);

        if (currentIndex === -1 || currentIndex >= blocks.length - 1) {
          throw new Error('Block is already at the bottom or not found');
        }

        // Swap order values
        const temp = blocks[currentIndex].order;
        blocks[currentIndex].order = blocks[currentIndex + 1].order;
        blocks[currentIndex + 1].order = temp;

        // Sort by order to reflect the change
        blocks.sort((a, b) => a.order - b.order);

        // Update session storage
        const allBlocksData: AllBlocksSessionStorage = { allBlocks: blocks };
        this.storageService.saveToSessionStorage(allBlocksData);

        // Update signal
        this._blocks.set(blocks);

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
    return of(
      this._blocks().filter(block =>
        block.key.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_ar?.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_en?.toLowerCase().includes(query.toLowerCase())
      )
    ).pipe(delay(200));
  }

  clearSessionStorage(): Observable<{ success: boolean; message: string }> {
    return of(null).pipe(
      map(() => {
        try {
          this.storageService.clearSessionStorage();
          this._blocks.set([]);
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
    return of(this.totalCount()).pipe(delay(200));
  }

  getVisibleBlocksCount(): Observable<number> {
    return of(this.visibleCount()).pipe(delay(200));
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

  // ===== ERROR HANDLING =====

  clearError(): void {
    this._error.set(null);
  }
}