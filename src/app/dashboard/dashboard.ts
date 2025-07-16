import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { ThemeBuilderComponent } from '../theme-builder/theme-builder';
import { ProductFeatureComponent } from '../product-feature/product-feature';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ThemeBuilderComponent, ProductFeatureComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  showProductFeature = true;
}
