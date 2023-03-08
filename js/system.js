var _files = [];
var _mouse = { x:50, y:50, prevx:50, prevy:50 };
var _window_selected;
var _dragging;

function selectWindow(w) {
  if (_window_selected) {
    _window_selected.classList.remove("selected");
  }

  _window_selected = w;
  w.classList.add("selected");
  w.parentNode.appendChild(w);
}

class file {
  constructor(p) {
    this.id = _files.length;
    this.name = p.name || "unnamed file";
    this.files = [];
    this.accessLevel = p.level || 0;
    this.type = p.type || "folder";

    this.setFolder(p.folder);

    _files.push(this);

    this.contextMenu = [
      {
        name: "open in new window",
        function: function(e) {
          _files[this.parentNode.parentNode.dataset.id].open(null);
        },
      },
      {
        name: "get info",
        function: function(e) {
          _files[this.parentNode.parentNode.dataset.id].openInfo();
        },
      }
    ];

    // for curations
    this.transform = {
      x: 0,
      y: 0,
      width: null,
      height: null
    };
  }

  getPathnameSpan() {
    let s = document.createElement("span");
    s.className = "pathname";
    s.textContent = this.name;

    let parent = this.folder;
    while (parent != null) {
      let p = document.createElement("a");
      p.dataset.id = parent.id;
      p.onclick = function(e) {
        _files[this.dataset.id].open(null);
        e.stopPropagation();
      };
      p.textContent = parent.name;

      let filler = document.createElement("span");
      filler.className = "filler";
      filler.textContent = " of ";

      s.appendChild(filler);
      s.appendChild(p);

      parent = parent.folder;
    }

    return s;
  }

  createFile(noContext) {
    let file = document.createElement("div");
    file.className = "file";

    let label = document.createElement("a");
    label.className = "filename";
    label.textContent = this.name;
    label.dataset.id = this.id;
    label.addEventListener("click", function(e) {
      let w = this.parentNode.parentNode.parentNode;
      _files[this.dataset.id].run(w);
      e.stopPropagation();
    });

    file.appendChild(label);

    file.addEventListener("mousedown", function(e) { e.stopPropagation(); });

    if (!noContext) {
      let menu = document.createElement("a");
      menu.dataset.id = this.id;
      menu.className = "menubutton";
      menu.textContent = "°";
      menu.onclick = function(e) {
        let file = _files[this.dataset.id];
        let contextmenu = file.createContextMenu();

        let rect = this.getBoundingClientRect();

        contextmenu.style.top = rect.top+"px";
        contextmenu.style.left = rect.left+"px";

        document.body.appendChild(contextmenu);

        e.stopPropagation();
      };
      file.appendChild(menu);
    }

    return file;
  }

  createCurationFileBase() {
    let div = document.createElement("div");
    div.className = "file curation";
    div.style.background = "gray";

    // let file = this.createFile(true);
    // file.classList.add("gone");
    // div.addEventListener("mouseenter", function(e) {
    //   this.getElementsByClassName("file")[0].classList.remove("gone");
    // });
    // div.addEventListener("mouseleave", function(e) {
    //   this.getElementsByClassName("file")[0].classList.add("gone");
    // });
    // div.appendChild(file);

    if (!this.transform.width || !this.transform.height) {
      div.style.width = "5rem";
      div.style.height = "5rem";
      document.body.appendChild(div);
      let rect = div.getBoundingClientRect();
      document.body.removeChild(div);
      this.transform.width = rect.width;
      this.transform.height = rect.height;
      this.transform.x = Math.random() * (300 - rect.width);
      this.transform.y = Math.random() * (300 - rect.height);
    } else {
      div.style.width = this.transform.width+"px";
      div.style.height = this.transform.height+"px";
    }

    div.style.left = this.transform.x+"px";
    div.style.top = this.transform.y+"px";

    div.dataset.id = this.id;
    div.addEventListener("mousedown", function(e) {
      _dragging = this;
      let file = _files[this.dataset.id];
      let transform = file.transform;
      _dragging.dataset.x1 = transform.x;
      _dragging.dataset.y1 = transform.y;

      this.parentNode.appendChild(this);
      file.setFolder(file.folder);

      // e.stopPropagation();
    });

    return div;
  }

  createCurationFile() {
    return this.createCurationFileBase();
  }

