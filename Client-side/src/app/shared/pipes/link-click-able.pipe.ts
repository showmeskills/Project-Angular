import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkClickAble',
})
export class LinkClickAblePipe implements PipeTransform {
  transform(value: string): string {
    const res = value.replace(
      /((https|http|ftp|rtsp|mms):\/\/)[^\s]+/gi,
      match => `<a target="_blank" class="mutual-opacity" href="${match}">${match}</a>`,
    );
    return res;
  }
}
