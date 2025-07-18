import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';
import { BlockStateService } from '../../core/services/blockstate.service';

@Component({
  selector: 'app-block-dashboard-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-dashboard-form.component.html',
  styleUrl: './block-dashboard-form.component.scss'
})
export class BlockDashboardFormComponent implements OnInit {
  private blocksService = inject(BlocksService);
  private sanitizer = inject(DomSanitizer);
  private blockStateService = inject(BlockStateService);

  // Signals for state management
  private readonly _allBlocks = signal<BlockSessionStorage[]>([]);
  private readonly _selectedViewMode = signal<'desktop' | 'mobile'>('desktop');

  // Public readonly signals
  readonly allBlocks = this._allBlocks.asReadonly();
  readonly selectedViewMode = this._selectedViewMode.asReadonly();

  // Get selected block from shared state service
  readonly selectedBlock = this.blockStateService.selectedBlock;
  readonly selectedBlockKey = this.blockStateService.selectedBlockKey;
  readonly hasSelectedBlock = this.blockStateService.hasSelectedBlock;

  // Computed property to show either only selected block or all visible blocks
  readonly blocks = computed(() => {
    const allBlocks = this._allBlocks();
    const currentSelectedBlock = this.selectedBlock();
    
    // If a block is selected, show only that block
    if (currentSelectedBlock) {
      return allBlocks.filter(block => block.key === currentSelectedBlock.key);
    }
    
    // Otherwise show all visible blocks
    return allBlocks.filter(block => block.show === 1);
  });

  // Effect to react to selectedBlock changes
  constructor() {
    effect(() => {
      const selectedBlock = this.selectedBlock();
      if (selectedBlock) {
        console.log('Selected block changed:', selectedBlock.key);
        // Ensure the selected block has the latest data
        this.updateSelectedBlockData(selectedBlock.key);
      }
    });
  }

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    this.blocksService.getBlocks().subscribe({
      next: (blocks) => {
        this._allBlocks.set(blocks);
        
        // Update selected block with fresh data if one is selected
        const selectedKey = this.selectedBlockKey();
        if (selectedKey) {
          const updatedSelectedBlock = blocks.find(block => block.key === selectedKey);
          if (updatedSelectedBlock) {
            this.blockStateService.updateSelectedBlock(updatedSelectedBlock);
          } else {
            // Selected block no longer exists, clear selection
            this.blockStateService.clearSelection();
          }
        }
      },
      error: (error) => console.error('Failed to load blocks:', error)
    });
  }

  /**
   * Update selected block data with fresh information from allBlocks
   */
  private updateSelectedBlockData(blockKey: string): void {
    const allBlocks = this._allBlocks();
    const updatedBlock = allBlocks.find(block => block.key === blockKey);
    if (updatedBlock) {
      this.blockStateService.updateSelectedBlock(updatedBlock);
    }
  }

  switchViewMode(mode: 'desktop' | 'mobile'): void {
    this._selectedViewMode.set(mode);
  }

  getIframeClasses(): string {
    const baseClasses = 'border-0 transition-all duration-300 ease-in-out';
    return `${baseClasses} w-full h-full`;
  }

  getContainerClasses(): string {
    if (this._selectedViewMode() === 'desktop') {
      return 'w-full min-w-[1400px] overflow-x-auto';
    } else {
      return 'flex justify-center w-full';
    }
  }

  /**
   * Method to ensure URL integrity
   */
  private createSafeUrl(blockKey: string): string {
    const safeBlockKey = encodeURIComponent(blockKey);
    return `https://funnel.baseet.cloud/?f=4&lang=ar&blockKey=${safeBlockKey}`;
  }

  /**
   * Get iframe URL with security bypass
   */
  getIframeUrl(blockKey?: string): SafeResourceUrl {
    const key = blockKey || this.selectedBlockKey();
    if (!key) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    
    const url = this.createSafeUrl(key);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Method to get display info for current view state
   */
  getDisplayInfo(): { title: string; count: number } {
    const selectedBlock = this.selectedBlock();
    
    if (selectedBlock) {
      return {
        title: `Selected Block: ${selectedBlock.data?.title_en || selectedBlock.key}`,
        count: 1
      };
    }
    
    const visibleCount = this.blocks().length;
    return {
      title: 'All Visible Blocks',
      count: visibleCount
    };
  }

  /**
   * Get component display name from key
   */
  getComponentDisplayName(componentKey: string): string {
    return componentKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Manually select a block (if needed for programmatic selection)
   */
  selectBlock(block: BlockSessionStorage): void {
    this.blockStateService.setSelectedBlock(block);
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this.blockStateService.clearSelection();
  }

  /**
   * Refresh data for current view
   */
  refreshData(): void {
    this.loadBlocks();
  }

  /**
   * Check if view mode is mobile
   */
  isMobileView(): boolean {
    return this._selectedViewMode() === 'mobile';
  }

  /**
   * Check if view mode is desktop
   */
  isDesktopView(): boolean {
    return this._selectedViewMode() === 'desktop';
  }
}