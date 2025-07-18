import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-image-array',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <!-- Label -->
      <label class="block text-sm font-medium text-gray-700 dark:text-white mb-2">
        {{ field.label }}
        @if (field.required && !field.nullable) {
          <span class="text-red-500">*</span>
        }
      </label>

      <!-- File Input -->
      <input
        type="file"
        multiple
        accept="image/*"
        (change)="onImagesSelected($event)"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300"
        [disabled]="isMaxItemsReached()"
      />

      <!-- Max Items Warning -->
      @if (isMaxItemsReached()) {
        <p class="mt-1 text-sm text-orange-600">
          تم الوصول للحد الأقصى من الصور ({{ field.maxItems }})
        </p>
      }

      <!-- Image Previews -->
      @if (previewUrls.length > 0) {
        <div class="flex flex-wrap gap-4 mt-4">
          @for (preview of previewUrls; track preview.url; let i = $index) {
            <div class="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden group hover:border-blue-400 transition-colors">
              <img 
                [src]="preview.url" 
                [alt]="'صورة ' + (i + 1)"
                class="object-cover w-full h-full" 
              />
              
              <!-- Remove Button -->
              <button
                type="button"
                (click)="removeImage(i)"
                class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                title="حذف الصورة"
              >
                ×
              </button>
              
              <!-- File Size Info -->
              @if (preview.size) {
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 text-center">
                  {{ formatFileSize(preview.size) }}
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (previewUrls.length === 0) {
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mt-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="text-gray-500 text-sm mt-2">لا يوجد صور محملة</p>
          <p class="text-gray-400 text-xs">اختر صور لرفعها</p>
        </div>
      }

      <!-- Validation Errors -->
      @if (imageArray.invalid && imageArray.touched) {
        <div class="mt-2 text-sm text-red-600">
          @if (imageArray.errors?.['required']) {
            <p>يجب اختيار صورة واحدة على الأقل</p>
          }
          @if (imageArray.errors?.['minItems']) {
            <p>الحد الأدنى {{ imageArray.errors?.['minItems'].requiredItems }} صور</p>
          }
          @if (imageArray.errors?.['maxItems']) {
            <p>الحد الأقصى {{ imageArray.errors?.['maxItems'].maxAllowed }} صور</p>
          }
        </div>
      }

      <!-- Images Count Info -->
      @if (field.minItems || field.maxItems) {
        <div class="mt-2 text-xs text-gray-500">
          الصور: {{ previewUrls.length }}
          @if (field.minItems && field.maxItems) {
            ({{ field.minItems }} - {{ field.maxItems }})
          } @else if (field.minItems) {
            (الحد الأدنى: {{ field.minItems }})
          } @else if (field.maxItems) {
            (الحد الأقصى: {{ field.maxItems }})
          }
        </div>
      }

      <!-- Help Text -->
      @if (field.description) {
        <p class="mt-2 text-sm text-gray-500">{{ field.description }}</p>
      }
    </div>
  `
})
export class FieldImageArrayComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  imageArray!: FormArray;
  previewUrls: { url: string; file: File; size: number }[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize FormArray
    this.imageArray = this.fb.array([], this.getArrayValidators());
    
    // Add to parent form
    this.parentForm.addControl(this.field.value, this.imageArray);
    
    // Initialize with minimum required items if specified
    if (this.field.minItems && this.imageArray.length < this.field.minItems) {
      // For now, just create empty controls (real implementation would load default images)
      const itemsToAdd = this.field.minItems - this.imageArray.length;
      for (let i = 0; i < itemsToAdd; i++) {
        this.imageArray.push(this.fb.control(null));
      }
    }
  }

  /**
   * Handle image selection from file input
   */
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    
    // Check if adding these files would exceed maximum
    if (this.field.maxItems && (this.previewUrls.length + files.length) > this.field.maxItems) {
      const allowedCount = this.field.maxItems - this.previewUrls.length;
      if (allowedCount > 0) {
        files.splice(allowedCount); // Take only allowed number of files
      } else {
        return; // No more files allowed
      }
    }

    // Process each selected file
    files.forEach(file => {
      // Validate file size if specified
      if (this.field.maxSize && file.size > this.field.maxSize) {
        console.warn(`File ${file.name} exceeds maximum size limit`);
        return;
      }

      // Validate file format if specified
      if (this.field.allowedFormats && this.field.allowedFormats.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !this.field.allowedFormats.includes(fileExtension)) {
          console.warn(`File ${file.name} has unsupported format`);
          return;
        }
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = {
          url: e.target?.result as string,
          file: file,
          size: file.size
        };
        
        this.previewUrls.push(preview);
        
        // Add to FormArray
        const control = this.fb.control(file, this.getItemValidators());
        this.imageArray.push(control);
        
        // Mark as touched for validation
        this.imageArray.markAsTouched();
      };
      
      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  /**
   * Remove image at specific index
   */
  removeImage(index: number): void {
    if (index >= 0 && index < this.previewUrls.length) {
      // Remove from preview
      this.previewUrls.splice(index, 1);
      
      // Remove from FormArray
      this.imageArray.removeAt(index);
      
      // Mark as touched for validation
      this.imageArray.markAsTouched();
    }
  }

  /**
   * Check if maximum items limit is reached
   */
  isMaxItemsReached(): boolean {
    return this.field.maxItems ? this.previewUrls.length >= this.field.maxItems : false;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Get validators for individual array items
   */
  private getItemValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }
    
    return validators;
  }

  /**
   * Get validators for the FormArray itself
   */
  private getArrayValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (this.field.required && !this.field.nullable) {
      validators.push(this.requiredArrayValidator());
    }
    
    if (this.field.minItems) {
      validators.push(this.minItemsValidator(this.field.minItems));
    }
    
    if (this.field.maxItems) {
      validators.push(this.maxItemsValidator(this.field.maxItems));
    }
    
    return validators;
  }

  /**
   * Custom validator for required array
   */
  private requiredArrayValidator(): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      return array.length > 0 ? null : { required: true };
    };
  }

  /**
   * Custom validator for minimum items
   */
  private minItemsValidator(minItems: number): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      return array.length >= minItems ? null : { 
        minItems: { 
          requiredItems: minItems, 
          actualItems: array.length 
        } 
      };
    };
  }

  /**
   * Custom validator for maximum items
   */
  private maxItemsValidator(maxItems: number): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      return array.length <= maxItems ? null : { 
        maxItems: { 
          maxAllowed: maxItems, 
          actualItems: array.length 
        } 
      };
    };
  }
}