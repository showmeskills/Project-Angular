import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { FriendService } from '../../friend.service';
@UntilDestroy()
@Component({
  selector: 'app-application-page',
  templateUrl: './application-page.component.html',
  styleUrls: ['./application-page.component.scss'],
})
export class ApplicationPageComponent implements OnInit {
  isH5!: boolean;

  /** 页脚组件数据 */
  footerData: any = {
    title: this.localeService.getValue('join_affi'),
    smallTitle: this.localeService.getValue('join_affi_two'),
    btnName: this.isH5 ? this.localeService.getValue('join') : this.localeService.getValue('join_now'),
  };

  /** 用户当前申请状态码 */
  statusCode!: number;

  /** 多语言模版 */
  localeContent: string = '';

  /** 文章loading */
  contentLoading: boolean = false;

  /** 背景颜色主题 */
  theme!: boolean;

  /** 是否是 代理 */
  isAgent!: boolean;

  /** 用户是否登录 */
  isUserLogined!: boolean;

  constructor(
    private router: Router,
    private layout: LayoutService,
    public appService: AppService,
    private friendService: FriendService,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService
  ) {}

  ngOnInit(): void {
    this.nativeAppService.setNativeTitle('agent_p');

    combineLatest([this.layout.isH5$, this.appService.themeSwitch$, this.appService.userInfo$])
      .pipe(
        untilDestroyed(this),
        switchMap(([isH5, themeSwitch, userInfo]) => {
          this.isH5 = isH5;
          this.theme = themeSwitch === 'sun' ? true : false;
          this.isUserLogined = !!userInfo;
          return combineLatest([
            this.isUserLogined ? this.friendService.getAgentApplyStatus() : of(0),
            this.isUserLogined ? this.friendService.getUserAgentStatus() : of(false),
          ]);
        })
      )
      .subscribe(([statusCode, isAgent]) => {
        this.isAgent = isAgent;
        this.statusCode = statusCode;
        this.getLocaleTemplate();
      });
  }

  getLocaleTemplate() {
    this.contentLoading = true;
    fetch(`assets/resources/pages/affiliate/${this.appService.languageCode}.html`)
      .then(res => res.text())
      .then(data => {
        this.contentLoading = false;
        this.localeContent = data
          .replace(/{{onJoinLink}}/g, this.isUserLogined ? this.onJoin() : 'login')
          .replace(/{{goHomePage}}/g, `referral/home`)
          .replace(
            /{{brandImgSrc}}/g,
            this.theme
              ? 'assets/images/friend/application/brand.png'
              : 'assets/images/friend/application/dark-brand.png'
          )
          .replace(
            /{{creditCardImgSrc}}/g,
            this.theme
              ? 'assets/images/friend/application/credit-card.png'
              : 'assets/images/friend/application/dark-credit-card.png'
          )
          .replace(/{Brand}/g, this.localeService.getValue('brand_name'));
      })
      .catch(err => {
        this.contentLoading = false;
        console.log(err);
      });
  }

  // 显示form
  onJoin() {
    switch (this.statusCode) {
      case 10000:
        return 'referral/application/affiliate/openForm';
      case 10002:
      case 10004:
        return 'referral/application-check';
      case 10003:
        if (this.isAgent) {
          return 'referral/affiliate';
        } else {
          return 'referral/application-check';
        }
      default:
        return 'login';
    }
  }

  /**
   * 当文章加载后获取相关 dom节点，不刷新页面跳转
   *
   * @param event 鼠标事件
   */
  onClickLink(event: any) {
    const len = Object.keys(event.target.dataset).length;
    if (len === 0) {
      // this.onClickLink(event)
    } else {
      const { page } = event.target.dataset;
      this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
    }
  }
}
