import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Theme } from '../models/theme.model';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  themes$: Observable<Theme[]> | undefined;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themes$ = this.themeService.getThemes();
  }
}
