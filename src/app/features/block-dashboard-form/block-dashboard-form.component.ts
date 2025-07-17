import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockData } from '../../models/theme.model';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';

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
  
  // Input/Output - Updated types
  @Input() selectedBlock: BlockSessionStorage | null = null;
  @Output() blockUpdated = new EventEmitter<BlockSessionStorage>();
  @Output() blockVisibilityToggled = new EventEmitter<BlockSessionStorage>();

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

  getComponentDisplayName(componentKey: string): string {
    // Extract a readable name from the key
    return componentKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // ===== FORM MANAGEMENT =====

  populateForm(block: BlockSessionStorage): void {
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
      image: [itemData?.image || ''],
      link: [itemData?.link || ''],
      number: [itemData?.number || ''],
      name: [itemData?.name || ''],
      icon: [itemData?.icon || '']
    });

    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 0) {
      this.itemsArray.removeAt(index);
    }
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
      const updatedBlockData: Partial<BlockData> = {
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        icon: formData.icon,
        description: formData.description,
        buttonLabel: formData.buttonLabel,
        items: formData.items
      };

      this.blocksService.updateBlock(this.selectedBlock.key, updatedBlockData).subscribe({
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

    this.blocksService.toggleBlockVisibility(this.selectedBlock.key).subscribe({
      next: (response) => {
        this.showMessage('Block visibility updated', 'success');
        this.blockVisibilityToggled.emit(response.data!);
      },
      error: (error) => {
        this.showMessage(error.message || 'Failed to update visibility', 'error');
      }
    });
  }

  // ===== PREVIEW METHODS =====

  getPreviewUrl(): string {
    if (!this.selectedBlock) return '';
    
    // Generate preview URL based on block key and funnel/store info
    const baseUrl = 'https://funnel.baseet.cloud/';
    const params = `?f=${this.selectedBlock.funnel_id}&lang=ar&store=${this.selectedBlock.store_id}`;
    const anchor = `#${this.selectedBlock.key}`;
    
    return `${baseUrl}${params}${anchor}`;
  }

  // ===== ADVANCED FORM METHODS =====

  // Add support for FormInputs if block has them
  addFormInput(): void {
    if (this.selectedBlock?.data.FormInputs) {
      // Handle FormInputs structure
      this.showMessage('Form inputs are complex structures - use advanced editor', 'error');
    }
  }

  // Add support for purchase options
  addPurchaseOption(): void {
    if (this.selectedBlock?.data.purchase_options) {
      // Handle purchase options
      this.showMessage('Purchase options require specialized editor', 'error');
    }
  }

  // Add support for video info
  addVideoInfo(): void {
    if (this.selectedBlock?.data.videoInfo) {
      // Handle video info
      this.showMessage('Video info requires specialized editor', 'error');
    }
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

  // ===== VALIDATION HELPERS =====

  isFieldInvalid(fieldName: string): boolean {
    const field = this.blockForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.blockForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return `${fieldName} must be a valid email`;
      if (field.errors['url']) return `${fieldName} must be a valid URL`;
    }
    return '';
  }

  // ===== BLOCK INFO GETTERS =====

  get blockKey(): string {
    return this.selectedBlock?.key || '';
  }

  get blockStore(): number {
    return this.selectedBlock?.store_id || 0;
  }

  get blockFunnel(): number {
    return this.selectedBlock?.funnel_id || 0;
  }

  get blockVisible(): boolean {
    return this.selectedBlock?.show === 1;
  }

  get hasItems(): boolean {
    return this.itemsArray.length > 0;
  }

  get hasFormInputs(): boolean {
    return !!this.selectedBlock?.data.FormInputs;
  }

  get hasPurchaseOptions(): boolean {
    return !!this.selectedBlock?.data.purchase_options?.length;
  }

  get hasVideoInfo(): boolean {
    return !!this.selectedBlock?.data.videoInfo?.length;
  }
}