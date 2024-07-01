import { BehaviorSubject, filter } from 'rxjs';

export class UEditor {
  private _value: any;
  private _ueditorChange = new BehaviorSubject<any>(undefined);

  get value() {
    return this._value;
  }

  set value(v: any) {
    this._value = v;
    this.change(v);
  }

  /** 当前编辑器实例 */
  public instance: any;

  get UE() {
    return this._ueditorChange.asObservable().pipe(filter((e) => e)); // 过滤空UE
  }

  change(ueditor: any): void {
    this._ueditorChange.next(ueditor);
  }

  destroy(): void {
    // this._ueditorChange.complete();
    // this.value = undefined;
    // this.instance = undefined;
  }
}
