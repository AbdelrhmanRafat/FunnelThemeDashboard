import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Theme } from '../../models/theme.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './theme-list.component.html',
  styleUrl: './theme-list.component.scss'
})
export class ThemeListComponent implements OnInit {
  private themeService = inject(ThemeService);
  private router = inject(Router);

  themes: Theme[] = [];
  filteredThemes: Theme[] = [];
  searchQuery = '';
  selectedThemes: number[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortField: keyof Theme = 'updated_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filters
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor() { }

  ngOnInit(): void {
    this.loadThemes();
  }

  loadThemes(): void {
    this.isLoading = true;
    this.themeService.getThemes().subscribe({
      next: (themes) => {
        this.themes = themes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Failed to load themes', 'error');
        this.isLoading = false;
        console.error('Error loading themes:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.themes];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(theme => 
        theme.name_ar.toLowerCase().includes(query) ||
        theme.name_en.toLowerCase().includes(query) ||
        theme.key.toLowerCase().includes(query) ||
        theme.description_ar.toLowerCase().includes(query) ||
        theme.description_en.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      const activeStatus = this.statusFilter === 'active' ? 1 : 0;
      filtered = filtered.filter(theme => theme.is_active === activeStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredThemes = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  sortBy(field: keyof Theme): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  editTheme(themeId: number): void {
    
    this.router.navigate(['theme-edit', themeId]);
  }

  deleteTheme(themeId: number): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return;

    const confirmMessage = `Are you sure you want to delete "${theme.name}"? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.themeService.deleteTheme(themeId).subscribe({
        next: () => {
          this.showMessage('Theme deleted successfully', 'success');
          this.loadThemes();
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to delete theme', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  toggleThemeStatus(themeId: number): void {
    this.themeService.toggleThemeStatus(themeId).subscribe({
      next: (updatedTheme) => {
        const index = this.themes.findIndex(t => t.id === themeId);
        if (index !== -1) {
          this.themes[index] = updatedTheme;
          this.applyFilters();
        }
        this.showMessage('Theme status updated successfully', 'success');
      },
      error: (error) => {
        this.showMessage(error.message || 'Failed to update theme status', 'error');
      }
    });
  }

  viewTheme(themeId: number): void {
    this.router.navigate(['/dashboard', themeId]);
  }

  // Bulk operations
  toggleThemeSelection(themeId: number): void {
    const index = this.selectedThemes.indexOf(themeId);
    if (index > -1) {
      this.selectedThemes.splice(index, 1);
    } else {
      this.selectedThemes.push(themeId);
    }
  }

  selectAllThemes(): void {
    const currentPageThemes = this.getPaginatedThemes().map(t => t.id);
    if (this.selectedThemes.length === currentPageThemes.length) {
      this.selectedThemes = [];
    } else {
      this.selectedThemes = [...currentPageThemes];
    }
  }

  bulkDelete(): void {
    if (this.selectedThemes.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${this.selectedThemes.length} selected theme(s)? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      let deletedCount = 0;
      let errors = 0;

      this.selectedThemes.forEach(themeId => {
        this.themeService.deleteTheme(themeId).subscribe({
          next: () => {
            deletedCount++;
            if (deletedCount + errors === this.selectedThemes.length) {
              this.completeBulkOperation(deletedCount, errors);
            }
          },
          error: () => {
            errors++;
            if (deletedCount + errors === this.selectedThemes.length) {
              this.completeBulkOperation(deletedCount, errors);
            }
          }
        });
      });
    }
  }

  bulkToggleStatus(): void {
    if (this.selectedThemes.length === 0) return;

    this.isLoading = true;
    let updatedCount = 0;
    let errors = 0;

    this.selectedThemes.forEach(themeId => {
      this.themeService.toggleThemeStatus(themeId).subscribe({
        next: (updatedTheme) => {
          const index = this.themes.findIndex(t => t.id === themeId);
          if (index !== -1) {
            this.themes[index] = updatedTheme;
          }
          updatedCount++;
          if (updatedCount + errors === this.selectedThemes.length) {
            this.completeBulkStatusUpdate(updatedCount, errors);
          }
        },
        error: () => {
          errors++;
          if (updatedCount + errors === this.selectedThemes.length) {
            this.completeBulkStatusUpdate(updatedCount, errors);
          }
        }
      });
    });
  }

  private completeBulkOperation(successCount: number, errorCount: number): void {
    this.selectedThemes = [];
    this.loadThemes();
    
    if (errorCount === 0) {
      this.showMessage(`${successCount} theme(s) deleted successfully`, 'success');
    } else {
      this.showMessage(`${successCount} theme(s) deleted, ${errorCount} failed`, 'error');
    }
  }

  private completeBulkStatusUpdate(successCount: number, errorCount: number): void {
    this.selectedThemes = [];
    this.applyFilters();
    this.isLoading = false;
    
    if (errorCount === 0) {
      this.showMessage(`${successCount} theme(s) status updated successfully`, 'success');
    } else {
      this.showMessage(`${successCount} theme(s) updated, ${errorCount} failed`, 'error');
    }
  }

  // Pagination
  getPaginatedThemes(): Theme[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredThemes.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/']);
  }

  addNewTheme(): void {
    this.router.navigate(['/add-new-theme']);
  }

  // Utility methods
  isThemeSelected(themeId: number): boolean {
    return this.selectedThemes.includes(themeId);
  }

  areAllCurrentPageThemesSelected(): boolean {
    const currentPageThemes = this.getPaginatedThemes().map(t => t.id);
    return currentPageThemes.length > 0 && 
           currentPageThemes.every(id => this.selectedThemes.includes(id));
  }

  getStatusBadgeClass(theme: Theme): string {
    return theme.is_active === 1 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  getSortIcon(field: keyof Theme): string {
    if (this.sortField !== field) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}