import { Routes } from '@angular/router';
import { DialogueComponent } from 'src/app/pages/session/dialogue/dialogue.component';
import { SessionHistoryComponent } from './session-history/session-history.component';
import { ThemeComponent } from './theme/theme.component';
import { SessionWsService } from 'src/app/pages/session/session-ws.service';
import { SessionService } from 'src/app/pages/session/session.service';
import { Comm100HistoryComponent } from './comm100-history/comm100-history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'conversation', pathMatch: 'full' },
  {
    path: 'dialogue',
    component: DialogueComponent,
    data: { name: '对话', lang: 'nav.sessionDialogue', showMerchant: true },
    providers: [SessionWsService, SessionService],
  },
  {
    path: 'history',
    component: SessionHistoryComponent,
    data: { name: '在线消息历史记录', lang: 'nav.sessionHistory', showMerchant: true },
    providers: [SessionWsService, SessionService],
  },
  {
    path: 'theme',
    component: ThemeComponent,
    data: { name: '主题管理', lang: 'nav.theme', showMerchant: true },
  },
  {
    path: 'comm100',
    component: Comm100HistoryComponent,
    data: { name: 'Comm100历史聊天', lang: 'nav.comm100', showMerchant: true },
  },
];
