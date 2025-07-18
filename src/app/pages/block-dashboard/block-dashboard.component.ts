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
  }

  // ===== INITIALIZATION =====

 
}