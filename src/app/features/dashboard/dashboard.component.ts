import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ThemeBuilderComponent } from '../theme-builder/theme-builder.component';
import { ProductFeatureComponent } from '../../components/product-feature/product-feature.component';


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
