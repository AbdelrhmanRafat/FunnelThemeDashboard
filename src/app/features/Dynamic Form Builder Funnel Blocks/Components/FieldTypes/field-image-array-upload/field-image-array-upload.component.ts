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
    this.imageArray = this.fb.array([], this.getArrayValidators());
    this.parentForm.addControl(this.field.value, this.imageArray);

    if (this.field.minItems && this.imageArray.length < this.field.minItems) {
      const itemsToAdd = this.field.minItems - this.imageArray.length;
      for (let i = 0; i < itemsToAdd; i++) {
        this.imageArray.push(this.fb.control(null));
      }
    }
  }

  /** Helper to get max allowed images from field config */
  private get maxAllowedImages(): number | null {
    return this.field.maxImages ?? this.field.maxItems ?? null;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const maxImages = this.maxAllowedImages;
    if (maxImages !== null && (this.previewUrls.length + files.length) > maxImages) {
      const allowedCount = maxImages - this.previewUrls.length;
      if (allowedCount > 0) {
        files.splice(allowedCount); // Keep only allowed files
      } else {
        return; // No more files allowed
      }
    }

    files.forEach(file => {
      if (this.field.maxSize && file.size > this.field.maxSize) {
        console.warn(`File ${file.name} exceeds max size`);
        return;
      }

      if (this.field.allowedFormats?.length) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !this.field.allowedFormats.includes(ext)) {
          console.warn(`File ${file.name} format is not allowed`);
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push({
          url: e.target?.result as string,
          file,
          size: file.size
        });

        this.imageArray.push(this.fb.control(file, this.getItemValidators()));
        this.imageArray.markAsTouched();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    if (index >= 0 && index < this.previewUrls.length) {
      this.previewUrls.splice(index, 1);
      this.imageArray.removeAt(index);
      this.imageArray.markAsTouched();
    }
  }

  isMaxItemsReached(): boolean {
    const maxImages = this.maxAllowedImages;
    return maxImages !== null ? this.previewUrls.length >= maxImages : false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private getItemValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }
    return validators;
  }

  private getArrayValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.field.required && !this.field.nullable) {
      validators.push(this.requiredArrayValidator());
    }
    if (this.field.minItems) {
      validators.push(this.minItemsValidator(this.field.minItems));
    }
    if (this.maxAllowedImages !== null) {
      validators.push(this.maxItemsValidator(this.maxAllowedImages));
    }
    return validators;
  }

  private requiredArrayValidator(): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      return array.length > 0 ? null : { required: true };
    };
  }

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