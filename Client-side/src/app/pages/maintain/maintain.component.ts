import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { MiniGameService } from '../minigame/minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-maintain',
  templateUrl: './maintain.component.html',
  styleUrls: ['./maintain.component.scss'],
  host: {
    '[class]': 'ident',
  },
})
export class MaintainComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private miniGameService: MiniGameService,
    private localeService: LocaleService
  ) {}

  /** 用于全屏显示 */
  static _displayMode = 'FullMode';

  dataMap: any = {
    service: {
      bg: 'assets/images/maintain-kf.svg',
      text1: 'service_maintain_text1',
      text2: 'service_maintain_text2',
      email: 'maintain_email',
    },
    sport: {
      bg: 'assets/images/maintain-game.svg',
      text1: 'sports_maintain_text1',
      text2: 'sports_maintain_text2',
      email: 'maintain_email',
    },
    lottery: {
      bg: 'assets/images/maintain-game.svg',
      text1: 'lottery_maintain_text1',
      text2: 'lottery_maintain_text2',
      email: 'maintain_email',
    },
  };

  currentData: any;
  ident!: string;

  ngOnInit() {
    this.ident = this.route.snapshot.data.ident;
    switch (this.ident) {
      case 'sport':
      case 'lottery':
        this.miniGameService
          .getAllProvider(false)
          .pipe(untilDestroyed(this))
          .subscribe(data => {
            const providerId = {
              sport: this.miniGameService.sportsProviderID,
              lottery: this.miniGameService.lotteryProviderID,
            }[this.ident];
            const item = data.find(x => x.providerCatId === providerId);
            if (!item || item.status !== 'Online') {
              //维护中
              this.currentData = this.getText(this.dataMap[this.ident]);
            }
          });
        break;
      case 'service':
        this.currentData = this.getText(this.dataMap['service']);
        break;
      default:
        this.backHome();
        break;
    }
  }

  backHome() {
    this.router.navigate([this.appService.languageCode]);
  }

  getText(item: any) {
    const email = this.localeService.getValue(item.email);
    return {
      ...item,
      text1: this.localeService.getValue(item.text1),
      text2: this.localeService.getValue(item.text2, `<a class="mutual-opacity" href="mailto:${email}">${email}</a>`),
    };
  }
}
