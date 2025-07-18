import { Component, OnInit, inject, Input, signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

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

  // Input to receive selected block from parent
  @Input() selectedBlock: BlockSessionStorage | null = null;

  // Signals for state management
  private readonly _allBlocks = signal<BlockSessionStorage[]>([]);
  private readonly _selectedViewMode = signal<'desktop' | 'mobile'>('desktop');

  // Public readonly signals
  readonly allBlocks = this._allBlocks.asReadonly();
  readonly selectedViewMode = this._selectedViewMode.asReadonly();

  // Computed property to show either only selected block or all visible blocks
  readonly blocks = computed(() => {
    const allBlocks = this._allBlocks();
    
    // If a block is selected, show only that block
    if (this.selectedBlock) {
      return allBlocks.filter(block => block.key === this.selectedBlock!.key);
    }
    
    // Otherwise show all visible blocks
    return allBlocks.filter(block => block.show === 1);
  });

  // Effect to react to selectedBlock changes
  constructor() {
    effect(() => {
      // This will run whenever selectedBlock input changes
      if (this.selectedBlock) {
        console.log('Selected block changed:', this.selectedBlock.key);
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
      },
      error: (error) => console.error(error)
    });
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

  // Method to ensure URL integrity
  private createSafeUrl(blockKey: string): string {
    const safeBlockKey = encodeURIComponent(blockKey);
    return `https://funnel.baseet.cloud/?f=4&lang=ar&blockKey=${safeBlockKey}`;
  }

  // Override the getIframeUrl method to use the safe URL creation 
  getIframeUrl(blockKey: string): SafeResourceUrl {
    const url = this.createSafeUrl(blockKey);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Method to get display info for current view state
  getDisplayInfo(): { title: string; count: number } {
    if (this.selectedBlock) {
      return {
        title: `Selected Block: ${this.selectedBlock.data?.title_en || this.selectedBlock.key}`,
        count: 1
      };
    }
    
    const visibleCount = this.blocks().length;
    return {
      title: 'All Visible Blocks',
      count: visibleCount
    };
  }
}