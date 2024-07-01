/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NzImageGroupComponent } from './image-group.component';
import { NzImagePreviewComponent } from './image-preview.component';
import { NzImageDirective } from './image.directive';
import { NzImageService } from './image.service';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  imports: [
    BidiModule,
    OverlayModule,
    PortalModule,
    DragDropModule,
    CommonModule,
    AngularSvgIconModule,
    NzImageDirective,
    NzImagePreviewComponent,
    NzImageGroupComponent,
  ],
  exports: [NzImageDirective, NzImagePreviewComponent, NzImageGroupComponent],
  providers: [NzImageService],
})
export class NzImageModule {}
