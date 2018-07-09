/* exported makeEls */

var makeEls = function (s, text, attr) {
  const [tag, classes = []] = s.split('.');
  const el = document.createElement(tag);
  el.className = classes.join(' ');
  if (text) {
    el.textContent = text;
  }
  if (attr) {
    for (const k in attr) {
      el.setAttribute(k, attr[k]);
    }
  }
  return el;
}
