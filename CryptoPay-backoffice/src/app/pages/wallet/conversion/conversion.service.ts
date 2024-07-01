import { Component, Injectable, Input, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ThemeType } from 'src/app/shared/interfaces/base.interface';
import { TradeStatusEnum } from 'src/app/shared/interfaces/conversion';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor() {}

  statusList: { name: string; lang: string; value: string; type: ThemeType }[] = [
    { name: '创建', lang: 'wallet.conversion.created', value: TradeStatusEnum.Created, type: 'primary' },
    { name: '处理', lang: 'wallet.conversion.processing', value: TradeStatusEnum.Processing, type: 'yellow' },
    { name: '成功', lang: 'wallet.conversion.success', value: TradeStatusEnum.Success, type: 'success' },
    { name: '失败', lang: 'wallet.conversion.failed', value: TradeStatusEnum.Failed, type: 'danger' },
  ];

  /**
   * 获取交易状态
   */
  getStatus(status: string) {
    return this.statusList.find((e) => e.value === status);
  }
}

@Pipe({
  name: 'conversionStatus',
  standalone: true,
})
export class ConversionStatusPipe implements PipeTransform, OnDestroy {
  private _value: any;
  private _result: string;
  private _destroyed$ = new Subject<void>();

  constructor(private conversionService: ConversionService, private lang: LangService) {}

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  transform(value: any): any {
    if (this._value === value) return this._result;
    this._value = value;

    this.lang
      .get(this.conversionService.getStatus(value)?.lang || '', { $defaultValue: '-' })
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        this._result = res;
      });

    return this._result;
  }
}

@Component({
  selector: 'conversion-status, [conversion-status]',
  standalone: true,
  template: `<app-label [type]="cur?.type">{{ cur?.lang | lang : { $defaultValue: '-' } }}</app-label>`,
  imports: [ConversionStatusPipe, LangModule, LabelComponent],
})
export class ConversionStatusComponent implements OnInit {
  constructor(public conversionService: ConversionService) {}

  ngOnInit(): void {}

  @Input() status?: string | TradeStatusEnum;

  get cur() {
    return this.conversionService.getStatus(this.status || '');
  }
}
