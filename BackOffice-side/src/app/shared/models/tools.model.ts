/**
 * JSON转excel下载
 * https://blog.csdn.net/qq_34623560/article/details/79928248
 * @param JSONData
 * @param FileName
 * @param title
 * @param filter
 * @constructor
 */
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import moment, { DurationInputArg2 } from 'moment';
import { AES, enc, mode, pad } from 'crypto-js';
import { DurationInputArg1, MomentInput } from 'moment/moment';
import _, { cloneDeep, compact, isArray, isEmpty, isPlainObject, transform } from 'lodash';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export const weekList = [
  { num: 7, day: 0, label: '日', value: 'Sunday', lang: 'common.week.day' },
  { num: 1, day: 1, label: '一', value: 'Monday', lang: 'common.week.one' },
  { num: 2, day: 2, label: '二', value: 'Tuesday', lang: 'common.week.two' },
  { num: 3, day: 3, label: '三', value: 'Wednesday', lang: 'common.week.three' },
  { num: 4, day: 4, label: '四', value: 'Thursday', lang: 'common.week.four' },
  { num: 5, day: 5, label: '五', value: 'Friday', lang: 'common.week.five' },
  { num: 6, day: 6, label: '六', value: 'Saturday', lang: 'common.week.six' },
];

/**
 * 自定义excel格式化
 * 分析结果jira：https://gbd730.atlassian.net/browse/WU2021-17455
 */
export class ExcelFormat {
  _value: string | number;
  _className: string;
  _isNum = false;

  get type() {
    return this._isNum ? 'x:num' : 'x:str';
  }

  /**
   * 文本
   * @param value {string | number}
   */
  static str(value: string) {
    const excelFormat = new this();
    value = String(value);
    excelFormat._value = value;
    excelFormat._className = 'xl-text';

    return excelFormat;
  }

  /**
   * 数值 - 金额保留8位小数
   * @param value {string | number}
   */
  static amount(value: string | number) {
    const excelFormat = new this();
    excelFormat._className = 'xl-amount';
    excelFormat._value = value;
    excelFormat._isNum = true;

    return excelFormat;
  }

  /**
   * 数值 - 保留两位小数
   * @param value {string | number}
   */
  static num2(value: string | number) {
    const excelFormat = new this();
    excelFormat._className = 'xl-num2';
    excelFormat._value = value;

    return excelFormat;
  }
}

export function JSONToExcelDownload(JSONData: string | any, FileName: string, title?: Array<string>, filter?: string) {
  if (!JSONData) return;
  //转化json为object
  const arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

  let excel = '<table>\n';

  //设置表头
  let row = '<tr>\n';

  if (title) {
    // 使用标题项
    for (const i in title) {
      row += `<th class="xl-th">${title[i]}</th>\n`;
    }
  } else {
    // 不使用标题项
    for (const i in arrData[0]) {
      row += `<th class="xl-th">${i}</th>\n`;
    }
  }

  excel += row + '</tr>\n';

  // 设置数据
  for (let i = 0; i < arrData.length; i++) {
    let row = '<tr>\n';

    for (const index in arrData[i]) {
      //判断是否有过滤行
      if (!filter || (filter && filter.indexOf(index) == -1)) {
        const value = arrData[i][index] == null ? '' : arrData[i][index];

        if (value instanceof ExcelFormat) {
          row += `<td class="${value._className}" ${value.type}="${value._value}"></td>\n`;
        } else {
          row += `<td class="xl-normal">${value}</td>\n`;
        }
      }
    }

    excel += row + '</tr>\n';
  }

  excel += '</table>';

  let excelFile = `
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="WPS Office ET">
    <style>
      <!-- @page {
        margin:1.00in 0.75in 1.00in 0.75in;
        mso-header-margin:0.50in;
        mso-footer-margin:0.50in;
      }
      
      /* 格式化单元格：标题常规 */
      .xl-th {
          mso-style-parent:style0;
          text-align:center;
          white-space:normal;
          font-size:10.0pt;
          font-weight:700;
          font-family:Arial Unicode MS;
          mso-font-charset:134;
      }
      
      /* 格式化单元格：内容常规 */
      .xl-normal {
          mso-style-parent:style0;
          text-align:center;
          white-space:normal;
          font-size:10.0pt;
          font-family:Arial Unicode MS;
          mso-font-charset:134;
      }
      
      /* 格式化单元格：时间 */
      .xl-time {
          mso-style-parent:style0;
          mso-number-format:"yyyy/m/d\\\\ h:mm";
          text-align:center;
          white-space:normal;
          font-size:10.0pt;
          font-family:Arial Unicode MS;
          mso-font-charset:134;
      }
      
      /* 格式化单元格：数值-金额保留8位小数 */
      .xl-amount {
          mso-style-parent:style0;
          mso-number-format:"\\#\\,\\#\\#0\\.00000000_\\)\\;\\[Red\\]\\\\\\(\\#\\,\\#\\#0\\.00000000\\\\\\)";
          text-align:center;
          white-space:normal;
          font-size:10.0pt;
          font-family:Arial Unicode MS;
          mso-font-charset:134;
      }
      
      /* 格式化单元格：数值-保留两位小数 */
      .xl-num2 {
          mso-style-parent:style0;
          mso-number-format:"\\#\\,\\#\\#0\\.00";
          text-align:center;
          white-space:normal;
          font-size:10.0pt;
          font-family:Arial Unicode MS;
          mso-font-charset:134;
      }
      
      /* 格式化单元格：文本 */
      .xl-text {
        mso-style-parent:style0;
        mso-number-format:"\\@";
        text-align:center;
        white-space:normal;
        font-size:10.0pt;
        font-family:Arial Unicode MS;
        mso-font-charset:134;
      }
      -->
    </style>
    <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>worksheet</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
    <![endif]-->
  </head>
  <body>
    ${excel}
  </body>
</html>
`;

  const uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile);

  const link = document.createElement('a');
  link.href = uri;

  link.style.cssText = 'visibility:hidden';
  link.download = FileName + '.xls';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 是否是上传图片的类型
 * @param ext
 * file对象中的type也是根据扩展名识别，如果修改扩展名也会随之修改。
 */
