import { Directive } from '@angular/core';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective {
  constructor() {}
}
