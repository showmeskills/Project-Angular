import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { TopUpService } from '../top-up.service';

@UntilDestroy()
@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
})
export class TipsComponent implements OnInit {
  isH5!: boolean;
  articleList: any[] = []; //选择货币后 获取对应的文章列表
  @Input() tag!: string; //传入进来的类型
  isLoading: boolean = false;
  faqList: any[] = []; // 常见问题
  showHover: boolean = false;
  constructor(
    private layout: LayoutService,
    private router: Router,
    private helpCenterApi: HelpCenterApis,
    private appService: AppService,
    private topUpService: TopUpService
  ) {}

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    //当有Tag标签初始化数据
    if (this.tag) this.getInitDate();
  }

  checkTagFrom() {
    this.router.navigate([this.appService.languageCode, 'retrieve-account', 'digital-record']);
    // switch (this.tag) {
    //   case 'LegalCurrencyRecharge':  //法币：进入钱包历史记录
    //     // this.router.navigate([this.appService.languageCode, "wallet", "history", "deposit"]);
    //     this.router.navigate([this.appService.languageCode, "retrieve-account", "currency-record"]);
    //     break;
    //   case 'DigitalCurrencyRecharge'://数字货币
    //     this.router.navigate([this.appService.languageCode, "retrieve-account", "digital-record"]);
    //     break;
    //   default:
    //     break;

    // }
  }

  //初始化数据
  getInitDate(): void {
    this.isLoading = true;
    this.helpCenterApi.getArticleByTag({ Tag: this.tag, ClientType: 'Web' }).subscribe(data => {
      this.isLoading = false;
      this.articleList = data;
      this.topUpService.h5FaqList$.next(data);
    });
  }

  //前往帮助中心文章详情
  jumpToPage(isQueryRouter: boolean, item?: any): void {
    this.topUpService.jumpToPage(isQueryRouter, item);
  }

  mouseIn() {
    setTimeout(() => {
      this.showHover = true;
    }, 200);
  }
  mouseOut() {
    setTimeout(() => {
      this.showHover = false;
    }, 200);
  }

  //充值未到账页面
  openRetrievingAccount() {
    this.checkTagFrom();
  }
}
