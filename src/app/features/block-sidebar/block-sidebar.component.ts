import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BlocksService } from '../../core/services/blocks.service';
import { Block, ComponentDefinition } from '../../models/theme.model';

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
  @Input() selectedBlockId: string | null = null;
  @Input() mobileDragDelay: number = 2000; // Set to 2 seconds (2000ms)
  @Output() blockSelected = new EventEmitter<Block>();
  @Output() blockDeleted = new EventEmitter<string>();
  @Output() blockVisibilityToggled = new EventEmitter<Block>();
  @Output() closeMobileSidebar = new EventEmitter<void>();
  @Output() blocksReordered = new EventEmitter<Block[]>(); // New event for reordering
  
  // State
  blocks: Block[] = [];
  availableComponents: ComponentDefinition[] = [];
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

  

  getComponentDisplayName(componentName: string): string {
    const component = this.availableComponents.find(c => c.name === componentName);
    return component ? component.display_name_en : componentName;
  }

  toggleBlockVisibility(block: Block, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.toggleBlockVisibility(block.id!).subscribe({
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

  deleteBlock(block: Block, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${this.getComponentDisplayName(block.name)}"?`)) {
      this.blocksService.deleteBlock(block.id!).subscribe({
        next: (response) => {
          this.showMessage('Block deleted successfully', 'success');
          this.loadBlocks();
          this.blockDeleted.emit(block.id!);
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to delete block', 'error');
        }
      });
    }
  }

  // New method to handle drag and drop
  onDrop(event: CdkDragDrop<Block[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      // Update the local array
      moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
      
      // Update the order property for each block
      this.blocks.forEach((block, index) => {
        block.order = index;
      });

      // Call the service to update the order on the server
      this.updateBlockOrder();
    }
  }

  private updateBlockOrder(): void {
    // Create an array of block IDs in their new order
    const orderedBlockIds = this.blocks.map(block => block.id!);
    
    // Call your service to update the order
    this.blocksService.updateBlockOrder(orderedBlockIds).subscribe({
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

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  selectBlock(block: any) {
    this.blockSelected.emit(block);
    this.closeMobileSidebar.emit();
  }

  onCloseMobileSidebar() {
    this.closeMobileSidebar.emit();
  }
}