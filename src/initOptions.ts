import { testKit } from ".";
import { codeButtonState } from "../components/CodeButton";
import { messageState } from "../components/Message";
import { route } from "../route";

export async function initOptions() {
  if (route.searchHref().get("slow") == "1") {
    testKit.state.delay = 500;
    testKit.state.timeout = 2000;
    codeButtonState.waitTime = 0;
    messageState.anime = true;
    messageState.removeTime = 3000;
  } else {
    // 交互间隔时间
    testKit.state.delay = 0;
    // 等待超时时间，本地测试可以设置为500ms，默认为3000ms
    testKit.state.timeout = 500;
    // 把倒计时按钮改为0秒
    codeButtonState.waitTime = 0;
    // 取消消息动画
    messageState.anime = false;
    messageState.removeTime = 0;
    // 模拟一个网络请求的时间开销
  }
}
