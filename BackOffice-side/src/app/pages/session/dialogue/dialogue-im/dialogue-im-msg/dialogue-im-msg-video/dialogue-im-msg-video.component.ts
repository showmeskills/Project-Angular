import { Component, inject, Input } from '@angular/core';
import { IMFileVideo, SessionChatItem } from 'src/app/shared/interfaces/session';
import { IMMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';
import { JsonPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SvgIconComponent } from 'angular-svg-icon';
import { DurationFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'dialogue-im-msg-video',
  standalone: true,
  imports: [NgOptimizedImage, NgIf, JsonPipe, SvgIconComponent, DurationFormatPipe],
  host: {
    className: 'cursor-pointer',
  },
  templateUrl: `./dialogue-im-msg-video.component.html`,
  styleUrl: './dialogue-im-msg-video.component.scss',
})
export class DialogueImMsgVideoComponent implements IMMsgComponent {
  appService = inject(AppService);
  modal = inject(MatModal);

  @Input() data: SessionChatItem;

  @Input('asset') set _asset(value: IMFileVideo) {
    this.asset = value;
    this._src = value?.coverUrl || '';
  }

  asset: IMFileVideo;

  _src = '';

  openPreview(ngTpl) {
    this.modal.open(ngTpl);
  }

  onCoverError() {
    this._src = '';
  }

  onError() {
    this.appService.showToastSubject.next({ msgLang: 'form.videoLoadFail' });
  }
}
