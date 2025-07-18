import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-string-array',
  imports: [ReactiveFormsModule],
  standalone: true,
  template: `
    <div class="mb-4">
      <!-- Header with Label and Add Button -->
      <div class="flex justify-between items-center mb-3">
        <label class="block text-sm font-medium text-gray-700 dark:text-white">
          {{ field.label }}
          @if (field.required && !field.nullable) {
            <span class="text-red-500">*</span>
          }
        </label>
        
        <button
          type="button"
          class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          (click)="addItem()"
          [disabled]="isMaxItemsReached()"
        >
          إضافة عنصر
        </button>
      </div>

      <!-- String Array Items -->
      @for (control of stringArray.controls; track control; let i = $index) {
        <div class="flex items-start gap-2 mb-2">
          <div class="flex-1">
            <input
              type="text"
              [formControl]="$any(control)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              [class.border-red-500]="control.invalid && control.touched"
              [class.focus:ring-red-500]="control.invalid && control.touched"
              [class.focus:border-red-500]="control.invalid && control.touched"
              [placeholder]="field.placeholder || 'عنصر ' + (i + 1)"
            />
            
            <!-- Individual Item Errors -->
            @if (control.invalid && control.touched) {
              <div class="mt-1 text-sm text-red-600">
                @if (control.errors?.['required']) {
                  <p>هذا الحقل مطلوب</p>
                }
                @if (control.errors?.['minlength']) {
                  <p>الحد الأدنى {{ control.errors?.['minlength'].requiredLength }} أحرف</p>
                }
                @if (control.errors?.['maxlength']) {
                  <p>الحد الأقصى {{ control.errors?.['maxlength'].requiredLength }} أحرف</p>
                }
              </div>
            }
          </div>
          
          <button
            type="button"
            class="px-2 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            (click)="removeItem(i)"
            [disabled]="isMinItemsReached()"
            title="حذف العنصر"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      }

      <!-- Empty State -->
      @if (stringArray.length === 0) {
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p class="text-gray-500 text-sm">لا يوجد عناصر حالياً</p>
          <p class="text-gray-400 text-xs mt-1">اضغط "إضافة عنصر" لبدء الإضافة</p>
        </div>
      }

      <!-- Array-Level Validation Errors -->
      @if (stringArray.invalid && stringArray.touched) {
        <div class="mt-2 text-sm text-red-600">
          @if (stringArray.errors?.['required']) {
            <p>يجب إضافة عنصر واحد على الأقل</p>
          }
          @if (stringArray.errors?.['minItems']) {
            <p>الحد الأدنى {{ stringArray.errors?.['minItems'].requiredItems }} عناصر</p>
          }
          @if (stringArray.errors?.['maxItems']) {
            <p>الحد الأقصى {{ stringArray.errors?.['maxItems'].maxAllowed }} عناصر</p>
          }
        </div>
      }

      <!-- Items Count Info -->
      @if (field.minItems || field.maxItems) {
        <div class="mt-2 text-xs text-gray-500">
          العناصر: {{ stringArray.length }}
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
export class FieldStringArrayComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  stringArray!: FormArray;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize with default values or empty array
    const initialValues = Array.isArray(this.field.defaultValue) 
      ? this.field.defaultValue 
      : [];

    // Create FormArray with initial values
    this.stringArray = this.fb.array(
      initialValues.map(value => this.createItemControl(value)),
      this.getArrayValidators()
    );

    // Add minimum required items if specified
    if (this.field.minItems && this.stringArray.length < this.field.minItems) {
      const itemsToAdd = this.field.minItems - this.stringArray.length;
      for (let i = 0; i < itemsToAdd; i++) {
        this.stringArray.push(this.createItemControl(''));
      }
    }

    // Add to parent form
    this.parentForm.addControl(this.field.value, this.stringArray);
  }

  /**
   * Create a new FormControl for array item
   */
  private createItemControl(value: string = ''): FormControl {
    return this.fb.control(value, this.getItemValidators());
  }

  /**
   * Get validators for individual array items
   */
  private getItemValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }
    
    if (this.field.minLength) {
      validators.push(Validators.minLength(this.field.minLength));
    }
    
    if (this.field.maxLength) {
      validators.push(Validators.maxLength(this.field.maxLength));
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
   * Custom validator for required array (at least one non-empty item)
   */
  private requiredArrayValidator(): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      const hasValidItems = array.controls.some(ctrl => ctrl.value && ctrl.value.trim());
      return hasValidItems ? null : { required: true };
    };
  }

  /**
   * Custom validator for minimum items
   */
  private minItemsValidator(minItems: number): ValidatorFn {
    return (control) => {
      const array = control as FormArray;
      const validItems = array.controls.filter(ctrl => ctrl.value && ctrl.value.trim()).length;
      return validItems >= minItems ? null : { 
        minItems: { 
          requiredItems: minItems, 
          actualItems: validItems 
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

  /**
   * Add new item to the array
   */
  addItem(): void {
    if (!this.isMaxItemsReached()) {
      this.stringArray.push(this.createItemControl(''));
    }
  }

  /**
   * Remove item from the array
   */
  removeItem(index: number): void {
    if (!this.isMinItemsReached()) {
      this.stringArray.removeAt(index);
    }
  }

  /**
   * Check if maximum items limit is reached
   */
  isMaxItemsReached(): boolean {
    return this.field.maxItems ? this.stringArray.length >= this.field.maxItems : false;
  }

  /**
   * Check if minimum items limit is reached
   */
  isMinItemsReached(): boolean {
    return this.field.minItems ? this.stringArray.length <= this.field.minItems : this.stringArray.length <= 0;
  }
}