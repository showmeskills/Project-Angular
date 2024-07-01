import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'sports-category-menu',
  templateUrl: './category-menu.component.html',
  styleUrls: ['./category-menu.component.scss'],
  standalone: true,
  imports: [NgIf, MatTabsModule, NgFor, AngularSvgIconModule],
})
export class CategoryMenuComponent implements OnInit {
  constructor() {}

  menus = [
    { name: '足球', value: 999 },
    { name: '篮球', value: 99 },
    { name: '棒球', value: 12 },
    { name: '冰上曲棍球', value: 9 },
    { name: '网球', value: 17 },
    { name: '手球', value: 28 },
    { name: '地板球', value: 17 },
    { name: '英式橄榄球', value: 28 },
    { name: '澳洲足球', value: 17 },
    { name: '班迪球', value: 28 },
    { name: '英式足球', value: 17 },
    { name: '乒乓球', value: 28 },
  ];

  currentData: any; // 当前选中菜单盘口数据
  currentMenu = ''; // 当前选中菜单

  @Output() sportsChange = new EventEmitter();

  ngOnInit(): void {
    this.currentMenu = this.menus[0].name;
    this.getSportsName();
  }

  changeMenuIndex(GameName: any) {
    this.currentMenu = GameName;
    this.getSportsName();
  }

  getSportsName() {
    this.sportsChange.emit(this.currentMenu);
  }
}
