/*
 * Copyright (c) 2026 Kidsplates/UsenVideoCallApp
 * Created: 2026-05-24
 * Description: 都道府県データ、グリッド座標、特産品、地方情報の定義
 */

const regions = {
  hokkaido: { name: "北海道", nameKana: "ほっかいどう", color: "#FF8E9E" },
  tohoku: { name: "東北", nameKana: "とうほく", color: "#FFB077" },
  kanto: { name: "関東", nameKana: "かんとう", color: "#FFE17D" },
  chubu: { name: "中部", nameKana: "ちゅうぶ", color: "#95E1D3" },
  kinki: { name: "近畿", nameKana: "きんき", color: "#A8D8EA" },
  chugoku: { name: "中国", nameKana: "ちゅうごく", color: "#AA96DA" },
  shikoku: { name: "四国", nameKana: "しこく", color: "#FCBAD3" },
  kyushu: { name: "九州・沖縄", nameKana: "きゅうしゅう・おきなわ", color: "#9FE6A0" }
};

const prefectures = [
  // 北海道地方
  {
    id: "hokkaido",
    name: "北海道",
    kana: "ほっかいどう",
    capital: "札幌",
    capitalKana: "さっぽろ",
    region: "hokkaido",
    grid: { col: 17, row: 1, w: 3, h: 2 },
    facts: {
      food: "夕張メロン、カニ、ジンギスカン",
      spot: "札幌雪まつり、ラベンダー畑",
      trivia: "日本で一番広い都道府県だよ！じゃがいもや牛乳の生産量も日本一！"
    }
  },
  // 東北地方
  {
    id: "aomori",
    name: "青森",
    kana: "あおもり",
    capital: "青森",
    capitalKana: "あおもり",
    region: "tohoku",
    grid: { col: 17, row: 4, w: 2, h: 1 },
    facts: {
      food: "りんご、にんにく",
      spot: "ねぶた祭り、白神山地",
      trivia: "りんごの生産量が日本一！ねぶた祭りは大きな灯籠が街を練り歩くよ。"
    }
  },
  {
    id: "akita",
    name: "秋田",
    kana: "あきた",
    capital: "秋田",
    capitalKana: "あきた",
    region: "tohoku",
    grid: { col: 16, row: 5, w: 1, h: 1 },
    facts: {
      food: "きりたんぽ、稲庭うどん",
      spot: "男鹿のなまはげ、田沢湖",
      trivia: "秋田犬（あきたいぬ）のふるさと！「なまはげ」という伝統行事があるよ。"
    }
  },
  {
    id: "iwate",
    name: "岩手",
    kana: "いわて",
    capital: "盛岡",
    capitalKana: "もりおか",
    region: "tohoku",
    grid: { col: 17, row: 5, w: 2, h: 1 },
    facts: {
      food: "わんこそば、盛岡冷麺",
      spot: "中尊寺金色堂、小岩井農場",
      trivia: "本州の中で一番面積が広い県だよ。たくさんのそばをお椀で食べる「わんこそば」が有名！"
    }
  },
  {
    id: "yamagata",
    name: "山形",
    kana: "やまがた",
    capital: "山形",
    capitalKana: "やまがた",
    region: "tohoku",
    grid: { col: 16, row: 6, w: 1, h: 1 },
    facts: {
      food: "さくらんぼ、米沢牛",
      spot: "蔵王の樹氷、山寺",
      trivia: "さくらんぼの生産量が日本一！将棋の駒（こま）の生産も日本一だよ。"
    }
  },
  {
    id: "miyagi",
    name: "宮城",
    kana: "みやぎ",
    capital: "仙台",
    capitalKana: "せんだい",
    region: "tohoku",
    grid: { col: 17, row: 6, w: 2, h: 1 },
    facts: {
      food: "牛タン、ずんだ餅、笹かまぼこ",
      spot: "松島、万画館",
      trivia: "日本三景（さんけい）の1つ「松島（まつしま）」があるよ。伊達政宗（だてまさむね）が治めた土地だよ。"
    }
  },
  {
    id: "fukushima",
    name: "福島",
    kana: "ふくしま",
    capital: "福島",
    capitalKana: "ふくしま",
    region: "tohoku",
    grid: { col: 16, row: 7, w: 2, h: 1 },
    facts: {
      food: "桃、喜多方ラーメン",
      spot: "猪苗代湖、鶴ヶ城",
      trivia: "赤い牛のおもちゃ「赤べこ」は魔除けのお守り。桃がおいしいことで有名だよ！"
    }
  },
  // 関東地方
  {
    id: "ibaraki",
    name: "茨城",
    kana: "いばらき",
    capital: "水戸",
    capitalKana: "みと",
    region: "kanto",
    grid: { col: 17, row: 8, w: 1, h: 1 },
    facts: {
      food: "納豆、ほしいも、メロン",
      spot: "国営ひたち海浜公園、袋田の滝",
      trivia: "納豆の生産で有名！「水戸黄門（みとこうもん）」ゆかりの地だよ。"
    }
  },
  {
    id: "tochigi",
    name: "栃木",
    kana: "とちぎ",
    capital: "宇都宮",
    capitalKana: "うつのみや",
    region: "kanto",
    grid: { col: 16, row: 8, w: 1, h: 1 },
    facts: {
      food: "宇都宮餃子、いちご（とちおとめ）",
      spot: "日光東照宮、あしかがフラワーパーク",
      trivia: "いちごの生産量が日本一！日光東照宮には「見ざる、言わざる、聞かざる」の彫刻があるよ。"
    }
  },
  {
    id: "gunma",
    name: "群馬",
    kana: "ぐんま",
    capital: "前橋",
    capitalKana: "まえばし",
    region: "kanto",
    grid: { col: 15, row: 8, w: 1, h: 1 },
    facts: {
      food: "焼きまんじゅう、水沢うどん、こんにゃく",
      spot: "草津温泉、富岡製糸場",
      trivia: "こんにゃくいもの生産量が日本一！温泉がたくさんあるよ。"
    }
  },
  {
    id: "saitama",
    name: "埼玉",
    kana: "さいたま",
    capital: "さいたま",
    capitalKana: "さいたま",
    region: "kanto",
    grid: { col: 15, row: 9, w: 1, h: 1 },
    facts: {
      food: "草加せんべい、深谷ねぎ",
      spot: "川越の蔵造りの町並み、鉄道博物館",
      trivia: "自転車の保有率が日本一！晴れの日がとても多い県だよ。"
    }
  },
  {
    id: "chiba",
    name: "千葉",
    kana: "ちば",
    capital: "千葉",
    capitalKana: "ちば",
    region: "kanto",
    grid: { col: 17, row: 9, w: 1, h: 2 },
    facts: {
      food: "落花生（ピーナッツ）、びわ",
      spot: "東京ディズニーリゾート、成田国際空港",
      trivia: "落花生の生産量が日本一！日本の海の玄関口「成田空港」があるよ。"
    }
  },
  {
    id: "tokyo",
    name: "東京",
    kana: "とうきょう",
    capital: "新宿",
    capitalKana: "しんじゅく",
    region: "kanto",
    grid: { col: 16, row: 9, w: 1, h: 1 },
    facts: {
      food: "もんじゃ焼き、人形焼",
      spot: "東京スカイツリー、雷門（浅草）",
      trivia: "日本の首都（しゅと）だよ！世界で一番たくさんの人が住んでいる都市の１つなんだ。"
    }
  },
  {
    id: "kanagawa",
    name: "神奈川",
    kana: "かながわ",
    capital: "横浜",
    capitalKana: "よこはま",
    region: "kanto",
    grid: { col: 16, row: 10, w: 1, h: 1 },
    facts: {
      food: "横浜中華街の肉まん、崎陽軒のシウマイ",
      spot: "みなとみらい、鎌倉の大仏、箱根温泉",
      trivia: "大仏様がいる歴史ある「鎌倉」や、温泉で大人気の「箱根」があるよ。"
    }
  },
  // 中部地方
  {
    id: "niigata",
    name: "新潟",
    kana: "にいがた",
    capital: "新潟",
    capitalKana: "にいがた",
    region: "chubu",
    grid: { col: 14, row: 6, w: 2, h: 1 },
    facts: {
      food: "コシヒカリ（お米）、笹だんご",
      spot: "佐渡島、苗場スキー場",
      trivia: "美味しいお米と日本酒の産地！豪雪地帯（雪がたくさん降る場所）としても有名だよ。"
    }
  },
  {
    id: "toyama",
    name: "富山",
    kana: "とやま",
    capital: "富山",
    capitalKana: "とやま",
    region: "chubu",
    grid: { col: 13, row: 7, w: 1, h: 1 },
    facts: {
      food: "富山ブラックラーメン、ほたるいか、ます寿司",
      spot: "黒部ダム、立山黒部アルペンルート",
      trivia: "日本で一番大きなダム「黒部ダム」があるよ。冬には巨大な雪の壁が見られるよ。"
    }
  },
  {
    id: "ishikawa",
    name: "石川",
    kana: "いしかわ",
    capital: "金沢",
    capitalKana: "かなざわ",
    region: "chubu",
    grid: { col: 12, row: 6, w: 1, h: 1 },
    facts: {
      food: "金沢カレー、のどぐろ",
      spot: "兼六園、金沢21世紀美術館",
      trivia: "「金箔（きんぱく）」の生産が日本一！美しい日本庭園「兼六園」があるよ。"
    }
  },
  {
    id: "fukui",
    name: "福井",
    kana: "ふくい",
    capital: "福井",
    capitalKana: "ふくい",
    region: "chubu",
    grid: { col: 12, row: 8, w: 1, h: 1 },
    facts: {
      food: "越前ガニ、ソースカツ丼",
      spot: "東尋坊、福井県立恐竜博物館",
      trivia: "恐竜の化石がたくさん見つかる県！メガネのフレームの生産が日本一だよ。"
    }
  },
  {
    id: "yamanashi",
    name: "山梨",
    kana: "やまなし",
    capital: "甲府",
    capitalKana: "こうふ",
    region: "chubu",
    grid: { col: 14, row: 9, w: 1, h: 1 },
    facts: {
      food: "ほうとう、ぶどう、もも",
      spot: "富士山（北側）、富士急ハイランド",
      trivia: "ぶどうと桃の生産量が日本一！日本一高い「富士山」の北側があるよ。"
    }
  },
  {
    id: "nagano",
    name: "長野",
    kana: "ながの",
    capital: "長野",
    capitalKana: "ながの",
    region: "chubu",
    grid: { col: 14, row: 7, w: 1, h: 2 },
    facts: {
      food: "信州そば、おやき、りんご",
      spot: "善光寺、上高地、軽井沢",
      trivia: "海に面していない県の中で一番面積が広いよ。山に囲まれていて自然がいっぱい！"
    }
  },
  {
    id: "gifu",
    name: "岐阜",
    kana: "ぎふ",
    capital: "岐阜",
    capitalKana: "ぎふ",
    region: "chubu",
    grid: { col: 13, row: 8, w: 1, h: 1 },
    facts: {
      food: "飛騨牛、栗きんとん",
      spot: "白川郷の合掌造り、下呂温泉",
      trivia: "世界遺産（せかいいさん）の「白川郷」があり、三角のわらぶき屋根の家が並んでいるよ。"
    }
  },
  {
    id: "shizuoka",
    name: "静岡",
    kana: "しずおか",
    capital: "静岡",
    capitalKana: "しずおか",
    region: "chubu",
    grid: { col: 14, row: 10, w: 2, h: 1 },
    facts: {
      food: "お茶、うなぎ、みかん、さくらえび",
      spot: "富士山（南側）、浜名湖、伊豆半島",
      trivia: "お茶の生産量が日本一！富士山の南側があり、新幹線から綺麗に見えるよ。"
    }
  },
  {
    id: "aichi",
    name: "愛知",
    kana: "あいち",
    capital: "名古屋",
    capitalKana: "なごや",
    region: "chubu",
    grid: { col: 13, row: 9, w: 1, h: 1 },
    facts: {
      food: "ひつまぶし、手羽先、味噌カツ、天むす",
      spot: "名古屋城、ジブリパーク",
      trivia: "自動車づくりが盛んで、ものづくりが日本一の県だよ！金のシャチホコがのった名古屋城が有名。"
    }
  },
  // 近畿地方
  {
    id: "mie",
    name: "三重",
    kana: "みえ",
    capital: "津",
    capitalKana: "つ",
    region: "kinki",
    grid: { col: 12, row: 10, w: 1, h: 1 },
    facts: {
      food: "松阪牛、伊勢エビ、赤福",
      spot: "伊勢神宮、志摩スペイン村",
      trivia: "日本で一番名前が短い県庁所在地「津（つ）」があるよ！歴史ある伊勢神宮が有名。"
    }
  },
  {
    id: "shiga",
    name: "滋賀",
    kana: "しが",
    capital: "大津",
    capitalKana: "おおつ",
    region: "kinki",
    grid: { col: 12, row: 9, w: 1, h: 1 },
    facts: {
      food: "近江牛、ふなずし",
      spot: "琵琶湖、彦根城",
      trivia: "日本で一番大きな湖「琵琶湖（びわこ）」があるよ。県の面積の約６分の１が湖なんだ！"
    }
  },
  {
    id: "kyoto",
    name: "京都",
    kana: "きょうと",
    capital: "京都",
    capitalKana: "きょうと",
    region: "kinki",
    grid: { col: 11, row: 8, w: 1, h: 1 },
    facts: {
      food: "八ツ橋、宇治抹茶、京野菜",
      spot: "金閣寺、清水寺、伏見稲荷大社",
      trivia: "千年以上前に日本の都（みやこ）があった場所。歴史あるお寺や神社がたくさんあるよ。"
    }
  },
  {
    id: "osaka",
    name: "大阪",
    kana: "おおさか",
    capital: "大阪",
    capitalKana: "おおさか",
    region: "kinki",
    grid: { col: 11, row: 9, w: 1, h: 1 },
    facts: {
      food: "たこ焼き、お好み焼き、串カツ",
      spot: "大阪城、ユニバーサル・スタジオ・ジャパン、道頓堀",
      trivia: "日本で２番目に面積が小さいけれど、たくさんの人が住む賑やかな「商人の街」だよ。"
    }
  },
  {
    id: "hyogo",
    name: "兵庫",
    kana: "ひょうご",
    capital: "神戸",
    capitalKana: "こうべ",
    region: "kinki",
    grid: { col: 10, row: 8, w: 1, h: 2 },
    facts: {
      food: "神戸牛、明石焼き",
      spot: "姫路城、明石海峡大橋、有馬温泉",
      trivia: "白い壁が美しく「白鷺城（しらさぎじょう）」と呼ばれる世界遺産「姫路城」があるよ。"
    }
  },
  {
    id: "nara",
    name: "奈良",
    kana: "なら",
    capital: "奈良",
    capitalKana: "なら",
    region: "kinki",
    grid: { col: 11, row: 10, w: 1, h: 1 },
    facts: {
      food: "柿の葉寿司、三輪そうめん",
      spot: "東大寺の大仏、奈良公園（シカ）",
      trivia: "京都よりも前に日本の都があった場所。奈良公園には野生のシカがたくさん暮らしているよ。"
    }
  },
  {
    id: "wakayama",
    name: "和歌山",
    kana: "わかやま",
    capital: "和歌山",
    capitalKana: "わかやま",
    region: "kinki",
    grid: { col: 10, row: 11, w: 2, h: 1 },
    facts: {
      food: "みかん、梅干し、和歌山ラーメン",
      spot: "高野山、那智の滝、アドベンチャーワールド",
      trivia: "みかんと梅干しの生産量が日本一！パンダがたくさんいる動物園があるよ。"
    }
  },
  // 中国地方
  {
    id: "tottori",
    name: "鳥取",
    kana: "とっとり",
    capital: "鳥取",
    capitalKana: "とっとり",
    region: "chugoku",
    grid: { col: 9, row: 7, w: 1, h: 1 },
    facts: {
      food: "二十世紀梨、カニ、二十世紀梨ソフト",
      spot: "鳥取砂丘、水木しげるロード",
      trivia: "日本で一番人口が少ない県だよ。とても大きくてきれいな「鳥取砂丘（さきゅう）」があるよ。"
    }
  },
  {
    id: "shimane",
    name: "島根",
    kana: "しまね",
    capital: "松江",
    capitalKana: "まつえ",
    region: "chugoku",
    grid: { col: 8, row: 7, w: 1, h: 1 },
    facts: {
      food: "出雲そば、しじみ",
      spot: "出雲大社、石見銀山、松江城",
      trivia: "神様が集まることで有名な「出雲大社（いづもおおやしろ）」があるよ！"
    }
  },
  {
    id: "okayama",
    name: "岡山",
    kana: "おかやま",
    capital: "岡山",
    capitalKana: "おかやま",
    region: "chugoku",
    grid: { col: 9, row: 8, w: 1, h: 1 },
    facts: {
      food: "きびだんご、桃（清水白桃）、マスカット",
      spot: "後楽園、倉敷美観地区",
      trivia: "桃太郎（ももたろう）のお話の舞台！ジーンズの生産が日本一盛んなことでも有名。"
    }
  },
  {
    id: "hiroshima",
    name: "広島",
    kana: "ひろしま",
    capital: "広島",
    capitalKana: "ひろしま",
    region: "chugoku",
    grid: { col: 8, row: 8, w: 1, h: 1 },
    facts: {
      food: "お好み焼き（広島風）、牡蠣（かき）、もみじ饅頭",
      spot: "厳島神社（宮島）、平和記念公園",
      trivia: "海の中に鳥居（とりい）が立つ「厳島神社（いつくしまじんじゃ）」が世界的に有名だよ。"
    }
  },
  {
    id: "yamaguchi",
    name: "山口",
    kana: "やまぐち",
    capital: "山口",
    capitalKana: "やまぐち",
    region: "chugoku",
    grid: { col: 7, row: 8, w: 1, h: 1 },
    facts: {
      food: "ふぐ、瓦そば",
      spot: "秋吉台、錦帯橋、角島大橋",
      trivia: "日本で一番大きいカルスト台地（石灰岩の台地）「秋吉台（あきよしだい）」があるよ。"
    }
  },
  // 四国地方
  {
    id: "tokushima",
    name: "徳島",
    kana: "tokushima",
    capital: "徳島",
    capitalKana: "とくしま",
    region: "shikoku",
    grid: { col: 9, row: 10, w: 1, h: 1 },
    facts: {
      food: "すだち、徳島ラーメン",
      spot: "阿波おどり、鳴門の渦潮",
      trivia: "夏の伝統舞踊「阿波（あわ）おどり」や、海の激しい流れで作られる「渦潮（うずしお）」が有名！"
    }
  },
  {
    id: "kagawa",
    name: "香川",
    kana: "かがわ",
    capital: "高松",
    capitalKana: "たかまつ",
    region: "shikoku",
    grid: { col: 9, row: 9, w: 1, h: 1 },
    facts: {
      food: "讃岐うどん、骨付鳥",
      spot: "金刀比羅宮、小豆島（オリーブ）",
      trivia: "日本で一番面積が小さい県だけど、うどんの消費量は圧倒的日本一で「うどん県」とも呼ばれるよ。"
    }
  },
  {
    id: "ehime",
    name: "愛媛",
    kana: "えひめ",
    capital: "松山",
    capitalKana: "まつやま",
    region: "shikoku",
    grid: { col: 8, row: 9, w: 1, h: 1 },
    facts: {
      food: "みかん、鯛めし",
      spot: "道後温泉、松山城",
      trivia: "みかんジュースが出る蛇口（じゃぐち）があるよ！日本で最も古い温泉の１つ「道後温泉」があるよ。"
    }
  },
  {
    id: "kochi",
    name: "高知",
    kana: "こうち",
    capital: "高知",
    capitalKana: "こうち",
    region: "shikoku",
    grid: { col: 8, row: 10, w: 1, h: 1 },
    facts: {
      food: "カツオのたたき、芋けんぴ",
      spot: "桂浜、四万十川",
      trivia: "坂本龍馬（さかもとりょうま）の出身地！日本最後の清流と呼ばれる「四万十川（しまんとがわ）」があるよ。"
    }
  },
  // 九州・沖縄地方
  {
    id: "fukuoka",
    name: "福岡",
    kana: "ふくおか",
    capital: "福岡",
    capitalKana: "ふくおか",
    region: "kyushu",
    grid: { col: 6, row: 9, w: 1, h: 1 },
    facts: {
      food: "博多ラーメン、明太子、もつ鍋",
      spot: "太宰府天満宮、屋台街",
      trivia: "学問の神様がまつられる「太宰府天満宮（だざいふてんまんぐう）」や、おいしいグルメの屋台がたくさんあるよ。"
    }
  },
  {
    id: "saga",
    name: "佐賀",
    kana: "さが",
    capital: "佐賀",
    capitalKana: "さが",
    region: "kyushu",
    grid: { col: 5, row: 9, w: 1, h: 1 },
    facts: {
      food: "佐賀牛、呼子のイカ",
      spot: "吉野ヶ里遺跡、有田ポーセリンパーク",
      trivia: "弥生時代の大きな集落「吉野ヶ里（よしのがり）遺跡」があるよ。有田焼という焼き物も有名！"
    }
  },
  {
    id: "nagasaki",
    name: "長崎",
    kana: "ながさき",
    capital: "長崎",
    capitalKana: "ながさき",
    region: "kyushu",
    grid: { col: 4, row: 9, w: 1, h: 1 },
    facts: {
      food: "長崎ちゃんぽん、カステラ、佐世保バーガー",
      spot: "ハウステンボス、大浦天主堂、軍艦島",
      trivia: "日本で一番島が多い県だよ！オランダの街並みを再現した「ハウステンボス」があるよ。"
    }
  },
  {
    id: "kumamoto",
    name: "熊本",
    kana: "くまもと",
    capital: "熊本",
    capitalKana: "くまもと",
    region: "kyushu",
    grid: { col: 5, row: 10, w: 1, h: 1 },
    facts: {
      food: "馬刺し、いきなり団子、辛子レンコン",
      spot: "熊本城、阿蘇山",
      trivia: "大人気のゆるキャラ「くまモン」の県！世界最大級の火山「阿蘇山（あそさん）」があるよ。"
    }
  },
  {
    id: "oita",
    name: "大分",
    kana: "おおいた",
    capital: "大分",
    capitalKana: "おおいた",
    region: "kyushu",
    grid: { col: 6, row: 10, w: 1, h: 1 },
    facts: {
      food: "とり天、かぼす",
      spot: "別府温泉、由布院温泉、別府の地獄めぐり",
      trivia: "温泉の湧き出る量と源泉数が日本一で「おんせん県」と呼ばれるよ！別府や由布院が有名。"
    }
  },
  {
    id: "miyazaki",
    name: "宮崎",
    kana: "みやざき",
    capital: "宮崎",
    capitalKana: "みやざき",
    region: "kyushu",
    grid: { col: 6, row: 11, w: 1, h: 1 },
    facts: {
      food: "チキン南蛮、マンゴー、肉巻きおにぎり",
      spot: "高千穂峡、青島",
      trivia: "一年中あたたかく、南国の雰囲気が漂う県！マンゴーがとっても甘くて美味しいよ。"
    }
  },
  {
    id: "kagoshima",
    name: "鹿児島",
    kana: "かごしま",
    capital: "鹿児島",
    capitalKana: "かごしま",
    region: "kyushu",
    grid: { col: 5, row: 11, w: 1, h: 1 },
    facts: {
      food: "黒豚しゃぶしゃぶ、さつま揚げ、しろくま（かき氷）",
      spot: "桜島、屋久島（縄文杉）",
      trivia: "今も噴火を続ける活火山「桜島（さくらじま）」や、宇宙ロケットの打ち上げ基地があるよ。"
    }
  },
  {
    id: "okinawa",
    name: "沖縄",
    kana: "おきなわ",
    capital: "那覇",
    capitalKana: "なは",
    region: "kyushu",
    grid: { col: 3, row: 11, w: 1, h: 1 }, // 地図左下に少し離して配置
    facts: {
      food: "沖縄そば、ゴーヤチャンプルー、ちんすこう",
      spot: "美ら海水族館、首里城跡、万座毛",
      trivia: "日本で最も南西にある、一年中あたたかい島々。きれいな青い海と独特の歴史や文化があるよ。"
    }
  }
];

// 地方別の都道府県リストを取得するヘルパー
function getPrefecturesByRegion(regionId) {
  return prefectures.filter(p => p.region === regionId);
}
