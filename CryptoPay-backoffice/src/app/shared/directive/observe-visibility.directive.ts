import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

/**
 * 节流
 * @param callback
 * @param delay
 * @param options
 */
function throttle(callback, delay, options = {}) {
  let timeout;
  let lastState;
  let currentArgs;

  const throttled = (state, ...args) => {
    currentArgs = args;
    if (timeout && state === lastState) return;

    let leading = options['leading'];

    if (typeof leading === 'function') {
      leading = leading(state, lastState);
    }

    if ((!timeout || state !== lastState) && leading) {
      callback(state, ...currentArgs);
    }

    lastState = state;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(state, ...currentArgs);
      timeout = 0;
    }, delay);
  };

  throttled._clear = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  return throttled;
}

/**
 * 判断两值是否相等 如果是对象则判断值二对象属性值是否包含值一对象属性值并是否相等
 * @param val1
 * @param val2
 */
function deepEqual(val1, val2) {
  if (val1 === val2) return true;
  if (typeof val1 === 'object') {
    for (const key in val1) {
      if (!deepEqual(val1[key], val2[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

@Directive({
  selector: '[observeVisibility]',
  standalone: true,
})
export class ObserveVisibilityDirective implements AfterViewInit {
  observer;
  frozen;
  callback;
  oldResult;
  nodeField = '_ng_visibilityState';

  private _options: any = {};

  @Input('observeVisibility')
  get options() {
    return this._options;
  }

  set options(value) {
    this._options = value;
  }

  constructor(private el: ElementRef) {
    this.observer = null;
    this.frozen = false;
    this.createObserver();
  }

  get threshold() {
    return this.options.intersection && typeof this.options.intersection.threshold === 'number'
      ? this.options.intersection.threshold
      : 0;
  }

  createObserver() {
    if (this.observer) {
      this.destroyObserver();
    }

    if (this.frozen) return;

    this.options = this.processOptions(this.options);

    this.callback = (result, entry) => {
      this.options.callback(result, entry);
      if (result && this.options.once) {
        this.frozen = true;
        this.destroyObserver();
      }
    };

    // Throttle
    if (this.callback && this.options.throttle) {
      const { leading } = this.options.throttleOptions || {};
      this.callback = throttle(this.callback, this.options.throttle, {
        leading: (state) => {
          return leading === 'both' || (leading === 'visible' && state) || (leading === 'hidden' && !state);
        },
      });
    }

    this.oldResult = undefined;

    this.observer = new IntersectionObserver((entries) => {
      let entry = entries[0];

      if (entries.length > 1) {
        const intersectingEntry = entries.find((e) => e.isIntersecting);
        if (intersectingEntry) {
          entry = intersectingEntry;
        }
      }

      if (this.callback) {
        const result = entry.isIntersecting && entry.intersectionRatio >= this.threshold;
        if (result === this.oldResult) return;
        this.oldResult = result;
        this.callback(result, entry);
      }
    }, this.options.intersection);

    if (this.observer) {
      this.observer.observe(this.el.nativeElement);
    }
  }

  /**
   * 处理参数
   * @param value
   */
  processOptions(value: Object | Function): { callback: Function } {
    let options;
    if (typeof value === 'function') {
      // function
      options = {
        callback: value,
      };
    } else {
      // object
      options = value;
    }
    return options;
  }

  destroyObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 取消节流
    if (this.callback && this.callback._clear) {
      this.callback._clear();
      this.callback = null;
    }
  }

  update({ value, oldValue }) {
    if (deepEqual(value, oldValue)) return;
    const state = this.el[this.nodeField];
    if (!value) {
      this.unbind();
      return;
    }
    if (state) {
      state.createObserver(value);
    } else {
      this.bind();
    }
  }

  unbind() {
    const state = this.el[this.nodeField];
    if (state) {
      state.destroyObserver();
      delete this.el[this.nodeField];
    }
  }

  /**
   * 绑定初始化
   */
  ngAfterViewInit(): void {
    this.bind();

    // if (!value) return;
    // if (typeof IntersectionObserver === 'undefined') {
    //   console.warn(
    //     '[observe-visibility Directive] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill'
    //   );
    // } else {
    //   const state = new VisibilityState(el, value, vnode);
    //   el[this.nodeField] = state;
    // }
  }

  /**
   * 绑定
   */
  bind() {
    this.createObserver();
    this.el.nativeElement[this.nodeField] = this;
  }
}