  createWindow(x, content, to_replace) {
    sfx("window_open");

    var folder = document.createElement("div");
    folder.className = "window "+this.type;
    folder.dataset.id = this.id;
    folder.addEventListener("click", function(e) { selectWindow(this) });

    var label = document.createElement("div");
    label.className = "label";
    label.innerHTML = "<span>"+this.name+"</span>";
    label.addEventListener("mousedown", function(e) {
      selectWindow(this.parentNode);
      _dragging = this.parentNode;
      let rect = _dragging.getBoundingClientRect();
      _dragging.dataset.x1 = rect.left;
      _dragging.dataset.y1 = rect.top;
    });

    let b, f;
    if (to_replace) {
      let history = to_replace.dataset.history.split(".");
      let index = to_replace.dataset.historyIndex;

      folder.dataset.history = to_replace.dataset.history;
      if (index == history.length) {
        history.push(this.id);
      } else if (history[index] != this.id) {
        history[index] = this.id;
      }

      if (history.length > 0) {
        if (index < history.length - 1) f = true;
        if (index > 0) b = true;
      }

      folder.dataset.history = history.join(".");
      folder.dataset.historyIndex = index;
    } else {
      folder.dataset.history = this.id;
      folder.dataset.historyIndex = 0;
    }

    let back, forth;
    if (b || f) {
      let nav = document.createElement("span");
      nav.className = "window_nav";
      back = document.createElement("a");
      back.textContent = "←";
      forth = document.createElement("a");
      forth.textContent = "→";
      if (!b) back.className = "disabled";
      if (!f) forth.className = "disabled";
      nav.appendChild(back);
      nav.appendChild(forth);
      label.prepend(nav);
    }
    if (b) {
      back.onclick = function(e) {
        let w = this.parentNode.parentNode.parentNode;
        let history = w.dataset.history.split(".");
        let index = Number(w.dataset.historyIndex) - 1;
        w.dataset.historyIndex = index;
        _files[history[index]].open(w);
        e.stopPropagation();
      };
      back.onmousedown = function(e) { e.stopPropagation() };
    }
    if (f) {
      forth.onclick = function(e) {
        let w = this.parentNode.parentNode.parentNode;
        let history = w.dataset.history.split(".");
        let index = Number(w.dataset.historyIndex) + 1;
        w.dataset.historyIndex = index;
        _files[history[index]].open(w);
        e.stopPropagation();
      };
      forth.onmousedown = function(e) { e.stopPropagation() };
    }

    if (x) {
      x = document.createElement("a");
      x.className = "window_x";
      x.textContent = "x";
      x.dataset.id = this.id;
      x.onmousedown = function(e) { 
        this.parentNode.parentNode.classList.add("delete");
        e.stopPropagation();
      };
      x.onmouseout = function(e) { this.parentNode.parentNode.classList.remove("delete"); };
      x.onclick = function(e) { 
        sfx("window_close");
        this.parentNode.parentNode.remove();
        e.stopPropagation();
      };
      folder.X = x;
      label.appendChild(x);
    }

    folder.appendChild(label);

    folder.appendChild(content);

    if (!to_replace) {
      folder.style.top = _mouse.y+"px";
      folder.style.left = _mouse.x+"px";
    } else if (to_replace) {
      to_replace.remove();
      folder.style.top = to_replace.style.top;
      folder.style.left = to_replace.style.left;
      content.style.width = to_replace.lastElementChild.style.width;
      content.style.height = to_replace.lastElementChild.style.height;
    }

    folder.addEventListener("contextmenu", function(e) {
      e.preventDefault();
    });

    let div = document.createElement("div");
    div.style.position = "absolute";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.top = "0";
    div.style.left = "0";
    div.style.background = "white";
    content.appendChild(div);

    coolerTimeout(div, function(el) { el.remove(); }, 70);

    return folder;
  }

  createInfoWindow(to_replace) {
    var content = document.createElement("div");
    content.className = "content";
    var table = document.createElement("table");

    let info = [
      {
        category: "name",
        data: this.name
      },
      {
        category: "path",
        data: this.getPathnameSpan()
      },
      {
        category: "accessibility level",
        data: this.accessLevel
      }
    ];
    for (let i of info) {
      let row = document.createElement("tr");
      let header = document.createElement("th");
      header.textContent = i.category;
      let data = document.createElement("td");

      if (i.data instanceof HTMLDocument || i.data instanceof Element) {
        data.appendChild(i.data);
      } else {
        data.textContent = i.data;
      }

      row.appendChild(header);
      row.appendChild(data);
      table.appendChild(row);
    }

    content.appendChild(table);

    var w = this.createWindow(true, content, to_replace);
    w.classList.add("info");
    w.getElementsByClassName("label")[0].firstElementChild.innerHTML += " [info]";

    return w;
  }

