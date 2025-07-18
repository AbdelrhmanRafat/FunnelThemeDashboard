import { Component, inject, OnInit, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';
import { BlockStateService } from '../../core/services/blockstate.service';

@Component({
  selector: 'app-block-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-sidebar.component.html',
  styleUrl: './block-sidebar.component.scss'
})
export class BlockSidebarComponent implements OnInit {
  private blocksService = inject(BlocksService);
  private blockStateService = inject(BlockStateService);

  // Output events
  @Output() blockSelected = new EventEmitter<BlockSessionStorage>();
  @Output() closeMobileSidebar = new EventEmitter<void>();

  // Signals for state management
  private readonly _allBlocks = signal<BlockSessionStorage[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _message = signal<string>('');
  private readonly _messageType = signal<'success' | 'error'>('success');

  // Public readonly signals
  readonly allBlocks = this._allBlocks.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();
  readonly messageType = this._messageType.asReadonly();

  // Get selected block key from shared state service
  readonly selectedBlockKey = this.blockStateService.selectedBlockKey;

  // Computed property to always show all blocks (for selection)
  readonly blocks = computed(() => {
    return this._allBlocks();
  });

  // Computed properties using signals
  readonly visibleBlocks = computed(() => 
    this._allBlocks().filter(block => block.show === 1)
  );

  readonly hiddenBlocks = computed(() => 
    this._allBlocks().filter(block => block.show === 0)
  );

  readonly totalBlocksCount = computed(() => this._allBlocks().length);
  readonly visibleBlocksCount = computed(() => this.visibleBlocks().length);
  readonly hiddenBlocksCount = computed(() => this.hiddenBlocks().length);

  // Computed properties for current view
  readonly currentViewTitle = computed(() => {
    return 'All Blocks';
  });

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    this._isLoading.set(true);
    this.blocksService.getBlocks().subscribe({
      next: (blocks) => {
        this._allBlocks.set(blocks);
        this._isLoading.set(false);
        
        // Check if we have a persisted selected block and update it with fresh data
        const selectedKey = this.blockStateService.selectedBlockKey();
        if (selectedKey) {
          const selectedBlock = blocks.find(block => block.key === selectedKey);
          if (selectedBlock) {
            // Update the selected block with fresh data
            this.blockStateService.updateSelectedBlock(selectedBlock);
          } else {
            // Selected block no longer exists, clear selection
            this.blockStateService.clearSelection();
          }
        }
      },
      error: (error) => {
        this.showMessage('Failed to load blocks', 'error');
        this._isLoading.set(false);
      }
    });
  }

  // Initialize blocks session
  async initializeSession(funnelId: number): Promise<void> {
    this._isLoading.set(true);
    try {
      await this.blocksService.initializeBlocksSession(funnelId);
      this.loadBlocks(); // Reload blocks after initialization
    } catch (error) {
      this.showMessage('Failed to initialize blocks session', 'error');
      this._isLoading.set(false);
    }
  }

  getComponentDisplayName(componentKey: string): string {
    return componentKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Search blocks
  searchBlocks(query: string): void {
    if (query.trim()) {
      this.blocksService.searchBlocks(query).subscribe({
        next: (blocks) => {
          this._allBlocks.set(blocks);
        },
        error: (error) => {
          this.showMessage('Search failed', 'error');
        }
      });
    } else {
      this.loadBlocks();
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this._message.set(message);
    this._messageType.set(type);
    
    setTimeout(() => {
      this._message.set('');
    }, 3000);
  }

  selectBlock(block: BlockSessionStorage): void {
    // Update the shared state service
    this.blockStateService.setSelectedBlock(block);
    
    // Emit the event for parent component
    this.blockSelected.emit(block);
    
    // Close mobile sidebar
    this.closeMobileSidebar.emit();
  }

  onCloseMobileSidebar(): void {
    this.closeMobileSidebar.emit();
  }

  // Show all blocks (clear selection)
  showAllBlocks(): void {
    this.blockStateService.clearSelection();
    this.blockSelected.emit(null as any);
  }

  // Clear session storage
  clearSession(): void {
    this.blocksService.clearSessionStorage().subscribe({
      next: (response) => {
        this.showMessage('Session cleared', 'success');
        this._allBlocks.set([]);
        // Clear the selected block state as well
        this.blockStateService.clearSelection();
      },
      error: (error) => {
        this.showMessage('Failed to clear session', 'error');
      }
    });
  }

  // Helper method to check if a block is selected
  isBlockSelected(blockKey: string): boolean {
    return this.blockStateService.isBlockSelected(blockKey);
  }
}