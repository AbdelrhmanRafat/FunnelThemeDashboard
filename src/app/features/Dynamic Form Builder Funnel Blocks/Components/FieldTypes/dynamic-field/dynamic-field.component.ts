import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormField, FieldType } from '../../../Model/formfields';
import { FieldIconSelectorComponent } from '../field-icon-selector/field-icon-selector.component';
import { FieldImageArrayComponent } from '../field-image-array-upload/field-image-array-upload.component';
import { FieldImageUploadComponent } from '../field-image-upload/field-image-upload.component';
import { FieldNumberInputComponent } from '../field-number-input/field-number-input.component';
import { FieldSelectComponent } from '../field-select/field-select.component';
import { FieldTextInputComponent } from '../field-text-input/field-text-input.component';
import { FieldTextareaComponent } from '../field-textarea/field-textarea.component';
import { FieldUrlInputComponent } from '../field-url-input/field-url-input.component';
import { FieldStringArrayComponent } from '../field-string-array/field-string-array.component';


@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [
    FieldTextInputComponent,
    FieldTextareaComponent,
    FieldNumberInputComponent,
    FieldSelectComponent,
    FieldIconSelectorComponent,
    FieldImageUploadComponent,
    FieldUrlInputComponent,
    FieldImageArrayComponent,
    FieldStringArrayComponent
  ],
  templateUrl: './dynamic-field.component.html'
})
export class DynamicFieldComponent {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;
  
  // Expose FieldType enum to template
  FieldType = FieldType;
}