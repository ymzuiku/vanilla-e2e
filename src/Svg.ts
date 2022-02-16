import { fetchOnce } from "../fetchOnce";
import { Props, w } from "../w";

const checkIsScript = new RegExp("<script");
const ccheckIsSvg = new RegExp("<svg");

export interface SvgProps extends Props {
  src: string;
}

export function Svg({ src, ...rest }: SvgProps) {
  const div = w.div();
  w.modify(div, rest);
  if (src === "") {
    return div;
  }
  if (ccheckIsSvg.test(src)) {
    div.innerHTML = src;
    return div;
  }
  fetchOnce(src).then((v) => {
    if (checkIsScript.test(v)) {
      div.innerHTML = "[Not use script in svg]";
    } else {
      div.innerHTML = v;
    }
  });

  return div;
}
