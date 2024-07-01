import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Component({
  selector: 'lottery-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
})
export class topMenuComponent implements OnInit {
  constructor(
    private router: Router,
    private toast: ToastService,
    public appService: AppService,
    private localeService: LocaleService,
  ) {}
  domain = window.location.origin;
  ngOnInit(): void {}

  onMousewheel(e: any) {
    e.preventDefault && e.preventDefault();
    e.delta = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
    if (e.delta < 0) {
      // 左边
      e.currentTarget.scrollLeft += e.currentTarget.offsetWidth * 1;
    } else {
      // 右边
      e.currentTarget.scrollLeft += e.currentTarget.offsetWidth * -1;
    }
  }

  gotoGame(type: string) {
    switch (type) {
      case 'ob':
        this.router.navigateByUrl(`${this.appService.languageCode}/play/OBLottery-3`);
        break;
      case 'tc':
        this.router.navigateByUrl(`${this.appService.languageCode}/play/TCLottery-3`);
        break;
      case 'sg':
        this.router.navigateByUrl(`${this.appService.languageCode}/play/SGLottery-3`);
        break;
      case 'vr':
        this.router.navigateByUrl(`${this.appService.languageCode}/play/VRLottery-3`);
        break;
      case 'gpi':
        this.router.navigateByUrl(`${this.appService.languageCode}/casino/provider/GPIGame-3`);
        break;
      default:
        this.toast.show({ message: this.localeService.getValue('waiting'), type: 'fail', title: '' });
        break;
    }
  }
}
