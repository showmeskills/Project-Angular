import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeTableComponent } from './theme-table/theme-table.component';
import { TypeTableComponent } from './type-table/type-table.component';
@Component({
  selector: 'theme',
  standalone: true,
  imports: [CommonModule, ThemeTableComponent, TypeTableComponent],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent {
  constructor() {}
}
