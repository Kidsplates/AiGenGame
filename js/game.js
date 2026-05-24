/*
 * Copyright (c) 2026 Kidsplates/UsenVideoCallApp
 * Created: 2026-05-24
 * Description: SVG日本地図を使用したクイズ、パズル、図鑑のゲームロジックおよびステート管理
 */

const GameState = {
  currentMode: null, // 'quiz', 'puzzle', 'encyclopedia'
  settings: {
    sound: true,
    hiragana: false // ひらがなモード
  },
  
  // クイズ状態
  quiz: {
    currentQuestionIndex: 0,
    maxQuestions: 10,
    score: 0,
    currentPref: null,
    answered: false,
    questionsPool: [] // 出題用プール
  },
  
  // パズル状態
  puzzle: {
    selectedRegion: 'all', // 'all' または各地方ID
    placedCount: 0,
    totalCount: 0,
    activePieceId: null, // タップ選択用の一時保持
    mistakesCount: 0 // 今回のプレイでのミス数
  }
};

// 地図のロード状態
let isMapLoaded = false;

// --- 初期セットアップとヘルパー ---

// 表示形式の変換（ひらがなモード対応）
function getPrefName(pref) {
  return GameState.settings.hiragana ? pref.kana : (pref.name + "県");
}

// 固有名詞の整形（北海道や東京都、大阪府などのケア）
function formatPrefName(pref) {
  if (GameState.settings.hiragana) {
    return pref.kana;
  }
  if (pref.id === 'hokkaido') return '北海道';
  if (pref.id === 'tokyo') return '東京都';
  if (pref.id === 'kyoto' || pref.id === 'osaka') return pref.name + '府';
  return pref.name + '県';
}

function formatCapitalName(pref) {
  if (GameState.settings.hiragana) {
    return `${pref.capitalKana}（${pref.capitalKana}）`;
  }
  return `${pref.capital}（${pref.capitalKana}）`;
}

// 配列のシャッフル
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- 地図の描画・制御システム ---

// 地図SVGを読み込んで初期化する
function renderMap(callback) {
  const container = document.getElementById('map-container');
  
  if (isMapLoaded) {
    // 既にロード済みの場合は、ラベルのテキスト表記（ひらがな/漢字）だけ更新する
    setupInteractiveMap();
    if (callback) callback();
    return;
  }
  
  fetch('assets/images/japan_map.svg')
    .then(response => {
      if (!response.ok) {
        throw new Error('地図データの読み込みに失敗しました');
      }
      return response.text();
    })
    .then(svgText => {
      container.innerHTML = svgText;
      isMapLoaded = true;
      setupInteractiveMap();
      if (callback) callback();
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = '<p style="color:#5d4037; font-weight:bold; padding:20px; text-align:center;">ちずデータのよみこみにしっぱいしました。<br>ブラウザをさいよみこみしてください。</p>';
    });
}

// 専用のラベル配置レイヤーを取得または作成（他の土地の裏に潜るのを防ぐため最前面に配置）
function getLabelsLayer() {
  const parent = document.querySelector('.geolonia-svg-map .prefectures') || 
                 document.querySelector('.geolonia-svg-map .svg-map') || 
                 document.querySelector('.geolonia-svg-map');
  if (!parent) return null;
  
  let layer = parent.querySelector('#pref-labels-layer');
  if (!layer) {
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.id = 'pref-labels-layer';
    layer.setAttribute('style', 'pointer-events: none;'); // テキストがドラッグなどの操作を邪魔しないようにする
    parent.appendChild(layer);
  }
  return layer;
}

