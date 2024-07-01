import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { wordHide, wordHideFirst } from 'src/app/shared/models/tools.model';

@Pipe({
  name: 'isObjectNull',
  standalone: true,
})
export class IsObjectNullPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return (value as any) && JSON.stringify(value) === '{}';
  }
}

@Pipe({
  name: 'toAny',
  standalone: true,
})
export class ToAnyPipe implements PipeTransform {
  transform(value: unknown): any {
    return value as any;
  }
}

@Pipe({
  name: 'host',
  standalone: true,
})
export class HostPipe implements PipeTransform {
  constructor(private appService: AppService) {}

  transform(value: string, type?: string): string {
    return this.appService.joinHost(value, type);
  }
}

/**
 * 隐藏字符串
 * @deprecated 后期可以转成字符串外面自由控制
 * @description 隐藏字符串
 */
@Pipe({
  name: 'wordHide',
  standalone: true,
})
export class WordHidePipe implements PipeTransform {
  transform(value: string | null | undefined, hide = true): unknown {
    return wordHide(value, hide);
  }
}

/**
 * 隐藏字符串开始位置隐藏
 * @description 隐藏字符串
 */
@Pipe({
  name: 'wordHideFirst',
  standalone: true,
})
export class WordHideFirstPipe implements PipeTransform {
  /**
   * 隐藏字符串开始位置
   * @param value 字符串
   * @param hide 是否隐藏
   * @param showLastCount 显示最后几位
   */
  transform(value: string | null | undefined, hide = true, showLastCount = 8): string {
    return wordHideFirst(value, hide, showLastCount);
  }
}

/**
 * 通过vip等级转换vip等级名称
 * @description vip等级名称
 */
@Pipe({
  name: 'vipName',
  standalone: true,
})
export class VipNamePipe implements PipeTransform {
  /**
   * @param value vip等级
   * @param tenantId 商户ID
   */
  transform(value: string | number, tenantId?: any) {
    if (value === null || value === undefined || value === '') return '-';
    let isFiveMerchant = [20, 28].includes(+tenantId);
    return (!isFiveMerchant && +value === 10) || (isFiveMerchant && +value === 999999) ? 'SVIP' : 'VIP' + value;
  }
}
