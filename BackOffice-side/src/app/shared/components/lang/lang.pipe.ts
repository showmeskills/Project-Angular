import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CurLangService, LangService } from 'src/app/shared/components/lang/lang.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangKey, LangParams } from 'src/app/shared/interfaces/common.interface';

@Pipe({
  name: 'preLang',
  pure: false,
  standalone: true,
})
export class PreLangPipe implements PipeTransform, OnDestroy {
  constructor(
    private curLang: CurLangService,
    private _ref: ChangeDetectorRef
  ) {}

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
  constructor(
    private lang: LangService,
    private _ref: ChangeDetectorRef
  ) {}

  value: string;
  private _destroy$ = new Subject<void>();
  private cacheValue: null | undefined | string = null;

  transform(value: LangKey, params?: LangParams): any {
    if (this.cacheValue === value) return this.value;
    this.cacheValue = value;

    this._destroy$.next();
    this._destroy$.complete();
    this._destroy$ = new Subject<void>();

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
