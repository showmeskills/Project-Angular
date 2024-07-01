/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { SportEvent } from 'src/app/shared/interfaces/sport-event.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
@Component({
  selector: 'app-sport-unit',
  templateUrl: './sport-unit.component.html',
  styleUrls: ['./sport-unit.component.scss'],
})
export class SportUnitComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    private layout: LayoutService,
  ) {}

  ngOnInit() {}

  isH5 = toSignal(this.layout.isH5$);

  /**卡片数据 */
  @Input() item: any | null = null;

  /**宽高比 */
  @Input() ratio: number = 1 / 0.4;

  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  @Input() index: number = 0;

  // 定义三张背景图片
  backgrounds: string[] = [
    'assets/images/home/bg_to_image_1.png',
    'assets/images/home/bg_to_image_2.png',
    'assets/images/home/bg_to_image_3.png',
  ];
  /**
   * 加载默认队伍图片
   *
   * @param event
   */
  onImageError(event: any) {
    event.target.src = 'assets/images/home/team-logo-default.png';
  }

  /**
   * 連到OB体育
   *
   * @param path
   * @param item
   */
  jumpTo(path: string, item: SportEvent) {
    const params = this.isH5()
      ? `&mid=${item.matchId}`
      : `&gotohash=sports-${item.matchId}-${item.tournamentId}-${item.sportId}`;
    this.router.navigateByUrl(`${this.appService.languageCode}/${path}?extra=${window.btoa(params)}`);
  }
}
