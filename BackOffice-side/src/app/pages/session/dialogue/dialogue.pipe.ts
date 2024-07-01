import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLatestMsg',
  standalone: true,
})
export class DialogueFilterLatestMsgPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/#\{\d+\}#/g, '[附件]');
  }
}
