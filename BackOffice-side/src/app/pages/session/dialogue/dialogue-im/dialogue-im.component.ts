import {
  afterRender,
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SvgIconComponent } from 'angular-svg-icon';
import { DialogueImMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.component';
import { DialogueImTipsComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-tips/dialogue-im-tips.component';
import { DialogueImInfoComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-info/dialogue-im-info.component';
import { SessionService } from 'src/app/pages/session/session.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil, tap } from 'rxjs/operators';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { FormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { delay, filter, finalize, forkJoin, merge, Observable, of, race, switchMap, take } from 'rxjs';
import { DialogueImEmojiComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-emoji/dialogue-im-emoji.component';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { DialogueImEditorComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-editor/dialogue-im-editor.component';
import { SessionSendEvent, TopicCategory, TopicItem } from 'src/app/shared/interfaces/session';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { SessionApi } from 'src/app/shared/api/session.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';

@Component({
  selector: 'dialogue-im',
  standalone: true,
  imports: [
    CommonModule,
    LangPipe,
    SvgIconComponent,
    NgOptimizedImage,
    DialogueImMsgComponent,
    DialogueImTipsComponent,
    DialogueImInfoComponent,
    FormRowModule,
    FormsModule,
    DialogueImEmojiComponent,
    DialogueImEditorComponent,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    MatMenuModule,
    MatCardModule,
    MatTabsModule,
    TopicLabelComponent,
    LoadingDirective,
    EmptyComponent,
  ],
  templateUrl: './dialogue-im.component.html',
  styleUrls: ['./dialogue-im.component.scss'],
  providers: [DestroyService],
})
export class DialogueImComponent implements AfterViewInit, OnInit, OnDestroy {
  appService = inject(AppService);
  sessionService = inject(SessionService);
  destroy$ = inject(DestroyService);
  confirmModalService = inject(ConfirmModalService);
  subHeaderService = inject(SubHeaderService);
  api = inject(SessionApi);
  lang = inject(LangService);
  @ViewChild('sessionWrap') sessionWrap: ElementRef<HTMLDivElement>;
  @ViewChild('scrollTopRef') scrollTopRef: ElementRef<HTMLDivElement>;
  @ViewChild('scrollBottomRef') scrollBottomRef: ElementRef<HTMLDivElement>;

  /**
   * 隐藏输入框
   */
  @Input() hideInput = false;

  /**
   * 隐藏头部
   */
  @Input() hideHeader = false;

  /**
   * 是否显示暂无数据
   */
  @Input() showEmpty = false;

  #prevScrollBottom = 0;
  /**
   * 设置主题级联显示
   */
  selTopicShow = false;

  /**
   * 选择话题分类的id
   */
  selTopicCategory: TopicCategory | null = null;

  /**
   * 选择话题的id
   */
  selTopic: TopicItem | null = null;

  /**
   * 当前会话话题分类
   */
  get curTopicCategory() {
    return this.sessionService.curTopicCategory;
  }

  /**
   * 当前会话话题
   */
  get curTopic() {
    return this.sessionService.curTopic;
  }

  /**
   * 是否有设置话题
   */
  get hasTopic() {
    return this.curTopicCategory && this.curTopic;
  }

  /**
   * 当前话题类型名称
   */
  get curTopicCategoryName() {
    const field = (this.lang.isLocal ? 'nameCn' : 'nameEn') as 'nameCn' | 'nameEn';
    return this.hasTopic ? this.curTopicCategory![field] : '';
  }

  /**
   * 当前话题名称
   */
  get curTopicName() {
    const field = (this.lang.isLocal ? 'nameCn' : 'nameEn') as 'nameCn' | 'nameEn';
    return this.hasTopic ? this.curTopic![field] : '';
  }

  /**
   * 话题分类列表
   */
  topicCategory: TopicCategory[] = [];

  /**
   * 话题列表
   */
  topic: TopicItem[] = [];

  /**
   * 话题加载中
   */
  topicLoading = false;

  ngOnInit(): void {
    merge(this.sessionService.curSession$, this.sessionService.curSessionMsg$, this.sessionService.msgLoadChange$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.task.push(this.scrollBottom.bind(this));
      });

    forkJoin([this.api.getTopicCategory(this.subHeaderService.merchantCurrentId)]).subscribe(([topicCategory]) => {
      this.topicCategory = topicCategory.data;
    });
  }

  task: Array<Function> = [];

  constructor() {
    // 读写dom之后的操作，会频繁触发，dom初始化之后请换afterNextRender
    afterRender(() => this.task.shift()?.());
  }

  /**
   * 是否允许滚动到底部
   */
  allowScrollBottom = true;

  /**
   * 消息底部观察者
   * @private
   */
  #topObserver: IntersectionObserver | null;
  #bottomObserver: IntersectionObserver | null;
  ngAfterViewInit() {
    this.#bottomObserver = new IntersectionObserver(
      ([entry]) => {
        this.allowScrollBottom = !!entry.intersectionRatio;
      },
      {
        root: this.sessionWrap?.nativeElement,
        threshold: 0.01, // 0~1 之间的值（看做百分比），表示元素的可见度达到多少时触发回调
      }
    );
    this.#topObserver = new IntersectionObserver(
      ([entry]) => {
        !!entry.intersectionRatio && this.pullHistory();
      },
      {
        root: this.sessionWrap?.nativeElement,
        threshold: 0.99, // 0~1 之间的值（看做百分比），表示元素的可见度达到多少时触发回调
      }
    );
    this.scrollTopRef && this.#topObserver?.observe(this.scrollTopRef.nativeElement);
    this.scrollBottomRef && this.#bottomObserver?.observe(this.scrollBottomRef.nativeElement);
    this.scrollBottom(true);
  }

  /**
   * 滚动到底部
   * @param skip
   */
  scrollBottom(skip = false) {
    // TODO 待办：如果有图片需要监听图片异步加载完成之后再滚动到底部
    if (this.allowScrollBottom || skip) {
      this.sessionWrap && (this.sessionWrap!.nativeElement.scrollTop = -1 >>> 0);
    }
  }

  /**
   * 滚动到记录到的位置
   */
  scrollToPrevPosition() {
    const scrollHeight = this.sessionWrap?.nativeElement.scrollHeight;
    const needTop = scrollHeight - this.#prevScrollBottom;

    this.sessionWrap && (this.sessionWrap!.nativeElement.scrollTop = needTop);
  }

  ngOnDestroy() {
    this.#bottomObserver?.disconnect();
    this.#bottomObserver = null;
  }

  /**
   * 发送消息
   */
  sendMsg({ msg, data, done }: SessionSendEvent) {
    this.sessionService.sendMsg(msg, data);
    done();
  }

  /**
   * 下拉加载历史消息
   */
  historyLoading = false;
  loadHistoryPipe = () => {
    this.sessionService.getHistoryMsg(this.sessionService.curSession!.userId, {
      lastTime: this.sessionService.curSessionMsg[0]?.createTime,
      count: 20,
    });

    // 监听一次当前会话的历史消息加载
    return race(
      of(null).pipe(delay(3_000)), // 3s 没收到超时
      this.sessionService.curSessionHistoryLoadBefore$.pipe(take(1), takeUntil(this.destroy$))
    );
  };

  setLoadHistoryPipe<T>(v: () => Observable<T>) {
    this.loadHistoryPipe = v;
  }

  pullHistory() {
    of(null)
      .pipe(
        filter(() => !this.allowScrollBottom),
        filter(() => !this.historyLoading),
        filter(() => this.sessionService.curSessionMsg.length >= 20), // 超过20条消息才可能会有历史记录
        tap(() => (this.historyLoading = true)),
        switchMap(() => this.loadHistoryPipe()),
        finalize(() => {
          this.historyLoading = false;
        })
      )
      .subscribe(() => {
        // 记录当前滚动高度，如果是历史记录加载 余下高度：总高度 - 当前滚动       加载之后：新总高度 - 余下高度 = 需要定位的滚动高度
        const scrollTop = this.sessionWrap?.nativeElement.scrollTop;
        const scrollHeight = this.sessionWrap?.nativeElement.scrollHeight;
        this.#prevScrollBottom = scrollHeight - scrollTop;

        this.task.push(this.scrollToPrevPosition.bind(this));
      });
  }

  /**
   * 结束会话
   */
  async endSession() {
    if (!this.curTopic && !(await this.confirmModalService.open('session.chat.end').result)) return;
    this.sessionService.endCurrentSession(this.sessionService.curSession!.uid).subscribe();
  }

  /**
   * 话题选择
   * @param item
   */
  onTopic(item: TopicItem) {
    this.selTopicShow = false;

    // 如果已经是所设置的id则不再请求
    if (item.id === this.curTopic?.id) return;
    this.selTopic = item;

    this.topicLoading = true;
    this.api[this.sessionService.curSessionTopicId ? 'editSessionTopic' : 'setSessionTopic']({
      categoryId: item.categoryId,
      createTime: Date.now(),
      subjectId: item.id,
      uid: this.sessionService.curSession!.uid,
      topicId: this.sessionService.curSessionTopicId || undefined,
    })
      .pipe(finalize(() => (this.topicLoading = false)))
      .subscribe(() => {
        this.appService.toastOpera(true);
        // 这里靠推送来更新，服务内置有监听
      });
  }

  selTopicCategoryLoading = false;
  onTopicCategory(category: TopicCategory) {
    if (this.selTopicCategory?.id === category.id) return;

    this.selTopicCategory = category;
    this.getTopicList();
  }

  /**
   * 清除选择的话题
   */
  clearSelTopic() {
    this.selTopic = null;
    this.selTopicCategory = null;
  }

  /**
   * 删除话题
   */
  async onResetTopic() {
    if (!(await this.confirmModalService.open('form.isDelete').result)) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .resetSessionTopic(this.sessionService.curSessionTopicId, this.sessionService.curSession!.uid)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe(() => {
        this.sessionService.clearTopic(true);
        this.clearSelTopic();
        this.appService.toastOpera(true);
      });
  }

  /**
   * 打开话题级联选择 - 编辑模式
   */
  openTopicByEdit() {
    // 如果列表能匹配再设置激活回去
    this.topicCategory.find((e) => e.id === this.curTopicCategory?.id) &&
      (this.selTopicCategory = this.curTopicCategory);
    this.topic.find((e) => e.id === this.curTopic?.id) && (this.selTopic = this.curTopic);

    this.selTopicShow = true;
    this.getTopicList();
  }

  /**
   * 获取主题列表
   */
  getTopicList() {
    this.selTopicCategoryLoading = true;
    this.api
      .getTopic(this.selTopicCategory!.id)
      .pipe(finalize(() => (this.selTopicCategoryLoading = false)))
      .subscribe((res) => {
        this.topic = res.data;
      });
  }
}
