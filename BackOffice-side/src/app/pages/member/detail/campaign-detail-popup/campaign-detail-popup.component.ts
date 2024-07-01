import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { NgIf, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import {
  TournamentActivitInfo,
  TournamentActivitSelectItem,
  TournamentActivitUserRankInfo,
} from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'app-campaign-detail-popup',
  templateUrl: './campaign-detail-popup.component.html',
  styleUrls: ['./campaign-detail-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    MatTabsModule,
    NgFor,
    CurrencyIconDirective,
    AngularSvgIconModule,
    CurrencyValuePipe,
    LangPipe,
    NgbPopover,
    ModalFooterComponent,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    EmptyComponent,
  ],
})
export class CampaignDetailPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<CampaignDetailPopupComponent, boolean>,
    private appService: AppService,
    private activityAPI: ActivityAPI
  ) {}

  @Input() uid: string;
  @Input() tenantId: number;

  curtbasValue = 0;
  tabsList = [
    { name: '进行中的活动', lang: 'member.detail.tournamentRank.ongoingActivities', value: 0 },
    { name: '已结束的活动', lang: 'member.detail.tournamentRank.endedActivities', value: 1 },
  ];

  /** 当前活动名称code */
  curCampaignCode = '';
  /** 活动名称数据 */
  campaignList: TournamentActivitSelectItem[] = [];

  data: { inActivitInfo: TournamentActivitInfo; endActivitInfo: TournamentActivitInfo };
  activitInfo: TournamentActivitInfo;
  campaignInfo: TournamentActivitUserRankInfo | undefined;

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this.activityAPI.getuserjoinnewrank({ uid: this.uid, tenantId: this.tenantId }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res) return;
      this.data = res || {};
      this.onSelectTabs();
    });
  }

  /** Tab - 选择 */
  onSelectTabs() {
    switch (this.curtbasValue) {
      case 0:
        this.activitInfo = this.data?.inActivitInfo;
        break;
      case 1:
        this.activitInfo = this.data?.endActivitInfo;
        break;
    }

    // 赋值当前活动状态的活动名称列表
    this.campaignList = this.activitInfo?.selectCode || [];

    if (this.campaignList.length) {
      // 默认选择活动名称列表的第一条数据
      this.curCampaignCode = this.activitInfo?.selectCode[0]?.code || '';
      this.onSelectCampaign();
    }
  }

  /** 活动名称 - 选择 */
  onSelectCampaign() {
    this.campaignInfo = this.activitInfo?.userRankInfo.find((v) => v.code === this.curCampaignCode);
  }
}
