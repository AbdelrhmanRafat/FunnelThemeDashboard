import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../../Model/formfields';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

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
        <label class="block text-sm font-medium text-gray-700">
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
          Add Item
        </button>
      </div>

      <!-- Array Items -->
      @for (itemFormGroup of arrayFormGroups; track itemFormGroup; let i = $index) {
        <div class="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          
          <!-- Item Header -->
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-medium text-gray-700">
              Item {{ i + 1 }}
            </h4>
            
            <button
              type="button"
              class="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              (click)="removeArrayItem(i)"
              [disabled]="isMinItemsReached()"
            >
              Remove
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

      <!-- Empty State -->
      @if (arrayFormGroups.length === 0) {
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p class="text-gray-500 text-sm">No items yet</p>
          <p class="text-gray-400 text-xs">Click "Add Item" to start</p>
        </div>
      }

      <!-- Items Count Info -->
      @if (field.minItems || field.maxItems) {
        <div class="mt-3 text-xs text-gray-500 flex justify-between items-center">
          <span>
            Items: {{ arrayFormGroups.length }}
            @if (field.minItems && field.maxItems) {
              ({{ field.minItems }} - {{ field.maxItems }})
            } @else if (field.minItems) {
              (Min: {{ field.minItems }})
            } @else if (field.maxItems) {
              (Max: {{ field.maxItems }})
            }
          </span>
          
          @if (isMaxItemsReached()) {
            <span class="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs">
              Maximum items reached
            </span>
          }
          
          @if (isMinItemsReached() && arrayFormGroups.length > 0) {
            <span class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
              Minimum items required
            </span>
          }
        </div>
      }

      <!-- Required field validation -->
      @if (field.required && arrayFormGroups.length === 0) {
        <div class="mt-2 text-sm text-red-600">
          At least one item is required
        </div>
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
    console.log('Array Manager initialized for:', this.field.label);
    console.log('Min items:', this.field.minItems);
    console.log('Max items:', this.field.maxItems);

    // Create FormArray
    this.arrayFormArray = this.fb.array([]);
    
    // Add to parent form
    this.parentForm.addControl(this.field.value, this.arrayFormArray);
    
    // Defer adding minimum required items to avoid expression changed error
    Promise.resolve().then(() => {
      if (this.field.minItems && this.field.minItems > 0) {
        for (let i = 0; i < this.field.minItems; i++) {
          this.addArrayItem();
        }
      }
    });
  }

  addArrayItem(): void {
    // Check if we can add more items
    if (this.isMaxItemsReached()) {
      console.warn('Cannot add more items: maximum limit reached');
      return;
    }

    console.log('Adding new array item');
    
    // Create new FormGroup for this array item
    const newItemGroup = this.fb.group({});
    
    // Add to FormArray
    this.arrayFormArray.push(newItemGroup);
    
    // Add to tracking array
    this.arrayFormGroups.push(newItemGroup);
    
    console.log(`Added item ${this.arrayFormGroups.length}/${this.field.maxItems || 'unlimited'}:`, newItemGroup);
  }

  removeArrayItem(index: number): void {
    // Check if we can remove items
    if (this.isMinItemsReached()) {
      console.warn('Cannot remove item: minimum limit reached');
      return;
    }

    console.log('Removing array item at index:', index);
    
    if (index >= 0 && index < this.arrayFormGroups.length) {
      // Remove from FormArray
      this.arrayFormArray.removeAt(index);
      
      // Remove from tracking array
      this.arrayFormGroups.splice(index, 1);
      
      console.log(`Removed item. Remaining: ${this.arrayFormGroups.length}/${this.field.minItems || 0} minimum`);
    }
  }

  /**
   * Check if maximum items limit is reached
   */
  isMaxItemsReached(): boolean {
    if (!this.field.maxItems) {
      return false; // No limit
    }
    return this.arrayFormGroups.length >= this.field.maxItems;
  }

  /**
   * Check if we're at minimum items limit (can't remove more)
   */
  isMinItemsReached(): boolean {
    if (!this.field.minItems) {
      return this.arrayFormGroups.length <= 0; // Can't go below 0
    }
    return this.arrayFormGroups.length <= this.field.minItems;
  }

  /**
   * Check if the current number of items satisfies minimum requirement
   */
  hasMinimumItems(): boolean {
    if (!this.field.minItems) {
      return true; // No minimum required
    }
    return this.arrayFormGroups.length >= this.field.minItems;
  }

  /**
   * Get current status for debugging
   */
  getStatus(): string {
    const current = this.arrayFormGroups.length;
    const min = this.field.minItems || 0;
    const max = this.field.maxItems || '∞';
    return `${current} items (${min}-${max})`;
  }
}