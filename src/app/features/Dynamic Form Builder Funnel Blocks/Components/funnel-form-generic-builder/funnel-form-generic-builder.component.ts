import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DynamicFieldComponent } from '../FieldTypes/dynamic-field/dynamic-field.component';
import { FormBlock, FormConfiguration } from '../../Model/formfields';
import { FieldArrayManagerComponent } from '../FieldTypes/field-array-manager/field-array-manager.component';
import { BlocksService } from '../../../../core/services/blocks.service';
import { BlockKey } from '../../../../models/theme.classic.blocks';

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
  
  // Output event to notify parent component of successful form submission
  @Output() formSubmitted = new EventEmitter<{blockKey: string, data: any}>();
  
  dynamicForm!: FormGroup;
  currentBlock!: FormBlock;
  isLoading = true;
  errorMessage = '';
  
  // Inject blocks service and toastr
  private blocksService = inject(BlocksService);
  private toastr = inject(ToastrService);
  
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
    
    // Build form controls first
    this.buildFormControls();
    
    // Use microtask to avoid expression changed error and populate initial data
    queueMicrotask(() => {
      this.populateFormWithInitialData();
      this.cdr.detectChanges();
    });
  }

  /**
   * Build form controls based on the current block's form fields
   * NOTE: Let the individual field components create their own controls
   */
  private buildFormControls(): void {
    if (!this.currentBlock?.formFields) return;
    
    // Start with empty form - let child components add their own controls
    this.dynamicForm = this.fb.group({});
    
    console.log('🏗️ Empty form initialized - child components will add controls');
    console.log('📋 Expected fields:', this.currentBlock.formFields.map(f => f.value));
  }

  /**
   * Build validators for a field
   */
  private buildValidators(field: any): any[] {
    const validators: any[] = [];
    
    // Check if field is required
    if (field.required || field.validation?.required) {
      validators.push(Validators.required);
    }
    
    // Add other validators based on field configuration
    if (field.validation) {
      if (field.validation.minLength) {
        validators.push(Validators.minLength(field.validation.minLength));
      }
      if (field.validation.maxLength) {
        validators.push(Validators.maxLength(field.validation.maxLength));
      }
      if (field.validation.pattern) {
        validators.push(Validators.pattern(field.validation.pattern));
      }
      if (field.validation.email) {
        validators.push(Validators.email);
      }
      if (field.validation.min) {
        validators.push(Validators.min(field.validation.min));
      }
      if (field.validation.max) {
        validators.push(Validators.max(field.validation.max));
      }
    }
    
    return validators;
  }

  /**
   * Get default value based on field type
   */
  private getDefaultValueByType(fieldType: string): any {
    switch (fieldType) {
      case 'checkbox':
        return false;
      case 'number':
        return 0;
      case 'array':
      case 'array-manager':
        return [];
      case 'select-multiple':
        return [];
      default:
        return '';
    }
  }

  /**
   * Populate form with initial data from block session storage
   */
  private populateFormWithInitialData(): void {
    if (!this.initialData || !this.dynamicForm) {
      console.log('⚠️ No initial data or form not ready');
      return;
    }

    try {
      // Wait longer for child components to register their controls
      setTimeout(() => {
        console.log('📝 Populating form with initial data...');
        console.log('Available form controls:', Object.keys(this.dynamicForm.controls));
        console.log('Initial data to populate:', this.initialData);
        
        // Store original initial data for comparison
        this.storeOriginalInitialData();
        
        // Check if controls exist before patching
        const availableControls = Object.keys(this.dynamicForm.controls);
        if (availableControls.length === 0) {
          console.warn('⚠️ No form controls available yet - retrying in 500ms');
          setTimeout(() => this.populateFormWithInitialData(), 500);
          return;
        }
        
        // Patch form values with initial data
        this.dynamicForm.patchValue(this.initialData, { emitEvent: true });
        
        // Mark form as pristine AFTER a delay to ensure all child components are updated
        setTimeout(() => {
          this.dynamicForm.markAsPristine();
          console.log('✅ Form marked as pristine after population');
        }, 100);
        
        console.log('✅ Form populated successfully');
        console.log('Form value after population:', this.dynamicForm.value);
        
        // Subscribe to form changes to debug
        this.subscribeToFormChanges();
        
      }, 1000); // Increased timeout to ensure child components are ready
      
    } catch (error) {
      console.warn('⚠️ Failed to populate form with initial data:', error);
    }
  }

  private originalInitialData: any = null;

  /**
   * Store a deep copy of initial data for accurate comparison
   */
  private storeOriginalInitialData(): void {
    this.originalInitialData = JSON.parse(JSON.stringify(this.initialData));
  }

  /**
   * Subscribe to form value changes for debugging
   */
  private subscribeToFormChanges(): void {
    this.dynamicForm.valueChanges.subscribe(value => {
      console.log('🔄 Form value changed:', value);
      console.log('📊 Form dirty status:', this.dynamicForm.dirty);
      console.log('📈 Form touched status:', this.dynamicForm.touched);
    });
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
   * Handle form submission - Print submitted data to console and update blocks service
   */
  onSubmit(): void {
    // Force mark form as dirty to test
    console.log('🧪 Pre-submit form status check:');
    console.log('Form dirty before submit:', this.dynamicForm.dirty);
    console.log('Form touched before submit:', this.dynamicForm.touched);
    
    // Check if any individual controls are dirty
    const dirtyControls: string[] = [];
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control?.dirty) {
        dirtyControls.push(key);
      }
    });
    console.log('Dirty controls:', dirtyControls);
    
    // Debug form structure before submission
    this.debugFormStructure();
    
    if (this.dynamicForm.valid) {
      const formData = this.dynamicForm.value;
      
      // Clear console and print submitted data
      console.clear();
      console.log('🚀 ===== FORM SUBMITTED =====');
      console.log('📋 Block Name:', this.currentBlock.name);
      console.log('🔑 Block Key:', this.blockKey);
      console.log('📊 Form Data:', formData);
      console.log('💾 Initial Data:', this.initialData);
      console.log('🗂️ Original Initial Data:', this.originalInitialData);
      console.log('🔄 Changes Made:', this.getFormChanges());
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('🏗️ Form Controls:', Object.keys(this.dynamicForm.controls));
      console.log('✅ Form Valid:', this.dynamicForm.valid);
      console.log('🔄 Form Dirty:', this.dynamicForm.dirty);
      console.log('👆 Form Touched:', this.dynamicForm.touched);
      console.log('🎯 Dirty Controls:', dirtyControls);
      console.log('================================');
      
      // Update blocks service with new data
      this.updateBlockInService(formData);
      
      // Save to sessionStorage (keeping the old method for compatibility)
      this.saveToSessionStorage(formData);
      
      // Emit event to parent component
      this.formSubmitted.emit({
        blockKey: this.blockKey,
        data: formData
      });
      
    } else {
      console.warn('⚠️ Form is invalid - cannot submit');
      console.warn('❌ Form errors:', this.getFormErrors());
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Update the block in the blocks service with the new form data
   */
  private updateBlockInService(formData: any): void {
    try {
      console.log('🔄 Updating block in service...');
      
      // Show loading toastr
      const loadingToast = this.toastr.info('Updating block data...', 'Please wait', {
        disableTimeOut: true,
        closeButton: true
      });
      
      // Update the block using the blocks service
      this.blocksService.updateBlock(this.blockKey as BlockKey, formData).subscribe({
        next: (result) => {
          // Clear loading toast
          this.toastr.clear(loadingToast.toastId);
          
          if (result.success) {
            console.log('✅ Block updated successfully in service:', result.message);
            console.log('📦 Updated block data:', result.data);
            
            // Show success toastr
            this.toastr.success(
              `Block "${this.currentBlock.name}" has been updated successfully!`, 
              'Update Successful', 
              {
                timeOut: 4000,
                progressBar: true,
                closeButton: true,
                positionClass: 'toast-top-right'
              }
            );
            
            // Mark form as pristine after successful save
            this.dynamicForm.markAsPristine();
            
            // Update the original initial data to reflect the new saved state
            this.originalInitialData = JSON.parse(JSON.stringify(formData));
            
          } else {
            console.error('❌ Failed to update block in service');
            this.toastr.error(
              'Failed to update block. Please try again.', 
              'Update Failed',
              {
                timeOut: 5000,
                progressBar: true,
                closeButton: true
              }
            );
          }
        },
        error: (error) => {
          // Clear loading toast
          this.toastr.clear(loadingToast.toastId);
          
          console.error('❌ Error updating block in service:', error);
          
          // Show error toastr
          this.toastr.error(
            error.message || 'An unexpected error occurred while updating the block.', 
            'Update Error',
            {
              timeOut: 6000,
              progressBar: true,
              closeButton: true,
              positionClass: 'toast-top-right'
            }
          );
        }
      });
      
    } catch (error) {
      console.error('❌ Exception while updating block in service:', error);
      this.toastr.error(
        'A critical error occurred. Please refresh the page and try again.', 
        'Critical Error',
        {
          timeOut: 0, // Don't auto-close
          closeButton: true
        }
      );
    }
  }

  /**
   * Debug form structure and values
   */
  debugFormStructure(): void {
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form controls:', Object.keys(this.dynamicForm.controls));
    console.log('Form value:', this.dynamicForm.value);
    console.log('Form valid:', this.dynamicForm.valid);
    console.log('Form dirty:', this.dynamicForm.dirty);
    console.log('Form errors:', this.getFormErrors());
    console.log('Expected fields:', this.currentBlock?.formFields?.map(f => ({ key: f.value, type: f.type })));
    console.log('Initial data:', this.initialData);
    
    // Check each control individually
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      console.log(`Control [${key}]:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        dirty: control?.dirty,
        touched: control?.touched
      });
    });
  }

  /**
   * Get form validation errors
   */
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
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
    
    // Use original initial data for comparison if available
    const comparisonData = this.originalInitialData || this.initialData;
    
    console.log('🔍 Comparing data:');
    console.log('Current form data:', currentData);
    console.log('Original initial data:', comparisonData);
    
    // Compare each field in current data
    for (const key in currentData) {
      const currentValue = currentData[key];
      const initialValue = this.getValueFromObject(comparisonData, key);
      
      console.log(`Comparing field [${key}]:`, {
        current: currentValue,
        initial: initialValue,
        changed: this.hasValueChanged(currentValue, initialValue)
      });
      
      if (this.hasValueChanged(currentValue, initialValue)) {
        changes[key] = {
          from: initialValue,
          to: currentValue
        };
      }
    }
    
    console.log('📊 Detected changes:', changes);
    
    return Object.keys(changes).length > 0 ? changes : { note: 'No changes detected' };
  }

  /**
   * Get value from object with better null/undefined handling
   */
  private getValueFromObject(obj: any, key: string): any {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    
    // Support nested field access (e.g., 'data.title_ar')
    const keys = key.split('.');
    let value = obj;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Check if a value has changed (handles arrays and objects)
   */
  private hasValueChanged(current: any, initial: any): boolean {
    // Handle null/undefined
    if (current === initial) return false;
    if ((current == null) !== (initial == null)) return true;
    
    // Handle arrays
    if (Array.isArray(current) && Array.isArray(initial)) {
      return JSON.stringify(current) !== JSON.stringify(initial);
    }
    
    // Handle objects
    if (typeof current === 'object' && typeof initial === 'object') {
      return JSON.stringify(current) !== JSON.stringify(initial);
    }
    
    return current !== initial;
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
      this.dynamicForm.markAsPristine();
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

    // First check if form is dirty
    if (this.dynamicForm.dirty) {
      return true;
    }

    // Also check by comparing values
    const changes = this.getFormChanges();
    const hasValueChanges = changes && typeof changes === 'object' && !changes.note;
    
    console.log('🔍 Checking unsaved changes:', {
      formDirty: this.dynamicForm.dirty,
      hasValueChanges,
      changes
    });
    
    return hasValueChanges;
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

  /**
   * Method to manually add a form control (useful for array-manager components)
   */
  addFormControl(name: string, control: any): void {
    this.dynamicForm.addControl(name, control);
    console.log(`➕ Added form control: ${name}`);
  }

  /**
   * Method to remove a form control
   */
  removeFormControl(name: string): void {
    this.dynamicForm.removeControl(name);
    console.log(`➖ Removed form control: ${name}`);
  }

  /**
   * Get a specific form control
   */
  getFormControl(name: string): any {
    return this.dynamicForm.get(name);
  }
}