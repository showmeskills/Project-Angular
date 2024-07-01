import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SvgIconComponent } from 'angular-svg-icon';
import { DialogueImComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im.component';
import { DialogueImInfoComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-info/dialogue-im-info.component';
import { SessionService } from 'src/app/pages/session/session.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { MassMsgComponent } from 'src/app/pages/session/dialogue/mass-msg/mass-msg.component';
import { DialogueFilterLatestMsgPipe } from 'src/app/pages/session/dialogue/dialogue.pipe';

@Component({
  selector: 'dialogue',
  standalone: true,
  imports: [
    CommonModule,
    LangPipe,
    SvgIconComponent,
    DialogueImComponent,
    DialogueImInfoComponent,
    EmptyComponent,
    TimeFormatPipe,
    DialogueFilterLatestMsgPipe,
  ],
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss'],
  providers: [DestroyService],
})
export class DialogueComponent implements OnInit, OnDestroy {
  sessionService = inject(SessionService);
  subHeaderService = inject(SubHeaderService);
  private destroy$ = inject(DestroyService);
  private modal = inject(MatModal);

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.sessionService.init(this.subHeaderService.merchantCurrentId);
    });
  }

  ngOnDestroy(): void {
    this.sessionService.ngOnDestroy();
  }

  /**
   * 群发消息（主动发给用户）
   */
  async massMsg() {
    const modalRef = this.modal.open(MassMsgComponent, { width: '1024px', disableClose: true });
    modalRef.componentInstance.tenantId = this.subHeaderService.merchantCurrentId;
  }

  protected readonly Math = Math;
}
