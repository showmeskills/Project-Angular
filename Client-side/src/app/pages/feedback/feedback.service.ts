import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedbackApi } from 'src/app/shared/apis/feedback.api';
import { PreviewMediaComponent } from 'src/app/shared/components/preview-media/preview-media.component';
import { FeedbackOptionList } from 'src/app/shared/interfaces/feedback.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private feedbackApi: FeedbackApi, private popup: PopupService) {}

  private optionList$!: Observable<ResponseData<FeedbackOptionList>>; // 所有标签缓存

  /**获取ui数据*/
  public getOptionList() {
    return (
      this.optionList$ ??
      ((this.optionList$ = this.feedbackApi.getOptionList().pipe(
        cacheValue(1000 * 60 * 10, v => !!v?.data) // 请求成功就缓存10分钟
      )),
      this.optionList$)
    );
  }

  openPreview(url: string) {
    this.popup.open(PreviewMediaComponent, {
      backdropClass: 'black-40',
      panelClass: 'mask-penetration',
      data: { url },
    });
  }
}
