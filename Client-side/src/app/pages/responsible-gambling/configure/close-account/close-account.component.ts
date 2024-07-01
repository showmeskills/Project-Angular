import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
@UntilDestroy()
@Component({
  selector: 'app-close-account',
  templateUrl: './close-account.component.html',
  styleUrls: ['./close-account.component.scss'],
  host: { class: 'container' },
})
export class CloseAccountComponent implements OnInit {
  constructor(private popup: PopupService, private layout: LayoutService, private localeService: LocaleService) {}

  isH5!: boolean;

  /**@selectTime 选择时间 */
  selectTime: any[] = [
    {
      name: '1周',
      time: 0,
    },
    {
      name: '1个月',
      time: 0,
    },
    {
      name: '3个月',
      time: 0,
    },
    {
      name: '6个月',
      time: 0,
    },
    {
      name: '12个月',
      time: 0,
    },
    {
      name: '无期限',
      time: 0,
    },
  ];

  /**@customizedTime 自定义时间 */
  customizedTime!: string;

  /**@activeIdx 激活的下标 */
  activeIdx!: number;

  /**@selectReason 选择理由 */
  selectReason: any[] = [
    { name: '没有空暇时间，例如：度假，准备考试', value: 'a' },
    { name: '对于网络博彩失去了兴趣', value: 'b' },
    { name: '对于你们的服务/产品不满意', value: 'c' },
    { name: '对于你们的优惠不满意', value: 'd' },
    { name: '希望（或已经）选择另一家博彩公司', value: 'e' },
    { name: '不想说明', value: 'f' },
  ];

  /**@selectedReason 选择理由 */
  selectedReason: string = '';

  /**@isFirstStep 是否是第一步 */
  isFirstStep: boolean = true;

  /**@passwordString 密码 */
  passwordString: string = '';

  /**@isReadySubmit */
  isReadySubmit: boolean = false;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**@onDateValueChange  customized time date picker*/
  onDateValueChange() {}

  /**
   * @param idx
   * @onSelectTime 选择日期
   * @idx  下标
   */
  onSelectTime(idx: number) {
    this.activeIdx = idx;
  }

  /**@openTimeSelectorDialog 自定义选择时间弹窗 */
  @ViewChild('timeSelectorDialog') timeSelectorDialog!: TemplateRef<any>;
  closeDialog: any;
  openTimeSelectorDialog() {
    this.closeDialog = this.popup.open(this.timeSelectorDialog, {
      inAnimation: this.isH5 ? 'fadeInUp' : undefined,
      outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
      position: this.isH5 ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
    });
  }

  /**@saveDialog  保存自定义时间 */
  saveDialog() {
    this.closeDialog.close();
  }

  /**@continue 点击继续按钮 */
  onContinue() {
    this.popup.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: '确认是否进行关闭账户',
        description: '关闭账户后 您的的所有服务将会暂停只可以进行余额提现操作',
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
    return this.isReadySubmit;
  }
}
