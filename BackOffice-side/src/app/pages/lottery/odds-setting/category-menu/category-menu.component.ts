import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'lottery-category-menu',
  templateUrl: './category-menu.component.html',
  styleUrls: ['./category-menu.component.scss'],
  standalone: true,
  imports: [NgIf, MatTabsModule, NgFor, AngularSvgIconModule, LangPipe],
})
export class CategoryMenuComponent implements OnInit {
  constructor(
    private lotteryApi: LotteryApi,
    private lang: LangService
  ) {}

  menus = [
    { name: '快乐彩', lang: 'lotto.keno' },
    { name: '世界乐透', lang: 'lotto.worldLotto' },
    { name: '时时彩', lang: 'lotto.ssc' },
    { name: 'PK拾', lang: 'lotto.pk' },
    { name: '快3', lang: 'lotto.k3' },
    { name: '11选5', lang: 'lotto.choose5' },
    { name: '双色球', lang: 'lotto.doubleBall' },
    { name: '越南彩', lang: 'lotto.vlotto' },
    { name: '3D', lang: 'lotto.3D' },
  ];

  currentSourceCode: number | string = 0; // 当前盘口代码
  currentData: any; // 当前选中菜单盘口数据
  currentMenu: any; // 当前选中菜单
  currentSubMenu = 0;
  @Output() lotteryChange = new EventEmitter();

  ngOnInit(): void {
    this.currentMenu = this.menus[0].name;
    this.getLotteryName();
  }

  changeMenuIndex(GameName: any) {
    this.currentMenu = GameName;
    this.getLotteryName();
  }

  changeSubMenu(id: any) {
    if (id === this.currentSubMenu) return;
    this.currentSubMenu = id;
    const data = this.currentData.find((cur) => cur.lotteryId === id);
    this.lotteryChange.emit(data);
  }

  getLotteryName() {
    this.lotteryApi.lotterySetupGetlotteryBylotteryType(this.currentMenu).subscribe((res) => {
      this.currentData = res.data;
      this.currentSubMenu = res.data && res.data[0] && res.data[0].lotteryId;
      this.lotteryChange.emit(res.data && res.data[0]);
    });
  }
}
