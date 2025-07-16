import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.page';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
