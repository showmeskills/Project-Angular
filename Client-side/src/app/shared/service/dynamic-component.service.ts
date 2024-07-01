import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DynamicComponentService {
  constructor(private factory: ComponentFactoryResolver, private injector: Injector, private appRef: ApplicationRef) {}

  /**
   * 创建某个组件然后附加到文档末尾,id 是用作标识的，组件内请勿占用或随便改
   *
   * @param container 要创建组件
   * @param mergeObj 要合并的对象
   * @param hostElementId
   * @param parent
   * @returns
   */
  generator<T extends { id: string }>(
    container: Type<T>,
    mergeObj?: { [key: string]: any },
    hostElementId?: string,
    parent?: HTMLElement
  ): ComponentRef<T> {
    const id = hostElementId || this.makeID();
    const component: ComponentRef<T> = this.factory.resolveComponentFactory<T>(container).create(this.injector);

    //合并传入对象
    this.update(component, mergeObj);

    component.instance.id = id;
    this.appRef.attachView(component.hostView);
    const hostElement: HTMLElement = window.document.createElement('span');
    hostElement.setAttribute('id', id);
    hostElement.appendChild((component.hostView as EmbeddedViewRef<any>).rootNodes[0]);
    (parent || window.document.body).appendChild(hostElement);
    return component;
  }

  /**
   * 销毁某个由本服务创建的组件
   *
   * @param com 要销毁的组件
   * @param delay 等动画完成再删除dom,如果没有动画，delay传0
   */
  destroy(com: ComponentRef<any>, delay: number = 500): void {
    const timer = setTimeout(() => {
      const id = com.instance.id;
      this.appRef.detachView(com.hostView);
      com.destroy();
      const hostElement = window.document.getElementById(id);
      if (hostElement) hostElement.parentElement?.removeChild(hostElement);
      clearTimeout(timer);
    }, delay);
  }

  /**
   * 更新组件
   *
   * @param com 更新的组件
   * @param mergeObj 要更新的属性对象
   */
  update(com: ComponentRef<any>, mergeObj?: { [key: string]: any }) {
    if (mergeObj instanceof Object) {
      Object.keys(mergeObj).forEach(key => {
        (com as any).instance[key] = mergeObj[key];
      });
    }
  }

  /**制造一个应该不会相同的id */
  makeID(): string {
    return Math.random().toString(16).slice(2, 8);
  }
}
