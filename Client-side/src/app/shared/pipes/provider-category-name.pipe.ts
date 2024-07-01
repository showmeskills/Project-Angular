import { Pipe, PipeTransform } from '@angular/core';
import { PROVIDER_CATEGORY_TYPE } from 'src/app/pages/minigame/game.config';

@Pipe({
  name: 'providerCategoryName',
})
export class ProviderCategoryNamePipe implements PipeTransform {
  transform(key: number, forTranslate: boolean = false): any {
    const data: any = PROVIDER_CATEGORY_TYPE;
    const name = Object.keys(data).find(x => data[x] === key);
    return forTranslate ? `${name}__text` : name;
  }
}
