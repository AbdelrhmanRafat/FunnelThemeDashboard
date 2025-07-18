import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import * as icons from 'lucide-angular';
import { FormField } from '../../../Model/formfields';

@Component({
  selector: 'app-field-icon-selector',
  standalone: true,
  imports: [LucideAngularModule,ReactiveFormsModule],
  templateUrl: './field-icon-selector.component.html',
})
export class FieldIconSelectorComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  fieldControl!: FormControl;
  availableIcons = Object.keys(icons).slice(0, 50); // خذ أول 50 أيقونة مثلاً

  ngOnInit(): void {
    this.fieldControl = new FormControl(this.field.defaultValue || '', this.field.required ? Validators.required : []);
    this.parentForm.addControl(this.field.value, this.fieldControl);
  }
}