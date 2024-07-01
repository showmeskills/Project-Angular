/**
 * dialog.module
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import {
  OWL_DIALOG_SCROLL_STRATEGY_PROVIDER,
  OwlDialogService,
} from 'src/app/components/datetime-picker/lib/dialog/dialog.service';
import { OwlDialogContainerComponent } from 'src/app/components/datetime-picker/lib/dialog/dialog-container.component';

@NgModule({
    imports: [CommonModule, A11yModule, OverlayModule, PortalModule, OwlDialogContainerComponent],
    exports: [],
    providers: [OWL_DIALOG_SCROLL_STRATEGY_PROVIDER, OwlDialogService],
})
export class OwlDialogModule {}
