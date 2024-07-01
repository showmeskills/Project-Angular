import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { HelpCenterService } from '../../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private appService: AppService,
    private router: Router,
    private helpCenterService: HelpCenterService
  ) {}

  isH5!: boolean;

  /**@type 搜索类型 */
  @Input() type!: string;

  /**@searchContent search关键字 */
  searchContent: string = '';

  /**@minWidth 最小宽度 default value 是60px*/
  @Input() minWidth: string = '60px';

  /**@size input 尺寸 */
  @Input() size: 'large' | 'medium' | 'small' = 'medium';

  /**@searhFn 传入搜索方法*/
  @Output() search: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  // 前往搜索页面
  toSeachCenter(): void {
    if (!this.searchContent.trim().length) {
      this.helpCenterService.checkSearchContent();
      return;
    }
    this.router.navigate([this.appService.languageCode, 'help-center', 'search'], {
      queryParams: {
        searchContent: this.searchContent.trim(),
        type: this.type,
      },
    });
  }
  onKeyPressSearch(key: string): void {
    if (key == 'Enter') this.toSeachCenter();
  }
}
