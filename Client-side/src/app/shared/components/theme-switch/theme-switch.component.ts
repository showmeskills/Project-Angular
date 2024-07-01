import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { DataCollectionService } from '../../service/data-collection.service';
import { LocalStorageService } from '../../service/localstorage.service';
@UntilDestroy()
@Component({
  selector: 'app-theme-switch',
  templateUrl: './theme-switch.component.html',
  styleUrls: ['./theme-switch.component.scss'],
})
export class ThemeSwitchComponent implements OnInit {
  constructor(
    private appService: AppService,
    private localStorageService: LocalStorageService,
    private dataCollectionService: DataCollectionService
  ) {}

  @Input() simple!: boolean;
  @Input() simpleStyle: 'fill' | 'line' = 'line';

  disabled = false;
  checked = false;

  ngOnInit() {
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.checked = v === 'moon';
    });
  }

  toggle(checked: boolean) {
    if (checked === this.checked) return;
    const theme = checked ? 'moon' : 'sun';
    this.localStorageService.theme = theme;
    this.appService.themeSwitch$.next(theme);
    this.dataCollectionService.addPoint({ eventId: 30024, actionValue1: theme === 'sun' ? 1 : 2 });
  }
}
