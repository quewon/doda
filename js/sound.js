var sfx_files = {
  "window_open": "lowpip.mp3",
  "window_close": "lowerpip.mp3",
  // "pick_item": ["item_1.mp3", "item_2.mp3"],
};
var _queued_sound = [];

function load_sound(onload) {
  for (let sound in sfx_files) {
    let filepath = sfx_files[sound];
    
    if (Array.isArray(filepath)) {
      let new_array = [];
      for (let file of filepath) {
        new_array.push(new Howl({
          src: "sound/"+file
        }))
      }
      sfx_files[sound] = new_array;
    } else {
      sfx_files[sound] = new Howl({
        src: "sound/"+filepath
      })
    }
  }
  
  onload();
}

function sfx(name) {
  let s;
  if (Array.isArray(sfx_files[name])) {
    s = sfx_files[name][Math.random() * sfx_files[name].length | 0];
  } else {
    s = sfx_files[name];
  }

  s.stop();
  s.play();
}