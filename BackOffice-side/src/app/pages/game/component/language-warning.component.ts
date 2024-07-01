import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  template: `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">{{ 'common.prompt' | lang }}</div>

        <div class="c-btn-close" (click)="modal.dismiss()">
          <svg-icon [src]="'./assets/images/svg/admin-close.svg'" class="svg-icon"></svg-icon>
        </div>
      </div>

      <div class="modal-body">
        <svg-icon [src]="'./assets/images/svg/warning.svg'" class="svg-icon svg-icon-7x mt-8"></svg-icon>
        <p class="fz-16 mt-8">{{ 'components.langDelTip' | lang }}</p>
      </div>

      <div class="modal-footer btn-wrap">
        <button type="button" class="c-btn btn btn-light" (click)="modal.dismiss()">
          {{ 'common.cancel' | lang }}
        </button>
        <button type="button" class="c-btn btn btn-primary" (click)="modal.close({ value: true })">
          {{ 'common.confirm' | lang }}
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [AngularSvgIconModule, LangPipe],
})
export class LanguageWarningComponent implements OnInit {
  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}
}
