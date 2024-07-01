// 以下做参考例子 pure演示
/**
 使用 currencyIcon 指令代替
@Pipe({
  name: 'currencyIcon',
  pure: false, // 不纯，检测周期中调用
})
export class CurrencyIcon implements PipeTransform {
  constructor(
    private api: SelectApi,
    private common: CommonService,
  ) {
    this.common.currency$.pipe(
      takeUntil(this._destroy$)
    ).subscribe((res: any[]) => {
      this.currency = res;
    });
  }

  currency: any[] = [];
  _destroy$ = new Subject<void>();

  transform(value: unknown, ...args: unknown[]): string {
    return this.currency.find(e => e.code === value)?.icon || '';
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
 @docs-private
*/
