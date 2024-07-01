import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { ProviderInterface } from 'src/app/shared/interfaces/game.interface';

@Component({
  selector: 'app-swiper-provider-list',
  templateUrl: './swiper-provider-list.component.html',
  styleUrls: ['./swiper-provider-list.component.scss'],
})
export class SwiperProviderListComponent implements OnInit {
  constructor(
    private router: Router,
    private miniGameService: MiniGameService,
    private appService: AppService,
  ) {}

  providerList: ProviderInterface[] = [];
  loadinProviderList!: boolean;

  @Input() supplier!: string[]; //需要被过滤的供应商

  providerHref: string = `${this.appService.languageCode}/casino/provider`;

  ngOnInit() {
    this.getProviderList();
  }

  // 获取供应商
  getProviderList() {
    this.loadinProviderList = true;
    this.miniGameService.getAllProvider().subscribe(data => {
      this.loadinProviderList = false;
      if (this.supplier) {
        this.providerList = data.filter(value => this.supplier.includes(value.category));
      } else {
        this.providerList = data;
      }
    });
  }

  // 点击供应商标题
  clickProviderTitle() {
    this.router.navigateByUrl(this.providerHref);
  }

  // 点击供应商
  clickProviderItem(item: ProviderInterface) {
    if (item.secondaryPage) {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/provider/${item.providerCatId}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/play/${item.providerCatId}`);
    }
  }
}
