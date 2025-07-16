import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.page';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddNewThemeComponent } from './pages/add-new-theme/add-new-theme.component';
import { ThemeListComponent } from './pages/theme-list/theme-list.component';
import { ThemeEditComponent } from './pages/theme-edit/theme-edit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-new-theme', component: AddNewThemeComponent },
  { path: 'theme-list', component: ThemeListComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  {path : 'theme-edit/:id' , component : ThemeEditComponent},
  { path: '**', redirectTo: '' }
];
