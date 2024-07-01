import { Location } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-support-theme-layout',
  templateUrl: './support-theme-layout.component.html',
  styleUrls: ['./support-theme-layout.component.scss'],
})
export class SupportThemeLayoutComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private location: Location
  ) {}
  /**@themeTitle 主题名称*/
  @Input() themeTitle!: string;

  /**@type search type*/
  @Input() type!: string;

  /**@themeList 渲染list 列表*/
  @Input() themeList!: any[];

  /**@footTemplate 底部样式模版 */
  @Input() footTemplate!: TemplateRef<any>;

  isH5!: boolean;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  /**
   * 去往List page
   *
   * @param item
   * @item theme category data
   */
  jumpToListPage(item: any): void {
    this.router.navigate([`/${this.appService.languageCode}/help-center/${this.type.toLocaleLowerCase()}/${item.id}`]);
  }

  //返回上一页面
  goBack(): void {
    this.location.back();
  }
}
