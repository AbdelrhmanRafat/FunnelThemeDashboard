import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../../Model/formfields';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-field-array-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DynamicFieldComponent  // This is key - allows nested dynamic fields
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
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          (click)="addArrayItem()"
        >
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
              class="text-red-500 hover:text-red-700 text-sm"
              (click)="removeArrayItem(i)"
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
    console.log('Array fields:', this.field.arrayFields);

    // Create FormArray
    this.arrayFormArray = this.fb.array([]);
    
    // Add to parent form
    this.parentForm.addControl(this.field.value, this.arrayFormArray);
    
    // Add minimum required items
    if (this.field.minItems && this.field.minItems > 0) {
      for (let i = 0; i < this.field.minItems; i++) {
        this.addArrayItem();
      }
    }
  }

  addArrayItem(): void {
    console.log('Adding new array item');
    
    // Create new FormGroup for this array item
    const newItemGroup = this.fb.group({});
    
    // Add to FormArray
    this.arrayFormArray.push(newItemGroup);
    
    // Add to tracking array
    this.arrayFormGroups.push(newItemGroup);
    
    console.log(`Added item ${this.arrayFormGroups.length}:`, newItemGroup);
  }

  removeArrayItem(index: number): void {
    console.log('Removing array item at index:', index);
    
    if (index >= 0 && index < this.arrayFormGroups.length) {
      // Remove from FormArray
      this.arrayFormArray.removeAt(index);
      
      // Remove from tracking array
      this.arrayFormGroups.splice(index, 1);
    }
  }
}