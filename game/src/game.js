// Mirror Mystery — game logic.
//
// Owns the screens (title / play / level-done / game-done / time-up), the
// click hit-testing against each level's differences, the countdown timer,
// hints, scoring and the streak bonus. Demo modes (?demo=cover, ?demo=one,
// ?demo=win, ?level=N) stage real game states for screenshots.

import { LEVELS, SCORE } from './levels.js';
import { sound } from './sound.js';

const $ = (id) => document.getElementById(id);

const SCREENS = ['title-screen', 'play-screen', 'level-done-screen', 'game-done-screen', 'timeup-screen'];

export class Game {
  constructor() {
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.levelScore = 0;
    this.hintsLeft = SCORE.hintsPerLevel;
    this.timeLeftMs = 0;
    this.timerId = null;
    this.lastFindAt = 0;
    this.streak = 0;
    this.lastTickSecond = -1;
    this.playing = false;
    this.hintMark = null;
    this.bindControls();
    this.renderLevelCards();
  }

  // ---------- screens ----------

  showScreen(id) {
    // The three end-state screens are overlays: they sit on top of the play
    // screen so the finished board stays visible behind them.
    const overlays = ['level-done-screen', 'game-done-screen', 'timeup-screen'];
    const isOverlay = overlays.includes(id);
    for (const s of SCREENS) {
      if (s === id) $(s).classList.remove('hidden');
      else if (s === 'play-screen' && isOverlay) $(s).classList.remove('hidden');
      else $(s).classList.add('hidden');
    }
  }

  showTitle() {
    this.stopTimer();
    this.playing = false;
    this.showScreen('title-screen');
  }

  // ---------- level select ----------

  renderLevelCards() {
    const wrap = $('level-cards');
    wrap.innerHTML = '';
    LEVELS.forEach((level, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'level-card';
      card.innerHTML =
        `<img src="${level.imgA}" alt="${level.name} scene">` +
        `<span class="lc-body"><span style="display:block"><h3 style="display:inline">${level.id}. ${level.name}</h3></span>` +
        `<p>${level.blurb}</p>` +
        `<span class="lc-meta">6 DIFFERENCES &middot; ${Math.floor(level.timeLimit / 60)}:${String(level.timeLimit % 60).padStart(2, '0')} ON THE CLOCK</span></span>`;
      card.addEventListener('click', () => {
        sound.unlock();
        sound.click();
        this.startLevel(i);
      });
      wrap.appendChild(card);
    });
  }

  // ---------- starting and finishing a level ----------

  startLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index];
    this.found = new Set();
    this.levelScore = 0;
    this.hintsLeft = SCORE.hintsPerLevel;
    this.streak = 0;
    this.lastFindAt = 0;
    this.lastTickSecond = -1;
    this.timeLeftMs = level.timeLimit * 1000;
    this.clearMarks();
    this.clearHint();
    $('img-a').src = level.imgA;
    $('img-b').src = level.imgB;
    $('hud-level').textContent = `${level.id} · ${level.name}`;
    $('hint-btn').disabled = false;
    this.updateHud();
    this.setToast('');
    this.showScreen('play-screen');
    this.playing = true;
    this.startTimer();
  }

  finishLevel() {
    this.stopTimer();
    this.playing = false;
    const level = LEVELS[this.levelIndex];
    const secondsLeft = Math.max(0, Math.ceil(this.timeLeftMs / 1000));
    const timeBonus = secondsLeft * 5;
    this.levelScore += timeBonus;
    this.score += timeBonus;
    sound.win();
    this.updateHud(); // HUD behind the overlay shows the final 6/6 and score
    $('level-done-title').textContent = `Level ${level.id} complete!`;
    $('level-done-detail').textContent =
      `You found all 6 differences in ${level.name} with ${this.formatTime(secondsLeft)} to spare — ` +
      `time bonus +${timeBonus} points.`;
    $('level-done-score').textContent = this.levelScore;
    $('next-btn').textContent = this.levelIndex + 1 < LEVELS.length ? 'Next level ›' : 'See final score ›';
    this.showScreen('level-done-screen');
  }

  finishGame() {
    $('game-done-score').textContent = this.score;
    const grade =
      this.score >= 3000 ? 'Eagle Eye! Nothing escapes you.' :
      this.score >= 2000 ? 'Sharp Detective — a keen pair of eyes.' :
      'Rookie Sleuth — the next case will be easier.';
    $('game-done-grade').textContent = grade;
    this.showScreen('game-done-screen');
  }

  timeUp() {
    this.stopTimer();
    this.playing = false;
    sound.lose();
    const level = LEVELS[this.levelIndex];
    $('timeup-detail').textContent =
      `The clock ran out on ${level.name} with ${this.found.size} of ${level.differences.length} differences found.`;
    this.showScreen('timeup-screen');
  }

  // ---------- timer ----------

  startTimer() {
    this.stopTimer();
    this.timerId = setInterval(() => this.tickTimer(), 100);
  }

  stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tickTimer() {
    this.timeLeftMs -= 100;
    if (this.timeLeftMs <= 0) {
      this.timeLeftMs = 0;
      this.updateHud();
      this.timeUp();
      return;
    }
    const seconds = Math.ceil(this.timeLeftMs / 1000);
    if (seconds <= 10 && seconds !== this.lastTickSecond) {
      this.lastTickSecond = seconds;
      sound.tick();
    }
    this.updateHud();
  }

  formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ---------- clicks ----------

  onBoardClick(event) {
    if (!this.playing) return;
    sound.unlock();
    const wrap = event.currentTarget;
    const rect = wrap.getBoundingClientRect();
    const fx = (event.clientX - rect.left) / rect.width;
    const fy = (event.clientY - rect.top) / rect.height;
    const level = LEVELS[this.levelIndex];
    const aspect = rect.height / rect.width; // keep hit zones circular on screen

    for (let i = 0; i < level.differences.length; i++) {
      if (this.found.has(i)) continue;
      const d = level.differences[i];
      const dx = fx - d.x;
      const dy = (fy - d.y) * aspect;
      if (dx * dx + dy * dy <= d.r * d.r) {
        this.registerFind(i);
        return;
      }
    }
    this.registerMiss(wrap, fx, fy);
  }

  registerFind(i) {
    const level = LEVELS[this.levelIndex];
    this.found.add(i);
    const d = level.differences[i];
    this.placeMark('marks-a', d);
    this.placeMark('marks-b', d);
    const nowMs = performance.now();
    this.streak = nowMs - this.lastFindAt <= SCORE.streakWindowMs ? this.streak + 1 : 1;
    this.lastFindAt = nowMs;
    const bonus = (this.streak - 1) * SCORE.streakBonus;
    const gained = SCORE.find + bonus;
    this.levelScore += gained;
    this.score += gained;
    sound.found();
    this.setToast(
      bonus > 0
        ? `Found it — ${d.label}! +${gained} (streak x${this.streak})`
        : `Found it — ${d.label}! +${gained}`,
    );
    this.updateHud();
    if (this.found.size === level.differences.length) {
      setTimeout(() => this.finishLevel(), 650);
    }
  }

  registerMiss(wrap, fx, fy) {
    this.timeLeftMs = Math.max(0, this.timeLeftMs - SCORE.missTimePenalty * 1000);
    this.streak = 0;
    sound.miss();
    const marks = wrap.querySelector('.marks');
    const miss = document.createElement('div');
    miss.className = 'miss';
    miss.style.left = `${fx * 100}%`;
    miss.style.top = `${fy * 100}%`;
    marks.appendChild(miss);
    setTimeout(() => miss.remove(), 750);
    wrap.classList.remove('shake');
    void wrap.offsetWidth; // restart the shake animation
    wrap.classList.add('shake');
    this.setToast(`Not quite — minus ${SCORE.missTimePenalty} seconds.`);
    this.updateHud();
    if (this.timeLeftMs <= 0) this.timeUp();
  }

  // ---------- markers ----------

  placeMark(containerId, d) {
    const mark = document.createElement('div');
    mark.className = 'mark';
    mark.style.left = `${d.x * 100}%`;
    mark.style.top = `${d.y * 100}%`;
    mark.style.width = `${d.r * 2 * 100}%`;
    mark.style.aspectRatio = '1 / 1';
    $(containerId).appendChild(mark);
  }

  clearMarks() {
    $('marks-a').innerHTML = '';
    $('marks-b').innerHTML = '';
  }

  // ---------- hints ----------

  useHint() {
    if (!this.playing || this.hintsLeft <= 0) return;
    const level = LEVELS[this.levelIndex];
    const remaining = level.differences.map((_, i) => i).filter((i) => !this.found.has(i));
    if (remaining.length === 0) return;
    this.hintsLeft--;
    // Charge the full cost even when the score is still zero: the debt is
    // real and the next finds pay it off. Only the displayed score is
    // floored at zero (see updateHud), never the ledger itself.
    this.score -= SCORE.hintCost;
    this.levelScore -= SCORE.hintCost;
    sound.hint();
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    const d = level.differences[pick];
    this.clearHint();
    for (const id of ['marks-a', 'marks-b']) {
      const ring = document.createElement('div');
      ring.className = 'hint-mark';
      ring.style.left = `${d.x * 100}%`;
      ring.style.top = `${d.y * 100}%`;
      ring.style.width = `${d.r * 2 * 100}%`;
      ring.style.aspectRatio = '1 / 1';
      $(id).appendChild(ring);
      (this.hintMark ??= []).push(ring);
    }
    setTimeout(() => this.clearHint(), 2200);
    this.setToast(`Hint: look over here… (−${SCORE.hintCost} points, ${this.hintsLeft} left)`);
    this.updateHud();
  }

  clearHint() {
    if (this.hintMark) {
      for (const el of this.hintMark) el.remove();
      this.hintMark = null;
    }
  }

  // ---------- HUD ----------

  updateHud() {
    const level = LEVELS[this.levelIndex];
    const total = level.differences.length;
    $('hud-found').textContent = `${this.found.size} / ${total}`;
    $('hud-left').textContent = `${total - this.found.size} left`;
    const seconds = Math.ceil(this.timeLeftMs / 1000);
    $('hud-time').textContent = this.formatTime(seconds);
    const fill = $('timer-fill');
    const ratio = this.timeLeftMs / (level.timeLimit * 1000);
    fill.style.width = `${Math.max(0, ratio * 100)}%`;
    fill.classList.toggle('warn', seconds <= 30 && seconds > 15);
    fill.classList.toggle('danger', seconds <= 15);
    $('hud-time').classList.toggle('danger', seconds <= 15);
    $('hud-score').textContent = Math.max(0, this.score);
    $('hud-streak').textContent = this.streak >= 2 ? `Streak x${this.streak}` : '';
    $('hint-btn').textContent = `Hint (${this.hintsLeft})`;
    $('hint-btn').disabled = this.hintsLeft <= 0;
  }

  setToast(text) {
    $('toast').textContent = text;
  }

  // ---------- controls ----------

  bindControls() {
    document.querySelector('#board-a .pic-wrap').addEventListener('click', (e) => this.onBoardClick(e));
    document.querySelector('#board-b .pic-wrap').addEventListener('click', (e) => this.onBoardClick(e));
    $('hint-btn').addEventListener('click', () => this.useHint());
    $('restart-btn').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('menu-btn').addEventListener('click', () => this.showTitle());
    $('sound-btn').addEventListener('click', () => {
      sound.setEnabled(!sound.enabled);
      $('sound-btn').textContent = `Sound: ${sound.enabled ? 'on' : 'off'}`;
      if (sound.enabled) sound.click();
    });
    $('replay-btn').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('next-btn').addEventListener('click', () => {
      if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
      else this.finishGame();
    });
    $('again-btn').addEventListener('click', () => {
      this.score = 0;
      this.startLevel(0);
    });
    $('again-menu-btn').addEventListener('click', () => this.showTitle());
    $('timeup-retry-btn').addEventListener('click', () => this.startLevel(this.levelIndex));
    $('timeup-menu-btn').addEventListener('click', () => this.showTitle());
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  onKey(e) {
    if (e.key === 'h' || e.key === 'H') {
      if (this.playing) this.useHint();
    } else if (e.key === 'r' || e.key === 'R') {
      if (this.playing) this.startLevel(this.levelIndex);
    } else if (e.key === 'Enter') {
      if (!$('title-screen').classList.contains('hidden')) {
        sound.unlock();
        this.startLevel(0);
      } else if (!$('level-done-screen').classList.contains('hidden')) {
        $('next-btn').click();
      } else if (!$('game-done-screen').classList.contains('hidden')) {
        $('again-btn').click();
      } else if (!$('timeup-screen').classList.contains('hidden')) {
        $('timeup-retry-btn').click();
      }
    } else if (e.key === 'Escape') {
      this.showTitle();
    }
  }

  // ---------- demo modes (real game states, for screenshots) ----------

  applyDemo() {
    const params = new URLSearchParams(window.location.search);
    const levelParam = parseInt(params.get('level') || '1', 10);
    const levelIndex = Number.isInteger(levelParam) && levelParam >= 1 && levelParam <= LEVELS.length
      ? levelParam - 1
      : 0;
    const demo = params.get('demo') || '';
    if (!demo && !params.has('level')) return; // plain title screen
    this.startLevel(levelIndex);
    if (demo === 'cover' || demo === 'one') {
      // Pre-find a couple of differences so the shot shows markers, a live
      // counter and several differences still unfound.
      const count = demo === 'cover' ? 2 : 1;
      const picks = demo === 'cover' ? [0, 3] : [1];
      for (let k = 0; k < count; k++) {
        const i = picks[k];
        this.found.add(i);
        this.placeMark('marks-a', LEVELS[levelIndex].differences[i]);
        this.placeMark('marks-b', LEVELS[levelIndex].differences[i]);
      }
      this.levelScore = SCORE.find * count;
      this.score = this.levelScore;
      this.setToast(count === 1 ? 'One down — keep hunting!' : 'Two down — keep hunting!');
      this.updateHud();
    } else if (demo === 'win') {
      for (let i = 0; i < LEVELS[levelIndex].differences.length; i++) {
        this.found.add(i);
        this.placeMark('marks-a', LEVELS[levelIndex].differences[i]);
        this.placeMark('marks-b', LEVELS[levelIndex].differences[i]);
      }
      this.levelScore = SCORE.find * LEVELS[levelIndex].differences.length;
      this.score = this.levelScore;
      this.finishLevel();
    }
  }
}
