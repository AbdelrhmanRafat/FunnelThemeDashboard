// block-dashboard-form.component.ts
import { Component, inject, input, signal, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

@Component({
  selector: 'app-block-dashboard-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-dashboard-form.component.html',
  styleUrl: './block-dashboard-form.component.scss'
})
export class BlockDashboardFormComponent {
  // Injected services
  private sanitizer = inject(DomSanitizer);

  // Inputs from parent
  selectedBlock = input<BlockSessionStorage | null>(null);
  funnelId = input<number | null>(null);

  // View mode signal
  private _selectedViewMode = signal<'desktop' | 'mobile'>('desktop');
  readonly selectedViewMode = this._selectedViewMode.asReadonly();

  // Computed properties
  readonly currentBlock = computed(() => this.selectedBlock());
  readonly hasSelectedBlock = computed(() => this.selectedBlock() !== null);

  readonly previewUrl = computed(() => {
    const block = this.selectedBlock();
    const currentFunnelId = this.funnelId();
    
    if (!block || !currentFunnelId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    
    const url = `https://funnel.baseet.cloud/?f=${currentFunnelId}&lang=ar&blockKey=${encodeURIComponent(block.key)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // View mode controls
  switchViewMode(mode: 'desktop' | 'mobile'): void {
    this._selectedViewMode.set(mode);
  }

  // Utility methods
  getBlockDisplayName(key: string): string {
    return key
      .replace(/^classic_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  getBlockIcon(key: string): string {
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
    if (key.includes('header') || key.includes('footer')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (key.includes('form') || key.includes('order')) return 'bg-green-100 text-green-800 border-green-200';
    if (key.includes('image') || key.includes('gallery')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (key.includes('review') || key.includes('rate')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (key.includes('countdown') || key.includes('statistic')) return 'bg-red-100 text-red-800 border-red-200';
    if (key.includes('product')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  // CSS helpers
  getContainerClasses(): string {
    return this.selectedViewMode() === 'desktop' ? 'w-full' : 'flex justify-center w-full';
  }

  getMobileFrameStyle(): object {
    return {
      'width': '400px',
      'height': '750px',
      'margin': '0 auto'
    };
  }

  getDesktopFrameStyle(): object {
    return {
      'min-height': '750px',
      'width': '100%'
    };
  }

  // View checks
  isDesktopView(): boolean {
    return this.selectedViewMode() === 'desktop';
  }

  isMobileView(): boolean {
    return this.selectedViewMode() === 'mobile';
  }
}