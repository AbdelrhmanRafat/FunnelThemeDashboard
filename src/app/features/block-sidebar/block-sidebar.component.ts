import { Component, inject, OnInit, Output, EventEmitter, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

@Component({
  selector: 'app-block-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-sidebar.component.html',
  styleUrl: './block-sidebar.component.scss'
})
export class BlockSidebarComponent implements OnInit {
  private blocksService = inject(BlocksService);

  // Input/Output
  @Input() selectedBlockKey: string | null = null;
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

  // Computed property to always show all blocks (for selection)
  readonly blocks = computed(() => {
    // Always show all blocks in sidebar for selection
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

  // Computed properties for current view (always shows "All Blocks" since we show all)
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
      },
      error: (error) => {
        this.showMessage('Failed to load blocks', 'error');
        this._isLoading.set(false);
      }
    });
  }

  // Initialize blocks session (call this when component first loads)
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
    // Extract a readable name from the key
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
      this.loadBlocks(); // Reset to all blocks
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this._message.set(message);
    this._messageType.set(type);
    
    setTimeout(() => {
      this._message.set('');
    }, 3000);
  }

  selectBlock(block: BlockSessionStorage) {
    this.blockSelected.emit(block);
    this.closeMobileSidebar.emit();
  }

  onCloseMobileSidebar() {
    this.closeMobileSidebar.emit();
  }

  // Show all blocks (clear selection)
  showAllBlocks(): void {
    this.blockSelected.emit(null as any); // This will clear the selection in parent
  }

  // Clear session storage (for testing/reset)
  clearSession(): void {
    this.blocksService.clearSessionStorage().subscribe({
      next: (response) => {
        this.showMessage('Session cleared', 'success');
        this._allBlocks.set([]);
      },
      error: (error) => {
        this.showMessage('Failed to clear session', 'error');
      }
    });
  }
}