  createFolder(x, to_replace) {
    var content = document.createElement("div");
    if (this.files.length == 0) {
      content.innerHTML = "<span class='content_empty'>this folder is empty...</span>";
    } else {
      for (let child of this.files) {
        content.appendChild(child.createFile());
      }
    }
    content.className = "content";

    var folder = this.createWindow(x, content, to_replace);
    folder.className = "window folder";

    return folder;
  }

  createContentWindow(x, to_replace) {
    var content = document.createElement("div");
    content.className = "content";
    content.appendChild(this.content);

    var w = this.createWindow(x, content, to_replace);

    return w;
  }

  createContextMenu() {
    var menu = document.createElement("div");
    menu.dataset.id = this.id;
    menu.className = "contextmenu";

    var d1 = document.createElement("div");
    var closebutton = document.createElement("a");
    closebutton.textContent = "°";
    closebutton.className = "menubutton";
    closebutton.onclick = function(e) {
      this.parentNode.parentNode.remove();
      e.stopPropagation();
    };
    d1.appendChild(closebutton);
    menu.appendChild(d1);

    var d2 = document.createElement("div");
    let span = document.createElement("span");
    span.textContent = this.name+" menu";
    d2.appendChild(span);

    var options = this.contextMenu;
    for (let option of options) {
      let a = document.createElement("a");
      a.className = "option";
      a.textContent = option.name;
      a.addEventListener("click", option.function);
      a.addEventListener("click", function(e) {
        this.parentNode.parentNode.remove();
        e.stopPropagation();
      });
      d2.appendChild(a);
    }
    menu.appendChild(d2);

    menu.onmouseleave = function(e) {
      this.remove();
    }

    return menu;
  }

  openInfo() {
    let windows = document.getElementsByClassName("info");
    for (let i=0; i<windows.length; i++) {
      if (windows[i].dataset.id == this.id) {
        to_replace = windows[i];
      }
    }

    let w = this.createInfoWindow();
    document.body.appendChild(w);
    selectWindow(w);
  }

  openContent(to_replace, uncloseable) {
    // if (!to_replace) {
      let windows = document.getElementsByClassName("window");
      for (let i=0; i<windows.length; i++) {
        if (windows[i].classList.contains("folder")) continue;
        if (windows[i].dataset.id == this.id) {
          to_replace = windows[i];
          // selectWindow(windows[i]);
          // return;
        }
      }
    // }

    let x = !uncloseable;
    if (to_replace) x = 'X' in to_replace;

    let w = this.createContentWindow(x, to_replace);
    document.body.appendChild(w);
    selectWindow(w);
  }

  open(to_replace, uncloseable) {
    if (!to_replace) {
      let folders = document.getElementsByClassName("folder");
      for (let i=0; i<folders.length; i++) {
        if (folders[i].dataset.id == this.id) {
          to_replace = folders[i];
          // selectWindow(folders[i]);
          // return;
        }
      }
    }

    let x = !uncloseable;
    if (to_replace) x = 'X' in to_replace;

    let w = this.createFolder(x, to_replace);

    document.body.appendChild(w);
    selectWindow(w);
  }

  run(from_window) {
    if ('history' in from_window.dataset) {
      from_window.dataset.historyIndex = Number(from_window.dataset.historyIndex) + 1;
    } else {
      from_window = null;
    }
    this.open(from_window);
  }

  purgeFromHistories() {
    // edit windows whose histories may contain this file
    let windows = document.getElementsByClassName("window");
    for (let w of windows) {
      if ('history' in w.dataset) {
        let history = w.dataset.history.split(".");

        let i = history.indexOf(this.id+"");
        if (i != -1) {
          history.length = i;
          w.dataset.history = history.join(".");

          let newindex = Number(w.dataset.historyIndex);
          if (newindex >= i) newindex = i-1;

          w.dataset.historyIndex = newindex;
          _files[w.dataset.id].open();
        }
      }
    }
  }

  setFolder(file) {
    if (this.folder) {
      this.folder.files.splice(this.folder.files.indexOf(this), 1);
      this.folder = null;
      this.purgeFromHistories();
    }

    if (file) {
      file.files.push(this);
    }

    this.folder = file;
  }

