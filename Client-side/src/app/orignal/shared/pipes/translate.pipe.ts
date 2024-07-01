import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  constructor(private localeService: LocaleService) {}
  transform(key: string): any {
    return this.localeService.getValue(key);
  }
}
