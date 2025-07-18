import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-url-input',
  imports : [ReactiveFormsModule],
  standalone: true,
  templateUrl: './field-url-input.component.html',
})
export class FieldUrlInputComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;

  ngOnInit(): void {
    const validators = [Validators.pattern(/https?:\/\/[^\s$.?#].[^\s]*$/)];
    if (this.field.required && !this.field.nullable) {
      validators.push(Validators.required);
    }

    this.fieldControl = new FormControl(this.field.defaultValue || '', validators);
    this.parentForm.addControl(this.field.value, this.fieldControl);
  }
}