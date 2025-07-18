import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-select',
  imports : [ReactiveFormsModule],
  standalone: true,
  templateUrl: './field-select.component.html',
})
export class FieldSelectComponent implements OnInit {
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

    return validators;
  }
}