export function isUploadType(ext) {
  return ['png', 'jpg', 'jpeg', 'bmp', 'webp'].indexOf(ext.toLowerCase()) !== -1;
}

/**
 * file转base64
 * @param {File} file 文件对象
 * @return {Promise<string>}
 */
export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    if (!file) resolve(undefined);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

/**
 * 字节格式化
 * @param {*} bytes 要被格式化的字节
 * @param {string} pad 字节和单位直接的填充
 * @return {string} 返回格式化的字符串
 *
 * @example
 * formatBytes(1024); // -> 1.0Kb
 * formatBytes(1024, ' '); // -> 1.0 Kb
 */
export const formatBytes = (bytes: any, pad = ''): string => {
  const FORMATS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;

  if (!Number(bytes)) return '';
  while (1023 < bytes) {
    bytes /= 1024;
    ++i;
  }

  return (i ? Number.parseFloat(bytes.toFixed(2)) : bytes) + pad + FORMATS[i];
};

/**
 * 获取路由的data
 *
 * 如：{ path: 'foo', component: Foo, data: { name: 'Foo' } }
 * 将返回：{ name: 'Foo' }
 * @param route {ActivatedRoute} 激活的route
 */
export const getRouteData = (route: ActivatedRoute) => {
  while (route) {
    if (route.firstChild) {
      route = route.firstChild;
    } else if (route?.['snapshot']?.['data'] && Object.keys(route?.['snapshot']?.['data']).length) {
      return route?.['snapshot']?.['data'];
    } else {
      return null;
    }
  }

  return null;
};

// @ts-ignore https://github.com/MikeMcl/bignumber.js/issues/260#issuecomment-619364271
// 不能使用toFormat覆写会导致不会保留小数问题
BigNumber.prototype.customFormat = (function (u) {
  const format = BigNumber.prototype.toFormat;
  return function (dp, rm) {
    if (typeof dp === 'object' && dp) {
      let t = dp.minimumDecimalPlaces;
      if (t !== u) {
        // @ts-ignore
        return format.call(this, this.dp() < t ? t : u);
      }
      rm = dp.roundingMode;
      t = dp.maximumDecimalPlaces;
      if (t !== u) {
        // @ts-ignore
        return format.call(this.dp(t, rm));
      }
      t = dp.decimalPlaces;
      if (t !== u) {
        // @ts-ignore
        return format.call(this, t, rm);
      }
    }
    // @ts-ignore
    return format.call(this, dp, rm);
  };
})();

export interface BigNum extends BigNumber {
  customFormat(format: any): string;
}

export const bigNumber = (num: any): BigNum => {
  return new BigNumber(num || 0) as BigNum;
};

/**
 * 格式化金额
 * @param num
 * @param format
 */
/**custFlag判断是否进入覆写的方法 */
export const toFormatMoney = (
  num: any,
  format?: { minimumDecimalPlaces?: number; maximumDecimalPlaces?: number },
  custFlag = true
): string => {
  if (custFlag) {
    return bigNumber(num).customFormat(format);
  } else {
    return bigNumber(num).toFormat(format?.minimumDecimalPlaces);
  }
};

