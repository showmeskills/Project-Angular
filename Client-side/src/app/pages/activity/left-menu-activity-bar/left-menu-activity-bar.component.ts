import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DailyRacesService } from '../../daily-races/daily-races.service';
import { ActivityService } from '../activity.service';
import { BetFreeJackpotService } from '../bet-free-jackpot/bet-free-jackpot.service';

interface ActivitiesFormatStyle {
  value: {
    longStyle: boolean;
    sort: number;
    action: string;
    style: {
      className: string;
      secondClassName: string;
      text: string;
      secondText: string;
      image: string;
      imageClassName: string;
      imageTwo: string;
      imageTwoClassName: string;
    };
  };
}

type ActivitiesKeys = 'daily' | 'freeGuess' | 'wheel' | 'tournament';

@Component({
  selector: 'app-left-menu-activity-bar',
  templateUrl: './left-menu-activity-bar.component.html',
  styleUrls: ['./left-menu-activity-bar.component.scss'],
})
export class LeftMenuActivityBarComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private localeService: LocaleService,
    private betFreeJackpotService: BetFreeJackpotService,
    private dailyRacesService: DailyRacesService,
    private router: Router,
    private appService: AppService,
    public activityService: ActivityService,
  ) {}

  ngOnInit() {
    this.onLeftMenuActivities();
  }

  /** 活动样式 分配 */
  activitiesFormatStyle = {
    daily: {
      longStyle: false,
      sort: 0,
      action: 'dailyRaces',
      style: {
        className: 'daily-races',
        secondClassName: 'span-second-line',
        text: this.localeService.getValue('daily_races'),
        secondText: 'DAILY RACE',
        image: 'assets/images/menu/daily-races.png',
        imageClassName: 'bonus__bg',
        imageTwo: '',
        imageTwoClassName: '',
      },
    },
    freeGuess: {
      longStyle: false,
      sort: 1,
      action: 'jackpot',
      style: {
        className: 'daily-guess',
        secondClassName: 'span-second-line',
        text: this.localeService.getValue('free_guess'),
        secondText: 'Win 10 BTC',
        image: 'assets/images/menu/guess.png',
        imageClassName: 'bonus__bg',
        imageTwo: '',
        imageTwoClassName: '',
      },
    },
    wheel: {
      longStyle: false,
      sort: 2,
      action: 'wheel',
      style: {
        className: 'lucky-wheel',
        secondClassName: 'span-second-line',
        text: this.localeService.getValue('luck_spin'),
        secondText: 'LUCKY SPIN',
        image: 'assets/images/menu/gold.png',
        imageClassName: 'bonus__bg',
        imageTwo: 'assets/images/menu/wheel.png',
        imageTwoClassName: 'wheel-bg',
      },
    },
    tournament: {
      longStyle: false,
      sort: 3,
      action: 'tournament',
      style: {
        className: 'tournament',
        secondClassName: 'span-second-line',
        text: this.localeService.getValue('tournament'),
        secondText: 'Tournament',
        image: 'assets/images/menu/tournament.png',
        imageClassName: 'bonus__bg',
        imageTwo: '',
        imageTwoClassName: '',
      },
    },
  };
  activitiesLoading = false;

  onLeftMenuActivities() {
    this.activitiesLoading = true;
    combineLatest([
      this.dailyRacesService.getDailyTitles(),
      this.activityService.getturntableinformation(),
      this.activityService.getRecentActivity(),
      this.activityService.getTournamentList(),
    ]).subscribe(([daily, wheel, freeGuess, tournament]) => {
      const hasList =
        (tournament.endList && Number(tournament.endList?.records?.length || 0) > 0) ||
        (tournament.perList && Number(tournament.perList?.records?.length || 0) > 0) ||
        (tournament.startList && Number(tournament.startList?.records?.length || 0) > 0);

      if (!(Number(daily?.title?.length || 0) > 0)) {
        delete this.activitiesFormatStyle['daily' as ActivitiesKeys];
      }

      if (!freeGuess?.data?.haveRunningActivity) {
        delete this.activitiesFormatStyle['freeGuess' as ActivitiesKeys];
      }

      if (!wheel?.data) {
        delete this.activitiesFormatStyle['wheel' as ActivitiesKeys];
      }

      if (!hasList) {
        delete this.activitiesFormatStyle['tournament' as ActivitiesKeys];
      }

      const currentLeng = Object.values(this.activitiesFormatStyle).length;

      Object.keys(this.activitiesFormatStyle).forEach((activity, index) => {
        const currentActivity = this.activitiesFormatStyle[activity as ActivitiesKeys];
        switch (currentLeng) {
          case 1:
            currentActivity.longStyle = true;
            break;
          case 3:
            currentActivity.longStyle = index === 0;
            break;
          case 4:
            currentActivity.longStyle = index === 0 || index === 3;
            break;
          default:
            currentActivity.longStyle = false;
            break;
        }
      });
      this.activitiesLoading = false;
    });
  }

  sortActivities(a: ActivitiesFormatStyle, b: ActivitiesFormatStyle) {
    return a.value.sort - b.value.sort;
  }

  @Output() afterClick: EventEmitter<any> = new EventEmitter();

  click(type?: string) {
    switch (type) {
      case 'dailyRaces':
        this.dailyRacesService.openPopup();
        break;
      case 'jackpot':
        this.betFreeJackpotService.getActivitiesIs();
        break;
      case 'noneSticky':
        this.router.navigateByUrl(`${this.appService.languageCode}/coupon`);
        break;
      case 'wheel':
        this.router.navigate([], {
          queryParams: {
            modal: 'wheel',
          },
        });
        break;
      case 'tournament':
        this.router.navigateByUrl(`${this.appService.languageCode}/activity/tournament`);
        break;
      default:
        this.toast.show({ message: this.localeService.getValue('waiting'), type: 'fail' });
        break;
    }
    this.afterClick.emit();
  }
}