// 都道府県グループのtransform(translate)値をパースして取得する
function getGroupTranslate(group) {
  const transform = group.getAttribute('transform');
  if (transform) {
    const match = transform.match(/translate\(([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)\)/);
    if (match) {
      return {
        x: Number(match[1]),
        y: Number(match[2])
      };
    }
  }
  return { x: 0, y: 0 };
}

// SVG要素の中心座標を、その都道府県がもつ「最も大きな土地・島」の外接矩形の中心から計算する（離島によるズレを防ぐ）
function getGroupCenter(group) {
  let maxArea = -1;
  let bestCenter = { x: 0, y: 0 };
  
  // 個々のpolygonについて外接矩形を計算し、面積が最大のものを探す
  const polygons = group.querySelectorAll('polygon');
  polygons.forEach(poly => {
    const pointsStr = poly.getAttribute('points');
    if (pointsStr) {
      const coords = pointsStr.trim().split(/[\s,]+/).map(Number);
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      for (let i = 0; i < coords.length; i += 2) {
        const x = coords[i];
        const y = coords[i+1];
        if (!isNaN(x) && !isNaN(y)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      
      if (minX !== Infinity) {
        const width = maxX - minX;
        const height = maxY - minY;
        const area = width * height;
        if (area > maxArea) {
          maxArea = area;
          bestCenter = {
            x: minX + width / 2,
            y: minY + height / 2
          };
        }
      }
    }
  });
  
  // 個々のpathについて、サブパス(M/mでの区切り)ごとに外接矩形を計算し、面積が最大のものを探す（東京や北海道の離島対策）
  const paths = group.querySelectorAll('path');
  paths.forEach(path => {
    const d = path.getAttribute('d');
    if (d) {
      const subpaths = d.split(/[Mm]/);
      subpaths.forEach(subpath => {
        if (!subpath.trim()) return;
        
        const coords = subpath.match(/[-+]?[0-9]*\.?[0-9]+/g);
        if (coords) {
          const nums = coords.map(Number);
          let minX = Infinity, maxX = -Infinity;
          let minY = Infinity, maxY = -Infinity;
          
          for (let i = 0; i < nums.length; i += 2) {
            const x = nums[i];
            const y = nums[i+1];
            if (!isNaN(x) && !isNaN(y)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
          
          if (minX !== Infinity) {
            const width = maxX - minX;
            const height = maxY - minY;
            const area = width * height;
            if (area > maxArea) {
              maxArea = area;
              bestCenter = {
                x: minX + width / 2,
                y: minY + height / 2
              };
            }
          }
        }
      });
    }
  });
  
  if (maxArea <= 0) {
    try {
      const bbox = group.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        return {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2
        };
      }
    } catch (e) {}
    return { x: 0, y: 0 };
  }
  
  return bestCenter;
}

// SVG要素のインタラクティブ初期化
function setupInteractiveMap() {
  const prefGroups = document.querySelectorAll('#map-container g.prefecture');
  const layer = getLabelsLayer();
  
  prefGroups.forEach(group => {
    const prefId = group.className.baseVal.split(' ')[0];
    const prefData = prefectures.find(p => p.id === prefId);
    
    if (prefData) {
      group.id = 'map-pref-' + prefId;
      group.dataset.id = prefId;
      
      const regionColor = regions[prefData.region].color;
      group.style.setProperty('--pref-color', regionColor);
      
      const newGroup = group.cloneNode(true);
      group.parentNode.replaceChild(newGroup, group);
      
      newGroup.addEventListener('click', () => handleMapBlockClick(prefData));
      
      if (layer) {
        const oldLabel = layer.querySelector('.pref-label-' + prefId);
        if (oldLabel) oldLabel.remove();
      }
      
      const center = getGroupCenter(newGroup);
      const translate = getGroupTranslate(newGroup);
      
      let offsetX = 0;
      let offsetY = 0;
      
      if (prefId === 'tokyo') {
        offsetY = -5;
      } else if (prefId === 'nagasaki') {
        offsetX = 15;
        offsetY = 10;
      }
      
      if (layer) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', center.x + offsetX + translate.x);
        text.setAttribute('y', center.y + 4 + offsetY + translate.y);
        text.setAttribute('class', 'pref-label pref-label-' + prefId);
        text.textContent = GameState.settings.hiragana ? prefData.kana : prefData.name;
        layer.appendChild(text);
      }
      
      updateBlockTextVisibility(newGroup, prefData);
    }
  });
}

// 都道府県ラベルの表示切り替え制御
function updateBlockTextVisibility(group, prefData) {
  const layer = getLabelsLayer();
  if (!layer) return;
  
  const textElement = layer.querySelector('.pref-label-' + prefData.id);
  if (!textElement) return;
  
  let visible = true;
  
  if (GameState.currentMode === 'quiz') {
    visible = group.classList.contains('completed');
  } else if (GameState.currentMode === 'puzzle') {
    visible = group.classList.contains('completed') && !group.classList.contains('pref-slot');
  } else {
    visible = true;
  }
  
  textElement.style.display = visible ? 'block' : 'none';
}
function handleMapBlockClick(pref) {
  if (GameState.currentMode === 'encyclopedia') {
    showEncyclopediaDetail(pref);
    playTap();
  } else if (GameState.currentMode === 'puzzle') {
    if (GameState.puzzle.activePieceId) {
      const targetSlot = document.getElementById(`map-pref-${pref.id}`);
      if (targetSlot && targetSlot.classList.contains('pref-slot') && GameState.puzzle.activePieceId === pref.id) {
        placePuzzlePiece(pref.id);
      } else {
        // パズルで間違った場所をタップした場合
        playIncorrect();
        GameState.puzzle.mistakesCount++; // ミス数を増やす
        recordMistake(GameState.puzzle.activePieceId);
        highlightCorrectLocation(GameState.puzzle.activePieceId);
      }
    }
  }
}

// --- 1. ちずクイズモード ---

function startQuizMode(maxQuestionsCount) {
  GameState.currentMode = 'quiz';
  GameState.quiz.currentQuestionIndex = 0;
  GameState.quiz.score = 0;
  
  // 問題数の設定（指定があれば適用、無ければ既存設定）
  if (maxQuestionsCount) {
    if (maxQuestionsCount === 'all') {
      GameState.quiz.maxQuestions = prefectures.length;
    } else {
      GameState.quiz.maxQuestions = Number(maxQuestionsCount);
    }
  }
  
  // 出題プールの作成：全都道府県をシャッフル
  let pool = shuffleArray(prefectures);
  // 問題数がプール数を超える場合に対応（全問などでは超えないが、念のため拡張）
  while (pool.length < GameState.quiz.maxQuestions) {
    pool = pool.concat(shuffleArray(prefectures));
  }
  // 必要な問題数だけ切り出す
  GameState.quiz.questionsPool = pool.slice(0, GameState.quiz.maxQuestions);
  
  // クイズアクティブ表示（コントラスト向上）用のクラスをSVG地図に付与
  const svgMap = document.querySelector('.geolonia-svg-map');
  if (svgMap) {
    svgMap.classList.add('quiz-mode-active');
  }
  
  // 地図を初期状態（グレー）にする
  const prefGroups = document.querySelectorAll('#map-container g.prefecture');
  const layer = getLabelsLayer();
  prefGroups.forEach(group => {
    group.className.baseVal = `${group.className.baseVal.split(' ')[0]} prefecture`; // 状態クラスのクリア
    const prefId = group.id.replace('map-pref-', '');
    if (layer) {
      const text = layer.querySelector(`.pref-label-${prefId}`);
      if (text) text.style.display = 'none'; // テキストを非表示
    }
  });
  
  updateQuizUI();
  nextQuizQuestion();
}

function updateQuizUI() {
  const qIndex = GameState.quiz.currentQuestionIndex + 1;
  const maxQ = GameState.quiz.maxQuestions;
  
  // 最後の問題でカウントが上限を超えないようにクリップ
  const displayIndex = qIndex > maxQ ? maxQ : qIndex;
  
  document.getElementById('quiz-progress-text').innerText = `だい ${displayIndex} / ${maxQ} もん`;
  document.getElementById('quiz-score-text').innerText = `せいかい: ${GameState.quiz.score}`;
  document.getElementById('quiz-progress-bar').style.width = `${((displayIndex - 1) / maxQ) * 100}%`;
}

function nextQuizQuestion() {
  if (GameState.quiz.currentQuestionIndex >= GameState.quiz.maxQuestions) {
    showQuizResult();
    return;
  }
  
  GameState.quiz.answered = false;
  updateQuizUI();
  
  // 重複なくプールから問題を取得
  const correctPref = GameState.quiz.questionsPool[GameState.quiz.currentQuestionIndex];
  GameState.quiz.currentPref = correctPref;
  
  // 地図のハイライト表示切り替え
  const prefGroups = document.querySelectorAll('#map-container g.prefecture');
  prefGroups.forEach(group => {
    group.classList.remove('highlight');
    const prefId = group.id.replace('map-pref-', '');
    const prefData = prefectures.find(p => p.id === prefId);
    updateBlockTextVisibility(group, prefData);
  });
  
  const targetGroup = document.getElementById(`map-pref-${correctPref.id}`);
  if (targetGroup) {
    targetGroup.classList.add('highlight');
  }
  
  // 問題テキストの設定
  const qText = document.getElementById('quiz-question-text');
  const hText = document.getElementById('quiz-hint-text');
  
  qText.innerText = `光（ひか）っている都道府県（とどうふけん）の名前はなーんだ？`;
  
  const regionName = regions[correctPref.region].name;
  hText.innerText = `ヒント: ${regionName}地方にあるよ！`;
  
  // 選択肢の生成
  const choices = [correctPref];
  while (choices.length < 4) {
    const randomPref = prefectures[Math.floor(Math.random() * prefectures.length)];
    if (!choices.some(c => c.id === randomPref.id)) {
      choices.push(randomPref);
    }
  }
  
  const shuffledChoices = shuffleArray(choices);
  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';
  
  shuffledChoices.forEach(pref => {
    const btn = document.createElement('button');
    btn.className = 'wood-btn option-btn';
    btn.innerText = formatPrefName(pref);
    btn.addEventListener('click', () => handleQuizAnswer(pref));
    container.appendChild(btn);
  });
}

function handleQuizAnswer(selectedPref) {
  if (GameState.quiz.answered) return;
  GameState.quiz.answered = true;
  
  const correctPref = GameState.quiz.currentPref;
  const isCorrect = selectedPref.id === correctPref.id;
  
  const targetGroup = document.getElementById(`map-pref-${correctPref.id}`);
  if (targetGroup) {
    targetGroup.classList.remove('highlight');
  }
  
  const container = document.getElementById('quiz-options-container');
  const buttons = container.getElementsByTagName('button');
  
  for (let btn of buttons) {
    if (btn.innerText === formatPrefName(correctPref)) {
      btn.style.backgroundColor = '#95e1d3';
      btn.style.borderColor = 'var(--text-main)';
    } else if (btn.innerText === formatPrefName(selectedPref) && !isCorrect) {
      btn.style.backgroundColor = '#ff8e9e';
      btn.style.borderColor = 'var(--text-main)';
    }
  }
  
  if (isCorrect) {
    GameState.quiz.score++;
    if (targetGroup) {
      targetGroup.classList.add('completed');
      const layer = getLabelsLayer();
      const text = layer ? layer.querySelector(`.pref-label-${correctPref.id}`) : null;
      if (text) {
        text.style.display = 'block';
        text.textContent = GameState.settings.hiragana ? correctPref.kana : correctPref.name;
      }
    }
    playCorrect();
  } else {
    playIncorrect();
    recordMistake(correctPref.id);
    highlightCorrectLocation(correctPref.id);
  }
  
  setTimeout(() => {
    GameState.quiz.currentQuestionIndex++;
    nextQuizQuestion();
  }, 1500);
}

function showQuizResult() {
  playLevelUp();
  
  const overlay = document.getElementById('modal-result');
  const title = document.getElementById('result-title');
  const text = document.getElementById('result-text');
  const medal = document.getElementById('result-medal');
  const message = document.getElementById('result-message');
  
  const score = GameState.quiz.score;
  const maxQ = GameState.quiz.maxQuestions;
  text.innerText = `${maxQ}問中 ${score}問 正解したよ！`;
  
  const ratio = score / maxQ;
  
  if (score === maxQ) {
    title.innerText = "🏆 パーフェクト！";
    medal.innerText = "🥇";
    message.innerText = "すごすぎる！きみは完ぺきな地図マスターだ！";
  } else if (ratio >= 0.7) {
    title.innerText = "🎉 おめでとう！";
    medal.innerText = "🥈";
    message.innerText = "すばらしい！ほとんど覚えているね！";
  } else if (ratio >= 0.4) {
    title.innerText = "👍 がんばったね！";
    medal.innerText = "🥉";
    message.innerText = "いいぞ！くり返し遊んでもっと覚えよう！";
  } else {
    title.innerText = "🔥 つぎはがんばろう！";
    medal.innerText = "🌱";
    message.innerText = "図鑑（ずかん）で都道府県をチェックしてみてね！";
  }
  
  overlay.classList.add('active');
}

// --- 2. ちずパズルモード ---

function startPuzzleMode() {
  GameState.currentMode = 'puzzle';
  GameState.puzzle.placedCount = 0;
  GameState.puzzle.activePieceId = null;
  GameState.puzzle.mistakesCount = 0; // ミス数を初期化
  
  // クイズアクティブクラスの解除
  const svgMap = document.querySelector('.geolonia-svg-map');
  if (svgMap) {
    svgMap.classList.remove('quiz-mode-active');
  }
  
  renderPuzzleRegionSelector();
  loadPuzzleRegion('all');
}

function renderPuzzleRegionSelector() {
  const container = document.getElementById('puzzle-region-selector');
  container.innerHTML = '';
  
  const allBtn = document.createElement('button');
  allBtn.className = `wood-btn region-btn small ${GameState.puzzle.selectedRegion === 'all' ? 'primary' : ''}`;
  allBtn.innerText = "🌏 ぜんぶ";
  allBtn.addEventListener('click', () => {
    playTap();
    loadPuzzleRegion('all');
  });
  container.appendChild(allBtn);
  
  Object.keys(regions).forEach(regId => {
    const btn = document.createElement('button');
    btn.className = `wood-btn region-btn small ${GameState.puzzle.selectedRegion === regId ? 'primary' : ''}`;
    btn.innerText = regions[regId].name;
    btn.style.setProperty('--pref-color', regions[regId].color);
    btn.addEventListener('click', () => {
      playTap();
      loadPuzzleRegion(regId);
    });
    container.appendChild(btn);
  });
}

function loadPuzzleRegion(regionId) {
  GameState.puzzle.selectedRegion = regionId;
  GameState.puzzle.placedCount = 0;
  GameState.puzzle.activePieceId = null;
  GameState.puzzle.mistakesCount = 0; // ミス数を初期化
  
  const buttons = document.querySelectorAll('#puzzle-region-selector .region-btn');
  buttons.forEach(btn => btn.classList.remove('primary'));
  
  let targetPrefs = [];
  if (regionId === 'all') {
    targetPrefs = prefectures;
  } else {
    targetPrefs = prefectures.filter(p => p.region === regionId);
  }
  
  GameState.puzzle.totalCount = targetPrefs.length;
  updatePuzzleProgress();
  
  // 地図スロットの設定
  prefectures.forEach(pref => {
    let group = document.getElementById(`map-pref-${pref.id}`);
    if (group) {
      const isTarget = targetPrefs.some(p => p.id === pref.id);
      
      // クローンを作成して既存のイベントリスナーを完全に削除する
      const newGroup = group.cloneNode(true);
      group.parentNode.replaceChild(newGroup, group);
      group = newGroup; // 参照を更新
      
      // クラスとインラインスタイルのリセット
      group.className.baseVal = `${pref.id} prefecture`;
      group.style.opacity = '1';
      group.style.pointerEvents = 'auto';
      group.style.animation = '';
      
      // 地方ごとのカラーを再度設定（クローン時にリセットされる可能性があるため明示的に再設定）
      const regionColor = regions[pref.region].color;
      group.style.setProperty('--pref-color', regionColor);
      
      // 再びクリックハンドラを設定（図鑑やパズルのタップ用）
      group.addEventListener('click', () => handleMapBlockClick(pref));
      
      const layer = getLabelsLayer();
      if (layer) {
        const text = layer.querySelector(`.pref-label-${pref.id}`);
        if (text) text.style.display = 'none';
      }
      
      if (isTarget) {
        group.classList.add('pref-slot');
        
        // ドラッグ＆ドロップイベントの追加
        group.addEventListener('dragover', dragOver);
        group.addEventListener('dragleave', dragLeave);
        group.addEventListener('drop', (e) => dropPiece(e, pref.id));
      } else {
        // パズル対象外は半透明の暗いグレー
        group.style.opacity = '0.15';
        group.style.pointerEvents = 'none';
      }
    }
  });
  
  // トレイのピース配置
  const shuffledPrefs = shuffleArray(targetPrefs);
  const tray = document.getElementById('puzzle-tray');
  tray.innerHTML = '';
  
  shuffledPrefs.forEach(pref => {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.id = `piece-${pref.id}`;
    piece.dataset.id = pref.id;
    piece.innerText = formatPrefName(pref);
    piece.style.backgroundColor = regions[pref.region].color;
    
    piece.setAttribute('draggable', 'true');
    piece.addEventListener('dragstart', (e) => dragStart(e, pref.id));
    piece.addEventListener('click', () => selectPuzzlePiece(pref.id));
    
    // タッチ操作によるドラッグ＆ドロップの追加 (スマホ対応)
    setupTouchDrag(piece, pref.id);
    
    tray.appendChild(piece);
  });
  
  renderPuzzleRegionSelector();
}

function updatePuzzleProgress() {
  const placed = GameState.puzzle.placedCount;
  const total = GameState.puzzle.totalCount;
  document.getElementById('puzzle-progress-text').innerText = `はまったピース: ${placed} / ${total}`;
}

function selectPuzzlePiece(prefId) {
  const pieces = document.querySelectorAll('.puzzle-piece');
  pieces.forEach(p => {
    p.style.transform = 'translateY(0)';
    p.style.borderColor = 'var(--text-main)';
  });
  
  const selectedPiece = document.getElementById(`piece-${prefId}`);
  if (selectedPiece) {
    if (GameState.puzzle.activePieceId === prefId) {
      GameState.puzzle.activePieceId = null;
      playTap();
      // ガイド枠のリセット
      resetPuzzleSlotsHighlight();
    } else {
      GameState.puzzle.activePieceId = prefId;
      selectedPiece.style.transform = 'translateY(-6px)';
      selectedPiece.style.borderColor = '#ff3f34';
      playTap();
      
      // 地図の対応するターゲットスロットを光らせる
      prefectures.forEach(p => {
        const group = document.getElementById(`map-pref-${p.id}`);
        if (group && group.classList.contains('pref-slot')) {
          if (p.id === prefId) {
            group.classList.add('highlight');
          } else {
            group.classList.remove('highlight');
          }
        }
      });
    }
  }
}

function resetPuzzleSlotsHighlight() {
  const slots = document.querySelectorAll('#map-container g.pref-slot');
  slots.forEach(slot => slot.classList.remove('highlight'));
}

function dragStart(e, prefId) {
  e.dataTransfer.setData('text/plain', prefId);
  GameState.puzzle.activePieceId = prefId;
}

function dragOver(e) {
  e.preventDefault();
  const prefId = e.currentTarget.dataset.id;
  if (GameState.puzzle.activePieceId === prefId) {
    e.currentTarget.classList.add('drag-over');
  }
}

function dragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function dropPiece(e, targetPrefId) {
  e.preventDefault();
  const prefId = e.dataTransfer.getData('text/plain') || GameState.puzzle.activePieceId;
  
  if (prefId === targetPrefId) {
    placePuzzlePiece(prefId);
  } else {
    playIncorrect();
    GameState.puzzle.mistakesCount++; // ミス数を増やす
    if (prefId) {
      recordMistake(prefId);
      highlightCorrectLocation(prefId);
    }
  }
  
  const group = document.getElementById(`map-pref-${targetPrefId}`);
  if (group) {
    group.classList.remove('drag-over');
  }
}

// タッチドラッグ用イベントハンドラ（スマホ対応）
function setupTouchDrag(piece, prefId) {
  let touchClone = null;
  let startX = 0;
  let startY = 0;
  let lastTargetSlot = null;

  piece.addEventListener('touchstart', (e) => {
    // 既に他のピースを操作中なら無視
    if (GameState.puzzle.activePieceId && GameState.puzzle.activePieceId !== prefId) {
      return;
    }
    
    // スクロールなどのデフォルト挙動を妨げないようにしつつ、ドラッグを開始
    GameState.puzzle.activePieceId = prefId;
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    // ドラッグ中の見た目を作るためにクローンを生成
    touchClone = piece.cloneNode(true);
    touchClone.classList.add('touch-dragging');
    touchClone.style.position = 'fixed';
    touchClone.style.left = `${touch.clientX - piece.offsetWidth / 2}px`;
    touchClone.style.top = `${touch.clientY - piece.offsetHeight / 2}px`;
    touchClone.style.width = `${piece.offsetWidth}px`;
    touchClone.style.height = `${piece.offsetHeight}px`;
    touchClone.style.zIndex = '9999';
    touchClone.style.pointerEvents = 'none'; // touchmove中のelementFromPointを邪魔しないため
    touchClone.style.opacity = '0.9';
    touchClone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
    touchClone.style.transform = 'scale(1.1)';
    touchClone.style.transition = 'none';
    
    document.body.appendChild(touchClone);
    
    // トレイ内の元のピースを半透明にする
    piece.style.opacity = '0.4';
    
    // タップ選択のハイライトガイドを地図に出す
    prefectures.forEach(p => {
      const group = document.getElementById(`map-pref-${p.id}`);
      if (group && group.classList.contains('pref-slot')) {
        if (p.id === prefId) {
          group.classList.add('highlight');
        } else {
          group.classList.remove('highlight');
        }
      }
    });
  }, { passive: true });

  piece.addEventListener('touchmove', (e) => {
    if (!touchClone) return;
    
    const touch = e.touches[0];
    touchClone.style.left = `${touch.clientX - touchClone.offsetWidth / 2}px`;
    touchClone.style.top = `${touch.clientY - touchClone.offsetHeight / 2}px`;
    
    // 指の下にある要素を取得
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    // 最も近い g.prefecture を探す
    const group = element.closest('g.prefecture');
    
    // 前回のスロットの drag-over をクリア
    if (lastTargetSlot && lastTargetSlot !== group) {
      lastTargetSlot.classList.remove('drag-over');
      lastTargetSlot = null;
    }
    
    if (group && group.classList.contains('pref-slot')) {
      const targetPrefId = group.id.replace('map-pref-', '');
      if (prefId === targetPrefId) {
        group.classList.add('drag-over');
        lastTargetSlot = group;
      }
    }
  }, { passive: false });

  piece.addEventListener('touchend', (e) => {
    if (!touchClone) return;
    
    // クローンの位置からドロップ先を特定
    const rect = touchClone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 指が離された中心点にある要素を取得
    const element = document.elementFromPoint(centerX, centerY);
    let dropped = false;
    
    if (element) {
      const group = element.closest('g.prefecture');
      if (group && group.classList.contains('pref-slot')) {
        const targetPrefId = group.id.replace('map-pref-', '');
        
        // drag-overの解除
        group.classList.remove('drag-over');
        
        if (prefId === targetPrefId) {
          placePuzzlePiece(prefId);
          dropped = true;
        } else {
          playIncorrect();
          GameState.puzzle.mistakesCount++;
          recordMistake(prefId);
          highlightCorrectLocation(prefId);
        }
      }
    }
    
    // どこにもドロップされなかった（または間違いだった）場合、元のピース表示に戻す
    if (!dropped) {
      piece.style.opacity = '1';
      GameState.puzzle.activePieceId = null;
      // ガイド枠のリセット
      resetPuzzleSlotsHighlight();
    }
    
    // クローンのお片付け
    touchClone.remove();
    touchClone = null;
    lastTargetSlot = null;
  });
}

function placePuzzlePiece(prefId) {
  const pref = prefectures.find(p => p.id === prefId);
  const group = document.getElementById(`map-pref-${prefId}`);
  const piece = document.getElementById(`piece-${prefId}`);
  
  if (group && pref) {
    group.classList.remove('pref-slot');
    group.classList.remove('highlight');
    group.classList.add('completed');
    group.style.pointerEvents = 'auto';
    group.style.opacity = '1';
    
    const layer = getLabelsLayer();
    const text = layer ? layer.querySelector(`.pref-label-${prefId}`) : null;
    if (text) {
      text.style.display = 'block';
      text.textContent = GameState.settings.hiragana ? pref.kana : pref.name;
    }
    
    if (piece) piece.remove();
    
    GameState.puzzle.placedCount++;
    GameState.puzzle.activePieceId = null;
    updatePuzzleProgress();
    playSuccess();
    
    // アニメーション効果を適用
    group.style.animation = 'bounce 0.5s ease-out';
    setTimeout(() => { group.style.animation = ''; }, 600);
    
    if (GameState.puzzle.placedCount >= GameState.puzzle.totalCount) {
      setTimeout(showPuzzleResult, 600);
    }
  }
}

function showPuzzleResult() {
  playLevelUp();
  
  const overlay = document.getElementById('modal-result');
  const title = document.getElementById('result-title');
  const text = document.getElementById('result-text');
  const medal = document.getElementById('result-medal');
  const message = document.getElementById('result-message');
  
  const regId = GameState.puzzle.selectedRegion;
  const regionName = regId === 'all' ? '日本全国' : regions[regId].name;
  
  const mistakes = GameState.puzzle.mistakesCount;
  text.innerText = `${regionName}のパズルをかんせいさせたよ！\n(まちがえた回数: ${mistakes}回)`;
  
  if (mistakes === 0) {
    title.innerText = "🏆 パーフェクト！";
    medal.innerText = "🥇";
    message.innerText = "ノーミスでかんせい！きみはかんぺきなパズルマスターだ！";
  } else if (mistakes <= 3) {
    title.innerText = "🎉 クリア！おめでとう！";
    medal.innerText = "🥈";
    message.innerText = "すばらしい！すこしのまちがいだけで完成できたね！";
  } else {
    title.innerText = "👍 クリア！";
    medal.innerText = "🥉";
    message.innerText = "よくがんばったね！くり返しあそんで、もっとおぼえよう！";
  }
  
  overlay.classList.add('active');
}

// --- 3. 都道府県図鑑モード ---

function startEncyclopediaMode() {
  GameState.currentMode = 'encyclopedia';
  
  // クイズアクティブクラスの解除
  const svgMap = document.querySelector('.geolonia-svg-map');
  if (svgMap) {
    svgMap.classList.remove('quiz-mode-active');
  }
  
  // 地図の全ブロックを元の地方の色に戻す
  const prefGroups = document.querySelectorAll('#map-container g.prefecture');
  const layer = getLabelsLayer();
  prefGroups.forEach(group => {
    group.className.baseVal = `${group.className.baseVal.split(' ')[0]} prefecture completed`; // completedを付加して全色塗り
    group.style.opacity = '1';
    group.style.pointerEvents = 'auto';
    
    const prefId = group.id.replace('map-pref-', '');
    const prefData = prefectures.find(p => p.id === prefId);
    if (prefData && layer) {
      const text = layer.querySelector(`.pref-label-${prefData.id}`);
      if (text) {
        text.style.display = 'block';
        text.textContent = GameState.settings.hiragana ? prefData.kana : prefData.name;
      }
    }
  });
  
  document.getElementById('encyclopedia-placeholder').style.display = 'flex';
  document.getElementById('encyclopedia-details').style.display = 'none';
}

function showEncyclopediaDetail(pref) {
  document.getElementById('encyclopedia-placeholder').style.display = 'none';
  const detailEl = document.getElementById('encyclopedia-details');
  detailEl.style.display = 'flex';
  
  document.getElementById('detail-kana').innerText = pref.kana;
  document.getElementById('detail-name').innerText = formatPrefName(pref);
  
  const reg = regions[pref.region];
  const badge = document.getElementById('detail-region');
  badge.innerText = reg.name + "地方";
  badge.style.backgroundColor = reg.color;
  
  document.getElementById('detail-capital').innerText = formatCapitalName(pref);
  document.getElementById('detail-food').innerText = pref.facts.food;
  document.getElementById('detail-spot').innerText = pref.facts.spot;
  document.getElementById('detail-trivia').innerText = pref.facts.trivia;
  
  const imgEl = document.getElementById('detail-illustration');
  imgEl.src = `assets/images/pref_${pref.id}.png`;
  imgEl.alt = pref.name + "のイラスト";
  
  imgEl.onerror = function() {
    this.src = 'assets/images/default_fact.png';
  };
  
  // 地図上の強調表示切り替え
  const prefGroups = document.querySelectorAll('#map-container g.prefecture');
  prefGroups.forEach(group => {
    const polygon = group.querySelector('polygon') || group.querySelector('path');
    if (polygon) {
      if (group.id === `map-pref-${pref.id}`) {
        polygon.style.stroke = '#ff3f34';
        polygon.style.strokeWidth = '2.5px';
      } else {
        polygon.style.stroke = 'var(--text-main)';
        polygon.style.strokeWidth = '1.2px';
      }
    }
  });
}

// --- 4. 苦手リスト＆ミスハイライトシステム ---

// 間違いの記録
function recordMistake(prefId) {
  if (!prefId) return;
  try {
    const mistakesStr = localStorage.getItem('pref_mistakes');
    let mistakes = mistakesStr ? JSON.parse(mistakesStr) : {};
    mistakes[prefId] = (mistakes[prefId] || 0) + 1;
    localStorage.setItem('pref_mistakes', JSON.stringify(mistakes));
  } catch (e) {
    console.error("Failed to record mistake in localStorage:", e);
  }
}

// 正解位置の一時赤ハイライト
function highlightCorrectLocation(prefId) {
  const targetGroup = document.getElementById(`map-pref-${prefId}`);
  if (targetGroup) {
    targetGroup.classList.remove('highlight-error');
    void targetGroup.offsetWidth; // 強制リフローによるアニメーションの再起動
    targetGroup.classList.add('highlight-error');
    
    setTimeout(() => {
      targetGroup.classList.remove('highlight-error');
    }, 1500);
  }
}

// 苦手リストの描画
function showMistakesList() {
  const container = document.getElementById('mistakes-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  try {
    const mistakesStr = localStorage.getItem('pref_mistakes');
    const mistakes = mistakesStr ? JSON.parse(mistakesStr) : {};
    
    const sortedMistakes = Object.entries(mistakes)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
      
    if (sortedMistakes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-light); font-weight: bold;">
          まだ まちがえた都道府県はありません！<br>クイズやパズルに チャレンジしてみてね！
        </div>
      `;
      return;
    }
    
    sortedMistakes.forEach(([prefId, count]) => {
      const pref = prefectures.find(p => p.id === prefId);
      if (!pref) return;
      
      const item = document.createElement('div');
      item.className = 'mistake-item';
      
      const regColor = regions[pref.region].color;
      
      item.innerHTML = `
        <div class="mistake-info">
          <span class="mistake-name" style="border-left: 5px solid ${regColor}; padding-left: 8px;">
            ${formatPrefName(pref)} (${regions[pref.region].name})
          </span>
          <span class="mistake-count">⚠️ まちがえた回数: ${count}回</span>
        </div>
        <div class="mistake-actions">
          <button class="wood-btn small primary btn-go-encyclopedia" data-id="${prefId}">
            🔍 ずかんでしらべる
          </button>
        </div>
      `;
      
      container.appendChild(item);
    });
    
    // 「ずかんで調べる」ボタンのイベントリスナーを設定
    const buttons = container.querySelectorAll('.btn-go-encyclopedia');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prefId = e.currentTarget.dataset.id;
        const pref = prefectures.find(p => p.id === prefId);
        if (pref) {
          playTap();
          const modal = document.getElementById('modal-mistakes');
          if (modal) modal.classList.remove('active');
          navigateToEncyclopedia(pref);
        }
      });
    });
    
  } catch (e) {
    console.error("Failed to load or render mistakes list:", e);
  }
}

// 図鑑モードへのナビゲーションと該当県フォーカス
function navigateToEncyclopedia(pref) {
  // タイトル画面を非アクティブに
  const titleScreen = document.getElementById('title-screen');
  if (titleScreen) titleScreen.classList.remove('active');
  
  // ゲーム画面をアクティブに
  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.add('active');
  
  // もどるボタンを表示
  const backHomeBtn = document.getElementById('btn-back-home');
  if (backHomeBtn) backHomeBtn.style.display = 'flex';
  
  // UIパネルの表示切り替え
  const quizUI = document.getElementById('quiz-ui');
  const puzzleUI = document.getElementById('puzzle-ui');
  const encyclopediaUI = document.getElementById('encyclopedia-ui');
  
  if (quizUI) quizUI.style.display = 'none';
  if (puzzleUI) puzzleUI.style.display = 'none';
  if (encyclopediaUI) encyclopediaUI.style.display = 'block';
  
  // 図鑑モードを初期化して、該当都道府県を表示
  renderMap(() => {
    startEncyclopediaMode();
    showEncyclopediaDetail(pref);
  });
}
