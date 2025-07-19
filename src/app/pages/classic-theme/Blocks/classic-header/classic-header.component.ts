import { Component, computed, inject, OnInit } from '@angular/core';
import { BlocksService } from '../../../../core/services/blocks.service';
import { BlockSessionStorage } from '../../../../models/theme.classic.blocks';

@Component({
  selector: 'app-classic-header',
  standalone: true,
  imports: [],
  templateUrl: './classic-header.component.html',
  styleUrl: './classic-header.component.scss'
})
export class ClassicHeaderComponent implements OnInit {
  private blocksService = inject(BlocksService);
  readonly allBlocks = computed(() => this.blocksService.blocks());

  // 👇 bindable variable for header block
  headerBlock: BlockSessionStorage | undefined;

  ngOnInit(): void {
    const blocks = this.allBlocks(); // get value from signal
    this.headerBlock = blocks.find(block => block.key === 'classic_header');

    if (this.headerBlock) {
      console.log('Found classic_header block:', this.headerBlock);
    } else {
      console.log('classic_header block not found');
    }
  }
}
