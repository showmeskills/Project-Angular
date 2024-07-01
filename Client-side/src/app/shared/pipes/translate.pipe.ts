import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../service/locale.service';

// 翻译pipe
@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private localService: LocaleService) {}

  result: string = '';
  value: string = '';
  replace: string = '';
  transform(value: string, ...replace: any[]): string {
    if (this.value === value && this.replace === replace.toString() && this.result) return this.result;
    this.result = this.localService.getValue(value, ...replace);
    this.value = value;
    this.replace = replace.toString();
    return this.result;
  }
}
