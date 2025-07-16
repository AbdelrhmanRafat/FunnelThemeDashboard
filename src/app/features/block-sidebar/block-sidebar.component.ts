import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { Block, ComponentDefinition } from '../../models/theme.model';

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
  @Input() selectedBlockId: string | null = null;
  @Output() blockSelected = new EventEmitter<Block>();
  @Output() blockDeleted = new EventEmitter<string>();
  @Output() blockVisibilityToggled = new EventEmitter<Block>();
  @Output() closeMobileSidebar = new EventEmitter<void>(); // Fixed: Added 'new'
  // State
  blocks: Block[] = [];
  availableComponents: ComponentDefinition[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadBlocks();
    this.loadAvailableComponents();
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


  loadAvailableComponents(): void {
    this.blocksService.getAvailableComponents().subscribe({
      next: (components) => {
        this.availableComponents = components;
      },
      error: (error) => {
        console.error('Failed to load components:', error);
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

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

    selectBlock(block: any) {
    this.blockSelected.emit(block);
    this.closeMobileSidebar.emit(); // Emit close event when block is selected
  }

  // Add this method to handle the close button click
  onCloseMobileSidebar() {
    this.closeMobileSidebar.emit();
  }
}