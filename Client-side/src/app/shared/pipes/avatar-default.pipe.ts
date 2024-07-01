import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { defaultAvatarPc } from '../interfaces/settings.interface';
@Pipe({
  name: 'avatarDefault',
})
/**
 * 默认头像
 *
 * @param value 传入的头像
 */
export class AvatarDefaultPipe implements PipeTransform {
  constructor(private appService: AppService) {}
  transform(value: string): string {
    if (value.startsWith('http')) {
      return value;
    }

    //当前传入的后台头像列表
    const avatarList = this.appService.avatarList;

    //用于替换被选中的头像
    const selAvatar = avatarList?.find((v: defaultAvatarPc) => v.idx === value);
    if (selAvatar?.processedUrl) {
      //如果选中的头像没有获取到，就不替换
      return selAvatar?.processedUrl;
    }

    //头像拼接
    return `${environment.resourceUrl}${value.startsWith('/') ? '' : '/'}${value}`;
  }
}
