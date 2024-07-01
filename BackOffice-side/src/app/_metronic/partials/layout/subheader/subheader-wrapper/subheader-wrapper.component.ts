import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SubheaderService } from '../_services/subheader.service';
import { KTUtil } from 'src/assets/js/components/util';
import KTLayoutSubheader from 'src/assets/js/layout/base/subheader';
import { Router, ResolveEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subheader7Component } from '../subheader7/subheader7.component';
import { Subheader6Component } from '../subheader6/subheader6.component';
import { Subheader5Component } from '../subheader5/subheader5.component';
import { Subheader4Component } from '../subheader4/subheader4.component';
import { Subheader3Component } from '../subheader3/subheader3.component';
import { Subheader2Component } from '../subheader2/subheader2.component';
import { Subheader1Component } from '../subheader1/subheader1.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-subheader-wrapper',
    templateUrl: './subheader-wrapper.component.html',
    standalone: true,
    imports: [
        NgIf,
        Subheader1Component,
        Subheader2Component,
        Subheader3Component,
        Subheader4Component,
        Subheader5Component,
        Subheader6Component,
        Subheader7Component,
        AsyncPipe,
    ],
})
export class SubheaderWrapperComponent implements OnInit, AfterViewInit {
  subheaderVersion$: Observable<string>;
  constructor(private subheader: SubheaderService, private router: Router) {
    this.subheader.setDefaultSubheader();
    this.subheaderVersion$ = this.subheader.subheaderVersionSubject.asObservable();

    const initSubheader = () => {
      setTimeout(() => {
        this.subheader.updateAfterRouteChanges(this.router.url);
      }, 0);
    };

    initSubheader();
    // subscribe to router events
    this.router.events.pipe(filter((event) => event instanceof ResolveEnd)).subscribe(initSubheader);
  }

  ngOnInit(): void {}


  ngAfterViewInit() {
    KTUtil.ready(() => {
      setTimeout(() => {
        this.subheader.updateAfterRouteChanges(this.router.url);
      }, 0);
      KTLayoutSubheader.init('kt_subheader');
    });
  }
}
