import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
@UntilDestroy()
@Component({
  selector: 'app-remind',
  templateUrl: './remind.component.html',
  styleUrls: ['./remind.component.scss'],
  host: { class: 'container' },
})
export class RemindComponent implements OnInit {
  constructor(private layout: LayoutService) {}

  isH5!: boolean;

  /**@selectTime 选择时间 */
  selectTime: any[] = [
    {
      name: '10分钟',
      time: 0,
    },
    {
      name: '20分钟',
      time: 0,
    },
    {
      name: '30分钟',
      time: 0,
    },
    {
      name: '1小时',
      time: 0,
    },
    {
      name: '2小时',
      time: 0,
    },
    {
      name: '3小时',
      time: 0,
    },
    {
      name: '无提醒',
      time: 0,
    },
  ];

  /**@activeIdx 激活的下标 */
  activeIdx!: number;

  /**@passwordString 密码 */
  passwordString: string = '';

  /**@isReadySubmit */
  isReadySubmit: boolean = false;

  /**@isFirstStep 是否是第一步 */
  isFirstStep: boolean = true;

  /**@remindString 提示文字 */
  remindString: string = '无提醒';

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**
   * @param idx
   * @onSelectTime 选择日期
   * @idx  下标
   */
  onSelectTime(idx: number) {
    this.activeIdx = idx;
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

  /**@continue 点击继续按钮 */
  onContinue() {
    this.remindString = this.selectTime[this.activeIdx].name;
    this.isFirstStep = !this.isFirstStep;
  }
}
