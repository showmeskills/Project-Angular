/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive, Input, OnChanges, OnInit, Optional, SimpleChanges, ElementRef } from '@angular/core';
import { MatModal } from './modal';
import { _closeModalVia, MatModalRef } from './modal-ref';

/** Counter used to generate unique IDs for modal elements. */
let modalElementUid = 0;

/**
 * Button that will close the current modal.
 */
@Directive({
  selector: '[mat-modal-close], [matModalClose]',
  exportAs: 'matModalClose',
  host: {
    '(click)': '_onButtonClick($event)',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.type]': 'type',
  },
  standalone: true,
})
export class MatModalClose implements OnInit, OnChanges {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel!: string;

  /** Default to "button" to prevents accidental form submits. */
  @Input() type: 'submit' | 'button' | 'reset' = 'button';

  /** Modal close input. */
  @Input('mat-modal-close') modalResult: any;

  @Input('matModalClose') _matModalClose: any;

  constructor(
    /**
     * Reference to the containing modal.
     * @deprecated `modalRef` property to become private.
     * @breaking-change 13.0.0
     */
    // The modal title directive is always used in combination with a `MatModalRef`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() public modalRef: MatModalRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _modal: MatModal
  ) {}

  ngOnInit() {
    if (!this.modalRef) {
      // When this directive is included in a modal via TemplateRef (rather than being
      // in a Component), the ModalRef isn't available via injection because embedded
      // views cannot be given a custom injector. Instead, we look up the ModalRef by
      // ID. This must occur in `onInit`, as the ID binding for the modal container won't
      // be resolved at constructor time.
      this.modalRef = getClosestModal(this._elementRef, this._modal.openModals)!;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes['_matModalClose'] || changes['_matModalCloseResult'];

    if (proxiedChange) {
      this.modalResult = proxiedChange.currentValue;
    }
  }

  _onButtonClick(event: MouseEvent) {
    // Determinate the focus origin using the click event, because using the FocusMonitor will
    // result in incorrect origins. Most of the time, close buttons will be auto focused in the
    // modal, and therefore clicking the button won't result in a focus change. This means that
    // the FocusMonitor won't detect any origin change, and will always output `program`.
    _closeModalVia(this.modalRef, event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse', this.modalResult);
  }
}

/**
 * Title of a modal element. Stays fixed to the top of the modal when scrolling.
 */
@Directive({
  selector: '[mat-modal-title], [matModalTitle]',
  exportAs: 'matModalTitle',
  host: {
    class: 'mat-dialog-title',
    '[id]': 'id',
  },
  standalone: true,
})
export class MatModalTitle implements OnInit {
  /** Unique id for the modal title. If none is supplied, it will be auto-generated. */
  @Input() id = `mat-modal-title-${modalElementUid++}`;

  constructor(
    // The modal title directive is always used in combination with a `MatModalRef`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() private _modalRef: MatModalRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _modal: MatModal
  ) {}

  ngOnInit() {
    if (!this._modalRef) {
      this._modalRef = getClosestModal(this._elementRef, this._modal.openModals)!;
    }

    if (this._modalRef) {
      Promise.resolve().then(() => {
        const container = this._modalRef._containerInstance;

        if (container && !container._ariaLabelledBy) {
          container._ariaLabelledBy = this.id;
        }
      });
    }
  }
}

/**
 * Scrollable content container of a modal.
 */
@Directive({
  selector: `[mat-modal-content], mat-modal-content, [matModalContent]`,
  host: { class: 'mat-modal-content' },
  standalone: true,
})
export class MatModalContent {}

/**
 * Container for the bottom action buttons in a modal.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[mat-modal-actions], mat-modal-actions, [matModalActions]`,
  host: { class: 'mat-modal-actions' },
  standalone: true,
})
export class MatModalActions {}

/**
 * Finds the closest MatModalRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a modal.
 * @param openModals References to the currently-open modals.
 */
function getClosestModal(element: ElementRef<HTMLElement>, openModals: MatModalRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement;

  while (parent && !parent.classList.contains('mat-modal-container')) {
    parent = parent.parentElement;
  }

  return parent ? openModals.find((modal) => modal.id === parent!.id) : null;
}
