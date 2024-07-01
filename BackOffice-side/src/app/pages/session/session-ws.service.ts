import { inject, Injectable, OnDestroy } from '@angular/core';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { environment } from 'src/environments/environment';
import { catchError, concatMap, retry, takeUntil, tap } from 'rxjs/operators';
import { SessionCommandEnum, SessionMsg } from 'src/app/shared/interfaces/session';
import { BehaviorSubject, delay, filter, Observable, of, race, Subject, Subscription, timer } from 'rxjs';
import { filterParams } from 'src/app/shared/models/tools.model';

/**
 * 判断当前所选类型的对象
 */
type MsgTypeFinal<T> = Readonly<Record<keyof typeof SessionCommandEnum, T>>;

@Injectable()
export class SessionWsService implements OnDestroy {
  private ls = inject(LocalStorageService);
  private ws$: WebSocketSubject<SessionMsg> | null = null; // new WebSocketSubject<SessionMsg>(this.#url);
  private heartbeat$: Subscription | null = null;
  private networkError = false;
  private destroy$ = new Subject<void>();
  #isConnect$ = new BehaviorSubject(false);
  #onMessage$ = new Subject<SessionMsg>();

  get isConnect$() {
    return this.#isConnect$.asObservable().pipe(takeUntil(this.destroy$));
  }

  get onMessage$() {
    return this.#onMessage$.asObservable();
  }

  // ws地址   type=2 运营后台   token=gogaming的token
  #url = ``;
  // #url = `${environment.wsUrl}/ws?type=2&token=${JSON.stringify({ uid: 907382910779461, mid: 1 })}`;

  constructor() {}

  /**
   * 开始心跳
   */
  startHeartbeat(): void {
    this.stopHeartbeat();
    this.networkError = false;

    const heartbeat$: Observable<SessionMsg> = timer(1_000, environment.wsHeartbeatTime).pipe(
      tap(() => this.ws$?.next({ command: SessionCommandEnum.HEARTBEAT, hbbyte: -127 })),
      concatMap(() => {
        return race(
          of({ command: SessionCommandEnum.Error, msg: 'timeout' }).pipe(delay(3_000)), // 3s 没收到pong 超时
          this.connect(this.#url).pipe(
            filter((data) => data.command === SessionCommandEnum.HEARTBEAT && data.data.hbbyte === -128),
            catchError(() => of({ command: SessionCommandEnum.Error, msg: 'error' }))
          )
        );
      })
    );

    this.heartbeat$ = heartbeat$.subscribe((msg) => {
      if (msg.command && msg.command === SessionCommandEnum.HEARTBEAT && msg.data.hbbyte === -128) {
        this.networkError = false;
      } else {
        this.networkError = true;
        this.ws$?.complete();
      }
    });
  }

  /**
   * 停止心跳
   */
  stopHeartbeat(): void {
    this.heartbeat$?.unsubscribe();
  }

  connect(url: string, connectSubject?: Subject<any>): WebSocketSubject<SessionMsg> {
    if (!this.ws$) {
      const closeObserver = new Subject<CloseEvent>();

      // 关闭之后销毁ws {"uid": 907382910779461, "mid": 1}
      closeObserver.subscribe(() => {
        // this.ws$?.complete();
        // this.ws$ = null;
        console.log('im ws destroy！');
        this.#isConnect$.next(false);
        // connectSubject?.unsubscribe();
        // connectSubject?.complete();
      });

      if (url) {
        this.#url = url;
      }

      if (!this.#url) {
        throw new Error('ws url is null');
      }

      this.ws$ = new WebSocketSubject<SessionMsg>({
        url: this.#url,
        closeObserver,
        openObserver: {
          next: () => {
            console.log('im connection open!');

            this.#isConnect$.next(true);
            connectSubject?.next(this.ws$);

            this.startListening();
            this.startHeartbeat();
          },
        },
      });

      this.destroy$ = new Subject<void>();
      this.#onMessage$.complete();
      this.#onMessage$ = new Subject<SessionMsg>();
      this.ws$.pipe(retry({ count: Infinity, delay: 1_000 }), takeUntil(this.destroy$)).subscribe((res) => {
        this.#onMessage$.next(res);
      });
    } else {
      connectSubject?.next(this.ws$);
    }

    return this.ws$;
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.ws$) {
        this.stopHeartbeat();
        this.networkError = false;

        this.ws$.unsubscribe();
        this.ws$.complete();
        this.ws$ = null;
        this.#onMessage$.complete();

        setTimeout(() => resolve(true), 500);
      } else {
        resolve(true);
      }
    });
  }

  startListening(): void {
    if (!this.ws$) return console.error('ws$ is null, listener fail');

    // 服务协议为单发消息，除了聊天消息其余都只会收到一次
    // this.ws$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
    //   this.#onMessage$.next(res);
    // });
  }

  /**
   * 发送消息
   * @param data
   */
  #send(data: SessionMsg): void {
    this.connect(this.#url).next(data);
  }

  /**
   * 发送消息
   */
  public readonly send: MsgTypeFinal<(msg: any) => void> = (() => {
    const keyList = Object.keys(SessionCommandEnum) as (keyof typeof SessionCommandEnum)[];

    const obj: MsgTypeFinal<(msg: any) => void> = ((data: SessionMsg) => {
      this.#send(filterParams(data));
    }) as any; // Object.create({}); // 创建一个空对象（原型是null的空对象）

    keyList.forEach((key) => {
      obj[key as any] = <T extends SessionMsg | string>(v: T) => {
        if (typeof v !== 'object') {
          v = { msg: v } as T;
        }

        return this.#send(filterParams({ command: SessionCommandEnum[key], ...(v as SessionMsg) }));
      };
    });

    return obj;
  })();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
