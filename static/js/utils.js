
function makeEl(s, text, attr) {
    var a = s.split('.');
    var tag = a.shift();
    var el = document.createElement(tag);
    el.className = a.join(' ');
    if (text) el.textContent = text;
    if (attr) {
        for (var k in attr) {
            el.setAttribute(k, attr[k]);
        }
    }
    return el;
}
