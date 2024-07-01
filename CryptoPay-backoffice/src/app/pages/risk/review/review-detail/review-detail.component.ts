import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ReviewApi } from 'src/app/shared/api/review.api';
import { Subject } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgIf, NgSwitch, NgSwitchCase, NgFor } from '@angular/common';

@Component({
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    CurrencyIconDirective,
    NgFor,
    FormsModule,
    InputTrimDirective,
    AngularSvgIconModule,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class ReviewDetailComponent implements OnInit {
  m = 20;
  _destroyed = new Subject<void>();
  isDigital = true;
  base: any = {};
  appealId: any = '';
  isSubmit = false;
  formConfig = {
    result: 0,
    appealId: '',
    newOrderNumber: '',
    remark: '',
    bigImg: '',
    bigVideo: '',
    HandleResultTxt: '',
  };

  constructor(
    public modal: NgbModal,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private api: ReviewApi,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.appealId = v.appealId;
      if (v.isDigital === 'true') {
        this.isDigital = true;
      } else {
        this.isDigital = false;
      }
      this.appService.isContentLoadingSubject.next(true);
      this.api[this.isDigital ? 'getCoinAppealbyId' : 'getCurrencyAppealbyId']({
        appealId: this.appealId,
      }).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.base = res;
        if (!this.isDigital) {
          this.getForm();
        }
      });
    });
  }

  getForm() {
    this.formConfig.appealId = this.base.appealId;
    this.formConfig.remark = this.base.remark;
    switch (this.base.status) {
      case 'Pending':
        this.isSubmit = true;
        this.formConfig.result = 1;
        break;
      case 'Finish':
      case 'TimeOut':
        if (this.base.newOrderNumber) {
          this.formConfig.newOrderNumber = this.base.newOrderNumber;
          this.formConfig.result = 2;
        } else {
          this.formConfig.result = 1;
        }
        break;
      case 'Supplement':
        switch (this.base.appealSupplementType) {
          case 'SupplementComplete':
            this.formConfig.result = 3;
            break;
          case 'SupplementVerify':
            this.formConfig.result = 4;
            break;
          case 'SupplementOrder':
            this.formConfig.result = 5;
            break;
          case 'SupplementNewsComplete':
            this.formConfig.result = 6;
            break;
          case 'SupplementRemark':
            this.formConfig.HandleResultTxt = this.base.handleResultTxt;
            this.formConfig.result = 7;
            break;
        }
        break;
    }
  }

  onSubmit() {
    this.appService.isContentLoadingSubject.next(true);
    // 判断是否传入newOrderNumber和remark
    if (this.formConfig.result !== 2) this.formConfig.newOrderNumber = '';
    if ([1, 2, 7].includes(this.formConfig.result)) this.formConfig.remark = '';
    if (this.formConfig.result !== 7) this.formConfig.HandleResultTxt = '';
    this.api
      .updateAppeal({
        appealId: this.formConfig.appealId,
        result: this.formConfig.result,
        ...(this.formConfig.newOrderNumber ? { newOrderNumber: this.formConfig.newOrderNumber } : {}),
        ...(this.formConfig.HandleResultTxt ? { HandleResultTxt: this.formConfig.HandleResultTxt } : {}),
        ...(this.formConfig.remark ? { remark: this.formConfig.remark } : {}),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res === true) {
          this.router.navigate(['/risk/review']);
          this.appService.showToastSubject.next({
            msgLang: 'lotto.subSucess',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'lotto.subFailed',
            successed: false,
          });
        }
      });
  }

  async onDetail(detailTpl: TemplateRef<any>, url, isVideo) {
    this.formConfig.bigVideo = '';
    this.formConfig.bigImg = '';
    if (isVideo) {
      this.formConfig.bigVideo = url;
    } else {
      this.formConfig.bigImg = url;
    }
    this.modal.open(detailTpl, {
      centered: true,
      windowClass: 'detail-modal',
      size: 'lg',
    });
  }

  /** 跳转代客充值 */
  toValet() {
    this.router.navigate(['/finance/valet-recharge'], {
      queryParams: {
        uid: this.base.uid,
        actualName: this.base.depositUserName,
      },
    });
  }
}
