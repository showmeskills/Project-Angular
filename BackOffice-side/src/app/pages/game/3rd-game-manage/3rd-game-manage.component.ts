import { Component, OnDestroy, OnInit } from '@angular/core';
import { gameTurnoverInfos } from 'src/app/shared/interfaces/game';
import { AppService } from 'src/app/app.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameApi } from 'src/app/shared/api/game.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProviderService } from 'src/app/pages/game/game.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';

import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import {
  CheckboxArrayControlDirective,
  InputFloatDirective,
  InputNumberDirective,
  InputPercentageDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { DestroyService } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'app-3rd-game-manage',
  templateUrl: './3rd-game-manage.component.html',
  styleUrls: ['./3rd-game-manage.component.scss'],
  standalone: true,
  providers: [DestroyService],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    InputTrimDirective,
    FormWrapComponent,
    InputPercentageDirective,
    AngularSvgIconModule,
    CheckboxArrayControlDirective,
    InputNumberDirective,
    InputFloatDirective,
    LangPipe,
    AttrDisabledDirective,
  ],
})
export class ThreerdGameManageComponent implements OnInit, OnDestroy {
  constructor(
    public appService: AppService,
    private api: GameApi,
    private router: Router,
    public subHeaderService: SubHeaderService,
    public providerService: ProviderService,
    public ls: LocalStorageService,
    private fb: FormBuilder,
    private destroy$: DestroyService
  ) {}

  formGroup = this.fb.group({
    product: this.fb.array([this.generateProduct()]),
  });

  type = {
    1: 'Sports',
    2: 'E-sports',
    3: 'Lottery',
    4: 'LiveCasino',
    5: 'Casino',
    6: 'Poker',
  };

  private _destroyed = new Subject<void>();

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  /**
   * 生成产品表单
   */
  generateProduct(data?: gameTurnoverInfos) {
    return this.fb.group({
      gameType: [data?.gameType || ''],
      turnoverPercentage: [data?.turnoverPercentage || 100], // 体育场馆费 1-100
      isTurnover: [data?.isTurnover ?? false], // 是否启用
    });
  }

  onSubmit(): void {
    console.log(this.formGroup);
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateGameTurnover({
        tenantId: this.subHeaderService.merchantCurrentId,
        gameTurnoverInfos: this.formGroup.value.product!.map((e) => ({
          gameType: e.gameType,
          isTurnover: e.isTurnover,
          turnoverPercentage: e.turnoverPercentage,
        })) as any,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res === true);
      });
  }

  /**
   * 返回列表页
   */
  goBack() {
    this.router.navigate(['/game/provider']);
  }

  ngOnDestroy(): void {}

  // 获取数据
  loadData() {
    this.loading(true);
    this.api
      .getGameTurnover(this.subHeaderService.merchantCurrentId)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res: { gameTurnoverInfos: gameTurnoverInfos[] }) => {
        this.formGroup.setControl('product', this.fb.array(res.gameTurnoverInfos.map((e) => this.generateProduct(e))));
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }
}
