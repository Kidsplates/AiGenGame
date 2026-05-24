/*
 * Copyright (c) 2026 Kidsplates/UsenVideoCallApp
 * Created: 2026-05-24
 * Description: アプリケーション全体の制御、画面遷移、設定、初期化イベント
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素の取得 ---
  const screens = {
    title: document.getElementById('title-screen'),
    game: document.getElementById('game-screen')
  };
  
  const panels = {
    quiz: document.getElementById('quiz-ui'),
    puzzle: document.getElementById('puzzle-ui'),
    encyclopedia: document.getElementById('encyclopedia-ui')
  };
  
  const buttons = {
    startQuiz: document.getElementById('btn-start-quiz'),
    startPuzzle: document.getElementById('btn-start-puzzle'),
    startEncyclopedia: document.getElementById('btn-start-encyclopedia'),
    backHome: document.getElementById('btn-back-home'),
    logoHome: document.getElementById('btn-home-logo'),
    settingsOpen: document.getElementById('btn-settings-open'),
    settingsClose: document.getElementById('btn-settings-close'),
    resultClose: document.getElementById('btn-result-close')
  };
  
  const modals = {
    settings: document.getElementById('modal-settings'),
    result: document.getElementById('modal-result'),
    quizStart: document.getElementById('modal-quiz-start')
  };
  
  const settingsInputs = {
    sound: document.getElementById('setting-sound'),
    hiragana: document.getElementById('setting-hiragana')
  };

  // --- 初期化 ---
  // 設定の初期値を反映
  GameState.settings.sound = settingsInputs.sound.checked;
  GameState.settings.hiragana = settingsInputs.hiragana.checked;

  // 地図のレンダリング（初期ロード）
  renderMap();

  // --- 画面遷移関数 ---
  function switchScreen(screenName, gameMode = null, quizCount = null) {
    playTap();
    
    // 全画面を非アクティブに
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    
    if (screenName === 'title') {
      screens.title.classList.add('active');
      buttons.backHome.style.display = 'none';
      GameState.currentMode = null;
      
      // クイズアクティブクラスの解除
      const svgMap = document.querySelector('.geolonia-svg-map');
      if (svgMap) {
        svgMap.classList.remove('quiz-mode-active');
      }
    } else if (screenName === 'game') {
      screens.game.classList.add('active');
      buttons.backHome.style.display = 'flex';
      
      // ゲームパネルの表示切り替え
      Object.keys(panels).forEach(key => {
        panels[key].style.display = key === gameMode ? 'block' : 'none';
      });
      
      // 地図のロード完了を待ってからモードに応じた開始ロジックを実行
      renderMap(() => {
        if (gameMode === 'quiz') {
          startQuizMode(quizCount);
        } else if (gameMode === 'puzzle') {
          startPuzzleMode();
        } else if (gameMode === 'encyclopedia') {
          startEncyclopediaMode();
        }
      });
    }
  }

  // --- イベントリスナーの登録 ---
  
  // タイトルメニューボタン
  buttons.startQuiz.addEventListener('click', () => {
    playTap();
    modals.quizStart.classList.add('active'); // 直接画面遷移せず、問題数選択モーダルを開く
  });
  
  buttons.startPuzzle.addEventListener('click', () => {
    switchScreen('game', 'puzzle');
  });
  
  buttons.startEncyclopedia.addEventListener('click', () => {
    switchScreen('game', 'encyclopedia');
  });

  // ホームに戻るボタン
  buttons.backHome.addEventListener('click', () => {
    switchScreen('title');
  });
  
  buttons.logoHome.addEventListener('click', () => {
    switchScreen('title');
  });

  // 設定モーダルの開閉
  buttons.settingsOpen.addEventListener('click', () => {
    playTap();
    modals.settings.classList.add('active');
  });
  
  buttons.settingsClose.addEventListener('click', () => {
    playTap();
    modals.settings.classList.remove('active');
  });
  
  // 設定変更時の同期
  settingsInputs.sound.addEventListener('change', (e) => {
    GameState.settings.sound = e.target.checked;
    if (typeof setMute === 'function') {
      setMute(!e.target.checked);
    }
    playTap();
  });
  
  settingsInputs.hiragana.addEventListener('change', (e) => {
    GameState.settings.hiragana = e.target.checked;
    playTap();
    
    // 表記変更があったので地図や現在の画面を再レンダリングする
    renderMap(() => {
      if (GameState.currentMode === 'quiz') {
        // クイズ中は、問題文や選択肢の表記を再更新
        nextQuizQuestion();
      } else if (GameState.currentMode === 'puzzle') {
        // パズル中は、現在の地方のピース情報をリロード
        loadPuzzleRegion(GameState.puzzle.selectedRegion);
      } else if (GameState.currentMode === 'encyclopedia') {
        // 図鑑モードは、リセットして再開
        startEncyclopediaMode();
      }
    });
  });

  // 結果モーダルを閉じる
  buttons.resultClose.addEventListener('click', () => {
    playTap();
    modals.result.classList.remove('active');
    
    // 再プレイ処理
    if (GameState.currentMode === 'quiz') {
      startQuizMode();
    } else if (GameState.currentMode === 'puzzle') {
      loadPuzzleRegion(GameState.puzzle.selectedRegion);
    }
  });
  
  // モーダルの背景クリックで閉じる処理
  modals.settings.addEventListener('click', (e) => {
    if (e.target === modals.settings) {
      modals.settings.classList.remove('active');
      playTap();
    }
  });

  // --- にがてリストモーダルの開閉とリセット ---
  const modalMistakes = document.getElementById('modal-mistakes');
  const btnOpenMistakes = document.getElementById('btn-open-mistakes');
  const btnCloseMistakes = document.getElementById('btn-mistakes-close');
  const btnClearMistakes = document.getElementById('btn-clear-mistakes');

  if (btnOpenMistakes && modalMistakes) {
    btnOpenMistakes.addEventListener('click', () => {
      playTap();
      if (typeof showMistakesList === 'function') {
        showMistakesList();
      }
      modalMistakes.classList.add('active');
    });
  }

  if (btnCloseMistakes && modalMistakes) {
    btnCloseMistakes.addEventListener('click', () => {
      playTap();
      modalMistakes.classList.remove('active');
    });
  }

  if (btnClearMistakes && modalMistakes) {
    btnClearMistakes.addEventListener('click', () => {
      playTap();
      if (confirm('にがてリストをリセットしますか？')) {
        localStorage.removeItem('pref_mistakes');
        if (typeof showMistakesList === 'function') {
          showMistakesList();
        }
      }
    });
  }

  if (modalMistakes) {
    modalMistakes.addEventListener('click', (e) => {
      if (e.target === modalMistakes) {
        modalMistakes.classList.remove('active');
        playTap();
      }
    });
  }

  // クイズ問題数選択モーダルのイベント
  const btnQuizCounts = document.querySelectorAll('.btn-quiz-count');
  btnQuizCounts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const count = e.currentTarget.dataset.count;
      modals.quizStart.classList.remove('active');
      switchScreen('game', 'quiz', count);
    });
  });
  
  const btnQuizStartCancel = document.getElementById('btn-quiz-start-cancel');
  if (btnQuizStartCancel) {
    btnQuizStartCancel.addEventListener('click', () => {
      playTap();
      modals.quizStart.classList.remove('active');
    });
  }

  modals.quizStart.addEventListener('click', (e) => {
    if (e.target === modals.quizStart) {
      modals.quizStart.classList.remove('active');
      playTap();
    }
  });

  // 起動時のタッチ操作によるAudioContext有効化用（モバイル対応）
  document.body.addEventListener('touchstart', () => {
    if (typeof initAudio === 'function') {
      initAudio();
    }
  }, { once: true });

  // スマホ用地図ズーム切り替えボタン
  const btnZoomToggle = document.getElementById('btn-zoom-toggle');
  const mapSection = document.getElementById('map-section');
  if (btnZoomToggle && mapSection) {
    btnZoomToggle.addEventListener('click', () => {
      playTap();
      const isZoomed = mapSection.classList.toggle('zoomed');
      btnZoomToggle.innerText = isZoomed ? '🔍⁻' : '🔍⁺';
    });
  }

  // --- フローティングUIのドラッグ移動機能 ---
  setupDraggableUI();

  // --- 地図のドラッグスクロール機能 ---
  setupMapDragScroll();

  function setupMapDragScroll() {
    const mapSection = document.getElementById('map-section');
    if (!mapSection) return;
    
    let isDown = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;
    
    mapSection.style.cursor = 'grab';
    
    mapSection.addEventListener('mousedown', (e) => {
      // 操作パネルやパズルピースのドラッグ時は除外
      if (e.target.closest('#floating-control-section') || e.target.closest('.puzzle-piece')) return;
      
      isDown = true;
      mapSection.style.cursor = 'grabbing';
      
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = window.scrollX || window.pageXOffset;
      scrollTop = window.scrollY || window.pageYOffset;
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault(); // テキスト選択などを防止
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      window.scrollTo(scrollLeft - dx, scrollTop - dy);
    });
    
    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        mapSection.style.cursor = 'grab';
      }
    });

    window.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        mapSection.style.cursor = 'grab';
      }
    });
  }

  function setupDraggableUI() {
    const panel = document.getElementById('floating-control-section');
    if (!panel) return;
    
    let active = false;
    let currentX = 0;
    let currentY = 0;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // イベント委譲を利用して、パネル内の .panel-title (ヘッダー) からドラッグを開始する
    panel.addEventListener('mousedown', dragStart);
    panel.addEventListener('touchstart', dragStart, { passive: true });
    
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
    
    function dragStart(e) {
      // クリックしたターゲットまたはその親が .panel-title である場合のみドラッグ可能
      const titleElement = e.target.closest('.panel-title');
      if (!titleElement) return;
      
      let clientX, clientY;
      if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      active = true;
      initialX = clientX - xOffset;
      initialY = clientY - yOffset;
    }
    
    function drag(e) {
      if (!active) return;
      
      let clientX, clientY;
      if (e.type === 'touchmove') {
        e.preventDefault(); // ドラッグ中の余計なスクロールを抑止
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      currentX = clientX - initialX;
      currentY = clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      setTranslate(currentX, currentY, panel);
    }
    
    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
    
    function dragEnd() {
      active = false;
    }
  }
});
