/**
 * Register using addEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener(...args: any[]): any {
  let target: any | undefined;
  let events: Array<string> | string;
  let listeners: Array<Function>;
  let options: any;

  if (typeof args[0] === 'string' || Array.isArray(args[0])) {
    [events, listeners, options] = args;
    target = window;
  } else {
    [target, events, listeners, options] = args;
  }

  if (!target) return null;

  if (!Array.isArray(events)) events = [events];
  if (!Array.isArray(listeners)) listeners = [listeners];

  const cleanups: Function[] = [];
  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  };
  const register = (el: any, event: string, listener: any) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };

  cleanup();
  if (!target) return;

  cleanups.push(
    ...(events as string[]).flatMap((event) => {
      return (listeners as Function[]).map((listener) => register(target, event, listener));
    })
  );

  const stop = () => {
    cleanup();
  };

  return stop;
}
