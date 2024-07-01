import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavList } from 'src/app/shared/interfaces/responsible-gambling.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-other-pages-barnner',
  templateUrl: './other-pages-barnner.component.html',
  styleUrls: ['./other-pages-barnner.component.scss'],
})
export class OtherPagesBarnnerComponent implements OnInit {
  constructor(private layout: LayoutService, private activatedRoute: ActivatedRoute) {}
  isH5!: boolean;
  /**@imgSrc 背景图片地址 */
  @Input() imgSrc!: string;

  /**@navList banner 导航 */
  @Input() navList!: NavList[];

  /**@title 传入标题 */
  @Input() title!: string;

  /**@smallTitle 传入小标题 */
  @Input() smallTitle!: string;

  /**@pageTitle 页面大标题 */
  pageTitle!: string;
  /**@pageSmallTitle 页面小标题 */
  pageSmallTitle!: string;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));

    this.layout.page$.pipe(untilDestroyed(this)).subscribe(page => {
      this.activatedRoute.routeConfig?.children?.forEach((route, i) => {
        if (route.component) {
          if (route.component === page) {
            this.onChangedIndex(i - 1);
          }
        }
      });
    });
  }

  /**
   * @param idx
   * @onChangedIndex 展示不同的页面title
   * @idx 下标
   */
  onChangedIndex(idx: number) {
    this.pageTitle = this.navList[idx].pageTitle;
    this.pageSmallTitle = this.navList[idx].pageSmallTitle;
  }
}
