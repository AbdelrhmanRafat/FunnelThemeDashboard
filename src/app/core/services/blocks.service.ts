import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import blocksData from '../mock/blocks.json';
import { 
  Block, 
  BlockData, 
  CreateBlockRequest, 
  UpdateBlockRequest, 
  BlockResponse, 
  BlocksListResponse,
  ComponentDefinition,
  ComponentCategory
} from "../../models/theme.model";

@Injectable({
  providedIn: 'root'
})
export class BlocksService {
  private blocksSubject: BehaviorSubject<Block[]> = new BehaviorSubject<Block[]>([]);
  public blocks$: Observable<Block[]> = this.blocksSubject.asObservable();
  private nextId = 1;

  constructor() {
    // Initialize with mock data from your JSON
    this.initializeBlocks();
  }

  private initializeBlocks(): void {
    // Use your existing blocks.json data
    const initialBlocks: Block[] = blocksData.blocks.map((block: any, index: number) => ({
      id: `block_${index + 1}`,
      name: block.name,
      data: block.data,
      order: index + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.blocksSubject.next(initialBlocks);
  }

  // ===== BLOCK OPERATIONS =====

  getBlocks(): Observable<Block[]> {
    return this.blocks$.pipe(delay(200));
  }

  getBlockById(id: string): Observable<Block | undefined> {
    return this.blocks$.pipe(
      map(blocks => blocks.find(block => block.id === id)),
      delay(200)
    );
  }

  getBlockByName(name: string): Observable<Block | undefined> {
    return this.blocks$.pipe(
      map(blocks => blocks.find(block => block.name === name)),
      delay(200)
    );
  }

  

  updateBlock(request: UpdateBlockRequest): Observable<BlockResponse> {
    const blocks = this.blocksSubject.getValue();
    const index = blocks.findIndex(block => block.id === request.id);
    
    if (index === -1) {
      return throwError(() => new Error('Block not found'));
    }

    const updatedBlock: Block = {
      ...blocks[index],
      ...(request.name && { name: request.name }),
      ...(request.data && { data: { ...blocks[index].data, ...request.data } }),
      ...(request.order !== undefined && { order: request.order }),
      ...(request.is_visible !== undefined && { is_visible: request.is_visible }),
      updated_at: new Date().toISOString()
    };

    blocks[index] = updatedBlock;
    this.blocksSubject.next(blocks);

    return of({
      success: true,
      message: 'Block updated successfully',
      data: updatedBlock
    }).pipe(delay(300));
  }

  deleteBlock(id: string): Observable<BlockResponse> {
    const blocks = this.blocksSubject.getValue();
    const index = blocks.findIndex(block => block.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Block not found'));
    }

    blocks.splice(index, 1);
    this.blocksSubject.next(blocks);

    return of({
      success: true,
      message: 'Block deleted successfully'
    }).pipe(delay(300));
  }

  toggleBlockVisibility(id: string): Observable<BlockResponse> {
    const blocks = this.blocksSubject.getValue();
    const index = blocks.findIndex(block => block.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Block not found'));
    }

    blocks[index].is_visible = !blocks[index].is_visible;
    blocks[index].updated_at = new Date().toISOString();
    this.blocksSubject.next(blocks);

    return of({
      success: true,
      message: 'Block visibility updated successfully',
      data: blocks[index]
    }).pipe(delay(200));
  }

  // ===== UTILITY METHODS =====

  reorderBlocks(blockOrders: { id: string; order: number }[]): Observable<BlockResponse> {
    const blocks = this.blocksSubject.getValue();
    
    blockOrders.forEach(({ id, order }) => {
      const block = blocks.find(b => b.id === id);
      if (block) {
        block.order = order;
        block.updated_at = new Date().toISOString();
      }
    });

    // Sort blocks by order
    blocks.sort((a, b) => (a.order || 0) - (b.order || 0));
    this.blocksSubject.next(blocks);

    return of({
      success: true,
      message: 'Blocks reordered successfully'
    }).pipe(delay(200));
  }

  searchBlocks(query: string): Observable<Block[]> {
    return this.blocks$.pipe(
      map(blocks => blocks.filter(block => 
        block.name.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_ar.toLowerCase().includes(query.toLowerCase()) ||
        block.data.title_en.toLowerCase().includes(query.toLowerCase())
      )),
      delay(200)
    );
  }

  // Add this method to your BlocksService class

// Add these methods to your existing BlocksService


// Update the order of blocks in mock data
updateBlockOrder(orderedBlockIds: string[]): Observable<any> {
  return this.blocks$.pipe(
    take(1),
    map(currentBlocks => {
      // Create a new array with updated order
      const reorderedBlocks: Block[] = [];
      
      // Add blocks in the new order
      orderedBlockIds.forEach((id, index) => {
        const block = currentBlocks.find(b => b.id === id);
        if (block) {
          reorderedBlocks.push({
            ...block,
            order: index
          });
        }
      });
      
      // Add any blocks that weren't in the ordered list (shouldn't happen, but safety)
      currentBlocks.forEach(block => {
        if (!orderedBlockIds.includes(block.id!)) {
          reorderedBlocks.push({
            ...block,
            order: reorderedBlocks.length
          });
        }
      });
      
      // Update the subject with new order
      this.blocksSubject.next(reorderedBlocks);
      
      return {
        success: true,
        message: 'Block order updated successfully',
        data: reorderedBlocks
      };
    }),
    delay(200) // Simulate API delay
  );
}

// Alternative method if you prefer to update individual block orders
updateBlockOrderBatch(blocks: { id: string, order: number }[]): Observable<any> {
  return this.blocks$.pipe(
    take(1),
    map(currentBlocks => {
      const updatedBlocks = currentBlocks.map(block => {
        const orderUpdate = blocks.find(b => b.id === block.id);
        if (orderUpdate) {
          return {
            ...block,
            order: orderUpdate.order
          };
        }
        return block;
      });
      
      // Sort by order to maintain consistency
      updatedBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      this.blocksSubject.next(updatedBlocks);
      
      return {
        success: true,
        message: 'Block order updated successfully',
        data: updatedBlocks
      };
    }),
    delay(200)
  );
}



// If you need to simulate an error for testing
updateBlockOrderWithError(orderedBlockIds: string[]): Observable<any> {
  return of(null).pipe(
    delay(200),
    switchMap(() => {
      // Simulate random errors for testing
      if (Math.random() < 0.2) { // 20% chance of error
        return throwError(() => new Error('Failed to update block order'));
      }
      return this.updateBlockOrder(orderedBlockIds);
    })
  );
}
}