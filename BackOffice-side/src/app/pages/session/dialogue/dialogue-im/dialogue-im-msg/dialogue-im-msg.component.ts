import { Component, inject, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SessionChatItem } from 'src/app/shared/interfaces/session';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { HighlightUrlPipe } from 'src/app/shared/pipes/string.pipe';
import { SafePipe } from 'src/app/_metronic/core/pipes/safe.pipe';
import { DialogueImMsgService } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';
import { DialogueImEditorService } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-editor/dialogue-im-editor.service';

@Component({
  selector: 'im-msg',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, NgOptimizedImage, HighlightUrlPipe, SafePipe],
  templateUrl: './dialogue-im-msg.component.html',
  styleUrls: ['./dialogue-im-msg.component.scss'],
  providers: [DialogueImEditorService, DialogueImMsgService],
})
export class DialogueImMsgComponent {
  dialogueImMsgService = inject(DialogueImMsgService);

  /**
   * 消息
   */
  @Input() data: SessionChatItem | undefined;

  /**
   * 是否是己方消息
   */
  @Input() isSelf: boolean;

  /**
   * 跟踪
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any) {
    return index + '_' + item.inputs.content;
  }
}