/**
 * 格式化时间
 * @param time
 * @param format
 */
export const timeFormat = (time: MomentInput, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!time || time === '0' || (typeof time === 'string' && !+time)) return '';

  return moment(+time).format(format);
};

/**
 * 格式化UTC时间
 * @param time
 * @param format
 */
export const timeUTCFormat = (time: MomentInput, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  typeof time === 'string' && !isNaN(+time) && (time = +time);

  return moment.utc(time).format(format);
};

/**
 * 时长格式化
 * @param duration
 * @param unit
 * @param format
 */
export const durationFormat = (duration: DurationInputArg1, unit: DurationInputArg2, format = 'HH:mm:ss'): string => {
  typeof duration === 'string' && !isNaN(+duration) && (duration = +duration);

  return moment.utc(moment.duration(duration || 0, unit).as('ms')).format(format);
};

/**
 * 格式化UTC-0转UTC-8时间
 * @param time
 * @param format
 */
export const timeUTCFormatLocal = (time: MomentInput, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  typeof time === 'string' && !isNaN(+time) && (time = +time);
  const formattedDate = moment(time).local().format(format);
  return formattedDate;
};

/**
 * 格式化时间
 * @param time
 * @param isEnd 是否为结束时间
 * @param toStringTime
 * @param carryEnd 标记为 为下一天的整点
 */
export const toDateStamp = (
  time: MomentInput,
  isEnd = false,
  toStringTime = false,
  carryEnd = true
): number | undefined => {
  if (!time) return undefined;

  let newTime = time && ((moment(time).format('YYYY-MM-DD') + ' 00:00:00') as any);

  if (isEnd) {
    newTime = moment(newTime);

    // Ring: 结束时间需要标记为下一天的整点否则会漏掉1毫秒
    if (carryEnd) {
      newTime = newTime.add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00';
    } else {
      newTime = newTime.format('YYYY-MM-DD') + ' 23:59:59.999';
    }
  }

  if (!moment(newTime).isValid()) return undefined;

  return (toStringTime ? newTime : +moment(newTime).format('x')) || undefined;
};

/**
 * @description 转UTC时间戳
 * @param date {MomentInput}
 * @param isEnd {Boolean} 是否为结束时间
 */
export const toUTCStamp = (date: MomentInput, isEnd = false) => {
  if (!+date!) return undefined;

  const res = moment(date);

  if (isEnd) {
    res.add(1, 'day').startOf('day');
  }

  return res.utc(true).utcOffset(0).valueOf();
};

/**
 * 补全13位时间戳
 * @param time 时间戳
 */
export const toDateStamp13Pad = (time: string | number): number => {
  if (!+time) return 0;

  return +String(+time).padEnd(13, '0').slice(0, 13);
};

/**
 * 转10位时间戳
 * @param time 时间戳 代理版块时间都为10位 Chris: 数据库提前定好的不好更改
 */
export const toDateStamp10 = (time: any): any => {
  if (!+time) return time;

  return +String(+time).slice(0, 10);
};

/**
 * aes加密
 * @param pwd 密码
 * @param key 密钥
 */
export const encryptByEnAES = (pwd: string, key: string): string => {
  const data = enc.Utf8.parse(key);
  const tmpAES = AES.encrypt(pwd, data, {
    mode: mode.ECB,
    padding: pad.Pkcs7,
  });

  return tmpAES.toString();
};

/**
 * 加密
 * @param str
 */
export function AESEncrypt(str: string, key: string) {
  return AES.encrypt(str, key).toString();
}

/**
 * 解密
 */
export function AESDecrypt(str, key) {
  try {
    return AES.decrypt(str, key).toString(enc.Utf8);
  } catch {
    console.warn('decrypt error'); // 验证失败，可能被篡改
    return '';
  }
}

/**
 * 字符串转星号字符
 * @param value
 * @param hide
 */
export const wordHide = (value: string, hide = true): string => {
  if (!value) return '-';

  if (!hide) return value;

  return String(value)
    .trim()
    .replace(/[\S\s]/g, '*');
};

/**
 * 字符串转星号字符保留最后几位
 * @param value
 * @param hide
 * @param showLastCount 展示最后几位
 */
export const wordHideFirst = (value: string, hide = true, showLastCount = 8): string => {
  if (!value) return '-';
  if (!hide) return value;

  const reg = new RegExp(`^([\\s\\S]*?)(?=[\\s\\S]{${showLastCount}}$)`);
  return String(value)
    .trim()
    .replace(reg, ($0, $1) => ''.padEnd($1.length, '*'));
};

