// block-sidebar.component.ts
import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BlockSessionStorage, BlockKey, ShowValue } from '../../models/theme.classic.blocks';
import { BlocksService } from '../../core/services/blocks.service';

@Component({
  selector: 'app-block-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './block-sidebar.component.html',
  styleUrl: './block-sidebar.component.scss'
})
export class BlockSidebarComponent {
  // Injected services
  private blocksService = inject(BlocksService);
  private toastr = inject(ToastrService);

  // Inputs from parent component
  selectedBlock = input<BlockSessionStorage | null>(null);

  // Outputs to parent component (only UI-specific events)
  blockSelected = output<BlockSessionStorage>();
  closeMobileSidebar = output<void>();

  // Internal component signals
  private _searchQuery = signal<string>('');
  private _activeFilter = signal<'all' | 'visible' | 'hidden'>('all');

  // Public readonly signals
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();

  // Service-based computed properties (automatically reactive)
  readonly allBlocks = computed(() => this.blocksService.blocks());
  readonly visibleBlocks = computed(() => this.blocksService.visibleBlocks());
  readonly hiddenBlocks = computed(() => this.blocksService.hiddenBlocks());
  readonly totalCount = computed(() => this.blocksService.totalCount());
  readonly visibleCount = computed(() => this.blocksService.visibleCount());
  readonly hiddenCount = computed(() => this.blocksService.hiddenBlocks().length);
  readonly loading = computed(() => this.blocksService.loading());

