// classic-theme.component.ts
import { Component, computed, inject, OnInit } from '@angular/core';
import { BlocksService } from '../../core/services/blocks.service';
import { BlockSessionStorage } from '../../models/theme.classic.blocks';
import { ClassicHeaderComponent } from "./Blocks/classic-header/classic-header.component";

@Component({
  selector: 'app-classic-theme',
  standalone: true,
  imports: [ClassicHeaderComponent],
  templateUrl: './classic-theme.component.html',
  styleUrl: './classic-theme.component.scss'
})
export class ClassicThemeComponent {

}
