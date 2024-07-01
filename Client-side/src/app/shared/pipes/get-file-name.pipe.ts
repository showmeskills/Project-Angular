import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getFileName',
})
export class GetFileNamePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('/').slice(-1).join('');
  }
}
