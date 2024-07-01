import { TemplateRef, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig as _MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

export interface MatDialogConfig<D> extends _MatDialogConfig<D> {
  inAnimation?:
    | 'fadeIn'
    | 'fadeInDown'
    | 'fadeInLeft'
    | 'fadeInRight'
    | 'fadeInUp'
    | 'zoomIn'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'slideInUp';
  outAnimation?:
    | 'fadeOut'
    | 'fadeOutDown'
    | 'fadeOutLeft'
    | 'fadeOutRight'
    | 'fadeOutUp'
    | 'zoomOut'
    | 'slideOutDown'
    | 'slideOutLeft'
    | 'slideOutRight'
    | 'slideOutUp';
  speed?: 'faster' | 'fast' | 'slow' | 'slower'; // 不传默认0.5s, 四个值对应 0.2 | 0.3 | 0.8 | 1
  isFull?: boolean; //是否是全屏窗口
}

@Injectable({
  providedIn: 'root',
})
export class PopupService extends MatDialog {
  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    const id = Math.random().toString(16).slice(2, 8);

    const inAnimation = config?.inAnimation ? 'animate__' + config.inAnimation : 'animate__fadeIn';
    const outAnimation = config?.outAnimation ? 'animate__' + config.outAnimation : 'animate__fadeOut';
    const customPanelClass = ['popup-container', 'popup-' + id, 'animate__animated', 'animate__fill_none', inAnimation];
    const speedTimeMap = {
      default: 500,
      faster: 200,
      fast: 300,
      slow: 800,
      slower: 1000,
    };
    let speedTime = speedTimeMap.default;

    if (config?.speed) {
      speedTime = speedTimeMap[config.speed];
      customPanelClass.push('animate__' + config.speed);
    }

    if (config?.panelClass) {
      if (typeof config.panelClass === 'string') {
        customPanelClass.push(config.panelClass);
      } else {
        customPanelClass.push(...config.panelClass);
      }
    }

    if (config?.isFull) {
      customPanelClass.push('popup-container-full');
    }

    const customConfig: MatDialogConfig<D> = {
      ...config,
      panelClass: customPanelClass,
    };

    // 短暂隐藏消除自身动画
    const style = document.createElement('style');
    style.innerText = `.cdk-global-overlay-wrapper .popup-${id}{ display:none; }`;
    document.head.appendChild(style);
    setTimeout(() => {
      style.remove();
    }, 100);

    const matDialogRef: MatDialogRef<T, R> = super.open(componentOrTemplateRef, customConfig);

    const defaultClose = matDialogRef.close;
    matDialogRef.close = (dialogResult?: R) => {
      matDialogRef.removePanelClass(inAnimation).addPanelClass(outAnimation);
      setTimeout(() => {
        defaultClose.call(matDialogRef, dialogResult);
      }, speedTime / 2);
    };

    return matDialogRef;
  }
}
