import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSidebarComponent } from '../../features/block-sidebar/block-sidebar.component';
import { BlockDashboardFormComponent } from '../../features/block-dashboard-form/block-dashboard-form.component';
import { Block, ComponentDefinition } from '../../models/theme.model';

@Component({
  selector: 'app-block-dashboard',
  standalone: true,
  imports: [CommonModule, BlockSidebarComponent, BlockDashboardFormComponent],
  templateUrl: './block-dashboard.component.html',
  styleUrl: './block-dashboard.component.scss'
})
export class BlockDashboardComponent implements OnInit {
  private blocksService = inject(BlocksService);

  // State
  selectedBlock: Block | null = null;
  availableComponents: ComponentDefinition[] = [];

  ngOnInit(): void {
    this.loadAvailableComponents();
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

  // ===== EVENT HANDLERS =====

  onBlockDeleted(blockId: string): void {
    // Clear selection if deleted block was selected
    if (this.selectedBlock && this.selectedBlock.id === blockId) {
      this.selectedBlock = null;
    }
  }

  onBlockUpdated(updatedBlock: Block): void {
    // Update the selected block with the new data
    this.selectedBlock = updatedBlock;
  }

  onBlockVisibilityToggled(updatedBlock: Block): void {
    // Update the selected block if it was the one toggled
    if (this.selectedBlock && this.selectedBlock.id === updatedBlock.id) {
      this.selectedBlock = updatedBlock;
    }
  }
// In your main component
isMobileSidebarOpen = false;

toggleMobileSidebar() {
  this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
}

closeMobileSidebar() {
  this.isMobileSidebarOpen = false;
}

// Handle block selection and close mobile sidebar
onBlockSelected(block: any) {
  this.selectedBlock = block;
  this.closeMobileSidebar(); // Close sidebar when block is selected on mobile
}
}