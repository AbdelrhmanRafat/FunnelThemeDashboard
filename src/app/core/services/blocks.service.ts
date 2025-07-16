import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import blocksData from '../mock/blocks.json';

export interface Block {
  name: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class BlocksService {
  private blocksSubject: BehaviorSubject<Block[]> = new BehaviorSubject<Block[]>(blocksData.blocks);
  public blocks$: Observable<Block[]> = this.blocksSubject.asObservable();

  constructor() {}

  getBlocks(): Block[] {
    return this.blocksSubject.getValue();
  }

  getBlockByName(name: string): Block | undefined {
    return this.getBlocks().find(block => block.name === name);
  }

  createBlock(block: Block): void {
    const blocks = this.getBlocks();
    blocks.push(block);
    this.blocksSubject.next(blocks);
  }

  updateBlock(name: string, updatedBlock: Block): void {
    const blocks = this.getBlocks().map(block => block.name === name ? updatedBlock : block);
    this.blocksSubject.next(blocks);
  }

  deleteBlock(name: string): void {
    const blocks = this.getBlocks().filter(block => block.name !== name);
    this.blocksSubject.next(blocks);
  }
}
