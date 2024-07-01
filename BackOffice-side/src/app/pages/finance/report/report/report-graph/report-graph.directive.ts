import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[graphHeaderRight],[graph-header-right]',
  standalone: true,
})
export class GraphHeaderRightDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
