import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FeedbackApi } from 'src/app/shared/apis/feedback.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { FeedbackDetail, FeedbackOptionList, FeedbackRecord } from 'src/app/shared/interfaces/feedback.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { FeedbackService } from '../feedback.service';

interface FeedbackRecordWithDetail extends FeedbackRecord {
  detail?: FeedbackDetail;
  expand?: boolean;
  loading?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-feedback-record',
  templateUrl: './feedback-record.component.html',
  styleUrls: ['./feedback-record.component.scss'],
})
export class FeedbackRecordComponent implements OnInit {
  constructor(
    private feedbackApi: FeedbackApi,
    private appService: AppService,
    private layout: LayoutService,
    public feedbackService: FeedbackService
  ) {}

  isH5!: boolean;
  optionList!: FeedbackOptionList;
  allLangData!: LangModel[];

  loadingList: boolean = true;
  record: FeedbackRecordWithDetail[] = [];

  /**分页器 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  ngOnInit() {
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(v => (this.allLangData = v));
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.feedbackService
      .getOptionList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.data) {
          this.optionList = res.data;
          this.loadRecord();
        }
      });
  }

  loadRecord() {
    this.loadingList = true;
    this.feedbackApi.getFeedbackRecord(this.paginator.page, this.paginator.pageSize).subscribe(res => {
      this.loadingList = false;
      if (res?.data) {
        this.paginator.total = res.data.total;
        if (this.isH5) {
          this.record.push(...(res.data.list as any));
        } else {
          this.record = res.data.list;
        }
      }
    });
  }

  clickRecord(item: FeedbackRecordWithDetail) {
    if (item.detail) {
      item.expand = !item.expand;
    } else {
      item.loading = true;
      this.feedbackApi.getFeedbackDetail(item.id).subscribe(res => {
        item.loading = false;
        if (res?.data) {
          item.detail = res.data;
          item.expand = true;
        }
      });
    }
  }
}
