import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbItemModel } from '../_models/breadcrumb-item.model';
import { SubheaderService } from '../_services/subheader.service';
import { LayoutService } from '../../../../core';
import { DropdownMenu3Component } from '../../../content/dropdown-menus/dropdown-menu3/dropdown-menu3.component';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-subheader5',
    templateUrl: './subheader5.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgIf,
        FormsModule,
        AngularSvgIconModule,
        NgbDropdown,
        NgbDropdownToggle,
        NgbDropdownMenu,
        DropdownMenu3Component,
        AsyncPipe,
    ],
})
export class Subheader5Component implements OnInit {
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
