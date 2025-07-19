// block-dashboard.component.ts
import { Component, inject, OnInit, ViewChild, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  // Injected services
  private blocksService = inject(BlocksService);
  private activatedRoute = inject(ActivatedRoute);
  
  @ViewChild('blockSidebar') blockSidebar!: BlockSidebarComponent;

  // Private signals for internal state management
  private _selectedBlock = signal<BlockSessionStorage | null>(null);
  private _isInitialized = signal<boolean>(false);
  private _isInitializing = signal<boolean>(false);
  private _initializationError = signal<string | null>(null);
  private _isMobileSidebarOpen = signal<boolean>(false);
  private _funnelId = signal<number | null>(null);

  // Public readonly signals for template access
  readonly selectedBlock = this._selectedBlock.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isInitializing = this._isInitializing.asReadonly();
  readonly initializationError = this._initializationError.asReadonly();
  readonly isMobileSidebarOpen = this._isMobileSidebarOpen.asReadonly();
  readonly funnelId = this._funnelId.asReadonly();

  // Service-based computed properties (automatically reactive)
  readonly totalBlocksCount = computed(() => this.blocksService.totalCount());
  readonly visibleBlocksCount = computed(() => this.blocksService.visibleCount());
  readonly loading = computed(() => this.blocksService.loading());
  readonly error = computed(() => this.blocksService.error());

  // Computed properties for template logic
  readonly canInitialize = computed(() => 
    this.funnelId() !== null && !this.isInitializing()
  );

  readonly hasValidData = computed(() => 
    this.isInitialized() && this.totalBlocksCount() > 0
  );

  readonly isReady = computed(() => 
    this.isInitialized() && !this.loading() && !this.initializationError()
  );

  constructor() {
    // Effect with allowSignalWrites for initialization
    effect(() => {
      const funnelId = this.funnelId();
      if (funnelId && !this.isInitialized() && !this.isInitializing()) {
        this.initializeBlocksAndLoadData();
      }
    }, { allowSignalWrites: true });

    // Effect for auto-selecting first visible block
    effect(() => {
      if (this.isInitialized() && this.totalBlocksCount() > 0 && !this.selectedBlock()) {
        const firstVisibleBlock = this.blocksService.visibleBlocks()[0];
        if (firstVisibleBlock) {
          this._selectedBlock.set(firstVisibleBlock);
        }
      }
    }, { allowSignalWrites: true });
  }
  
  async ngOnInit(): Promise<void> {
    // Subscribe to route params to get funnel ID
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      const funnelId = id ? parseInt(id, 10) : null;
      
      if (funnelId && !isNaN(funnelId) && funnelId > 0) {
        this._funnelId.set(funnelId);
        console.info(`Loading funnel ${funnelId}`);
      } else {
        this._initializationError.set('Invalid or missing funnel ID in route');
        console.error('Invalid funnel ID');
      }
    });
  }

  private async initializeBlocksAndLoadData(): Promise<void> {
    const currentFunnelId = this.funnelId();
    
    if (!currentFunnelId) {
      this._initializationError.set('No funnel ID available for initialization');
      return;
    }

    try {
      this._isInitializing.set(true);
      this._initializationError.set(null);
      
      // Clear any previous errors from service
      this.blocksService.clearError();
      
      // Initialize blocks session with the funnel ID
      await this.blocksService.initializeBlocksSession(currentFunnelId);
      
      // Verify initialization was successful
      if (this.blocksService.totalCount() > 0) {
        this._isInitialized.set(true);
        console.log(
          `Successfully loaded ${this.blocksService.totalCount()} blocks (${this.blocksService.visibleCount()} visible)`
        );
      } else {
        throw new Error('No blocks were loaded - empty session data');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error during blocks session initialization';
      
      this._initializationError.set(errorMessage);
      console.error('Blocks initialization failed:', error);
    } finally {
      this._isInitializing.set(false);
    }
  }

  // Mobile sidebar controls
  toggleMobileSidebar(): void {
    this._isMobileSidebarOpen.update(open => !open);
  }

  closeMobileSidebar(): void {
    this._isMobileSidebarOpen.set(false);
  }

  // Block selection handler (only UI-specific logic)
  onBlockSelected(block: BlockSessionStorage): void {
    this._selectedBlock.set(block);
    this.closeMobileSidebar();
    console.info(`Selected block: ${block.key}`);
  }

  // Retry initialization method
  async retryInitialization(): Promise<void> {
    // Reset component state
    this._isInitialized.set(false);
    this._initializationError.set(null);
    this._selectedBlock.set(null);
    
    // Clear service errors
    this.blocksService.clearError();
    
    console.info('Retrying blocks initialization...');
    
    // Restart initialization process
    await this.initializeBlocksAndLoadData();
  }

  // Clear block selection
  clearSelection(): void {
    this._selectedBlock.set(null);
    console.info('Block selection cleared');
  }

  // Refresh all data
  async refreshData(): Promise<void> {
    if (this.isInitializing()) {
      console.warn('Initialization already in progress');
      return;
    }
    
    console.info('Refreshing blocks data...');
    this._isInitialized.set(false);
    await this.initializeBlocksAndLoadData();
  }

  // Debug method to log final state
  logFinalState(): void {
    this.blocksService.logFinalState();
    console.info('Final state logged to console');
  }

  // Navigate back or to funnel list (if needed)
  goBack(): void {
    console.info('Navigate back functionality');
  }
}