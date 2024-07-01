import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MOCK_BETTING_INFO } from './betting-Info.mock';

@UntilDestroy()
@Component({
  selector: 'app-betting-Info',
  templateUrl: './betting-Info.component.html',
  styleUrls: ['./betting-Info.component.scss'],
})
export class BettingInfoComponent implements OnInit {
  constructor(private appService: AppService, private layout: LayoutService) {}

  isH5!: boolean;
  selectedIndex: number = 1;
  logined!: boolean;
  selectValue: number = 10;
  selectOptions = [
    { text: 10, value: 10 },
    { text: 20, value: 20 },
    { text: 30, value: 30 },
    { text: 40, value: 40 },
  ];

  listData: any[] = MOCK_BETTING_INFO;

  ngOnInit() {
    //订阅是否h5，改变轮播图数据
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    // 订阅当前登录账号信息判断是否已登录
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(v => (this.logined = !!v));
  }

  onSelect() {
    //
  }

  selectedTabChange(event: MatTabChangeEvent) {
    // console.log(event.index)
  }
}
