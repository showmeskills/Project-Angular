/**
 * 由于内置一些时间选择器，样式被加载成公共的样式。所以需要在一些地方需要重置回最初的样式以及需要打开弹窗之后再请求根据请求再打开弹窗，不得不如此重写一些方法以及class需根据class调整
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentRef,
  Directive,
  Inject,
  Injectable,
  InjectFlags,
  InjectionToken,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  StaticProvider,
  TemplateRef,
  Type,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, OverlayContainer, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { Location } from '@angular/common';
import { defer, filter, fromEvent, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { MatModalConfig } from './modal-config';
import { _MatModalContainerBase, MatModalContainer } from './modal-container';
import { MatModalRef } from './modal-ref';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

/** Injection token that can be used to access the data that was passed in to a modal. */
export const MAT_MODAL_DATA = new InjectionToken<any>('MatModalData');

/** Injection token that can be used to specify default modal options. */
export const MAT_MODAL_DEFAULT_OPTIONS = new InjectionToken<MatModalConfig>('mat-modal-default-options');

/** Injection token that determines the scroll handling while the modal is open. */
export const MAT_MODAL_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('mat-modal-scroll-strategy');

/** @docs-private */
export function MAT_MODAL_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export function MAT_MODAL_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export const MAT_MODAL_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_MODAL_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_MODAL_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

/**
 * Base class for modal services. The base modal service allows
 * for arbitrary modal refs and modal container components.
 */
@Directive()
export abstract class _MatModalBase<C extends _MatModalContainerBase> implements OnDestroy {
  private _openModalsAtThisLevel: MatModalRef<any>[] = [];
  private readonly _afterAllClosedAtThisLevel = new Subject<void>();
  private readonly _afterOpenedAtThisLevel = new Subject<MatModalRef<any>>();
  private _ariaHiddenElements = new Map<Element, string | null>();
  private _scrollStrategy: () => ScrollStrategy;
  private _modalAnimatingOpen = false;
  private _animationStateSubscriptions!: Subscription;
  private _lastModalRef!: MatModalRef<any>;

  /** Keeps track of the currently-open modals. */
  get openModals(): MatModalRef<any>[] {
    return this._parentModal ? this._parentModal.openModals : this._openModalsAtThisLevel;
  }

  /** Stream that emits when a modal has been opened. */
  get afterOpened(): Subject<MatModalRef<any>> {
    return this._parentModal ? this._parentModal.afterOpened : this._afterOpenedAtThisLevel;
  }

  _getAfterAllClosed(): Subject<void> {
    const parent = this._parentModal;
    return parent ? parent._getAfterAllClosed() : this._afterAllClosedAtThisLevel;
  }

