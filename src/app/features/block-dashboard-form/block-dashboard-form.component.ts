import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BlocksService } from '../../core/services/blocks.service';
import { Block, ComponentDefinition, UpdateBlockRequest } from '../../models/theme.model';

@Component({
  selector: 'app-block-dashboard-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './block-dashboard-form.component.html',
  styleUrl: './block-dashboard-form.component.scss'
})
export class BlockDashboardFormComponent implements OnChanges {
  private blocksService = inject(BlocksService);
  private fb = inject(FormBuilder);
  isDev: boolean = false;
  // Input/Output
  @Input() selectedBlock: Block | null = null;
  @Input() availableComponents: ComponentDefinition[] = [];
  @Output() blockUpdated = new EventEmitter<Block>();
  @Output() blockVisibilityToggled = new EventEmitter<Block>();

  // State
  isSaving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Form
  blockForm: FormGroup;

  constructor() {
    this.blockForm = this.fb.group({
      title_ar: ['', Validators.required],
      title_en: ['', Validators.required],
      icon: [''],
      description: [''],
      buttonLabel: [''],
      items: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedBlock'] && this.selectedBlock) {
      this.populateForm(this.selectedBlock);
    }
  }

  getComponentDisplayName(componentName: string): string {
    const component = this.availableComponents.find(c => c.name === componentName);
    return component ? component.display_name_en : componentName;
  }

  // ===== FORM MANAGEMENT =====

  populateForm(block: Block): void {
    // Clear existing form
    this.blockForm.reset();
    this.clearItemsArray();

    // Populate basic fields
    this.blockForm.patchValue({
      title_ar: block.data.title_ar || '',
      title_en: block.data.title_en || '',
      icon: block.data.icon || '',
      description: block.data.description || '',
      buttonLabel: block.data.buttonLabel || ''
    });

    // Populate items array
    if (block.data.items && block.data.items.length > 0) {
      block.data.items.forEach(item => {
        this.addItem(item);
      });
    }
  }

  get itemsArray(): FormArray {
    return this.blockForm.get('items') as FormArray;
  }

  addItem(itemData?: any): void {
    const itemForm = this.fb.group({
      label: [itemData?.label || '', Validators.required],
      content: [itemData?.content || '', Validators.required],
      image: [itemData?.image || '']
    });

    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  clearItemsArray(): void {
    while (this.itemsArray.length !== 0) {
      this.itemsArray.removeAt(0);
    }
  }

  // ===== FORM SUBMISSION =====

  onSubmit(): void {
    if (this.blockForm.valid && this.selectedBlock) {
      this.isSaving = true;
      
      const formData = this.blockForm.value;
      const updateRequest: UpdateBlockRequest = {
        id: this.selectedBlock.id!,
        data: {
          title_ar: formData.title_ar,
          title_en: formData.title_en,
          icon: formData.icon,
          description: formData.description,
          buttonLabel: formData.buttonLabel,
          items: formData.items
        }
      };

      this.blocksService.updateBlock(updateRequest).subscribe({
        next: (response) => {
          this.showMessage('Block updated successfully!', 'success');
          this.blockUpdated.emit(response.data!);
          this.isSaving = false;
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to update block', 'error');
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  resetForm(): void {
    if (this.selectedBlock) {
      this.populateForm(this.selectedBlock);
    }
  }

  // ===== BLOCK ACTIONS =====

  toggleBlockVisibility(): void {
    if (!this.selectedBlock) return;

    this.blocksService.toggleBlockVisibility(this.selectedBlock.id!).subscribe({
      next: (response) => {
        this.showMessage('Block visibility updated', 'success');
        this.blockVisibilityToggled.emit(response.data!);
      },
      error: (error) => {
        this.showMessage(error.message || 'Failed to update visibility', 'error');
      }
    });
  }

  // ===== UTILITY METHODS =====

  private markFormGroupTouched(): void {
    Object.keys(this.blockForm.controls).forEach(key => {
      const control = this.blockForm.get(key);
      control?.markAsTouched();
    });

    // Mark items array controls as touched
    this.itemsArray.controls.forEach(itemControl => {
      Object.keys(itemControl.value).forEach(key => {
        const control = itemControl.get(key);
        control?.markAsTouched();
      });
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // ===== FORM GETTERS =====

  get titleAr() { return this.blockForm.get('title_ar'); }
  get titleEn() { return this.blockForm.get('title_en'); }
  get icon() { return this.blockForm.get('icon'); }
  get description() { return this.blockForm.get('description'); }
  get buttonLabel() { return this.blockForm.get('buttonLabel'); }
}