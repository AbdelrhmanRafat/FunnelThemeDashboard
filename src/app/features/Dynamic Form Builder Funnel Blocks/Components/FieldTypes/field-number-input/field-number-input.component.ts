import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-number-input',
  imports : [ReactiveFormsModule],
  standalone: true,
  templateUrl: './field-number-input.component.html',
})
export class FieldNumberInputComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;

  ngOnInit(): void {
    const validators = this.buildValidators();
    this.fieldControl = new FormControl(this.field.defaultValue ?? null, validators);
    this.parentForm.addControl(this.field.value, this.fieldControl);
  }

  private buildValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }

    if (this.field.min !== undefined) {
      validators.push(Validators.min(this.field.min));
    }

    if (this.field.max !== undefined) {
      validators.push(Validators.max(this.field.max));
    }

    return validators;
  }
}