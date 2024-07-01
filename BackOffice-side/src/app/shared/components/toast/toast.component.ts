import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Toast } from '../../interfaces/common.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: true,
  imports: [NgFor, NgbToast, NgIf, AngularSvgIconModule, LangPipe, NgSwitch, NgSwitchCase],
})
export class ToastComponent implements OnInit {
  constructor(
    private appService: AppService,
    private lang: LangService
  ) {}

  toasts: Toast[] = [];

  ngOnInit() {
    this.appService.showToastSubject.subscribe((x: Toast) => this.processToast(x));
  }

  remove(index) {
    clearTimeout(this.toasts[index]?.['timer']);
    this.toasts.splice(index, 1);
  }

  /** 处理Toast */
  async processToast(toast: Toast) {
    let index = -1;

    // 处理类型
    if (!toast.type) {
      toast.type = toast.successed ? 'success' : 'danger';
    }

    // 如果没传入only 看是否传入过key，传入key自动设置为true
    const unique = toast.only || (toast.only === undefined && !!toast.key);
    if (unique) {
      // 查看是否有相同的key或是名称
      index = this.toasts.findIndex((e) => (toast.key ? e.key === toast.key : e.msg === toast.msg));
    }

    // 获取msg翻译的消息 -> 覆盖原来的msg
    if (toast.msgLang !== undefined) {
      let res = '';

      if (Array.isArray(toast.msgLang)) {
        const arrRes = await Promise.all(
          toast.msgLang.filter((e) => e).map((e) => this.lang.getOne<string>(e.trim(), toast.msgArgs))
        );
        res = arrRes.join('');
      } else {
        res = (await this.lang.getOne<string>(toast.msgLang, toast.msgArgs)) as string;
      }

      toast.msg = res;
    }

    this.toasts.splice(index >>> 0, 1, toast); // 把负数作无符号右移，负数-1的补码无符号结果是正数4294967295 在splice会自动进行追加到数组末尾
  }

  onEnter(item: Toast) {
    clearTimeout(item['timer']);
    item['autohide'] = false;
  }

  onLeave(item: Toast, index) {
    clearTimeout(item['timer']);

    let duration = item.duration === undefined ? 3e3 : item.duration;
    duration = item.reactivateDuration === undefined ? duration : item.reactivateDuration;

    item['timer'] = setTimeout(() => this.remove(index), duration);
  }

  toggleChild(item: Toast) {
    item['msgChildrenOpen'] = !item['msgChildrenOpen'];
  }
}
