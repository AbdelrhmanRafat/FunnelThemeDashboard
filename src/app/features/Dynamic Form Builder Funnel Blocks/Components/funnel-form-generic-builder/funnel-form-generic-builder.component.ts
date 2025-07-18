import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicFieldComponent } from '../FieldTypes/dynamic-field/dynamic-field.component';
import { FormBlock, FormConfiguration } from '../../Model/formfields';

@Component({
  selector: 'app-funnel-form-generic-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DynamicFieldComponent
  ],
  templateUrl: './funnel-form-generic-builder.component.html',
  styleUrl: './funnel-form-generic-builder.component.scss'
})
export class FunnelFormGenericBuilderComponent implements OnInit {
  @Input() blockKey!: string; // e.g., "classic_header", "classic_reviews"
  @Input() configPath: string = 'Json/classicBlocks-form.config.json'; // Path to JSON file
  
  // Form and data properties
  dynamicForm!: FormGroup;
  currentBlock!: FormBlock;
  isLoading = true;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadFormConfiguration();
  }
  
  /**
   * Initialize empty form group
   */
  private initializeForm(): void {
    this.dynamicForm = this.fb.group({});
  }
  
  /**
   * Load form configuration from JSON file
   */
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
  
  /**
   * Handle successful configuration load
   */
  private handleConfigurationLoaded(config: FormConfiguration): void {
    if (!this.blockKey) {
      this.errorMessage = 'Block key is required';
      this.isLoading = false;
      return;
    }
    
    // Get the specific block from configuration
    this.currentBlock = config[this.blockKey];
    
    if (!this.currentBlock) {
      this.errorMessage = `Block "${this.blockKey}" not found in configuration`;
      this.isLoading = false;
      return;
    }
    
    // Validate block structure
    if (!this.currentBlock.formFields || !Array.isArray(this.currentBlock.formFields)) {
      this.errorMessage = `Block "${this.blockKey}" has invalid formFields`;
      this.isLoading = false;
      return;
    }
    
    this.isLoading = false;
    console.log(`Loaded block: ${this.currentBlock.name}`, this.currentBlock);
  }
  
  /**
   * Handle configuration load error
   */
  private handleConfigurationError(error: any): void {
    console.error('Failed to load form configuration:', error);
    this.errorMessage = 'Failed to load form configuration. Please check the JSON file path and format.';
    this.isLoading = false;
  }
  
  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      const formData = this.dynamicForm.value;
      console.log('Form submitted:', formData);
      
      // Here you can process the form data
      // e.g., send to API, save to storage, etc.
      this.handleFormSubmission(formData);
    } else {
      console.log('Form is invalid');
      this.markAllFieldsAsTouched();
    }
  }
  
  /**
   * Handle form data submission - Simple console log and sessionStorage
   */
  private handleFormSubmission(formData: any): void {
    // Console log the submitted data
    console.log('=== FORM SUBMITTED ===');
    console.log('Block:', this.currentBlock.name);
    console.log('Data:', formData);
    console.log('=====================');
    
    // Save to sessionStorage (optional)
    try {
      const storageKey = `formData_${this.blockKey}`;
      const submissionData = {
        blockKey: this.blockKey,
        blockName: this.currentBlock.name,
        data: formData,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem(storageKey, JSON.stringify(submissionData));
      console.log(`Saved to sessionStorage: ${storageKey}`);
      
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }
  
  /**
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control) {
        control.markAsTouched();
        
        // Handle FormArray controls
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }
  
  /**
   * Recursively mark FormGroup controls as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }
  
  /**
   * Reset the form to initial state
   */
  resetForm(): void {
    this.dynamicForm.reset();
    console.log('Form reset');
  }
  
  /**
   * Get form validation status
   */
  get isFormValid(): boolean {
    return this.dynamicForm.valid;
  }
  
  /**
   * Get form data
   */
  get formData(): any {
    return this.dynamicForm.value;
  }
  
  /**
   * Check if form has been modified
   */
  get isFormDirty(): boolean {
    return this.dynamicForm.dirty;
  }
}