import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, isDevMode } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { catchError, interval, of, switchMap, timeout } from 'rxjs';
import { LocaleService } from './locale.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class SWService {
  constructor(
    private updates: SwUpdate,
    // private swPush: SwPush,
    private toast: ToastService,
    private destroyRef: DestroyRef,
    private localeService: LocaleService,
    private http: HttpClient,
  ) {}

  init() {
    //开发模式关闭
    if (isDevMode()) return;

    // 每隔10分钟检查一次是否有更新
    interval(10 * 60 * 1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() =>
          this.http.get<{ version: string } | null>(window.location.origin + '/release.json?v=' + Date.now()).pipe(
            timeout(10 * 1000),
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe(v => {
        if (v?.version !== window.version) {
          try {
            console.log('versionUpdates:', 'checkForUpdate...');
            this.updates.checkForUpdate();
          } catch (err) {
            console.error('Failed to check for updates:', err);
          }
        }
      });

    // 提示刷新
    this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(e => {
      switch (e.type) {
        case 'VERSION_DETECTED':
          //每当在服务器上检测到新版本时发出事件
          console.log('versionUpdates:', 'VERSION_DETECTED');
          break;
        case 'VERSION_READY':
          //每当新版本下载并准备好激活时发出一个事件
          console.log('versionUpdates:', 'VERSION_READY');
          this.toast.show({
            title: '',
            type: 'success',
            message: this.localeService.getValue('new_version_resouce_update'),
            duration: 0,
          });
          break;
        case 'VERSION_INSTALLATION_FAILED':
          //每当检查或下载新版本失败时发出事件
          console.log('versionUpdates:', 'VERSION_INSTALLATION_FAILED');
          break;
        default:
          //无更新
          console.log('versionUpdates:', 'NO_NEW_VERSION_DETECTED');
          break;
      }
    });

    // 提示必须刷新
    this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(e => {
      // 每当服务工作线程用于为该客户端提供服务的应用程序版本处于损坏状态（如果不重新加载整个页面就无法恢复）时，就会发出一个事件
      console.log('versionUpdates:', 'UNRECOVERABLE');
      this.toast.show({
        title: '',
        type: 'fail',
        message: this.localeService.getValue('version_resouce_break'),
        duration: 0,
      });
    });

    // 注册通知
    // this.swPush.subscription.pipe(first()).subscribe(subscription => {
    //   if (subscription) {
    //     console.log('通知已经注册，swPush', subscription);
    //   } else {
    //     this.swPush
    //       .requestSubscription({
    //         // TODO: 后期应该放到环境变量里面
    //         serverPublicKey: 'BJWKRuUyeZY0JZHUzrZ3z3duB5_lm-5SNfecfbPOusMMSmYVPu8nhzW1G4Ea_OPECw4bPn_i08tUuqpom3SqJwg',
    //       })
    //       .then(sub => {
    //         // TODO: 这里之后需要后端提供订阅接口，把 sub 对象 POST 给后端存起来
    //         console.log('通知注册成功，swPush', sub);
    //         this.notification('提示', '通知注册成功');
    //       })
    //       .catch(_ => console.error(_));
    //   }
    // });

    // 提示用户安装web应用
    // fromEvent(window, 'beforeinstallprompt')
    //   .pipe(delay(2000), first())
    //   .subscribe(install => {
    //     console.log(install);
    //     install.preventDefault();
    //     this.toast.show({
    //       message: '点我！马上安装到桌面，访问快人一步！',
    //       onClick: () => {
    //         //@ts-ignore
    //         install.prompt();
    //       },
    //     });
    //     //@ts-ignore
    //     install.userChoice.then(result => {
    //       if (result.outcome === 'accepted') {
    //         //用户同意了安装
    //         this.toast.show({ type: 'success', message: '安装完成' });
    //       } else {
    //         //用户拒绝了安装
    //       }
    //     });
    //   });
  }

  /**
   * 发送系统级别的通知
   *
   * @param title
   * @param msg
   * @param callback
   */
  // notification(title: string, msg: string, callback: () => void = () => {}) {
  //   if ('Notification' in window) {
  //     Notification.requestPermission().then(permission => {
  //       if (permission === 'granted') {
  //         const notification = new Notification(title, {
  //           body: msg,
  //         });

  //         notification.onclick = () => {
  //           // 处理点击通知后的操作
  //           callback();
  //         };
  //       }
  //     });
  //   }
  // }
}
