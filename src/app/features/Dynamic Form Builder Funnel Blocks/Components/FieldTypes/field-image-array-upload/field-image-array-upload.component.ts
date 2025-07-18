import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-image-array',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './field-image-array-upload.component.html',
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