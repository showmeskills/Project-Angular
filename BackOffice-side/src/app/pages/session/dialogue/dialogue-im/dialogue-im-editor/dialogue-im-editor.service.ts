import { inject, Injectable } from '@angular/core';
import {
  IMFile,
  IMFileBase,
  IMFileFile,
  IMFileImg,
  IMFileVideo,
  IMUpload,
  SessionMsgBase,
  SessionMsgTypeEnum,
} from 'src/app/shared/interfaces/session';
import { filter, forkJoin, fromEvent, merge, Observable, of, switchMap, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionApi } from 'src/app/shared/api/session.api';
import { getVideoInfoFrame, VideoInfoFrame } from 'src/app/shared/models/tools.model';

// import pdfSvg from 'src/assets/images/svg/im/pdf.svg';

@Injectable()
export class DialogueImEditorService {
  api = inject(SessionApi);
  appService = this.api.appService;

  #imFileFlagClass = 'im-file-flag';

  /**
   * 上传图片接受类型
   */
  readonly uploadConfig = {
    [SessionMsgTypeEnum.Image]: [
      { type: '.jpg', size: 5 * 1024 * 1024 },
      { type: '.jpeg', size: 5 * 1024 * 1024 },
      { type: '.png', size: 5 * 1024 * 1024 },
      { type: '.bmp', size: 5 * 1024 * 1024 },
      { type: '.gif', size: 5 * 1024 * 1024 },
      { type: '.webp', size: 5 * 1024 * 1024 },
    ],
    [SessionMsgTypeEnum.Video]: [
      { type: '.mp4', size: 100 * 1024 * 1024 },
      { type: '.mov', size: 100 * 1024 * 1024, hideUpload: true },
    ],
    [SessionMsgTypeEnum.File]: [{ type: '.pdf', size: 1024 * 1024 * 5 }],
  };

  /**
   * 获取文件类型
   * @param ext {string} 文件后缀
   */
  getFileMsgType(ext: string): SessionMsgTypeEnum {
    const fileType = ext.toLowerCase();
    if (this.uploadConfig[SessionMsgTypeEnum.Image].find((e) => e.type.slice(1) === fileType))
      return SessionMsgTypeEnum.Image;
    if (this.uploadConfig[SessionMsgTypeEnum.Video].find((e) => e.type.slice(1) === fileType))
      return SessionMsgTypeEnum.Video;
    if (this.uploadConfig[SessionMsgTypeEnum.File].find((e) => e.type.slice(1) === fileType))
      return SessionMsgTypeEnum.File;

    return SessionMsgTypeEnum.Text;
  }

  /**
   * 当前文件列表
   */
  fileList: Array<IMFile> = [];

  /**
   * 最多输入框的文件数量
   */
  maxFileLength = 9;

  /**
   * 是否正在上传
   */
  isUploading = false;

  /**
   * 文件上传
   */
  uploadFile(configType: SessionMsgTypeEnum): Observable<DocumentFragment | null> | void {
    // 不能插入超过{{ n }}个文件
    if (this.fileList.length >= this.maxFileLength)
      return this.appService.showToastSubject.next({
        msgLang: 'form.uploadMax',
        msgArgs: { n: this.maxFileLength },
      });

    if (this.isUploading) return this.appService.showToastSubject.next({ msgLang: 'common.uploading' });

    // 上传类型配置未找到！
    const config = this.uploadConfig[configType];
    if (!config) return this.appService.showToastSubject.next({ msgLang: 'form.uploadTypeConfigFail' });

    const fileEl = window.document.createElement('input');
    fileEl.type = 'file';
    fileEl.accept = config
      .filter((e) => !e.hideUpload)
      .map((e) => e.type)
      .join(',');
    fileEl.click();

    const fileChange$ = fromEvent(fileEl, 'change');
    const fileCancel$ = fromEvent(fileEl, 'cancel');

    return merge(fileCancel$, fileChange$).pipe(
      take(1), // 只要有一个事件就结束
      map(() => Array.from(fileEl.files || [])),
      filter((e) => !!e.length),
      filter((e) => this.checkFileValid(configType, e)),
      switchMap((files) => this.uploadFileHandle$(configType, files))
    );
  }

