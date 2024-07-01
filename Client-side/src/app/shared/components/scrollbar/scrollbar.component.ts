import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, timer } from 'rxjs';
import { LayoutService } from '../../service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
})
export class ScrollbarComponent implements AfterViewInit, OnInit {
  constructor(private layout: LayoutService) {}

  /**是否禁用 */
  @Input() disabled: boolean = false;
  @Input() autoThumb: boolean = false;

  @ViewChild('scrollBox') scrollBox!: ElementRef; //滚动区域
  @ViewChild('content') content!: ElementRef; //内容区域
  @ViewChild('scrollbar') scrollbar!: ElementRef; //滚动条
  @ViewChild('thumb') thumb!: ElementRef; //滑块
  @Output() loadMoreAction: EventEmitter<any> = new EventEmitter();
  @Output() scrollAction: EventEmitter<any> = new EventEmitter();
  @Output() scorllDistance: EventEmitter<any> = new EventEmitter();
  isdrag: boolean = false;
  contentWidth!: number; //内容的宽度
  thumbShow!: boolean;
  isMobile: boolean = false; //是否是手机访问
  isScroll: boolean = false; //是否滚动

  /** 是否滚动计时器 */
  private isScrollTimer!: Subscription;

  /**
   * 滚动到顶部
   */
  scrollToTop() {
    const scrollBoxElement = this.scrollBox.nativeElement as HTMLElement;
    const thumbElement = this.thumb.nativeElement as HTMLElement;
    scrollBoxElement.scrollTo({ left: 0, top: 0 });
    thumbElement.scrollTo({ left: 0, top: 0 });
  }
  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const scrollBoxElement = this.scrollBox.nativeElement as HTMLElement;
    const thumbElement = this.thumb.nativeElement as HTMLElement;
    const scrollBoxHeight = scrollBoxElement.scrollHeight;
    const thumbHeight = thumbElement.scrollHeight;
    scrollBoxElement.scrollTo({
      left: 0,
      top: scrollBoxHeight,
      behavior: 'smooth',
    });
    thumbElement.scrollTo({
      left: 0,
      top: thumbHeight,
      behavior: 'smooth',
    });
  }
  /**
   * 滚动到指定位置
   *
   * @param x
   */
  scrollTo(x: number) {
    const scrollBoxElement = this.scrollBox.nativeElement as HTMLElement;
    const thumbElement = this.thumb.nativeElement as HTMLElement;
    scrollBoxElement.scrollTo({ left: 0, top: x });
    thumbElement.scrollTo({ left: 0, top: x });
  }

  /**
   * 偵測scorllTop的距離
   *
   * @param event
   */
  scrollVerticalDistance(event: any) {
    this.scorllDistance.emit(event.target.scrollTop);
  }

  ngOnInit(): void {
    this.layout.isMobile$.pipe(untilDestroyed(this)).subscribe(x => (this.isMobile = x));
  }

  ngAfterViewInit(): void {
    const scrollBoxElement = this.scrollBox.nativeElement as HTMLElement;
    const scrollbarElement = this.scrollbar.nativeElement as HTMLElement;
    const thumbElement = this.thumb.nativeElement as HTMLElement;
    const contentElement = this.content.nativeElement as HTMLElement;
    // @ts-ignore
    const obs = new ResizeObserver(_ => {
      window.requestAnimationFrame((): void | undefined => {
        // if (this.isH5 && this.isMobile) return;
        const scrollHeight = contentElement.offsetHeight;
        const offsetHeight = scrollBoxElement.offsetHeight;
        const scrollTop = scrollBoxElement.scrollTop;
        this.contentWidth = scrollBoxElement.offsetWidth;
        // //console.log(scrollHeight);
        // //console.log(offsetHeight);
        if (scrollHeight <= offsetHeight) {
          scrollbarElement.style.display = 'none';
        } else {
          scrollbarElement.style.display = 'block';
          let thumbHeight = offsetHeight * (offsetHeight / scrollHeight);
          if (thumbHeight < 50) thumbHeight = 50;
          thumbElement.style.height = thumbHeight + 'px';
          let thumbTop = (scrollTop / scrollHeight) * offsetHeight;
          if (thumbHeight == 50) {
            thumbTop =
              thumbTop -
              (50 - offsetHeight * (offsetHeight / scrollHeight)) * (scrollTop / (scrollHeight - offsetHeight));
          }
          thumbElement.style.top = thumbTop + 'px';
        }
      });
    });
    //监听内容区域的尺寸变化
    obs.observe(contentElement);
    obs.observe(scrollBoxElement);
    //监听滚动区域的滚动事件
    scrollBoxElement.onscroll = () => {
      // if (this.isH5 && this.isMobile) return;
      this.isScroll = true;
      this.scrollAction.emit();
      this.isScrollTimer?.unsubscribe();
      this.isScrollTimer = timer(1000)
        .pipe(untilDestroyed(this))
        .subscribe(_ => (this.isScroll = false));
      if (this.isdrag) return;
      const scrollTop = scrollBoxElement.scrollTop;
      const scrollHeight = scrollBoxElement.scrollHeight;
      const offsetHeight = scrollBoxElement.offsetHeight;
      let thumbTop = (scrollTop / scrollHeight) * offsetHeight;
      const thumbHeight = thumbElement.offsetHeight;
      if (thumbHeight == 50) {
        thumbTop =
          thumbTop - (50 - offsetHeight * (offsetHeight / scrollHeight)) * (scrollTop / (scrollHeight - offsetHeight));
      }
      thumbElement.style.top = thumbTop + 'px';
      if (scrollHeight - (scrollTop + offsetHeight) < 100) {
        this.loadMoreAction.emit();
      }
    };
    //监听滑块的滚动事件
    thumbElement.onmousedown = (event: MouseEvent) => {
      const scrollbarHeight = scrollbarElement.offsetHeight;
      const scollBoxScrollHeight = scrollBoxElement.scrollHeight;
      const scrollBoxOffsetHieght = scrollBoxElement.offsetHeight;
      const thumbTop = Number(thumbElement.style.top.replace('px', ''));
      const thumbHeight = thumbElement.offsetHeight;
      window.onmousemove = (event2: MouseEvent) => {
        this.isdrag = true;
        let newThumbTop = event2.clientY - event.clientY + thumbTop;
        if (newThumbTop > scrollbarHeight - thumbHeight) {
          newThumbTop = scrollbarHeight - thumbHeight;
        } else if (newThumbTop < 0) {
          newThumbTop = 0;
        }
        const rate = newThumbTop / (scrollbarHeight - thumbHeight);
        scrollBoxElement.scrollTop = (scollBoxScrollHeight - scrollBoxOffsetHieght) * rate;
        thumbElement.style.top = newThumbTop + 'px';
      };
      window.onmouseup = () => {
        this.isdrag = false;
        window.onmousemove = null;
      };
    };
  }
}
