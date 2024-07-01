import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { moveItemInArray, CdkDropListGroup, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgTemplateOutlet, NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './information-manage.component.html',
  styleUrls: ['./information-manage.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, NgTemplateOutlet, NgFor, CdkDropListGroup, CdkDropList, CdkDrag, LangPipe],
})
export class InformationManageComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: NgbModal,
    private appService: AppService,
    public router: Router,
    private api: ArticleApi,
    private subHeaderService: SubHeaderService,
    public lang: LangService
  ) {}

  modal!: NgbModalRef;

  list: any[] = [];

  categoryList: any[] = [];

  _destroyed = new Subject<void>();

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getCategoryType().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.categoryList = Array.isArray(res) ? res : [];
      this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => this.loadData());
    });
  }

  loadData(): void {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.getCategoryList(this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res) {
        this.list = [];
        return;
      }

      this.list = this.categoryList.map((e) => this.process(res?.[e.key]));
    });
  }

  process(list) {
    if (Array.isArray(list)) {
      return list.map((e) => {
        if (!e.children) e.children = [];

        e.parentId = 0;
        e.isParent = true;
        e.children = e.children.map((j) => {
          j.parentId = e.id;
          return j;
        });

        return e;
      });
    }

    return [];
  }

  async onDel(tpl, item): Promise<void> {
    const res = await this.modalService.open(tpl, { centered: true }).result;
    if (!res?.value) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.delCategory(item.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true) {
        this.loadData();
        this.appService.showToastSubject.next({
          msg: '删除成功',
          successed: true,
        });
      } else {
        this.appService.showToastSubject.next({
          msg: '删除失败',
          successed: false,
        });
      }
    });
  }

  drop(event: any, i: number, list): void {
    const data = event.item.data;
    const isParent = !!event.item.data?.['children'];

    // 父级顺序调整
    if (isParent) {
      if (!data?.['children']) data['children'] = [];
      const prevIndex = list.findIndex((e) => e === event.item.data);
      moveItemInArray(list, prevIndex, i);
    } else if (event.previousContainer === event.container) {
      // 有父级一个条目 减1
      moveItemInArray(event.container.data, event.previousIndex - 1, event.currentIndex - 1);
    } else {
      // PM已沟通：不同父级不要拖拽  ----> 会导致index不准确
      return;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .categoryPositionChange({
        id: data.id,
        parentId: data.parentId,
        postions: data.isParent
          ? list.map((e) => e.id)
          : list.find((e) => e.id === data.parentId).children.map((e) => e.id),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res === true) return;
        this.appService.showToastSubject.next({
          msg: '排序失败',
          successed: false,
        });
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
