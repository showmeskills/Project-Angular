import { inject, Injectable } from '@angular/core';
import { DialogueImMsgTextComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg-text/dialogue-im-msg-text.component';
import { DialogueImMsgLinkComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg-link/dialogue-im-msg-link.component';
import { ComponentType } from '@angular/cdk/portal';
import { cloneDeep } from 'lodash';
import { IMFile, SessionChatItem, SessionMsgTypeEnum } from 'src/app/shared/interfaces/session';
import { DialogueImMsgImgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg-img/dialogue-im-msg-img.component';
import { DialogueImEditorService } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-editor/dialogue-im-editor.service';
import { DialogueImMsgPdfComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg-pdf/dialogue-im-msg-pdf.component';
import { DialogueImMsgVideoComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg-video/dialogue-im-msg-video.component';

export declare interface IMMsgComponent {
  data: SessionChatItem;
}

type ComponentItemType = DialogueImMsgTextComponent | DialogueImMsgLinkComponent | DialogueImMsgImgComponent;

type ComponentItem = ComponentItemBase<ComponentItemType>;

interface ComponentItemBase<T extends { data: SessionChatItem } = ComponentItemType> {
  component: ComponentType<T>;
  inputs: {
    data: SessionChatItem;
  };
}

type ProcessFn = (str: SessionChatItem, matchArr?: RegExpMatchArray | null) => ComponentItem;

interface SplitPatterns {
  fn?: ProcessFn;
  pattern: string | RegExp;
}

@Injectable()
export class DialogueImMsgService {
  #IMEditorService = inject(DialogueImEditorService);
  #processMsg: SplitPatterns[] = [
    {
      // 匹配所有 默认显示文本
      pattern: '*',
      fn: (chatMsg) => {
        return { component: DialogueImMsgTextComponent, inputs: { data: chatMsg } };
      },
    },
    {
      // 匹配链接
      pattern: /((?:https|http|ftp|rtsp|mms):\/\/[^\s]+)/i,
      fn: (chatMsg) => {
        return { component: DialogueImMsgLinkComponent, inputs: { data: chatMsg } };
      },
    },
    {
      // 匹配文件资源
      pattern: /#\{(\d+)}#/,
      fn: (chatMsg, matchArr) => {
        let asset: IMFile | undefined = undefined;

        if (chatMsg.asset?.length && matchArr?.length) {
          asset = chatMsg.asset.find((e) => e.fId === matchArr[1]);

          if (asset) {
            const msgType = this.#IMEditorService.getFileMsgType(asset.type);

            switch (msgType) {
              case SessionMsgTypeEnum.Image:
                return { component: DialogueImMsgImgComponent, inputs: { data: chatMsg, asset } };
              case SessionMsgTypeEnum.Video:
                return { component: DialogueImMsgVideoComponent, inputs: { data: chatMsg, asset } };
              case SessionMsgTypeEnum.File:
                if (asset.type === 'pdf') {
                  if (asset.url) {
                    asset.isLoaded = true;
                  }

                  return { component: DialogueImMsgPdfComponent, inputs: { data: chatMsg, asset } };
                }
                break;
              default:
                break;
            }
          }
        }

        return { component: DialogueImMsgTextComponent, inputs: { data: chatMsg } };
      },
    },
  ];

  /**
   * 拆分字符串并组合成动态组件数据
   * @param blessingsString
   * @param splitPatterns
   */
  replaceMapComponentData(blessingsString: SessionChatItem, splitPatterns: SplitPatterns[]): ComponentItem[] {
    const exDefaultFn = splitPatterns.find((e) => e.pattern === '*')?.fn;
    let defaultProcessFn: ProcessFn =
      exDefaultFn ||
      ((str) => ({
        component: DialogueImMsgTextComponent,
        inputs: { data: str },
      }));

    // 递归匹配字符串返回动态组件数据处理
    const loop = (str: ComponentItem, patternsItem: SplitPatterns) => {
      let res: ComponentItem[] = [];
      const matchRes: RegExpMatchArray | null = str.inputs.data.content.match(patternsItem.pattern);

      // 如果没有匹配到，直接返回 当前处理这段
      if (!matchRes || matchRes.index === undefined) return [str];

      const originText = str.inputs.data.content;
      const prev = originText.slice(0, matchRes.index);
      const current = matchRes[0];
      const nextStartPos = matchRes.index + current.length; // 下一次匹配的起始位置
      const next = originText.slice(nextStartPos);

      // 边界判断 匹配结果不是从头开始的话，前面的字符串保留下来
      if (matchRes.index !== 0) {
        res.push({
          component: DialogueImMsgTextComponent,
          inputs: { data: { ...cloneDeep(str.inputs.data), content: prev } },
        });
      }

      // 匹配到的字符串处理
      if (patternsItem.fn) {
        res.push(patternsItem.fn({ ...cloneDeep(str.inputs.data), content: current }, matchRes));
      } else {
        res.push({
          component: DialogueImMsgTextComponent,
          inputs: { data: { ...cloneDeep(str.inputs.data), content: current } },
        });
      }

      // 边界判断 匹配结果不是到结尾的话，后面的字符串也要处理
      if (nextStartPos !== originText.length) {
        res = res.concat(
          ...loop(
            {
              component: DialogueImMsgTextComponent,
              inputs: { data: { ...cloneDeep(str.inputs.data), content: next } },
            },
            patternsItem
          )
        );
      }

      return res;
    };

    let result: ComponentItem[] = [defaultProcessFn(blessingsString)];
    splitPatterns
      .filter((e) => e.pattern !== '*')
      .map((p) => {
        // 如果是正则表达式，去掉全局匹配 g 标志 不然会匹配出来是纯数组结果
        if (p.pattern instanceof RegExp) {
          const reg = p.pattern;
          p.pattern = new RegExp(reg.source, reg.flags.replace('g', ''));
        }

        return p;
      })
      .forEach((pattern) => {
        result = result.reduce((total, item) => {
          return total.concat(...loop(item, pattern));
        }, [] as ComponentItem[]);
      });

    return result;
  }

  /**
   * 渲染消息
   * @param msgItem
   */
  renderMsg(msgItem: SessionChatItem): ComponentItem[] {
    return this.replaceMapComponentData(msgItem, this.#processMsg);
  }
}
