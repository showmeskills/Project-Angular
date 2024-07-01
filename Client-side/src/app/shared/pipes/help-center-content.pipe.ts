import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'toHtmlElement',
})
export class HtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  //帮助中心将string 转为html
  transform(value: string): any {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
