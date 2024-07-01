import { Component, OnInit } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgIf,
    MatTabsModule,
    NgFor,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
  ],
})
export class EditComponent implements OnInit {
  constructor() {}

  currentTab: any = 1; // 当前选中
  tabs = [
    { name: '本场概况', value: 1 },
    { name: '首发阵容', value: 2 },
    { name: 'Events信息', value: 3 },
  ];

  eventChange: any = 1;
  eventChangeList = [{ name: '新增', value: 1 }];

  objects: any = 1;
  objectsList = [{ name: '客队', value: 1 }];

  event: any = 1;
  eventList = [{ name: '角球', value: 1 }];

  time: any = 6;

  ngOnInit() {}

  changeTabIndex(tabValue: any) {
    this.currentTab = tabValue;
  }

  onEdit() {}
  getSettlement() {}
}
