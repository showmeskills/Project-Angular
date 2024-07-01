import { AfterContentInit, Directive, ElementRef, EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { UploadApi } from 'src/app/shared/api/upload.api';
import { UploadType } from 'src/app/shared/interfaces/upload';
import { BatchUploadComponent } from 'src/app/pages/game/game/batch-upload/batch-upload.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { GameApi } from 'src/app/shared/api/game.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';

@Directive({
  selector: '[batchUpload],batchUpload',
  standalone: true,
})
export class BatchUploadDirective implements AfterContentInit {
  constructor(
    public host: ElementRef,
    private modal: MatModal,
    private viewContainerRef: ViewContainerRef,
    private appService: AppService,
    private api: UploadApi,
    private gameApi: GameApi,
    private subHeader: SubHeaderService
  ) {}

  @Input() batchUpload!: any;
  @Input() tenantId!: any;
  @Input() batchEditGame!: boolean;
  @Input() downloadGameTpl!: boolean;
  @Input('batchUploadType') type!: UploadType;
  @Output() uploadCallback = new EventEmitter<void>();

  modalRef!: MatModalRef<BatchUploadComponent>;

  ngAfterContentInit() {
    const el = this.host.nativeElement;

    el.onclick = () => this.onClick();
  }

  /** methods */
  onClick() {
    const inp = document.createElement('input') as HTMLInputElement;
    inp.type = 'file';

    // 下载游戏编辑模板
    if (this.downloadGameTpl) return this.downloadTemplate();

    // 批量游戏编辑上传
    if (this.batchEditGame) {
      inp.accept = '.csv';
      inp.accept += ', application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Excel Files 97-2003 (.xls)
      inp.accept += ', application/vnd.ms-excel'; // Excel Files 2007+
      inp.click();
      inp.onchange = () => {
        this.uploadExcel(inp.files || ([] as any));
      };

      // 批量游戏图片上传
    } else {
      inp.multiple = true;
      inp.accept = 'image/png, image/jpeg, image/bmp, image/webp';
      inp.click();
      inp.onchange = () => {
        this.updateGameImage(inp.files || ([] as any));
      };
    }
  }

  // 批量上传游戏图片更新
  updateGameImage(files: FileList) {
    if (!files.length) return this.appService.showToastSubject.next({ msg: '请选择文件' });
    if (files.length > 100) return this.appService.showToastSubject.next({ msg: '最多上传100张' });

    this.api
      .createMultipleUploadUrl({
        type: this.type,
        imageNames: [...(files as any)].map((e) => e?.['name']).filter((e) => e),
      })
      .subscribe((res) => {
        const len = Object.keys(res.uploadUrls);

        this.modalRef = this.modal.open<BatchUploadComponent>(BatchUploadComponent, {
          disableClose: true,
          autoFocus: false,
          viewContainerRef: this.viewContainerRef,
        });

        const fail: any[] = [];
        const list: any[] = [];

        this.modalRef.componentInstance['index'] = 0;
        this.modalRef.componentInstance['total'] = len.length;
        this.modalRef.componentInstance['failList'] = fail;
        this.modalRef.componentInstance['list'] = list;

        forkJoin(
          len.map((name) => {
            const uploadUrl = res.uploadUrls[name];
            const file = [...(files as any)].find((e) => e?.['name'] === name);

            return this.api.upload(uploadUrl, file, { throwError: true }).pipe(
              map(() => ({ file, uploadUrl })),
              catchError(() => {
                return of();
              }),
              tap((e) => {
                if (!e) {
                  fail.push({ file, uploadUrl });
                } else {
                  list.push({ file, uploadUrl });
                }

                this.modalRef.componentInstance['index']++;
              })
            );
          })
        ).subscribe((res) => {
          res = res.filter((e) => e);
          if (!res.length) return;

          this.gameApi
            .updateGameImages({
              tenantId: +this.subHeader.merchantCurrentId,
              imageInfos: res.map((e) => ({
                imageName: e.file.name,
                uploadUrl: e.uploadUrl.filePath,
              })),
            })
            .subscribe((res) => {
              this.modalRef.componentInstance.updateFailList = res?.errorList || [];
              this.modalRef.componentInstance.finish();
            });
        });
      });
  }

  // 上传文件
  uploadExcel(files: FileList) {
    if (!files.length) return this.appService.showToastSubject.next({ msg: '请选择文件' });

    const file = files[0];

    this.gameApi.uploadTemplateUpdateGame(this.subHeader.merchantCurrentId, file).subscribe((res) => {
      if (!res || res.error) return this.appService.showToastSubject.next({ msg: '上传失败' });

      this.modalRef = this.modal.open<BatchUploadComponent>(BatchUploadComponent, {
        disableClose: true,
        autoFocus: false,
        viewContainerRef: this.viewContainerRef,
      });

      const total = res.successCount + res.failCount;

      this.modalRef.componentInstance['type'] = 'file';
      this.modalRef.componentInstance['index'] = total;
      this.modalRef.componentInstance['total'] = total;
      this.modalRef.componentInstance['failList'] = res.failList;

      this.modalRef.afterOpened().subscribe(() => {
        this.uploadCallback.emit();
      });
    });
  }

  // 下载模板
  downloading = false;
  downloadTemplate(): void {
    if (this.downloading) return;

    this.downloading = true;
    this.gameApi.downloadGameTemplate(this.tenantId).subscribe((isSuccess) => {
      this.downloading = false;
      !isSuccess && this.appService.showToastSubject.next({ msg: '下载失败' });
    });
  }
}