  // TODO (jelbourn): tighten the typing right-hand side of this expression.
  /**
   * Stream that emits when all open modal have finished closing.
   * Will emit on subscribe if there are no open modals to begin with.
   */
  readonly afterAllClosed: Observable<void> = defer(() =>
    this.openModals.length ? this._getAfterAllClosed() : this._getAfterAllClosed().pipe(startWith(undefined))
  ) as Observable<any>;

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    private _defaultOptions: MatModalConfig | undefined,
    private _parentModal: _MatModalBase<C> | undefined,
    private _overlayContainer: OverlayContainer,
    scrollStrategy: any,
    private _modalRefConstructor: Type<MatModalRef<any>>,
    private _modalContainerType: Type<C>,
    private _modalDataToken: InjectionToken<any>,
    private _animationMode?: 'NoopAnimations' | 'BrowserAnimations'
  ) {
    this._scrollStrategy = scrollStrategy;
  }

  /**
   * Opens a modal modal containing the given component.
   * @param component Type of the component to load into the modal.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened modal.
   */
  open<T, D = any, R = any>(component: ComponentType<T>, config?: MatModalConfig<D>): MatModalRef<T, R>;

  /**
   * Opens a modal modal containing the given template.
   * @param template TemplateRef to instantiate as the modal content.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened modal.
   */
  open<T, D = any, R = any>(template: TemplateRef<T>, config?: MatModalConfig<D>): MatModalRef<T, R>;

  open<T, D = any, R = any>(template: ComponentType<T> | TemplateRef<T>, config?: MatModalConfig<D>): MatModalRef<T, R>;

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatModalConfig<D>
  ): MatModalRef<T, R> {
    config = _applyConfigDefaults(config, this._defaultOptions || new MatModalConfig());

    if (
      config.id &&
      this.getModalById(config.id) &&
      (typeof window['ngDevMode'] === 'undefined' || window['ngDevMode'])
    ) {
      throw Error(`Modal with id "${config.id}" exists already. The modal id must be unique.`);
    }

    // If there is a modal that is currently animating open, return the MatModalRef of that modal
    if (this._modalAnimatingOpen) {
      return this._lastModalRef;
    }

    const overlayRef = this._createOverlay(config);

    if (config.hostClass !== undefined) {
      const hostClass: string[] = (Array.isArray(config.hostClass) ? config.hostClass : [config.hostClass]).filter(
        (e) => !!e
      );

      hostClass.length && overlayRef.hostElement.classList.add(...hostClass);
    }

    this._overlayContainer.getContainerElement().classList.add('cdk-overlay-container-modal');

    if (config.overlayClass !== undefined) {
      const overClass: string[] = (
        Array.isArray(config.overlayClass) ? config.overlayClass : [config.overlayClass]
      ).filter((e) => !!e);

      overClass.length && overlayRef.hostElement.classList.add(...overClass);
    }

    const modalContainerComponent = this._attachModalContainer(overlayRef, config);
    const modalContainer = modalContainerComponent.instance;

    if (this._animationMode !== 'NoopAnimations') {
      const animationStateSubscription = modalContainer._animationStateChanged.subscribe((modalAnimationEvent) => {
        if (modalAnimationEvent.state === 'opening') {
          this._modalAnimatingOpen = true;
        }
        if (modalAnimationEvent.state === 'opened') {
          this._modalAnimatingOpen = false;
          animationStateSubscription.unsubscribe();
        }
      });
      if (!this._animationStateSubscriptions) {
        this._animationStateSubscriptions = new Subscription();
      }
      this._animationStateSubscriptions.add(animationStateSubscription);
    }

    const modalRef = this._attachModalContent<T, R>(componentOrTemplateRef, modalContainer, overlayRef, config);
    this._lastModalRef = modalRef;

    // If this is the first modal that we're opening, hide all the non-overlay content.
    if (!this.openModals.length) {
      this._hideNonModalContentFromAssistiveTechnology();
    }

    // 设置点击弹窗以外关闭弹窗 -> TODO 还需要再优化点击matContainer白色空白区域会被关闭：由于需要自动收缩，或弹窗中有其他的下拉等一些body节点下的操作，这里检测一手组件以外都关闭
    fromEvent<MouseEvent>(overlayRef.hostElement, 'click')
      .pipe(
        filter(({ target }) => (target as HTMLElement).contains(modalContainerComponent.location.nativeElement)),
        takeUntil(modalRef.afterClosed())
      )
      .subscribe((res: MouseEvent) => {
        const backdropClick = overlayRef.backdropClick();
        if (backdropClick && backdropClick['next']) {
          overlayRef.backdropClick()['next'](res);
        }
      });

    this.openModals.push(modalRef);
    modalRef.afterClosed().subscribe(() => this._removeOpenModal(modalRef));
    this.afterOpened.next(modalRef);

    // Notify the modal container that the content has been attached.
    modalContainer._initializeWithAttachedContent();

    return modalRef;
  }

  /**
   * Closes all of the currently-open modals.
   */
  closeAll(): void {
    this._closeModals(this.openModals);
  }

  /**
   * Finds an open modal by its id.
   * @param id ID to use when looking up the modal.
   */
  getModalById(id: string): MatModalRef<any> | undefined {
    return this.openModals.find((modal) => modal.id === id);
  }

  ngOnDestroy() {
    // Only close the modals at this level on destroy
    // since the parent service may still be active.
    this._closeModals(this._openModalsAtThisLevel);
    this._afterAllClosedAtThisLevel.complete();
    this._afterOpenedAtThisLevel.complete();
    // Clean up any subscriptions to modals that never finished opening.
    if (this._animationStateSubscriptions) {
      this._animationStateSubscriptions.unsubscribe();
    }
  }

  /**
   * Creates the overlay into which the modal will be loaded.
   * @param config The modal configuration.
   * @returns A promise resolving to the OverlayRef for the created overlay.
   */
  private _createOverlay(config: MatModalConfig): OverlayRef {
    const overlayConfig = this._getOverlayConfig(config);
    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an overlay config from a modal config.
   * @param modalConfig The modal configuration.
   * @returns The overlay configuration.
   */
  private _getOverlayConfig(modalConfig: MatModalConfig): OverlayConfig {
    const state = new OverlayConfig({
      positionStrategy: this._overlay.position().global(),
      scrollStrategy: modalConfig.scrollStrategy || this._scrollStrategy(),
      panelClass: modalConfig.panelClass,
      hasBackdrop: modalConfig.hasBackdrop,
      direction: modalConfig.direction,
      minWidth: modalConfig.minWidth,
      minHeight: modalConfig.minHeight,
      maxWidth: modalConfig.maxWidth,
      maxHeight: modalConfig.maxHeight,
      disposeOnNavigation: modalConfig.closeOnNavigation,
    });

    if (modalConfig.backdropClass) {
      state.backdropClass = modalConfig.backdropClass;
    }

    return state;
  }

  /**
   * Attaches a modal container to a modal's already-created overlay.
   * @param overlay Reference to the modal's underlying overlay.
   * @param config The modal configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  private _attachModalContainer(overlay: OverlayRef, config: MatModalConfig): ComponentRef<C> {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [{ provide: MatModalConfig, useValue: config }],
    });

    const containerPortal = new ComponentPortal(
      this._modalContainerType,
      config.viewContainerRef,
      injector,
      config.componentFactoryResolver
    );

    return overlay.attach<C>(containerPortal);
  }

  /**
   * Attaches the user-provided component to the already-created modal container.
   * @param componentOrTemplateRef The type of component being loaded into the modal,
   *     or a TemplateRef to instantiate as the content.
   * @param modalContainer Reference to the wrapping modal container.
   * @param overlayRef Reference to the overlay in which the modal resides.
   * @param config The modal configuration.
   * @returns A promise resolving to the MatModalRef that should be returned to the user.
   */
  private _attachModalContent<T, R>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    modalContainer: C,
    overlayRef: OverlayRef,
    config: MatModalConfig
  ): MatModalRef<T, R> {
    // Create a reference to the modal we're creating in order to give the user a handle
    // to modify and close it.
    const modalRef = new this._modalRefConstructor(overlayRef, modalContainer, config.id);

    if (componentOrTemplateRef instanceof TemplateRef) {
      modalContainer.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!, <any>{
          $implicit: config.data,
          close: (v?: any) => modalRef.close(v),
          dismiss: (reason?: any) => modalRef.dismiss(reason),
          modalRef,
        })
      );
    } else {
      const injector = this._createInjector<T>(config, modalRef, modalContainer);
      const contentRef = modalContainer.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, config.viewContainerRef, injector)
      );
      modalRef.componentInstance = contentRef.instance;
    }

    modalRef.updateSize(config.width, config.height).updatePosition(config.position);

    return modalRef;
  }

  /**
   * Creates a custom injector to be used inside the modal. This allows a component loaded inside
   * of a modal to close itself and, optionally, to return a value.
   * @param config Config object that is used to construct the modal.
   * @param modalRef Reference to the modal.
   * @param modalContainer Modal container element that wraps all of the contents.
   * @returns The custom injector that can be used inside the modal.
   */
  private _createInjector<T>(config: MatModalConfig, modalRef: MatModalRef<T>, modalContainer: C): Injector {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;

    // The modal container should be provided as the modal container and the modal's
    // content are created out of the same `ViewContainerRef` and as such, are siblings
    // for injector purposes. To allow the hierarchy that is expected, the modal
    // container is explicitly provided in the injector.
    const providers: StaticProvider[] = [
      { provide: this._modalContainerType, useValue: modalContainer },
      { provide: this._modalDataToken, useValue: config.data },
      { provide: this._modalRefConstructor, useValue: modalRef },
    ];

    if (
      config.direction &&
      (!userInjector || !userInjector.get<Directionality | null>(Directionality, null, InjectFlags.Optional))
    ) {
      providers.push({
        provide: Directionality,
        useValue: { value: config.direction, change: observableOf() },
      });
    }

    return Injector.create({
      parent: userInjector || this._injector,
      providers,
    });
  }

  /**
   * Removes a modal from the array of open modals.
   * @param modalRef Modal to be removed.
   */
  private _removeOpenModal(modalRef: MatModalRef<any>) {
    const index = this.openModals.indexOf(modalRef);

    if (index > -1) {
      this.openModals.splice(index, 1);

      // If all the modals were closed, remove/restore the `aria-hidden`
      // to a the siblings and emit to the `afterAllClosed` stream.
      if (!this.openModals.length) {
        this._ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute('aria-hidden', previousValue);
          } else {
            element.removeAttribute('aria-hidden');
          }
        });

        this._ariaHiddenElements.clear();
        this._getAfterAllClosed().next();
      }
    }
  }

  /**
   * Hides all of the content that isn't an overlay from assistive technology.
   */
  private _hideNonModalContentFromAssistiveTechnology() {
    const overlayContainer = this._overlayContainer.getContainerElement();

    // Ensure that the overlay container is attached to the DOM.
    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;

      for (let i = siblings.length - 1; i > -1; i--) {
        const sibling = siblings[i];

        if (
          sibling !== overlayContainer &&
          sibling.nodeName !== 'SCRIPT' &&
          sibling.nodeName !== 'STYLE' &&
          !sibling.hasAttribute('aria-live')
        ) {
          this._ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
          sibling.setAttribute('aria-hidden', 'true');
        }
      }
    }
  }

  /** Closes all of the modals in an array. */
  private _closeModals(modals: MatModalRef<any>[]) {
    let i = modals.length;

    while (i--) {
      // The `_openModals` property isn't updated after close until the rxjs subscription
      // runs on the next microtask, in addition to modifying the array as we're going
      // through it. We loop through all of them and call close without assuming that
      // they'll be removed from the list instantaneously.
      modals[i].close();
    }
  }
}

