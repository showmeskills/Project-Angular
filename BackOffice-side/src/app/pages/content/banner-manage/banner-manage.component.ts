import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerApi } from 'src/app/shared/api/banner.api';
import { CdkDrag, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BannerItem, BannerTypeObjEnum } from 'src/app/shared/interfaces/banner';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { NzImageDirective } from 'src/app/shared/components/image/image.directive';

@Component({
  selector: 'app-banner-manage',
  templateUrl: './banner-manage.component.html',
  styleUrls: ['./banner-manage.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgTemplateOutlet,
    NgIf,
    NgFor,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    TimeFormatPipe,
    LangPipe,
    NzImageDirective,
  ],
})
export class BannerManageComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: NgbModal,
    private appService: AppService,
    public router: Router,
    private api: BannerApi,
    private subHeaderService: SubHeaderService,
    private route: ActivatedRoute,
    private lang: LangService
  ) {}

  modal!: NgbModalRef;
  list: BannerItem[] = [];
  lastList: any[] = [];
  tenantId: any = 1;
  _destroyed = new Subject<void>();
  isLoading = false;
  bannerType!: string;
  typeLang = {};

  ngOnInit(): void {
    // 使用 combineLatest 监听路由参数和 subHeaderService 的 merchantId$
    combineLatest([this.route.queryParamMap, this.subHeaderService.merchantId$])
      .pipe(takeUntil(this._destroyed))
      .subscribe(([params, merchantId]) => {
        this.bannerType = params.get('bannerType') || 'App';
        this.tenantId = params.get('tenantId') || merchantId;
        this.loadData();
      });

    // 单独监听 subHeaderService 的 merchantId$
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe((merchantId) => {
      this.tenantId = merchantId;
    });

    const transLang = async () => {
      const obj = {
        [BannerTypeObjEnum.FrontPage]: 'content.ba.homeBa',
        [BannerTypeObjEnum.GamesPage]: 'content.ba.gameBa',
        [BannerTypeObjEnum.LotteryPage]: 'content.ba.lottoBa',
        [BannerTypeObjEnum.Promotion]: 'content.ba.activityBanner',
      };
      for (let key of Object.keys(obj)) {
        this.typeLang[key] = await this.lang.getOne(obj[key]);
      }
    };

    transLang();
  }

  onLoadTab(type): void {
    this.bannerType = type;
    let queryParams = {};
    if (this.bannerType === 'Web') {
      queryParams = { bannerType: 'Web' };
    } else if (this.bannerType === 'App') {
      queryParams = { bannerType: 'App' };
    }
    this.router.navigate(['/content/banner-manage'], { queryParams });
    this.loadData();
  }

  loadData(): void {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    this.tenantId = this.subHeaderService.merchantCurrentId;
    this.loading(true);
    this.api
      .getBannersList({
        tenantId: this.tenantId,
        bannerClientType: this.bannerType,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res;
      });
  }

  async onDel(tpl, item): Promise<void> {
    const res = await this.modalService.open(tpl, { centered: true }).result;
    if (!res?.value) return;

    this.loading(true);
    this.api
      .postDeleteBanner({
        tenantId: this.subHeaderService.merchantCurrentId,
        bannerId: item.id,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.loadData();
          this.appService.showToastSubject.next({
            msgLang: 'content.ba.suc',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'content.ba.failDel',
            successed: false,
          });
        }
      });
  }

  drop(event: any, i: number, banners): void {
    const prevIndex = banners.findIndex((e) => e === event.item.data);
    moveItemInArray(banners, prevIndex, i);
    const dataSortIds = banners.map((v) => v.id);
    this.loading(true);
    this.api
      .getUpdateSort({
        TenantId: this.subHeaderService.merchantCurrentId,
        SortIds: dataSortIds,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res === true) return;
        this.appService.showToastSubject.next({
          msgLang: 'content.ba.failOrder',
          successed: false,
        });
        this.loadData();
      });
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