  destroy(destroyChildren) {
    let parent = this.folder;
    for (let i=this.files.length-1; i>=0; i--) {
      let child = this.files[i];
      if (destroyChildren) {
        child.destroy();
      } else {
        child.setFolder(parent);
      }
    }
    this.setFolder(null);

    // clean up windows with this as id
    let windows = document.getElementsByClassName("window");
    for (let i=windows.length-1; i>=0; i--) {
      if (windows[i].dataset.id == this.id) {
        windows[i].remove();
      }
    }

    _files[this.id] = null;
  }
}

class program extends file {
  constructor(p) {
    super(p);
    this.contextMenu = [
      {
        name: "analyze",
        function: function(e) {
          _files[this.parentNode.parentNode.dataset.id].open(null);
        },
      },
      {
        name: "take apart",
        function: function(e) {
          let file = _files[this.parentNode.parentNode.dataset.id];
          let parent = file.folder;
          file.destroy();
          parent.open();
        },
      },
    ];
  }

  createCurationFile() {
    let div = this.createCurationFileBase();
    div.style.background = "blue";
    return div;
  }

  run(fw) {
    this.openContent();
  }
}

class image extends program {
  constructor(p) {
    p.type = "image";
    super(p);
    this.image = "imgs/"+p.image;
    this.content = document.createElement("img");
    this.content.src = this.image;
  }

  createCurationFile() {
    let div = this.createCurationFileBase();
    div.style.background = "transparent";

    let img = document.createElement("img");
    img.src = this.image;
    img.draggable = false;
    div.prepend(img);

    return div;
  }
}

class text extends program {
  constructor(p) {
    p.type = "text";
    super(p);
    this.text = p.text;
    this.content = document.createElement("span");
    this.content.textContent = this.text;
    this.content.className = "text";
  }

  createCurationFile() {
    let div = this.createCurationFileBase();
    div.style.background = "transparent";

    let span = document.createElement("span");
    span.textContent = this.text;
    div.prepend(span);

    div.style.minWidth = div.style.width;
    div.style.width = "fit-content";
    div.style.height = "fit-content";

    return div;
  }
}

class curation extends program {
  constructor(p) {
    p.files=p.files||[];
    p.type = "curation";
    super(p);
    for (let child of p.files) {
      child.setFolder(this);
      child.accessLevel = this.accessLevel + 1;
    };
  }

  createCurationFile() {
    let div = this.createCurationFileBase();
    div.style.background = "red";
    return div;
  }

  run(fw) {
    this.content = document.createElement("div");
    this.content.className = "curation";
    let max = { width:0, height:0 };
    for (let child of this.files) {
      let f = child.createCurationFile();
      this.content.appendChild(f);

      max.width = Math.max(child.transform.x + child.transform.width, max.width);
      max.height = Math.max(child.transform.y + child.transform.height, max.height);
    }
    this.content.style.width = (max.width)+"px";
    this.content.style.height = (max.height)+"px";

    this.openContent();
  }
}

class person extends curation {
  constructor(p) {
    p.files = [
      new image({ name:"body", image:"pizza.png" }),
      new text({ name:"words", text:"hi!!! my name is "+name })
    ];
    super(p);
    this.contextMenu = [
      {
        name: "analyze",
        function: function(e) {
          _files[this.parentNode.parentNode.dataset.id].open(null);
        },
      },
      {
        name: "photograph",
        function: function(e) {
          let file = _files[this.parentNode.parentNode.dataset.id];
          console.log("click");
          // changes their photo
          file.content = "<img src='imgs/"+file.image+"'></img>";
          file.openContent();
        },
      }
    ];
  }
}

class machine extends curation {
  constructor(p) {
    super(p);
    this.creator = p.creator || "doda";
    if (this.creator == "doda") {
      this.contextMenu.push({
        name: "rename",
        function: function(e) {
          let file = _files[this.parentNode.parentNode.dataset.id];
          file.name = "debug";
          file.folder.open();
          console.log("rename it...");
        }
      });
    }
  }

  // run(fw) {
  //   if ('history' in fw.dataset) {
  //     fw.dataset.historyIndex = Number(fw.dataset.historyIndex) + 1;
  //   } else {
  //     fw = null;
  //   }
  //   this.open(fw);
  // }
}