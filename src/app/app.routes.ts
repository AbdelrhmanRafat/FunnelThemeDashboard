import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.page';
import { AddNewThemeComponent } from './pages/add-new-theme/add-new-theme.component';
import { ThemeListComponent } from './pages/theme-list/theme-list.component';
import { ThemeEditComponent } from './pages/theme-edit/theme-edit.component';
import { BlockDashboardComponent } from './pages/block-dashboard/block-dashboard.component';
import { TestFormsComponent } from './pages/test-forms/test-forms.component';
import { ClassicThemeComponent } from './pages/classic-theme/classic-theme.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-new-theme', component: AddNewThemeComponent },
  { path: 'classic', component: ClassicThemeComponent },
  { path: 'test-forms', component: TestFormsComponent },
  { path: 'theme-list', component: ThemeListComponent },
  { path: 'dashboard/:id', component: BlockDashboardComponent },
  {path : 'theme-edit/:id' , component : ThemeEditComponent},
  { path: '**', redirectTo: '' }
];
