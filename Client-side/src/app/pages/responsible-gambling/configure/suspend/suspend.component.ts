import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-suspend',
  templateUrl: './suspend.component.html',
  styleUrls: ['./suspend.component.scss'],
  host: { class: 'container' },
})
export class SuspendComponent implements OnInit {
  constructor(private layout: LayoutService, private popup: PopupService, private localeService: LocaleService) {}

  isH5!: boolean;

  /**@navList 头部导航 */
  navList: any[] = ['创建暂停', '当前暂停设置'];

  /**@activeRecordIdx 记录导航下标 */
  activeRecordIdx: number = 0;

  /**@selecTime 时间选择 */
  selecTime: any[] = [
    {
      name: '24小时',
      time: 0,
    },
    {
      name: '48小时',
      time: 0,
    },
    {
      name: '7天',
      time: 0,
    },
    {
      name: '30天',
      time: 0,
    },
  ];

  /**@activeTimeIdx 激活的时间下标 */
  activeTimeIdx!: number;

  /**@passwordString 密码 */
  passwordString: string = '';

  /**@isReadySubmit */
  isReadySubmit: boolean = false;

  /**@isFirstStep 是否是第一步 */
  isFirstStep: boolean = true;

  /**@custmisedTime 可否继续 */
  custmisedTime = {
    startDate: '',
    endDate: '',
  };

  /**@isShowCutomizedDateRange 显示自定义的时间范围 */
  isShowCutomizedDateRange: boolean = false;

  /**@isShowInfo 未先泽时间显示提示 */
  isShowInfo: boolean = true;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**
   * @param event
   * @onValueChange 密码input
   */
  onValueChange(event: any) {
    this.passwordString = event;
    event.length > 0 ? (this.isReadySubmit = true) : (this.isReadySubmit = false);
  }

  /**
   * @param idx
   * @onClickRecord 点击记录导航
   *  @idx 下标
   */
  onClickRecord(idx: number) {
    this.activeRecordIdx = idx;
  }

  /**
   * @param idx
   * @onSelectTime 选择时间
   * @idx 下标
   */
  onSelectTime(idx: number) {
    this.activeTimeIdx = idx;
    this.isShowCutomizedDateRange = false;
    this.isShowInfo = false;
  }

  /**
   * @openTimeSelectorDialog 打开自定义时间弹窗
   */
  @ViewChild('customizedTimeDialog') customizedTimeDialog!: TemplateRef<any>;
  closeDialog: any;
  openTimeSelectorDialog() {
    this.closeDialog = this.popup.open(this.customizedTimeDialog, {
      inAnimation: this.isH5 ? 'fadeInUp' : undefined,
      outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
      position: this.isH5 ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
    });
  }

  /**@continue 点击继续按钮 */
  onContinue() {
    this.popup.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: '确认是否进行暂停',
        description: '暂停后会再您选择的时间段里限制您登陆本平台',
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
      },
    });
  }

  /**@onCancel 点击取消按钮 */
  onCancel() {
    this.isFirstStep = !this.isFirstStep;
    this.isShowCutomizedDateRange = !this.isShowCutomizedDateRange;
    this.isShowInfo = !this.isShowInfo;
    this.custmisedTime = {
      startDate: '',
      endDate: '',
    };
    this.activeTimeIdx = -1;
  }

  /**@canSubmit 是否可以提交 */
  canSubmit() {
    return this.isReadySubmit;
  }

  /**@canContinue 是否可以继续 */
  canContinue() {
    return !this.isShowInfo;
  }

  /**@saveDialog  保存自定义时间 */
  saveDialog() {
    this.closeDialog.close();
    this.isShowCutomizedDateRange = true;
    this.isShowInfo = false;
    this.activeTimeIdx = -1;
  }

  /**@onDateValueChange 自定义日期事件 */
  onDateValueChange() {}

  /**@canSaveDialog 可以保存自定义时间 */
  canSaveDialog(): boolean {
    return !!this.custmisedTime.startDate && !!this.custmisedTime.endDate;
  }
}
