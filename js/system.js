var _files = [];
var _mouse = { x:50, y:50, prevx:50, prevy:50 };
var _window_selected;
var _dragging;
var _file_dropping;

function selectWindow(w) {
  if (_window_selected) {
    _window_selected.classList.remove("selected");
  }

  _window_selected = w;
  w.classList.add("selected");
  w.parentNode.appendChild(w);
}

function clearGhost() {
  _file_dropping.classList.remove("dropping");
  _file_dropping = null;
  document.body.removeChild(_dragging);
  _dragging = null;
  document.body.classList.remove("grabbing");
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
        name: TEXT("context_newWindow"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null);
        },
      },
      {
        name: TEXT("context_photograph"),
        function: function(e) {
          let file = _files[this.dataset.id];
          let photo = file.createPhotograph();
          document.body.appendChild(photo);
          selectWindow(photo);
        },
      },
      {
        name: TEXT("context_info"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null, "info");
        },
      },
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
        sfx("window_open");
        _files[this.dataset.id].open(null);
        e.stopPropagation();
      };
      p.textContent = parent.name;

      let filler = document.createElement("span");
      filler.className = "filler";
      filler.textContent = TEXT("path_connector");

      if (TEXT("path_direction") == -1) {
        s.appendChild(filler);
        s.appendChild(p); 
      } else {
        s.prepend(filler);
        s.prepend(p);
      }

      parent = parent.folder;
    }

    return s;
  }

  createFile(noContext) {
    let file = document.createElement("div");
    file.className = "file";
    file.dataset.id = this.id;

    let label = document.createElement("a");
    label.className = "filename";
    label.textContent = this.name;
    label.dataset.id = this.id;
    label.addEventListener("mousedown", function(e) {
      _file_dropping = this;
      e.stopPropagation();
    });
    label.addEventListener("mouseenter", function(e) {
      if (!_file_dropping) return;
      if (_file_dropping.dataset.id == this.dataset.id) return;
      if (_files[this.dataset.id].isDescendantOf(_files[_file_dropping.dataset.id])) return;

      this.classList.add("droppable");
    });
    label.addEventListener("mouseleave", function(e) {
      if (!_file_dropping) return;

      if (!_dragging && _file_dropping == this) {
        this.classList.add("dropping");
        // create a ghost of this file that you can drag around!!
        let ghost = document.createElement("span");
        ghost.className = "ghost";
        ghost.textContent = _files[this.dataset.id].name;
        ghost.dataset.id = this.dataset.id;
        ghost.style.left = _mouse.x+"px";
        ghost.style.top = _mouse.y+"px";
        ghost.dataset.x1 = _mouse.x;
        ghost.dataset.y1 = _mouse.y;
        document.body.classList.add("grabbing");
        document.body.appendChild(ghost);
        _dragging = ghost;
      } else {
        this.classList.remove("droppable");
      }
    });
    label.addEventListener("mouseup", function(e) {
      if (_file_dropping) {
        if (_file_dropping.dataset.id == this.dataset.id) {
          if (!_dragging) {
            // click
            _file_dropping = null;
            sfx("window_open");
            let w = this.parentNode.parentNode.parentNode.parentNode;
            _files[this.dataset.id].run(w);
          } else {
            clearGhost();
          }
        } else {
          if (this.classList.contains("droppable")) {
            // a file is trying to enter this folder
            let file = _files[_file_dropping.dataset.id];
            let folder = _files[this.dataset.id];
            // _files[w.dataset.id].open(w);
            file.setFolder(folder);
            sfx("file_move");
            this.classList.remove("droppable");
          }
          clearGhost();
        }
      }
      e.stopPropagation();
    });
    label.addEventListener("click", function(e) {
      e.stopPropagation();
    });

    file.appendChild(label);

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

  createCurationFileBase(content, defaultWidth, defaultHeight) {
    let div = document.createElement("div");
    div.className = "file curation";
    div.style.background = "gray";

    if (content) div.appendChild(content);

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
      div.style.width = defaultWidth || "5rem";
      div.style.height = defaultHeight || "5rem";
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

      // e.stopPropagation();
    });

    return div;
  }

  createCurationFile() {
    return this.createCurationFileBase();
  }

  createWindow(x, content, to_replace) {
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

    label.addEventListener("mousedown", function(e) {
      document.body.classList.add("grabbing");
    });
    label.addEventListener("mouseleave", function(e) {
      if (_dragging==this.parentNode)
        document.body.classList.remove("grabbing");
    });

    label.addEventListener("mouseup", function(e) {
      if (_dragging==this.parentNode)
        document.body.classList.remove("grabbing");
    });

    let b, f;
    if (to_replace) {
      let history = to_replace.dataset.history.split(".");
      let index = Number(to_replace.dataset.historyIndex);

      if (index == history.length) {
        history.push(this.id);
      } else if (history[index] != this.id) {
        history[index] = this.id;
        history.length = index + 1;
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
        sfx("file_move");
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
        sfx("file_move");
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

    let contentwindow = document.createElement("div");
    contentwindow.dataset.id = this.id;
    contentwindow.className = "content";
    contentwindow.appendChild(content);
    contentwindow.addEventListener("mouseover", function(e) {
      if (!_file_dropping) return;
      if (_file_dropping.dataset.id == this.dataset.id) return;
      if (_files[this.dataset.id].isDescendantOf(_files[_file_dropping.dataset.id])) return;

      console.log(e.target.tagName);
      if (e.target.tagName != "A") {
        this.classList.add("droppable");
      } else {
        this.classList.remove("droppable");
      }
    });
    contentwindow.addEventListener("mouseleave", function(e) {
      if (!_file_dropping) return;
      this.classList.remove("droppable");
    });
    contentwindow.addEventListener("mouseup", function(e) {
      if (!_file_dropping) return;

      if (this.classList.contains("droppable")) {
        let file = _files[_file_dropping.dataset.id];
        let folder = _files[this.dataset.id];
        if (file.folder != folder) {
          file.setFolder(folder);
          sfx("file_move");
          clearGhost();
        }
        this.classList.remove("droppable");
      }
    });

    folder.appendChild(contentwindow);

    if (!to_replace) {
      folder.style.top = _mouse.y+"px";
      folder.style.left = _mouse.x+"px";
    } else if (to_replace) {
      document.body.removeChild(to_replace);
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
    var content = document.createElement("table");

    let info = [
      {
        category: TEXT("info_name"),
        data: this.name
      },
      {
        category: TEXT("info_path"),
        data: this.getPathnameSpan()
      },
      {
        category: TEXT("info_accessLevel"),
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
      content.appendChild(row);
    }

    var w = this.createWindow(true, content, to_replace);
    w.classList.add("info");
    w.getElementsByClassName("label")[0].firstElementChild.innerHTML += " "+TEXT("info");

    w.dataset.format = "info";

    return w;
  }

  createFolder(x, to_replace) {
    var content = document.createElement("div");
    if (this.files.length == 0) {
      content.innerHTML = "<span class='content_empty'>"+TEXT("empty_folder")+"</span>";
    } else {
      for (let child of this.files) {
        content.appendChild(child.createFile());
      }
    }

    var folder = this.createWindow(x, content, to_replace);
    folder.className = "window folder";

    folder.dataset.format = "folder";

    return folder;
  }

  createContentWindow(x, to_replace) {
    var w = this.createWindow(x, this.content, to_replace);

    if (this.content.style.height != "") {
      w.getElementsByClassName("content")[0].style.height = this.content.style.height;
    }

    w.dataset.format = "program";

    return w;
  }

  createPhotograph() {
    console.log("click");

    let img = document.createElement("img");
    img.src = "imgs/pizza.png";

    var w = this.createWindow(true, img);
    w.classList.add("photograph");

    w.dataset.format = "photograph";

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
    span.textContent = this.name+" "+TEXT("context_menu");
    d2.appendChild(span);

    var options = this.contextMenu;
    for (let option of options) {
      let a = document.createElement("a");
      a.className = "option";
      a.textContent = option.name;
      a.dataset.id = this.id;
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

  refresh(format) {
    let fw;
    let windows = document.getElementsByClassName("window");
    for (let i=0; i<windows.length; i++) {
      let w = windows[i];
      if (w.dataset.format == format && w.dataset.id == this.id) {
        fw = w;
        break;
      }
    }
    if (!fw) return;

    let w;
    let x = true;
    if (fw) x = 'X' in fw;
    switch (format) {
      case "folder":
        w = this.createFolder(x, fw);
        break;
      case "info":
        w = this.createInfoWindow(fw);
        break;
      case "program":
        w = this.createContentWindow(x, fw);
        break;
    }

    document.body.appendChild(w);
    fw.remove();
    selectWindow(w);

    return w;
  }

  open(from_window, format, uncloseable) {
    format = format || "folder";

    if (format != "folder") {
      // should not open in the same window
      from_window = null;
    }
    if (!from_window) {
      // if this window is already open then what are we doing??
      let windows = document.getElementsByClassName("window");
      for (let i=0; i<windows.length; i++) {
        let w = windows[i];
        if (w.dataset.format == format && w.dataset.id == this.id) {
          from_window = w;
          break;
        }
      }
    }
    
    let x = !uncloseable;

    let w;
    switch (format) {
      case "folder":
        if (from_window) {
          x = 'X' in from_window;
          let history = from_window.dataset.history.split(".");
          let index = Number(from_window.dataset.historyIndex);

          if (history[index] != this.id) {
            from_window.dataset.historyIndex = index + 1;
          }
        }

        w = this.createFolder(x, from_window);
        break;
      case "info":
        w = this.createInfoWindow(from_window);
        break;
      case "program":
        w = this.createContentWindow(x, from_window);
        break;
    }

    document.body.appendChild(w);

    if (from_window) from_window.remove();

    selectWindow(w);

    return w;
  }

  run(from_window) {
    this.open(from_window, "folder", false);
  }

  purgeFromHistories() {
    // edit windows whose histories may contain this file
    let windows = document.getElementsByClassName("window");
    for (let i=windows.length-1; i>=0; i--) {
      let w = windows[i];

      if (w.dataset.format == "folder" && 'history' in w.dataset) {
        let history = w.dataset.history.split(".");

        let i = history.indexOf(this.id+"");
        if (i != -1) {
          history.length = i;
          w.dataset.history = history.join(".");

          let newindex = Number(w.dataset.historyIndex);
          if (newindex >= i) newindex = i-1;

          w.dataset.historyIndex = newindex;
          _files[w.dataset.id].run(w);
        }
      }
    }
  }

  setFolder(file) {
    if (this.folder) {
      this.folder.files.splice(this.folder.files.indexOf(this), 1);
      // make this disappear from windows that used to have it
      let windows = document.getElementsByClassName("window");
      for (let i=windows.length-1; i>=0; i--) {
        let w = windows[i];
        if (w.dataset.id == this.folder.id) {
          _files[w.dataset.id].refresh(w.dataset.format);
        }
      }
      this.folder = null;
    }

    this.folder = file;

    if (file) {
      file.files.push(this);

      // make this appear in windows that dont have it
      let windows = document.getElementsByClassName("window");
      for (let i=windows.length-1; i>=0; i--) {
        let w = windows[i];
        if (w.dataset.id == file.id) {
          _files[w.dataset.id].refresh(w.dataset.format);
        }
      }
    }

    this.purgeFromHistories();
    this.refresh("info");
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

  isDescendantOf(file) {
    if (this.folder == file) return true;

    let filefound = false;
    let parent = this.folder;
    while (parent != null) {
      parent = parent.folder;
      if (parent == file) {
        filefound = true;
        break;
      }
    }
    return filefound;
  }
}

class program extends file {
  constructor(p) {
    super(p);
    this.contextMenu = [
      {
        name: TEXT("context_analyze"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null);
        },
      },
      {
        name: TEXT("context_takeApart"),
        function: function(e) {
          sfx("window_close");
          let file = _files[this.dataset.id];
          let parent = file.folder;
          file.destroy();
        },
      },
      {
        name: TEXT("context_info"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null, "info");
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
    this.open(fw, "program");
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
    let img = document.createElement("img");
    img.src = this.image;
    img.draggable = false;

    let div = this.createCurationFileBase(img, null, "fit-content");
    div.style.background = "transparent";

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
    div.style.background = "inherit";

    let span = document.createElement("span");
    span.textContent = this.text;
    div.prepend(span);

    div.style.minWidth = div.style.width;
    div.style.width = "fit-content";
    div.style.height = "fit-content";

    return div;
  }
}

class dialogue extends text {
  constructor(p) {
    super(p);
  }

  createCurationFile() {
    this.text = DIALOGUE(this.folder);
    this.content.textContent = this.text;

    let div = this.createCurationFileBase();
    div.style.background = "inherit";

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

  refresh(format) {
    let fw;
    let windows = document.getElementsByClassName("window");
    for (let i=0; i<windows.length; i++) {
      let w = windows[i];
      if (w.dataset.format == format && w.dataset.id == this.id) {
        fw = w;
        break;
      }
    }
    if (!fw) return;

    if (format == "program") {
      this.run(fw);
      return;
    }

    let w;
    let x = true;
    if (fw) x = 'X' in fw;
    switch (format) {
      case "folder":
        w = this.createFolder(x, fw);
        break;
      case "info":
        w = this.createInfoWindow(fw);
        break;
    }

    document.body.appendChild(w);
    fw.remove();
    selectWindow(w);

    return w;
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

    let w = this.open(fw, "program");

    this.content.style.width = max.width+"px";
    this.content.style.height = max.height+"px";
  }
}

class person extends curation {
  constructor(p) {
    super(p);
    this.dialogueTag = p.name;
    this.name = TEXT(p.name);

    let body = new image({ name:TEXT("person_body"), folder:this, image:p.image || ["guy1.png", "guy2.png", "guy3.png"][Math.random() * 3 | 0] });
    let d = new dialogue({ name:TEXT("person_words"), folder:this });

    this.contextMenu = [
      {
        name: TEXT("context_analyze"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null);
        },
      },
      {
        name: TEXT("context_info"),
        function: function(e) {
          sfx("window_open");
          _files[this.dataset.id].open(null, "info");
        },
      },
    ];
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

    let w = this.open(fw, "program");

    this.content.style.width = max.width+"px";
    this.content.style.height = max.height+"px";
  }
}

class machine extends curation {
  constructor(p) {
    super(p);
  }
}

class placemachine extends machine {
  constructor(p) {
    super(p);
    this.type = "folder";
  }

  run(fw) {
    this.open(fw, "folder", false);
  }
}