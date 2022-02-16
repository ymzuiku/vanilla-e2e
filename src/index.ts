import { Message, messageState } from "./Message";
import { isPhone, w } from "./w";

const state = {
  delay: 100,
  timeout: 3000,
  lastFocus: w.input(),
  errorTipTime: 99999999,
};

const testLabel = w.div({
  className:
    "fixed bottom-2 -right-7 bg-danger bg-opacity-50 py-0 px-8 shadow-sm opacity-50 pointer-events-none text-sm -rotate-45 origin-center",
  textContent: "Test",
  styleText: "z-index:9999",
});
document.body.append(testLabel);

const mouse = w.div({
  className:
    "fixed top-1/2 -right-24 transition-all ease-out duration-300 bg-front-primary/[0.5] w-4 h-4 rounded-md border border-solid border-primary border-opacity-50 shadow-md",
  styleText: "z-index:9999",
});

document.body.append(mouse);

const showErrorMessage = (err: string) => {
  console.warn("[test-kit]", err);
  Message("warn", err, state.errorTipTime);
  // throw new Error(err);
};

let rotate = 0;

const rotateMouse = () => {
  rotate += 1;
  if (rotate > 99) {
    rotate = 0;
  }
  mouse.style.transform = `rotate(${rotate * 180}deg)`;
};

async function moveToEle(ele: HTMLInputElement) {
  messageState.removeTime = state.delay / 3;
  const rect = ele.getBoundingClientRect();
  mouse.style.left = rect.x - 10 + rect.width / 2 + "px";
  mouse.style.top = rect.y - 10 + rect.height / 2 + "px";

  if (state.delay > 0) {
    await wait(state.delay);
  }
  if (state.lastFocus) {
    try {
      state.lastFocus.blur();
    } catch (e) {
      //
    }
  }
  try {
    ele.focus();
    state.lastFocus = ele;
  } catch (e) {
    //
  }

  mouse.style.transform = `scale(0.7)`;
  setTimeout(() => {
    mouse.style.transform = "scale(1)";
  }, state.delay / 1.5 + 20);
}

function waitGet<T>(
  fn: () => T,
  timeout = state.timeout
): Promise<T | undefined> {
  return new Promise((res) => {
    const t = Date.now();
    const getFn = () => {
      rotateMouse();
      const ele = fn();
      if (ele) {
        res(ele);
        return;
      }
      if (Date.now() - t < timeout) {
        setTimeout(() => {
          getFn();
        }, 16);
        return;
      }
      res(undefined);
    };
    getFn();
  });
}

function wait(timeout = 100): Promise<undefined> {
  return new Promise((res) => setTimeout(() => res(undefined), timeout));
}

// 使用 XPath 查找文本相等
async function getEleByText(text: string): Promise<HTMLInputElement> {
  const ele = await waitGet(() => xPath(text));
  if (!ele) {
    const err = `can't not find "${text}"`;
    showErrorMessage(err);
    await wait(state.errorTipTime);
  }

  return ele as HTMLInputElement;
}

export function isInViewPortOfTwo(el: Element) {
  const viewPortHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  const top = el.getBoundingClientRect() && el.getBoundingClientRect().top;
  return top <= viewPortHeight + 50;
}

function xPath(text: string): HTMLElement {
  const headings = document.evaluate(
    `//div[contains(., '${text}')]`,
    document.body,
    null,
    XPathResult.ANY_TYPE,
    null
  );
  return headings.iterateNext() as HTMLElement;
}

async function getEle(
  testID: string,
  tag = "*",
  attr = "test-id"
): Promise<HTMLInputElement> {
  const eles = await waitGet(() => {
    const eles = document.body.querySelectorAll(`${tag}[test-id="${testID}"]`)!;

    const list: HTMLInputElement[] = [];
    // 当找到多个元素时，排除 ele 不显示的
    eles.forEach((e) => {
      if ((e as HTMLElement).offsetParent) {
        list.push(e as HTMLInputElement);
      }
    });
    if (list.length > 0) {
      return list;
    }
    return void 0;
  });
  if (!eles) {
    const err = `can't not find "${testID}"`;
    showErrorMessage(err);
    await wait(state.errorTipTime);
  }

  if (eles!.length > 1) {
    const err = `find many "${testID}"`;
    showErrorMessage(err);
    await wait(state.errorTipTime);
  }
  const ele = eles![0];
  ele.scrollTo({ top: 100 });

  return ele;
}

