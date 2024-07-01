import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
})
export class KeyWordHeightLight implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  //过滤 关键字 并且高亮
  transform(value: string, keyword: string): any {
    const reg = new RegExp(keyword, 'gi');
    const res: string = value.replace(reg, match => `<span style="color: #f04f23;">${match}</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(res);
  }
}
