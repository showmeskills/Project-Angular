import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
@UntilDestroy()
@Component({
  selector: 'app-other-pages-footer',
  templateUrl: './other-pages-footer.component.html',
  styleUrls: ['./other-pages-footer.component.scss'],
})
export class OtherPagesFooterComponent implements OnInit {
  constructor(private layout: LayoutService) {}

  isH5!: boolean;

  /**@imgSrc 图片路径 */
  @Input() imgSrc!: string;

  /**@textOne 第一个条信息 */
  @Input() textOne!: string;

  /**@textTwo 第二条信息 */
  @Input() textTwo!: string;

  /**@textThree 第三条信息*/
  @Input() textThree!: string;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }
}
