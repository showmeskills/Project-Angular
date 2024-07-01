import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import {
  RiskAuditFormRes,
  RiskFormMap,
  UploadItem,
  WealthSourceRequest,
} from 'src/app/shared/interfaces/risk-control.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { IncomeProofForm, IncomeUploadList } from '../risk-control.config';
import { RiskControlService } from '../risk-control.service';

@UntilDestroy()
@Component({
  selector: 'app-income-proof',
  templateUrl: './income-proof.component.html',
  styleUrls: ['./income-proof.component.scss'],
})
export class IncomeProofComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private riskService: RiskControlService,
    private riskApi: RiskControlApi,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
  }

  isH5!: boolean;
  incomeProofForm = IncomeProofForm;
  prevData!: RiskAuditFormRes;
  completed: boolean = false;
  submitLoading: boolean = false;
  rejected: boolean = false;

  /**要展示的上传图片数据 */
  displayUpload: { [key: string]: UploadItem } = {};
  /**已选择的资金来源 */
  selectedSources: any[] = [];

  /** 自定义下拉 */
  expand: boolean = false;

  /** 声明 */
  declearation: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    //获取上次提交的数据
    this.route.queryParams.pipe(untilDestroyed(this), take(1)).subscribe(async params => {
      if (params.status && params.status == 'rejected') {
        this.rejected = true;
        const auditFromResp = await firstValueFrom(
          this.riskApi.getLastAuditForm({ type: RiskFormMap.WEALTHSOURCE, status: 'Rejected' }),
        );
        if (auditFromResp.success) {
          this.prevData = auditFromResp.data;
          console.log('previsous data', this.prevData);
          //整理数据
          this.incomeProofForm.selectAmount.value = this.prevData.form.depositLimit;
          this.incomeProofForm.foundSource.optionLists.forEach(x => {
            if (this.prevData.form.moneySources.map((y: string) => y.toLowerCase()).includes(x.value.toLowerCase())) {
              x.checked = true;
              this.selectedSources.push(x);
              this.displayUpload[x.value] = IncomeUploadList[x.value];
              this.displayUpload[x.value].fileList = this.prevData.form[this.displayUpload[x.value].value];
            }
          });
          return;
        }
      } else {
        this.incomeProofForm.selectAmount.value = '';
        this.selectedSources = [];
        Object.assign(this.displayUpload, {});
      }
    });
  }

  /** 是否可以展示图片上传区域 */

  get canSubmitForm(): boolean {
    const selectAmount = !!this.incomeProofForm.selectAmount.value;
    const selectedSources = !!this.selectedSources.length;

    return selectAmount && selectedSources && this.declearation;
  }

  /**
   * 下拉筛选
   *
   * @param index
   */
  onChangeValue(index: number) {
    this.selectedSources = this.incomeProofForm.foundSource.optionLists
      .map((item, idx) => {
        if (index === idx) item.checked = !item.checked;
        return item;
      })
      .filter(item => {
        if (item.checked) {
          this.displayUpload[item.value] = IncomeUploadList[item.value];
        } else {
          delete this.displayUpload[item.value];
        }
        return item.checked;
      });
  }

  /** 提交审核 */
  onSubmitPending() {
    this.submitLoading = true;
    const params: WealthSourceRequest = {
      id: this.riskService.riskFormList.find(x => x.type == RiskFormMap.WEALTHSOURCE)?.id ?? 0,
      depositLimit: this.incomeProofForm.selectAmount.value,
      moneySources: [],
    };
    this.selectedSources.forEach(item => {
      params.moneySources.push(item.value);
      const selectedSourceObj = IncomeUploadList[item.value];
      if (selectedSourceObj.fileList.length) {
        params[selectedSourceObj.value] = selectedSourceObj.fileList;
      }
    });
    this.riskApi.submitWealthSource(params).subscribe(resp => {
      if (resp.data) {
        this.submitLoading = false;
        this.completed = true;
        this.riskService.handleFormStorage(false, RiskFormMap.WEALTHSOURCE);
        this.riskService.checkUserRiskForm();
      }
    });
  }

  trackMethod(index: any, item: any) {
    return item.value;
  }
}
