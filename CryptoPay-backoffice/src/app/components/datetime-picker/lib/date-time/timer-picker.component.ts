import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { range, throttle } from 'lodash';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgFor } from '@angular/common';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'owl-time-picker',
  exportAs: 'OwlTimePicker',
  templateUrl: './timer-picker.component.html',
  styleUrls: ['./timer-picker.component.scss'],
  standalone: true,
  imports: [CdkConnectedOverlay, NgFor],
})
export class OwlTimerPickerComponent implements OnInit, ControlValueAccessor, OnChanges {
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    @Self() @Optional() public ngControl: NgControl // optional修饰 外部没有提供control也能使用
  ) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  hours = range(24);
  minutes = range(60);
  seconds = range(60);
  baseHeight = 32;

  @ViewChildren('target') target!: QueryList<ElementRef<HTMLDivElement>>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _change = (value: any) => {};
  private _touched = () => {};
  private _value = '';

  get isOpen() {
    return this.show;
  }
  set isOpen(v) {
    this.showChange.emit(v);
  }

  @Input('show') show = false;
  @Input('origin') origin!: any;

  @Input('value')
  get value(): any {
    return this._value;
  }
  set value(newValue: any) {
    this._value = newValue;
  }

  @Output('valueChange') readonly valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('showChange') readonly showChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('confirm') readonly confirm: EventEmitter<any> = new EventEmitter<any>();

  scroll = throttle(this.onScroll, 100, {
    leading: false,
    trailing: true,
  }) as any;

  /** getters */
  get timeList() {
    return [this.hours, this.minutes, this.seconds].slice(0, this.timeValue.length);
  }
  get isNullValue() {
    return !this._value || !this._value.split(':').length;
  }
  get timeValue() {
    return this.isNullValue ? [undefined, undefined] : this._value.split(':');
  }

  /** methods */
  close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this._touched();
    }
  }

  onItemClick(dom, i, val, index): void {
    const value = this.isNullValue ? ['00', '00'] : [...this.timeValue];
    value[index] = val.toString().padStart(2, '0');

    this._value = value.join(':');
    this.setScroll(dom, i);
  }

  setScroll(dom, i): void {
    if (!dom) return;
    dom.scrollTop = i * this.baseHeight;
  }

  onConfirm(): void {
    this._change(this.value);
    this._touched();
    this.valueChange.emit(this.value);
    this.confirm.emit(this.value);
    this.close();
    this._changeDetectorRef.detectChanges(); // 立即触发改变当前和子组件变化检测
  }

  async setDefaultValue(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));

    this.timeValue.forEach((val, i) => {
      if (!this.target) return;
      const dom = this.target.toArray()[i]?.nativeElement;
      const index = this.timeList[i].indexOf(+val);

      if (index == -1) return;

      this.setScroll(dom, index);
    });
  }

  onScroll(e): void {
    const dom = e.target;
    const top = dom.scrollTop;

    const i = Math.round(top / this.baseHeight);
    this.setScroll(dom, i);
  }

  /** lifeCycle */
  ngOnInit(): void {}

  registerOnChange(fn: any): void {
    this._change = fn;
  }

  registerOnTouched(fn: any): void {
    this._touched = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['show'] && changes['show']['currentValue']) || changes['value']) {
      // 还原初始值
      if (this.ngControl) {
        this._value = this.ngControl.control!.value;
      }

      this.setDefaultValue().then();
    }
  }
}
