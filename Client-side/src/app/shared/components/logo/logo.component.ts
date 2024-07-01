import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { LayoutService } from '../../service/layout.service';
@UntilDestroy()
@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements OnInit, OnChanges {
  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private router: Router,
  ) {}

  /**sit时候的尺寸 [宽,高] */
  @Input() sitSize: string[] = [];
  /**sit h5 时候的尺寸 [宽,高] */
  @Input() sitSizeH5: string[] = [];
  /**线上时候的尺寸 [宽,高] */
  @Input() onlineSize: string[] = [];
  /**线上 h5 时候的尺寸 [宽,高] */
  @Input() onlineSizeH5: string[] = [];
  /**固定是h5或者pc的尺寸 */
  @Input() lockDevice?: 'h5' | 'web';
  /**固定日夜主题 */
  @Input() lockTheme?: 'sun' | 'moon';
  /**是否可点击（返回首页） */
  @Input() clickable: boolean = false;

  @Input() redefinedH5?: boolean;
  @Input() name = '';

  autoH5?: boolean;

  isOnline: boolean = environment.isOnline;
  theme: 'sun' | 'moon' = 'sun';
  logoUrl!: string | null;

  isH5?: boolean;
  getIsH5() {
    this.isH5 = this.redefinedH5 ?? this.autoH5;
  }

  size: string[] = [];
  getSize() {
    this.size = this.isOnline
      ? this.lockDevice
        ? this.lockDevice === 'h5'
          ? this.onlineSizeH5
          : this.onlineSize
        : this.isH5
          ? this.onlineSizeH5
          : this.onlineSize
      : this.lockDevice
        ? this.lockDevice === 'h5'
          ? this.sitSizeH5
          : this.sitSize
        : this.isH5
          ? this.sitSizeH5
          : this.sitSize;
  }

  width: string = '';
  getWidth() {
    const num = this.size[0] ?? 'auto';
    this.width = num === 'auto' ? num : num + 'px';
  }

  height: string = '';
  getHeight() {
    const num = this.size[1] ?? 'auto';
    this.height = num === 'auto' ? num : num + 'px';
  }

  ngOnInit() {
    combineLatest([this.layout.isH5$, this.appService.themeSwitch$])
      .pipe(untilDestroyed(this))
      .subscribe(([isH5, theme]) => {
        this.autoH5 = isH5;
        this.theme = theme;
        this.setconfig();
      });
  }

  ngOnChanges() {
    this.setconfig();
  }

  setconfig() {
    this.getIsH5();
    this.getSize();
    this.getWidth();
    this.getHeight();
    this.setLogo();
  }

  /** 设定Logo */
  setLogo() {
    const device = this.lockDevice ?? (this.isH5 ? 'h5' : 'web');
    const theme = this.lockTheme ?? this.theme;
    const key = `${device}Logo${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    this.logoUrl = `${environment.resourceUrl}/${this.appService.tenantConfig[key] || ''}`;
  }

  click() {
    if (!this.clickable) return;
    this.router.navigate(['/', this.appService.languageCode]);
  }
}
