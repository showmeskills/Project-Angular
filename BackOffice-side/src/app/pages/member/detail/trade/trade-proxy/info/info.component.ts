import { Component, OnInit } from '@angular/core';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberService } from 'src/app/pages/member/member.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, DatePipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    DatePipe,
    TimeFormatPipe,
    FormatNumberDecimalPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class InfoComponent implements OnInit {
  uid!: string;
  data: any = {}; //左侧卡片数据
  isLoading = false;
  editData: any = {};
  currentTime: number = Math.floor(new Date().getTime() / 1000);
  protectTime!: string;
  constructor(
    private api: AgentApi,
    private memberService: MemberService,
    private appService: AppService,
    private route: ActivatedRoute
  ) {}

  isEdit = false;

  ngOnInit(): void {
    this.uid = this.route.snapshot.queryParams['uid'];
    this.uid && this.loadData();
  }

  loadData() {
    this.loading(true);
    const params = {
      uid: this.uid,
    };
    zip([this.api.details_basic(params), this.api.details_card(params)]).subscribe(([basic, card]) => {
      this.loading(false);
      if (card?.data) {
        this.data = card.data;
      }

      if (basic?.data) {
        this.editData = {
          proxyState: basic.data?.proxyState,
          basicsRate: basic.data?.baseCommissionRate,
          extraRate: basic.data?.extraRate,
          commissionRate: basic.data?.monthCommissionRate,
          taskRate: basic.data?.taskRate,
          protectCommission: basic.data?.protectCommission,
          enableCommission: Boolean(basic.data?.usdtStatus),
        };

        if (basic.data.protectTime === 0) {
          this.editData.protectTime = '未设置';
          this.protectTime = '未设置';
        } else if (this.currentTime - basic.data.protectTime > 0) {
          this.editData.protectTime = '已过期';
          this.protectTime = '已过期';
        } else {
          this.protectTime = moment(basic.data.protectTime).format('YYYY-MM-DD HH:mm:ss');
          this.editData.protectTime = basic.data.protectTime;
        }
      }
    });
  }

  //保存 编辑
  onSaveEdit() {
    this.loading(true);
    const params = {
      id: this.uid,
      proxyState: Number(this.editData.proxyState),
      basicsRate: Number(this.editData.basicsRate),
      commissionRate: Number(this.editData.commissionRate),
      extraRate: Number(this.editData.extraRate),
      protectRate: Number(this.editData.protectCommission),
      taskRate: Number(this.editData.taskRate),
      usdtStatus: Number(this.editData.enableCommission),
    };
    this.api.details_save(params).subscribe((res) => {
      this.loading(false);

      const successed = res?.data === true;
      const msgLang = successed ? 'common.operationSuccess' : 'common.operationFailed';

      this.appService.showToastSubject.next({ msgLang, successed });
      this.loadData();
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
