import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FunnelFormGenericBuilderComponent } from '../../features/Dynamic Form Builder Funnel Blocks/Components/funnel-form-generic-builder/funnel-form-generic-builder.component';
import { FormConfiguration, FormBlock } from '../../features/Dynamic Form Builder Funnel Blocks/Model/formfields';

@Component({
  selector: 'app-test-forms',
  standalone: true,
  imports: [FunnelFormGenericBuilderComponent],
  template: `
    <div class="p-6 space-y-8">
      <h1 class="text-3xl font-bold mb-8">Dynamic Form Testing - All Blocks</h1>

      @if (isLoading) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading form blocks...</span>
        </div>
      }

      @if (errorMessage && !isLoading) {
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
      }

      @if (formBlocks.length > 0 && !isLoading) {
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
          <h2 class="text-lg font-semibold text-blue-800 mb-2">Found {{ formBlocks.length }} Form Blocks</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            @for (block of formBlocks; track block.key) {
              <span class="text-sm text-blue-800 bg-white px-2 py-1 rounded border">
                {{ block.name }}
              </span>
            }
          </div>
        </div>
      }

      @for (block of formBlocks; track block.key; let i = $index) {
        <div class="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
          <div class="mb-6 pb-4 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 mb-1">
                  {{ i + 1 }}. {{ block.name }}
                </h2>
                <p class="text-sm text-gray-600">
                  Key: <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ block.key }}</code>
                  • Fields: {{ block.formFields.length }}
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Block {{ i + 1 }} of {{ formBlocks.length }}
                </span>
              </div>
            </div>
          </div>

          <app-funnel-form-generic-builder 
            [blockKey]="block.key">
          </app-funnel-form-generic-builder>
        </div>
      }

      @if (formBlocks.length === 0 && !isLoading && !errorMessage) {
        <div class="text-center py-12">
          <p class="text-gray-500">No form blocks found in configuration.</p>
        </div>
      }
    </div>
  `
})
export class TestFormsComponent implements OnInit {
  formBlocks: FormBlock[] = [];
  isLoading = true;
  errorMessage = '';
  configPath = 'assets/classic/Json/classicBlocks-form.config.json';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllFormBlocks();
  }

  private loadAllFormBlocks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<FormConfiguration>(this.configPath).subscribe({
      next: (config) => this.handleConfigurationLoaded(config),
      error: (error) => this.handleConfigurationError(error)
    });
  }

  private handleConfigurationLoaded(config: FormConfiguration): void {
    try {
      this.formBlocks = Object.keys(config).map(key => {
        const block = config[key];
        if (!block.key || !block.name || !Array.isArray(block.formFields)) {
          throw new Error(`Invalid block structure for key: ${key}`);
        }
        return block;
      });

      this.formBlocks.sort((a, b) => a.name.localeCompare(b.name));
      this.isLoading = false;
    } catch (error) {
      this.handleConfigurationError(error);
    }
  }

  private handleConfigurationError(error: any): void {
    this.errorMessage = 'Failed to load form blocks. Please check the JSON file.';
    this.isLoading = false;
  }

  getBlockByKey(key: string): FormBlock | undefined {
    return this.formBlocks.find(block => block.key === key);
  }

  get totalFieldCount(): number {
    return this.formBlocks.reduce((total, block) => total + block.formFields.length, 0);
  }

  getBlocksByCategory(category: string): FormBlock[] {
    return this.formBlocks.filter(block =>
      block.name.toLowerCase().includes(category.toLowerCase())
    );
  }
}