async function click(
  testID: string | HTMLElement,
  attr = "test-id"
): Promise<HTMLInputElement> {
  const ele = (
    typeof testID === "string" ? await getEle(testID, "*", attr) : testID
  ) as HTMLInputElement;
  await moveToEle(ele);

  if (isPhone()) {
    const event = new TouchEvent("touchstart", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    ele.dispatchEvent(event);
  } else {
    const event = new MouseEvent("mousedown", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    ele.dispatchEvent(event);
  }

  ele.click();

  if (isPhone()) {
    const event = new TouchEvent("touchend", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    ele.dispatchEvent(event);
  } else {
    const event = new MouseEvent("mouseup", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    ele.dispatchEvent(event);
  }

  return ele;
}

async function clickText(text: string): Promise<HTMLInputElement> {
  const ele = await getEleByText(text);
  await click(ele);
  return ele;
}

async function clickAndWaitPage(
  testID: string | HTMLElement,
  attr = "test-id"
): Promise<HTMLInputElement> {
  const nowHref = location.href;
  const ele = await click(testID, attr);
  await waitGet(() => location.href !== nowHref, 100);
  return ele;
}

async function input(
  testID: string | HTMLElement,
  value: string | boolean,
  attr = "test-id"
): Promise<HTMLInputElement> {
  const ele = (
    typeof testID === "string" ? await getEle(testID, "input", attr) : testID
  ) as HTMLInputElement;
  await moveToEle(ele);
  const inputEvent = new InputEvent("input", {
    data: value as string,
    view: window,
    bubbles: true,
    cancelable: true,
  });
  ele.value = value as string;
  ele.dispatchEvent(inputEvent);
  return ele;
}

async function change(
  testID: string | HTMLElement,
  value: string | boolean,
  attr = "test-id"
): Promise<HTMLInputElement> {
  const ele = (
    typeof testID === "string" ? await getEle(testID, "input", attr) : testID
  ) as HTMLInputElement;
  await moveToEle(ele);
  ele.value = value as string;
  ele.dispatchEvent(
    new InputEvent("input", {
      data: value as string,
      view: window,
      bubbles: true,
      cancelable: true,
    })
  );
  ele.dispatchEvent(
    new InputEvent("change", {
      data: value as string,
      view: window,
      bubbles: true,
      cancelable: true,
    })
  );
  return ele;
}

async function waitRemove(
  testID: string | HTMLElement,
  tag = "*",
  attr = "test-id",
  timeout = 3000
): Promise<void> {
  const removed = await waitGet(() => {
    const t =
      typeof testID == "string"
        ? document.body.querySelector(`${tag}[${attr}="${testID as string}"]`)
        : document.body.contains(testID);
    return !t;
  }, timeout);
  if (!removed) {
    const err = `can't not wait remove "${testID}"`;
    showErrorMessage(err);
    await wait(state.errorTipTime);
  }
}

async function waitRemoveText(text: string, timeout = 3000): Promise<void> {
  const removed = await waitGet(() => {
    return !xPath(text);
  }, timeout);
  if (!removed) {
    const err = `can't not wait remove "${text}"`;
    showErrorMessage(err);
    await wait(state.errorTipTime);
  }
}

const assert = {
  eq: async <T>(a: T, b: T) => {
    if (a !== b) {
      const err = `a:${a} not equar b:${b}`;
      showErrorMessage(err);
      await wait(state.errorTipTime);
    }
  },
};

export const testKit = {
  state,
  getEle,
  getEleByText,
  waitGet,
  waitRemove,
  waitRemoveText,
  wait,
  click,
  clickText,
  input,
  change,
  assert,
  clickAndWaitPage,
};
