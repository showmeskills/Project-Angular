import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { AppService } from 'src/app/app.service';
import { distinctUntilChanged, filter, first, forkJoin, of, switchMap } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { NgFor, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'cold-edit',
  templateUrl: './cold-edit.component.html',
  styleUrls: ['./cold-edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    NgFor,
    NgIf,
    FormWrapComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class ColdEditComponent implements OnInit {
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
  networkList: any[] = [];
  formGroup: any = this.fb.group({
    network: ['', Validators.required],
    address: ['', Validators.required, this.validateAddress()],
  });

  /** getters */
  get isAdd() {
    return !this.address;
  }

  get isEdit() {
    return !this.isAdd;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([this.api.getWalletPrimary(), this.isEdit ? this.getDetail$() : of(undefined)]).subscribe(([list]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.networkList = list;
    });
  }

  /** methods */
  /** 获取数据 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.getDetail$().subscribe();
  }

  getDetail$() {
    // TODO 暂时没有分页后期有分页的话让后台新增获取详情的接口 Freeze / Orange
    return this.api.getColdwallet().pipe(
      tap((res) => {
        this.appService.isContentLoadingSubject.next(false);
        res = res.find((e) => e.address === this.address && e.network === this.network);

        this.generateForm(res);
      })
    );
  }

  /** 生成控制表单 */
  generateForm(data?: any) {
    this.formGroup = this.fb.group({
      network: [data?.network || '', Validators.required],
      address: [data?.address || '', Validators.required],
    });
  }

  /** 提交表单 */
  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || this.formGroup.pending) return;

    this.appService.isContentLoadingSubject.next(true);

    this.api
      .coldwallet({
        network: this.formGroup.value.network,
        address: this.formGroup.value.address,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        const successed = res === true;
        this.appService.showToastSubject.next({ msg: successed ? '操作成功！' : '操作失败！', successed });

        if (!successed) return;
        this.onBack();
      });
  }

  onBack() {
    this.router.navigate(['/wallet/cold']);
  }

  /**
   * 验证地址是否正确
   */
  validateAddress(): (control: AbstractControl) => any {
    return (control: AbstractControl) =>
      control.valueChanges.pipe(
        switchMap((address) => of({ address, network: this.formGroup.value.network })),
        distinctUntilChanged(isEqual),
        filter((val) => !!val.address),
        debounceTime(300),
        switchMap(({ address: Address, network: Network }) => this.api.verifyCoinAddress({ Address, Network })),
        map((res) => (res === true ? null : { incompatible: true })),
        first() // 截断流
      );
  }
}
