import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormField, FieldType } from '../../../Model/formfields';
import { FieldArrayManagerComponent } from '../field-array-manager/field-array-manager.component';
import { FieldIconSelectorComponent } from '../field-icon-selector/field-icon-selector.component';
import { FieldImageArrayComponent } from '../field-image-array-upload/field-image-array-upload.component';
import { FieldImageUploadComponent } from '../field-image-upload/field-image-upload.component';
import { FieldNumberInputComponent } from '../field-number-input/field-number-input.component';
import { FieldSelectComponent } from '../field-select/field-select.component';
import { FieldStringArrayComponent } from '../field-string-array/field-string-array.component';
import { FieldTextInputComponent } from '../field-text-input/field-text-input.component';
import { FieldTextareaComponent } from '../field-textarea/field-textarea.component';
import { FieldUrlInputComponent } from '../field-url-input/field-url-input.component';



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
    FieldImageArrayComponent,
    FieldUrlInputComponent,
    FieldStringArrayComponent
  ],
  templateUrl: './dynamic-field.component.html'
})
export class DynamicFieldComponent implements OnInit {
  ngOnInit() : void {    
    if (this.field.type === FieldType.SELECT) {
      console.log('📋 SELECT field detected:', this.field);
      console.log('📋 SELECT options:', this.field.options);
    }
  }  
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;
  
  // Expose FieldType enum to template
  FieldType = FieldType;
}