import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightUrl',
  standalone: true,
})
export class HighlightUrlPipe implements PipeTransform {
  transform(value: string): string {
    /**
     * 这个正则表达式考虑到了以下一些情况：
     *
     * 包含http、https、ftp、file协议
     * 可选择性的"www."子域名
     * 常见的域名字符集
     * 限制顶级域名（TLD）为2到6个字符
     * 路径和查询参数的可选性
     */
    const urlPattern = /((https|http|ftp|rtsp|mms):\/\/)[^\s]+/gi;
    // /((https?|ftp|file):\/\/)(www\.)*([-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.([a-z]{2,6}\b|[\u4e00-\u9fa5]{2,6})([a-zA-Z0-9@:%_+.~#&//=]*))/gi;
    return value
      .replace(/</g, '&lt')
      .replace(/>/g, '&gt')
      .replace(urlPattern, (match) => `<a href="${match}" target="_blank" class="msg-link">${match}</a>`);
  }
}
