import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-image-upload',
  standalone: true,
  templateUrl: './field-image-upload.component.html',
})
export class FieldImageUploadComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;
  previewUrl: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    this.fieldControl = new FormControl(this.field.defaultValue || null, this.field.required ? Validators.required : []);
    this.parentForm.addControl(this.field.value, this.fieldControl);
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fieldControl.setValue(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}