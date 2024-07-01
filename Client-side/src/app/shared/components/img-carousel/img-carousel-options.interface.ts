export interface ImgCarouselOptions {
  /** 是否显示分页 */
  pagination?: boolean;
  /** 滚动速度,单位毫秒 */
  speed?: number;
  /** 当前要显示的数量 */
  slidesPerView?: number;
  /** 一次滚动的数量 */
  slidesPerGroup?: number;
  /** Item间距，单位px */
  spaceBetween?: number;
  /** 是否为循环模式 */
  loop?: boolean;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 延迟时间 */
  deplay?: number;
  /** 断点配置，判断方式为宽度小于等于，基于 container 容器 */
  breakpoints?: ImgCarouselBreakpoint;
  /** 是否支持手势滑 */
  allowTouchMove?: boolean;
}

export interface BreakpointOptions {
  /** 当前要显示的数量 */
  slidesPerView?: number;
  /** 一次滚动的数量 */
  slidesPerGroup?: number;
  /** 是否显示分页 */
  pagination?: boolean;
  /** Item间距，单位px */
  spaceBetween?: number;
  /** 是否支持手势滑 */
  allowTouchMove?: boolean;
}

export interface ImgCarouselBreakpoint {
  [width: number]: BreakpointOptions;
}
