import { ComponentRef, Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { ToastComponent } from '../components/toast/toast.component';
import { DynamicComponentService } from './dynamic-component.service';
import { LocaleService } from './locale.service';

export interface ToastParams {
  message: string;
  title?: string;
  type?: 'success' | 'fail';
  showClose?: boolean;
  duration?: number;
  onClose?: () => void;
  customClass?: string;
  onClick?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /**toast队列 */
  private components: ComponentRef<ToastComponent>[] = [];

  constructor(private dynamic: DynamicComponentService, private localeService: LocaleService) {}

  /**
   * 创建一个toast
   * @ message: string 必须,消息内容
   * @ title?: string 有type的时候，不传title也会有默认的title，除非显式传空字符串
   * @ type?: 'success' | 'fail' 是否有类型（带有默认标题和icon）
   * @ showClose?: boolean 是否显示关闭按钮 默认true
   * @ duration?: number 多久之后关闭,默认5000
   * @ onClose?: Function 关闭后回调。注意如果是指向某个单独函数，需要 this.xxx.bind(this) 重新指定上下文
   * @ customClass?: string 多个样式时用空格隔开
   * @ onClick?: Function 点击回调
   *
   * @param config
   */
  show(config: ToastParams): void {
    timer(0).subscribe(_ => {
      //设置默认标题
      if (config.type && config.title === undefined) {
        config.title = {
          success: this.localeService.getValue('successful'),
          fail: this.localeService.getValue('failed'),
        }[config.type];
      }

      //创建toast组件，并合并传入的config
      this.createComponent(config);
      const length = this.components.length;
      const current = this.components[length - 1];

      //前一个高度准备好后，增加位移
      if (length > 1) {
        const lastInstance = this.components[length - 2].instance;
        current.instance.offset = lastInstance.height + lastInstance.offset + 15;
      }

      //重写toast组件的onDestroy，手动调用销毁
      current.instance.onDestroy = () => {
        const index = this.components.findIndex(com => com.instance.id === current.instance.id);
        this.components.forEach((com, i) => {
          if (i <= index) return;
          com.instance.offset = com.instance.offset - current.instance.height - 15;
        });
        this.dynamic.destroy(current);
        this.components.splice(index, 1);
      };
    });
  }

  //往队列内添加一个toast
  private createComponent(config: ToastParams): void {
    const com: ComponentRef<ToastComponent> = this.dynamic.generator(ToastComponent, config);
    this.components.push(com);
  }
}
