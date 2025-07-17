import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockSidebarComponent } from '../../features/block-sidebar/block-sidebar.component';
import { BlockDashboardFormComponent } from '../../features/block-dashboard-form/block-dashboard-form.component';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';
import { BlocksService } from '../../core/services/blocks.service';

@Component({
  selector: 'app-block-dashboard',
  standalone: true,
  imports: [CommonModule, BlockSidebarComponent, BlockDashboardFormComponent],
  templateUrl: './block-dashboard.component.html',
  styleUrl: './block-dashboard.component.scss'
})
export class BlockDashboardComponent implements OnInit {
  private blocksService = inject(BlocksService);
  
  @ViewChild('blockSidebar') blockSidebar!: BlockSidebarComponent;

  // State - Updated types
  selectedBlock: BlockSessionStorage | null = null;
  isInitialized = false;
  isInitializing = false;
  initializationError: string | null = null;

  // Mobile sidebar state
  isMobileSidebarOpen = false;

  // Configuration
  funnelId = 2; // You can make this dynamic or get from route params
  
  async ngOnInit() {
    await this.initializeBlocksSession();
  }

  // ===== INITIALIZATION =====

  async initializeBlocksSession(): Promise<void> {
    this.isInitializing = true;
    this.initializationError = null;

    try {
      // Initialize blocks session with theme-based data + API override
      await this.blocksService.initializeBlocksSession(this.funnelId);
      this.isInitialized = true;
      console.log('Blocks session initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blocks session:', error);
      this.initializationError = 'Failed to initialize blocks session. Please try again.';
    } finally {
      this.isInitializing = false;
    }
  }

  // Retry initialization
  async retryInitialization(): Promise<void> {
    await this.initializeBlocksSession();
  }

  // ===== EVENT HANDLERS =====

  onBlockDeleted(blockKey: string): void {
    // Clear selection if deleted block was selected
    if (this.selectedBlock && this.selectedBlock.key === blockKey) {
      this.selectedBlock = null;
    }
  }

  onBlockUpdated(updatedBlock: BlockSessionStorage): void {
    // Update the selected block with the new data
    this.selectedBlock = updatedBlock;
  }

  onBlockVisibilityToggled(updatedBlock: BlockSessionStorage): void {
    // Update the selected block if it was the one toggled
    if (this.selectedBlock && this.selectedBlock.key === updatedBlock.key) {
      this.selectedBlock = updatedBlock;
    }
  }

  onBlocksReordered(reorderedBlocks: BlockSessionStorage[]): void {
    // Handle blocks reordering
    console.log('Blocks reordered:', reorderedBlocks.map(b => b.key));
    
    // Update selected block if it exists in reordered list
    if (this.selectedBlock) {
      const updatedSelectedBlock = reorderedBlocks.find(b => b.key === this.selectedBlock!.key);
      if (updatedSelectedBlock) {
        this.selectedBlock = updatedSelectedBlock;
      }
    }
  }

  // ===== MOBILE SIDEBAR =====

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  // Handle block selection and close mobile sidebar
  onBlockSelected(block: BlockSessionStorage) {
    this.selectedBlock = block;
    this.closeMobileSidebar(); // Close sidebar when block is selected on mobile
  }

  // ===== SAVE FUNCTIONALITY =====

  async saveBlocks(): Promise<void> {
    try {
      // Get current blocks from session storage
      const allBlocks = this.blocksService.getFromSessionStorage();
      
      if (!allBlocks) {
        console.error('No blocks found in session storage');
        return;
      }

      // Here you would typically send the blocks to your API
      // For now, we'll just log them
      console.log('Saving blocks:', allBlocks);
      
      // You could implement an API call here:
      // await this.blocksService.saveBlocksToAPI(allBlocks);
      
      // Show success message
      alert('Blocks saved successfully!');
      
    } catch (error) {
      console.error('Error saving blocks:', error);
      alert('Failed to save blocks. Please try again.');
    }
  }

  // ===== UTILITY METHODS =====

  // Get blocks count for display
  get totalBlocksCount(): number {
    const allBlocks = this.blocksService.getFromSessionStorage();
    return allBlocks?.allBlocks.length || 0;
  }

  get visibleBlocksCount(): number {
    const allBlocks = this.blocksService.getFromSessionStorage();
    return allBlocks?.allBlocks.filter(b => b.show === 1).length || 0;
  }

  get hiddenBlocksCount(): number {
    const allBlocks = this.blocksService.getFromSessionStorage();
    return allBlocks?.allBlocks.filter(b => b.show === 0).length || 0;
  }

  // Clear session and reinitialize
  async resetSession(): Promise<void> {
    if (confirm('Are you sure you want to reset all blocks? This will reload data from the server.')) {
      this.blocksService.clearSessionStorage().subscribe({
        next: () => {
          this.selectedBlock = null;
          this.initializeBlocksSession();
        },
        error: (error) => {
          console.error('Error clearing session:', error);
        }
      });
    }
  }

  // Export session data (for debugging)
  exportSessionData(): void {
    const allBlocks = this.blocksService.getFromSessionStorage();
    if (allBlocks) {
      const dataStr = JSON.stringify(allBlocks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `blocks_session_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }
}