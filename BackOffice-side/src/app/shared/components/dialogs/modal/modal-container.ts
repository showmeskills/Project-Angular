/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { AnimationEvent } from '@angular/animations';
import { FocusMonitor, FocusOrigin, FocusTrap, FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
  PortalModule,
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  NgZone,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { matModalAnimations } from './modal-animations';
import { MatModalConfig } from './modal-config';

/** Event that captures the state of modal container animations. */
interface ModalAnimationEvent {
  state: 'opened' | 'opening' | 'closing' | 'closed';
  totalTime: number;
}

/**
 * Throws an exception for the case when a ComponentPortal is
 * attached to a DomPortalOutlet without an origin.
 * @docs-private
 */
export function throwMatModalContentAlreadyAttachedError() {
  throw Error('Attempting to attach modal content after content is already attached');
}

/**
 * Base class for the `MatModalContainer`. The base class does not implement
 * animations as these are left to implementers of the modal container.
 */
@Directive()
export abstract class _MatModalContainerBase extends BasePortalOutlet {
  protected _document: Document;

  /** The portal outlet inside of this container into which the modal content will be loaded. */
  @ViewChild(CdkPortalOutlet, { static: true }) _portalOutlet!: CdkPortalOutlet;

  /** The class that traps and manages focus within the modal. */
  private _focusTrap!: FocusTrap;

  /** Emits when an animation state changes. */
  _animationStateChanged = new EventEmitter<ModalAnimationEvent>();

  /** Element that was focused before the modal was opened. Save this to restore upon close. */
  private _elementFocusedBeforeModalWasOpened: HTMLElement | null = null;

  /**
   * Type of interaction that led to the modal being closed. This is used to determine
   * whether the focus style will be applied when returning focus to its original location
   * after the modal is closed.
   */
  _closeInteractionType: FocusOrigin | null = null;

  /** ID of the element that should be considered as the modal's label. */
  _ariaLabelledBy: string | null;

  /** ID for the container DOM element. */
  _id!: string;

  constructor(
    protected _elementRef: ElementRef,
    protected _focusTrapFactory: FocusTrapFactory,
    protected _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(DOCUMENT) _document: any,
    /** The modal configuration. */
    public _config: MatModalConfig,
    private readonly _interactivityChecker: InteractivityChecker,
    private readonly _ngZone: NgZone,
    private _focusMonitor?: FocusMonitor
  ) {
    super();
    this._ariaLabelledBy = _config.ariaLabelledBy || null;
    this._document = _document;
  }

  /** Starts the modal exit animation. */
  abstract _startExitAnimation(): void;

  /** Initializes the modal container with the attached content. */
  _initializeWithAttachedContent() {
    this._setupFocusTrap();
    // Save the previously focused element. This element will be re-focused
    // when the modal closes.
    this._capturePreviouslyFocusedElement();
  }

  /**
   * Attach a ComponentPortal as content to this modal container.
   * @param portal Portal to be attached as the modal content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached() && (typeof window['ngDevMode'] === 'undefined' || window['ngDevMode'])) {
      throwMatModalContentAlreadyAttachedError();
    }

    return this._portalOutlet.attachComponentPortal(portal);
  }

  /**
   * Attach a TemplatePortal as content to this modal container.
   * @param portal Portal to be attached as the modal content.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalOutlet.hasAttached() && (typeof window['ngDevMode'] === 'undefined' || window['ngDevMode'])) {
      throwMatModalContentAlreadyAttachedError();
    }

    return this._portalOutlet.attachTemplatePortal(portal);
  }

  /**
   * Attaches a DOM portal to the modal container.
   * @param portal Portal to be attached.
   * @deprecated To be turned into a method.
   * @breaking-change 10.0.0
   */
  override attachDomPortal = (portal: DomPortal) => {
    if (this._portalOutlet.hasAttached() && (typeof window['ngDevMode'] === 'undefined' || window['ngDevMode'])) {
      throwMatModalContentAlreadyAttachedError();
    }

    return this._portalOutlet.attachDomPortal(portal);
  };

  /** Moves focus back into the modal if it was moved out. */
  _recaptureFocus() {
    if (!this._containsFocus()) {
      this._trapFocus();
    }
  }

  /**
   * Focuses the provided element. If the element is not focusable, it will add a tabIndex
   * attribute to forcefully focus it. The attribute is removed after focus is moved.
   * @param element The element to focus.
   */
  private _forceFocus(element: HTMLElement, options?: FocusOptions) {
    if (!this._interactivityChecker.isFocusable(element)) {
      element.tabIndex = -1;
      // The tabindex attribute should be removed to avoid navigating to that element again
      this._ngZone.runOutsideAngular(() => {
        element.addEventListener('blur', () => element.removeAttribute('tabindex'));
        element.addEventListener('mousedown', () => element.removeAttribute('tabindex'));
      });
    }
    element.focus(options);
  }

  /**
   * Focuses the first element that matches the given selector within the focus trap.
   * @param selector The CSS selector for the element to set focus to.
   */
  private _focusByCssSelector(selector: string, options?: FocusOptions) {
    const elementToFocus = this._elementRef.nativeElement.querySelector(selector) as HTMLElement | null;
    if (elementToFocus) {
      this._forceFocus(elementToFocus, options);
    }
  }

  /**
   * Moves the focus inside the focus trap. When autoFocus is not set to 'modal', if focus
   * cannot be moved then focus will go to the modal container.
   */
  protected _trapFocus() {
    const element = this._elementRef.nativeElement;
    // If were to attempt to focus immediately, then the content of the modal would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty when setting focus when autoFocus isn't set to
    // modal. If the element inside the modal can't be focused, then the container is focused
    // so the user can't tab into other elements behind it.
    switch (this._config.autoFocus) {
      case false:
      case 'modal':
        // Ensure that focus is on the modal container. It's possible that a different
        // component tried to move focus while the open animation was running. See:
        // https://github.com/angular/components/issues/16215. Note that we only want to do this
        // if the focus isn't inside the modal already, because it's possible that the consumer
        // turned off `autoFocus` in order to move focus themselves.
        if (!this._containsFocus()) {
          element.focus();
        }
        break;
      case true:
      case 'first-tabbable':
        this._focusTrap.focusInitialElementWhenReady().then((focusedSuccessfully) => {
          // If we weren't able to find a focusable element in the modal, then focus the modal
          // container instead.
          if (!focusedSuccessfully) {
            this._focusModalContainer();
          }
        });
        break;
      case 'first-heading':
        this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
        break;
      default:
        this._focusByCssSelector(this._config.autoFocus!);
        break;
    }
  }

  /** Restores focus to the element that was focused before the modal opened. */
  protected _restoreFocus() {
    const previousElement = this._elementFocusedBeforeModalWasOpened;

    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (this._config.restoreFocus && previousElement && typeof previousElement.focus === 'function') {
      const activeElement = _getFocusedElementPierceShadowDom();
      const element = this._elementRef.nativeElement;

      // Make sure that focus is still inside the modal or is on the body (usually because a
      // non-focusable element like the backdrop was clicked) before moving it. It's possible that
      // the consumer moved it themselves before the animation was done, in which case we shouldn't
      // do anything.
      if (
        !activeElement ||
        activeElement === this._document.body ||
        activeElement === element ||
        element.contains(activeElement)
      ) {
        if (this._focusMonitor) {
          this._focusMonitor.focusVia(previousElement, this._closeInteractionType);
          this._closeInteractionType = null;
        } else {
          previousElement.focus();
        }
      }
    }

    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  /** Sets up the focus trap. */
  private _setupFocusTrap() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
  }

  /** Captures the element that was focused before the modal was opened. */
  private _capturePreviouslyFocusedElement() {
    if (this._document) {
      this._elementFocusedBeforeModalWasOpened = _getFocusedElementPierceShadowDom();
    }
  }

  /** Focuses the modal container. */
  private _focusModalContainer() {
    // Note that there is no focus method when rendering on the server.
    if (this._elementRef.nativeElement.focus) {
      this._elementRef.nativeElement.focus();
    }
  }

  /** Returns whether focus is inside the modal. */
  private _containsFocus() {
    const element = this._elementRef.nativeElement;
    const activeElement = _getFocusedElementPierceShadowDom();
    return element === activeElement || element.contains(activeElement);
  }
}

/**
 * Internal component that wraps user-provided modal content.
 * Animation is based on https://material.io/guidelines/motion/choreography.html.
 * @docs-private
 */
@Component({
  selector: 'mat-modal-container',
  templateUrl: 'modal-container.html',
  styleUrls: ['modal.scss'],
  encapsulation: ViewEncapsulation.None,
  // Using OnPush for modals caused some G3 sync issues. Disabled until we can track them down.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [matModalAnimations.modalContainer],
  host: {
    class: 'mat-dialog-container mat-modal-container',
    tabindex: '-1',
    'aria-modal': 'true',
    '[id]': '_id',
    '[attr.role]': '_config.role',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledBy',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[@modalContainer]': '_state',
    '(@modalContainer.start)': '_onAnimationStart($event)',
    '(@modalContainer.done)': '_onAnimationDone($event)',
  },
  standalone: true,
  imports: [PortalModule],
})
export class MatModalContainer extends _MatModalContainerBase {
  /** State of the modal animation. */
  _state: 'void' | 'enter' | 'exit' = 'enter';

  /** Callback, invoked whenever an animation on the host completes. */
  _onAnimationDone({ toState, totalTime }: AnimationEvent) {
    if (toState === 'enter') {
      this._trapFocus();
      this._animationStateChanged.next({ state: 'opened', totalTime });
    } else if (toState === 'exit') {
      this._restoreFocus();
      this._animationStateChanged.next({ state: 'closed', totalTime });
    }
  }

  /** Callback, invoked when an animation on the host starts. */
  _onAnimationStart({ toState, totalTime }: AnimationEvent) {
    if (toState === 'enter') {
      this._animationStateChanged.next({ state: 'opening', totalTime });
    } else if (toState === 'exit' || toState === 'void') {
      this._animationStateChanged.next({ state: 'closing', totalTime });
    }
  }

  /** Starts the modal exit animation. */
  _startExitAnimation(): void {
    this._state = 'exit';

    // Mark the container for check so it can react if the
    // view container is using OnPush change detection.
    this._changeDetectorRef.markForCheck();
  }
}
