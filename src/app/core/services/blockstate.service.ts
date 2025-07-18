import { Injectable, signal, computed } from '@angular/core';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

@Injectable({
  providedIn: 'root'
})
export class BlockStateService {
  // Private signals for internal state management
  private readonly _selectedBlockKey = signal<string | null>(null);
  private readonly _selectedBlock = signal<BlockSessionStorage | null>(null);
  
  // Public readonly signals for components to consume
  readonly selectedBlockKey = this._selectedBlockKey.asReadonly();
  readonly selectedBlock = this._selectedBlock.asReadonly();
  
  // Computed signal to check if a block is selected
  readonly hasSelectedBlock = computed(() => this._selectedBlock() !== null);
  
  constructor() {
    // Load persisted state on service initialization
    this.loadPersistedState();
  }

  /**
   * Set the selected block and persist the state
   */
  setSelectedBlock(block: BlockSessionStorage | null): void {
    this._selectedBlock.set(block);
    this._selectedBlockKey.set(block?.key || null);
    
    // Persist to localStorage
    this.persistState();
  }

  /**
   * Set selected block by key only (useful when you only have the key)
   */
  setSelectedBlockKey(key: string | null): void {
    this._selectedBlockKey.set(key);
    
    // If we're clearing the selection, also clear the block
    if (!key) {
      this._selectedBlock.set(null);
    }
    
    // Persist to localStorage
    this.persistState();
  }

  /**
   * Update the selected block data (useful when block data changes)
   */
  updateSelectedBlock(block: BlockSessionStorage): void {
    const currentKey = this._selectedBlockKey();
    if (currentKey && currentKey === block.key) {
      this._selectedBlock.set(block);
      this.persistState();
    }
  }

  /**
   * Clear the selected block
   */
  clearSelection(): void {
    this._selectedBlock.set(null);
    this._selectedBlockKey.set(null);
    this.persistState();
  }

  /**
   * Check if a specific block key is currently selected
   */
  isBlockSelected(key: string): boolean {
    return this._selectedBlockKey() === key;
  }

  /**
   * Persist current state to localStorage
   */
  private persistState(): void {
    try {
      const stateToSave = {
        selectedBlockKey: this._selectedBlockKey(),
        selectedBlock: this._selectedBlock(),
        timestamp: Date.now()
      };
      
      localStorage.setItem('blockState', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to persist block state:', error);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const savedState = localStorage.getItem('blockState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Optional: Check if state is not too old (e.g., 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (parsedState.timestamp && (Date.now() - parsedState.timestamp) > maxAge) {
          // State is too old, clear it
          this.clearPersistedState();
          return;
        }
        
        // Restore state
        if (parsedState.selectedBlockKey) {
          this._selectedBlockKey.set(parsedState.selectedBlockKey);
        }
        
        if (parsedState.selectedBlock) {
          this._selectedBlock.set(parsedState.selectedBlock);
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted block state:', error);
      // Clear corrupted state
      this.clearPersistedState();
    }
  }

  /**
   * Clear persisted state from localStorage
   */
  private clearPersistedState(): void {
    try {
      localStorage.removeItem('blockState');
    } catch (error) {
      console.warn('Failed to clear persisted block state:', error);
    }
  }

  /**
   * Reset all state (useful for logout or session reset)
   */
  resetState(): void {
    this.clearSelection();
    this.clearPersistedState();
  }
}