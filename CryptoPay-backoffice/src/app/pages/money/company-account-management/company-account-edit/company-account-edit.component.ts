import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { CompanyBankAccountApi } from 'src/app/shared/api/company-banck-account.api';
import { forkJoin, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
@Component({
  selector: 'app-company-account-edit',
  templateUrl: './company-account-edit.component.html',
  styleUrls: ['./company-account-edit.component.scss'],
  standalone: true,
  imports: [FormRowComponent, MatFormFieldModule, MatSelectModule, FormsModule, NgFor, MatOptionModule, LangPipe],
})
export class CompanyAccountEditComponent implements OnInit, OnDestroy {
  protected readonly _destroy = new Subject<void>();
  isLoading = false; // 是否处于加载
  loadData$ = new Subject<void>(); // 加载数据的流
  init$ = new Subject<void>(); // 是否初始化流
  currenciesList: any[] = []; // 所有货币
  merchantsList: any[] = []; // 所有商户
  data: any = {
    id: '',
    merchantId: '',
    currency: '',
    payeeName: '',
    beneficiaryAccountNumber: '',
    beneficiaryBank: '',
    bankBranches: '',
    swiftCode: '',
    payeeAddress: '',
    receivingBankAddress: '',
    correspondentBankInfo: '',
    singleDayDepositUpperLimit: 0,
    balanceUpperLimit: 0,
    singleDepositUpperLimit: 0,
    singleDepositLowerLimit: 0,
    isEnable: true,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private api: CompanyBankAccountApi,
    private selectApi: SelectApi,
    private appService: AppService,
    public lang: LangService
  ) {}

  ngOnInit(): void {
    this.getInitData();
    this.onReset();
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
    this.onReset();
  }

  // 初始化页面
  getInitData(): void {
    this.route.queryParams.subscribe((value: any) => {
      const { id } = value;
      this.appService.isContentLoadingSubject.next(true);
      forkJoin([
        this.selectApi.goMoneyGetCurrencies(),
        this.selectApi.goMoneyGetMerchant(),
        this.getData(Number(id)),
      ]).subscribe(([currencies, merchants]) => {
        this.appService.isContentLoadingSubject.next(false);
        this.currenciesList = currencies;
        this.merchantsList = merchants;
        this.init$.next();
        this.init$.complete();
      });
    });
  }

  // 获取账户数据
  getData(id: number) {
    return this.api.getCompanyBankAccount(id).pipe(
      map((res) => ({ ...res })),
      tap((res) => {
        if (res) {
          this.data.id = res.id;
          this.data.merchantId = res.merchantId;
          this.data.currency = res.currency;
          this.data.payeeName = res.payeeName;
          this.data.beneficiaryAccountNumber = res.beneficiaryAccountNumber;
          this.data.beneficiaryBank = res.beneficiaryBank;
          this.data.bankBranches = res.bankBranches;
          this.data.swiftCode = res.swiftCode;
          this.data.payeeAddress = res.payeeAddress;
          this.data.receivingBankAddress = res.receivingBankAddress;
          this.data.correspondentBankInfo = res.correspondentBankInfo;
          this.data.singleDayDepositUpperLimit = res.singleDayDepositUpperLimit;
          this.data.balanceUpperLimit = res.balanceUpperLimit;
          this.data.singleDepositUpperLimit = res.singleDepositUpperLimit;
          this.data.singleDepositLowerLimit = res.singleDepositLowerLimit;
          this.data.isEnable = res.isEnable;
        }
      })
    );
  }

  onReset() {
    this.data = {
      id: '',
      merchantId: '',
      currency: '',
      payeeName: '',
      beneficiaryAccountNumber: '',
      beneficiaryBank: '',
      bankBranches: '',
      swiftCode: '',
      payeeAddress: '',
      receivingBankAddress: '',
      correspondentBankInfo: '',
      singleDayDepositUpperLimit: 0,
      balanceUpperLimit: 0,
      singleDepositUpperLimit: 0,
      singleDepositLowerLimit: 0,
      isEnable: true,
    };
  }

  //回到上级菜单
  onBack(): void {
    this.router.navigate([`/money/companyAccountManagement`]);
  }

  //保存编辑
  onConfirm(): void {
    const {
      data: { currency, payeeName, beneficiaryAccountNumber, beneficiaryBank },
    } = this;
    if (
      currency.trim().length > 0 &&
      payeeName.trim().length > 0 &&
      beneficiaryAccountNumber.trim().length > 0 &&
      beneficiaryBank.trim().length > 0
    ) {
      //merchantId:908740293083205
      const params = this.data;
      this.loading(true);
      this.api.updateCompanyBankAccount(params).subscribe((res) => {
        if (res === true) {
          this.hind('payment.companyAccountManagement.successfullyModified', true);
        } else {
          this.hind('payment.companyAccountManagement.failEdit', false);
        }
        this.loading(false);
      });
    } else {
      if (!(currency.trim().length > 0)) {
        this.hind('payment.companyAccountManagement.currencyBeEmpty', false);
        return;
      }
      if (!(payeeName.trim().length > 0)) {
        this.hind('payment.companyAccountManagement.PayeeNameCannotEmpty', false);
        return;
      }
      if (!(beneficiaryAccountNumber.trim().length > 0)) {
        this.hind('payment.companyAccountManagement.accountNumberCannotEmpty', false);
        return;
      }
      if (!(beneficiaryBank.trim().length > 0)) {
        this.hind('payment.companyAccountManagement.receivingBankCannotEmpty', false);
        return;
      }
    }
  }

  // 信息提示
  hind(msgLang: string, successed: boolean) {
    return this.appService.showToastSubject.next({ msgLang, successed });
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