  // Filtered and searched blocks
  readonly filteredBlocks = computed(() => {
    let blocks: BlockSessionStorage[] = [];
    
    // Apply filter
    switch (this.activeFilter()) {
      case 'visible':
        blocks = this.visibleBlocks();
        break;
      case 'hidden':
        blocks = this.hiddenBlocks();
        break;
      default:
        blocks = this.allBlocks();
    }

    // Apply search
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      blocks = blocks.filter(block => 
        block.key.toLowerCase().includes(query) ||
        block.data.title_ar?.toLowerCase().includes(query) ||
        block.data.title_en?.toLowerCase().includes(query) ||
        this.getBlockDisplayName(block.key).toLowerCase().includes(query)
      );
    }

    // Sort by order
    return blocks.sort((a, b) => a.order - b.order);
  });

  // Computed for search results info
  readonly searchResultsInfo = computed(() => {
    const total = this.filteredBlocks().length;
    const hasSearch = this.searchQuery().trim().length > 0;
    const hasFilter = this.activeFilter() !== 'all';
    
    return { total, hasSearch, hasFilter };
  });

  constructor() {
    // Effect to show loading feedback
    effect(() => {
      if (this.loading()) {
        // Optional: You can add loading feedback here if needed
      }
    });
  }

  // Search functionality
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchQuery.set(target.value);
  }

  clearSearch(): void {
    this._searchQuery.set('');
  }

  // Filter functionality
  setFilter(filter: 'all' | 'visible' | 'hidden'): void {
    this._activeFilter.set(filter);
    
    // Optional feedback
    const filterNames = {
      'all': 'All Blocks',
      'visible': 'Visible Blocks',
      'hidden': 'Hidden Blocks'
    };
    
    this.toastr.info(`Showing: ${filterNames[filter]}`, 'Filter Applied');
  }

  // Block selection
  selectBlock(block: BlockSessionStorage): void {
    this.blockSelected.emit(block);
  }

  // Block visibility toggle
  toggleBlockVisibility(block: BlockSessionStorage, event: Event): void {
    event.stopPropagation(); // Prevent block selection
    
    this.blocksService.toggleBlockVisibility(block.key as BlockKey).subscribe({
      next: (result) => {
        if (result.success) {
          const action = block.show === ShowValue.VISIBLE ? 'hidden' : 'shown';
          this.toastr.success(`Block "${this.getBlockDisplayName(block.key)}" ${action}`, 'Visibility Updated');
        }
      },
      error: (error) => {
        this.toastr.error(`Failed to toggle visibility for "${this.getBlockDisplayName(block.key)}"`, 'Error');
        console.error('Toggle visibility error:', error);
      }
    });
  }

  // Block reordering
  moveBlockUp(block: BlockSessionStorage, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.moveBlockUp(block.key as BlockKey).subscribe({
      next: (result) => {
        if (result.success) {
          this.toastr.success(`Block "${this.getBlockDisplayName(block.key)}" moved up`, 'Order Updated');
        }
      },
      error: (error) => {
        this.toastr.error(`Failed to move "${this.getBlockDisplayName(block.key)}" up`, 'Error');
        console.error('Move up error:', error);
      }
    });
  }

  moveBlockDown(block: BlockSessionStorage, event: Event): void {
    event.stopPropagation();
    
    this.blocksService.moveBlockDown(block.key as BlockKey).subscribe({
      next: (result) => {
        if (result.success) {
          this.toastr.success(`Block "${this.getBlockDisplayName(block.key)}" moved down`, 'Order Updated');
        }
      },
      error: (error) => {
        this.toastr.error(`Failed to move "${this.getBlockDisplayName(block.key)}" down`, 'Error');
        console.error('Move down error:', error);
      }
    });
  }

  // Utility methods
  getBlockDisplayName(key: string): string {
    // Convert block key to readable name
    return key
      .replace(/^classic_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  getBlockIcon(key: string): string {
    // Return appropriate icon based on block type
    const iconMap: Record<string, string> = {
      'classic_header': '🏠',
      'classic_footer': '📧',
      'classic_form_fields': '📝',
      'classic_reviews': '⭐',
      'classic_countdown': '⏰',
      'classic_Image_Text_overlay': '🖼️',
      'classic_Image_Text_beside': '📄',
      'classic_product_funnel': '🛒',
      'classic_Gallery': '🖼️',
      'classic_before_&_after': '🔄',
      'classic_text-bar': '📊',
      'classic_today_statistics': '📈',
      'classic_rates': '⭐',
      'classic_order_confirmation_notice': '✅',
      'classic_faq': '❓',
      'classic_product_preview': '👁️',
      'classic_product_usage': '🎥',
      'classic_delivery_features': '🚚',
      'classic_product_features': '✨',
      'classic_logos_carousel': '🏢',
      'classic_visitors': '👥',
      'classic_order_through_whatsapp': '💬',
      'classic_button_with_link': '🔗',
      'classic_coupon': '🎫'
    };
    
    return iconMap[key] || '📦';
  }

  getBlockTypeColor(key: string): string {
    // Return Tailwind color classes based on block type
    if (key.includes('header') || key.includes('footer')) return 'bg-blue-100 text-blue-800';
    if (key.includes('form') || key.includes('order')) return 'bg-green-100 text-green-800';
    if (key.includes('image') || key.includes('gallery')) return 'bg-purple-100 text-purple-800';
    if (key.includes('review') || key.includes('rate')) return 'bg-yellow-100 text-yellow-800';
    if (key.includes('countdown') || key.includes('statistic')) return 'bg-red-100 text-red-800';
    if (key.includes('product')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  }

  isBlockSelected(block: BlockSessionStorage): boolean {
    return this.selectedBlock()?.key === block.key;
  }

  canMoveUp(block: BlockSessionStorage): boolean {
    const blocks = this.allBlocks();
    const currentIndex = blocks.findIndex(b => b.key === block.key);
    return currentIndex > 0;
  }

  canMoveDown(block: BlockSessionStorage): boolean {
    const blocks = this.allBlocks();
    const currentIndex = blocks.findIndex(b => b.key === block.key);
    return currentIndex < blocks.length - 1;
  }

  // Mobile sidebar close
  closeMobile(): void {
    this.closeMobileSidebar.emit();
  }

  // Quick actions
  showAllBlocks(): void {
    // This would need a service method to show all blocks
    this.toastr.info('Show all blocks functionality', 'Quick Action');
  }

  hideAllBlocks(): void {
    // This would need a service method to hide all blocks
    this.toastr.info('Hide all blocks functionality', 'Quick Action');
  }

  resetBlockOrder(): void {
    // This would need a service method to reset order
    this.toastr.info('Reset block order functionality', 'Quick Action');
  }
}