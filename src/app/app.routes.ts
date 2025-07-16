import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
