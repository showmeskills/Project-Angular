import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'hot-edit',
  templateUrl: './hot-edit.component.html',
  styleUrls: ['./hot-edit.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    ModalFooterComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class HotEditComponent implements OnInit {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private api: WalletApi,
    private appService: AppService,
    private activatedRoute: ActivatedRoute
  ) {
    const { address, network } = this.activatedRoute.snapshot.params;
    this.address = address;
    this.network = network;
  }

  data: any = {};
  address: string;
  network: string;
  formArray: any = this.fb.array([]);

  /** getters */
  get isAdd() {
    return !this.data || JSON.stringify(this.data) === '{}';
  }

  get isEdit() {
    return !this.isAdd;
  }

  /** 表单数组 */
  get formArr() {
    return this.formArray.controls as any[];
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.getDetail();
  }

  /** methods */
  /** 获取数据 */
  getDetail() {
    // TODO 暂时没有分页后期有分页的话让后台新增获取详情的接口 Freeze / Orange
    this.appService.isContentLoadingSubject.next(true);
    this.api.hotwallet().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      res = res.find((e) => e.address === this.address && e.network === this.network);

      if (res) {
        this.data = res;
        this.generateForm();
      } else {
        this.data = {};
      }
    });
  }

  /** 设置表单控制 */
  setControl(data: any) {
    return this.fb.group({
      coin: [data?.coin || ''],
      balance: [data?.balance || ''],
      status: [data?.status === 'Normal' || false],
    });
  }

  /** 生成控制表单 */
  generateForm() {
    if (!this.data?.['tokens'] || !this.data?.['tokens']?.length) {
      return this.formArray.clear();
    }

    this.formArray = this.fb.array(this.data?.['tokens']?.map((v) => this.setControl(v)));
  }

  /** 提交表单 */
  onSubmit() {
    this.appService.isContentLoadingSubject.next(true);

    const coins = this.formArr.map((e) => ({ coin: e.value.coin, status: e.value.status ? 'Normal' : 'Disable' })); // [ NotActive, Normal, Disable, Deleted ]

    this.api.hotwallet_update({ network: this.data.network, coins }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      const successed = res === true;
      this.appService.showToastSubject.next({ msg: successed ? '操作成功！' : '操作失败！', successed });

      if (!successed) return;
      this.onBack();
    });
  }

  onBack() {
    this.router.navigate(['/wallet/hot']);
  }
}
