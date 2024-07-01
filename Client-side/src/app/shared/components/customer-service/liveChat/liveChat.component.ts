import {
  Component,
  DestroyRef,
  EmbeddedViewRef,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerData, WidgetState } from '@livechat/widget-angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription, map, startWith } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { CustomerServiceService } from '../customer-service.service';

@Component({
  selector: 'app-liveChat',
  templateUrl: './liveChat.component.html',
  styleUrls: ['./liveChat.component.scss'],
})
export class LiveChatComponent implements OnInit {
  constructor(
    public customerServiceService: CustomerServiceService,
    private layout: LayoutService,
    private appService: AppService,
    private localeService: LocaleService,
    private localStorageService: LocalStorageService,
    private destroyRef: DestroyRef,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    private deviceService: DeviceDetectorService,
  ) {}

  /**游客提示组件样式跟踪流 */
  containerSubscription?: Subscription;

  step: number = 1;
  contact: string = '';
  errorText: string = '';

  /** 固定设置的头部高度（可能需要维护）  */
  headerHeight = 56;
  /** 固定设置的外层边距（移动模式时为0。可能需要维护） */
  outPadding = 16;
  /** 固定延迟显示提示的时间 */
  transitionDelay = '0.6s';

  tipVisible = signal(false);

  containerStyle?: {
    position: string;
    zIndex: string;
    bottom: string;
    right: string;
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
    opacity: string;
  };

  @ViewChild('tourists') touristsTemplate?: TemplateRef<unknown>;
  embeddedView?: EmbeddedViewRef<unknown>;

  ngOnInit() {
    this.outPadding = this.deviceService.isMobile() ? 0 : 16;
  }

  /**就绪状态 */
  onReady(e: { state: WidgetState; customerData: CustomerData }) {
    this.customerServiceService.chatReady.set(true);
    const contact = this.localStorageService.csTouristsContact;
    const logined = Boolean(this.localStorageService.loginToken);
    if (contact) {
      this.customerServiceService.setLiveChatVar();
    } else if (!logined) {
      this.getContainerStyle();
      const parent = document.querySelector('#chat-widget-container') as HTMLElement;
      if (this.touristsTemplate && parent) {
        this.embeddedView = this.viewContainerRef.createEmbeddedView(this.touristsTemplate);
        const element = this.embeddedView.rootNodes[0];
        this.renderer.appendChild(parent, element);
      }
    }
    console.log('LiveChat_onReady', e);
  }

  /**可用性更改时 */
  onAvailabilityChanged(e: { availability: WidgetState['availability'] }) {
    console.log('LiveChat_onAvailabilityChanged', e);
  }

  /**可见性改变 */
  onVisibilityChanged(e: { visibility: WidgetState['visibility'] }) {
    this.customerServiceService.liveChatConfig.visibility = e.visibility;
    if (this.embeddedView) this.tipVisible.set(e.visibility === 'maximized');
    console.log('LiveChat_onVisibilityChanged', e);
  }

  /**客户状态更改时 */
  onCustomerStatusChanged(e: unknown) {
    console.log('LiveChat_onCustomerStatusChanged', e);
  }

  /**新事件 */
  onNewEvent(e: unknown) {
    console.log('LiveChat_onNewEvent', e);
  }

  /**表单提交时 */
  onFormSubmitted(e: unknown) {
    console.log('LiveChat_onFormSubmitted', e);
  }

  /**评级已提交 */
  onRatingSubmitted(e: unknown) {
    console.log('LiveChat_onRatingSubmitted', e);
  }

  /**显示问候语 */
  onGreetingDisplayed(e: unknown) {
    console.log('LiveChat_onGreetingDisplayed', e);
  }

  /**隐藏的问候语 */
  onGreetingHidden(e: unknown) {
    console.log('LiveChat_onGreetingHidden', e);
  }

  /**富文本按钮点击后 */
  onRichMessageButtonClicked(e: unknown) {
    console.log('LiveChat_onRichMessageButtonClicked', e);
  }

  /**获取游客提示要设置的样式 */
  getContainerStyle() {
    this.containerSubscription = this.layout
      .mutationObserver(document.querySelector('#chat-widget-container')!, { attributeFilter: ['style'] })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(x => x[0].target as HTMLElement),
        startWith(document.querySelector('#chat-widget-container')! as HTMLElement),
        map(el => {
          return {
            position: el.style.position,
            zIndex: el.style.zIndex,
            bottom: el.style.bottom,
            right: el.style.right,
            width: el.style.width,
            height: el.style.height,
            maxWidth: el.style.maxWidth,
            maxHeight: el.style.maxHeight,
            opacity: el.style.opacity,
          };
        }),
      )
      .subscribe(v => {
        this.containerStyle = v;
      });
  }

  /**跳转登录 */
  tologin() {
    this.appService.jumpToLogin();
    this.customerServiceService.liveChatConfig.visibility = 'hidden';
  }

  /**提交 */
  submit() {
    this.localStorageService.csTouristsContact = this.contact;
    this.customerServiceService.setLiveChatVar();
    this.containerSubscription?.unsubscribe();
    this.tipVisible.set(false);
    this.embeddedView?.destroy();
    this.embeddedView = undefined;
  }

  /**以游客继续 */
  next() {
    this.step += 1;
  }

  /**格式化 去掉所有空格 */
  format = (v: string) => {
    return v.replace(/[ ]/g, '');
  };

  /**验证手机号或邮箱 */
  contactChange() {
    if (this.contact.includes('@')) {
      // 邮箱规则
      if (/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.contact)) {
        this.errorText = '';
      } else {
        this.errorText = this.localeService.getValue('cs_tou_tip_error');
      }
    } else {
      // 手机规则 必须全是数字、且大于等于7位数，小于等于20位
      if (/^[0-9]{7,20}$/.test(this.contact)) {
        this.errorText = '';
      } else {
        this.errorText = this.localeService.getValue('cs_tou_tip_error');
      }
    }
  }
}
