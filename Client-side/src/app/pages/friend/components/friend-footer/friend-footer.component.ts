import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-friend-footer',
  templateUrl: './friend-footer.component.html',
  styleUrls: ['./friend-footer.component.scss'],
})
export class FriendFooterComponent implements OnInit {
  /**@redirect 组件传入的值来判断是联盟还是好友 */
  @Input() redirect!: string | null;

  /**@title 传入的title */
  @Input() title!: string | null;

  /**@btnName 按钮名称 */
  @Input() btnName!: string | null;

  /**@smallTitle title 下面的小字 */
  @Input() smallTitle!: string | undefined;

  isH5!: boolean;
  constructor(private router: Router, private appService: AppService, private layout: LayoutService) {}

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  jumpToPage(): void {
    this.router.navigateByUrl(`/${this.appService.languageCode}/${this.redirect}`);
  }
}
