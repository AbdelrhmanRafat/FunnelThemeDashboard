import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-select',
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

      <!-- Select Field -->
      <select
        [formControl]="fieldControl"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        [class.border-red-500]="fieldControl.invalid && fieldControl.touched"
        [class.focus:ring-red-500]="fieldControl.invalid && fieldControl.touched"
        [class.focus:border-red-500]="fieldControl.invalid && fieldControl.touched"
      >
        <option value="" disabled>-- Select {{ field.label }} --</option>
        
        @for (option of field.options || []; track option) {
          <option [value]="option">{{ option }}</option>
        }
      </select>

      <!-- Error Messages -->
      @if (fieldControl.invalid && fieldControl.touched) {
        <div class="mt-1 text-sm text-red-600">
          @if (fieldControl.errors?.['required']) {
            <p>{{ field.label }} is required</p>
          }
        </div>
      }

      <!-- Help Text -->
      @if (field.description) {
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ field.description }}</p>
      }
    </div>
  `
})
export class FieldSelectComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;

  ngOnInit(): void {
    const validators = this.buildValidators();

    this.fieldControl = new FormControl(
      { value: this.field.defaultValue || '', disabled: !!this.field.readonly },
      validators
    );

    this.parentForm.addControl(this.field.value, this.fieldControl);
  }

  private buildValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }
    return validators;
  }
}