/**
 * 取时间区间（主要用于接口筛选）
 * @param range 时间区间
 * @param type 区间类型
 * @param carryEnd {Boolean} 是否需要接受结束时间为第二天的整点，默认为true
 * @param endTimeInput {MomentInput} 如果传入结束时间，使用当前结束时间进行结算区间
 * @returns {[number, number]}
 *
 * @example
 *  getRangeTime(-7) -> [7天前的时间戳, 当前时间戳]
 *  getRangeTime(7) -> [当前时间戳, 7天后的时间戳]
 */

export const getRangeTime = (
  range = -7,
  type: DurationInputArg2 | undefined = 'days',
  carryEnd = true,
  endTimeInput?: MomentInput
): [number, number] => {
  let startTimeDate = moment(endTimeInput) || moment();

  if (range) {
    startTimeDate = moment().add(range, type);
  }

  const startTime = toDateStamp(startTimeDate, false) as number;
  const endTime = toDateStamp(endTimeInput || new Date(), true, false, carryEnd) as number;

  return startTime > endTime ? [endTime, startTime] : [startTime, endTime];
};

/**
 * 获取时间
 *  结束时间均为当前时间的下一天的整点！！！用于接口传递筛选 -> Ring: 数据库存为UTC时间，传入999毫秒会漏掉数据，所以需要加1天的整点
 * @param type {'1D' | '7D' | '1M' | '3M' | '6M' | '1Y' | 'MTD' | 'YTD'}
 * @param carryEnd {Boolean} 是否需要接受结束时间为第二天的整点，默认为true
 * @param endTimeInput {MomentInput} 如果传入结束时间，使用当前结束时间进行结算区间
 * @return {Array<number>} [startTime, endTime] -> [开始时间, 结束时间]
 */
export const getTime = (type: string, carryEnd = true, endTimeInput?: MomentInput) => {
  let timeValue: number[] = [];

  switch (type) {
    case '1D':
      timeValue = getRangeTime(0, undefined, carryEnd, endTimeInput);
      break;
    case '7D':
      timeValue = getRangeTime(-6, 'days', carryEnd, endTimeInput);
      break;
    case '1M':
      timeValue = getRangeTime(-1, 'month', carryEnd, endTimeInput);
      break;
    case '3M':
      timeValue = getRangeTime(-3, 'month', carryEnd, endTimeInput);
      break;
    case '6M':
      timeValue = getRangeTime(-6, 'month', carryEnd, endTimeInput);
      break;
    case '1Y':
      timeValue = getRangeTime(-1, 'year', carryEnd, endTimeInput);
      break;
    case 'MTD': // 月初至今
      timeValue = [
        toDateStamp(String(moment().startOf('months').format('YYYY-MM-DD HH:mm:ss'))) as number,
        toDateStamp(endTimeInput || moment(), true, false, carryEnd) as number,
      ];
      break;
    case 'YTD': // 年初至今
      timeValue = [
        toDateStamp(String(moment().year()) + ' 01-01 00:00:00') as number,
        toDateStamp(endTimeInput || moment(), true, false, carryEnd) as number,
      ];
      break;
  }

  return timeValue;
};

/**
 * 获取基础路径
 */
export const getBaseLocation = () => {
  const paths: string[] = location.pathname.split('/').splice(1, 1);
  const basePath: string = (paths && paths[0]) || 'zh-CN';
  return '/' + basePath;
};

/**
 * 插值表达式
 * @param str
 * @param obj
 */
export const interpolationExpression = (str: string, obj: Object = {}) => {
  if (!str || typeof str !== 'string') return str;

  return str.replace(/\{\{(.+?)\}\}/g, (match, key) => {
    key = key.trim();

    if (key in obj) return obj[key];

    return match;
  });
};

/**
 * 下载Excel文件
 */
