import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ThemeBuilderComponent } from '../theme-builder/theme-builder.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ThemeBuilderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  showProductFeature = true;
}
