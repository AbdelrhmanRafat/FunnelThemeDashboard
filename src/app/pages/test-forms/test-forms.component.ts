// test-forms.component.ts
import { Component } from '@angular/core';
import { FunnelFormGenericBuilderComponent } from '../../features/Dynamic Form Builder Funnel Blocks/Components/funnel-form-generic-builder/funnel-form-generic-builder.component';

@Component({
  selector: 'app-test-forms',
  standalone: true,
  imports: [FunnelFormGenericBuilderComponent],
  template: `
    <div class="p-6 space-y-8">
      <h1 class="text-3xl font-bold">Dynamic Form Testing</h1>
      
      <!-- Test Block 1: Simple Block -->
      <div class="border p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Test 1: Classic Header</h2>
        <app-funnel-form-generic-builder 
          blockKey="classic_header">
        </app-funnel-form-generic-builder>
      </div>
      
      <!-- Test Block 2: Complex Block -->
      <div class="border p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Test 2: Classic Reviews</h2>
        <app-funnel-form-generic-builder 
          blockKey="classic_reviews">
        </app-funnel-form-generic-builder>
      </div>
      
      <!-- Test Block 3: Array Manager -->
      <div class="border p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Test 3: Order Confirmation Notice</h2>
        <app-funnel-form-generic-builder 
          blockKey="classic_order_confirmation_notice">
        </app-funnel-form-generic-builder>
      </div>
    </div>
  `
})
export class TestFormsComponent {}