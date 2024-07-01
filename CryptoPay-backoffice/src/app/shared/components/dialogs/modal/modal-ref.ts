/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusOrigin } from '@angular/cdk/a11y';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ModalPosition } from './modal-config';
import { _MatModalContainerBase } from './modal-container';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// TODO(jelbourn): resizing

// Counter for unique modal ids.
let uniqueId = 0;

/** Possible states of the lifecycle of a modal. */
export const enum MatModalState {
  OPEN,
  CLOSING,
  CLOSED,
}

/**
 * Reference to a modal opened via the MatModal service.
 */
export class MatModalRef<T, R = any> {
  /** The instance of component opened into the modal. */
  componentInstance!: T;

  /** Whether the user is allowed to close the modal. */
  disableClose: boolean | undefined = this._containerInstance._config.disableClose;

  /** Subject for notifying the user that the modal has finished opening. */
  private readonly _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the modal has finished closing. */
  private readonly _afterClosed = new Subject<R | undefined>();

  /** Subject for notifying the user that the modal has started closing. */
  private readonly _beforeClosed = new Subject<R | undefined>();

  /** Result to be passed to afterClosed. */
  private _result: R | undefined;

  /** Handle to the timeout that's running as a fallback in case the exit animation doesn't fire. */
  private _closeFallbackTimeout!: number;

  /** Current state of the modal. */
  private _state = MatModalState.OPEN;

  /** Result Promise */
  _resultPromise!: {
    resolve: (value: R | undefined) => void;
    reject: (reason?: any) => void;
  };

  /** Result to be passed to afterClosed. */
  result!: Promise<R | undefined>;

