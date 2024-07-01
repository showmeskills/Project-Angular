import { Component, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LayoutService } from '../../service/layout.service';
import { LocaleService } from '../../service/locale.service';
import { ToastService } from '../../service/toast.service';
import { CustomerServiceService } from './customer-service.service';

@UntilDestroy()
@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.component.html',
  styleUrls: ['./customer-service.component.scss'],
})
export class CustomerServiceComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private appService: AppService,
    public customerServiceService: CustomerServiceService,
    private toast: ToastService,
    private localeService: LocaleService,
  ) {}

  isH5 = toSignal(this.layout.isH5$);
  disable = signal(false);

  dragging: boolean = false;

  /**游客提示组件样式跟踪流 */
  buildTipSubscription?: Subscription;

  /**是否显示按钮 */
  show = computed(() => {
    return this.customerServiceService.chatReady() && !this.isH5() && !this.disable();
  });

  ngOnInit() {
    // 是否禁用按钮
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(x => {
      const tree = this.layout.getComponentTree();
      if (tree.some(x => x._disable && x._disable.split(',').includes('CS'))) {
        if (x._activate && x._activate.split(',').includes('CS')) {
          this.disable.set(false);
        } else {
          this.disable.set(true);
        }
      } else {
        this.disable.set(false);
      }
    });

    // 订阅全局打开客服请求
    this.appService.toOnLineService$.pipe(untilDestroyed(this)).subscribe(() => this.toService());
  }

  /**打开客服面板 */
  toService() {
    if (!this.customerServiceService.chatReady()) {
      this.toast.show({ message: this.localeService.getValue('cs_init_pls_wait'), title: '' });
      return;
    }
    switch (this.customerServiceService.chatType) {
      case 'liveChat':
        this.customerServiceService.liveChatConfig.visibility = 'maximized';
        break;
      case 'zendesk':
        if (window.zE) window.zE('messenger', 'open');
        break;
      default:
        break;
    }
  }
}
