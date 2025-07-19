import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
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
export class FunnelFormGenericBuilderComponent implements OnInit, OnChanges {
  @Input() blockKey!: string;
  @Input() initialData: any = null; // New input for initial form data
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

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in blockKey or initialData
    if (changes['blockKey'] && !changes['blockKey'].firstChange) {
      this.loadFormConfiguration();
    }
    
    if (changes['initialData'] && !changes['initialData'].firstChange && this.dynamicForm) {
      this.populateFormWithInitialData();
    }
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
    
    // Use microtask to avoid expression changed error and populate initial data
    queueMicrotask(() => {
      this.populateFormWithInitialData();
      this.cdr.detectChanges();
    });
  }

  /**
   * Populate form with initial data from block session storage
   */
  private populateFormWithInitialData(): void {
    if (!this.initialData || !this.dynamicForm) {
      return;
    }

    try {
      // Patch form values with initial data
      this.dynamicForm.patchValue(this.initialData);
      
      console.log('📝 Form populated with initial data:', {
        blockKey: this.blockKey,
        initialData: this.initialData,
        formValue: this.dynamicForm.value
      });
      
    } catch (error) {
      console.warn('⚠️ Failed to populate form with initial data:', error);
    }
  }

  /**
   * Get initial value for a specific field from initialData
   */
  getInitialFieldValue(fieldKey: string): any {
    if (!this.initialData) {
      return null;
    }

    // Support nested field access (e.g., 'data.title_ar')
    const keys = fieldKey.split('.');
    let value = this.initialData;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Check if initial data exists for this block
   */
  hasInitialData(): boolean {
    return this.initialData !== null && typeof this.initialData === 'object';
  }
  
  private handleConfigurationError(error: any): void {
    this.errorMessage = 'Failed to load form configuration. Please check the JSON file path and format.';
    this.isLoading = false;
    console.error('Form configuration error:', error);
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
      console.log('💾 Initial Data:', this.initialData);
      console.log('🔄 Changes Made:', this.getFormChanges());
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('================================');
      
      // Save to sessionStorage
      this.saveToSessionStorage(formData);
      
    } else {
      console.warn('⚠️ Form is invalid - cannot submit');
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Compare initial data with current form data to show changes
   */
  private getFormChanges(): any {
    if (!this.hasInitialData()) {
      return { note: 'No initial data to compare' };
    }

    const currentData = this.dynamicForm.value;
    const changes: any = {};
    
    // Simple comparison (can be enhanced for nested objects)
    for (const key in currentData) {
      if (currentData[key] !== this.getInitialFieldValue(key)) {
        changes[key] = {
          from: this.getInitialFieldValue(key),
          to: currentData[key]
        };
      }
    }
    
    return Object.keys(changes).length > 0 ? changes : { note: 'No changes detected' };
  }

  /**
   * Save form data to session storage
   */
  private saveToSessionStorage(formData: any): void {
    try {
      const storageKey = `formData_${this.blockKey}`;
      const submissionData = {
        blockKey: this.blockKey,
        blockName: this.currentBlock.name,
        data: formData,
        initialData: this.initialData,
        changes: this.getFormChanges(),
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem(storageKey, JSON.stringify(submissionData));
      console.log('💾 Saved to sessionStorage:', storageKey);
      
    } catch (error) {
      console.error('❌ Failed to save to sessionStorage:', error);
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
    if (this.hasInitialData()) {
      // Reset to initial data instead of empty values
      this.dynamicForm.reset();
      this.populateFormWithInitialData();
      console.log('🔄 Form reset to initial data');
    } else {
      // Standard reset
      this.dynamicForm.reset();
      console.log('🔄 Form reset to empty values');
    }
  }

  /**
   * Reset form to original initial data
   */
  resetToInitialData(): void {
    if (this.hasInitialData()) {
      this.dynamicForm.patchValue(this.initialData);
      console.log('⏪ Form reset to initial data');
    }
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

  /**
   * Check if form has changes compared to initial data
   */
  get hasUnsavedChanges(): boolean {
    if (!this.hasInitialData()) {
      return this.isFormDirty;
    }

    const changes = this.getFormChanges();
    return changes && typeof changes === 'object' && !changes.note;
  }

  /**
   * Get form data ready for block session storage format
   */
  getFormattedData(): any {
    return {
      ...this.formData,
      _meta: {
        blockKey: this.blockKey,
        lastModified: new Date().toISOString(),
        hasChanges: this.hasUnsavedChanges
      }
    };
  }
}