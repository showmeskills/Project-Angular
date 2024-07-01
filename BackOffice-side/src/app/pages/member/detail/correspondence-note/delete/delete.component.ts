import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CorrespondenceItem, CorrespondenceInfoItem } from 'src/app/shared/interfaces/member.interface';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'correspondence-note-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    FormWrapComponent,
    MatFormFieldModule,
    ModalFooterComponent,
    LangPipe,
    TimeFormatPipe,
  ],
})
export class CorrespondenceNoteDeleteComponent implements OnInit {
  constructor(
    public modal: MatModalRef<CorrespondenceNoteDeleteComponent>,
    public appService: AppService,
    private api: MemberApi,
    public lang: LangService,
    public activatedRoute: ActivatedRoute
  ) {
    const { tenantId } = activatedRoute.snapshot.queryParams; // params参数;

    this.tenantId = tenantId;
  }

  @Input() data: CorrespondenceItem;
  @Output() deleteSuccess = new EventEmitter();

  tenantId: string;

  ngOnInit() {}

  /** 获取问题翻译 */
  getProblemLang(info: CorrespondenceInfoItem[]) {
    if (Array.isArray(info)) {
      const multi = this.lang.isLocal ? 'zh-cn' : 'en-us';
      return (
        info.find((v) => v.languageCode === multi)?.problem ||
        info.find((v) => v.languageCode === 'zh-cn')?.problem ||
        '-'
      );
    }
    return '-';
  }

  onSubmit() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .deletemessageboard({
        id: this.data?.id,
        tenantId: this.tenantId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!res)
          return this.appService.showToastSubject.next(
            res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
          );

        this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });

        this.deleteSuccess.emit();
        this.modal.close(true);
      });
  }
}
