import { Component, HostListener, Inject, Input, OnInit, Optional, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, Subscription, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { LocaleService } from '../../service/locale.service';

type popType = 'warn' | 'success';

interface Buttons {
  text: string;
  primary: boolean;
  wait?: boolean;
  waitTime?: number;
}

export interface StandardPopupData {
  title?: string; //标题
  icon?: string; //图标，图片或css icon
  type?: popType; //类型，目前仅用于自动添加icon
  alignLeft?: boolean; //向左对齐
  content: string; //主要文字内容
  description?: string; //次要描述
  info?: string; //更多信息，支持html
  buttons?: Buttons[]; //按钮
  width?: string; //宽度,默认web 384px,h5 90vw
  callback?: ((e: Subject<boolean>) => void)[] | ((e: Subject<boolean>) => void); //回调
  inputFooter?: TemplateRef<unknown>; //自定义弹窗footer
  autoCloseAfterCallback?: boolean; //是否在回调后立即关闭弹窗，默认true,
  closeIcon?: boolean; //是否显示右上角关闭
  closecallback?: () => void; //右上角关闭回调
  footerTemplate?: TemplateRef<unknown>; // 底部自定义组件
}

@UntilDestroy()
@Component({
  selector: 'app-standard-popup',
  templateUrl: './standard-popup.component.html',
  styleUrls: ['./standard-popup.component.scss'],
})
export class StandardPopupComponent implements OnInit {
  imgMap = {
    warn: 'assets/images/pop-warn-icon.svg',
    success: 'assets/images/pop-success-icon.svg',
  };

  @Input() title?: string;
  @Input() icon?: string;
  @Input() type?: popType;
  @Input() width?: string;
  @Input() alignLeft?: boolean;
  @Input() content: string = '';
  @Input() description?: string;
  @Input() info?: string;
  @Input() callback: ((e: Subject<boolean>) => void)[] | ((e: Subject<boolean>) => void) = () => {};
  @Input() autoCloseAfterCallback: boolean = true;
  @Input() inputFooter?: TemplateRef<unknown>;
  loading$: Subject<boolean> = new Subject();

  /** 弹窗自定义 footer */
  @Input() footerTemplate?: TemplateRef<unknown>;

  @Input() buttons: Buttons[] = [
    { text: this.localeService.getValue('cancels'), primary: false },
    { text: this.localeService.getValue('confirm_button'), primary: true },
  ];

  buttonsWaitList: {
    [key: string]: { disabled: boolean; time: number; obs$: Subscription } | undefined;
  } = {};

  closeIcon?: boolean;
  closecallback: () => void = () => {};
  constructor(
    @Optional() private dialogRef: MatDialogRef<StandardPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: StandardPopupData,
    private localeService: LocaleService
  ) {}

  @HostListener('document:keydown.enter', ['$event'])
  onEnter() {
    if (this.buttons.length == 1) {
      this.clickBtn(this.buttons[0], 0);
    }
  }
  ngOnInit() {
    if (!this.data) return;
    if (this.data.type) this.type = this.data.type;
    this.icon = this.data.icon;
    this.title = this.data.title;
    this.width = this.data.width;
    this.alignLeft = this.data.alignLeft;
    this.content = this.data.content;
    this.description = this.data.description;
    this.info = this.data.info;
    this.inputFooter = this.data.inputFooter;
    this.closeIcon = this.data.closeIcon;
    if (this.data.buttons) this.buttons = this.data.buttons;
    if (this.data.callback) this.callback = this.data.callback;
    if (this.data.closecallback) this.closecallback = this.data.closecallback;
    this.autoCloseAfterCallback = this.data.autoCloseAfterCallback ?? true;
    this.footerTemplate = this.data.footerTemplate;
  }

  clickBtn(item: Buttons, index: number) {
    // 点击按钮逻辑：当 callback 是数组时候，按对应按钮索引调用；
    // callback 是一个函数的时候，callback 绑定到 primary 为true的按钮上，其余按钮点击仅关闭弹窗
    // 只有一个按钮时候，不检查 primary ,直接执行callback
    if (Array.isArray(this.callback)) {
      if (this.callback[index]) this.callback[index](this.loading$);
      this.autoCloseAfterCallback && this.dialogRef?.close(index);
    } else {
      if (this.buttons.length > 1) {
        if (item.primary) {
          this.callback(this.loading$);
          this.autoCloseAfterCallback && this.dialogRef?.close(true);
        } else {
          this.dialogRef?.close(false);
        }
      } else {
        this.callback(this.loading$);
        this.autoCloseAfterCallback && this.dialogRef?.close(true);
      }
    }
  }
  onNoClick() {
    this.closecallback();
    this.dialogRef?.close();
  }

  readyWait(item: Buttons, index: number) {
    if (!item.wait) return;
    const time = item.waitTime ?? 5000;
    this.buttonsWaitList[index] = {
      disabled: true,
      time: time,
      obs$: interval(1000)
        .pipe(
          untilDestroyed(this),
          map(() => this.buttonsWaitList[index]?.time ?? 0),
          takeWhile(x => x > 0)
        )
        .subscribe(() => {
          const item = this.buttonsWaitList[index];
          if (item !== undefined) {
            item.time -= 1000;
            if (item.time <= 0) {
              delete this.buttonsWaitList[index];
            }
          }
        }),
    };
  }
}
