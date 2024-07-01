import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subheader1Component } from './subheader1/subheader1.component';
import { Subheader2Component } from './subheader2/subheader2.component';
import { Subheader3Component } from './subheader3/subheader3.component';
import { Subheader4Component } from './subheader4/subheader4.component';
import { Subheader5Component } from './subheader5/subheader5.component';
import { Subheader6Component } from './subheader6/subheader6.component';
import { Subheader7Component } from './subheader7/subheader7.component';
import { SubheaderWrapperComponent } from './subheader-wrapper/subheader-wrapper.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { MatSelectModule } from '@angular/material/select';
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
    FormsModule,
    MatInputModule,
    OwlDateTimeModule,
    LangModule,
    Subheader1Component,
    Subheader2Component,
    Subheader3Component,
    Subheader4Component,
    Subheader5Component,
    Subheader6Component,
    Subheader7Component,
    SubheaderWrapperComponent,
    SubHeaderDirective,
    SubHeaderContainerDirective,
],
    exports: [SubheaderWrapperComponent, SubHeaderDirective, SubHeaderContainerDirective],
})
export class SubheaderModule {}
