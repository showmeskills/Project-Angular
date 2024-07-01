import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { DialogueImComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im.component';
import { DialogueImInfoComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-info/dialogue-im-info.component';
import { SessionWsService } from 'src/app/pages/session/session-ws.service';
import { SessionService } from 'src/app/pages/session/session.service';
import { SessionApi } from 'src/app/shared/api/session.api';
import { filter, of, switchMap } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessionMsgBase } from 'src/app/shared/interfaces/session';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SessionDetailService } from 'src/app/pages/session/components/session-detail/session-detail.service';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';

@Component({
  selector: 'session-detail',
  standalone: true,
  imports: [ModalTitleComponent, LangPipe, DialogueImComponent, DialogueImInfoComponent],
  templateUrl: './session-detail.component.html',
  styleUrl: './session-detail.component.scss',
  providers: [
    SessionWsService,
    SessionDetailService,
    {
      provide: SessionService,
      useExisting: SessionDetailService,
    },
  ],
})
export class SessionDetailComponent implements OnInit, AfterViewInit {
  public modal = inject(MatModalRef<SessionDetailComponent>);
  public sessionDetailService = inject(SessionDetailService);
  public lang = inject(LangService);
  private appService = inject(AppService);
  private subHeaderService = inject(SubHeaderService);
  private api = inject(SessionApi);

  @ViewChild(DialogueImComponent) dialogueImComponent;
  uid = '';
  topicId = 0;
  type = 'single'; //默认请求单次消息记录

  paginator: PaginatorState = new PaginatorState(); // 分页

  ngOnInit() {}

  loadHistoryPreviousFinish = false;
  ngAfterViewInit() {
    this.dialogueImComponent.setLoadHistoryPipe(() => {
      return of(null).pipe(
        filter(() => !this.loadHistoryPreviousFinish),
        switchMap(() => {
          console.log(111);
          this.paginator.page++;
          return this.loadHistoryMsg$();
        })
      );
    });
  }

  loadHistoryMsg$(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    let params = {
      topicId: this.topicId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      userId: String(this.uid),
    };
    return this.api[this.type == 'all' ? 'getAllMsg' : 'getMsg'](this.subHeaderService.merchantCurrentId, params).pipe(
      map((res) => {
        if (res.data && !res.data.records.length) {
          this.loadHistoryPreviousFinish = true;
        }

        return (res.data?.records || []) as SessionMsgBase[];
      }),
      catchError((err) => {
        console.error(err);
        return of([] as SessionMsgBase[]);
      }),
      tap((res) => {
        this.sessionDetailService.curSessionMsg = [
          ...res.map((e) => this.sessionDetailService.createSessionMsg(e)),
          ...this.sessionDetailService.curSessionMsg,
        ];
      })
    );
  }

  setData(data, type) {
    this.uid = data.uid;
    this.topicId = data.topicId;
    this.sessionDetailService.merchantId = this.subHeaderService.merchantCurrentId;
    this.type = type;

    this.sessionDetailService.setSession(
      {
        userId: String(data.uid),
        uid: String(data.uid),
        merchantId: this.subHeaderService.merchantCurrentId,
        name: data.userName,
        avatar: this.sessionDetailService.getAvatarPath(data['avatar']),
      },
      {
        categoryRespBody: {
          id: '',
          label: data.categoryLabel,
          nameCn: data.categoryNameCn,
          nameEn: data.categoryNameEn,
        },
        fromUid: '',
        id: data.topicId,
        subjectRespBody: {
          id: '',
          label: data.subjectLabel,
          nameCn: data.subjectNameCn,
          nameEn: data.subjectNameEn,
          categoryId: '',
        },
        uid: String(data.uid),
      }
    );

    this.appService.isContentLoadingSubject.next(true);
    this.loadHistoryMsg$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }
}
