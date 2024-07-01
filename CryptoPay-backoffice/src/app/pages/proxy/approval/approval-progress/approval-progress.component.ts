import { Component, EventEmitter, Output } from '@angular/core';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FiatBatchComponent } from './fiat-batch/fiat-batch.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModalClose } from 'src/app/shared/components/dialogs/modal/modal-content-directives';
import { ApprovalStatusComponent } from '../approval-status/approval-status.component';

@Component({
  selector: 'app-approval-progress',
  templateUrl: './approval-progress.component.html',
  styleUrls: ['./approval-progress.component.scss'],
  standalone: true,
  imports: [ApprovalStatusComponent, MatModalClose, AngularSvgIconModule, FiatBatchComponent, LangPipe],
})
export class ApprovalProgressComponent {
  data: any = {};

  @Output() reload = new EventEmitter<any>();
}
