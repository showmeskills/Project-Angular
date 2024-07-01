import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CurLangService, LangService } from 'src/app/shared/components/lang/lang.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangParams } from 'src/app/shared/interfaces/common.interface';

@Pipe({
  name: 'preLang',
  pure: false,
  standalone: true,
})
export class PreLangPipe implements PipeTransform, OnDestroy {
  constructor(private curLang: CurLangService, private _ref: ChangeDetectorRef) {}

  value: string;
  private _destroy$ = new Subject<void>();

  transform(value: string, params?: LangParams): any {
    this.curLang
      .get(value, params)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res: any) => {
        this.value = res !== undefined ? res : this.value;
        this._ref.markForCheck(); // 手动触发检测变化更新视图
      });

    return this.value;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

@Pipe({
  name: 'lang',
  pure: false,
  standalone: true,
})
export class LangPipe implements PipeTransform, OnDestroy {
  constructor(private lang: LangService, private _ref: ChangeDetectorRef) {}

  value: string;
  private _destroy$ = new Subject<void>();

  transform(value: string, params?: LangParams): any {
    this.lang
      .get(value, params)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res: any) => {
        this.value = res !== undefined ? res : this.value;
        this._ref.markForCheck(); // 手动触发检测变化更新视图
      });

    return this.value;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
