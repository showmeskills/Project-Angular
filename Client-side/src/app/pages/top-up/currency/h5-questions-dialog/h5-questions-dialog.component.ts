import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TopUpService } from '../../top-up.service';
@UntilDestroy()
@Component({
  selector: 'app-h5-questions-dialog',
  templateUrl: './h5-questions-dialog.component.html',
  styleUrls: ['./h5-questions-dialog.component.scss'],
})
export class H5QuestionsDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<H5QuestionsDialogComponent>, private topUpService: TopUpService) {}
  /**faq 数据数组 */
  faqList: any[] = [];
  /**数据下标 */
  activeIdx: number = -1;
  ngOnInit() {
    this.topUpService.h5FaqList$.pipe(untilDestroyed(this)).subscribe(list => {
      this.faqList = list;
    });
  }
  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.activeIdx = -1;
  }
  /**
   * 打开List
   *
   * @idx 数据下标
   */
  /** @clickTitle 收集当前点击的idx */
  clickTitle: number[] = [];
  openList(idx: number) {
    this.activeIdx = idx;
    this.clickTitle.push(idx);
    const len = this.clickTitle.length;
    if (len > 1) {
      if (this.clickTitle[len - 2] === this.clickTitle[len - 1]) {
        this.activeIdx = -1;
        this.clickTitle = [];
        return;
      }
    }
  }

  /**
   * 前往帮助中心文章详情
   *
   * @param isQueryRouter
   * @param item
   * @isQueryRouter 通过queryParams
   * @item faq 数据
   */
  jumpToPage(isQueryRouter: boolean, item?: any): void {
    this.topUpService.jumpToPage(isQueryRouter, item);
    this.close();
  }
}
