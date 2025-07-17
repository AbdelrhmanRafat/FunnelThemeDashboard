import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

@Component({
  selector: 'app-block-sidebar',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './block-sidebar.component.html',
  styleUrl: './block-sidebar.component.scss'
})
export class BlockSidebarComponent implements OnInit {
  private blocksService = inject(BlocksService);

  // Input/Output
  @Input() selectedBlockKey: string | null = null; // Changed from selectedBlockId to selectedBlockKey
  @Input() mobileDragDelay: number = 2000; // Set to 2 seconds (2000ms)
  @Output() blockSelected = new EventEmitter<BlockSessionStorage>();
  @Output() blockDeleted = new EventEmitter<string>();
  @Output() blockVisibilityToggled = new EventEmitter<BlockSessionStorage>();
  @Output() closeMobileSidebar = new EventEmitter<void>();
  @Output() blocksReordered = new EventEmitter<BlockSessionStorage[]>(); // Updated type
  
  // State
  blocks: BlockSessionStorage[] = []; // Updated type
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Drag configuration for mobile
  dragConfig = {
    dragStartDelay: 0
  };

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

  toggleBlockVisibility(block: BlockSessionStorage, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.toggleBlockVisibility(block.key).subscribe({
      next: (response) => {
        this.showMessage('Block visibility updated', 'success');
        this.loadBlocks();
        this.blockVisibilityToggled.emit(response.data!);
      },
      error: (error) => {
        this.showMessage(error.message || 'Failed to update visibility', 'error');
      }
    });
  }

  // Note: No delete functionality as per requirements (only editing)
  // deleteBlock method removed since there are no "create" operations

  // Updated method to handle drag and drop with keys
  onDrop(event: CdkDragDrop<BlockSessionStorage[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      // Update the local array
      moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
      
      // Call the service to update the order
      this.updateBlockOrder();
    }
  }

  private updateBlockOrder(): void {
    // Create an array of block keys in their new order
    const orderedBlockKeys = this.blocks.map(block => block.key);
    
    // Call your service to update the order
    this.blocksService.updateBlockOrder(orderedBlockKeys).subscribe({
      next: (response) => {
        this.showMessage('Block order updated', 'success');
        // Update local blocks with the response data if available
        if (response.data) {
          this.blocks = response.data;
        }
        this.blocksReordered.emit(this.blocks);
      },
      error: (error) => {
        this.showMessage(error.message || 'Failed to update block order', 'error');
        // Reload blocks to restore the original order
        this.loadBlocks();
      }
    });
  }

  // Move block up in order
  moveBlockUp(blockKey: string, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.moveBlockUp(blockKey).subscribe({
      next: (response) => {
        this.showMessage('Block moved up', 'success');
        this.loadBlocks();
      },
      error: (error) => {
        this.showMessage(error.message || 'Cannot move block up', 'error');
      }
    });
  }

  // Move block down in order
  moveBlockDown(blockKey: string, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.moveBlockDown(blockKey).subscribe({
      next: (response) => {
        this.showMessage('Block moved down', 'success');
        this.loadBlocks();
      },
      error: (error) => {
        this.showMessage(error.message || 'Cannot move block down', 'error');
      }
    });
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