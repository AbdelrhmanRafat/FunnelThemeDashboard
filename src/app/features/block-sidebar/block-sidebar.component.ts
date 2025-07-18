import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
  
  // State
  blocks: BlockSessionStorage[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    this.isLoading = true;
    this.blocksService.getBlocks().subscribe({
      next: (blocks) => {
        this.blocks = blocks;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Failed to load blocks', 'error');
        this.isLoading = false;
      }
    });
  }

  // Initialize blocks session (call this when component first loads)
  async initializeSession(funnelId: number): Promise<void> {
    this.isLoading = true;
    try {
      await this.blocksService.initializeBlocksSession(funnelId);
      this.loadBlocks(); // Reload blocks after initialization
    } catch (error) {
      this.showMessage('Failed to initialize blocks session', 'error');
      this.isLoading = false;
    }
  }

  getComponentDisplayName(componentKey: string): string {
    // Extract a readable name from the key
    return componentKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get visible blocks for display
  get visibleBlocks(): BlockSessionStorage[] {
    return this.blocks.filter(block => block.show === 1);
  }

  // Get hidden blocks for display
  get hiddenBlocks(): BlockSessionStorage[] {
    return this.blocks.filter(block => block.show === 0);
  }

  // Search blocks
  searchBlocks(query: string): void {
    if (query.trim()) {
      this.blocksService.searchBlocks(query).subscribe({
        next: (blocks) => {
          this.blocks = blocks;
        },
        error: (error) => {
          this.showMessage('Search failed', 'error');
        }
      });
    } else {
      this.loadBlocks(); // Reset to all blocks
    }
  }

  // Get blocks count
  get totalBlocksCount(): number {
    return this.blocks.length;
  }

  get visibleBlocksCount(): number {
    return this.visibleBlocks.length;
  }

  get hiddenBlocksCount(): number {
    return this.hiddenBlocks.length;
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  selectBlock(block: BlockSessionStorage) {
    this.blockSelected.emit(block);
    this.closeMobileSidebar.emit();
  }

  onCloseMobileSidebar() {
    this.closeMobileSidebar.emit();
  }

  // Clear session storage (for testing/reset)
  clearSession(): void {
    this.blocksService.clearSessionStorage().subscribe({
      next: (response) => {
        this.showMessage('Session cleared', 'success');
        this.blocks = [];
      },
      error: (error) => {
        this.showMessage('Failed to clear session', 'error');
      }
    });
  }
}