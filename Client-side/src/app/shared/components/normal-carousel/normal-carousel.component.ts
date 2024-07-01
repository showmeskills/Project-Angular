import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ResourceApi } from '../../apis/resource.api';
import { DataCollectionService } from '../../service/data-collection.service';
import { LayoutService } from '../../service/layout.service';

type baseData<K extends string | number | symbol, T> = { [P in K]?: T };
type carouselType = 'FrontPage' | 'GamesPage' | 'LotteryPage';
type carouselDatas = { img: string; href: string; id: number; customizedHref: string };

@UntilDestroy()
@Component({
  selector: 'app-normal-carousel',
  templateUrl: './normal-carousel.component.html',
  styleUrls: ['./normal-carousel.component.scss'],
  host: {
    '[class.hide-when-no-data]': '!loading && carouselData().length < 1',
  },
})
export class NormalCarouselComponent implements OnInit, AfterContentInit {
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private elementRef: ElementRef,
    private dataCollectionService: DataCollectionService,
    private resourceApi: ResourceApi,
  ) {}

  static allCarouselData: baseData<carouselType, carouselDatas[]> = {};
  static grid: WritableSignal<string> = signal('100%');
  curClass = NormalCarouselComponent;

  carouselData: WritableSignal<carouselDatas[]> = signal([]);
  carouselDataChange$ = toObservable(this.carouselData).pipe(takeUntilDestroyed());
  renderCarouselData = computed(() => {
    if (this.carouselData().length > 0) return this.carouselData();
    return Array(3).fill(null);
  });

  @ViewChild('carousel') carousel?: ElementRef<HTMLElement>;

  @Input() buildFor?: carouselType;

  /** web 顶部banner为4个 H5为2个 */
  @Input() isSpecilStyleBanner: boolean = false;

  loading: boolean = true;

  isH5!: boolean;
  arrowLeft: boolean = false;
  arrowRight: boolean = false;
  active: boolean = false;

  @HostListener('mouseenter')
  onMouseenter() {
    this.active = true;
    this.checkArrow();
  }

  @HostListener('mouseleave')
  onMouseleave() {
    this.active = false;
  }

  checkArrowTimeout?: number;

  ngOnInit() {
    this.carouselDataChange$.subscribe(() => {
      if (this.carouselData().length > 0) {
        setTimeout(() => {
          this.checkArrow();
        });
      }
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    if (!this.buildFor) return;
    const data = NormalCarouselComponent.allCarouselData[this.buildFor] || [];
    if (data.length > 0) {
      this.carouselData.set(data);
      this.loading = false;
    } else {
      this.loading = true;
      this.resourceApi.getbannerlist(this.buildFor).subscribe(res => {
        if (res?.data && res.data.length > 0) {
          NormalCarouselComponent.allCarouselData[this.buildFor as carouselType] = res.data.map(x => ({
            id: x.id,
            img: x.bannerUrl,
            href: x.imageUrl,
            customizedHref: x.imageUrl?.startsWith('http')
              ? x.imageUrl
              : `${window.location.origin}/${this.appService.languageCode}${x.imageUrl}`,
          }));
          this.carouselData.set(
            NormalCarouselComponent.allCarouselData[this.buildFor as carouselType] as carouselDatas[],
          );
        }
        this.loading = false;
      });
    }
  }

  onScroll(e: Event) {
    this.checkArrow(e.currentTarget as HTMLElement);
  }

  checkArrow(el: HTMLElement | undefined = this.carousel?.nativeElement) {
    if (!el) return;
    const sw = el.scrollWidth;
    const sl = el.scrollLeft;
    const w = el.offsetWidth;
    if (sw <= w) {
      this.arrowLeft = this.arrowRight = false;
      return;
    }
    this.arrowRight = sl + w + 1 < sw;
    this.arrowLeft = sl > 0;
  }

  clickItem(item: { img: string; href: string; id: number; customizedHref: string }) {
    if (!item) return;
    this.afterClickItem(item);
    if (item.href) {
      if ((item.href as string).startsWith('http')) {
        // 站外
        window.open(item.href);
      } else {
        // 路由
        this.router.navigateByUrl(this.appService.languageCode + item.href);
      }
    }
  }

  clickArrow(v: number) {
    if (this.carousel) {
      this.carousel.nativeElement.scrollLeft += this.carousel.nativeElement.offsetWidth * v;
    }
  }

  ngAfterContentInit() {
    // <=1000 2个
    // <=600 1个
    this.layout
      .resizeObservable(this.elementRef.nativeElement)
      .pipe(
        map(e => e.contentRect.width),
        startWith(this.elementRef.nativeElement.offsetWidth),
        distinctUntilChanged(),
        untilDestroyed(this),
        filter(x => x > 0),
      )
      .subscribe(w => {
        if (!this.isSpecilStyleBanner) {
          if (w <= 600) {
            NormalCarouselComponent.grid.set('100%');
          } else if (w <= 1000) {
            NormalCarouselComponent.grid.set('50%');
          } else {
            NormalCarouselComponent.grid.set('33.3333%');
          }
        } else {
          if (w <= 767) {
            NormalCarouselComponent.grid.set('50%');
          } else if (w <= 1000) {
            NormalCarouselComponent.grid.set('33.3333%');
          } else {
            NormalCarouselComponent.grid.set('25%');
          }
        }
      });
  }

  afterClickItem(item: carouselDatas) {
    if (this.buildFor === 'FrontPage') {
      this.dataCollectionService.addPoint({ eventId: 30022, actionValue1: item.id });
    }
  }
}
