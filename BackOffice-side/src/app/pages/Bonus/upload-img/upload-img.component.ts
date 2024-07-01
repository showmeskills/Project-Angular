import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-upload-img',
  templateUrl: './upload-img.component.html',
  styleUrls: ['./upload-img.component.scss'],
  standalone: true,
  imports: [FormRowComponent, UploadComponent, LangPipe],
})
export class UploadImgComponent implements OnInit {
  constructor(
    private appService: AppService,
    private clipboard: Clipboard
  ) {}

  activitiesAddress: any = '';
  detailsAddress: any = '';

  ngOnInit() {}

  changeImg(data: any, type: any) {
    if (data.upload?.state === 'DONE') {
      if (type === 'activities') {
        this.activitiesAddress = data.uploadURL.fullUrl;
      } else if (type === 'details') {
        this.detailsAddress = data.uploadURL.fullUrl;
      }
    }
  }

  clear(type: any) {
    if (type === 'activities') {
      this.activitiesAddress = '';
    } else if (type === 'details') {
      this.detailsAddress = '';
    }
  }

  //复制
  onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    this.appService.showToastSubject.next({ msg: successed ? '复制成功' : '复制失败', successed });
  }
}
