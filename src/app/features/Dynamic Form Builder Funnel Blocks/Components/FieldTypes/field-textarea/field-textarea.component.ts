import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-textarea',
  imports : [ReactiveFormsModule],
  standalone: true,
  templateUrl: './field-textarea.component.html',
})
export class FieldTextareaComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;

  ngOnInit(): void {
    const validators = this.buildValidators();
    this.fieldControl = new FormControl(this.field.defaultValue || '', validators);
    this.parentForm.addControl(this.field.value, this.fieldControl);
  }

  private buildValidators(): ValidatorFn[] {
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

    if (this.field.pattern) {
      validators.push(Validators.pattern(this.field.pattern));
    }

    return validators;
  }
}