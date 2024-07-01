import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SvgIconComponent } from 'angular-svg-icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { SessionService } from 'src/app/pages/session/session.service';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';

@Component({
  selector: 'im-info',
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    LangPipe,
    SvgIconComponent,
    MatTabsModule,
    EmptyComponent,
    TopicLabelComponent,
  ],
  templateUrl: './dialogue-im-info.component.html',
  styleUrls: ['./dialogue-im-info.component.scss'],
})
export class DialogueImInfoComponent {
  sessionService = inject(SessionService);

  tabList = [
    { name: '附件', value: 1, lang: 'session.appendix' },
    { name: '会员基本资料', value: 2, lang: 'session.memberInfo' },
    { name: '存提款信息', value: 3, lang: 'session.DWInfo' },
  ];

  currentTab = 2;
}
