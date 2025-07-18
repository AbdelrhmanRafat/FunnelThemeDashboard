import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-array-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DynamicFieldComponent
  ],
  template: `
    <div class="mb-4">
      <!-- Header with Label and Add Button -->
      <div class="flex justify-between items-center mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-white">
          {{ field.label }}
          @if (field.required && !field.nullable) {
            <span class="text-red-500">*</span>
          }
        </label>
        
        <button
          type="button"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          (click)="addArrayItem()"
          [disabled]="isMaxItemsReached()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة عنصر
        </button>
      </div>

      <!-- Array Items Container -->
      <div class="space-y-4">
        @for (itemFormGroup of arrayFormGroups; track itemFormGroup; let i = $index) {
          <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            
            <!-- Item Header -->
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-medium text-gray-700 dark:text-white">
                عنصر {{ i + 1 }}
              </h4>
              
              <button
                type="button"
                class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                (click)="removeArrayItem(i)"
                [disabled]="isMinItemsReached()"
                title="حذف العنصر"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            
            <!-- Dynamic Fields for this Array Item -->
            <div class="space-y-4">
              @for (arrayField of field.arrayFields; track arrayField.value) {
                <app-dynamic-field 
                  [field]="arrayField"
                  [parentForm]="itemFormGroup">
                </app-dynamic-field>
              }
            </div>
            
          </div>
        }
      </div>

      <!-- Empty State -->
      @if (arrayFormGroups.length === 0) {
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <p class="text-gray-500 text-sm mt-2">لا يوجد عناصر حالياً</p>
          <p class="text-gray-400 text-xs mt-1">اضغط "إضافة عنصر" لبدء الإضافة</p>
        </div>
      }

      <!-- Array-Level Validation Errors -->
      @if (arrayFormArray.invalid && arrayFormArray.touched) {
        <div class="mt-4 text-sm text-red-600">
          @if (arrayFormArray.errors?.['required']) {
            <p>يجب إضافة عنصر واحد على الأقل</p>
          }
          @if (arrayFormArray.errors?.['minItems']) {
            <p>الحد الأدنى {{ arrayFormArray.errors?.['minItems'].requiredItems }} عناصر</p>
          }
          @if (arrayFormArray.errors?.['maxItems']) {
            <p>الحد الأقصى {{ arrayFormArray.errors?.['maxItems'].maxAllowed }} عناصر</p>
          }
        </div>
      }

      <!-- Items Count Info -->
      @if (field.minItems || field.maxItems) {
        <div class="mt-3 text-xs text-gray-500 flex justify-between">
          <span>
            العناصر: {{ arrayFormGroups.length }}
            @if (field.minItems && field.maxItems) {
              ({{ field.minItems }} - {{ field.maxItems }})
            } @else if (field.minItems) {
              (الحد الأدنى: {{ field.minItems }})
            } @else if (field.maxItems) {
              (الحد الأقصى: {{ field.maxItems }})
            }
          </span>
          
          @if (isMaxItemsReached()) {
            <span class="text-orange-600">تم الوصول للحد الأقصى</span>
          }
        </div>
      }

      <!-- Help Text -->
      @if (field.description) {
        <p class="mt-3 text-sm text-gray-500">{{ field.description }}</p>
      }
    </div>
  `
})
export class FieldArrayManagerComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  arrayFormArray!: FormArray;
  arrayFormGroups: FormGroup[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Validate arrayFields exist
    if (!this.field.arrayFields || !Array.isArray(this.field.arrayFields)) {
      console.error('Array manager field must have arrayFields configuration');
      return;
    }

    // Initialize FormArray
    this.arrayFormArray = this.fb.array([], this.getArrayValidators());
    
    // Add to parent form
    this.parentForm.addControl(this.field.value, this.arrayFormArray);
    
    // Initialize with minimum required items
    if (this.field.minItems && this.field.minItems > 0) {
      for (let i = 0; i < this.field.minItems; i++) {
        this.addArrayItem();
      }
    }
  }

  /**
   * Add new array item
   */
  addArrayItem(): void {
    if (this.isMaxItemsReached()) {
      return;
    }

    // Create new FormGroup for this array item
    const newItemGroup = this.fb.group({});
    
    // Add to FormArray
    this.arrayFormArray.push(newItemGroup);
    
    // Add to tracking array
    this.arrayFormGroups.push(newItemGroup);
    
    console.log(`Added array item ${this.arrayFormGroups.length}:`, newItemGroup);
  }

  /**
   * Remove array item at specific index
   */
  removeArrayItem(index: number): void {
    if (this.isMinItemsReached() || index < 0 || index >= this.arrayFormGroups.length) {
      return;
    }

    // Remove from FormArray
    this.arrayFormArray.removeAt(index);
    
    // Remove from tracking array
    this.arrayFormGroups.splice(index, 1);
    
    // Mark as touched for validation
    this.arrayFormArray.markAsTouched();
    
    console.log(`Removed array item at index ${index}`);
  }

  /**
   * Check if maximum items limit is reached
   */
  isMaxItemsReached(): boolean {
    return this.field.maxItems ? this.arrayFormGroups.length >= this.field.maxItems : false;
  }

  /**
   * Check if minimum items limit is reached
   */
  isMinItemsReached(): boolean {
    return this.field.minItems ? this.arrayFormGroups.length <= this.field.minItems : this.arrayFormGroups.length <= 0;
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