import { Svg } from "./Svg";
import { uiTheme } from "./uiTheme";
import { ThemeType, w } from "./w";

const themeIcons: Record<string, string> = {
  danger: "/icons/bootstrap/x-octagon-fill.svg",
  //"base":    "/icons/bootstrap/bookmark-fill.svg",
  //"success": "/icons/iconly/Bulk/Tick Square.svg",
  warn: "/icons/bootstrap/exclamation-triangle-fill.svg",
  //"primary": "/icons/bootstrap/bookmark-heart-fill.svg",
  //"info":    "/icons/bootstrap/bookmarks-fill.svg",
};

export const messageState = {
  timeout: 8000,
  removeTime: 300,
  anime: true,
};

let messageNum = -1;
const height = 70;

export function Message(
  theme: ThemeType,
  msg: string,
  timeout = messageState.timeout
) {
  messageNum += 1;
  const nowNum = messageNum;
  const close = () => {
    messageNum -= 1;
    if (messageNum === -2) {
      messageNum = -1;
    }
    w.modify(out, { style: { top: messageState.anime ? `-300px` : "" } });
    setTimeout(() => {
      out.remove();
    }, messageState.removeTime);

    // 整体消息上移
    document.body.querySelectorAll("[ui-message]").forEach((_e: unknown) => {
      const e = _e as HTMLElement;
      const num = Number(e.getAttribute("ui-message"));
      if (num > nowNum) {
        let top = Number(e.style.top.replace("px", ""));
        top = top - height < 0 ? 0 : top - height;
        e.style.top = top + "px";
      }
    });
  };

  const out = w.div({
    className: `ease-out fixed left-0 w-screen flex flex-col items-center justify-center`,
    style: {
      zIndex: "1000",
      top: messageState.anime ? "-300px" : `${nowNum * height}px`,
    },
    onclick: close,
    "ui-message": nowNum,
    children: [
      w.div({
        className: `cursor-pointer w-auto max-w-80 sm:max-w-96 flex flex-row items-center m-4 p-2 bg-${theme} text-front-${theme} border border-${theme} ${
          uiTheme.lovely ? "rounded-2xl" : "rounded"
        } shadow`,
        children: [
          themeIcons[theme] &&
            Svg({ src: themeIcons[theme], className: "w-4 h-4 mr-2" }),
          w.span({ className: "font-size:--font-comp", textContent: msg }),
        ],
      }),
    ],
  });

  setTimeout(() => {
    out.style.top = `${nowNum * height}px`;
  }, 32);

  setTimeout(() => {
    close();
  }, timeout);

  document.body.append(out);
}
