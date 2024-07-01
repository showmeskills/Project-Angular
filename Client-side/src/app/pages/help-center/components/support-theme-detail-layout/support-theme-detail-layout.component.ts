import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { H5DialogComponent } from '../../h5-dialog/h5-dialog.component';
import { HelpCenterService } from '../../help-center.service';
@UntilDestroy()
@Component({
  selector: 'app-support-theme-detail-layout',
  templateUrl: './support-theme-detail-layout.component.html',
  styleUrls: ['./support-theme-detail-layout.component.scss'],
})
export class SupportThemeDetailLayoutComponent implements OnInit {
  constructor(private layout: LayoutService, private helpCenterService: HelpCenterService, private dialog: MatDialog) {}
  /**@themeTitle 主题名称*/
  @Input() themeTitle!: string;

  /**@type search type*/
  @Input() type!: string;

  /**@goBack 回到上一个路由 */
  @Output() goBack: EventEmitter<any> = new EventEmitter();

  /**@isListPage 当前是否是List页面*/
  @Input() isListPage!: boolean;

  /**@currentTitle h5的时候显示文章标题 */
  @Input() currentTitle!: string;

  /**@h5DialogTitle h5弹窗的title */
  @Input() h5DialogTitle!: string;

  /**@debounceBack 路由返回的间隙*/
  @Input() debounceBack!: boolean;

  /**@menuList 菜单列表模版 */
  @Input() menuListTemp!: TemplateRef<any>;

  /**@listPageTmp List 页面模版*/
  @Input() pageTemp!: TemplateRef<any>;

  /**@detailPageTmp 详情页面 */
  // @Input() detailPageTmp!: TemplateRef<any>;

  /**@webPaginator web页脚 */
  @Input() webPaginator!: TemplateRef<any>;

  /**@rightList 最新公告或者相关文章*/
  @Input() rightList!: any;

  /**@article 文章信息*/
  @Input() article!: any;

  /**@detailLoading  加载文章信息loading 状态*/
  @Input() detailLoading!: boolean;

  /**@detailLoading  加载文章信息loading 状态*/
  @Input() h5ListPageTemp!: TemplateRef<any>;

  /**@h5FaqTitle faq title*/
  @Input() h5FaqTitle!: string;

  /**@relationArticleList faq 相关文章 */
  @Input() relationArticleList!: any;
  isH5!: boolean;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }
  /**
   * 返回上级路由
   *
   * @goBack() 触发组件的goBack函数
   */
  back() {
    this.goBack.emit();
  }

  //打开窗口
  showH5ContentDialog(): void {
    this.dialog.open(H5DialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.closeContentDialog.bind(this),
        title: this.h5DialogTitle,
        relationArticleList: this.relationArticleList,
        categoryType: this.type,
      },
    });
  }
  //关闭弹窗后毁掉
  closeContentDialog(data: any): void {
    if (data?.item) {
      this.helpCenterService.jumpToDetailPage(data.item);
    }
  }
  /**
   * 点击打开详情页面
   *
   * @param item
   * @item 列表属性
   */
  toDetailPage(item: any) {
    this.helpCenterService.jumpToDetailPage(item);
  }
}
