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

  // State
  selectedBlock: BlockSessionStorage | null = null;
  isInitialized = false;
  isInitializing = false;
  initializationError: string | null = null;

  // Mobile sidebar state
  isMobileSidebarOpen = false;

  // Configuration
  funnelId = 2; // You can make this dynamic or get from route params
  
  // Reactive properties for template
  get totalBlocksCount(): number {
    return this.blocksService.totalCount();
  }
  
  get visibleBlocksCount(): number {
    return this.blocksService.visibleCount();
  }
  
  get loading(): boolean {
    return this.blocksService.loading();
  }
  
  get error(): string | null {
    return this.blocksService.error();
  }
  
  async ngOnInit() {
    await this.initializeBlocksAndLoadData();
  }

  private async initializeBlocksAndLoadData(): Promise<void> {
    try {
      this.isInitializing = true;
      this.initializationError = null;
      
      // Initialize blocks session with the funnel ID
      await this.blocksService.initializeBlocksSession(this.funnelId);
      
      // Load all blocks using the service method
      this.blocksService.getBlocks().subscribe({
        next: (blocks) => {
          this.isInitialized = true;
        },
        error: (error) => {
          this.initializationError = 'Failed to load blocks data';
        }
      });
      
    } catch (error) {
      this.initializationError = 'Failed to initialize blocks session';
    } finally {
      this.isInitializing = false;
    }
  }

  // Mobile sidebar methods
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // Block selection handler
  onBlockSelected(block: BlockSessionStorage): void {
    this.selectedBlock = block;
    this.closeMobileSidebar(); // Close mobile sidebar when a block is selected
  }

  // Retry initialization method
  async retryInitialization(): Promise<void> {
    this.blocksService.clearError();
    await this.initializeBlocksAndLoadData();
  }

  // Method to clear selection and show all blocks
  clearSelection(): void {
    this.selectedBlock = null;
  }
}