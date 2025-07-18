import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

@Component({
  selector: 'app-block-dashboard-form',
  standalone: true,
  imports: [DragDropModule, CommonModule],
  templateUrl: './block-dashboard-form.component.html',
  styleUrl: './block-dashboard-form.component.scss'
})
export class BlockDashboardFormComponent implements OnInit {
  private blocksService = inject(BlocksService);
  private sanitizer = inject(DomSanitizer);
  
  blocks: BlockSessionStorage[] = [];
  selectedViewMode: 'desktop' | 'mobile' = 'desktop';
  
  ngOnInit(): void {
    this.loadBlocks();
  }
  
  loadBlocks(): void {
    this.blocksService.getBlocks().subscribe({
      next: (blocks) => {
        this.blocks = blocks;
      },
      error: (error) => console.error(error)
    });
  }
  
  
  onDrop(event: CdkDragDrop<BlockSessionStorage[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      // Create a copy of the array to avoid reference issues
      const blocksCopy = [...this.blocks];
      moveItemInArray(blocksCopy, event.previousIndex, event.currentIndex);
      this.blocks = blocksCopy;
      
      // Optional: Save the new order to backend
      this.saveBlockOrder();
    }
  }
  
  private saveBlockOrder(): void {
    // Implement your logic to save the new order to backend
    console.log('Saving new block order:', this.blocks.map((b, index) => ({ key: b.key, order: index })));
  }
  
  switchViewMode(mode: 'desktop' | 'mobile'): void {
    this.selectedViewMode = mode;
  }
  
  getIframeClasses(): string {
    const baseClasses = 'border-0 transition-all duration-300 ease-in-out';
    
    // Both desktop and mobile now use 100% to fill their respective containers
    return `${baseClasses} w-full h-full`;
  }
  
  getContainerClasses(): string {
    if (this.selectedViewMode === 'desktop') {
      return 'w-full min-w-[1400px] overflow-x-auto';
    } else {
      return 'flex justify-center w-full';
    }
  }
  
  // Method to ensure URL integrity
  private createSafeUrl(blockKey: string): string {
    // Ensure blockKey is properly encoded
    const safeBlockKey = encodeURIComponent(blockKey);
    return `https://funnel.baseet.cloud/?f=4&lang=ar&blockKey=${safeBlockKey}`;
  }
  
  // Override the getIframeUrl method to use the safe URL creation
   getIframeUrl(blockKey: string): SafeResourceUrl {
    const url = this.createSafeUrl(blockKey);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}