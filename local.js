var _DIALOGUE = {
  "doda": {
    lines: [
      {
        eng: "the name's doda",
        kor: "내 이름은 달이"
      }
    ],
    index: -1
  },
  "peep": {
    lines: [
      {
        eng: "there's pizza in the freezer",
        kor: "냉동고에 피자 있다"
      }
    ],
    index: -1
  },
};

var _TEXT = {
  language: "kor",

  // files
  "world": {
    eng: "world",
    kor: "우주"
  },
  "solar system": {
    eng: "solar system",
    kor: "태양계"
  },
  "star": {
    eng: "star",
    kor: "별"
  },
  "city": {
    eng: "city",
    kor: "도시"
  },
  "ship": {
    eng: "ship",
    kor: "우주선"
  },
  "freezer": {
    eng: "freezer",
    kor: "냉동고"
  },
  "pizza box": {
    eng: "pizza box",
    kor: "피자 상자"
  },
  "pepperoni pizza slice": {
    eng: "pepperoni pizza slice",
    kor: "페페로니 피자 조각"
  },
  "tiny pizza box": {
    eng: "tiny pizza box",
    kor: "작은 피자 상자"
  },

  "doda": {
    eng: "doda",
    kor: "달이"
  },
  "peep": {
    eng: "peep",
    kor: "삐삐"
  },

  "doda's seeing eye": {
    eng: "doda's seeing eye",
    kor: "달이의 인공위성"
  },

  // system

  "person_body": {
    eng: "body",
    kor: "몸"
  },
  "person_words": {
    eng: "words",
    kor: "말"
  },

  "path_direction": {
    eng: -1,
    kor: 1
  },
  "path_connector": {
    eng: " of ",
    kor: "의 ",
  },

  "context_menu": {
    eng: "menu",
    kor: "메뉴"
  },
  "context_newWindow": {
    eng: "open in new window",
    kor: "새로운 창에서 열기"
  },
  "context_info": {
    eng: "get info",
    kor: "정보 보기"
  },
  "context_analyze": {
    eng: "analyze",
    kor: "내용물 분석하기"
  },
  "context_takeApart": {
    eng: "take apart",
    kor: "분해하기"
  },
  "context_rename": {
    eng: "rename",
    kor: "이름 바꾸기"
  },
  "context_photograph": {
    eng: "photograph",
    kor: "사진 찍기"
  },

  "info": {
    eng: "[info]",
    kor: "[정보]"
  },
  "info_name": {
    eng: "name",
    kor: "파일명"
  },
  "info_path": {
    eng: "path",
    kor: "경로"
  },
  "info_accessLevel": {
    eng: "accessibility level",
    kor: "접근 등급"
  },

  "empty_folder": {
    eng: "this folder is empty...",
    kor: "빈 폴더입니다."
  }
};

function TEXT(tag) {
  return _TEXT[tag][_TEXT.language];
}

function DIALOGUE(file) {
  let d = _DIALOGUE[file.dialogueTag];
  d.index++;
  if (d.index >= d.lines.length) d.index = 0;

  return d.lines[d.index][_TEXT.language];
}