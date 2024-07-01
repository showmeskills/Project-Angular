import { Component, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    AngularSvgIconModule,
    FormRowComponent,
    FormsModule,
    FormWrapComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgIf,
  ],
})
export class MatchComponent implements OnInit {
  constructor(public modal: MatModalRef<MatchComponent, boolean>) {}

  curStepValue: any = 1;
  stepList: any[] = [
    { name: '搜寻联赛', value: 1 },
    { name: '基本资料', value: 2 },
    { name: '返还率/风险', value: 3 },
    { name: '队伍列表', value: 4 },
    { name: '完成匹配', value: 5 },
  ];

  //  一：搜索联赛
  leagueSearch: any = '';
  type: any = 1;
  typeList: any[] = [
    { name: '匹配', value: 1 },
    { name: '新建', value: 2 },
  ];

  // 二：
  season: any = 1;
  seasonList: any[] = [
    { name: '2021/2022', value: 1 },
    { name: '2020/2021', value: 2 },
    { name: '2019/2020', value: 3 },
  ];

  ngOnInit() {}

  stepEnter() {
    ++this.curStepValue;
  }

  stepReturn() {
    --this.curStepValue;
  }
}
