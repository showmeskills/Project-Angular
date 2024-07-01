import { Directive, ElementRef, Input, OnDestroy, OnChanges, Output, EventEmitter } from '@angular/core';

export interface intersectionObserverConfig {
  root?: null | HTMLDivElement; // 相对检查容器，默认为null(顶级文档的视窗)
  once?: boolean; // 是否只检测一次。true 则变化一次后停止
  class?: string; // 要添加删除的样式 name
  removeWhenInactive?: boolean; // 当 activity 变化为 false 时 是否清除添加的样式,
  offset?: string; // 偏移 默认 '0px 0px 0px 0px'
}

@Directive({
  selector: '[intersectionObserver]',
})
export class IntersectionObserverDirective implements OnDestroy, OnChanges {
  @Input('intersectionObserver') activity: boolean = true; // 是否活动的，为false则不会检测变化
  @Input('intersectionObserver-config') userConfig?: intersectionObserverConfig;
  @Output('intersectChange') change: EventEmitter<boolean> = new EventEmitter(); // 可以额外添加监听做你要得任何事,完整为true，不完整为false
  @Output('intersectFullChange') fullChange: EventEmitter<IntersectionObserverEntry[]> = new EventEmitter(); // 更详细的监听事件

  defaultConfig: intersectionObserverConfig = {
    root: null,
    once: false,
    class: 'incomplete',
    removeWhenInactive: true,
  };

  private config!: intersectionObserverConfig;

  private observer!: IntersectionObserver;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(): void {
    this.config = { ...this.defaultConfig, ...this.userConfig };
    this.observer?.disconnect();
    this.start();
  }

  start() {
    if (this.activity) {
      this.observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          this.fullChange.emit(entries);
          let incomplete!: boolean;
          entries.forEach(x => (incomplete = x.intersectionRatio !== 1));
          incomplete ? this.addClass() : this.removeClass();
          this.change.emit(!incomplete);
        },
        {
          root: this.config.root,
          threshold: 1,
          rootMargin: this.config.offset || '0px 0px 0px 0px',
        }
      );
      this.observer.observe(this.elementRef.nativeElement);
    } else {
      this.config.removeWhenInactive && this.removeClass();
    }
  }

  private addClass() {
    if (!this.activity) return;
    this.elementRef.nativeElement.classList.add(this.config.class);
    if (this.config.once) this.observer?.disconnect();
  }

  private removeClass() {
    this.elementRef.nativeElement.classList.remove(this.config.class);
    if (this.config.once) this.observer?.disconnect();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
