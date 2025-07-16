import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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

  // Available component definitions
  private componentDefinitions: ComponentDefinition[] = [
    {
      name: 'classic_header',
      display_name_en: 'Classic Header',
      display_name_ar: 'رأس كلاسيكي',
      category: ComponentCategory.LAYOUT,
      icon: 'Header',
      description_en: 'Classic header with logo and title',
      description_ar: 'رأس كلاسيكي مع الشعار والعنوان',
      default_data: {
        title_ar: 'عنوان جديد',
        title_en: 'New Title',
        items: [
          {
            label: 'logo',
            content: 'Default content',
            image: 'assets/default-logo.svg'
          }
        ],
        buttonLabel: ''
      },
      is_available: true
    },
    {
      name: 'classic_Image_Text_overlay',
      display_name_en: 'Image with Text Overlay',
      display_name_ar: 'صورة مع نص متراكب',
      category: ComponentCategory.MEDIA,
      icon: 'Image',
      description_en: 'Image with overlaid text content',
      description_ar: 'صورة مع نص متراكب',
      default_data: {
        title_ar: 'معلومات عن المنتج',
        title_en: 'Product Information',
        icon: 'Images',
        items: [
          {
            label: 'Default label',
            content: 'Default content',
            image: 'https://via.placeholder.com/600x400'
          }
        ],
        buttonLabel: ''
      },
      is_available: true
    },
    {
      name: 'classic_Image_Text_beside',
      display_name_en: 'Image with Text Beside',
      display_name_ar: 'صورة مع نص جانبي',
      category: ComponentCategory.MEDIA,
      icon: 'Layout',
      description_en: 'Image with text content beside it',
      description_ar: 'صورة مع نص جانبي',
      default_data: {
        title_ar: 'معلومات عن المنتج',
        title_en: 'Product Information',
        icon: 'Images',
        items: [
          {
            label: 'Default label',
            content: 'Default content',
            image: 'https://via.placeholder.com/600x400'
          }
        ],
        buttonLabel: ''
      },
      is_available: true
    },
    {
      name: 'classic_reviews',
      display_name_en: 'Customer Reviews',
      display_name_ar: 'آراء العملاء',
      category: ComponentCategory.REVIEWS,
      icon: 'Star',
      description_en: 'Customer reviews and testimonials',
      description_ar: 'آراء العملاء والشهادات',
      default_data: {
        title_ar: 'آراء العملاء',
        title_en: 'Customer Reviews',
        icon: 'Star',
        description: 'What our customers say about us',
        items: [
          {
            label: 'Customer Name',
            content: 'Great product! Highly recommended.',
            image: 'https://via.placeholder.com/50x50'
          }
        ],
        buttonLabel: ''
      },
      is_available: true
    }
  ];

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

  createBlock(request: CreateBlockRequest): Observable<BlockResponse> {
    const blocks = this.blocksSubject.getValue();
    
    // Check if component exists
    const componentDef = this.componentDefinitions.find(def => def.name === request.name);
    if (!componentDef) {
      return throwError(() => new Error('Component not found'));
    }

    const newBlock: Block = {
      id: `block_${this.nextId++}`,
      name: request.name,
      data: request.data,
      order: request.order || blocks.length + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    blocks.push(newBlock);
    this.blocksSubject.next(blocks);

    return of({
      success: true,
      message: 'Block created successfully',
      data: newBlock
    }).pipe(delay(300));
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

  // ===== COMPONENT OPERATIONS =====

  getAvailableComponents(): Observable<ComponentDefinition[]> {
    return of(this.componentDefinitions.filter(def => def.is_available)).pipe(delay(200));
  }

  getComponentByName(name: string): Observable<ComponentDefinition | undefined> {
    return of(this.componentDefinitions.find(def => def.name === name)).pipe(delay(200));
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
}