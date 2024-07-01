import { Directive, TemplateRef } from '@angular/core';
import { ProgressComponent } from './progress.component';

@Directive({
  selector: '[progress-text],[progressText]',
  standalone: true,
})
export class ProgressTextDirective {
  constructor(
    public progress: ProgressComponent,
    public templateRef: TemplateRef<unknown>
  ) {}
}
