import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Signal,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { TouramentsRecords, TournamentRankList } from 'src/app/shared/interfaces/activity.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-tournament-template',
  templateUrl: './tournament-template.component.html',
  styleUrls: ['./tournament-template.component.scss'],
})
export class TournamentTemplateComponent implements OnChanges {
  constructor(private layout: LayoutService, private appService: AppService, private localeService: LocaleService) {}

  /** 活动详情，进行中的活动 */
  @Input() tournamentBanner?: TouramentsRecords;
  _tournamentBanner = signal(this.tournamentBanner);
  renderTournamentBanner = computed(() => {
    if (this._tournamentBanner()) return this._tournamentBanner();
    return null;
  });
  renderTextStatus = computed(() => {
    if (this._tournamentBanner()?.tournamentStatus === 'start') {
      return this.localeService.getValue('end_in');
    } else if (this._tournamentBanner()?.tournamentStatus === 'per') {
      return this.localeService.getValue('start_in');
    } else {
      return '';
    }
  });

  /** 排行数据 */
  @Input() rankList: TournamentRankList | null = null;
  _rankList = signal(this.rankList);
  renderRankList = computed(() => this._rankList());

  /** 报名loading */
  @Input() joinLoading = false;
  _joinsLoading = signal(this.joinLoading);
  renderJoinLoading = computed(() => this._joinsLoading());

  /** 详情隐藏按钮 */
  @Input() detailsShowBtn = true;

  /** 报名 */
  @Output() submitJoin = new EventEmitter();
  @Output() seeMore = new EventEmitter();

  /** 宽度 */
  _width: Signal<number | undefined> = toSignal(
    this.layout.resize$.pipe(
      map(v => v[0]),
      startWith(document.body.clientWidth)
    )
  );
  renderWidth = computed(() => {
    if (Number(this._width() || 0) < 1121) return true;
    return false;
  });

  /** 显示 当前用户币种 */
  defaultCurrency = toSignal(this.appService.currentCurrency$);
  renderDefaultCurrency = computed(() => {
    if (this.defaultCurrency()?.isDigital) return 'USDT';
    return this.defaultCurrency()?.currency;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tournamentBanner?.currentValue) {
      this._tournamentBanner.set(changes.tournamentBanner.currentValue);
    }

    if (changes.rankList?.currentValue) {
      this._rankList.set(changes.rankList.currentValue);
    }
    this._joinsLoading.set(changes.joinLoading?.currentValue || false);
  }

  onJoin() {
    this.submitJoin.emit();
  }

  onSeeMore() {
    this.seeMore.emit();
  }
}
