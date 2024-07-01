import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { LayoutService } from '../../../../core';
import { SubheaderService } from '../_services/subheader.service';
import { BreadcrumbItemModel } from '../_models/breadcrumb-item.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { OWL_DATE_TIME_FORMATS } from 'src/app/components/datetime-picker';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { Breadcrumbs } from 'src/app/shared/interfaces/common.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { SubHeaderContainerDirective } from './sub-header.directive';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass, NgIf, NgFor, AsyncPipe } from '@angular/common';


const TIME_FORMATS = {
  fullPickerInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
  datePickerInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
  timePickerInput: {hour: 'numeric', minute: 'numeric'},
  monthYearLabel: {year: 'numeric', month: 'short'},
  dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
  monthYearA11yLabel: {year: 'numeric', month: 'long'},
};

@Component({
    selector: 'app-subheader1',
    templateUrl: './subheader1.component.html',
    styleUrls: ['./subheader1.component.scss'],
    providers: [
        { provide: OWL_DATE_TIME_FORMATS, useValue: TIME_FORMATS },
    ],
    standalone: true,
    imports: [
        NgClass,
        NgIf,
        NgFor,
        RouterLinkActive,
        RouterLink,
        SubHeaderContainerDirective,
        OwlDateTimeTriggerDirective,
        AngularSvgIconModule,
        OwlDateTimeInputDirective,
        FormsModule,
        OwlDateTimeComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        AsyncPipe,
        searchFilter,
        LangPipe,
    ],
})
export class Subheader1Component implements OnInit {
  subheaderCSSClasses = '';
  subheaderContainerCSSClasses = '';
  subheaderMobileToggle = false;
  subheaderDisplayDesc = false;
  subheaderDisplayDaterangepicker = false;
  title$: Observable<string>;
  // breadcrumbs$!: Observable<BreadcrumbItemModel[]>;
  // breadcrumbs: BreadcrumbItemModel[] = [];
  description$!: Observable<string>;
  searchGroup: any = {};
  @Input() title!: string;

  constructor(
    private layout: LayoutService,
    private subheader: SubheaderService,
    private cdr: ChangeDetectorRef,
    public subHeaderService: SubHeaderService,
    public breadcrumbsService: BreadcrumbsService,
    public lang: LangService
  ) {
    this.title$ = this.subheader.titleSubject.asObservable();
  }

  ngOnInit() {
    this.title$ = this.subheader.titleSubject.asObservable();
    // this.breadcrumbs$ = this.subheader.breadCrumbsSubject.asObservable();
    this.description$ = this.subheader.descriptionSubject.asObservable();
    this.subheaderCSSClasses = this.layout.getStringCSSClasses('subheader');
    this.subheaderContainerCSSClasses = this.layout.getStringCSSClasses('subheader_container');
    this.subheaderMobileToggle = this.layout.getProp('subheader.mobileToggle');
    this.subheaderDisplayDesc = this.layout.getProp('subheader.displayDesc');
    this.subheaderDisplayDaterangepicker = this.layout.getProp('subheader.displayDaterangepicker');
    // this.breadcrumbs$.subscribe((res) => {
    //   this.breadcrumbs = res;
    //   this.cdr.detectChanges();
    // });
  }

  /** 打开可搜索过滤的下拉 */
  openSearchSelect(isOpen: boolean, key: string, el: HTMLInputElement): void {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchGroup[key] = '';
    }
  }

  onBreadcrumbs(bc: Breadcrumbs) {
    bc.click && bc.click(bc);
  }
}
