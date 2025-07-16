import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateThemeRequest } from '../../models/theme.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-add-new-theme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-new-theme.component.html',
  styleUrl: './add-new-theme.component.scss'
})
export class AddNewThemeComponent {
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  themeForm: FormGroup;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor() {
    this.themeForm = this.fb.group({
      name_ar: ['', [Validators.required, Validators.minLength(2)]],
      name_en: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      description_ar: ['', [Validators.required, Validators.minLength(10)]],
      description_en: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true],
      image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      preview_url: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  onSubmit(): void {
    if (this.themeForm.valid) {
      this.isLoading = true;
      const formData = this.themeForm.value;
      
      const themeData: CreateThemeRequest = {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
        preview_url: formData.preview_url || null
      };

      this.themeService.createTheme(themeData).subscribe({
        next: (newTheme) => {
          this.showMessage('Theme created successfully!', 'success');
          this.isLoading = false;
          
          // Navigate to home after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to create theme', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onReset(): void {
    this.themeForm.reset({
      is_active: true
    });
    this.message = '';
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  // Generate key from English name
  generateKey(): void {
    const nameEn = this.themeForm.get('name_en')?.value;
    if (nameEn) {
      const key = nameEn
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      this.themeForm.patchValue({ key });
    }
  }

  // Preview image
  previewImage(): void {
    const imageUrl = this.themeForm.get('image')?.value;
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.themeForm.controls).forEach(key => {
      this.themeForm.get(key)?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // Getters for form validation
  get nameAr() { return this.themeForm.get('name_ar'); }
  get nameEn() { return this.themeForm.get('name_en'); }
  get key() { return this.themeForm.get('key'); }
  get descriptionAr() { return this.themeForm.get('description_ar'); }
  get descriptionEn() { return this.themeForm.get('description_en'); }
  get image() { return this.themeForm.get('image'); }
  get previewUrl() { return this.themeForm.get('preview_url'); }
}