  constructor(
    private _overlayRef: OverlayRef,
    public _containerInstance: _MatModalContainerBase,
    @Inject(DOCUMENT) private _document: any,
    /** Id of the modal. */
    readonly id: string = `mat-modal-${uniqueId++}`
  ) {
    // Pass the id along to the container.
    _containerInstance._id = id;

    // Emit when opening animation completes
    _containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'opened'),
        take(1)
      )
      .subscribe(() => {
        this._afterOpened.next();
        this._afterOpened.complete();
      });

    // Dispose overlay when closing animation is complete
    _containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'closed'),
        take(1)
      )
      .subscribe(() => {
        clearTimeout(this._closeFallbackTimeout);
        this._finishModalClose();
      });

    _overlayRef.detachments().subscribe(() => {
      this._beforeClosed.next(this._result);
      this._beforeClosed.complete();
      this._afterClosed.next(this._result);
      this._afterClosed.complete();
      this.componentInstance = null!;
      this._overlayRef.dispose();
    });

    _overlayRef
      .keydownEvents()
      .pipe(
        filter((event) => {
          return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
        })
      )
      .subscribe((event) => {
        event.preventDefault();
        _closeModalVia(this, 'keyboard');
      });

    _overlayRef.backdropClick().subscribe(() => {
      if (this.disableClose) {
        this._containerInstance._recaptureFocus();
      } else {
        _dismissModalVia(this, 'mouse', 'backdrop click modal');
      }
    });

    this.result = new Promise((resolve, reject) => {
      this._resultPromise = { resolve, reject };
    });
  }

  /**
   * Close the modal.
   * @param modalResult Optional result to return to the modal opener.
   */
  close(modalResult?: R): void {
    this._result = modalResult;

    // Transition the backdrop in parallel to the modal.
    this._containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'closing'),
        take(1)
      )
      .subscribe((event) => {
        this._beforeClosed.next(modalResult);
        this._beforeClosed.complete();
        this._overlayRef.detachBackdrop();
        this._resultPromise.resolve(modalResult);

        // TODO: 升级到新的dialog组件代码 再尝试修复。
        // TODO: 等待弹窗关闭操作完成，关闭途中再次打开锁定滚动条会失效（实例：会员列表邀请SVIP的提示窗）
        // setTimeout(() => {
        //   this._beforeClosed.next(modalResult);
        //   this._beforeClosed.complete();
        //   this._resultPromise.resolve(modalResult);
        // }, event.totalTime + 100);

        // The logic that disposes of the overlay depends on the exit animation completing, however
        // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
        // timeout which will clean everything up if the animation hasn't fired within the specified
        // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
        // vast majority of cases the timeout will have been cleared before it has the chance to fire.
        this._closeFallbackTimeout = window.setTimeout(() => this._finishModalClose(), event.totalTime + 100);
      });

    this._state = MatModalState.CLOSING;
    this._containerInstance._startExitAnimation();
  }

  /**
   * Dismiss the modal.
   * @param reason Optional reject result to return to the modal opener.
   */
  dismiss(reason?: any): void {
    this._result = undefined;

    // Transition the backdrop in parallel to the modal.
    this._containerInstance._animationStateChanged
      .pipe(
        filter((event) => event.state === 'closing'),
        take(1)
      )
      .subscribe((event) => {
        this._beforeClosed.complete();
        this._overlayRef.detachBackdrop();

        const dismissError = new Error(reason);
        dismissError.name = '弹窗中断';
        this._resultPromise.reject(dismissError);

        // The logic that disposes of the overlay depends on the exit animation completing, however
        // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
        // timeout which will clean everything up if the animation hasn't fired within the specified
        // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
        // vast majority of cases the timeout will have been cleared before it has the chance to fire.
        this._closeFallbackTimeout = window.setTimeout(() => this._finishModalClose(), event.totalTime + 100);
      });

    this._state = MatModalState.CLOSING;
    this._containerInstance._startExitAnimation();
  }

  /**
   * Gets an observable that is notified when the modal is finished opening.
   */
  afterOpened(): Observable<void> {
    return this._afterOpened;
  }

  /**
   * Gets an observable that is notified when the modal is finished closing.
   */
  afterClosed(): Observable<R | undefined> {
    return this._afterClosed;
  }

  /**
   * Gets an observable that is notified when the modal has started closing.
   */
  beforeClosed(): Observable<R | undefined> {
    return this._beforeClosed;
  }

  /**
   * Gets an observable that emits when the overlay's backdrop has been clicked.
   */
  backdropClick(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick();
  }

  /**
   * Gets an observable that emits when keydown events are targeted on the overlay.
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  /**
   * Updates the modal's position.
   * @param position New modal position.
   */
  updatePosition(position?: ModalPosition): this {
    const strategy = this._getPositionStrategy();

    if (position && (position.left || position.right)) {
      position.left ? strategy.left(position.left) : strategy.right(position.right);
    } else {
      strategy.centerHorizontally();
    }

    if (position && (position.top || position.bottom)) {
      position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
    } else {
      strategy.centerVertically();
    }

    this._overlayRef.updatePosition();

    return this;
  }

  /**
   * Updates the modal's width and height.
   * @param width New width of the modal.
   * @param height New height of the modal.
   */
  updateSize(width = '', height = ''): this {
    this._overlayRef.updateSize({ width, height });
    this._overlayRef.updatePosition();
    return this;
  }

  /** Add a CSS class or an array of classes to the overlay pane. */
  addPanelClass(classes: string | string[]): this {
    this._overlayRef.addPanelClass(classes);
    return this;
  }

  /** Remove a CSS class or an array of classes from the overlay pane. */
  removePanelClass(classes: string | string[]): this {
    this._overlayRef.removePanelClass(classes);
    return this;
  }

  /** Gets the current state of the modal's lifecycle. */
  getState(): MatModalState {
    return this._state;
  }

  /**
   * Finishes the modal close by updating the state of the modal
   * and disposing the overlay.
   */
  private _finishModalClose() {
    this._state = MatModalState.CLOSED;
    this._overlayRef.dispose();
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
  }
}

/**
 * Closes the modal with the specified interaction type. This is currently not part of
 * `MatModalRef` as that would conflict with custom modal ref mocks provided in tests.
 * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
 */
// TODO: TODO: Move this back into `MatModalRef` when we provide an official mock modal ref.
export function _closeModalVia<R>(ref: MatModalRef<R>, interactionType: FocusOrigin, result?: R) {
  // Some mock modal ref instances in tests do not have the `_containerInstance` property.
  // For those, we keep the behavior as is and do not deal with the interaction type.
  if (ref._containerInstance !== undefined) {
    ref._containerInstance._closeInteractionType = interactionType;
  }
  return ref.close(result);
}

/**
 * Closes the modal with the specified interaction type. This is currently not part of
 * `MatModalRef` as that would conflict with custom modal ref mocks provided in tests.
 * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
 */
// TODO: TODO: Move this back into `MatModalRef` when we provide an official mock modal ref.
export function _dismissModalVia<R>(ref: MatModalRef<R>, interactionType: FocusOrigin, reject?: any) {
  // Some mock modal ref instances in tests do not have the `_containerInstance` property.
  // For those, we keep the behavior as is and do not deal with the interaction type.
  if (ref._containerInstance !== undefined) {
    ref._containerInstance._closeInteractionType = interactionType;
  }
  return ref.dismiss(reject);
}
