var _timeouts = [];

function coolerTimeout(el, func, time) {
  _timeouts.push({
    func: func,
    time: time,
    el: el,
  });
  setTimeout(function() {
    for (let i=0; i<_timeouts.length; i++) {
      let t = _timeouts[i];
      if (t.time == time) {
        t.func(t.el);
        _timeouts.splice(i, 1);
        return;
      }
    }
  }, time);
}