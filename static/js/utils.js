
function makeEl(s, text, attr) {
  const [tag, classes = []] = s.split('.');
  var el = document.createElement(tag);
  el.className = classes.join(' ');
  if (text) {
    el.textContent = text;
  }
  if (attr) {
    for (var k in attr) {
      el.setAttribute(k, attr[k]);
    }
  }
  return el;
}
