import { Injectable, NgZone } from '@angular/core';
import { UploadDialogComponent } from 'src/app/components/ueditor/tools/upload-dialog/upload-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
// export const MODAL_DATA = new InjectionToken<any>('modal_data');

@Injectable({
  providedIn: 'root',
})
export class EditorToolService {
  dialogRef!: MatDialogRef<UploadDialogComponent, any>;

  /** 自定义按钮配置参数 */
  opt = {
    uploadimg: {
      title: '上传图片',
      cssRules: 'background-position: -260px -128px;',
      modal: {
        component: UploadDialogComponent,
        data: {
          title: '上传图片',
          type: 'img',
          accept: ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'gif'],
          limit: 2048,
        },
      },
    },
    uploadvideo: {
      title: '上传视频',
      cssRules: 'background-position: -292px -127px;',
      modal: {
        component: UploadDialogComponent,
        data: {
          title: '上传视频',
          type: 'video',
          accept: ['mp4', 'ts', 'mov', 'mxf', 'mpg', 'flv', 'wmv', 'avi', 'm4v', 'f4v', 'mpeg', '3gp', 'asf', 'mkv'],
          limit: 100 * 1024,
        },
      },
    },
  };

  /** 是否全屏 */
  fullScreen = false;
  fullScreenChange = this.onFullScreenChanged.bind(this);
  fullScreen$ = new BehaviorSubject(false);

  constructor(private dialog: MatDialog, private zone: NgZone, public lang: LangService) {
    // this.ueditor.UE.subscribe(ue => {
    //   this.registryButton(ue);
    // });
  }

  /**
   * 初始化
   */
  init(UE: any, ueditor: any) {
    this.addCustomRule(UE, ueditor); // 添加自定义规则
  }

  /**
   * 注册按钮 (初始化会调用在 ueditor.component.ts)
   * @param UE
   * @param type
   */
  registryButton(UE: any, type: string) {
    const uiname = Object.keys(this.opt);
    // 判断当前语言
    if (!this.lang.isLocal) {
      this.opt.uploadimg.title = 'Upload image';
      this.opt.uploadimg.modal.data.title = 'Upload image';
      this.opt.uploadvideo.title = 'Upload Video';
      this.opt.uploadvideo.modal.data.title = 'Upload Video';
    }
    //
    UE.registerUI(uiname.join(' '), (editor, uiName) => {
      const option = this.opt[uiName];

      const btn = new UE.ui.Button({
        // 返回自定义的button
        name: uiName,
        title: option.title, // 原属性title
        cssRules: option.cssRules, // 添加额外样式 指定icon图标
        onclick: () => {
          const modalComponent = option.modal?.component;

          if (modalComponent) {
            this.zone.run(() => {
              // 检测变化中执行
              this.dialogRef = this.dialog.open(modalComponent, {
                data: { ...option.modal?.data, editor, uploadType: type },
                minWidth: 360,
                // injector: Injector.create([{
                //   provide: MODAL_DATA, useValue: {...option.modal?.data, editor, uploadType: type}
                // }], this.injector),
                // centered: true,
              });
            });
            return;
          }

          // 在这里扩展其他自定义按钮点击功能
        },
      });

      //当点到编辑内容上时，按钮要做的状态反射
      editor.addListener('selectionchange', function () {
        const state = editor.queryCommandState(uiName);

        if (state == -1) {
          btn.setDisabled(true);
          btn.setChecked(false);
        } else {
          btn.setDisabled(false);
          btn.setChecked(state);
        }
      });

      // 绑定全屏事件
      editor.removeListener('fullscreenchanged', this.fullScreenChange);
      editor.addListener('fullscreenchanged', this.fullScreenChange);

      return btn;
    });
  }

  /**
   * 编辑器全屏状态改变
   * @param eventName
   * @param isFull
   */
  onFullScreenChanged(eventName, isFull) {
    this.zone.run(() => {
      this.fullScreen = isFull;
      this.fullScreen$.next(isFull);
    });
  }

  /**
   * 添加自定义过滤规则
   * @param UE
   * @param ueditor
   */
  addCustomRule(UE: any, ueditor: any) {
    const filterFontFamily = (style: string) => {
      if (!style) return '';
      const filterCSS = ['font-family'];

      return (style.match(/[\w-]+[ ]*:(.*?)((?=; )|(?=$))/g) || [])
        .filter((e) => !filterCSS.includes(e.split(':')?.[0]?.trim()))
        .join(';');
    };

    const loop = (node) => {
      if (Array.isArray(node)) {
        node.forEach((e) => loop(e));
      } else if (node) {
        if (node?.attrs?.style) {
          node.attrs.style = filterFontFamily(node.attrs.style);
        }

        node?.children && loop(node.children);
      }
    };

    ueditor.addInputRule(loop);
  }
}
