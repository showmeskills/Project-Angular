import { getScrollBarWidth } from 'src/app/shared/models/tools.model';

/**
 * 浏览器滚动条宽度css变量名
 */
export const scrollbarWithCSSName = '--scrollbar-width';

/**
 * 设置浏览器滚动条宽度到css表里
 */
function setScrollBarWidthToCss() {
  const scrollbarWidth = getScrollBarWidth();
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `:root { ${scrollbarWithCSSName}: ${scrollbarWidth}px; }`;
  document.head.appendChild(style);
}

setScrollBarWidthToCss();
