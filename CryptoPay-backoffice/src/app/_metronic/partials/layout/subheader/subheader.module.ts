import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subheader1Component } from './subheader1/subheader1.component';
import { SubheaderWrapperComponent } from './subheader-wrapper/subheader-wrapper.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SubHeaderContainerDirective, SubHeaderDirective } from './subheader1/sub-header.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatInputModule } from '@angular/material/input';

import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
    imports: [
    CommonModule,
    RouterModule,
    AngularSvgIconModule.forRoot(),
    NgbDropdownModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatInputModule,
    OwlDateTimeModule,
    LangModule,
    Subheader1Component,
    SubheaderWrapperComponent,
    SubHeaderDirective,
    SubHeaderContainerDirective,
],
    exports: [SubheaderWrapperComponent, SubHeaderDirective, SubHeaderContainerDirective],
})
export class SubheaderModule {}
