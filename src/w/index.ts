/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./core";
export * from "./help";
export * from "./theme";
export { ThemeType };
import { CreateEle, modify } from "./core";
import { tags } from "./tags";
import type { ThemeType } from "./theme";

export const w = {} as CreateEle & { modify: typeof modify };

w.modify = modify;

tags.forEach((key) => {
  (w as any)[key] = (props: any) => {
    const ele = document.createElement(key);
    if (props) {
      modify(ele, props);
    }

    return ele;
  };
});

let navigatorUserAgent: string;
const regIos = new RegExp("(iphone|ipod|ipad)");
const regAndroid = new RegExp("(android)");
const regWechat = new RegExp("(micromessenger)");

function userAgent(): string {
  if (navigatorUserAgent) {
    return navigatorUserAgent;
  }
  navigatorUserAgent = navigator.userAgent.toLocaleLowerCase();
  return navigatorUserAgent;
}

export function isSmall(): boolean {
  return window.innerWidth < 641;
}

export function isPhone(): boolean {
  return isAndroid() || isIOS();
}

export function isIOS(): boolean {
  return regIos.test(userAgent());
}

export function isAndroid(): boolean {
  return regAndroid.test(userAgent());
}

export function isWechat(): boolean {
  return regWechat.test(userAgent());
}

// export const Root = w.div({ id: "root", className: "width:100% height:100%" });
// document.body.append(Root);
