import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable, takeUntil } from 'rxjs';
import { SubheaderService } from '../_services/subheader.service';
import { KTUtil } from 'src/assets/js/components/util';
import KTLayoutSubheader from 'src/assets/js/layout/base/subheader';
import { Router, ResolveEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subheader1Component } from '../subheader1/subheader1.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { DynamicAsideMenuService } from 'src/app/_metronic/core';
import { DestroyService } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'app-subheader-wrapper',
  templateUrl: './subheader-wrapper.component.html',
  standalone: true,
  imports: [
    NgIf,
    Subheader1Component,
    AsyncPipe,
  ],
  providers: [DestroyService],
})
export class SubheaderWrapperComponent implements OnInit, AfterViewInit {
  subheaderVersion$: Observable<string>;

  constructor(private subheader: SubheaderService, private router: Router, private menuService: DynamicAsideMenuService, private destroy$: DestroyService) {
    this.subheader.setDefaultSubheader();
    this.subheaderVersion$ = this.subheader.subheaderVersionSubject.asObservable();

    // subscribe to router events
    this.router.events.pipe(
      takeUntil(this.destroy$),
      filter((event) => event instanceof ResolveEnd),
    ).subscribe(() => {
      this.initSubheader();
    });
  }

  ngOnInit(): void {}

  initSubheader = () => {
    setTimeout(() => {
      this.subheader.updateAfterRouteChanges(this.router.url);
    }, 0);
  };

  ngAfterViewInit() {
    KTUtil.ready(() => {
      KTLayoutSubheader.init('kt_subheader');

      this.menuService.menuConfig$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.initSubheader();
      });
    });
  }
}
