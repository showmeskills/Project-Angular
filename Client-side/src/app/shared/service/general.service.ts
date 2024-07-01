import { Clipboard } from '@angular/cdk/clipboard';
import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 缓存操作符
 *
 * @param bufferTime 缓存时间(毫秒)
 * @param whether 是否缓存的判断函数，true 缓存，false 不缓存。如果不传，则直接判断此操作符前的数据true/false
 * @returns
 */
export const cacheValue =
  <T>(bufferTime: number, whether?: (value: T) => boolean) =>
  (source: Observable<T>) => {
    let cache: { value: T; expires: number } | undefined = undefined;
    return new Observable<T>(observer => {
      if (cache && cache.expires > Date.now()) {
        observer.next(cache.value);
        observer.complete();
      } else {
        source
          .pipe(
            tap(value => {
              let expires = Date.now() + bufferTime;
              if (whether === undefined) {
                if (!value) expires = 0;
              } else {
                if (!whether(value)) expires = 0;
              }
              cache = { value, expires: expires };
            }),
          )
          .subscribe(observer);
      }
      return observer;
    });
  };

/** 邮箱验证正则，参考微软源码 https://github.com/microsoft/referencesource/blob/master/System.ComponentModel.DataAnnotations/DataAnnotations/EmailAddressAttribute.cs */
export const EMAIL_VALID_REGEXP =
  // eslint-disable-next-line no-control-regex, no-useless-escape
  /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(
    private clipboard: Clipboard,
    private platform: Platform,
  ) {}

  copyText(content: string) {
    return this.clipboard.copy(content);
  }

  //阻止Sfari双击放大的功能
  blockSfariDoubleClick() {
    if (this.platform.IOS) {
      let lastTouchEnd = 0; //更新手指弹起的时间
      document.documentElement.addEventListener('touchstart', function (event) {
        //多根手指同时按下屏幕，禁止默认行为
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      });
      document.documentElement.addEventListener(
        'touchend',
        function (event) {
          const now = new Date().getTime();
          if (now - lastTouchEnd <= 300) {
            //当两次手指弹起的时间小于300毫秒，认为双击屏幕行为
            event.preventDefault();
          } else {
            // 否则重新手指弹起的时间
            lastTouchEnd = now;
          }
        },
        false,
      );
      //阻止双指放大页面
      document.documentElement.addEventListener('gesturestart', function (event) {
        event.preventDefault();
      });
    }
  }

  /**
   * 获取开始和结束时间
   *
   * @param type 计算值
   * @param unit 当type是数字时候，用作单位
   * @param useUTC0 是否获取utc0的时间
   * @returns [number,number]
   */
  getStartEndDateArray(
    type: string | number,
    unit: 'y' | 'M' | 'd' | 'h' | 'm' | 's' = 'd',
    useUTC0: boolean = false,
  ): number[] {
    const _moment = () => (useUTC0 ? moment().utcOffset(0) : moment());
    switch (type) {
      case 'currentMonth':
        return [_moment().startOf('month').valueOf(), _moment().endOf('month').add(1, 'd').startOf('day').valueOf()];
      case 'currentWeek':
        return [_moment().startOf('week').valueOf(), _moment().endOf('week').add(1, 'd').startOf('week').valueOf()];
      case 'yesterday':
        return [_moment().startOf('day').subtract(1, 'days').valueOf(), _moment().startOf('day').valueOf()];
      case 'today':
        return [_moment().startOf('day').valueOf(), _moment().add(1, 'd').startOf('day').valueOf()];
      case '3days':
        return [_moment().startOf('day').subtract(2, 'days').valueOf(), _moment().add(1, 'd').startOf('day').valueOf()];
      case '7days':
        return [_moment().startOf('day').subtract(6, 'days').valueOf(), _moment().add(1, 'd').startOf('day').valueOf()];
      case '30days':
        return [
          _moment().startOf('day').subtract(29, 'days').valueOf(),
          _moment().add(1, 'd').startOf('day').valueOf(),
        ];
      case '90days':
        return [
          _moment().startOf('day').subtract(89, 'days').valueOf(),
          _moment().add(1, 'd').startOf('day').valueOf(),
        ];
      default:
        if (typeof type === 'number') {
          return [
            _moment().startOf('day').subtract(type, unit).valueOf(),
            _moment().add(1, 'd').startOf('day').valueOf(),
          ];
        }
        return [0, 0];
    }
  }

  getNumberRange(arr: number[], v: number): number {
    let k = null;
    for (const key in arr) {
      if (v >= arr[key]) {
        k = arr[key];
        break;
      }
    }
    return k!;
  }

  /**
   * 自定义时间 开始，结束 时间
   *
   * @param value 时间戳
   * @param type 开始 结束 数字类型 现在
   * @param unit 时间单位
   * @param valueIsUTC0 给来的时间戳本身是个utc0的时间
   * @returns
   */
  getCustomDate(
    value: string | number,
    type: 'start' | 'end' | number | 'now',
    unit: 'y' | 'M' | 'd' | 'h' | 'm' | 's' = 'd',
    valueIsUTC0: boolean = false,
  ): number {
    let results = 0;
    switch (type) {
      case 'start':
        results = moment(value).startOf('day').valueOf();
        break;
      case 'end':
        results = moment(value).add(1, unit).startOf('day').valueOf();
        break;
      default:
        if (typeof type === 'number') {
          if (type > 0) {
            results = moment(value).add(type, unit).startOf(unit).valueOf();
          } else if (type < 0) {
            results = moment(value).subtract(Math.abs(type), unit).startOf(unit).valueOf();
          }
        } else {
          results = moment().valueOf();
        }
    }
    if (valueIsUTC0) {
      return moment(moment(results).format('YYYY-MM-DDTHH:mm:ss-00:00')).valueOf();
    } else {
      return results;
    }
  }

  /**
   * 转13位时间戳
   *
   * @param value
   * @returns
   */
  toFullTimestamp(value: number | any): number {
    if (typeof value === 'number') {
      return moment(Number(String(value).padEnd(13, '0'))).valueOf();
    } else {
      return moment(Number(value)).valueOf();
    }
  }
}
