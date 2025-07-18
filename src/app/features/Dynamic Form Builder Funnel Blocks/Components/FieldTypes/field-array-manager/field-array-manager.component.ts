import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../../Model/formfields';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-field-array-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DynamicFieldComponent
  ],
  templateUrl: './field-array-manager.component.html',
})
export class FieldArrayManagerComponent implements OnInit {
  @Input() field!: FormField;
  @Input() parentForm!: FormGroup;

  arrayFormArray!: FormArray;
  arrayFormGroups: FormGroup[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.arrayFormArray = this.fb.array([]);
    this.parentForm.addControl(this.field.value, this.arrayFormArray);

    Promise.resolve().then(() => {
      if (this.field.minItems && this.field.minItems > 0) {
        for (let i = 0; i < this.field.minItems; i++) {
          this.addArrayItem();
        }
      }
    });
  }

  addArrayItem(): void {
    if (this.isMaxItemsReached()) return;

    const newItemGroup = this.fb.group({});
    this.arrayFormArray.push(newItemGroup);
    this.arrayFormGroups.push(newItemGroup);
  }

  removeArrayItem(index: number): void {
    if (this.isMinItemsReached()) return;

    if (index >= 0 && index < this.arrayFormGroups.length) {
      this.arrayFormArray.removeAt(index);
      this.arrayFormGroups.splice(index, 1);
    }
  }

  isMaxItemsReached(): boolean {
    if (!this.field.maxItems) return false;
    return this.arrayFormGroups.length >= this.field.maxItems;
  }

  isMinItemsReached(): boolean {
    if (!this.field.minItems) return this.arrayFormGroups.length <= 0;
    return this.arrayFormGroups.length <= this.field.minItems;
  }

  hasMinimumItems(): boolean {
    if (!this.field.minItems) return true;
    return this.arrayFormGroups.length >= this.field.minItems;
  }
}