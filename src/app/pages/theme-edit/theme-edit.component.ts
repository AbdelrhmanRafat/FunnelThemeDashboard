import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Theme, UpdateThemeRequest } from '../../models/theme.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './theme-edit.component.html',
  styleUrl: './theme-edit.component.scss'
})
export class ThemeEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  theme: Theme | null = null;
  themeForm: FormGroup;
  isLoading = false;
  isLoadingTheme = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  themeId: number = 0;

  constructor() {
    this.themeForm = this.fb.group({
      name_ar: ['', [Validators.required, Validators.minLength(2)]],
      name_en: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]],
      description_ar: ['', [Validators.required, Validators.minLength(10)]],
      description_en: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true],
      image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      preview_url: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.themeId = +id;
      this.loadTheme();
    } else {
      this.router.navigate(['/theme-list']);
    }
  }

  loadTheme(): void {
    this.isLoadingTheme = true;
    this.themeService.getTheme(this.themeId).subscribe({
      next: (theme) => {
        if (theme) {
          this.theme = theme;
          this.populateForm();
        } else {
          this.showMessage('Theme not found', 'error');
          setTimeout(() => {
            this.router.navigate(['/theme-list']);
          }, 2000);
        }
        this.isLoadingTheme = false;
      },
      error: (error) => {
        this.showMessage('Failed to load theme', 'error');
        this.isLoadingTheme = false;
        console.error('Error loading theme:', error);
      }
    });
  }

  populateForm(): void {
    if (this.theme) {
      this.themeForm.patchValue({
        name_ar: this.theme.name_ar,
        name_en: this.theme.name_en,
        key: this.theme.key,
        description_ar: this.theme.description_ar,
        description_en: this.theme.description_en,
        is_active: this.theme.is_active === 1,
        image: this.theme.image,
        preview_url: this.theme.preview_url || ''
      });
    }
  }

  onSubmit(): void {
    if (this.themeForm.valid && this.theme) {
      this.isLoading = true;
      const formData = this.themeForm.value;
      
      const updateData: UpdateThemeRequest = {
        id: this.theme.id,
        ...formData,
        is_active: formData.is_active ? 1 : 0,
        preview_url: formData.preview_url || null
      };

      this.themeService.updateTheme(updateData).subscribe({
        next: (updatedTheme) => {
          this.theme = updatedTheme;
          this.showMessage('Theme updated successfully!', 'success');
          this.isLoading = false;
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to update theme', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/theme-list']);
  }

  resetForm(): void {
    this.populateForm();
    this.message = '';
  }

  deleteTheme(): void {
    if (!this.theme) return;

    const confirmMessage = `Are you sure you want to delete "${this.theme.name}"? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.themeService.deleteTheme(this.theme.id).subscribe({
        next: () => {
          this.showMessage('Theme deleted successfully', 'success');
          setTimeout(() => {
            this.router.navigate(['/theme-list']);
          }, 2000);
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to delete theme', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  viewTheme(): void {
    if (this.theme) {
      this.router.navigate(['/dashboard', this.theme.id]);
    }
  }

  generateKeyFromName(): void {
    const nameEn = this.themeForm.get('name_en')?.value;
    if (nameEn) {
      const key = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      this.themeForm.patchValue({ key });
    }
  }

  previewImage(): void {
    const imageUrl = this.themeForm.get('image')?.value;
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  previewTheme(): void {
    const previewUrl = this.themeForm.get('preview_url')?.value;
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.themeForm.controls).forEach(key => {
      const control = this.themeForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      if (type === 'error') {
        this.message = '';
      }
    }, 5000);
  }

  // Getter methods for form validation
  get nameAr() { return this.themeForm.get('name_ar'); }
  get nameEn() { return this.themeForm.get('name_en'); }
  get key() { return this.themeForm.get('key'); }
  get descriptionAr() { return this.themeForm.get('description_ar'); }
  get descriptionEn() { return this.themeForm.get('description_en'); }
  get image() { return this.themeForm.get('image'); }
  get previewUrl() { return this.themeForm.get('preview_url'); }
}