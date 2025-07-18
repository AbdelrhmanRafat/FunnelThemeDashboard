import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicFieldComponent } from '../FieldTypes/dynamic-field/dynamic-field.component';
import { FormBlock, FormConfiguration } from '../../Model/formfields';
import { FieldArrayManagerComponent } from '../FieldTypes/field-array-manager/field-array-manager.component';

@Component({
  selector: 'app-funnel-form-generic-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldArrayManagerComponent,
    DynamicFieldComponent
  ],
  templateUrl: './funnel-form-generic-builder.component.html',
  styleUrl: './funnel-form-generic-builder.component.scss'
})
export class FunnelFormGenericBuilderComponent implements OnInit {
  @Input() blockKey!: string;
  @Input() configPath: string = 'assets/classic/Json/classicBlocks-form.config.json';
  
  dynamicForm!: FormGroup;
  currentBlock!: FormBlock;
  isLoading = true;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadFormConfiguration();
  }
  
  private initializeForm(): void {
    this.dynamicForm = this.fb.group({});
  }
  
  private loadFormConfiguration(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<FormConfiguration>(this.configPath).subscribe({
      next: (config) => {
        this.handleConfigurationLoaded(config);
      },
      error: (error) => {
        this.handleConfigurationError(error);
      }
    });
  }
  
  private handleConfigurationLoaded(config: FormConfiguration): void {
    if (!this.blockKey) {
      this.errorMessage = 'Block key is required';
      this.isLoading = false;
      return;
    }
    
    this.currentBlock = config[this.blockKey];
    
    if (!this.currentBlock) {
      this.errorMessage = `Block "${this.blockKey}" not found in configuration`;
      this.isLoading = false;
      return;
    }
    
    if (!this.currentBlock.formFields || !Array.isArray(this.currentBlock.formFields)) {
      this.errorMessage = `Block "${this.blockKey}" has invalid formFields`;
      this.isLoading = false;
      return;
    }
    
    this.isLoading = false;
    
    // Use microtask to avoid expression changed error
    queueMicrotask(() => {
      this.cdr.detectChanges();
    });
  }
  
  private handleConfigurationError(error: any): void {
    this.errorMessage = 'Failed to load form configuration. Please check the JSON file path and format.';
    this.isLoading = false;
  }
  
  /**
   * Handle form submission - Print submitted data to console
   */
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      const formData = this.dynamicForm.value;
      
      // Clear console and print submitted data
      console.clear();
      console.log('🚀 ===== FORM SUBMITTED =====');
      console.log('📋 Block Name:', this.currentBlock.name);
      console.log('🔑 Block Key:', this.blockKey);
      console.log('📊 Form Data:', formData);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('================================');
      
      // Save to sessionStorage
      try {
        const storageKey = `formData_${this.blockKey}`;
        const submissionData = {
          blockKey: this.blockKey,
          blockName: this.currentBlock.name,
          data: formData,
          timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem(storageKey, JSON.stringify(submissionData));
        console.log('💾 Saved to sessionStorage:', storageKey);
        
      } catch (error) {
        console.error('❌ Failed to save to sessionStorage:', error);
      }
      
    } else {
      console.warn('⚠️ Form is invalid - cannot submit');
      this.markAllFieldsAsTouched();
    }
  }
  
  private markAllFieldsAsTouched(): void {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
  resetForm(): void {
    this.dynamicForm.reset();
  }
  
  get isFormValid(): boolean {
    return this.dynamicForm.valid;
  }
  
  get formData(): any {
    return this.dynamicForm.value;
  }
  
  get isFormDirty(): boolean {
    return this.dynamicForm.dirty;
  }
}