export const downloadExcelFile = (blobData: string, fileName: string, type?: string) => {
  const blob = new Blob([blobData], {
    type: type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  if (window.navigator['msSaveOrOpenBlob']) {
    navigator['msSaveBlob'](blob, fileName);
  } else {
    downloadFile(window.URL.createObjectURL(blob), fileName);
  }
};

/**
 * 下载文件
 */
export const downloadFile = (url: string, fileName?: string) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || '';
    link.click();
    window.URL.revokeObjectURL(link.href);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 搜索过滤
 */
export const arrSearch = <T>(value: Array<T>, searchValue?: string, key: string | boolean = false): Array<T> => {
  if (!Array.isArray(value)) return [] as any;

  return value.filter((e) => {
    if (typeof e === 'string' && key === false && searchValue) {
      // 如果是字符串的数组情况
      return e?.toLowerCase()?.includes(searchValue.toLowerCase());
    } else if (e && key && searchValue) {
      const res = _.get(e, key as string, undefined);
      if (typeof res === 'string') {
        return res.toLowerCase().includes(searchValue.toLowerCase());
      }

      return false;
    }

    return true;
  });
};

/**
 * 不是空值
 * @param value
 */
export function isNotNil<T>(value: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

/**
 * 销毁服务
 */
@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}

/**
 * 叠加数组中值
 */
export const reduceTotal = (value: any[], ...args: any[]): string => {
  if (!Array.isArray(value)) return '0';
  let res = new BigNumber(0);

  value.forEach((v) => {
    if (args[0]) {
      res = res.plus(v[args[0] as string]);
    } else {
      res = res.plus(v);
    }
  });

  return res.toString();
};

/**
 * 补全url的http协议
 * @param url
 */
export const completeUrl = (url: string) => {
  if (!url) return '';

  if (url.startsWith('//')) {
    url = window.location.protocol + url;
  }

  return url;
};

/**
 * 获取pathname 不带/开头的URL相对路径
 * @param url
 */
export const getPathname = (url: any) => {
  if (!url || typeof url !== 'string') return '';

  url = completeUrl(url);
  if (url.startsWith('http')) {
    try {
      url = new URL(url).pathname;
    } catch (e) {
      console.error('【Tool:getPathname】: ' + e);
      url = '';
    }
  }

  return url.replace(/^\/+/, '');
};

/**
 * 获取浏览器的滚动条的宽度
 */
export const getScrollBarWidth = (): number => {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';
  div.style.overflow = 'scroll';
  div.style.position = 'absolute';
  div.style.top = '-9999px';
  document.body.appendChild(div);
  const scrollBarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);
  return scrollBarWidth || 0;
};

/**
 * 获取ws的域名
 */
export const getWsDomain = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${wsProtocol}://${window.location.host}`;
};

/**
 * 获取图片信息
 *
 * @param file 图片文件
 */
export const getImgInfo = async (file: File): Promise<{ width: number; height: number }> => {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    const data = { width: 0, height: 0 };
    img.src = src;
    img.onload = () => {
      data.width = img.width;
      data.height = img.height;
      resolve(data);
    };
    img.onerror = () => {
      resolve(data);
    };
  });
};

/**
 * 过滤对象中的undefined值
 * @param params
 */
export const filterParams = (params: any) => {
  // 过滤undefined值
  if (isPlainObject(params)) {
    // 纯对象进行过滤 有File对象传递情况
    const cleanArray = (o) => (isArray(o) ? compact(o) : o);
    const clean = (obj) =>
      transform(obj, (r: any, v, k) => {
        const isObject = isPlainObject(v);
        const val = isObject ? cleanArray(clean(v)) : v;
        const keep = isObject ? !isEmpty(val) : val !== undefined;

        if (keep) r[k] = val;
      });

    return clean(cloneDeep(params));
  }

  return params;
};

export interface VideoInfoFrame {
  width: number;
  height: number;
  duration: number;
  frameUrl: string;
  frameBlob: Blob;
  file: File;
}

/**
 * 获取视频帧
 * @param videoFile {File} 视频文件
 * @param time {number[]} 获取视频帧的时间
 * @return {VideoInfoFrame}
 */
export const getVideoInfoFrame = async (videoFile: File, time: number): Promise<VideoInfoFrame> => {
  const video = document.createElement('video');

  const source1 = document.createElement('source');
  source1.src = URL.createObjectURL(videoFile);
  video.appendChild(source1);

  video.playsInline = true;
  video.preload = 'metadata';
  video.autoplay = true;
  video.muted = true;
  video.currentTime = time;
  video.crossOrigin = 'anonymous';
  // video.src = URL.createObjectURL(videoFile);

  await new Promise((resolve, reject) => {
    video.onerror = (err) => {
      console.error(err);
      reject(err);
    };

    video.oncanplay = () => {
      resolve(0);
      video.pause();
    };

    source1.oncanplay = () => {
      resolve(0);
      video.pause();
    };

    source1.onerror = (err) => {
      console.error(err);
      reject(err);
    };
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });

  return {
    file: videoFile,
    width: video.videoWidth,
    height: video.videoHeight,
    duration: video.duration,
    frameUrl: blob ? URL.createObjectURL(blob) : '',
    frameBlob: blob || new Blob(),
  };
};
