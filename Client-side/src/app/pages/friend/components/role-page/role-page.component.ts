import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
@UntilDestroy()
@Component({
  selector: 'app-role-page',
  templateUrl: './role-page.component.html',
  styleUrls: ['./role-page.component.scss'],
})
export class RolePageComponent implements OnInit {
  isH5!: boolean;

  whichRouter!: string | null; //判断是否是来自好友还是联盟

  title!: string | null; //按钮

  btnName!: string | null;

  /** 多语言模版 */
  localeContent: string = '';

  /**文章加载loading状态 */
  contentLoading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private router: Router,
    private layout: LayoutService,
    private localeService: LocaleService,
    private natvieAppService: NativeAppService
  ) {}

  ngOnInit(): void {
    this.contentLoading = true;
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.activatedRoute.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      this.whichRouter = params.get('whichRouter');
      if (this.whichRouter === 'friend') {
        this.title = this.localeService.getValue('agent_p');
        this.btnName = this.localeService.getValue('join_now');
        this.natvieAppService.setNativeTitle('recom_role');
      } else if (this.whichRouter === 'affiliate') {
        this.title = this.localeService.getValue('sup_partner');
        this.btnName = this.localeService.getValue('waiting');
        this.natvieAppService.setNativeTitle('agent_p');
      } else {
        this.appService.jumpToLogin();
      }
      if (this.whichRouter) this.getLocaleTemplate();
    });
  }

  getLocaleTemplate() {
    fetch(
      this.whichRouter === 'friend'
        ? `assets/resources/pages/role/${this.appService.languageCode}.html`
        : `assets/resources/pages/isAgent-affiliate/${this.appService.languageCode}.html`
    )
      .then(res => res.text())
      .then(data => {
        this.contentLoading = false;
        if (this.whichRouter === 'friend') {
          this.localeContent = data
            .replace(
              /{{rebLinkName1}}/g,
              this.whichRouter
                ? this.localeService.getValue('reb_rat_calcu02')
                : this.localeService.getValue('sup_partner')
            )
            .replace(
              /{{rebLinkName2}}/g,
              this.whichRouter
                ? this.localeService.getValue('reb_rat_calcu09')
                : this.localeService.getValue('sup_partner')
            )
            .replace(
              /{{attentionTitle}}/g,
              this.whichRouter ? this.localeService.getValue('pay_att00') : this.localeService.getValue('sup_partner')
            )
            .replace(
              /{{attentionContext}}/g,
              this.whichRouter
                ? this.localeService.getValue('pay_att_tip00')
                : this.localeService.getValue('sup_partner')
            )
            .replace(/{{onJunmpToPage}}/g, this.localeService.getValue('active_flow_link'))
            .replace(/{Brand}/g, this.localeService.getValue('brand_name'));
        } else {
          this.localeContent = data
            .replace(
              /{{titleRouter}}/g,
              this.whichRouter ? this.localeService.getValue('agent_p') : this.localeService.getValue('sup_partner')
            )
            .replace(
              /{{questionTitle}}/g,
              this.whichRouter ? this.localeService.getValue('global_alli') : this.localeService.getValue('sup_partner')
            )
            .replace(
              /{{joinProgram}}/g,
              this.whichRouter ? this.localeService.getValue('affiliate') : this.localeService.getValue('sup_partner')
            )
            .replace(/{{goHomePage}}/g, `referral/home`)
            .replace(/{{goFaqInstruction}}/g, this.localeService.getValue('agent_detail_link'))
            .replace(/{{goFaqAns}}/g, this.localeService.getValue('agent_ans_detail'))
            .replace(/{{goFaqFishing}}/g, this.localeService.getValue('agent_cancel_link'))
            .replace(/{{activityLink}}/g, this.localeService.getValue('activity_link'))
            .replace(/{Brand}/g, this.localeService.getValue('brand_name'));
        }
      })
      .catch(err => {
        this.contentLoading = false;
        console.log(err);
      });
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
      this.jumpToPage(page);
    }
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/${page}`);
  }
}