  /**
   * 文件上传处理流
   */
  uploadFileHandle$(configType: SessionMsgTypeEnum, files: File[]): Observable<DocumentFragment | null> {
    // 不能插入超过{{ n }}个文件
    if (this.fileList.length + files.length > this.maxFileLength) {
      this.appService.showToastSubject.next({ msgLang: 'form.uploadMax', msgArgs: { n: this.maxFileLength } });
      return of(null);
    }

    return of(files).pipe(
      switchMap((files) => {
        // 视频额外上传封面
        if (configType === SessionMsgTypeEnum.Video) {
          return of(...files).pipe(
            switchMap(
              (file) =>
                getVideoInfoFrame(file, 0)
                  .then((info) => ({ file, info }))
                  .catch(() => this.appService.showToastSubject.next({ msgLang: 'form.videoLoadFailToChange' })) // 视频加载失败，请更换视频！
            ),
            filter((e): e is Exclude<typeof e, void> => !!e),
            switchMap(({ file, info }) =>
              this.uploadFile$([file, new File([info.frameBlob], 'cover.png')]).pipe(
                filter((e) => !!e.length),
                map((res) => ({ coverInfo: info, res }))
              )
            ),
            map(({ coverInfo, res: [video, cover] }): IMUpload[] => {
              video.data!.data = { coverInfo, cover };
              return [video];
            })
          );
        }

        return this.uploadFile$(files);
      }),
      filter((e) => !!e.length), // 过滤上传中的文件
      switchMap(async (imUploadList) => {
        const acc = document.createDocumentFragment() as DocumentFragment;

        for (let p of imUploadList) {
          // 实时增减，这里也判断一手
          if (this.fileList.length > this.maxFileLength) {
            this.appService.showToastSubject.next({
              msgLang: 'form.uploadMax',
              msgArgs: { n: this.maxFileLength },
            });
          } else {
            acc.appendChild(await this.uploadFileHandleCurry(configType, p));
          }
        }

        return acc;
      })
    );
  }

  /**
   * 上传文件类型处理 可被柯里化
   */
  async uploadFileHandleCurry(configType: SessionMsgTypeEnum, imUpload: IMUpload): Promise<Node> {
    const data: IMFileBase = {
      fId: imUpload.data?.fid || '-1',
      type: (imUpload.file?.name?.split('.').pop() || '').toLowerCase(),
      size: imUpload.file?.size || 0,
      name: imUpload.file?.name || '',
      url: '',
    };

    switch (configType) {
      case SessionMsgTypeEnum.Image:
        return this.imageHandle(imUpload, data);
      case SessionMsgTypeEnum.Video:
        return this.videoHandle(imUpload, data);
      case SessionMsgTypeEnum.File:
        return this.fileHandle(imUpload, data);
      default:
        return document.createDocumentFragment();
    }
  }

