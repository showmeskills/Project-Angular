import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from './confirm-modal.component';
import { MatModalModule } from 'src/app/shared/components/dialogs/modal';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';

@NgModule({
  imports: [CommonModule, MatModalModule, AngularSvgIconModule, LangModule, ConfirmModalComponent],
  exports: [ConfirmModalComponent],
  providers: [ConfirmModalService],
})
export class ConfirmModalModule {}
