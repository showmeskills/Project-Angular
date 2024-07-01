import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HelpCenterService } from './../help-center.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@UntilDestroy()
@Component({
  selector: 'app-h5-dialog',
  templateUrl: './h5-dialog.component.html',
  styleUrls: ['./h5-dialog.component.scss'],
})
export class H5DialogComponent implements OnInit {
  articleList: any[] = []; // 获取文章列表
  constructor(
    public dialogRef: MatDialogRef<H5DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<any>;
      item: any;
      title: string;
      categoryType: string;
      relationArticleList: [];
    },
    private helpCenterService: HelpCenterService
  ) {}

  ngOnInit(): void {
    if (this.data.categoryType == 'Announcement') {
      this.helpCenterService.latestAnnouncement$.pipe(untilDestroyed(this)).subscribe(latestAnnouncement => {
        this.articleList = latestAnnouncement;
      });
    } else {
      this.articleList = this.data.relationArticleList;
    }
  }

  onGoToDetail(item: any): void {
    this.data.item = item;
    this.close();
  }
  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
    this.data.callback(this.data);
  }
}