  /**
   * 处理图片节点
   */
  imageHandle(imUpload: IMUpload, baseInfo: IMFileBase): Node {
    const img = new Image();
    img.src = window.URL.createObjectURL(imUpload.file!);
    img.dataset['fid'] = imUpload.data?.fid || '';
    img.dataset['msgType'] = SessionMsgTypeEnum.Image.toString();
    img.dataset['fileType'] = baseInfo.type;
    img.classList.add(this.#imFileFlagClass, 'im-edit-panel-img');

    const data: IMFileImg = {
      ...baseInfo,
      width: 0,
      height: 0,
      isLoaded: false,
    };
    this.fileList.push(data);

    const img1 = new Image();
    img1.src = img.src;
    img1.onload = () => {
      const { width, height } = img1;
      const data = this.fileList.find((e) => e.fId === imUpload.data?.fid) as IMFileImg;
      if (!data) return;
      data.isLoaded = true;
      data.width = width;
      data.height = height;
      data.url = img.src;
    };
    img1.onerror = () => {
      const data = this.fileList.find((e) => e.fId === imUpload.data?.fid);
      if (!data) return;
      data.isLoaded = true;
    };

    return img;
  }

  /**
   * 处理图片节点
   */
  async videoHandle(imUpload: IMUpload, baseInfo: IMFileBase): Promise<Node> {
    const coverInfo: VideoInfoFrame = imUpload.data?.data?.coverInfo || ({} as any);
    const img = new Image();
    img.src = coverInfo.frameUrl;
    img.dataset['fid'] = imUpload.data?.fid || '';
    img.dataset['msgType'] = SessionMsgTypeEnum.Image.toString();
    img.dataset['fileType'] = baseInfo.type;
    img.classList.add(this.#imFileFlagClass, 'im-edit-panel-img');

    const data: IMFileVideo = {
      ...baseInfo,
      url: URL.createObjectURL(coverInfo.file),
      coverUrl: coverInfo.frameUrl,
      width: coverInfo.width,
      height: coverInfo.height,
      cover: imUpload.data?.data.cover?.data.fid || '',
      duration: coverInfo.duration,
      isLoaded: false,
    };
    this.fileList.push(data);

    return img;
  }

  /**
   * 处理文件节点
   */
  fileHandle(imUpload: IMUpload, baseInfo: IMFileBase): Node {
    const fragment = window.document.createDocumentFragment();
    const wrapper = window.document.createElement('div');
    wrapper.contentEditable = 'false';

    const wrap = window.document.createElement('div');
    wrap.style.cssText =
      'outline: 1; display: inline-block; padding: 5px 10px; border-radius: 4px; background-color: rgb(213 240 255);';
    wrap.dataset['fid'] = imUpload.data?.fid || '';
    wrap.dataset['msgType'] = SessionMsgTypeEnum.File.toString();
    wrap.dataset['fileType'] = baseInfo.type;
    wrap.className = this.#imFileFlagClass;
    wrapper.append(wrap);

    if (baseInfo.type === 'pdf') {
      const icon = new Image();
      icon.src = 'assets/images/svg/im/pdf.svg';
      icon.classList.add('vam', 'mr-2');
      icon.width = 20;
      icon.height = 20;
      wrap.append(icon);
    }

    const text = window.document.createElement('span');
    text.className = 'vam';
    text.innerText = baseInfo.name;
    wrap.append(text);

    const data: IMFileFile = {
      ...baseInfo,
    };
    this.fileList.push(data);

    // 前换行
    const prefix = window.document.createElement('div');
    prefix.append(document.createElement('br'));
    // 后换行
    const suffix = window.document.createElement('div');
    suffix.append(document.createElement('br'));

    fragment.append(prefix);
    fragment.append(wrapper);
    fragment.append(suffix);

    return fragment;
  }

  /**
   * 文件上传 流
   */
  uploadFile$(files: File[]): Observable<IMUpload[]> {
    return forkJoin(files.map((f) => this.api.IMUpload(f))).pipe(
      map((e) =>
        e.filter((e) => {
          if (!['PENDING', 'UPLOADING'].includes(e.upload.state)) {
            if (!e.success) return this.appService.showToastSubject.next({ msgLang: 'common.uploadFailed' });
          }

          return e.success;
        })
      )
    );
  }

  /**
   * 文件校验
   */
  checkFileValid(type: SessionMsgTypeEnum, files: File | File[]) {
    files = files instanceof File ? [files] : files;
    if (!files?.length) return false;
    const opts = this.uploadConfig[type];
    if (!opts) {
      throw Error('im upload checkFileValid 校验类型错误');
    }

    return files.some((file) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const opt = opts.find((x) => x.type.endsWith(ext));

      // 文件格式错误
      if (!opt) {
        return this.appService.showToastSubject.next({
          msgLang: 'form.fileTypeError',
          msgArgs: {
            t: opts
              .filter((e) => !e.hideUpload)
              .map((e) => e.type)
              .join(' ,'),
          },
        });
      }
      // 文件超过大小
      if (file.size > opt.size) {
        return this.appService.showToastSubject.next({
          msgLang: 'form.fileSizeLimit',
          msgArgs: { s: opt.size / 1024 / 1024 + 'MB' },
        });
      }

      return true;
    });
  }

  /**
   * 更新文件列表
   * @param editRootEl
   */
  updateFileList(editRootEl: HTMLElement) {
    const newList: Array<IMFile> = [];
    const fileElArr = Array.from(editRootEl.getElementsByClassName(this.#imFileFlagClass));

    fileElArr.forEach((el: any) => {
      const fId = el?.['dataset']['fid'];
      const curFile = this.fileList.find((e) => e.fId === fId);

      if (!fId || !curFile) {
        return console.error(el, ' 文件标记节点没有fId、或不存在文件列表中');
      }

      newList.push(curFile);
    });

    // 更新文件列表
    if (newList.length !== this.fileList.length) {
      this.fileList = newList;
    }
  }

  /**
   * 获取发送的内容
   */
  getSendContent(editRootEl: HTMLElement): Partial<SessionMsgBase> {
    const rootEl = editRootEl.cloneNode(true) as HTMLElement;

    // 删除文件标记节点，并替换为#{fId}#的文本内容前后再插入换行符
    const fileElArr = Array.from(rootEl.getElementsByClassName(this.#imFileFlagClass));
    fileElArr.forEach((el: any) => {
      const fId = el?.['dataset']['fid'];
      const curFile = this.fileList.find((e) => e.fId === fId);

      // 文件标记节点没有fIdd、或不存在文件列表中
      if (!fId || !curFile) {
        el.remove();
        return console.error(el, ' 文件标记节点没有fId、或不存在文件列表中');
      }

      // 替换为#{fId}的文本内容前后再插入换行符
      const textNode = window.document.createTextNode(`#{${fId}}#`);
      el.replaceWith(textNode);
    });

    let content = rootEl.innerText.trim();

    return {
      content,
      msgType: this.fileList?.length ? SessionMsgTypeEnum.Mix : SessionMsgTypeEnum.Text,
      asset: this.fileList,
    };
  }
}
