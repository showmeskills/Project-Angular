export class SwiperExtensions {
  private static easeOut(currentTime: number, startValue: number, changeValue: number, duration: number) {
    currentTime /= duration;
    return -changeValue * currentTime * (currentTime - 2) + startValue;
  }

  private static getTransitionSimulator(ele: any, distance: any, duration: any, callback: any) {
    let handle: any;
    let resolve: any;
    return () => {
      const promise = new Promise(res => {
        resolve = res;
      });
      const startTime = performance.now();
      cancelAnimationFrame(handle);
      /**
       *
       */
      function _animation() {
        const current = performance.now();
        // distance to move this frame
        const disVal = SwiperExtensions.easeOut(current - startTime, 0, distance, duration);

        callback(ele, disVal);
        if ((current - startTime) / duration < 1) {
          handle = requestAnimationFrame(_animation);
        } else {
          cancelAnimationFrame(handle);
          resolve();
        }
      }
      handle = requestAnimationFrame(_animation);
      return promise;
    };
  }

  static async setTranslate(event: [swiper: any, translate: number]) {
    const [swiper, translate] = event;
    const wrapper = swiper.$wrapperEl[0]; // wrapper element
    // when use transition to do animation
    if (wrapper.style.transitionDuration !== '0ms') {
      // get origin translate value
      const curTransVal = swiper.getTranslate();
      // console.log(curTransVal)
      // cancel the animation of transition
      wrapper.style.transitionDuration = '';
      wrapper.style.transform = `translate3d(${curTransVal}px, 0px, 0px)`;
      const distance = translate - curTransVal;
      // if (distance > 0) distance = curTransVal;

      // use requestFrameAnimation to do animation my self
      const transSimulator = SwiperExtensions.getTransitionSimulator(wrapper, distance, 300, (el: any, val: any) => {
        el.style.transform = `translate3d(${curTransVal + val}px, 0px, 0px)`;
      });
      await transSimulator();
      // End the transition, call the callback (simulate the internal implementation of Swiper)
      swiper?.onSlideToWrapperTransitionEnd?.call(wrapper, { target: wrapper });
    }
  }
}
