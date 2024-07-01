/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { DrawerService, MAT_MODAL_SCROLL_STRATEGY_PROVIDER, MatModal } from './modal';
import { MatModalContainer } from './modal-container';
import { MatModalActions, MatModalClose, MatModalContent, MatModalTitle } from './modal-content-directives';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import {
  ConfirmCloseDirective,
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    MatCommonModule,
    AngularSvgIconModule.forRoot(),
    CommonModule,
    LangModule,
    MatModalContainer,
    MatModalClose,
    MatModalTitle,
    MatModalActions,
    MatModalContent,
    ModalTitleComponent,
    ModalFooterComponent,
    ConfirmCloseDirective,
    DismissCloseDirective,
  ],
  exports: [
    MatModalContainer,
    MatModalClose,
    MatModalTitle,
    MatModalContent,
    MatModalActions,
    MatCommonModule,
    ModalTitleComponent,
    ModalFooterComponent,
    ConfirmCloseDirective,
    DismissCloseDirective,
  ],
  providers: [MatModal, DrawerService, MAT_MODAL_SCROLL_STRATEGY_PROVIDER],
})
export class MatModalModule {}
