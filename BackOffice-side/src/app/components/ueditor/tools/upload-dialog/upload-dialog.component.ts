import { Component, Inject, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MAT_MODAL_DATA, MatModalClose, MatModalRef } from 'src/app/shared/components/dialogs/modal';

@Component({
  selector: 'upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, UploadComponent, FormsModule, LangPipe, MatModalClose],
})
export class UploadDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public dialogRef: MatModalRef<UploadDialogComponent>,
    private appService: AppService,
    public lang: LangService
  ) {}

  value = '';

  get isImg() {
    return this.data.type === 'img';
  }

  get isVideo() {
    return this.data.type === 'video';
  }

  ngOnInit(): void {}

  onConfirm(): void {
    if (!this.value) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.selectFileUpload',
      });
    }

    this.data.editor.focus(true); // 初始化时没焦点 不能插入内容 这里设置焦点

    if (this.isImg) {
      const img = { src: this.value, _src: this.value, alt: '' };
      this.data.editor.execCommand('insertImage', img);
    } else if (this.isVideo) {
      const video = {
        url: this.value,
        // width: 420,
        // height: 280,
        align: 'center',
      };
      // PS: 不要尝试自己插入video需要改源码，否则会被内置规则过滤掉，尽量不要修改源码
      // this.data.editor.execCommand('insertHtml', `<div><video class="playsinline" src="${video.url}" controls="true" reload="auto" style="object-fit: fill;"></video></div>`);
      this.data.editor.execCommand('insertVideo', video, 'upload');
    }

    this.dialogRef.close();
  }
}
