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
  templateUrl: './field-array-manager.component.html',
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