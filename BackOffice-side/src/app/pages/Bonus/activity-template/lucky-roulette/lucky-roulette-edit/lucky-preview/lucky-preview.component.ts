import { Component, OnInit, Optional } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-check-example',
  templateUrl: './lucky-preview.component.html',
  styleUrls: ['./lucky-preview.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, NgFor, IconSrcDirective, HostPipe, LangPipe],
})
export class LuckyPreviewComponent implements OnInit {
  constructor(
    public lang: LangService,
    @Optional() public modal: MatModalRef<any>,
    private api: ActivityAPI,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.loadStep1();
  }

  id;
  tenantId;
  list: { icon: string; value: string | number; currency: string }[] = [];

  desc = '';

  checkConfirm() {
    this.modal.close();
  }

  loadStep1() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.activityDetailStep1(this.id, this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res) return;
      this.desc = res.infoList.find((e) => e.languageCode === this.lang.currentLang.toLowerCase())?.slogan || '';
    });
  }
}
