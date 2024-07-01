import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { HelpCenterService } from '../../help-center.service';
@UntilDestroy()
@Component({
  selector: 'app-support-list',
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.scss'],
})
export class SupportListComponent implements OnInit {
  constructor(private router: Router, private appService: AppService, private helpCenterService: HelpCenterService) {}

  faqList: any[] = []; //常见问题数组
  announcementList: any[] = []; //常见公告数组

  ngOnInit(): void {
    this.helpCenterService.faqList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.faqList = data;
    });
    this.helpCenterService.announcementList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.announcementList = data;
    });
  }

  //前往中心页面  公告中心 常见问题
  toOthersCenterPage(pageName: string, id: any): void {
    if (id != null) {
      this.router.navigate([this.appService.languageCode, 'help-center', pageName, id]);
      return;
    }
    this.router.navigate([this.appService.languageCode, 'help-center', pageName]);
  }
}
