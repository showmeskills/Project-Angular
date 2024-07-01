import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbItemModel } from '../_models/breadcrumb-item.model';
import { LayoutService } from '../../../../core';
import { SubheaderService } from '../_services/subheader.service';
import { DropdownMenu4Component } from '../../../content/dropdown-menus/dropdown-menu4/dropdown-menu4.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-subheader3',
    templateUrl: './subheader3.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgIf,
        NgbDropdown,
        NgbDropdownToggle,
        AngularSvgIconModule,
        NgbDropdownMenu,
        DropdownMenu4Component,
        AsyncPipe,
    ],
})
export class Subheader3Component implements OnInit {
  subheaderCSSClasses = '';
  subheaderContainerCSSClasses = '';
  subheaderMobileToggle = false;
  subheaderDisplayDesc = false;
  subheaderDisplayDaterangepicker = false;
  title$: Observable<string>;
  breadcrumbs$: Observable<BreadcrumbItemModel[]>;
  description$: Observable<string>;

  constructor(private layout: LayoutService, private subheader: SubheaderService) {
    this.title$ = this.subheader.titleSubject.asObservable();
    this.breadcrumbs$ = this.subheader.breadCrumbsSubject.asObservable();
    this.description$ = this.subheader.descriptionSubject.asObservable();
  }

  ngOnInit() {
    this.subheaderCSSClasses = this.layout.getStringCSSClasses('subheader');
    this.subheaderContainerCSSClasses = this.layout.getStringCSSClasses('subheader_container');
    this.subheaderMobileToggle = this.layout.getProp('subheader.mobileToggle');
    this.subheaderDisplayDesc = this.layout.getProp('subheader.displayDesc');
    this.subheaderDisplayDaterangepicker = this.layout.getProp('subheader.displayDaterangepicker');
  }
}