/**
 * Service to open Material Design modal modals.
 */
@Injectable()
export class MatModal extends _MatModalBase<MatModalContainer> {
  constructor(
    overlay: Overlay,
    injector: Injector,
    /**
     * @deprecated `_location` parameter to be removed.
     * @breaking-change 10.0.0
     */
    @Optional() location: Location,
    @Optional()
    @Inject(MAT_MODAL_DEFAULT_OPTIONS)
    defaultOptions: MatModalConfig,
    @Inject(MAT_MODAL_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() @SkipSelf() parentModal: MatModal,
    overlayContainer: OverlayContainer,
    @Optional()
    @Inject(ANIMATION_MODULE_TYPE)
    animationMode?: 'NoopAnimations' | 'BrowserAnimations'
  ) {
    super(
      overlay,
      injector,
      defaultOptions,
      parentModal,
      overlayContainer,
      scrollStrategy,
      MatModalRef,
      MatModalContainer,
      MAT_MODAL_DATA,
      animationMode
    );
  }
}

/**
 * Applies default options to the modal config.
 * @param config Config to be modified.
 * @param defaultOptions Default options provided.
 * @returns The new configuration object.
 */
function _applyConfigDefaults(config?: MatModalConfig, defaultOptions?: MatModalConfig): MatModalConfig {
  return { ...defaultOptions, ...config };
}

/**
 * Service to open Material Design modal modals.
 */
@Injectable()
export class DrawerService extends _MatModalBase<MatModalContainer> {
  constructor(
    overlay: Overlay,
    injector: Injector,
    /**
     * @deprecated `_location` parameter to be removed.
     * @breaking-change 10.0.0
     */
    @Optional() location: Location,
    @Optional()
    @Inject(MAT_MODAL_DEFAULT_OPTIONS)
    defaultOptions: MatModalConfig,
    @Inject(MAT_MODAL_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() @SkipSelf() parentModal: MatModal,
    overlayContainer: OverlayContainer,
    @Optional()
    @Inject(ANIMATION_MODULE_TYPE)
    animationMode?: 'NoopAnimations' | 'BrowserAnimations'
  ) {
    super(
      overlay,
      injector,
      defaultOptions,
      parentModal,
      overlayContainer,
      scrollStrategy,
      MatModalRef,
      MatModalContainer,
      MAT_MODAL_DATA,
      animationMode
    );
  }

  override open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatModalConfig<D>
  ): MatModalRef<T, R> {
    return super.open(componentOrTemplateRef, {
      ...config,
      overlayClass: 'drawer-overlay-wrapper',
      height: '100%',
    });
  }
}
