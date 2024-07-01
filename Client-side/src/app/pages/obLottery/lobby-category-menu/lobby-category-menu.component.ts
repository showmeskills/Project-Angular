import {
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'lottery-lobby-category-menu',
  templateUrl: './lobby-category-menu.component.html',
  styleUrls: ['./lobby-category-menu.component.scss'],
})
export class LobbyCategoryMenuComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    public appService: AppService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if ('order' in res) {
        setTimeout(() => {
          this.selectItem(res.order);
        }, 0);
      }
    });
  }

  @Input() menus!: any;
  @Input() currentIndex: string = 'index';
  @Output() onClick: EventEmitter<any> = new EventEmitter();
  @ViewChild('scrollWrapper', { read: ViewContainerRef, static: true }) private scroll!: ViewContainerRef;
  @ViewChild('content', { read: ViewContainerRef, static: true }) private content!: ViewContainerRef;
  scrollStep = 50;
  scrollPos = {
    before: 0,
    after: 0,
    left: 0,
  };
  isMove = false;
  timer: any = null;
  domain = window.location.origin;
  @HostListener('mousewheel', ['$event'])
  mousewheel(e: any) {
    e.preventDefault && e.preventDefault();
    //
    const scrollDom: any = this.scroll.element.nativeElement;
    const contentDom = this.content.element.nativeElement;
    // let ulDom = this.ul.element.nativeElement;
    //
    //
    //
    //
    const isDirection: boolean = e.wheelDelta > 0;
    if (isDirection) {
      // 左
      if (scrollDom.scrollLeft >= 0) {
        scrollDom.scrollLeft -= this.scrollStep;
      }
    } else {
      // 右
      if (scrollDom.scrollLeft <= contentDom.clientWidth - scrollDom.clientWidth) {
        scrollDom.scrollLeft += this.scrollStep;
      }
    }
  }

  selectItem(code: string) {
    this.onClick.emit(code);
    const index = this.menus?.findIndex((e: any) => e.labelCode == code);
    this.move(index ? index + 1 : 0);
  }

  move(index: number) {
    if (!this.scroll) return;
    const scrollDom: any = this.scroll.element.nativeElement;
    const contentDom = this.content.element.nativeElement;
    clearInterval(this.timer);
    this.timer = null;
    const rightWidth = this.getChildWidth(index);
    if (scrollDom.clientWidth + scrollDom.scrollLeft < rightWidth) {
      // 向右
      //
      const sum = rightWidth - scrollDom.clientWidth - scrollDom.scrollLeft + 30;
      const defaultLeft = scrollDom.scrollLeft;
      let count = 1;
      this.timer = setInterval(() => {
        scrollDom.scrollLeft = defaultLeft + count;
        count = count + 2;
        if (sum <= count) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 10);
    }
    const leftWidth = this.getChildWidth(index - 1);
    if (scrollDom.scrollLeft > leftWidth) {
      // 向左
      const sum = scrollDom.scrollLeft - leftWidth + 30;
      const defaultLeft = scrollDom.scrollLeft;
      let count = 1;
      this.timer = setInterval(() => {
        scrollDom.scrollLeft = defaultLeft - count;
        count = count + 2;
        if (sum <= count) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 10);
    }

    //
  }

  getChildWidth(index: number) {
    const contentDom = this.content.element.nativeElement;
    const allChildren = contentDom.children;
    let totalWidth = 0;
    for (let i = 0; i < index + 1; i++) {
      const width = Number(allChildren[i]?.clientWidth) + 5; // 5 是margin-right
      totalWidth += width;
    }
    return totalWidth;
  }
}
