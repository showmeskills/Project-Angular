import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-self-prohibit',
  templateUrl: './self-prohibit.component.html',
  styleUrls: ['./self-prohibit.component.scss'],
  host: { class: 'container' },
})
export class SelfProhibitComponent implements OnInit {
  constructor(private popup: PopupService, private layout: LayoutService, private localeService: LocaleService) {}

  isH5!: boolean;

  /**@selectTime 时间 */
  selectTime: any[] = [
    {
      name: '6个月',
      time: 0,
    },
    {
      name: '1年',
      time: 0,
    },
    {
      name: '2年',
      time: 0,
    },
    {
      name: '5年',
      time: 0,
    },
  ];

  /**@activeIdx 选择时间激活下标 */
  activeIdx!: number;

  /**@gameList  checkbox 选项*/
  gameList: any[] = [
    {
      name: '体育投注',
      value: false,
    },
    {
      name: '娱乐场',
      value: false,
    },
    {
      name: '棋牌',
      value: false,
    },
    {
      name: '彩票',
      value: false,
    },
  ];

  /**@selectedTiming 选择的时间 */
  selectedTiming: string = '';

  /**@isFirstStep 是否是第一步 */
  isFirstStep: boolean = true;

  /**@passwordString 密码 */
  passwordString: string = '';

  /**@isReadySubmit */
  isReadySubmit: boolean = false;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**
   * @param idx
   * @onSelectTime 时间选择
   * @idx 下标
   */
  onSelectTime(idx: number) {
    this.activeIdx = idx;
    this.selectedTiming = this.selectTime[idx].name;
  }

  /**
   * @param idx
   * @selectedGame 选择游戏
   * @idx 下标
   */
  selectedGame(idx: number) {
    this.gameList = this.gameList.map((list, i) => {
      if (i == idx) list.value = !list.value;
      return list;
    });
  }

  /**@continue 点击继续按钮 */
  onContinue() {
    this.popup.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: '确认是否进行自我禁止',
        description: '会限制您游玩您选择自我禁止的产品',
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
      },
    });
  }

  /**
   * @param event
   * @onValueChange 密码input
   */
  onValueChange(event: any) {
    this.passwordString = event;
    event.length > 0 ? (this.isReadySubmit = true) : (this.isReadySubmit = false);
  }

  /**@onCancel 点击取消按钮 */
  onCancel() {
    this.isFirstStep = !this.isFirstStep;
  }

  /**@canSubmit 是否可以提交 */
  canSubmit() {
    return this.isReadySubmit && this.activeIdx !== undefined;
  }

  /**@canContinue 是否可以继续操作 */
  canContinue() {
    return this.gameList.filter(list => list.value === true).length > 0 && this.activeIdx !== undefined;
  }
}
