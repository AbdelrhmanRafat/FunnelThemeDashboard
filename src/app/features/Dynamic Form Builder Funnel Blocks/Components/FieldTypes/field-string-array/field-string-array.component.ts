import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-string-array',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './field-string-array.component.html',
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