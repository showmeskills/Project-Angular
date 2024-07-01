import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-crypto-withdraw-tips',
  templateUrl: './crypto-withdraw-tips.component.html',
  styleUrls: ['./crypto-withdraw-tips.component.scss'],
})
export class CryptoWithdrawTipsComponent implements OnInit {
  isH5!: boolean;
  articleList: any[] = []; //选择货币后 获取对应的文章列表
  @Input() Tag!: string; //传入进来的类型
  isLoading: boolean = false;
  faqList: any[] = []; // 常见问题
  constructor(
    private layout: LayoutService,
    private router: Router,
    private helpCenterApi: HelpCenterApis,
    public appService: AppService
  ) {}

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    if (this.Tag !== undefined) this.getInitDate();
  }
  //初始化数据
  getInitDate(): void {
    this.isLoading = true;
    forkJoin([this.helpCenterApi.getArticleByTag({ Tag: this.Tag, ClientType: 'Web' })]).subscribe(([articleList]) => {
      this.articleList = articleList;
      this.isLoading = false;
    });
  }
  //前往帮助中心文章详情
  onGoTohelpCenter(item: any): void {
    this.articleList.forEach(child => {
      if (item.id == child.id) {
        this.router.navigate([this.appService.languageCode, 'help-center', 'faq', item.categoryParentId], {
          queryParams: {
            articleCode: item.id,
          },
        });
        return;
      }
    });
  }
}
