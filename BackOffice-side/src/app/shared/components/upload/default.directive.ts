import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[default]',
  standalone: true,
})
export class DefaultDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
