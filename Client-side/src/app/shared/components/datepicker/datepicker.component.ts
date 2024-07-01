import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment, { Moment } from 'moment';
import { AppService } from 'src/app/app.service';
import { LayoutService } from '../../service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class DatepickerComponent implements OnInit, OnChanges {
  constructor(
    private dateAdapter: DateAdapter<Moment>,
    private layout: LayoutService,
    private appService: AppService,
  ) {}

  isH5!: boolean;
  opened: boolean = false;
  hov: boolean = false;
  foc: boolean = false;

  @Input() panelClass: string = 'customize';

  @Input() versatileMode = false;
  @Input() returnString = false;

  @Input() dateValue: any = '';
  @Output() dateValueChange = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();

  @Input() startAt: any;
  @Input() minDate?: Moment;
  @Input({
    transform: (v: Moment | string | undefined) => {
      if (v && v.constructor === String) {
        return DatepickerComponent.transformDate(v);
      }
      return v;
    },
  })
  maxDate: Moment | string | undefined;
  static transformDate(v: string) {
    switch (v) {
      case 'now':
        return moment();
      default:
        return;
    }
  }

  @Input() disabled: boolean = false;
  @Input() placeholder: any = '';
  @Input() readonly: boolean = false;
  @Input() size: 'large' | 'medium' | 'small' = 'medium';
  @Input() error: boolean = false;

  @ViewChild('picker') picker!: MatDatepicker<Moment>;

  dateValueDay: string = '';
  dateValueDayFormat = (v: string) => {
    const valt = v.replace(/[^0-9]/g, '');
    const valn = Number(valt);
    if (valn > 31) return '31';
    if (valt === '00') return '01';
    return valt.slice(-2);
  };
  autoCompleteDay() {
    if (this.dateValueDay === '0') {
      this.dateValueDay = '01';
      this.checkValid();
    } else if (this.dateValueDay.length === 1) {
      this.dateValueDay = '0' + this.dateValueDay;
      this.checkValid();
    }
  }

  dateValueMonth: string = '';
  dateValueMonthFormat = (v: string) => {
    const valt = v.replace(/[^0-9]/g, '');
    const valn = Number(valt);
    if (valn > 12) return '12';
    if (valt === '00') return '01';
    return valt.slice(-2);
  };
  autoCompleteMonth() {
    if (this.dateValueMonth === '0') {
      this.dateValueMonth = '01';
      this.checkValid();
    } else if (this.dateValueMonth.length === 1) {
      this.dateValueMonth = '0' + this.dateValueMonth;
      this.checkValid();
    }
  }

  dateValueYear: string = '';
  dateValueYearFormat = (v: string) => {
    const max = moment().year();
    const valt = v.replace(/[^0-9]/g, '');
    const valn = Number(valt);
    if (valn > max) return String(max);
    if (valt === '0000') return '0001';
    return valt.slice(-4);
  };
  autoCompleteYear() {
    const nowYear = String(moment().year()).split('');
    // 这里的逻辑基本就是根据用户输入的数字，在4位数年份的范围内，智能补全为最接近但不大于此刻的数字
    switch (this.dateValueYear.length) {
      case 1: {
        if (Number(this.dateValueYear) <= Number(nowYear[3])) {
          this.dateValueYear = nowYear[0] + nowYear[1] + nowYear[2] + this.dateValueYear;
        } else {
          this.dateValueYear = String(Number(nowYear[0] + nowYear[1] + nowYear[2]) - 1) + this.dateValueYear;
        }
        this.checkValid();
        break;
      }
      case 2: {
        if (Number(this.dateValueYear) <= Number(nowYear[2] + nowYear[3])) {
          this.dateValueYear = nowYear[0] + nowYear[1] + this.dateValueYear;
        } else {
          this.dateValueYear = String(Number(nowYear[0] + nowYear[1]) - 1) + this.dateValueYear;
        }
        this.checkValid();
        break;
      }
      case 3: {
        if (Number(this.dateValueYear) <= Number(nowYear[1] + nowYear[2] + nowYear[3])) {
          this.dateValueYear = nowYear[0] + this.dateValueYear;
        } else {
          this.dateValueYear = String(Number(nowYear[0]) - 1) + this.dateValueYear;
        }
        this.checkValid();
        break;
      }
      default:
        break;
    }
  }

  dateValueInputChange(val: string, length: number, nextFocus: () => void = () => {}) {
    // 输入完成自动跳到下一个输入框
    if (String(val).length >= length) nextFocus();
    this.checkValid();
  }

  inputKeyDown(e: KeyboardEvent, val: string, preFocus: () => void = () => {}) {
    if (e.keyCode === 8 && !val) {
      e.preventDefault();
      // 删完自动跳到上一个输入框
      preFocus();
    }
  }

  invalidDate = false;
  invalidError = false;

  checkValid = () => {
    if (this.dateValueDay.length === 2 && this.dateValueMonth.length === 2 && this.dateValueYear.length === 4) {
      const date = moment(`${this.dateValueYear}-${this.dateValueMonth}-${this.dateValueDay}`);
      const tooBig = this.maxDate && date.diff(moment(this.maxDate), 'days', true) > 0;
      const tooSmall = this.minDate && date.diff(moment(this.minDate), 'days', true) < 0;
      if (date.isValid() && !tooBig && !tooSmall) {
        this.invalidError = false;
        this.invalidDate = false;
        this.dateValue = date;
        this.change();
      } else {
        this.invalidError = true;
        this.invalidDate = true;
        this.clearValue();
      }
    } else {
      this.invalidError = true;
      this.invalidDate = false;
      this.clearValue();
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.versatileMode && changes.dateValue?.currentValue) {
      [this.dateValueYear, this.dateValueMonth, this.dateValueDay] = moment(this.dateValue)
        .format('YYYY-MM-DD')
        .split('-');
      this.checkValid();
    }
  }

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(x => (this.isH5 = x));

    // 设置语言，支持的语言列表 参考 https://github.com/moment/moment/tree/develop/src/locale
    if (this.appService.languageCode != 'en-us') {
      this.dateAdapter.setLocale(this.appService.languageCode);
    }
  }

  clearValue() {
    this.dateValue = undefined;
    this.change();
  }

  dateChange(event: MatDatepickerInputEvent<Moment>) {
    if (this.versatileMode) {
      [this.dateValueYear, this.dateValueMonth, this.dateValueDay] = moment(this.dateValue)
        .format('YYYY-MM-DD')
        .split('-');
      this.checkValid();
    }
    this.change();
  }

  change() {
    const v = this.returnString
      ? this.dateValue
        ? moment(this.dateValue).format('YYYY-MM-DD')
        : ''
      : this.dateValue
        ? moment(this.dateValue)
        : undefined;
    this.dateValueChange.emit(v);
    this.onChange.emit(v);
  }

  open() {
    this.picker.open();
  }

  dateInput(event: MatDatepickerInputEvent<Moment>) {}
}
