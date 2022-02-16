/* eslint-disable @typescript-eslint/no-explicit-any */

interface ExHTMLElementTagNameMap extends HTMLElementTagNameMap {
  [key: string]: HTMLElement;
}

export type Children = (string | number | boolean | Node)[];

type PartialOmitEx<T> = Partial<
  Omit<T, "children" | "append" | "style" | "oninput" | "onchange" | "onclick" | "onerror" | "onload" | "obj">
>;

export interface ExProps {
  listener: { event: string; handle: (e: any) => void }[];
  className: string;
  classRemove: string;
  onloadeddata: (event: any) => void;
  classAdd: string;
  children: any[];
  append: any[];
  styleText: string;
  "test-id": string;
  style: Partial<CSSStyleSheet>;
  oninput(this: any, event: any): any;
  onchange(this: any, event: any): any;
  onclick(this: any, event: any): any;
  onerror(this: any, event: any): any;
  onload(this: any, event: any): any;
}

export type PropsBy<T> = Partial<ExProps> | PartialOmitEx<T> | Record<string, any>;

export type Props = Partial<ExProps> &
  PartialOmitEx<HTMLInputElement> &
  PartialOmitEx<HTMLButtonElement> &
  PartialOmitEx<HTMLImageElement> &
  PartialOmitEx<HTMLVideoElement> &
  PartialOmitEx<HTMLDivElement> &
  Record<string, any>;

export type CreateEle = {
  [K in keyof ExHTMLElementTagNameMap]: (obj?: PropsBy<ExHTMLElementTagNameMap[K]>) => ExHTMLElementTagNameMap[K];
};

const propsSet = {
  listener: (ele: HTMLElement, events: { event: string; handle: (e: any) => void }[]) => {
    events.forEach((item) => {
      if (item) {
        ele.addEventListener(item.event, item.handle);
      }
    });
  },
  classRemove: (ele: HTMLElement, css: string) => {
    ele.classList.remove(...css.split(" ").filter(Boolean));
  },
  classAdd: (ele: HTMLElement, css: string) => {
    ele.classList.add(...css.split(" ").filter(Boolean));
  },
  append: (ele: HTMLElement, args: (string | number | Node)[]) => {
    ele.append(...(args.filter(Boolean) as any));
  },
  children: (ele: HTMLElement, args: (string | number | Node)[]) => {
    ele.innerHTML = "";
    ele.append(...(args.filter(Boolean) as any));
  },
  style: (ele: HTMLElement, obj: any) => {
    Object.keys(obj).forEach((k: string) => {
      (ele as any).style[k] = obj[k];
    });
  },
  styleText: (ele: HTMLElement, txt: string) => {
    ele.style.cssText = txt;
  },
  "test-id": (ele: HTMLElement, id: string) => {
    if (process.env.DEV) {
      ele.setAttribute("test-id", id);
    }
  },
} as any;

const regAttr = new RegExp("-");

function isAttr(key: any) {
  if (attributeKeys[key as string] || regAttr.test(key as string)) {
    return true;
  }
  return false;
}

const attributeKeys: { [key: string]: boolean } = {
  autofocus: true,
  role: true,
  viewBox: true,
};

export function modify<T>(ele: T, props: PropsBy<T>): T {
  // eslint-disable-next-line prefer-const
  let { className, ...rest } = props as any;

  // classModify 需要滞后操作
  if (className) {
    (ele as any).className = className;
  }

  Object.keys(rest).forEach(async (key) => {
    const val = (rest as any)[key];
    if (propsSet[key]) {
      propsSet[key](ele, val);
    } else if (isAttr(key)) {
      if (val && val.then) {
        Promise.resolve(val).then((v) => {
          if ((ele as any).getAttribute(key) !== v) {
            (ele as any).setAttribute(key, v);
          }
        });
      } else {
        if ((ele as any).getAttribute(key) !== val) {
          (ele as any).setAttribute(key, val);
        }
      }
    } else {
      if (val && val.then) {
        Promise.resolve(val).then((v) => {
          if ((ele as any)[key] != v) {
            (ele as any)[key] = v;
          }
        });
      } else {
        if ((ele as any)[key] != val) {
          if (val !== undefined && val !== null) {
            (ele as any)[key] = val;
          }
        }
      }
    }
  });

  return ele;
}
