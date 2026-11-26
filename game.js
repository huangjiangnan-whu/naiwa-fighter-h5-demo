(() => {
  "use strict";

  const WIDTH = 1440;
  const HEIGHT = 810;
  const GROUND_Y = 690;
  const ROUND_SECONDS = 60;
  const MAX_METER = 100;
  const MAX_HEALTH = 5000;
  const HEAL_AMOUNT = 60;
  const PLAYER_DAMAGE_SCALE = 1.12;
  const NAIWA_DAMAGE_MULTIPLIER = 1.25;
  const HIT_METER_GAIN = 0.075;
  const COMBO_INPUT_BUFFER = 0.62;
  const COMBO_CANCEL_RATIO = 0.54;
  const COMBO_DAMAGE_BONUS = 0.07;
  const COMBO_DAMAGE_CAP = 0.35;
  const DIVINE_MARK_DURATION = 6;
  const HIT_FEEDBACK = {
    "naiwa-light": { stop: 0.058, shake: 10, flash: 0.12, kick: 0.019 },
    "naiwa-heavy": { stop: 0.135, shake: 23, flash: 0.34, kick: 0.058 },
    "naiwa-rush": { stop: 0.115, shake: 20, flash: 0.28, kick: 0.05 },
    "mini-light": { stop: 0.048, shake: 8, flash: 0.11, kick: 0.015 },
    "mini-heavy": { stop: 0.12, shake: 21, flash: 0.3, kick: 0.052 },
    "mini-rush": { stop: 0.07, shake: 13, flash: 0.18, kick: 0.026 },
    "divine-light": { stop: 0.075, shake: 15, flash: 0.2, kick: 0.03 },
    "divine-heavy": { stop: 0.16, shake: 27, flash: 0.39, kick: 0.066 },
    "divine-blast": { stop: 0.055, shake: 12, flash: 0.18, kick: 0.024 },
    "naiwa-ultimate": { stop: 0.085, shake: 27, flash: 0.43, kick: 0.052 },
    "mini-ultimate": { stop: 0.11, shake: 32, flash: 0.48, kick: 0.07 },
    "divine-ultimate": { stop: 0.12, shake: 34, flash: 0.5, kick: 0.073 },
    "shield-hit": { stop: 0.04, shake: 7, flash: 0.12, kick: 0.014 },
  };

  const canvas = document.querySelector("#gameCanvas");
  let ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const gameFrame = document.querySelector("#gameFrame");

  const ui = {
    startScreen: document.querySelector("#startScreen"),
    startButton: document.querySelector("#startButton"),
    startButtonLabel: document.querySelector("#startButtonLabel"),
    onlineButton: document.querySelector("#onlineButton"),
    onlinePanel: document.querySelector("#onlinePanel"),
    onlineClose: document.querySelector("#onlineClose"),
    createRoomButton: document.querySelector("#createRoomButton"),
    joinRoomButton: document.querySelector("#joinRoomButton"),
    roomCodeInput: document.querySelector("#roomCodeInput"),
    onlineCharacterPicker: document.querySelector("#onlineCharacterPicker"),
    onlineRoomCode: document.querySelector("#onlineRoomCode"),
    onlineRoomCodeText: document.querySelector("#onlineRoomCodeText"),
    onlineStatus: document.querySelector("#onlineStatus"),
    copyRoomCodeButton: document.querySelector("#copyRoomCodeButton"),
    characterPicker: document.querySelector("#characterPicker"),
    hiddenCharacterButton: document.querySelector("#hiddenCharacterButton"),
    hiddenCharacterModal: document.querySelector("#hiddenCharacterModal"),
    hiddenCharacterClose: document.querySelector("#hiddenCharacterClose"),
    difficultyPicker: document.querySelector("#difficultyPicker"),
    heroPose: document.querySelector("#heroPose"),
    playerPortrait: document.querySelector("#playerPortrait"),
    enemyPortrait: document.querySelector("#enemyPortrait"),
    playerName: document.querySelector("#playerName"),
    playerNameEn: document.querySelector("#playerNameEn"),
    timer: document.querySelector("#timer"),
    roundLabel: document.querySelector("#roundLabel"),
    playerHealth: document.querySelector("#playerHealth"),
    playerHealthLag: document.querySelector("#playerHealthLag"),
    enemyHealth: document.querySelector("#enemyHealth"),
    enemyHealthLag: document.querySelector("#enemyHealthLag"),
    playerMeter: document.querySelector("#playerMeter"),
    enemyMeter: document.querySelector("#enemyMeter"),
    playerMeterText: document.querySelector("#playerMeterText"),
    enemyMeterText: document.querySelector("#enemyMeterText"),
    enemyDifficultyTag: document.querySelector("#enemyDifficultyTag"),
    enemyName: document.querySelector("#enemyName"),
    playerRoundMarkers: [
      document.querySelector("#playerRound1"),
      document.querySelector("#playerRound2"),
      document.querySelector("#playerRound3"),
    ],
    enemyRoundMarkers: [
      document.querySelector("#enemyRound1"),
      document.querySelector("#enemyRound2"),
      document.querySelector("#enemyRound3"),
    ],
    comboCallout: document.querySelector("#comboCallout"),
    centerCallout: document.querySelector("#centerCallout"),
    koBadge: document.querySelector("#koBadge"),
    skillCards: [...document.querySelectorAll(".skill-card")],
    soundButton: document.querySelector("#soundButton"),
    soundLabel: document.querySelector("#soundLabel"),
    soundIcon: document.querySelector("#soundIcon"),
    pauseButton: document.querySelector("#pauseButton"),
    pauseButtonLabel: document.querySelector("#pauseButtonLabel"),
    helpButton: document.querySelector("#helpButton"),
    helpPanel: document.querySelector("#helpPanel"),
    helpClose: document.querySelector("#helpClose"),
    helpPrimary: document.querySelector("#helpPrimary"),
    pauseOverlay: document.querySelector("#pauseOverlay"),
    resumeButton: document.querySelector("#resumeButton"),
    roundOverlay: document.querySelector("#roundOverlay"),
    roundKicker: document.querySelector("#roundKicker"),
    roundWinner: document.querySelector("#roundWinner"),
    roundReason: document.querySelector("#roundReason"),
    roundVictoryPose: document.querySelector("#roundVictoryPose"),
    nextRoundButton: document.querySelector("#nextRoundButton"),
    nextRoundLabel: document.querySelector("#nextRoundLabel"),
    finalOverlay: document.querySelector("#finalOverlay"),
    changeCharacterButton: document.querySelector("#changeCharacterButton"),
    returnLobbyButton: document.querySelector("#returnLobbyButton"),
    koFinisher: document.querySelector("#koFinisher"),
    koFinisherSkip: document.querySelector("#koFinisherSkip"),
    koFinisherKicker: document.querySelector("#koFinisherKicker"),
    koFinisherLine1: document.querySelector("#koFinisherLine1"),
    koFinisherLine2: document.querySelector("#koFinisherLine2"),
    koFinisherImage: document.querySelector("#koFinisherImage"),
    finalPretitle: document.querySelector("#finalPretitle"),
    finalWinner: document.querySelector("#finalWinner"),
    finalScore: document.querySelector("#finalScore"),
    finalQuote: document.querySelector("#finalQuote"),
    rematchButton: document.querySelector("#rematchButton"),
    holyUltimate: document.querySelector("#holyUltimate"),
    holySkipButton: document.querySelector("#holySkipButton"),
    holyUltimateKicker: document.querySelector("#holyUltimateKicker"),
    holyUltimateTitle: document.querySelector("#holyUltimateTitle"),
    holyUltimateLine: document.querySelector("#holyUltimateLine"),
    holyUltimateMiniImage: document.querySelector("#holyUltimateMiniImage"),
    holyUltimateNaiwaImage: document.querySelector("#holyUltimateNaiwaImage"),
    holyUltimateDivineImage: document.querySelector("#holyUltimateDivineImage"),
    holyUltimateHitWord: document.querySelector("#holyUltimateHitWord"),
    divineSkillCast: document.querySelector("#divineSkillCast"),
    divineSkillCastImage: document.querySelector("#divineSkillCastImage"),
    divineSkillCastTitle: document.querySelector("#divineSkillCastTitle"),
    rebirthPrompt: document.querySelector("#rebirthPrompt"),
    divineTransition: document.querySelector("#divineTransition"),
    divineTransitionVideo: document.querySelector("#divineTransitionVideo"),
    ultimateAudio: document.querySelector("#ultimateAudio"),
    miniUltimateAudio: document.querySelector("#miniUltimateAudio"),
    divineUltimateAudio: document.querySelector("#divineUltimateAudio"),
    matchMusicAudio: document.querySelector("#matchMusicAudio"),
    koAnthemAudio: document.querySelector("#koAnthemAudio"),
    lobbyMusicButton: document.querySelector("#lobbyMusicButton"),
    playerHud: document.querySelector(".player-hud"),
    enemyHud: document.querySelector(".enemy-hud"),
    virtualStick: document.querySelector("#virtualStick"),
    virtualStickKnob: document.querySelector("#virtualStickKnob"),
    toast: document.querySelector("#toast"),
    touchControls: document.querySelector("#touchControls"),
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const random = (min, max) => min + Math.random() * (max - min);
  const moveToward = (value, target, amount) => {
    if (value < target) return Math.min(value + amount, target);
    if (value > target) return Math.max(value - amount, target);
    return target;
  };
  const createRoomCode = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  };

  const images = {};
  const assetSources = {
    guard: "./assets/characters/naiwa-guard.webp",
    fist: "./assets/characters/naiwa-fist.webp",
    palm: "./assets/characters/naiwa-palm.webp",
    roar: "./assets/characters/naiwa-roar-cutin.webp",
    miniIdle: "./assets/characters/mini-base.webp",
    miniPoke: "./assets/characters/mini-poke-v3.webp",
    miniKick: "./assets/characters/mini-kick-v3.webp",
    miniHeart: "./assets/characters/mini-heart-v3.webp",
    divineAura: "./assets/characters/divine-aura-lite.png",
  };

  const CHARACTER_CONFIG = {
    naiwa: {
      name: "奶娃",
      english: "NAIWA",
      portrait: assetSources.guard,
      hero: assetSources.guard,
      moves: {
        light: { name: "拍肚皮", detail: "快速轻击", art: assetSources.guard },
        heavy: { name: "肚皮弹", detail: "重击 · 击飞", art: assetSources.palm },
        rush: { name: "奶拳突进", detail: "前冲 · 正面击退", art: assetSources.fist },
        heal: { name: "奶气回春", detail: "25 奶气 · 回复 60", art: assetSources.guard },
        ultimate: { name: "捧腹大笑", detail: "满气 · 四段笑浪", art: assetSources.roar },
      },
    },
    mini: {
      name: "小奶娃",
      english: "MINI NAIWA",
      portrait: assetSources.miniIdle,
      hero: assetSources.miniIdle,
      moves: {
        light: { name: "奶指戳戳", detail: "快速 · 短距离", art: assetSources.miniPoke },
        heavy: { name: "奶娃飞踢", detail: "重击 · 踢飞", art: assetSources.miniKick },
        rush: { name: "爱心奶波", detail: "远程 · 爱心冲击", art: assetSources.miniHeart },
        heal: { name: "奶气回春", detail: "25 奶气 · 回复 60", art: assetSources.miniHeart },
        ultimate: { name: "奶娃神圣降临", detail: "满气 · 超奶一击", art: "./assets/characters/mini-holy.webp" },
      },
    },
    divine: {
      name: "神-奶娃",
      english: "DIVINE NAIWA",
      portrait: assetSources.divineAura,
      hero: assetSources.divineAura,
      moves: {
        light: { name: "焚心印", detail: "掌击 · 附加 30% 易伤", art: "./assets/characters/divine-skill-1.jpg" },
        heavy: { name: "焚身冲", detail: "飞踢 · 附加焚印", art: "./assets/characters/divine-skill-2.jpg" },
        rush: { name: "静默结界", detail: "600 护盾 · 共回复 500", art: "./assets/characters/divine-skill-3.jpg" },
        heal: { name: "烈焰爆弹", detail: "8 发 · 每发 200 伤害", art: "./assets/characters/divine-skill-4.jpg" },
        ultimate: { name: "神临·天火", detail: "3000 爆发 + 500×5 灼烧", art: "./assets/characters/divine-ultimate.jpg" },
      },
    },
  };

  const DIFFICULTIES = {
    easy: {
      label: "简单",
      enemyHealth: 4500,
      enemyDamage: 1.15,
      enemyPerfectBlockChance: 0.1,
      enemyThinkScale: 1,
      enemySpeedScale: 1,
    },
    hard: {
      label: "困难",
      enemyHealth: 9000,
      enemyDamage: 2.25,
      enemyPerfectBlockChance: 0.3,
      enemyThinkScale: 0.58,
      enemySpeedScale: 1.16,
    },
    hell: {
      label: "地狱",
      enemyHealth: 12500,
      enemyDamage: 3.15,
      enemyPerfectBlockChance: 0.35,
      enemyThinkScale: 0.34,
      enemySpeedScale: 1.34,
    },
  };

  const DIVINE_MOVES = {
    light: {
      name: "焚心印",
      detail: "掌击 · 附加 30% 易伤",
      art: "./assets/characters/divine-skill-1.jpg",
      duration: 0.36,
      startup: 0.08,
      range: 320,
      damage: 70,
      knockback: 170,
      lift: 0,
    },
    heavy: {
      name: "焚身冲",
      detail: "飞踢 · 附加焚印",
      art: "./assets/characters/divine-skill-2.jpg",
      duration: 0.58,
      startup: 0.17,
      range: 270,
      damage: 260,
      knockback: 500,
      lift: -360,
    },
    rush: {
      name: "静默结界",
      detail: "600 护盾 · 共回复 500",
      art: "./assets/characters/divine-skill-3.jpg",
      duration: 0.48,
      startup: 0.17,
      range: 0,
      damage: 190,
      knockback: 330,
      lift: -130,
    },
    heal: {
      name: "烈焰爆弹",
      detail: "8 发 · 每发 200 伤害",
      art: "./assets/characters/divine-skill-4.jpg",
      duration: 0.92,
      startup: 0.12,
      range: 0,
      damage: 200,
      knockback: 370,
      lift: -110,
    },
    ultimate: {
      name: "神临·天火",
      detail: "满气 · 3000 爆发 + 500×5 灼烧",
      art: "./assets/characters/divine-ultimate.jpg",
    },
  };

  function loadImage(source, attempt = 0) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timer = window.setTimeout(() => {
        image.src = "";
        reject(new Error(`Image timeout: ${source}`));
      }, 7000);
      image.onload = () => {
        window.clearTimeout(timer);
        const decoded = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
        decoded.then(() => resolve(image));
      };
      image.onerror = () => {
        window.clearTimeout(timer);
        if (attempt < 1) {
          loadImage(source, attempt + 1).then(resolve, reject);
        } else {
          reject(new Error(`Image failed: ${source}`));
        }
      };
      if ("fetchPriority" in image) image.fetchPriority = source.includes("palm") ? "high" : "auto";
      image.src = attempt ? `${source}${source.includes("?") ? "&" : "?"}retry=${attempt}` : source;
    });
  }

  function createFallbackNaiwa() {
    const fallback = document.createElement("canvas");
    fallback.width = 320;
    fallback.height = 420;
    const c = fallback.getContext("2d");
    const gradient = c.createLinearGradient(30, 20, 290, 400);
    gradient.addColorStop(0, "#ffe881");
    gradient.addColorStop(1, "#d8a62d");
    c.fillStyle = gradient;
    c.beginPath();
    c.ellipse(160, 225, 125, 180, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff1c5";
    c.beginPath();
    c.ellipse(160, 270, 82, 92, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#d5dd9c";
    c.beginPath();
    c.ellipse(116, 128, 19, 23, 0, 0, Math.PI * 2);
    c.ellipse(205, 128, 19, 23, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#171723";
    c.beginPath();
    c.arc(119, 132, 7, 0, Math.PI * 2);
    c.arc(208, 132, 7, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#3e3526";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(135, 165);
    c.quadraticCurveTo(160, 178, 186, 165);
    c.stroke();
    return fallback;
  }

  function createFallbackMini() {
    const fallback = document.createElement("canvas");
    fallback.width = 240;
    fallback.height = 330;
    const c = fallback.getContext("2d");
    const gradient = c.createLinearGradient(30, 20, 210, 310);
    gradient.addColorStop(0, "#ffea72");
    gradient.addColorStop(1, "#efa324");
    c.fillStyle = gradient;
    c.beginPath();
    c.ellipse(120, 175, 92, 145, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff2bd";
    c.beginPath();
    c.ellipse(120, 214, 54, 62, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#d7df9d";
    c.beginPath();
    c.ellipse(91, 105, 15, 18, 0, 0, Math.PI * 2);
    c.ellipse(151, 105, 15, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#171723";
    c.beginPath();
    c.arc(93, 108, 6, 0, Math.PI * 2);
    c.arc(153, 108, 6, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#403428";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(121, 130, 14, 0.2, Math.PI - 0.2);
    c.stroke();
    return fallback;
  }

  class AudioEngine {
    constructor() {
      this.context = null;
      this.enabled = true;
      this.master = null;
      this.lobbyTimer = null;
      this.lobbyRunning = false;
      this.lobbyRequested = false;
      this.musicStep = 0;
      this.musicNextAt = 0;
      this.laughBuffer = null;
      this.laughSource = null;
      this.laughGain = null;
    }

    async ensure() {
      if (!this.enabled) return;
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
    }

    tone(frequency, duration, options = {}) {
      if (!this.context || !this.enabled) return;
      const now = this.context.currentTime + (options.delay || 0);
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = options.type || "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      if (options.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.slideTo), now + duration);
      }
      const volume = options.volume ?? 0.18;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.018, duration * 0.22));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.03);
    }

    noise(duration, options = {}) {
      if (!this.context || !this.enabled) return;
      const sampleRate = this.context.sampleRate;
      const frameCount = Math.floor(sampleRate * duration);
      const buffer = this.context.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
      }
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      const now = this.context.currentTime + (options.delay || 0);
      filter.type = options.filterType || "bandpass";
      filter.frequency.setValueAtTime(options.frequency || 900, now);
      filter.Q.value = options.q || 0.8;
      gain.gain.setValueAtTime(options.volume ?? 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start(now);
      source.stop(now + duration);
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.master) this.master.gain.value = this.enabled ? 0.35 : 0;
      if (this.enabled) {
        this.ensure();
        this.tone(720, 0.09, { type: "triangle", volume: 0.08 });
      } else {
        this.suspendLobbyMusic();
      }
      return this.enabled;
    }

    async prepareLaugh() {
      await this.ensure();
      if (!this.context || this.laughBuffer) return Boolean(this.laughBuffer);
      try {
        const response = await fetch("./assets/video/naiwa-laugh.m4a");
        if (!response.ok) return false;
        const bytes = await response.arrayBuffer();
        this.laughBuffer = await this.context.decodeAudioData(bytes);
        return true;
      } catch {
        return false;
      }
    }

    startLaugh() {
      if (!this.context || !this.enabled || !this.laughBuffer) return false;
      this.stopLaugh(0);
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = this.laughBuffer;
      source.loop = false;
      gain.gain.value = 1.35;
      source.connect(gain);
      gain.connect(this.master);
      // Schedule slightly ahead so the audio clock is already running before the first video frame.
      source.start(this.context.currentTime + 0.015);
      this.laughSource = source;
      this.laughGain = gain;
      return true;
    }

    stopLaugh(fadeSeconds = 0.08) {
      if (!this.context || !this.laughSource) return;
      const source = this.laughSource;
      const gain = this.laughGain;
      this.laughSource = null;
      this.laughGain = null;
      const now = this.context.currentTime;
      if (gain && fadeSeconds > 0) {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
        source.stop(now + fadeSeconds + 0.01);
      } else {
        try {
          source.stop();
        } catch {
          // The source may already have ended.
        }
      }
    }

    async startLobbyMusic() {
      this.lobbyRequested = true;
      await this.ensure();
      if (!this.enabled) return false;
      if (this.lobbyRunning) return true;
      this.lobbyRunning = true;
      this.musicStep = 0;
      this.musicNextAt = this.context.currentTime + 0.04;
      this.scheduleLobbyMusic();
      this.lobbyTimer = setInterval(() => this.scheduleLobbyMusic(), 70);
      return true;
    }

    scheduleLobbyMusic() {
      if (!this.lobbyRunning || !this.context || !this.enabled) return;
      const melody = [
        523, 0, 659, 0, 784, 0, 659, 0,
        494, 0, 587, 0, 740, 0, 587, 0,
        440, 0, 523, 0, 659, 0, 523, 0,
        349, 0, 440, 0, 523, 0, 440, 0,
      ];
      const bass = [
        131, 0, 0, 0, 98, 0, 0, 0,
        110, 0, 0, 0, 87, 0, 0, 0,
        110, 0, 0, 0, 82, 0, 0, 0,
        87, 0, 0, 0, 65, 0, 0, 0,
      ];

      while (this.musicNextAt < this.context.currentTime + 0.22) {
        const delay = Math.max(0, this.musicNextAt - this.context.currentTime);
        const step = this.musicStep % melody.length;
        const melodyNote = melody[step];
        const bassNote = bass[step];

        if (melodyNote) {
          this.tone(melodyNote, 0.12, {
            delay,
            type: "sine",
            volume: 0.037,
            slideTo: melodyNote * 1.008,
          });
        }
        if (bassNote) {
          this.tone(bassNote, 0.18, {
            delay,
            type: "sine",
            volume: 0.045,
            slideTo: bassNote * 0.96,
          });
        }
        if (step % 8 === 0) {
          this.tone(bassNote ? bassNote * 2.5 : 262, 0.9, {
            delay,
            type: "triangle",
            volume: 0.018,
            slideTo: bassNote ? bassNote * 2.48 : 260,
          });
        }
        if (step % 8 === 4) {
          this.noise(0.035, {
            delay,
            volume: 0.012,
            frequency: 1800,
            filterType: "highpass",
          });
        }

        this.musicNextAt += 0.24;
        this.musicStep = (this.musicStep + 1) % melody.length;
      }
    }

    suspendLobbyMusic() {
      if (this.lobbyTimer) clearInterval(this.lobbyTimer);
      this.lobbyTimer = null;
      this.lobbyRunning = false;
    }

    resumeLobbyMusic() {
      if (this.lobbyRequested) this.startLobbyMusic();
    }

    async toggleLobbyMusic() {
      if (this.lobbyRequested || this.lobbyRunning) {
        this.lobbyRequested = false;
        this.suspendLobbyMusic();
        return false;
      }
      return this.startLobbyMusic();
    }

    stopLobbyMusic() {
      this.lobbyRequested = false;
      this.suspendLobbyMusic();
    }

    swing(heavy = false) {
      this.noise(heavy ? 0.14 : 0.075, {
        volume: heavy ? 0.1 : 0.06,
        frequency: heavy ? 360 : 760,
        filterType: "highpass",
      });
    }

    hit(heavy = false) {
      // Three short layers: body thump, cartoon snap, and a dusty tail.
      this.tone(heavy ? 64 : 112, heavy ? 0.2 : 0.11, {
        type: "sine",
        volume: heavy ? 0.24 : 0.13,
        slideTo: heavy ? 28 : 52,
      });
      this.tone(heavy ? 176 : 286, heavy ? 0.105 : 0.065, {
        delay: 0.012,
        type: "square",
        volume: heavy ? 0.13 : 0.08,
        slideTo: heavy ? 72 : 118,
      });
      this.noise(heavy ? 0.15 : 0.075, {
        volume: heavy ? 0.17 : 0.085,
        frequency: heavy ? 760 : 1750,
        filterType: "bandpass",
        q: heavy ? 0.55 : 1.15,
      });
      if (heavy) {
        this.noise(0.2, {
          delay: 0.028,
          volume: 0.09,
          frequency: 155,
          filterType: "lowpass",
        });
        this.tone(880, 0.07, {
          delay: 0.02,
          type: "triangle",
          volume: 0.045,
          slideTo: 420,
        });
      }
    }

    combatHit(kind = "generic", heavy = false, ultimate = false) {
      if (!this.context || !this.enabled) return;
      const profiles = {
        "naiwa-light": { base: 142, snap: 318, volume: 0.12, noise: 1900, q: 1.1 },
        "naiwa-heavy": { base: 62, snap: 172, volume: 0.23, noise: 720, q: 0.58 },
        "naiwa-rush": { base: 78, snap: 236, volume: 0.2, noise: 1080, q: 0.72 },
        "mini-light": { base: 228, snap: 610, volume: 0.095, noise: 2900, q: 1.5 },
        "mini-heavy": { base: 118, snap: 410, volume: 0.16, noise: 1550, q: 0.92 },
        "mini-rush": { base: 330, snap: 760, volume: 0.09, noise: 2450, q: 1.2 },
        "divine-light": { base: 104, snap: 520, volume: 0.17, noise: 1350, q: 0.82 },
        "divine-heavy": { base: 48, snap: 186, volume: 0.26, noise: 540, q: 0.62 },
        "divine-blast": { base: 72, snap: 430, volume: 0.18, noise: 920, q: 0.7 },
        "naiwa-ultimate": { base: 58, snap: 210, volume: 0.24, noise: 660, q: 0.58 },
        "mini-ultimate": { base: 156, snap: 620, volume: 0.2, noise: 1820, q: 0.82 },
        "divine-ultimate": { base: 42, snap: 760, volume: 0.27, noise: 480, q: 0.52 },
        "shield-hit": { base: 540, snap: 1240, volume: 0.1, noise: 3200, q: 1.6 },
        block: { base: 310, snap: 980, volume: 0.09, noise: 2800, q: 1.5 },
        generic: { base: heavy ? 64 : 124, snap: heavy ? 190 : 330, volume: heavy ? 0.2 : 0.1, noise: heavy ? 740 : 1700, q: heavy ? 0.6 : 1.1 },
      };
      const profile = profiles[kind] || profiles.generic;
      this.tone(profile.base, heavy || ultimate ? 0.2 : 0.11, {
        type: "sine",
        volume: profile.volume,
        slideTo: Math.max(28, profile.base * 0.44),
      });
      this.tone(profile.snap, heavy || ultimate ? 0.11 : 0.065, {
        delay: 0.009,
        type: kind.startsWith("mini") ? "triangle" : "square",
        volume: profile.volume * 0.52,
        slideTo: Math.max(52, profile.snap * 0.42),
      });
      this.noise(heavy || ultimate ? 0.15 : 0.075, {
        volume: profile.volume * 0.72,
        frequency: profile.noise,
        filterType: "bandpass",
        q: profile.q,
      });

      if (kind === "mini-rush") {
        [620, 780, 980].forEach((frequency, index) => {
          this.tone(frequency, 0.12, {
            delay: index * 0.015,
            type: "triangle",
            volume: 0.035,
            slideTo: frequency * 1.15,
          });
        });
      } else if (kind.startsWith("divine")) {
        this.noise(0.12, {
          delay: 0.018,
          volume: 0.06,
          frequency: 1250,
          filterType: "highpass",
        });
        this.tone(kind === "divine-heavy" ? 58 : 88, 0.2, {
          delay: 0.012,
          type: "sawtooth",
          volume: 0.045,
          slideTo: 34,
        });
      } else if (kind === "naiwa-heavy" || kind === "naiwa-rush") {
        this.tone(920, 0.065, {
          delay: 0.018,
          type: "triangle",
          volume: 0.032,
          slideTo: 420,
        });
      }
    }

    block() {
      this.tone(720, 0.09, {
        type: "triangle",
        volume: 0.07,
        slideTo: 1080,
      });
      this.tone(340, 0.1, {
        delay: 0.012,
        type: "sine",
        volume: 0.055,
        slideTo: 260,
      });
      this.noise(0.055, {
        volume: 0.035,
        frequency: 2600,
        filterType: "bandpass",
        q: 1.5,
      });
    }

    perfectGuardReady() {
      this.tone(1180, 0.055, {
        type: "triangle",
        volume: 0.025,
        slideTo: 1740,
      });
    }

    perfectBlock() {
      this.tone(1420, 0.12, {
        type: "square",
        volume: 0.085,
        slideTo: 2580,
      });
      this.tone(86, 0.24, {
        type: "sine",
        volume: 0.18,
        slideTo: 34,
      });
      [880, 1174.66, 1567.98].forEach((frequency, index) => {
        this.tone(frequency, 0.34, {
          delay: index * 0.045,
          type: "sawtooth",
          volume: 0.052,
          slideTo: frequency * 1.12,
        });
      });
      this.noise(0.12, {
        volume: 0.16,
        frequency: 2800,
        filterType: "highpass",
      });
      this.crowd(1.15);
    }

    rebirthCue() {
      this.tone(92, 1.3, {
        type: "sine",
        volume: 0.1,
        slideTo: 46,
      });
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        this.tone(frequency, 0.9, {
          delay: index * 0.075,
          type: "triangle",
          volume: 0.045,
          slideTo: frequency * 1.04,
        });
      });
      this.noise(0.8, {
        volume: 0.035,
        frequency: 2600,
        filterType: "highpass",
      });
    }

    divineImpact() {
      this.tone(44, 0.65, {
        type: "sine",
        volume: 0.22,
        slideTo: 24,
      });
      [261.63, 329.63, 392, 523.25, 659.25].forEach((frequency, index) => {
        this.tone(frequency, 0.85, {
          delay: index * 0.045,
          type: "sawtooth",
          volume: 0.038,
          slideTo: frequency * 0.98,
        });
      });
      this.noise(0.42, {
        volume: 0.12,
        frequency: 720,
        filterType: "bandpass",
      });
      this.crowd(1.3);
    }

    impactCharge() {
      this.tone(82, 0.24, {
        type: "sawtooth",
        volume: 0.055,
        slideTo: 46,
      });
      this.noise(0.2, {
        volume: 0.035,
        frequency: 260,
        filterType: "lowpass",
      });
    }

    wave() {
      [490, 620, 780].forEach((frequency, index) => {
        this.tone(frequency, 0.14, {
          delay: index * 0.035,
          type: "triangle",
          volume: 0.07,
          slideTo: frequency * 1.15,
        });
      });
    }

    heal() {
      [392, 523, 659, 784].forEach((frequency, index) => {
        this.tone(frequency, 0.2, {
          delay: index * 0.055,
          type: "triangle",
          volume: 0.065,
          slideTo: frequency * 1.08,
        });
      });
      this.noise(0.34, {
        volume: 0.025,
        frequency: 1900,
        filterType: "bandpass",
        q: 0.7,
      });
    }

    heartWave() {
      [440, 554, 659, 880].forEach((frequency, index) => {
        this.tone(frequency, 0.18, {
          delay: index * 0.035,
          type: "sine",
          volume: 0.055,
          slideTo: frequency * 1.1,
        });
      });
    }

    holyImpact() {
      this.tone(65, 0.45, {
        type: "sine",
        volume: 0.2,
        slideTo: 30,
      });
      [523, 659, 784, 1046].forEach((frequency, index) => {
        this.tone(frequency, 0.7, {
          delay: index * 0.08,
          type: "triangle",
          volume: 0.08,
          slideTo: frequency * 1.04,
        });
      });
      this.crowd(1.1);
    }

    holyArrival() {
      [262, 392, 523, 784, 1046].forEach((frequency, index) => {
        this.tone(frequency, 0.8, {
          delay: index * 0.1,
          type: "triangle",
          volume: 0.05,
          slideTo: frequency * 1.03,
        });
      });
      this.tone(98, 1.4, {
        type: "sine",
        volume: 0.08,
        slideTo: 49,
      });
      this.noise(0.9, {
        volume: 0.025,
        frequency: 2400,
        filterType: "highpass",
      });
    }

    chargePunch() {
      this.tone(92, 1.05, {
        type: "sawtooth",
        volume: 0.07,
        slideTo: 180,
      });
      this.noise(1.1, {
        volume: 0.045,
        frequency: 380,
        filterType: "lowpass",
      });
    }

    enemyHeavyHit() {
      this.tone(48, 0.3, {
        type: "sine",
        volume: 0.23,
        slideTo: 24,
      });
      this.tone(118, 0.16, {
        type: "square",
        volume: 0.13,
        slideTo: 54,
      });
      this.noise(0.2, {
        volume: 0.16,
        frequency: 520,
        filterType: "lowpass",
      });
    }

    jump() {
      this.tone(280, 0.1, { type: "sine", volume: 0.07, slideTo: 480 });
    }

    laugh() {
      [294, 349, 392, 330, 392].forEach((frequency, index) => {
        this.tone(frequency, 0.16, {
          delay: index * 0.14,
          type: "triangle",
          volume: 0.11,
          slideTo: frequency * 0.82,
        });
        this.noise(0.1, {
          delay: index * 0.14,
          volume: 0.025,
          frequency: 1280,
          filterType: "bandpass",
        });
      });
    }

    crowd(amount = 1) {
      this.noise(1.3 * amount, {
        volume: 0.075 * amount,
        frequency: 650,
        filterType: "bandpass",
        q: 0.45,
      });
      this.noise(0.7 * amount, {
        delay: 0.1,
        volume: 0.04 * amount,
        frequency: 2200,
        filterType: "highpass",
      });
      [520, 660, 820].forEach((frequency, index) => {
        this.tone(frequency, 0.3, {
          delay: 0.12 + index * 0.17,
          type: "triangle",
          volume: 0.025 * amount,
          slideTo: frequency * 1.15,
        });
      });
    }

    roundStart() {
      [392, 523, 659].forEach((frequency, index) => {
        this.tone(frequency, 0.15, {
          delay: index * 0.06,
          type: "square",
          volume: 0.06,
        });
      });
    }

    ko() {
      this.hit(true);
      this.crowd(1.2);
      this.tone(150, 0.35, {
        type: "sawtooth",
        volume: 0.08,
        slideTo: 55,
      });
    }

    calmFinish() {
      this.tone(196, 1.3, {
        type: "sine",
        volume: 0.075,
        slideTo: 98,
      });
      [523, 659, 784].forEach((frequency, index) => {
        this.tone(frequency, 0.75, {
          delay: 0.18 + index * 0.17,
          type: "triangle",
          volume: 0.035,
          slideTo: frequency * 0.94,
        });
      });
      this.noise(1.2, {
        volume: 0.022,
        frequency: 720,
        filterType: "bandpass",
      });
    }

    miniRainFinish() {
      this.noise(1.8, {
        volume: 0.05,
        frequency: 1300,
        filterType: "bandpass",
        q: 0.55,
      });
      [392, 330, 294].forEach((frequency, index) => {
        this.tone(frequency, 0.85, {
          delay: 0.16 + index * 0.22,
          type: "sine",
          volume: 0.045,
          slideTo: frequency * 0.94,
        });
      });
    }

    finishAnthem(isMini = false) {
      if (!this.context || !this.enabled) return;
      const beat = 0.18;
      const roots = isMini
        ? [110, 130.81, 146.83, 98]
        : [98, 116.54, 130.81, 87.31];
      const melody = isMini
        ? [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33]
        : [440, 523.25, 659.25, 880, 783.99, 659.25, 523.25, 493.88];
      const finalLead = isMini ? 1046.5 : 880;

      // A short one-shot "finisher anthem": kick, snare, bass drive,
      // power chords and a bright victory melody over the KO artwork.
      for (let step = 0; step < 16; step += 1) {
        const delay = step * beat;
        const bar = Math.floor(step / 4);
        const root = roots[bar];

        if (step % 4 === 0) {
          this.tone(68, 0.16, {
            delay,
            type: "sine",
            volume: 0.18,
            slideTo: 31,
          });
          this.tone(root, 0.48, {
            delay,
            type: "sawtooth",
            volume: 0.052,
            slideTo: root * 0.94,
          });
          [root * 2, root * 2.5, root * 3].forEach((frequency, index) => {
            this.tone(frequency, 0.3, {
              delay: delay + index * 0.008,
              type: "triangle",
              volume: 0.026,
              slideTo: frequency * 0.975,
            });
          });
        }

        if (step % 4 === 2) {
          this.noise(0.11, {
            delay,
            volume: 0.095,
            frequency: 1380,
            filterType: "bandpass",
            q: 0.7,
          });
          this.tone(146, 0.08, {
            delay,
            type: "square",
            volume: 0.038,
            slideTo: 86,
          });
        }

        this.noise(0.035, {
          delay: delay + beat * 0.5,
          volume: step % 4 === 3 ? 0.028 : 0.018,
          frequency: 3600,
          filterType: "highpass",
        });
        const lead = melody[step % melody.length] * (step >= 12 ? 1.25 : 1);
        this.tone(lead, step >= 12 ? 0.3 : 0.12, {
          delay,
          type: "triangle",
          volume: step >= 12 ? 0.07 : 0.045,
          slideTo: lead * 1.025,
        });
      }

      [220, 277.18, 329.63, 440, 554.37, 880].forEach((frequency, index) => {
        this.tone(frequency, 0.3, {
          delay: index * 0.115,
          type: "sawtooth",
          volume: 0.026 + index * 0.002,
          slideTo: frequency * 1.08,
        });
      });
      [finalLead, finalLead * 1.25, finalLead * 1.5].forEach((frequency, index) => {
        this.tone(frequency, 0.7, {
          delay: 2.2 + index * 0.055,
          type: "triangle",
          volume: 0.07,
          slideTo: frequency * 1.015,
        });
      });
      this.tone(58, 0.55, {
        delay: 2.2,
        type: "sine",
        volume: 0.16,
        slideTo: 29,
      });
      this.crowd(1.35);
    }
  }

  const audio = new AudioEngine();

  class Fighter {
    constructor(game, side) {
      this.game = game;
      this.side = side;
      this.isPlayer = side === "player";
      this.character = this.isPlayer ? game.playerCharacter : game.enemyCharacter;
      this.wins = 0;
      this.reset(true);
    }

    reset() {
      this.x = this.isPlayer ? 390 : 1050;
      this.y = GROUND_Y;
      this.vx = 0;
      this.vy = 0;
      this.facing = this.isPlayer ? 1 : -1;
      this.health = this.maxHealth;
      this.meter = 0;
      this.action = null;
      this.actionTime = 0;
      this.actionDuration = 0;
      this.actionId = 0;
      this.actionStartedAt = -999;
      this.actionResolved = false;
      this.queuedAction = null;
      this.queuedActionTime = 0;
      this.attackStartup = 0;
      this.attackRange = 0;
      this.hitFlash = 0;
      this.hitTilt = 0;
      this.invulnerable = 0;
      this.hitStun = 0;
      this.burnTime = 0;
      this.burnMaxTime = 3.2;
      this.burnTick = 0;
      this.burnInterval = 0.5;
      this.burnDamage = 8;
      this.burnOwner = null;
      this.burnInferno = false;
      this.divineMarkTime = 0;
      this.divineMarkOwner = null;
      this.divineRebirthUsed = false;
      this.shield = 0;
      this.shieldMax = 0;
      this.shieldHealPool = 0;
      this.shieldHealTick = 0;
      this.blocking = false;
      this.ko = false;
      this.koRotation = 0;
      this.grounded = true;
      this.desiredVx = 0;
      this.thinkTimer = random(0.4, 1.1);
      this.walkPhase = 0;
    }

    get hurtWidth() {
      return this.isPlayer ? 118 : 130;
    }

    get maxHealth() {
      return this.isPlayer || this.game.onlineMode ? MAX_HEALTH : this.game.difficulty.enemyHealth;
    }

    get centerY() {
      return this.y - 120;
    }

    canAct() {
      return !this.ko && this.hitStun <= 0 && !this.action && !this.blocking && this.invulnerable <= 0.22;
    }

    requestAttack(kind) {
      const remoteGuest = this.game.onlineMode === "host" && !this.isPlayer;
      if (!this.isPlayer && !remoteGuest) return this.startAttack(kind);
      if (this.action && this.action !== "ultimate") {
        this.queuedAction = kind;
        this.queuedActionTime = COMBO_INPUT_BUFFER;
        return true;
      }
      if (!this.action && this.hitStun > 0 && this.hitStun <= 0.24) {
        this.queuedAction = kind;
        this.queuedActionTime = COMBO_INPUT_BUFFER;
        return true;
      }
      return this.startAttack(kind);
    }

    jump() {
      if (!this.game.canControl() || !this.grounded || !this.canAct()) return;
      this.vy = -835;
      this.grounded = false;
      audio.jump();
      this.game.spawnDust(this.x, this.y, 8);
    }

    startAttack(kind, skipDivineCast = false) {
      if (!this.game.canControl() || !this.canAct()) return false;
      const divine = this.character === "divine";
      if (divine && !skipDivineCast) return this.game.beginDivineSkillCast(kind, this);
      const isMini = !divine && this.character === "mini";
      const data = (divine
        ? DIVINE_MOVES
        : isMini
        ? {
            light: { duration: 0.34, startup: 0.07, range: 205 },
            heavy: { duration: 0.6, startup: 0.2, range: 228 },
            rush: { duration: 0.5, startup: 0.18, range: 0 },
            heal: { duration: 0.8, startup: 0.23, range: 0 },
          }
        : {
            light: { duration: 0.38, startup: 0.075, range: 164 },
            heavy: { duration: 0.67, startup: 0.255, range: 222 },
            rush: { duration: 0.56, startup: 0.16, range: 255 },
            heal: { duration: 0.8, startup: 0.23, range: 0 },
          })[kind];
      if (!data) return false;

      if (kind === "heal" && !divine) {
        if (this.health >= this.maxHealth) {
          if (this.isPlayer) this.game.showToast("血量已满，不需要回春");
          return false;
        }
        if (this.meter < 25) {
          if (this.isPlayer) this.game.showToast("奶气不足：回春需要 25 点");
          return false;
        }
        this.meter -= 25;
      }

      this.action = kind;
      this.actionTime = 0;
      this.actionDuration = data.duration;
      this.actionId += 1;
      this.actionStartedAt = this.game.elapsed;
      this.attackStartup = data.startup;
      this.attackRange = data.range;
      this.actionResolved = false;
      this.vx =
        kind === "heal"
          ? 0
          : this.facing *
            (divine
              ? kind === "heavy"
                ? 235
                : kind === "rush"
                  ? 0
                  : 125
              : kind === "rush"
                ? isMini
                  ? 75
                  : 390
                : kind === "heavy"
                  ? isMini
                    ? 185
                    : 215
                  : isMini
                    ? 82
                    : 112);
      if (kind !== "heal") audio.swing(kind === "heavy");
      return true;
    }

    startUltimate() {
      if (!this.game.canControl() || !this.canAct()) return false;
      if (this.meter < MAX_METER) {
        if (this.isPlayer) this.game.showToast("大招需要满格奶气");
        return false;
      }
      this.meter = 0;
      this.action = "ultimate";
      this.actionTime = 0;
      this.actionDuration = 6.1;
      this.actionId += 1;
      this.actionStartedAt = this.game.elapsed;
      this.actionResolved = false;
      this.invulnerable = 6.2;
      this.vx = 0;
      this.game.startUltimate(this);
      return true;
    }

    update(dt) {
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.hitTilt = moveToward(this.hitTilt, 0, 1.7 * dt);
      this.invulnerable = Math.max(0, this.invulnerable - dt);
      this.hitStun = Math.max(0, this.hitStun - dt);
      this.divineMarkTime = Math.max(0, this.divineMarkTime - dt);
      if (this.queuedActionTime > 0) {
        this.queuedActionTime = Math.max(0, this.queuedActionTime - dt);
        if (this.queuedActionTime <= 0) this.queuedAction = null;
      }

      if (this.ko) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 1850 * dt;
        this.koRotation += this.vx * dt * 0.006;
        return;
      }

      if (this.action === "ultimate") {
        this.actionTime += dt;
        return;
      }

      const remoteGuest = this.game.onlineMode === "host" && !this.isPlayer;
      const humanControlled = this.isPlayer || remoteGuest;
      const inputKeys = remoteGuest ? this.game.remoteKeys : this.game.keys;
      this.blocking =
        humanControlled &&
        this.game.phase === "playing" &&
        inputKeys.has("z") &&
        this.grounded &&
        !this.action &&
        this.hitStun <= 0;

      const canMove = this.game.phase === "playing" && this.hitStun <= 0;
      let targetVx = 0;
      if (canMove && !this.action && !this.blocking) {
        if (humanControlled) {
          if (inputKeys.has("a")) targetVx -= 285;
          if (inputKeys.has("d")) targetVx += 285;
        } else {
          targetVx = this.desiredVx;
        }
      }

      if (this.hitStun > 0 || this.action) {
        this.vx *= Math.pow(0.07, dt);
      } else if (this.grounded) {
        this.vx = moveToward(this.vx, targetVx, 1950 * dt);
      } else {
        this.vx = moveToward(this.vx, targetVx, 720 * dt);
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (!this.grounded) {
        this.vy += 2100 * dt;
      }

      if (this.y >= GROUND_Y) {
        if (!this.grounded && this.vy > 430) {
          this.game.spawnDust(this.x, GROUND_Y, 7);
        }
        this.y = GROUND_Y;
        this.vy = 0;
        this.grounded = true;
      } else {
        this.grounded = false;
      }

      if (!this.ko) {
        this.x = clamp(this.x, 105, WIDTH - 105);
      }

      if (this.action) {
        this.actionTime += dt;
        this.game.resolveAction(this);
        const canChain =
          humanControlled &&
          this.queuedAction &&
          this.actionResolved &&
          this.action !== "heal" &&
          this.action !== "ultimate" &&
          this.actionTime >= this.actionDuration * COMBO_CANCEL_RATIO;
        if (canChain) {
          const nextAction = this.queuedAction;
          this.queuedAction = null;
          this.queuedActionTime = 0;
          this.action = null;
          this.actionTime = 0;
          this.actionResolved = false;
          this.startAttack(nextAction);
          return;
        }
        if (this.actionTime >= this.actionDuration) {
          this.action = null;
          this.actionTime = 0;
          this.actionResolved = false;
          if (this.queuedAction) {
            const nextAction = this.queuedAction;
            this.queuedAction = null;
            this.queuedActionTime = 0;
            this.startAttack(nextAction);
            return;
          }
        }
      } else if (this.hitStun <= 0 && this.game.phase === "playing") {
        const opponent = this.game.opponentOf(this);
        if (Math.abs(opponent.x - this.x) > 18) {
          this.facing = opponent.x > this.x ? 1 : -1;
        }
        if (humanControlled && this.queuedAction) {
          const nextAction = this.queuedAction;
          this.queuedAction = null;
          this.queuedActionTime = 0;
          this.startAttack(nextAction);
        }
      }

      if (this.grounded && Math.abs(this.vx) > 40 && !this.action) {
        this.walkPhase += dt * 12;
      }
    }
  }

  class NaiwaGame {
    constructor() {
      this.urlParams = new URLSearchParams(window.location.search);
      this.mobileMode =
        !this.urlParams.has("desktop") &&
        (this.urlParams.has("mobile") || window.matchMedia("(pointer: coarse), (hover: none)").matches);
      document.body.classList.toggle("mobile-mode", this.mobileMode);
      document.body.classList.toggle("mobile-start", this.mobileMode);
      this.phase = "menu";
      this.paused = false;
      this.roundNumber = 1;
      this.roundTime = ROUND_SECONDS;
      this.countdown = 0;
      this.goTimer = 0;
      this.calloutKey = "";
      this.hitStop = 0;
      this.shake = 0;
      this.flash = 0;
      this.cameraKick = 0;
      this.cameraRoll = 0;
      this.cameraFocus = WIDTH / 2;
      this.slowMotion = 0;
      this.crowdEnergy = 0;
      this.ultimate = null;
      this.divineCast = null;
      this.divineBarrage = null;
      this.divineForm = false;
      this.divineRebirthUsed = false;
      this.rebirthPending = null;
      this.rebirthTimer = null;
      this.networkRebirthPending = null;
      this.networkRebirthTimer = null;
      this.networkRebirthAwaiting = false;
      this.divineTransitionActive = false;
      this.divineTransitionFinishing = false;
      this.divineAuraPromise = null;
      this.divineTransitionTimer = null;
      this.divineTransitionTarget = null;
      this.perfectBlock = null;
      this.perfectBlockCount = 0;
      this.lastFrame = performance.now();
      this.elapsed = 0;
      this.keys = new Set();
      this.remoteKeys = new Set();
      this.onlineMode = null;
      this.onlineCharacter = "naiwa";
      this.networkRole = null;
      this.networkRoom = null;
      this.networkToken = null;
      this.networkSeq = 0;
      this.networkPollAbort = null;
      this.networkSendBusy = false;
      this.networkQueuedState = null;
      this.networkMessageQueue = [];
      this.networkSendAccumulator = 0;
      this.networkReady = false;
      this.networkAwaitingStart = false;
      this.effects = [];
      this.projectiles = [];
      this.damageFloats = [];
      this.impacts = [];
      this.toastTimer = null;
      this.pendingWinner = null;
      this.koTimer = 0;
      this.koFinisherActive = false;
      this.playerCombo = 0;
      this.enemyCombo = 0;
      this.comboClock = 0;
      this.hudAccumulator = 0;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.menuFrameDrawn = false;
      this.finished = false;
      this.debugUltimatePreview = this.urlParams.has("ultimate-preview");
      this.debugUltimateStarted = false;
      this.debugBlockPreview = this.urlParams.has("block-preview");
      this.debugKOPreview = this.urlParams.has("ko-preview");
      this.debugKOHold = this.urlParams.has("ko-hold");
      this.debugKOStarted = false;
      this.debugHolyHold = this.urlParams.has("holy-hold");
      this.debugEnemyCharge = this.urlParams.has("enemy-charge-preview");
      this.debugEnemyChargeHold = this.urlParams.has("enemy-charge-hold");
      this.debugEnemyChargeStarted = false;
      this.debugPerfectPreview = this.urlParams.has("perfect-preview");
      this.debugPerfectStarted = false;
      this.debugPerfectSkillPreview = this.urlParams.has("perfect-skill-preview");
      this.debugPerfectSkillStarted = false;
      this.debugRebirthPreview = this.urlParams.has("rebirth-preview");
      this.debugRebirthStarted = false;
      this.debugDivineSkillDemo = this.urlParams.has("divine-skill-demo");
      this.debugDivinePreview = this.urlParams.has("divine-preview") || this.debugDivineSkillDemo;
      this.debugDivineStarted = false;
      this.debugDivineDemoIndex = 0;
      this.debugDivineDemoTimer = 0.85;
      this.debugDivineDemoCycle = 0;
      this.debugForceEnemyPerfectBlock = this.urlParams.has("force-enemy-perfect");
      this.selectedCharacter = this.urlParams.get("character") === "mini" ? "mini" : "naiwa";
      const requestedDifficulty = this.urlParams.get("difficulty") || "easy";
      this.difficultyKey = DIFFICULTIES[requestedDifficulty] ? requestedDifficulty : "easy";
      this.difficulty = DIFFICULTIES[this.difficultyKey];
      this.playerCharacter = this.selectedCharacter;
      this.enemyCharacter = "naiwa";
      this.networkCharacters = null;
      this.player = new Fighter(this, "player");
      this.enemy = new Fighter(this, "enemy");
      this.bindEvents();
      this.selectCharacter(this.selectedCharacter, false);
      this.selectDifficulty(this.difficultyKey, false);
      if (this.debugDivineSkillDemo) {
        ui.startButtonLabel.textContent = "开始四技能演示";
        ui.startButton.querySelector(".start-button-copy i").textContent = "技能演示";
      }
      this.updateLobbyMusicButton();
      this.initLobbyAutoplay();
      ui.ultimateAudio.muted = !audio.enabled;
      ui.miniUltimateAudio.muted = !audio.enabled;
      ui.divineUltimateAudio.muted = !audio.enabled;
      ui.matchMusicAudio.muted = !audio.enabled;
      ui.matchMusicAudio.loop = true;
      ui.matchMusicAudio.volume = 0.12;
      ui.matchMusicAudio.load();
      ui.koAnthemAudio.muted = !audio.enabled;
      ui.divineTransitionVideo.muted = !audio.enabled;
      this.resize();
      this.buildBackgroundCache();
      window.__NAIWA_GAME__ = this;
      requestAnimationFrame((time) => this.loop(time));
    }

    bindEvents() {
      window.addEventListener("resize", () => this.resize());
      window.addEventListener("keydown", (event) => this.onKeyDown(event));
      window.addEventListener("keyup", (event) => this.onKeyUp(event));
      window.addEventListener("blur", () => {
        this.keys.clear();
        if (
          this.phase === "playing" &&
          !this.paused &&
          !this.rebirthPending &&
          !this.divineTransitionActive
        ) {
          this.setPaused(true);
        }
      });

      ui.startButton.addEventListener("click", () => {
        if (this.phase !== "menu" || ui.startButton.disabled) return;
        if (this.networkToken) this.disconnectNetwork();
        this.enterMobileLandscape();
        this.startMatch();
        void this.warmAudioInBackground(true);
      });
      ui.onlineButton.addEventListener("click", () => this.openOnlinePanel());
      ui.onlineClose.addEventListener("click", () => this.closeOnlinePanel());
      ui.onlineCharacterPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-online-character]");
        if (!button) return;
        this.onlineCharacter = button.dataset.onlineCharacter;
        ui.onlineCharacterPicker.querySelectorAll("[data-online-character]").forEach((item) => {
          const selected = item.dataset.onlineCharacter === this.onlineCharacter;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
      });
      ui.createRoomButton.addEventListener("click", () => this.createOnlineRoom());
      ui.joinRoomButton.addEventListener("click", () => this.joinOnlineRoom());
      ui.roomCodeInput.addEventListener("input", () => {
        ui.roomCodeInput.value = ui.roomCodeInput.value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 6);
      });
      ui.roomCodeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") this.joinOnlineRoom();
      });
      ui.copyRoomCodeButton.addEventListener("click", async () => {
        if (!this.networkRoom) return;
        try {
          await navigator.clipboard.writeText(this.networkRoom);
          ui.copyRoomCodeButton.textContent = "已复制";
        } catch {
          ui.copyRoomCodeButton.textContent = "请手动复制";
        }
      });
      ui.rematchButton.addEventListener("click", () => {
        if (this.onlineMode === "guest") return;
        if (this.onlineMode === "host") {
          this.sendNetwork({ type: "match-start", character: "naiwa", roundNumber: 1 });
        }
        this.enterMobileLandscape();
        this.startMatch();
        void this.warmAudioInBackground(false);
      });
      ui.nextRoundButton.addEventListener("click", () => this.prepareNextRound());
      ui.changeCharacterButton.addEventListener("click", () => this.returnToLobby());
      ui.returnLobbyButton.addEventListener("click", () => this.returnToLobby());
      ui.pauseButton.addEventListener("click", () => this.togglePause());
      ui.soundButton.addEventListener("click", () => this.toggleSound());
      ui.helpButton.addEventListener("click", () => this.toggleHelp());
      ui.helpClose.addEventListener("click", () => this.toggleHelp(false));
      ui.helpPrimary.addEventListener("click", () => this.toggleHelp(false));
      ui.resumeButton.addEventListener("click", () => this.setPaused(false));
      ui.holySkipButton.addEventListener("click", () => this.skipUltimate());
      ui.divineTransitionVideo.addEventListener("playing", () => {
        ui.divineTransition.classList.add("is-playing");
      });
      ui.divineTransitionVideo.addEventListener("ended", () => this.finishDivineTransition());
      ui.divineTransitionVideo.addEventListener("error", () => {
        window.setTimeout(() => {
          if (this.divineTransitionActive && ui.divineTransitionVideo.error) {
            this.finishDivineTransition();
          }
        }, 1200);
      });
      ui.koFinisherSkip.addEventListener("click", () => this.skipKOFinisher());
      ui.characterPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-character]");
        if (!button || this.phase !== "menu") return;
        this.selectCharacter(button.dataset.character);
      });
      ui.hiddenCharacterButton.addEventListener("click", () => {
        if (this.phase === "menu") ui.hiddenCharacterModal.hidden = false;
      });
      ui.hiddenCharacterClose.addEventListener("click", () => {
        ui.hiddenCharacterModal.hidden = true;
      });
      ui.difficultyPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-difficulty]");
        if (!button || this.phase !== "menu") return;
        this.selectDifficulty(button.dataset.difficulty);
      });
      ui.lobbyMusicButton.addEventListener("click", async () => {
        await audio.toggleLobbyMusic();
        this.updateLobbyMusicButton();
      });
      window.addEventListener("orientationchange", () => {
        window.setTimeout(() => this.resize(), 120);
        if (this.mobileMode && this.phase === "playing") this.enterMobileLandscape();
      });
      window.visualViewport?.addEventListener("resize", () => this.resize());

      ui.skillCards.forEach((card) => {
        card.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          const action = card.dataset.skill;
          this.performAction(action);
        });
      });

      document.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          const action = button.dataset.action;
          if (action === "jump") this.player.jump();
          else this.performAction(action);
        });
      });

      document.querySelectorAll("[data-hold]").forEach((button) => {
        const key = button.dataset.hold;
        const release = () => {
          this.keys.delete(key);
          button.classList.remove("is-held");
        };
        button.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          this.keys.add(key);
          if (key === "z") this.tryArmPerfectBlock();
          button.classList.add("is-held");
          button.setPointerCapture?.(event.pointerId);
        });
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("lostpointercapture", release);
      });

      if (ui.virtualStick && ui.virtualStickKnob) {
        let activePointer = null;
        let jumpLatched = false;
        const resetStick = () => {
          activePointer = null;
          jumpLatched = false;
          this.keys.delete("a");
          this.keys.delete("d");
          ui.virtualStickKnob.style.transform = "translate3d(0, 0, 0)";
        };
        const moveStick = (event) => {
          if (activePointer !== event.pointerId) return;
          const rect = ui.virtualStick.getBoundingClientRect();
          const maxTravel = 32;
          let dx = event.clientX - (rect.left + rect.width / 2);
          let dy = event.clientY - (rect.top + rect.height / 2);
          const distance = Math.hypot(dx, dy);
          if (distance > maxTravel) {
            dx = (dx / distance) * maxTravel;
            dy = (dy / distance) * maxTravel;
          }

          ui.virtualStickKnob.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          if (dx < -9) this.keys.add("a");
          else this.keys.delete("a");
          if (dx > 9) this.keys.add("d");
          else this.keys.delete("d");

          if (dy < -22 && !jumpLatched) {
            this.player.jump();
            jumpLatched = true;
          } else if (dy > -12) {
            jumpLatched = false;
          }
        };

        ui.virtualStick.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          activePointer = event.pointerId;
          ui.virtualStick.setPointerCapture?.(event.pointerId);
          moveStick(event);
        });
        ui.virtualStick.addEventListener("pointermove", moveStick);
        ui.virtualStick.addEventListener("pointerup", resetStick);
        ui.virtualStick.addEventListener("pointercancel", resetStick);
        ui.virtualStick.addEventListener("lostpointercapture", resetStick);
      }
    }

    openOnlinePanel() {
      if (this.phase !== "menu") return;
      if (!["naiwa", "mini"].includes(this.onlineCharacter)) {
        this.onlineCharacter = ["naiwa", "mini"].includes(this.selectedCharacter)
          ? this.selectedCharacter
          : "naiwa";
      }
      ui.onlineCharacterPicker.querySelectorAll("[data-online-character]").forEach((item) => {
        const selected = item.dataset.onlineCharacter === this.onlineCharacter;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      ui.onlinePanel.hidden = false;
      ui.onlineRoomCode.hidden = !this.networkRoom;
      if (this.networkRoom) ui.onlineRoomCodeText.textContent = this.networkRoom;
      ui.onlineStatus.textContent = this.networkRoom
        ? "房间已连接，可把房间码发给好友。"
        : "等待创建或加入房间。";
    }

    closeOnlinePanel() {
      ui.onlinePanel.hidden = true;
    }

    setOnlineStatus(text) {
      ui.onlineStatus.textContent = text;
    }

    createOnlineRoom() {
      this.primeMatchMusic();
      const code = createRoomCode();
      this.connectOnlineRoom("host", code);
    }

    joinOnlineRoom() {
      this.primeMatchMusic();
      const code = ui.roomCodeInput.value.trim().toUpperCase();
      if (!/^[A-Z0-9]{4,6}$/.test(code)) {
        this.setOnlineStatus("请输入 4～6 位有效房间码。");
        ui.roomCodeInput.focus();
        return;
      }
      this.connectOnlineRoom("guest", code);
    }

    async connectOnlineRoom(role, code) {
      this.disconnectNetwork();
      this.networkRole = role;
      this.networkRoom = code;
      this.networkToken =
        crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      this.networkSeq = 0;
      this.networkMessageQueue = [];
      this.networkQueuedState = null;
      this.networkPollAbort = new AbortController();
      this.networkReady = false;
      ui.onlineRoomCode.hidden = false;
      ui.onlineRoomCodeText.textContent = code;
      ui.createRoomButton.disabled = true;
      ui.joinRoomButton.disabled = true;
      this.setOnlineStatus(role === "host" ? "正在创建房间…" : "正在加入房间…");

      try {
        const response = await fetch("./api/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: code,
            role,
            token: this.networkToken,
            character: this.onlineCharacter,
          }),
        });
        if (!response.ok) throw new Error(`join failed: ${response.status}`);
        const result = await response.json();
        this.networkCharacters = result.characters || null;
        this.networkReady = Boolean(result.ready);
        this.setOnlineStatus(
          result.ready
            ? "双方已连接，正在开始对战…"
            : role === "host"
              ? `房间 ${code} 创建成功，等待好友加入…`
              : "已连接，等待房主…",
        );
        if (result.ready && role === "host") this.startOnlineHostMatch();
        if (result.ready && role === "guest") this.startOnlineGuestMatch();
        void this.pollNetworkLoop(this.networkPollAbort.signal);
      } catch {
        this.setOnlineStatus("联机连接失败，请检查网络后重试。");
        this.networkReady = false;
        ui.createRoomButton.disabled = false;
        ui.joinRoomButton.disabled = false;
      }
    }

    disconnectNetwork() {
      if (this.networkToken && this.networkRoom && this.networkRole) {
        void fetch("./api/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.networkRoom,
            role: this.networkRole,
            token: this.networkToken,
          }),
          keepalive: true,
        }).catch(() => {});
      }
      this.networkPollAbort?.abort();
      this.networkPollAbort = null;
      this.networkReady = false;
      this.remoteKeys.clear();
      this.networkToken = null;
      this.networkSeq = 0;
      this.networkQueuedState = null;
      this.networkMessageQueue = [];
      this.onlineMode = null;
      this.networkRole = null;
      this.networkRoom = null;
      ui.createRoomButton.disabled = false;
      ui.joinRoomButton.disabled = false;
      ui.onlineRoomCode.hidden = true;
    }

    sendNetwork(message) {
      if (!this.networkToken || !this.networkRoom) return false;
      if (message.type === "state") this.networkQueuedState = message;
      else this.networkMessageQueue.push(message);
      void this.flushNetworkQueue();
      return true;
    }

    async flushNetworkQueue() {
      if (this.networkSendBusy || !this.networkToken) return;
      const message = this.networkMessageQueue.shift() || this.networkQueuedState;
      if (!message) return;
      if (message.type === "state") this.networkQueuedState = null;
      this.networkSendBusy = true;
      try {
        const response = await fetch("./api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.networkRoom,
            role: this.networkRole,
            token: this.networkToken,
            message,
          }),
        });
        if (response.status === 410) this.handleNetworkDisconnect();
      } catch {
        // The polling loop will surface a disconnected room.
      } finally {
        this.networkSendBusy = false;
        if (this.networkToken && (this.networkQueuedState || this.networkMessageQueue.length)) {
          window.setTimeout(() => void this.flushNetworkQueue(), 0);
        }
      }
    }

    async pollNetworkLoop(signal) {
      while (this.networkToken && !signal.aborted) {
        try {
          const query = new URLSearchParams({
            room: this.networkRoom,
            role: this.networkRole,
            token: this.networkToken,
            after: String(this.networkSeq),
          });
          const response = await fetch(`./api/poll?${query}`, {
            signal,
            cache: "no-store",
          });
          if (response.status === 410) {
            this.handleNetworkDisconnect();
            return;
          }
          if (!response.ok) throw new Error(`poll failed: ${response.status}`);
          const result = await response.json();
          this.networkSeq = Math.max(this.networkSeq, Number(result.lastSeq) || 0);
          for (const message of result.messages || []) this.handleNetworkMessage(message);
          if (!(result.messages || []).length) {
            await new Promise((resolve) => window.setTimeout(resolve, 120));
          }
        } catch (error) {
          if (signal.aborted) return;
          await new Promise((resolve) => window.setTimeout(resolve, 500));
        }
      }
    }

    handleNetworkDisconnect() {
      if (this.phase !== "menu") {
        this.showToast("联机连接已断开");
        this.returnToLobby(true);
      } else {
        this.networkReady = false;
        this.setOnlineStatus("连接已断开，可以重新创建或加入房间。");
      }
    }

    handleNetworkMessage(message) {
      if (message.type === "waiting") {
        this.setOnlineStatus(
          this.networkRole === "host"
            ? `房间 ${this.networkRoom} 创建成功，等待好友加入…`
            : "已进入房间，等待房主开始…",
        );
        return;
      }
      if (message.type === "ready") {
        this.networkReady = true;
        this.networkCharacters = message.characters || this.networkCharacters;
        if (this.networkRole === "host") {
          this.setOnlineStatus("好友已加入，正在开始对战！");
          this.startOnlineHostMatch();
        } else {
          this.setOnlineStatus("双方已连接，等待房主开始对战…");
        }
        return;
      }
      if (message.type === "match-start" && this.networkRole === "guest") {
        this.networkCharacters = message.characters || this.networkCharacters;
        this.startOnlineGuestMatch();
        return;
      }
      if (message.type === "round-start" && this.networkRole === "guest") {
        if (this.phase === "countdown" && message.roundNumber === this.roundNumber) return;
        this.roundNumber = message.roundNumber || 1;
        this.startRound();
        return;
      }
      if (message.type === "input" && this.onlineMode === "host") {
        this.applyRemoteGuestInput(message);
        return;
      }
      if (message.type === "rebirth-accept" && this.onlineMode === "host") {
        this.acceptNetworkRebirth();
        return;
      }
      if (message.type === "rebirth-prompt" && this.onlineMode === "guest") {
        this.networkRebirthAwaiting = true;
        ui.rebirthPrompt.hidden = false;
        void ui.rebirthPrompt.offsetWidth;
        audio.rebirthCue();
        window.setTimeout(() => {
          if (!this.networkRebirthAwaiting) return;
          this.networkRebirthAwaiting = false;
          ui.rebirthPrompt.hidden = true;
        }, message.duration || 1800);
        return;
      }
      if (message.type === "rebirth-start" && this.onlineMode === "guest") {
        this.networkRebirthAwaiting = false;
        ui.rebirthPrompt.hidden = true;
        this.startDivineTransition(this.enemy);
        return;
      }
      if (message.type === "rebirth-fail" && this.onlineMode === "guest") {
        this.networkRebirthAwaiting = false;
        ui.rebirthPrompt.hidden = true;
        return;
      }
      if (message.type === "state" && this.onlineMode === "guest") {
        this.applyNetworkSnapshot(message.state);
        return;
      }
      if (message.type === "combat-audio" && this.onlineMode === "guest") {
        if (message.kind === "block") audio.block();
        else audio.combatHit(message.kind, Boolean(message.heavy), Boolean(message.ultimate));
        return;
      }
      if (message.type === "ultimate") {
        this.applyRemoteUltimateEvent(message);
        return;
      }
      if (message.type === "divine-cast" && this.onlineMode === "guest") {
        if (message.event === "start") {
          const move = DIVINE_MOVES[message.kind];
          if (!move) return;
          ui.divineSkillCastImage.src = move.art;
          ui.divineSkillCastTitle.textContent = move.name;
          ui.divineSkillCast.hidden = false;
          ui.divineSkillCast.classList.remove("is-visible");
          void ui.divineSkillCast.offsetWidth;
          ui.divineSkillCast.classList.add("is-visible");
        } else {
          ui.divineSkillCast.hidden = true;
          ui.divineSkillCast.classList.remove("is-visible");
        }
        return;
      }
      if (message.type === "finisher" && this.onlineMode === "guest") {
        this.showKOFinisher(message.character || "naiwa");
        return;
      }
      if (message.type === "peer-disconnected") {
        this.showToast(this.onlineMode === "host" ? "玩家 2 已离开房间" : "房主已离开房间");
        if (this.phase !== "menu") this.returnToLobby(true);
        else {
          this.networkReady = false;
          this.setOnlineStatus("好友已离开房间。");
        }
      }
    }

    startOnlineHostMatch() {
      this.onlineMode = "host";
      const hostCharacter =
        this.networkCharacters?.host === "mini" ? "mini" : "naiwa";
      const guestCharacter =
        this.networkCharacters?.guest === "mini"
          ? "mini"
          : this.onlineCharacter === "mini"
            ? "mini"
            : "naiwa";
      this.playerCharacter = hostCharacter;
      this.enemyCharacter = guestCharacter;
      this.player.character = hostCharacter;
      this.enemy.character = guestCharacter;
      this.selectedCharacter = hostCharacter;
      this.selectCharacter(hostCharacter === "divine" ? "naiwa" : hostCharacter, false);
      this.sendNetwork({
        type: "match-start",
        characters: this.networkCharacters,
        roundNumber: 1,
      });
      this.closeOnlinePanel();
      this.startMatch();
      this.configureOnlineNames();
      void this.warmAudioInBackground(false);
    }

    startOnlineGuestMatch() {
      if (
        this.networkRole !== "guest" ||
        !["menu", "roundOver", "matchOver"].includes(this.phase)
      ) {
        return;
      }
      this.onlineMode = "guest";
      this.setOnlineStatus("联机对战中");
      const hostCharacter =
        this.networkCharacters?.host === "mini" ? "mini" : "naiwa";
      const guestCharacter =
        this.networkCharacters?.guest === "mini"
          ? "mini"
          : this.onlineCharacter === "mini"
            ? "mini"
            : "naiwa";
      this.playerCharacter = hostCharacter;
      this.enemyCharacter = guestCharacter;
      this.player.character = hostCharacter;
      this.enemy.character = guestCharacter;
      this.selectedCharacter = guestCharacter;
      this.selectCharacter(guestCharacter === "divine" ? "naiwa" : guestCharacter, false);
      this.closeOnlinePanel();
      this.startMatch();
      this.configureOnlineNames();
      void this.warmAudioInBackground(false);
    }

    configureOnlineNames() {
      ui.enemyDifficultyTag.textContent = "ONLINE";
      const localPlayer =
        CHARACTER_CONFIG[this.player.character] || CHARACTER_CONFIG.naiwa;
      const opponent =
        CHARACTER_CONFIG[this.enemy.character] || CHARACTER_CONFIG.naiwa;
      ui.playerPortrait.src = localPlayer.portrait;
      ui.enemyPortrait.src = opponent.portrait;
      ui.playerName.textContent =
        this.onlineMode === "guest" ? `玩家 1 · ${localPlayer.name}` : localPlayer.name;
      ui.playerNameEn.textContent = localPlayer.english;
      ui.enemyName.textContent =
        this.onlineMode === "guest" ? `你 · ${opponent.name}` : `玩家 2 · ${opponent.name}`;
      if (this.onlineMode === "guest") {
        ui.playerName.textContent = `玩家 1 · ${localPlayer.name}`;
        ui.playerNameEn.textContent = `HOST · ${localPlayer.english}`;
      }
    }

    applyRemoteGuestInput(message) {
      if (this.phase !== "playing" || this.onlineMode !== "host") return;
      const enemy = this.enemy;
      if (message.kind === "key") {
        if (message.down) this.remoteKeys.add(message.key);
        else this.remoteKeys.delete(message.key);
        if (message.key === "z" && message.down) this.tryArmPerfectBlock(enemy);
        return;
      }
      if (message.kind === "jump" && message.down) {
        enemy.jump();
        return;
      }
      if (message.kind === "action") {
        if (message.action === "ultimate") enemy.startUltimate();
        else enemy.requestAttack(message.action);
      }
    }

    serializeFighter(fighter) {
      return {
        character: fighter.character,
        x: fighter.x,
        y: fighter.y,
        vx: fighter.vx,
        vy: fighter.vy,
        grounded: fighter.grounded,
        facing: fighter.facing,
        health: fighter.health,
        meter: fighter.meter,
        wins: fighter.wins,
        blocking: fighter.blocking,
        ko: fighter.ko,
        koRotation: fighter.koRotation,
        action: fighter.action,
        actionTime: fighter.actionTime,
        actionDuration: fighter.actionDuration,
        hitFlash: fighter.hitFlash,
        hitTilt: fighter.hitTilt,
        hitStun: fighter.hitStun,
        invulnerable: fighter.invulnerable,
        burnTime: fighter.burnTime,
        burnMaxTime: fighter.burnMaxTime,
        burnInferno: fighter.burnInferno,
        divineMarkTime: fighter.divineMarkTime,
        shield: fighter.shield,
        shieldMax: fighter.shieldMax,
        shieldHealPool: fighter.shieldHealPool,
      };
    }

    createNetworkSnapshot() {
      return {
        type: "state",
        state: {
          phase: this.phase,
          roundTime: this.roundTime,
          countdown: this.countdown,
          roundNumber: this.roundNumber,
          playerCombo: this.playerCombo,
          enemyCombo: this.enemyCombo,
          shake: this.shake,
          flash: this.flash,
          cameraKick: this.cameraKick,
          cameraRoll: this.cameraRoll,
          cameraFocus: this.cameraFocus,
          crowdEnergy: this.crowdEnergy,
          koReason: this.koReason,
          player: this.serializeFighter(this.player),
          enemy: this.serializeFighter(this.enemy),
          pendingWinner: this.pendingWinner
            ? this.pendingWinner.isPlayer
              ? "player"
              : "enemy"
            : null,
          ultimate: this.ultimate
            ? {
                mode: this.ultimate.mode,
                owner: this.ultimate.owner.isPlayer ? "player" : "enemy",
                time: this.ultimate.time,
                damageStarted: this.ultimate.damageStarted,
                isMini: this.ultimate.isMini,
                isDivine: this.ultimate.isDivine,
              }
            : null,
          projectiles: this.projectiles.slice(0, 24).map((projectile) => ({
            ...projectile,
            owner: projectile.owner.isPlayer ? "player" : "enemy",
          })),
          effects: this.effects.slice(-64),
          damageFloats: this.damageFloats.slice(-20),
          impacts: this.impacts.slice(-12),
        },
      };
    }

    applyNetworkSnapshot(snapshot) {
      if (!snapshot || this.onlineMode !== "guest") return;
      const previousPhase = this.phase;
      const previousCharacters = `${this.player.character}:${this.enemy.character}`;
      Object.assign(this.player, snapshot.player);
      Object.assign(this.enemy, snapshot.enemy);
      this.phase = snapshot.phase;
      this.roundTime = snapshot.roundTime;
      this.countdown = snapshot.countdown;
      this.roundNumber = snapshot.roundNumber;
      this.playerCombo = snapshot.playerCombo;
      this.enemyCombo = snapshot.enemyCombo;
      this.shake = snapshot.shake || 0;
      this.flash = snapshot.flash || 0;
      this.cameraKick = snapshot.cameraKick || 0;
      this.cameraRoll = snapshot.cameraRoll || 0;
      this.cameraFocus = snapshot.cameraFocus || WIDTH / 2;
      this.crowdEnergy = snapshot.crowdEnergy || 0;
      this.koReason = snapshot.koReason;
      this.pendingWinner =
        snapshot.pendingWinner === "player"
          ? this.player
          : snapshot.pendingWinner === "enemy"
            ? this.enemy
            : null;
      this.projectiles = snapshot.projectiles.map((projectile) => ({
        ...projectile,
        owner: projectile.owner === "player" ? this.player : this.enemy,
      }));
      this.effects = snapshot.effects || [];
      this.damageFloats = snapshot.damageFloats || [];
      this.impacts = snapshot.impacts || [];
      this.ultimate = null;
      gameFrame.classList.remove("is-playing", "is-round-over", "is-match-over");
      if (snapshot.phase === "playing" || snapshot.phase === "ko") {
        gameFrame.classList.add("is-playing");
      } else if (snapshot.phase === "roundOver") {
        gameFrame.classList.add("is-round-over");
      } else if (snapshot.phase === "matchOver") {
        gameFrame.classList.add("is-match-over");
      }
      if (snapshot.phase === "playing" && previousPhase !== "playing") this.startMatchMusic();
      if (["ko", "roundOver", "matchOver"].includes(snapshot.phase)) this.pauseMatchMusic();
      this.updateHUD();

      if (snapshot.phase === "roundOver" && previousPhase !== "roundOver") {
        ui.roundOverlay.hidden = false;
        ui.roundKicker.textContent = `ROUND ${snapshot.roundNumber}`;
        ui.roundWinner.textContent =
          snapshot.pendingWinner === "player" ? "房主拿下一局！" : "你拿下一局！";
        ui.roundReason.textContent = snapshot.koReason || "本回合结束。";
        ui.nextRoundLabel.textContent = "等待房主开始下一回合";
        ui.nextRoundButton.disabled = true;
      } else if (snapshot.phase === "matchOver") {
        ui.roundOverlay.hidden = true;
        ui.finalOverlay.hidden = false;
        const playerWon = snapshot.player.wins >= 2;
        ui.finalPretitle.textContent = playerWon ? "房主获胜" : "你获得胜利";
        ui.finalWinner.textContent = playerWon ? "玩家 1" : "玩家 2";
        ui.finalScore.textContent = `${snapshot.player.wins} : ${snapshot.enemy.wins}`;
        ui.finalQuote.textContent = playerWon ? "房主守住了擂台。" : "联机对战胜利！";
        ui.rematchButton.disabled = true;
      } else {
        ui.roundOverlay.hidden = true;
        ui.finalOverlay.hidden = true;
        ui.nextRoundButton.disabled = false;
        ui.rematchButton.disabled = false;
      }
      if (`${this.player.character}:${this.enemy.character}` !== previousCharacters) {
        this.configureOnlineNames();
      }
    }

    applyRemoteUltimateEvent(message) {
      if (this.onlineMode !== "guest") return;
      if (message.event === "start") {
        const isMini = Boolean(message.isMini);
        const isDivine = Boolean(message.isDivine);
        ui.holyUltimate.classList.toggle("is-divine", isDivine);
        ui.holyUltimate.classList.toggle("is-naiwa", !isMini && !isDivine);
        ui.holyUltimateKicker.textContent = isDivine
          ? "DIVINE NAIWA · HEAVENLY INFERNO"
          : isMini
            ? "MINI NAIWA · DIVINE ARRIVAL"
            : "NAIWA · FOUR-STAGE BELLY LAUGH";
        ui.holyUltimateTitle.textContent = isDivine
          ? "神临·九霄"
          : isMini
            ? "奶娃神圣降临"
            : "捧腹大笑";
        ui.holyUltimateLine.textContent = isDivine
          ? "天火垂落，万象俱寂。"
          : isMini
            ? "圣光落下，只为一击。"
            : "四段笑浪，声到之处全部击飞。";
        ui.holyUltimateMiniImage.hidden = !isMini;
        ui.holyUltimateNaiwaImage.hidden = isMini || isDivine;
        ui.holyUltimateDivineImage.hidden = !isDivine;
        ui.holyUltimate.hidden = false;
        this.duckMatchMusic();
        ui.holyUltimate.classList.remove("is-visible", "is-leaving");
        void ui.holyUltimate.offsetWidth;
        ui.holyUltimate.classList.add("is-visible");
      } else if (message.event === "hit" || message.event === "end") {
        ui.holyUltimate.hidden = true;
        ui.holyUltimate.classList.remove("is-visible");
        if (message.event === "end") this.restoreMatchMusicVolume();
      }
    }

    prepareMatchMusic() {
      const track = ui.matchMusicAudio;
      track.muted = !audio.enabled;
      track.volume = 0;
      try {
        track.currentTime = 0;
      } catch {
        // Metadata may still be loading on the first round.
      }
      track.play().catch(() => {});
    }

    primeMatchMusic() {
      const track = ui.matchMusicAudio;
      track.muted = true;
      track.volume = 0;
      track.play()
        .then(() => {
          track.pause();
          track.currentTime = 0;
          track.muted = !audio.enabled;
          track.volume = 0.12;
        })
        .catch(() => {});
    }

    startMatchMusic() {
      this.ensureMatchMusicPlaying();
    }

    pauseMatchMusic() {
      ui.matchMusicAudio.pause();
    }

    duckMatchMusic() {
      const track = ui.matchMusicAudio;
      if (track.paused) return;
      track.volume = 0.045;
    }

    restoreMatchMusicVolume() {
      const track = ui.matchMusicAudio;
      if (!audio.enabled || this.phase !== "playing" || this.paused) {
        track.volume = 0.12;
        return;
      }
      track.muted = false;
      track.volume = 0.12;
      this.ensureMatchMusicPlaying();
    }

    ensureMatchMusicPlaying() {
      if (!audio.enabled || this.phase !== "playing" || this.paused) return;
      const track = ui.matchMusicAudio;
      track.muted = false;
      track.volume = 0.12;
      if (track.ended || (Number.isFinite(track.duration) && track.currentTime >= track.duration - 0.05)) {
        try {
          track.currentTime = 0;
        } catch {
          // The media element may not have metadata yet.
        }
      }
      const play = () => {
        if (!audio.enabled || this.phase !== "playing" || this.paused) return;
        const result = track.play();
        if (result?.catch) {
          result.catch(() => {
            // A transition can briefly make the browser defer media playback.
            // Retry once on the next task instead of leaving the match silent.
            window.setTimeout(() => {
              if (!audio.enabled || this.phase !== "playing" || this.paused) return;
              track.play().catch(() => {});
            }, 120);
          });
        }
      };
      play();
    }

    resumeMatchMusic() {
      if (audio.enabled && this.phase === "playing" && !this.paused) this.startMatchMusic();
    }

    stopMatchMusic() {
      ui.matchMusicAudio.pause();
      ui.matchMusicAudio.volume = 0.12;
      try {
        ui.matchMusicAudio.currentTime = 0;
      } catch {
        // Ignore a metadata race while returning to the lobby.
      }
    }

    async warmAudioInBackground(startLobbyMusic) {
      try {
        await audio.ensure();
        ui.matchMusicAudio.load();
        if (this.selectedCharacter === "naiwa") {
          ui.ultimateAudio.load();
          ui.divineUltimateAudio.load();
        } else {
          ui.miniUltimateAudio.load();
        }
        if (startLobbyMusic) await audio.startLobbyMusic();
        this.updateLobbyMusicButton();
      } catch {
        // Audio preparation must never block match start on mobile browsers.
      }
    }

    async enterMobileLandscape() {
      if (!this.mobileMode) return;
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen({ navigationUI: "hide" });
        }
      } catch {
        // Some mobile browsers require installation or do not allow element fullscreen.
      }
      try {
        if (screen.orientation?.lock) await screen.orientation.lock("landscape");
      } catch {
        // Orientation lock is best-effort; the landscape layout remains active.
      }
      window.scrollTo(0, 0);
    }

    resize() {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low";
    }

    onKeyDown(event) {
      const key = event.key.toLowerCase();
      const controlledKeys = ["a", "d", "z", "f", "c", "g", "t", "b", "j", " ", "p", "enter", "escape", "?"];
      if (controlledKeys.includes(key)) event.preventDefault();

      if (key === "enter") {
        if (!ui.startScreen.classList.contains("is-leaving") && !ui.startButton.disabled) {
          ui.startButton.click();
        } else if (!ui.roundOverlay.hidden) {
          this.prepareNextRound();
        } else if (!ui.finalOverlay.hidden) {
          this.startMatch();
        }
        return;
      }

      if (key === "?" || (event.shiftKey && key === "/")) {
        this.toggleHelp();
        return;
      }

      if (key === "escape") {
        if (!ui.hiddenCharacterModal.hidden) {
          ui.hiddenCharacterModal.hidden = true;
        } else if (!ui.helpPanel.hidden) {
          this.toggleHelp(false);
        } else if (this.paused) {
          this.setPaused(false);
        } else if (this.phase === "playing") {
          if (this.onlineMode) this.showToast("联机对战中不能暂停");
          else this.togglePause();
        }
        return;
      }

      if (key === "p") {
        if (this.onlineMode) {
          this.showToast("联机对战中不能暂停");
          return;
        }
        if (!ui.helpPanel.hidden) {
          this.toggleHelp(false);
          return;
        }
        this.togglePause();
        return;
      }

      if (key === "j" && this.networkRebirthAwaiting) {
        this.networkRebirthAwaiting = false;
        ui.rebirthPrompt.hidden = true;
        this.sendNetwork({ type: "rebirth-accept" });
        return;
      }

      if (key === "j" && this.rebirthPending) {
        this.acceptRebirth();
        return;
      }

      if (event.repeat || this.paused || !ui.helpPanel.hidden) return;

      if (key === "b" && this.ultimate?.owner === this.player) {
        this.skipUltimate();
        return;
      }

      if (key === "a" || key === "d" || key === "z") {
        if (this.onlineMode === "guest") {
          this.sendNetwork({ type: "input", kind: "key", key, down: true });
          return;
        }
        this.keys.add(key);
        if (key === "z") this.tryArmPerfectBlock();
        return;
      }

      if (key === " ") {
        if (this.onlineMode === "guest") {
          this.sendNetwork({ type: "input", kind: "jump", down: true });
          return;
        }
        this.player.jump();
        return;
      }

      const keyboardActions = {
        f: "light",
        c: "heavy",
        g: "rush",
        t: "heal",
        b: "ultimate",
      };
      if (keyboardActions[key]) this.performAction(keyboardActions[key]);
    }

    onKeyUp(event) {
      const key = event.key.toLowerCase();
      if (key === "a" || key === "d" || key === "z") {
        if (this.onlineMode === "guest") {
          this.sendNetwork({ type: "input", kind: "key", key, down: false });
        } else {
          this.keys.delete(key);
        }
      }
    }

    performAction(action) {
      if (this.paused || this.phase !== "playing") return;
      if (this.onlineMode === "guest") {
        this.sendNetwork({ type: "input", kind: "action", action });
        return;
      }
      if (this.divineCast) return;
      if (this.ultimate?.owner === this.player) {
        if (action === "ultimate") this.skipUltimate();
        return;
      }
      if (action === "ultimate") this.player.startUltimate();
      else this.player.requestAttack(action);
    }

    toggleSound() {
      const enabled = audio.toggle();
      ui.soundLabel.textContent = enabled ? "声音开" : "声音关";
      ui.soundIcon.textContent = enabled ? "♪" : "×";
      ui.soundButton.setAttribute("aria-label", enabled ? "关闭声音" : "开启声音");
      ui.ultimateAudio.muted = !enabled;
      ui.miniUltimateAudio.muted = !enabled;
      ui.divineUltimateAudio.muted = !enabled;
      ui.matchMusicAudio.muted = !enabled;
      ui.koAnthemAudio.muted = !enabled;
      ui.divineTransitionVideo.muted = !enabled;
      if (enabled && audio.lobbyRequested && !["playing", "ko"].includes(this.phase)) {
        audio.resumeLobbyMusic();
      }
      if (enabled && this.phase === "playing" && !this.paused) this.startMatchMusic();
      if (!enabled) this.pauseMatchMusic();
      this.updateLobbyMusicButton();
    }

    updateLobbyMusicButton() {
      const isOn = audio.lobbyRequested && audio.enabled;
      const isMuted = audio.lobbyRequested && !audio.enabled;
      ui.lobbyMusicButton.classList.toggle("is-playing", isOn);
      ui.lobbyMusicButton.querySelector("i").textContent = isOn ? "ON" : isMuted ? "MUTE" : "OFF";
      ui.lobbyMusicButton.querySelector("small").textContent = isOn
        ? "彩虹旋律循环播放中"
        : isMuted
          ? "声音已关闭"
          : "原创温柔循环 · 点击播放";
    }

    initLobbyAutoplay() {
      const startMusic = () => {
        if (!["menu", "matchOver", "roundOver"].includes(this.phase)) return;
        audio.lobbyRequested = true;
        this.updateLobbyMusicButton();
        void audio
          .startLobbyMusic()
          .then((started) => {
            this.updateLobbyMusicButton();
            return started;
          })
          .catch(() => {});
      };
      // Attempt immediately; mobile browsers resume it on the first interaction.
      startMusic();
      window.addEventListener("pointerdown", startMusic, { once: true });
      window.addEventListener("keydown", startMusic, { once: true });
    }

    selectCharacter(character, playSound = true) {
      const config = CHARACTER_CONFIG[character];
      if (!config) return;
      this.selectedCharacter = character;
      if (!this.onlineMode) {
        this.playerCharacter = character;
        if (this.player) this.player.character = character;
        if (["naiwa", "mini"].includes(character)) this.onlineCharacter = character;
      }
      ui.heroPose.src = config.hero;
      ui.playerPortrait.src = config.portrait;
      ui.playerName.textContent = config.name;
      ui.playerNameEn.textContent = config.english;
      ui.characterPicker.querySelectorAll("[data-character]").forEach((button) => {
        const selected = button.dataset.character === character;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      ui.skillCards.forEach((card) => {
        const move = config.moves[card.dataset.skill];
        if (!move) return;
        card.querySelector("strong").textContent = move.name;
        card.querySelector("span:not(.portrait-tag)").textContent = move.detail;
        card.querySelector(".skill-art img").src = move.art;
      });
      const touchLabels =
        character === "mini"
          ? { light: "戳戳", heavy: "飞踢", rush: "爱心", heal: "回血", ultimate: "降临" }
          : character === "divine"
            ? { light: "焚印", heavy: "焚冲", rush: "结界", heal: "爆弹", ultimate: "天火" }
            : { light: "拍肚", heavy: "弹飞", rush: "冲拳", heal: "回血", ultimate: "大笑" };
      document.querySelectorAll("#touchControls [data-action]").forEach((button) => {
        const label = touchLabels[button.dataset.action];
        const small = button.querySelector("small");
        if (label && small) small.textContent = label;
      });
      if (playSound && audio.enabled) {
        audio.tone(character === "mini" ? 660 : 520, 0.08, {
          type: "triangle",
          volume: 0.055,
          slideTo: character === "mini" ? 880 : 690,
        });
      }
      if (playSound) {
        ui.heroPose.classList.remove("is-switching");
        void ui.heroPose.offsetWidth;
        ui.heroPose.classList.add("is-switching");
      }
      if (character === "mini") {
        ui.miniUltimateAudio.muted = !audio.enabled;
        ui.miniUltimateAudio.load();
      } else {
        ui.ultimateAudio.muted = !audio.enabled;
        ui.ultimateAudio.load();
        ui.divineUltimateAudio.muted = !audio.enabled;
        ui.divineUltimateAudio.load();
      }
    }

    selectDifficulty(key, playSound = true) {
      const config = DIFFICULTIES[key];
      if (!config) return;
      this.difficultyKey = key;
      this.difficulty = config;
      ui.difficultyPicker.querySelectorAll("[data-difficulty]").forEach((button) => {
        const selected = button.dataset.difficulty === key;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      ui.enemyDifficultyTag.textContent = `AI · ${config.label}`;
      if (!this.onlineMode) ui.enemyName.textContent = "苦瓜奶霸";
      this.enemy.health = this.enemy.maxHealth;
      this.enemy.meter = 0;
      this.updateHUD();
      if (playSound && audio.enabled) {
        audio.tone(key === "hell" ? 132 : key === "hard" ? 196 : 262, 0.11, {
          type: "triangle",
          volume: 0.06,
          slideTo: key === "hell" ? 96 : key === "hard" ? 160 : 220,
        });
      }
    }

    updatePlayerIdentity() {
      const config = CHARACTER_CONFIG[this.selectedCharacter];
      if (this.divineForm) {
        ui.playerName.textContent = "神-奶娃";
        ui.playerNameEn.textContent = "DIVINE NAIWA";
        ui.playerPortrait.src = "./assets/characters/divine-aura-v3.png";
        document.body.classList.add("divine-form-active");
        ui.skillCards.forEach((card) => {
          const move = DIVINE_MOVES[card.dataset.skill];
          if (!move) return;
          card.querySelector("strong").textContent = move.name;
          card.querySelector("span:not(.portrait-tag)").textContent = move.detail;
          card.querySelector(".skill-art img").src = move.art;
        });
        document.querySelectorAll("#touchControls [data-action]").forEach((button) => {
          const labels = { light: "焚印", heavy: "焚冲", rush: "结界", heal: "爆弹", ultimate: "天火" };
          const small = button.querySelector("small");
          if (small && labels[button.dataset.action]) small.textContent = labels[button.dataset.action];
        });
        return;
      }
      document.body.classList.remove("divine-form-active");
      ui.playerName.textContent = config.name;
      ui.playerNameEn.textContent = config.english;
      ui.playerPortrait.src = config.portrait;
      ui.skillCards.forEach((card) => {
        const move = config.moves[card.dataset.skill];
        if (!move) return;
        card.querySelector("strong").textContent = move.name;
        card.querySelector("span:not(.portrait-tag)").textContent = move.detail;
        card.querySelector(".skill-art img").src = move.art;
      });
      const touchLabels =
        this.selectedCharacter === "mini"
          ? { light: "戳戳", heavy: "飞踢", rush: "爱心", heal: "回血", ultimate: "降临" }
          : { light: "拍肚", heavy: "弹飞", rush: "冲拳", heal: "回血", ultimate: "大笑" };
      document.querySelectorAll("#touchControls [data-action]").forEach((button) => {
        const label = touchLabels[button.dataset.action];
        const small = button.querySelector("small");
        if (label && small) small.textContent = label;
      });
    }

    clearRebirthState() {
      if (this.rebirthTimer) clearTimeout(this.rebirthTimer);
      this.rebirthTimer = null;
      this.rebirthPending = null;
      ui.rebirthPrompt.hidden = true;
    }

    clearDivineTransition() {
      if (this.divineTransitionTimer) clearTimeout(this.divineTransitionTimer);
      this.divineTransitionTimer = null;
      this.divineTransitionActive = false;
      this.divineTransitionFinishing = false;
      ui.divineTransitionVideo.pause();
      try {
        ui.divineTransitionVideo.currentTime = 0;
      } catch {
        // Ignore a decode race while the transition is shutting down.
      }
      ui.divineTransition.hidden = true;
      ui.divineTransition.classList.remove("is-playing");
      gameFrame.classList.remove("is-cinematic");
    }

    ensureDivineAura() {
      if (images.divineAura) return Promise.resolve(images.divineAura);
      if (this.divineAuraPromise) return this.divineAuraPromise;
      this.divineAuraPromise = loadImage(assetSources.divineAura)
        .then((image) => {
          images.divineAura = image;
          return image;
        })
        .finally(() => {
          this.divineAuraPromise = null;
        });
      return this.divineAuraPromise;
    }

    resetDivineState() {
      this.clearRebirthState();
      this.clearDivineTransition();
      this.divineForm = false;
      if (this.player && !this.onlineMode) {
        this.player.character = this.playerCharacter || this.selectedCharacter;
      }
      this.divineRebirthUsed = false;
      this.divineCast = null;
      this.divineBarrage = null;
      ui.divineSkillCast.hidden = true;
      ui.divineSkillCast.classList.remove("is-visible");
      ui.holyUltimate.classList.remove("is-divine");
      this.updatePlayerIdentity();
    }

    beginDivineSkillCast(kind, owner) {
      const move = DIVINE_MOVES[kind];
      if (
        this.getFighterCharacter(owner) !== "divine" ||
        !move ||
        this.phase !== "playing" ||
        this.divineCast ||
        this.ultimate
      ) {
        return false;
      }
      this.divineCast = {
        kind,
        owner,
        time: 0,
        duration: 1,
      };
      ui.divineSkillCastImage.src = move.art;
      ui.divineSkillCastTitle.textContent = move.name;
      ui.divineSkillCast.hidden = false;
      ui.divineSkillCast.classList.remove("is-visible");
      void ui.divineSkillCast.offsetWidth;
      ui.divineSkillCast.classList.add("is-visible");
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "divine-cast", event: "start", kind });
      }
      this.keys.clear();
      this.syncPauseButton();
      return true;
    }

    updateDivineSkillCast(dt) {
      if (!this.divineCast) return;
      this.divineCast.time += dt;
      if (this.divineCast.time < this.divineCast.duration) return;
      const { owner, kind } = this.divineCast;
      this.divineCast = null;
      ui.divineSkillCast.hidden = true;
      ui.divineSkillCast.classList.remove("is-visible");
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "divine-cast", event: "end" });
      }
      this.syncPauseButton();
      owner.startAttack(kind, true);
    }

    toggleHelp(force) {
      const shouldOpen = typeof force === "boolean" ? force : ui.helpPanel.hidden;
      ui.helpPanel.hidden = !shouldOpen;
      if (shouldOpen && this.phase === "playing") this.setPaused(true, true);
      if (!shouldOpen && this.paused) this.setPaused(false);
    }

    syncPauseButton() {
      const canPause =
        this.phase === "playing" &&
        !this.onlineMode &&
        !this.ultimate &&
        !this.divineCast &&
        !this.rebirthPending &&
        !this.divineTransitionActive;
      ui.pauseButton.disabled = !canPause;
      ui.pauseButton.classList.toggle("is-paused", this.paused);
      ui.pauseButtonLabel.textContent = this.paused ? "继续" : "暂停";
      ui.pauseButton.setAttribute("aria-label", this.paused ? "继续游戏" : "暂停游戏");
    }

    togglePause() {
      if (!ui.helpPanel.hidden || ui.pauseButton.disabled) return;
      this.setPaused(!this.paused);
    }

    setPaused(paused, fromHelp = false) {
      if (this.phase !== "playing" || (paused && (this.ultimate || this.divineCast))) return;
      this.paused = paused;
      ui.pauseOverlay.hidden = !paused || fromHelp;
      if (paused) this.keys.clear();
      if (fromHelp) ui.pauseOverlay.hidden = true;
      if (paused) this.pauseMatchMusic();
      else this.resumeMatchMusic();
      this.syncPauseButton();
    }

    startRebirthPrompt(attacker, target, data, direction) {
      if (this.selectedCharacter !== "naiwa" || this.divineForm) return;
      if (this.rebirthPending || this.divineTransitionActive || this.divineRebirthUsed) return;
      if (ui.divineTransitionVideo.readyState < 2) ui.divineTransitionVideo.load();
      void this.ensureDivineAura().catch(() => {});
      this.clearRebirthState();
      this.keys.clear();
      target.blocking = false;
      this.rebirthPending = { attacker, target, data, direction };
      ui.rebirthPrompt.hidden = false;
      void ui.rebirthPrompt.offsetWidth;
      audio.rebirthCue();
      this.syncPauseButton();
      this.rebirthTimer = window.setTimeout(() => this.failRebirth(), 1800);
    }

    startNetworkRebirthPrompt(attacker, target, data, direction) {
      if (this.networkRebirthPending || this.divineTransitionActive) return;
      this.keys.clear();
      target.blocking = false;
      this.networkRebirthPending = { attacker, target, data, direction };
      this.sendNetwork({ type: "rebirth-prompt", duration: 1800 });
      this.networkRebirthTimer = window.setTimeout(() => {
        const pending = this.networkRebirthPending;
        if (!pending) return;
        this.networkRebirthPending = null;
        this.networkRebirthTimer = null;
        this.sendNetwork({ type: "rebirth-fail" });
        this.applyHit(pending.attacker, pending.target, {
          ...pending.data,
          skipRebirth: true,
        });
      }, 1800);
    }

    acceptNetworkRebirth() {
      const pending = this.networkRebirthPending;
      if (!pending) return;
      if (this.networkRebirthTimer) window.clearTimeout(this.networkRebirthTimer);
      this.networkRebirthTimer = null;
      this.networkRebirthPending = null;
      pending.attacker.action = null;
      pending.attacker.actionResolved = false;
      pending.attacker.hitStun = Math.max(pending.attacker.hitStun, 0.75);
      this.startDivineTransition(pending.target);
    }

    failRebirth() {
      if (!this.rebirthPending) return;
      const pending = this.rebirthPending;
      this.clearRebirthState();
      this.syncPauseButton();
      this.applyHit(pending.attacker, pending.target, {
        ...pending.data,
        skipRebirth: true,
      });
    }

    acceptRebirth() {
      if (!this.rebirthPending) return;
      if (this.selectedCharacter !== "naiwa" || this.divineForm) {
        this.clearRebirthState();
        return;
      }
      const pending = this.rebirthPending;
      this.clearRebirthState();
      if (this.ultimate) this.finishUltimate();
      pending.attacker.action = null;
      pending.attacker.actionResolved = false;
      pending.attacker.hitStun = Math.max(pending.attacker.hitStun, 0.75);
      this.startDivineTransition();
    }

    startDivineTransition(target = this.player) {
      this.duckMatchMusic();
      this.divineTransitionActive = true;
      this.divineTransitionFinishing = false;
      this.divineTransitionTarget = target;
      this.paused = false;
      this.keys.clear();
      gameFrame.classList.add("is-cinematic");
      ui.divineTransition.hidden = false;
      ui.divineTransition.classList.remove("is-playing");
      ui.divineTransitionVideo.muted = !audio.enabled;
      ui.divineTransitionVideo.volume = 1;
      ui.divineTransitionVideo.preload = "auto";
      void this.ensureDivineAura().catch(() => {});
      try {
        ui.divineTransitionVideo.currentTime = 0;
      } catch {
        // The video may still be loading when the player presses J.
      }
      ui.divineTransitionVideo.play().catch(() => {
        ui.divineTransitionVideo.muted = true;
        ui.divineTransitionVideo.play().catch(() => {
          window.setTimeout(() => this.finishDivineTransition(), 650);
        });
      });
      // The clip is six seconds long. This is only a last-resort stuck-media
      // guard, not a normal playback cutoff.
      this.divineTransitionTimer = window.setTimeout(() => this.finishDivineTransition(), 12000);
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "rebirth-start" });
      }
      this.syncPauseButton();
    }

    async finishDivineTransition() {
      if (!this.divineTransitionActive || this.divineTransitionFinishing) return;
      this.divineTransitionFinishing = true;
      const target = this.divineTransitionTarget || this.player;
      // Keep the cinematic layer up while the transparent divine portrait
      // finishes decoding. This prevents the first post-video frame from
      // falling back to the ordinary Naiwa artwork.
      ui.divineTransition.classList.remove("is-playing");
      try {
        await this.ensureDivineAura();
      } catch {
        // The boot-time preload normally wins this race. If it does not, let
        // the round continue rather than trapping the player on a black screen.
      }
      if (!this.divineTransitionActive) return;
      this.clearDivineTransition();
      target.character = "divine";
      target.divineRebirthUsed = true;
      if (target.isPlayer) {
        this.divineForm = true;
        this.divineRebirthUsed = true;
      }
      this.roundTime = ROUND_SECONDS;
      target.health = target.maxHealth;
      target.meter = 0;
      target.hitStun = 0;
      target.hitFlash = 0;
      target.invulnerable = Math.max(target.invulnerable, 1.2);
      target.action = null;
      target.actionResolved = false;
      if (target.isPlayer) this.updatePlayerIdentity();
      this.flash = 0.62;
      this.shake = 28;
      this.cameraKick = 0.075;
      this.crowdEnergy = 1;
      this.spawnPerfectBlockEffect(target.x, target.y - 165, target.facing);
      this.showCallout("涅槃重生！", "divine-rebirth", true);
      audio.divineImpact();
      this.restoreMatchMusicVolume();
      this.updateHUD();
      this.syncPauseButton();
    }

    startMatch() {
      document.body.classList.remove("mobile-start");
      ui.hiddenCharacterModal.hidden = true;
      ui.startScreen.classList.add("is-leaving");
      ui.finalOverlay.hidden = true;
      ui.roundOverlay.hidden = true;
      this.player.wins = 0;
      this.enemy.wins = 0;
      this.finished = false;
      this.roundNumber = 1;
      this.updateRoundMarkers();
      this.startRound();
    }

    startRound() {
      ui.roundOverlay.hidden = true;
      ui.finalOverlay.hidden = true;
      ui.koBadge.classList.remove("is-visible");
      ui.koFinisher.hidden = true;
      ui.koFinisher.classList.remove("is-visible", "is-leaving", "is-divine");
      this.koFinisherActive = false;
      ui.holyUltimate.hidden = true;
      ui.holyUltimate.classList.remove("is-visible", "is-leaving");
      this.resetDivineState();
      ui.ultimateAudio.pause();
      ui.ultimateAudio.currentTime = 0;
      ui.miniUltimateAudio.pause();
      ui.miniUltimateAudio.currentTime = 0;
      ui.divineUltimateAudio.pause();
      ui.divineUltimateAudio.currentTime = 0;
      ui.koAnthemAudio.pause();
      ui.koAnthemAudio.currentTime = 0;
      audio.stopLaugh(0);
      ui.holyUltimate.hidden = true;
      this.player.reset();
      this.enemy.reset();
      this.player.character = this.playerCharacter || this.selectedCharacter;
      this.enemy.character = this.enemyCharacter || "naiwa";
      this.projectiles.length = 0;
      this.effects.length = 0;
      this.damageFloats.length = 0;
      this.impacts.length = 0;
      this.keys.clear();
      this.ultimate = null;
      this.divineCast = null;
      this.divineBarrage = null;
      if (this.networkRebirthTimer) window.clearTimeout(this.networkRebirthTimer);
      this.networkRebirthTimer = null;
      this.networkRebirthPending = null;
      this.networkRebirthAwaiting = false;
      this.pendingWinner = null;
      this.perfectBlock = null;
      this.koTimer = 0;
      this.roundTime = ROUND_SECONDS;
      this.countdown = 3.25;
      this.calloutKey = "";
      this.phase = "countdown";
      this.paused = false;
      this.finished = false;
      this.playerCombo = 0;
      this.enemyCombo = 0;
      this.comboClock = 0;
      this.hitStop = 0;
      this.shake = 0;
      this.flash = 0;
      this.cameraKick = 0;
      this.cameraRoll = 0;
      this.cameraFocus = (this.player.x + this.enemy.x) / 2;
      this.slowMotion = 0;
      gameFrame.classList.remove("is-playing", "is-round-over", "is-match-over", "is-cinematic");
      ui.roundLabel.textContent = ["第一回合", "第二回合", "第三回合"][this.roundNumber - 1];
      this.prepareMatchMusic();
      this.updateHUD();
      this.syncPauseButton();
      if (this.onlineMode) this.configureOnlineNames();
      this.remoteKeys.clear();
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "round-start", roundNumber: this.roundNumber });
      }
    }

    prepareNextRound() {
      if (this.onlineMode === "guest") return;
      if (this.finished) {
        this.startMatch();
        return;
      }
      ui.roundOverlay.hidden = true;
      this.roundNumber += 1;
      this.startRound();
    }

    returnToLobby(fromNetwork = false) {
      this.stopMatchMusic();
      if (!fromNetwork) this.disconnectNetwork();
      else {
        this.onlineMode = null;
        this.networkRole = null;
        this.networkRoom = null;
        this.networkReady = false;
        this.remoteKeys.clear();
      }
      this.phase = "menu";
      this.paused = false;
      this.finished = false;
      this.pendingWinner = null;
      this.perfectBlock = null;
      this.keys.clear();
      this.ultimate = null;
      this.resetDivineState();
      audio.stopLaugh(0);
      ui.ultimateAudio.pause();
      ui.ultimateAudio.currentTime = 0;
      ui.miniUltimateAudio.pause();
      ui.miniUltimateAudio.currentTime = 0;
      ui.divineUltimateAudio.pause();
      ui.divineUltimateAudio.currentTime = 0;
      ui.koAnthemAudio.pause();
      ui.koAnthemAudio.currentTime = 0;
      ui.holyUltimate.hidden = true;
      ui.koFinisher.hidden = true;
      ui.roundOverlay.hidden = true;
      ui.finalOverlay.hidden = true;
      ui.pauseOverlay.hidden = true;
      ui.onlinePanel.hidden = true;
      ui.hiddenCharacterModal.hidden = true;
      ui.koBadge.classList.remove("is-visible");
      ui.startScreen.classList.remove("is-leaving");
      ui.startScreen.hidden = false;
      ui.startButton.disabled = false;
      ui.startButtonLabel.textContent = this.debugDivineSkillDemo
        ? "重新开始四技能演示"
        : "一口奶气，正式开打";
      gameFrame.classList.remove("is-playing", "is-round-over", "is-match-over", "is-cinematic");
      document.body.classList.toggle("mobile-start", this.mobileMode);
      this.menuFrameDrawn = false;
      this.selectCharacter(this.selectedCharacter, false);
      this.selectDifficulty(this.difficultyKey, false);
      this.syncPauseButton();
      if (audio.lobbyRequested) audio.resumeLobbyMusic();
      this.updateLobbyMusicButton();
    }

    canControl() {
      return this.phase === "playing" && !this.paused && !this.ultimate && !this.player.ko && !this.enemy.ko;
    }

    tryArmPerfectBlock(target = this.player) {
      const targetIsOnlineHuman = this.onlineMode === "host" && target === this.enemy;
      if (!target.isPlayer && !targetIsOnlineHuman) return false;
      if (
        this.phase !== "playing" ||
        this.paused ||
        target.ko ||
        this.opponentOf(target).ko ||
        this.ultimate?.owner === target
      ) {
        return false;
      }

      const attacker = this.opponentOf(target);
      const ultimate = this.ultimate?.owner === attacker && this.ultimate.mode === "enemyCharge";
      const ultimateWindow =
        ultimate && !this.ultimate.damageStarted && this.ultimate.time <= 0.62;
      const skillWindow =
        !attacker.actionResolved &&
        ["light", "heavy", "rush"].includes(attacker.action) &&
        attacker.actionTime <= attacker.attackStartup + 0.12;

      if (!ultimateWindow && !skillWindow) return false;

      this.perfectBlock = {
        attacker,
        actionId: attacker.actionId,
        kind: ultimateWindow ? "ultimate" : "skill",
        timeLeft: ultimateWindow ? 1.4 : 0.7,
      };
      audio.perfectGuardReady();
      return true;
    }

    consumePerfectBlock(attacker) {
      const armed = this.perfectBlock;
      if (!armed) return false;
      if (armed.timeLeft <= 0) {
        this.perfectBlock = null;
        return false;
      }
      if (attacker !== armed.attacker || attacker.actionId !== armed.actionId) return false;
      this.perfectBlock = null;
      return true;
    }

    shouldEnemyPerfectBlock(attacker, target, data) {
      if (this.onlineMode) return false;
      const baseChance = this.difficulty.enemyPerfectBlockChance || 0;
      const chance = Math.max(0, baseChance - (this.divineForm ? 0.2 : 0));
      return (
        chance > 0 &&
        attacker.isPlayer &&
        !target.isPlayer &&
        !data.ultimate &&
        target.hitStun <= 0.08 &&
        (this.debugForceEnemyPerfectBlock || Math.random() < chance)
      );
    }

    spawnPerfectBlockEffect(x, y, direction) {
      this.spawnRing(x, y, "rgba(255, 246, 174, .96)", 190);
      this.spawnRing(x, y, "rgba(126, 255, 236, .9)", 128);
      this.spawnRing(x, y, "rgba(255, 255, 255, .82)", 72);
      for (let i = 0; i < 34; i += 1) {
        const angle = random(-Math.PI, Math.PI);
        const speed = random(150, 520);
        this.effects.push({
          type: "spark",
          x,
          y,
          vx: Math.cos(angle) * speed + direction * 80,
          vy: Math.sin(angle) * speed,
          size: random(2, 8),
          color: i % 3 === 0 ? "#ffffff" : i % 2 ? "#ffe86b" : "#8effea",
          life: random(0.2, 0.48),
          maxLife: 0.48,
          shape: i % 4 === 0 ? "square" : "line",
          rotation: angle,
        });
      }
      this.spawnWord(x, y - 72, "PERFECT!", "#fff6a2", 46);
    }

    resolvePerfectBlock(attacker, target, direction, data) {
      const brokeUltimate = data.perfectBlockKind === "ultimate";
      target.hitFlash = 0;
      target.hitTilt = 0;
      target.vx = direction * 36;
      target.invulnerable = Math.max(target.invulnerable, 0.32);
      if (!target.isPlayer) {
        target.action = null;
        target.actionResolved = false;
      }

      attacker.action = null;
      attacker.actionResolved = false;
      attacker.hitFlash = 0.1;
      attacker.hitTilt = -direction * 0.09;
      attacker.hitStun = brokeUltimate ? 1.05 : 0.72;
      attacker.vx = -direction * (brokeUltimate ? 390 : 255);
      attacker.meter = Math.max(0, attacker.meter - (brokeUltimate ? 18 : 10));

      this.playerCombo = 0;
      this.enemyCombo = 0;
      this.comboClock = 0;
      this.updateComboCallout();
      this.hitStop = Math.max(this.hitStop, brokeUltimate ? 0.18 : 0.14);
      this.slowMotion = Math.max(this.slowMotion, brokeUltimate ? 0.2 : 0.14);
      this.shake = Math.max(this.shake, brokeUltimate ? 22 : 16);
      this.flash = Math.max(this.flash, 0.34);
      this.cameraKick = Math.max(this.cameraKick, 0.052);
      this.cameraFocus = target.x;
      this.cameraRoll = random(-0.018, 0.018);
      this.crowdEnergy = 1;

      const hitX = target.x - attacker.facing * 18;
      const hitY = target.y - 170;
      this.spawnPerfectBlockEffect(hitX, hitY, direction);
      this.showCallout(
        target.isPlayer ? "完美格挡！" : "敌方完美格挡！",
        `perfect-${++this.perfectBlockCount}`,
        false,
        true,
      );
      audio.perfectBlock();
      this.updateHUD();

      if (brokeUltimate) this.finishUltimate();
    }

    opponentOf(fighter) {
      return fighter === this.player ? this.enemy : this.player;
    }

    getFighterCharacter(fighter) {
      if (fighter.character) return fighter.character;
      return fighter.isPlayer
        ? this.divineForm
          ? "divine"
          : this.selectedCharacter
        : "naiwa";
    }

    isDivineFighter(fighter) {
      return this.getFighterCharacter(fighter) === "divine";
    }

    getPlayerDisplayName() {
      return this.divineForm ? "神-奶娃" : CHARACTER_CONFIG[this.selectedCharacter]?.name || "奶娃";
    }

    resolveAction(attacker) {
      if (attacker.actionResolved || attacker.action === "ultimate") return;
      if (attacker.actionTime < attacker.attackStartup) return;

      if (
        this.isDivineFighter(attacker) &&
        ["light", "heavy", "rush", "heal"].includes(attacker.action)
      ) {
        this.resolveDivineAttack(attacker);
        attacker.actionResolved = true;
        return;
      }

      if (
        this.getFighterCharacter(attacker) === "mini" &&
        attacker.action === "rush"
      ) {
        this.spawnHeartProjectile(attacker);
        attacker.actionResolved = true;
        return;
      }

      if (attacker.action === "light" || attacker.action === "heavy" || attacker.action === "rush") {
        const target = this.opponentOf(attacker);
        const forwardDistance = (target.x - attacker.x) * attacker.facing;
        const verticalDistance = Math.abs(target.y - attacker.y);
        if (
          forwardDistance > 20 &&
          forwardDistance < attacker.attackRange &&
          verticalDistance < 176 &&
          this.phase === "playing"
        ) {
          const mini = this.getFighterCharacter(attacker) === "mini";
          const heavy = attacker.action === "heavy";
          const rush = attacker.action === "rush";
          const remoteHuman = this.onlineMode === "host" && attacker === this.enemy;
          const humanAttacker = attacker.isPlayer || remoteHuman;
          const naiwaBoost =
            humanAttacker && this.getFighterCharacter(attacker) === "naiwa"
              ? NAIWA_DAMAGE_MULTIPLIER
              : 1;
          this.applyHit(attacker, target, {
            damage: Math.round(
              (mini ? (heavy ? 118 : 42) : rush ? 115 : heavy ? 125 : 48) *
                (humanAttacker ? PLAYER_DAMAGE_SCALE : 1) *
                naiwaBoost,
            ),
            knockback: mini ? (heavy ? 430 : 145) : rush ? 410 : heavy ? 540 : 170,
            lift: mini && heavy ? -340 : rush ? -210 : heavy ? -490 : 0,
            label: mini
              ? heavy
                ? "奶娃飞踢！"
                : "戳！"
              : rush
                ? "奶拳突进！"
                : heavy
                  ? "肚皮弹！"
                  : "啪！",
            heavy: heavy || rush,
            hitKind: `${this.getFighterCharacter(attacker)}-${attacker.action}`,
          });
        } else {
          this.spawnWhiff(attacker, attacker.action === "heavy" || attacker.action === "rush");
        }
        attacker.actionResolved = true;
        return;
      }

      if (attacker.action === "heal") {
        this.healFighter(attacker);
        attacker.actionResolved = true;
      }
    }

    resolveDivineAttack(attacker) {
      const action = attacker.action;
      const move = DIVINE_MOVES[action];
      if (!move) return;
      const target = this.opponentOf(attacker);
      if (action === "rush") {
        this.activateDivineShield(attacker);
        return;
      }
      if (action === "heal") {
        this.startDivineBarrage(attacker);
        return;
      }

      const forwardDistance = (target.x - attacker.x) * attacker.facing;
      const verticalDistance = Math.abs(target.y - attacker.y);
      if (
        forwardDistance > 20 &&
        forwardDistance < attacker.attackRange &&
        verticalDistance < 180 &&
        this.phase === "playing"
      ) {
        this.applyHit(attacker, target, {
          damage: Math.round(move.damage * PLAYER_DAMAGE_SCALE),
          knockback: move.knockback,
          lift: move.lift,
          label: `${move.name}！`,
          heavy: action === "heavy",
          divineEffect: action === "light" ? "shot" : "burst",
          divineMark: true,
          hitKind: `divine-${action}`,
        });
      } else {
        this.spawnWhiff(attacker, action === "heavy");
      }
    }

    healFighter(fighter) {
      const amount = Math.min(HEAL_AMOUNT, fighter.maxHealth - fighter.health);
      if (amount <= 0) return;
      fighter.health = Math.min(fighter.maxHealth, fighter.health + amount);
      fighter.invulnerable = Math.max(fighter.invulnerable, 0.24);
      this.spawnHealEffect(fighter, amount);
      audio.heal();
    }

    applyDivineMark(owner, target) {
      if (!target || target.ko) return;
      const newlyApplied = target.divineMarkTime <= 0.05;
      target.divineMarkTime = DIVINE_MARK_DURATION;
      target.divineMarkOwner = owner;
      if (!newlyApplied) return;
      this.spawnRing(target.x, target.y - 154, "rgba(255, 119, 31, .9)", 148);
      this.spawnWord(target.x, target.y - 238, "焚印 · 易伤 30%", "#ffbd45", 29);
    }

    activateDivineShield(fighter) {
      fighter.shield = 600;
      fighter.shieldMax = 600;
      fighter.shieldHealPool = 500;
      fighter.shieldHealTick = 1;
      this.spawnRing(fighter.x, fighter.y - 142, "rgba(139, 255, 226, .95)", 225);
      this.spawnRing(fighter.x, fighter.y - 142, "rgba(255, 241, 157, .74)", 155);
      this.spawnWord(fighter.x, fighter.y - 252, "静默结界 · 600", "#baffdf", 32);
      this.crowdEnergy = Math.max(this.crowdEnergy, 0.35);
    }

    updateDivineShield(dt) {
      for (const fighter of [this.player, this.enemy]) {
        if (fighter.shield <= 0 || fighter.shieldHealPool <= 0) continue;
        fighter.shieldHealTick -= dt;
        if (fighter.shieldHealTick > 0) continue;
        fighter.shieldHealTick += 1;
        const amount = Math.min(100, fighter.shieldHealPool, fighter.maxHealth - fighter.health);
        if (amount <= 0) continue;
        fighter.health = Math.min(fighter.maxHealth, fighter.health + amount);
        fighter.shieldHealPool = Math.max(0, fighter.shieldHealPool - amount);
        this.spawnRing(fighter.x, fighter.y - 135, "rgba(146, 255, 211, .72)", 105);
        this.damageFloats.push({
          x: fighter.x,
          y: fighter.y - 248,
          text: `+${amount}`,
          life: 0.9,
          maxLife: 0.9,
          color: "#baffd5",
          size: 27,
          vy: -62,
          direction: fighter.facing,
        });
        if (fighter.shieldHealPool <= 0) fighter.shieldHealTick = 0;
      }
    }

    spawnHealEffect(fighter, amount) {
      const x = fighter.x;
      const y = fighter.y - 132;
      this.spawnRing(x, y, "#bff48b", 225);
      this.spawnRing(x, y, "#fff0a3", 145);
      for (let i = 0; i < 20; i += 1) {
        const angle = random(-Math.PI, 0);
        const distance = random(12, 92);
        this.effects.push({
          type: "word",
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance + random(-45, 90),
          text: Math.random() < 0.62 ? "+" : "奶",
          color: i % 3 === 0 ? "#fff7bd" : "#bff48b",
          size: random(18, 34),
          vx: random(-24, 24),
          vy: random(-115, -58),
          rotation: random(-0.2, 0.2),
          spin: random(-0.7, 0.7),
          life: random(0.52, 0.92),
          maxLife: 0.92,
        });
      }
      this.damageFloats.push({
        x,
        y: fighter.y - 250,
        text: `+${amount}`,
        life: 1.15,
        maxLife: 1.15,
        color: "#c9f58b",
        size: 48,
        vy: -64,
        direction: fighter.facing,
      });
      fighter.hitFlash = 0;
      this.crowdEnergy = Math.max(this.crowdEnergy, 0.38);
    }

    spawnHeartProjectile(owner) {
      this.projectiles.push({
        owner,
        x: owner.x + owner.facing * 72,
        y: owner.y - 118,
        vx: owner.facing * 575,
        radius: 38,
        life: 2.1,
        phase: 0,
      });
      audio.heartWave();
      this.spawnWord(owner.x + owner.facing * 54, owner.y - 175, "爱心奶波！", "#ffb5c9", 26);
    }

    startDivineBarrage(owner) {
      this.divineBarrage = {
        owner,
        remaining: 8,
        fired: 0,
        timer: 0,
        interval: 0.095,
      };
      audio.wave();
      this.spawnWord(owner.x + owner.facing * 72, owner.y - 204, "烈焰爆弹 · 8 连发", "#ffb33a", 34);
    }

    updateDivineBarrage(dt) {
      if (!this.divineBarrage) return;
      const barrage = this.divineBarrage;
      if (barrage.owner.ko || this.phase !== "playing") {
        this.divineBarrage = null;
        return;
      }
      barrage.timer -= dt;
      const offsets = [-28, 25, -16, 19, -32, 30, -21, 22];
      while (barrage.remaining > 0 && barrage.timer <= 0) {
        this.spawnDivineProjectile(
          barrage.owner,
          "blast",
          offsets[barrage.fired % offsets.length],
          200,
          true,
        );
        barrage.fired += 1;
        barrage.remaining -= 1;
        barrage.timer += barrage.interval;
      }
      if (barrage.remaining <= 0) this.divineBarrage = null;
    }

    spawnDivineProjectile(owner, kind, yOffset = 0, baseDamage = 180, mark = false) {
      const silence = kind === "silence";
      const blast = kind === "blast";
      this.projectiles.push({
        owner,
        divineKind: kind,
        x: owner.x + owner.facing * 86,
        y: owner.y - 132 + yOffset,
        vx: owner.facing * (silence ? 660 : blast ? 880 : 790),
        radius: silence ? 34 : blast ? 31 : 22,
        damage: blast ? baseDamage : Math.round(baseDamage * PLAYER_DAMAGE_SCALE),
        divineEffect: kind,
        divineMark: mark,
        life: 1.8,
        phase: random(0, Math.PI * 2),
      });
      if (!blast) {
        audio.wave();
        this.spawnWord(
          owner.x + owner.facing * 68,
          owner.y - 182 + yOffset,
          "静默！",
          "#aaffdf",
          28,
        );
      }
    }

    updateProjectiles(dt) {
      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        const projectile = this.projectiles[i];
        projectile.x += projectile.vx * dt;
        projectile.life -= dt;
        projectile.phase += dt * 8;
        const target = this.opponentOf(projectile.owner);
        const hit =
          Math.abs(projectile.x - target.x) < target.hurtWidth * 0.58 + projectile.radius &&
          projectile.y > target.y - 250 &&
          projectile.y < target.y - 12;
        if (hit && !target.ko) {
          const divineProjectile = projectile.divineKind;
          this.applyHit(projectile.owner, target, {
            damage: divineProjectile
              ? projectile.damage
              : Math.round(86 * (projectile.owner.isPlayer ? PLAYER_DAMAGE_SCALE : 1)),
            knockback: divineProjectile
              ? divineProjectile === "silence"
                ? 330
                : divineProjectile === "blast"
                  ? 145
                  : 210
              : 285,
            lift: divineProjectile ? (divineProjectile === "blast" ? -52 : -130) : -105,
            label: divineProjectile
              ? divineProjectile === "silence"
                ? "静默结界！"
                : divineProjectile === "blast"
                  ? "烈焰爆弹！"
                  : "烈焰爆弹！"
              : "爱心奶波！",
            heavy: divineProjectile === "silence",
            divineEffect: divineProjectile || null,
            divineMark: projectile.divineMark || false,
            hitKind: divineProjectile
              ? divineProjectile === "blast"
                ? "divine-blast"
                : "divine-light"
              : "mini-rush",
          });
          this.spawnRing(
            projectile.x,
            projectile.y,
            divineProjectile ? "#ffe16a" : "#ffc4d2",
            divineProjectile ? 118 : 92,
          );
          this.projectiles.splice(i, 1);
        } else if (projectile.life <= 0 || projectile.x < -100 || projectile.x > WIDTH + 100) {
          this.projectiles.splice(i, 1);
        }
      }
    }

    spawnBlockEffect(x, y, direction) {
      this.spawnRing(x, y, "rgba(202, 255, 232, .9)", 92);
      for (let i = 0; i < 12; i += 1) {
        const angle = random(-1.05, 1.05) + (direction > 0 ? Math.PI : 0);
        const speed = random(110, 320);
        this.effects.push({
          type: "spark",
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: random(2, 7),
          color: i % 2 ? "#d9fff0" : "#ffeaa1",
          life: random(0.16, 0.32),
          maxLife: 0.32,
          shape: "line",
          rotation: angle,
        });
      }
    }

    applyDivineHitEffect(attacker, target, kind) {
      const x = target.x;
      const y = target.y - 150;
      if (kind === "burn") {
        target.burnTime = Math.max(target.burnTime, 3.2);
        target.burnMaxTime = Math.max(target.burnMaxTime || 0, 3.2);
        if (!target.burnInferno || target.burnTime <= 0) {
          target.burnMaxTime = 3.2;
          target.burnDamage = 8;
          target.burnInterval = 0.5;
          target.burnInferno = false;
        }
        target.burnTick = Math.min(target.burnTick || 0.32, 0.32);
        target.burnOwner = attacker;
        this.spawnRing(x, y, "rgba(255, 154, 47, .9)", 125);
        this.spawnWord(x, y - 38, "燃烧！", "#ff9d37", 30);
        return;
      }
      if (kind === "burst") {
        this.spawnRing(x, y, "rgba(255, 218, 92, .95)", 210);
        this.spawnRing(x, y, "rgba(255, 101, 30, .82)", 145);
        for (let i = 0; i < 20; i += 1) {
          const angle = random(-Math.PI, 0);
          const speed = random(140, 430);
          this.effects.push({
            type: "spark",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: random(3, 8),
            color: i % 2 ? "#ffcc47" : "#ff6b28",
            life: random(0.24, 0.48),
            maxLife: 0.48,
            shape: i % 3 === 0 ? "square" : "line",
            rotation: angle,
          });
        }
        return;
      }
      if (kind === "silence") {
        this.spawnRing(x, y, "rgba(146, 245, 236, .9)", 190);
        this.spawnRing(x, y, "rgba(255, 235, 111, .72)", 115);
        target.hitStun = Math.max(target.hitStun, 0.38);
        this.spawnWord(x, y - 16, "静默", "#a6fff3", 34);
        return;
      }
      if (kind === "blast") {
        this.spawnRing(x, y, "rgba(255, 233, 104, .92)", 118);
        this.spawnRing(x, y, "rgba(255, 82, 22, .78)", 82);
        for (let i = 0; i < 7; i += 1) {
          const angle = random(-Math.PI, Math.PI);
          const speed = random(80, 260);
          this.effects.push({
            type: "spark",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 60,
            size: random(2, 7),
            color: i % 2 ? "#ffdc58" : "#ff5f22",
            life: random(0.2, 0.42),
            maxLife: 0.42,
            shape: "line",
            rotation: angle,
          });
        }
        return;
      }
      if (kind === "shot") {
        this.spawnRing(x, y, "rgba(255, 229, 105, .82)", 74);
      }
    }

    igniteDivineInferno(owner, target) {
      if (!target || target.ko || this.phase !== "playing") return;
      target.burnTime = 5;
      target.burnMaxTime = 5;
      target.burnTick = 1;
      target.burnInterval = 1;
      target.burnDamage = 500;
      target.burnOwner = owner;
      target.burnInferno = true;
      this.spawnRing(target.x, target.y - 145, "rgba(255, 224, 88, .96)", 255);
      this.spawnRing(target.x, target.y - 125, "rgba(255, 78, 24, .9)", 190);
      this.spawnWord(target.x, target.y - 245, "神火灼烧 · 5 秒", "#ffb52f", 34);
      for (let i = 0; i < 26; i += 1) {
        const angle = random(-Math.PI, 0);
        const speed = random(120, 390);
        this.effects.push({
          type: "spark",
          x: target.x + random(-72, 72),
          y: target.y - random(45, 225),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: random(3, 9),
          color: i % 3 === 0 ? "#fff3a5" : i % 2 ? "#ffb62f" : "#ff4d1f",
          life: random(0.35, 0.72),
          maxLife: 0.72,
          shape: "line",
          rotation: angle,
        });
      }
    }

    updateBurnEffects(dt) {
      for (const target of [this.player, this.enemy]) {
        if (target.burnTime <= 0) {
          target.burnMaxTime = 3.2;
          target.burnDamage = 8;
          target.burnInterval = 0.5;
          target.burnInferno = false;
          continue;
        }
        if (target.ko) continue;
        target.burnTime = Math.max(0, target.burnTime - dt);
        target.burnTick -= dt;
        if (target.burnTick > 0) continue;
        const interval = Math.max(0.1, target.burnInterval || 0.5);
        target.burnTick += interval;
        const baseDamage = Math.max(1, Math.round(target.burnDamage || 8));
        const marked =
          target.divineMarkTime > 0;
        const markedDamage = Math.max(1, Math.round(baseDamage * (marked ? 1.3 : 1)));
        const shieldAbsorbed = target.shield > 0 ? Math.min(target.shield, markedDamage) : 0;
        if (shieldAbsorbed > 0) {
          target.shield = Math.max(0, target.shield - shieldAbsorbed);
          if (target.shield <= 0) {
            target.shieldHealPool = 0;
            target.shieldHealTick = 0;
          }
        }
        const damage = Math.max(0, markedDamage - shieldAbsorbed);
        target.health = Math.max(0, target.health - damage);
        const inferno = target.burnInferno || baseDamage >= 500;
        this.damageFloats.push({
          x: target.x + random(-18, 18),
          y: target.y - random(150, 220),
          text: shieldAbsorbed > 0 ? `护盾-${shieldAbsorbed}` : `-${damage}`,
          life: 0.75,
          maxLife: 0.75,
          color: shieldAbsorbed > 0 ? "#baffdf" : "#ff9a35",
          size: inferno ? 36 : 22,
          vy: -70,
          direction: target.facing,
        });
        if (inferno) {
          this.spawnRing(target.x, target.y - 145, "rgba(255, 123, 31, .82)", 132);
          this.shake = Math.max(this.shake, 9);
          this.crowdEnergy = Math.max(this.crowdEnergy, 0.3);
        }
        for (let i = 0; i < (inferno ? 9 : 3); i += 1) {
          this.effects.push({
            type: "spark",
            x: target.x + random(-48, 48),
            y: target.y - random(90, 205),
            vx: random(-35, 35),
            vy: random(-135, -70),
            size: random(inferno ? 3 : 2, inferno ? 10 : 6),
            color: i % 2 ? "#ffbe39" : "#ff6424",
            life: random(0.22, 0.46),
            maxLife: 0.46,
            shape: "line",
            rotation: random(-1.2, 1.2),
          });
        }
        if (target.health <= 0) {
          this.finishRound(
            target.burnOwner || this.opponentOf(target),
            inferno ? "被神临·九霄的烈焰焚尽。" : "被神火持续焚烧击败。",
          );
          break;
        }
      }
    }

    playCombatSound(kind, heavy = false, ultimate = false) {
      audio.combatHit(kind, heavy, ultimate);
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "combat-audio", kind, heavy, ultimate });
      }
    }

    applyHit(attacker, target, data) {
      if (this.phase !== "playing" || target.invulnerable > 0 || target.ko) return;

      const direction = target.x >= attacker.x ? 1 : -1;
      const attackerIsOnlineHuman = this.onlineMode === "host" && attacker === this.enemy;
      const targetIsOnlineHuman = this.onlineMode === "host" && target === this.enemy;
      const attackerIsHuman = attacker.isPlayer || attackerIsOnlineHuman;
      const targetIsHuman = target.isPlayer || targetIsOnlineHuman;
      if (targetIsHuman && this.consumePerfectBlock(attacker)) {
        this.resolvePerfectBlock(attacker, target, direction, {
          ...data,
          perfectBlockKind: this.ultimate?.mode === "enemyCharge" ? "ultimate" : "skill",
        });
        return;
      }
      if (!targetIsHuman && this.shouldEnemyPerfectBlock(attacker, target, data)) {
        this.resolvePerfectBlock(attacker, target, direction, {
          ...data,
          perfectBlockKind: "skill",
        });
        return;
      }
      const blocked = targetIsHuman && target.blocking;
      const comboScale =
        1 +
        (attackerIsHuman && !data.ultimate
          ? Math.min(COMBO_DAMAGE_CAP, Math.max(0, this.playerCombo) * COMBO_DAMAGE_BONUS)
          : 0);
      const markMultiplier =
        target.divineMarkTime > 0 ? 1.3 : 1;
      const incomingDamage = Math.round(
        data.damage *
          (attackerIsHuman ? 1 : this.difficulty.enemyDamage) *
          comboScale *
          markMultiplier,
      );
      const blockedDamage = blocked
        ? Math.max(1, Math.round(incomingDamage * (data.ultimate ? 0.55 : 0.22)))
        : incomingDamage;
      const rawAppliedDamage = blocked ? Math.min(100, blockedDamage) : blockedDamage;
      const shieldAbsorbed = target.shield > 0 ? Math.min(target.shield, rawAppliedDamage) : 0;
      if (shieldAbsorbed > 0) {
        target.shield = Math.max(0, target.shield - shieldAbsorbed);
        if (target.shield <= 0) {
          target.shieldHealPool = 0;
          target.shieldHealTick = 0;
        }
      }
      const appliedDamage = Math.max(0, rawAppliedDamage - shieldAbsorbed);
      if (
        !data.skipRebirth &&
        target.character === "naiwa" &&
        !target.divineRebirthUsed &&
        target.meter >= MAX_METER &&
        appliedDamage >= target.health
      ) {
        if (target.isPlayer) {
          this.startRebirthPrompt(attacker, target, data, direction);
          return;
        }
        if (this.onlineMode === "host" && target === this.enemy) {
          this.startNetworkRebirthPrompt(attacker, target, data, direction);
          return;
        }
      }
      const appliedKnockback =
        data.knockback *
        (blocked ? (data.ultimate ? 0.35 : 0.12) : shieldAbsorbed > 0 ? 0.46 : 1);
      target.health = Math.max(0, target.health - appliedDamage);
      if (data.divineEffect) this.applyDivineHitEffect(attacker, target, data.divineEffect);
      if (data.divineMark && !blocked && target.health > 0) {
        this.applyDivineMark(attacker, target);
      }
      target.hitFlash = blocked ? 0.07 : data.ultimate ? 0.22 : data.heavy ? 0.2 : 0.12;
      target.hitTilt = -direction * (blocked ? 0.022 : data.heavy ? 0.105 : 0.052);
      target.hitStun = blocked ? 0.09 : data.heavy ? 0.34 : 0.15;
      target.action = null;
      target.actionResolved = false;
      target.vx = appliedKnockback * direction;
      if (data.lift && !blocked && shieldAbsorbed <= 0) {
        target.vy = data.lift;
        target.grounded = false;
      }

      if (data.ultimate || attacker.action === "ultimate") {
        attacker.meter = 0;
      } else {
        attacker.meter = Math.min(MAX_METER, attacker.meter + appliedDamage * HIT_METER_GAIN);
      }
      const feedback = HIT_FEEDBACK[data.hitKind] || null;
      this.hitStop = Math.max(
        this.hitStop,
        blocked ? 0.045 : feedback?.stop ?? (data.ultimate ? 0.075 : data.heavy ? 0.135 : 0.072),
      );
      this.shake = Math.max(
        this.shake,
        blocked ? 6 : feedback?.shake ?? (data.ultimate ? 27 : data.heavy ? 23 : 11),
      );
      this.flash = Math.max(
        this.flash,
        blocked ? 0.08 : feedback?.flash ?? (data.ultimate ? 0.45 : data.heavy ? 0.36 : 0.14),
      );
      this.cameraKick = Math.max(
        this.cameraKick,
        blocked ? 0.012 : feedback?.kick ?? (data.ultimate ? 0.052 : data.heavy ? 0.058 : 0.021),
      );
      this.cameraFocus = lerp(this.player.x, this.enemy.x, 0.5);
      this.cameraRoll = random(-0.006, 0.006) * (blocked ? 0.18 : data.heavy || data.ultimate ? 1 : 0.35);
      if (!blocked && (data.heavy || data.ultimate)) {
        this.slowMotion = Math.max(this.slowMotion, data.ultimate ? 0.08 : 0.105);
      }
      this.crowdEnergy = Math.max(this.crowdEnergy, data.heavy || data.ultimate ? 0.88 : 0.42);

      const hitX = target.x - attacker.facing * 12;
      const hitY = target.y - (blocked ? 160 : data.heavy ? 155 : 185);
      if (blocked) {
        this.spawnBlockEffect(hitX, hitY, direction);
      } else {
        this.spawnImpact(hitX, hitY, direction, data.heavy, data.ultimate);
        this.spawnHitBurst(hitX, hitY, attacker.facing, data.heavy, data.ultimate);
      }
      this.damageFloats.push({
        x: target.x + direction * 28,
        y: target.y - 245,
        text:
          shieldAbsorbed > 0
            ? appliedDamage > 0
              ? `护盾-${shieldAbsorbed} / -${appliedDamage}`
              : `护盾-${shieldAbsorbed}`
            : `-${appliedDamage}`,
        life: 1.02,
        maxLife: 1.02,
        color: shieldAbsorbed > 0 ? "#baffdf" : blocked ? "#c9fff0" : data.heavy ? "#ffdf56" : "#fff8d8",
        size: blocked ? 26 : data.heavy ? 43 : 34,
        vy: -82,
        direction,
      });

      if (blocked) {
        this.spawnWord(hitX, hitY - 38, "格挡", "#d8fff0", 30);
      } else if (shieldAbsorbed > 0 && appliedDamage <= 0) {
        this.spawnWord(hitX, hitY - 38, "结界抵挡", "#baffdf", 30);
      } else if (data.label) {
        this.spawnWord(hitX, hitY - 54, data.label, data.heavy ? "#ffca3f" : "#f8f1da", data.heavy ? 43 : 30);
      }
      if (blocked) {
        audio.block();
        if (this.onlineMode === "host" && this.networkReady) {
          this.sendNetwork({ type: "combat-audio", kind: "block" });
        }
      } else if (shieldAbsorbed > 0 && appliedDamage <= 0) {
        this.playCombatSound("shield-hit", false, false);
      } else {
        this.playCombatSound(
          data.hitKind || "generic",
          Boolean(data.heavy),
          Boolean(data.ultimate),
        );
      }
      this.triggerHUDImpact(target, !blocked && (data.heavy || data.ultimate));
      if (!blocked) this.triggerImpactVignette(target, data.heavy || data.ultimate);

      if (!blocked) {
        if (target.isPlayer) {
          this.enemyCombo += 1;
          this.playerCombo = 0;
          this.comboClock = 1.5;
        } else {
          this.playerCombo += 1;
          this.enemyCombo = 0;
          this.comboClock = 1.5;
        }
        this.updateComboCallout();
        this.pulseComboCallout();
      }

      if (target.health <= 0) {
        this.finishRound(
          attacker,
          this.isDivineFighter(attacker)
            ? "被神-奶娃击败。"
            : data.ultimate
              ? "全屏奶笑，正中靶心。"
              : "一记重击，直接笑出擂台。",
        );
      }
    }

    startUltimate(owner) {
      const remoteHuman = this.onlineMode === "host" && owner === this.enemy;
      if (!owner.isPlayer && !remoteHuman) {
        this.startEnemyChargePunch(owner);
        return;
      }
      this.startImageUltimate(owner);
    }

    startEnemyChargePunch(owner) {
      owner.action = "ultimate";
      owner.actionTime = 0;
      owner.actionDuration = 2.15;
      owner.invulnerable = 2.2;
      owner.vx = 0;
      this.ultimate = {
        mode: "enemyCharge",
        owner,
        target: this.opponentOf(owner),
        time: 0,
        damageStarted: false,
      };
      this.syncPauseButton();
      this.spawnWord(owner.x, owner.y - 250, "蓄力一拳", "#f6df7b", 38);
      audio.chargePunch();
      this.cameraFocus = owner.x;
      this.cameraKick = Math.max(this.cameraKick, 0.018);
    }

    startImageUltimate(owner) {
      const character = this.getFighterCharacter(owner);
      const isDivine = character === "divine";
      const isMini = character === "mini";
      owner.action = "ultimate";
      owner.actionTime = 0;
      owner.actionDuration = isDivine ? 4.7 : isMini ? 3.4 : 5.2;
      owner.invulnerable = isDivine ? 4.8 : isMini ? 3.5 : 5.3;
      owner.vx = 0;
      this.ultimate = {
        mode: "image",
        owner,
        target: this.opponentOf(owner),
        time: 0,
        isMini,
        isDivine,
        nextPulse: 0,
        pulseTimes: isMini || isDivine ? [] : [1.55, 2.3, 3.05, 3.8],
        damageStarted: false,
      };
      this.syncPauseButton();
      this.duckMatchMusic();
      gameFrame.classList.add("is-cinematic");
      ui.holyUltimate.classList.toggle("is-divine", isDivine);
      ui.holyUltimate.classList.toggle("is-naiwa", !isMini && !isDivine);
      ui.holyUltimate.hidden = false;
      ui.holyUltimate.classList.remove("is-visible", "is-leaving");
      void ui.holyUltimate.offsetWidth;
      ui.holyUltimate.classList.add("is-visible");
      this.flash = 0.32;
      this.cameraKick = 0.02;
      ui.holyUltimateKicker.textContent = isDivine
        ? "DIVINE NAIWA · HEAVENLY INFERNO"
        : isMini
          ? "MINI NAIWA · DIVINE ARRIVAL"
          : "NAIWA · FOUR-STAGE BELLY LAUGH";
      ui.holyUltimateTitle.textContent = isDivine ? "神临·九霄" : isMini ? "奶娃神圣降临" : "捧腹大笑";
      ui.holyUltimateLine.textContent = isDivine
        ? "天火垂落，万象俱寂。"
        : isMini
          ? "圣光落下，只为一击。"
          : "四段笑浪，声到之处全部击飞。";
      ui.holyUltimateMiniImage.hidden = !isMini;
      ui.holyUltimateNaiwaImage.hidden = isMini || isDivine;
      ui.holyUltimateDivineImage.hidden = !isDivine;
      ui.holyUltimateHitWord.textContent = isDivine ? "神火爆发" : isMini ? "圣奶一击" : "笑浪连击";
      const holyAudio = isMini ? ui.miniUltimateAudio : ui.ultimateAudio;
      if (isDivine) {
        ui.miniUltimateAudio.pause();
        ui.ultimateAudio.pause();
        ui.divineUltimateAudio.muted = !audio.enabled;
        ui.divineUltimateAudio.volume = 1;
        try {
          ui.divineUltimateAudio.currentTime = 0;
        } catch {
          // Audio metadata can still be loading on the first activation.
        }
        ui.divineUltimateAudio.play().catch(() => audio.holyArrival());
      } else {
        ui.divineUltimateAudio.pause();
        ui.divineUltimateAudio.currentTime = 0;
        holyAudio.muted = !audio.enabled;
        holyAudio.volume = 1;
        try {
          holyAudio.currentTime = 0;
        } catch {
          // Audio metadata can still be loading on the first activation.
        }
        holyAudio.play().catch(() => (isMini ? audio.holyArrival() : audio.impactCharge()));
      }
      this.updateHUD();
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({
          type: "ultimate",
          event: "start",
          isMini,
          isDivine,
        });
      }
    }

    updateUltimate(dt) {
      if (!this.ultimate) return;
      const ultimate = this.ultimate;
      ultimate.time += dt;

      if (ultimate.mode === "enemyCharge") {
        if (this.debugEnemyChargeHold && !ultimate.damageStarted) ultimate.time = Math.min(ultimate.time, 1.05);
        if (!ultimate.damageStarted && ultimate.time >= 1.18) {
          ultimate.damageStarted = true;
          this.flash = 0.38;
          this.shake = 30;
          this.cameraKick = 0.075;
          this.cameraFocus = ultimate.target.x;
          audio.enemyHeavyHit();
          this.applyHit(ultimate.owner, ultimate.target, {
            damage: 1000,
            knockback: 720,
            lift: -500,
            label: "蓄力一拳！",
            heavy: true,
          });
        }
        if (ultimate.time >= 2.15 || this.phase !== "playing") {
          this.finishUltimate();
        }
        return;
      }

      if (ultimate.mode === "image") {
        if (this.debugHolyHold && !ultimate.damageStarted) ultimate.time = Math.min(ultimate.time, 1.45);
        if (!ultimate.damageStarted && ultimate.time >= 1.55) {
          ultimate.damageStarted = true;
          ui.holyUltimate.hidden = true;
          ui.holyUltimate.classList.remove("is-visible");
          gameFrame.classList.remove("is-cinematic");
          this.cameraFocus = ultimate.target.x;
          if (ultimate.isMini) {
            this.flash = 0.5;
            this.shake = 34;
            this.cameraKick = 0.085;
            audio.holyImpact();
            this.applyHit(ultimate.owner, ultimate.target, {
              damage: Math.round(
                1100 *
                  (ultimate.owner.isPlayer || this.onlineMode === "host"
                    ? PLAYER_DAMAGE_SCALE
                    : 1),
              ),
              knockback: 760,
              lift: -560,
              label: "神圣降临！",
              heavy: true,
              ultimate: true,
              hitKind: "mini-ultimate",
            });
          } else if (ultimate.isDivine) {
            this.flash = 0.58;
            this.shake = 36;
            this.cameraKick = 0.085;
            audio.divineImpact();
            this.applyHit(ultimate.owner, ultimate.target, {
              damage: 3000,
              knockback: 620,
              lift: -320,
              label: "神火爆发 · 3000！",
              heavy: true,
              ultimate: true,
              divineEffect: "burst",
              hitKind: "divine-ultimate",
            });
            this.igniteDivineInferno(ultimate.owner, ultimate.target);
            this.showToast("神火爆发 3000 · 持续灼烧 5 秒");
          } else {
            this.showToast("四段笑浪 · 笑声不停！");
          }
          if (this.onlineMode === "host" && this.networkReady) {
            this.sendNetwork({ type: "ultimate", event: "hit" });
          }
        }

        if (!ultimate.isDivine && !ultimate.isMini) {
          const waveDamage = [220, 250, 280, 350];
          while (
            ultimate.nextPulse < ultimate.pulseTimes.length &&
            ultimate.time >= ultimate.pulseTimes[ultimate.nextPulse]
          ) {
            const pulse = ultimate.nextPulse;
            this.spawnUltimateRing(ultimate.owner, pulse);
            this.flash = Math.max(this.flash, pulse === 3 ? 0.46 : 0.2);
            this.shake = Math.max(this.shake, pulse === 3 ? 30 : 18);
            this.cameraKick = Math.max(this.cameraKick, pulse === 3 ? 0.075 : 0.04);
            this.cameraFocus = ultimate.target.x;
            this.applyHit(ultimate.owner, ultimate.target, {
              damage: Math.round(
                waveDamage[pulse] * PLAYER_DAMAGE_SCALE * NAIWA_DAMAGE_MULTIPLIER,
              ),
              knockback: [190, 235, 290, 430][pulse],
              lift: pulse === 3 ? -420 : 0,
              label: pulse === 3 ? "笑浪终曲！" : "哈哈哈！",
              heavy: pulse === 3,
              ultimate: true,
              hitKind: "naiwa-ultimate",
            });
            ultimate.nextPulse += 1;
            if (this.phase !== "playing") break;
          }
        }
        const finishAt = ultimate.isMini ? 3.05 : ultimate.isDivine ? 4.4 : 4.9;
        if (ultimate.time >= finishAt || this.phase !== "playing") {
          this.finishUltimate();
        }
        return;
      }
    }

    skipUltimate() {
      if (!this.ultimate || this.ultimate.owner !== this.player) return;
      if (this.ultimate.mode !== "image" || this.ultimate.time < 0.35) return;
      ui.holyUltimate.hidden = true;
      ui.holyUltimate.classList.remove("is-visible");
      gameFrame.classList.remove("is-cinematic");
      this.ultimate.time = 1.54;
    }

    finishUltimate() {
      if (!this.ultimate) return;
      const owner = this.ultimate.owner;
      owner.action = null;
      owner.actionTime = 0;
      owner.invulnerable = 0;
      this.ultimate = null;
      ui.holyUltimate.hidden = true;
      ui.holyUltimate.classList.remove("is-visible", "is-leaving");
      // Dedicated image-ultimate audio continues naturally; round transitions
      // and lobby returns reset both tracks explicitly.
      audio.stopLaugh();
      gameFrame.classList.remove("is-cinematic");
      this.restoreMatchMusicVolume();
      this.syncPauseButton();
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({ type: "ultimate", event: "end" });
      }
    }

    finishRound(winner, reason = "") {
      if (this.phase !== "playing") return;
      this.phase = "ko";
      this.stopMatchMusic();
      this.syncPauseButton();
      this.pendingWinner = winner;
      this.koTimer = 0;
      this.roundTime = Math.max(0, this.roundTime);
      this.shake = 32;
      this.flash = 0.58;
      this.cameraKick = 0.092;
      this.cameraFocus = this.opponentOf(winner).x;
      this.cameraRoll = random(-0.018, 0.018);
      this.crowdEnergy = 1;
      this.slowMotion = 0;
      this.keys.clear();
      const loser = this.opponentOf(winner);
      loser.ko = true;
      loser.vx = (loser.x >= winner.x ? 1 : -1) * 620;
      loser.vy = -560;
      loser.hitStun = 2;
      this.koReason = reason;
      this.hitStop = 0.14;
      ui.koBadge.classList.remove("is-visible");
      void ui.koBadge.offsetWidth;
      ui.koBadge.classList.add("is-visible");
      const playerNameEn = this.divineForm
        ? "DIVINE NAIWA"
        : CHARACTER_CONFIG[this.selectedCharacter]?.english || "NAIWA";
      ui.koBadge.querySelector("small").textContent = winner.isPlayer ? `${playerNameEn} WINS` : "BITTER END";
      ui.divineUltimateAudio.pause();
      ui.divineUltimateAudio.currentTime = 0;
      audio.ko();
      const finisherCharacter = this.getFighterCharacter(winner);
      if (winner.isPlayer || this.onlineMode) {
        this.showKOFinisher(finisherCharacter);
      }
      if (this.onlineMode === "host" && this.networkReady) {
        this.sendNetwork({
          type: "finisher",
          character: finisherCharacter,
        });
      }

      for (let i = 0; i < 34; i += 1) {
        this.spawnConfetti(random(0, WIDTH), random(130, 470));
      }
    }

    showKOFinisher(character = this.selectedCharacter) {
      const isMini = character === "mini";
      const isDivine = character === "divine";
      const anthem = ui.koAnthemAudio;
      this.koFinisherActive = true;
      anthem.muted = !audio.enabled;
      anthem.volume = 0.9;
      this.koFinisherDuration =
        Number.isFinite(anthem.duration) && anthem.duration > 0
          ? Math.max(2.9, Math.min(12, anthem.duration))
          : 6;
      try {
        anthem.currentTime = 0;
      } catch {
        // Audio metadata may still be loading on the first finisher.
      }
      anthem.play().catch(() => audio.finishAnthem(isMini));
      ui.koFinisher.classList.toggle("is-mini", isMini);
      ui.koFinisher.classList.toggle("is-divine", isDivine);
      ui.koFinisherKicker.textContent = isDivine
        ? "DIVINE NAIWA · RAIN ETERNAL"
        : isMini
          ? "MINI NAIWA · LONDON RAIN"
          : "LAST BELL · 最后一击";
      ui.koFinisherLine1.textContent = isDivine
        ? "如果情绪有天气"
        : isMini
          ? "伦敦的雨很大"
          : "成为一只平静的奶娃";
      ui.koFinisherLine2.textContent = isDivine
        ? "那我困在阴雨天里"
        : isMini
          ? "我迷失了一遍又一遍"
          : "要流尽多少眼泪";
      ui.koFinisherImage.src = isDivine
        ? "./assets/characters/divine-finisher.jpg"
        : isMini
          ? "./assets/characters/mini-ko-v3.webp"
          : "./assets/characters/naiwa-calm.webp";
      ui.koFinisherImage.alt = isDivine
        ? "神-奶娃执剑立于阴雨之中"
        : isMini
          ? "小奶娃在雨中喝奶茶"
          : "平静站立的奶娃";
      ui.koFinisher.hidden = false;
      ui.koFinisher.classList.remove("is-visible", "is-leaving");
      void ui.koFinisher.offsetWidth;
      ui.koFinisher.classList.add("is-visible");
    }

    skipKOFinisher() {
      if (!this.koFinisherActive) return;
      this.koFinisherActive = false;
      this.koTimer = Math.max(this.koTimer, this.koFinisherDuration || 2.9);
      ui.koAnthemAudio.pause();
      ui.koAnthemAudio.currentTime = 0;
      ui.koFinisher.hidden = true;
      ui.koFinisher.classList.remove("is-visible", "is-leaving", "is-divine");
    }

    hideKOFinisher() {
      this.koFinisherActive = false;
      ui.koAnthemAudio.pause();
      ui.koAnthemAudio.currentTime = 0;
      ui.koFinisher.hidden = true;
      ui.koFinisher.classList.remove("is-visible", "is-leaving", "is-divine");
    }

    finishByTimeout() {
      if (this.phase !== "playing") return;
      this.stopMatchMusic();
      let winner;
      const playerRatio = this.player.health / this.player.maxHealth;
      const enemyRatio = this.enemy.health / this.enemy.maxHealth;
      if (playerRatio === enemyRatio) {
        winner = this.player.meter >= this.enemy.meter ? this.player : this.enemy;
      } else {
        winner = playerRatio > enemyRatio ? this.player : this.enemy;
      }
      this.phase = "ko";
      this.pendingWinner = winner;
      this.koTimer = 0;
      const playerName = this.getPlayerDisplayName();
      this.koReason = winner.isPlayer
        ? `60 秒到！奶气更多的${playerName}拿下本局。`
        : "60 秒到！苦瓜奶霸守住擂台。";
      ui.koBadge.classList.remove("is-visible");
      void ui.koBadge.offsetWidth;
      ui.koBadge.classList.add("is-visible");
      ui.koBadge.querySelector("small").textContent = "TIME UP";
      this.crowdEnergy = 0.75;
      audio.crowd(0.8);
    }

    finalizeRound() {
      if (!this.pendingWinner) return;
      this.hideKOFinisher();
      this.pendingWinner.wins += 1;
      this.updateRoundMarkers();
      if (this.pendingWinner.wins >= 2) {
        this.showMatchOverlay();
        return;
      }

      this.finished = false;
      this.phase = "roundOver";
      gameFrame.classList.add("is-round-over");
      ui.roundOverlay.hidden = false;
      ui.roundKicker.textContent = `ROUND ${this.roundNumber}`;
      const playerName = this.getPlayerDisplayName();
      ui.roundWinner.textContent = this.pendingWinner.isPlayer
        ? `${playerName}拿下一局！`
        : this.onlineMode
          ? "玩家 2 拿下一局！"
          : "苦瓜奶霸得手！";
      ui.roundReason.textContent = this.koReason || "本回合结束。";
      ui.roundVictoryPose.style.backgroundImage = `url("${this.pendingWinner.isPlayer ? assetSources.guard : assetSources.roar}")`;
      ui.roundVictoryPose.style.filter = this.pendingWinner.isPlayer ? "" : "hue-rotate(62deg) saturate(.8)";
      ui.nextRoundLabel.textContent = "下一回合";
    }

    showMatchOverlay() {
      this.finished = true;
      this.phase = "matchOver";
      this.syncPauseButton();
      gameFrame.classList.add("is-match-over");
      ui.finalOverlay.hidden = false;
      const playerWon = this.player.wins > this.enemy.wins;
      const playerName = this.getPlayerDisplayName();
      ui.finalPretitle.textContent = playerWon ? "本场冠军" : "本场亚军";
      ui.finalWinner.textContent = playerWon ? playerName : this.onlineMode ? "玩家 2" : "苦瓜奶霸";
      ui.finalWinner.classList.toggle("is-enemy", !playerWon);
      ui.finalScore.textContent = `${this.player.wins} : ${this.enemy.wins}`;
      ui.finalQuote.textContent = playerWon
        ? "今日份的奶气，全场第一。"
        : "肚子还没笑够，下一局再来。";
      audio.crowd(1.25);
      audio.resumeLobbyMusic();
      for (let i = 0; i < 60; i += 1) {
        this.spawnConfetti(random(0, WIDTH), random(80, 520));
      }
    }

    updateRoundMarkers() {
      ui.playerRoundMarkers.forEach((marker, index) => {
        marker.classList.toggle("is-won", index < this.player.wins);
      });
      ui.enemyRoundMarkers.forEach((marker, index) => {
        marker.classList.toggle("is-won", index < this.enemy.wins);
      });
    }

    updateComboCallout() {
      const combo = this.playerCombo > 1 ? this.playerCombo : this.enemyCombo > 1 ? this.enemyCombo : 0;
      if (!combo) {
        ui.comboCallout.classList.remove("is-visible");
        return;
      }
      ui.comboCallout.querySelector("strong").textContent = combo;
      ui.comboCallout.querySelector("span").textContent = this.playerCombo > 1 ? "连击！" : "被连了！";
      ui.comboCallout.classList.add("is-visible");
    }

    updateAI(dt) {
      const enemy = this.enemy;
      const player = this.player;
      const thinkScale = this.difficulty.enemyThinkScale || 1;
      const speedScale = this.difficulty.enemySpeedScale || 1;
      if (enemy.ko || this.phase !== "playing" || this.ultimate) {
        enemy.desiredVx = 0;
        return;
      }

      enemy.thinkTimer -= dt;
      const distance = player.x - enemy.x;
      const absoluteDistance = Math.abs(distance);
      enemy.facing = distance >= 0 ? 1 : -1;

      if (enemy.thinkTimer > 0) return;

      const ultimateChance = 0.34 + (1 - thinkScale) * 0.22;
      if (enemy.meter >= MAX_METER && absoluteDistance < 680 && Math.random() < ultimateChance) {
        enemy.desiredVx = 0;
        if (enemy.startUltimate()) {
          enemy.thinkTimer = random(1.2, 1.8) * thinkScale;
          return;
        }
      }

      if (enemy.meter >= 25 && enemy.health < enemy.maxHealth * 0.16 && Math.random() < 0.42) {
        enemy.desiredVx = 0;
        if (enemy.startAttack("heal")) {
          enemy.thinkTimer = random(0.9, 1.35) * thinkScale;
          return;
        }
      }

      if (absoluteDistance < 205) {
        enemy.desiredVx = 0;
        const choice = Math.random();
        const aggression = 1 - thinkScale;
        if (choice < 0.47 + aggression * 0.08) enemy.startAttack("light");
        else if (choice < 0.78 + aggression * 0.17) enemy.startAttack("heavy");
        else {
          enemy.desiredVx = (distance > 0 ? -225 : 225) * speedScale;
          if (Math.random() < 0.28) enemy.jump();
        }
        enemy.thinkTimer = random(0.38, 0.78) * thinkScale;
      } else if (absoluteDistance > 315) {
        enemy.desiredVx = Math.sign(distance) * random(175, 230) * speedScale;
        enemy.thinkTimer = random(0.22, 0.5) * thinkScale;
      } else {
        enemy.desiredVx = Math.sign(distance) * 105 * speedScale;
        enemy.thinkTimer = random(0.16, 0.35) * thinkScale;
      }
    }

    separateFighters() {
      if (this.player.ko || this.enemy.ko) return;
      const distance = this.enemy.x - this.player.x;
      const minDistance = 92;
      if (Math.abs(distance) < minDistance) {
        const overlap = minDistance - Math.abs(distance);
        const sign = distance >= 0 ? 1 : -1;
        this.player.x -= sign * overlap * 0.5;
        this.enemy.x += sign * overlap * 0.5;
        this.player.x = clamp(this.player.x, 105, WIDTH - 105);
        this.enemy.x = clamp(this.enemy.x, 105, WIDTH - 105);
      }
    }

    updateEffects(dt) {
      if (this.effects.length > 220) this.effects.splice(0, this.effects.length - 220);
      for (let i = this.impacts.length - 1; i >= 0; i -= 1) {
        const impact = this.impacts[i];
        impact.life -= dt;
        if (impact.life <= 0) this.impacts.splice(i, 1);
      }

      for (let i = this.effects.length - 1; i >= 0; i -= 1) {
        const effect = this.effects[i];
        effect.life -= dt;
        if (effect.type === "spark") {
          effect.x += effect.vx * dt;
          effect.y += effect.vy * dt;
          effect.vy += 420 * dt;
          effect.vx *= Math.pow(0.15, dt);
        } else if (effect.type === "word") {
          effect.x += effect.vx * dt;
          effect.y += effect.vy * dt;
          effect.vy += 55 * dt;
          effect.rotation += effect.spin * dt;
        } else if (effect.type === "confetti") {
          effect.x += effect.vx * dt;
          effect.y += effect.vy * dt;
          effect.vy += 260 * dt;
          effect.rotation += effect.spin * dt;
        } else if (effect.type === "ring") {
          effect.radius += effect.speed * dt;
        } else if (effect.type === "dust") {
          effect.x += effect.vx * dt;
          effect.y += effect.vy * dt;
          effect.vy -= 18 * dt;
        }
        if (effect.life <= 0) this.effects.splice(i, 1);
      }

      for (let i = this.damageFloats.length - 1; i >= 0; i -= 1) {
        const float = this.damageFloats[i];
        float.life -= dt;
        float.y += float.vy * dt;
        float.vy += 40 * dt;
        if (float.life <= 0) this.damageFloats.splice(i, 1);
      }
    }

    spawnImpact(x, y, direction, heavy, ultimate = false) {
      const duration = ultimate ? 0.3 : heavy ? 0.25 : 0.16;
      this.impacts.push({
        x,
        y,
        direction,
        heavy,
        ultimate,
        life: duration,
        maxLife: duration,
        seed: random(0, Math.PI * 2),
      });
    }

    triggerHUDImpact(target, heavy) {
      const hud = target.isPlayer
        ? document.querySelector(".player-hud")
        : document.querySelector(".enemy-hud");
      if (!hud?.animate) return;
      hud.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)", filter: "brightness(1)" },
          {
            transform: `translate3d(${target.isPlayer ? -8 : 8}px, ${heavy ? 5 : 2}px, 0) scale(${heavy ? 1.025 : 1.012})`,
            filter: "brightness(1.55)",
            offset: 0.18,
          },
          { transform: "translate3d(0, 0, 0) scale(1)", filter: "brightness(1)" },
        ],
        {
          duration: heavy ? 240 : 145,
          easing: "cubic-bezier(.14,.8,.22,1)",
        },
      );
    }

    triggerImpactVignette(target, heavy) {
      const overlay = document.querySelector("#impactOverlay");
      if (!overlay) return;
      overlay.style.setProperty("--impact-x", `${clamp((target.x / WIDTH) * 100, 10, 90)}%`);
      overlay.style.setProperty("--impact-y", "48%");
      overlay.classList.toggle("is-heavy", heavy);
      overlay.classList.remove("is-active");
      void overlay.offsetWidth;
      overlay.classList.add("is-active");
    }

    pulseComboCallout() {
      const value = ui.comboCallout.querySelector("strong");
      if (!value) return;
      value.classList.remove("is-hit");
      void value.offsetWidth;
      value.classList.add("is-hit");
    }

    spawnHitBurst(x, y, direction, heavy, ultimate = false) {
      const colors = ultimate
        ? ["#fff3bd", "#ffd847", "#bde76b", "#ffffff"]
        : heavy
          ? ["#fff3bd", "#ffd94f", "#ff8c58"]
          : ["#fff9d5", "#e7f58b", "#ffffff"];
      const count = ultimate ? 24 : heavy ? 18 : 11;
      for (let i = 0; i < count; i += 1) {
        const angle = random(-1.18, 1.18) + (direction > 0 ? 0 : Math.PI);
        const speed = random(130, heavy ? 520 : 350);
        this.effects.push({
          type: "spark",
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 80,
          size: random(4, heavy ? 14 : 9),
          color: colors[Math.floor(Math.random() * colors.length)],
          life: random(0.22, 0.52),
          maxLife: 0.52,
          shape: Math.random() < 0.35 ? "square" : "line",
          rotation: random(0, Math.PI),
        });
      }
      this.spawnRing(x, y, heavy ? "#ffe46e" : "#fff4c1", heavy ? 105 : 62);
    }

    spawnWhiff(fighter, heavy) {
      const x = fighter.x + fighter.facing * (heavy ? 130 : 95);
      const y = fighter.y - 165;
      this.effects.push({
        type: "ring",
        x,
        y,
        radius: 8,
        speed: heavy ? 150 : 105,
        color: heavy ? "rgba(255, 244, 194, .48)" : "rgba(255, 255, 255, .38)",
        life: 0.18,
        maxLife: 0.18,
        width: 3,
      });
    }

    spawnRing(x, y, color, maxRadius = 90) {
      this.effects.push({
        type: "ring",
        x,
        y,
        radius: 9,
        endRadius: maxRadius,
        speed: maxRadius * 5.2,
        color,
        life: 0.34,
        maxLife: 0.34,
        width: 5,
      });
    }

    spawnWord(x, y, text, color, size) {
      this.effects.push({
        type: "word",
        x,
        y,
        text,
        color,
        size,
        vx: random(-24, 24),
        vy: -46,
        rotation: random(-0.13, 0.13),
        spin: random(-0.2, 0.2),
        life: 0.62,
        maxLife: 0.62,
      });
    }

    spawnDust(x, y, count) {
      for (let i = 0; i < count; i += 1) {
        this.effects.push({
          type: "dust",
          x: x + random(-36, 36),
          y: y - random(0, 7),
          vx: random(-80, 80),
          vy: random(-65, -18),
          size: random(8, 20),
          color: "rgba(235, 210, 151, .38)",
          life: random(0.24, 0.48),
          maxLife: 0.48,
        });
      }
    }

    spawnConfetti(x, y) {
      const colors = ["#ffd84d", "#c9e86f", "#73d8d0", "#ff745b", "#fff3c9"];
      this.effects.push({
        type: "confetti",
        x,
        y,
        vx: random(-150, 150),
        vy: random(-420, -90),
        size: random(4, 9),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: random(0, Math.PI * 2),
        spin: random(-8, 8),
        life: random(1.2, 2.2),
        maxLife: 2.2,
      });
    }

    spawnUltimateRing(owner, pulse) {
      const x = owner.x;
      const y = owner.y - 145;
      for (let i = 0; i < 2; i += 1) {
        this.effects.push({
          type: "ring",
          x,
          y,
          radius: 20 + i * 24,
          endRadius: WIDTH,
          speed: 690 + i * 90,
          color: i % 2 ? "rgba(255, 244, 174, .86)" : "rgba(191, 232, 94, .76)",
          life: 0.9,
          maxLife: 0.9,
          width: 9 - i * 2,
        });
      }
      for (let i = 0; i < 6; i += 1) {
        this.spawnWord(
          x + random(-300, 300),
          y + random(-110, 160),
          Math.random() < 0.5 ? "齁" : "哈",
          i % 2 ? "#c9e86f" : "#fff4ae",
          random(26, 54),
        );
      }
      if (pulse === 3) this.flash = 0.46;
    }

    showToast(message) {
      ui.toast.textContent = message;
      ui.toast.classList.add("is-visible");
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), 1500);
    }

    showCallout(text, key, isGo = false, isPerfect = false) {
      if (key === this.calloutKey) return;
      this.calloutKey = key;
      ui.centerCallout.textContent = text;
      ui.centerCallout.classList.remove("is-visible", "is-go", "is-perfect");
      void ui.centerCallout.offsetWidth;
      ui.centerCallout.classList.toggle("is-go", isGo);
      ui.centerCallout.classList.toggle("is-perfect", isPerfect);
      ui.centerCallout.classList.add("is-visible");
    }

    updateDivineSkillDemo(dt) {
      this.roundTime = ROUND_SECONDS;
      this.player.meter = 0;
      this.enemy.thinkTimer = 999;
      if (this.player.action) return;

      this.debugDivineDemoTimer -= dt;
      if (this.debugDivineDemoTimer > 0) return;

      const order = ["light", "heavy", "rush", "heal"];
      const action = order[this.debugDivineDemoIndex];
      const move = DIVINE_MOVES[action];
      this.debugDivineDemoIndex += 1;
      if (this.debugDivineDemoIndex >= order.length) {
        this.debugDivineDemoIndex = 0;
        this.debugDivineDemoCycle += 1;
      }

      this.projectiles.length = 0;
      this.player.x = clamp(this.player.x, 440, 520);
      this.player.y = GROUND_Y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.grounded = true;
      this.player.facing = 1;
      this.enemy.x = clamp(this.player.x + 215, 600, 920);
      this.enemy.y = GROUND_Y;
      this.enemy.vx = 0;
      this.enemy.vy = 0;
      this.enemy.grounded = true;
      this.enemy.health = this.enemy.maxHealth;
      this.enemy.meter = 0;
      this.enemy.hitStun = 0;
      this.enemy.invulnerable = 0;
      this.enemy.action = null;
      this.enemy.actionResolved = false;
      this.enemy.ko = false;
      this.enemy.burnTime = 0;
      this.enemy.burnInferno = false;
      if (action === "light") {
        this.player.health = this.player.maxHealth;
        this.player.shield = 0;
        this.player.shieldMax = 0;
        this.player.shieldHealPool = 0;
      }
      if (action === "rush") {
        this.player.health = Math.round(this.player.maxHealth * 0.48);
        this.player.shield = 0;
        this.player.shieldMax = 0;
        this.player.shieldHealPool = 0;
      }
      this.player.startAttack(action);
      this.showToast(`四技能演示 ${this.debugDivineDemoIndex || 4}/4 · ${move.name}`);
      this.debugDivineDemoTimer = action === "heavy" ? 1.55 : 1.35;
    }

    update(dt) {
      if (this.onlineMode === "guest") return;
      if (this.networkRebirthPending) return;
      if (this.rebirthPending || this.divineTransitionActive) return;
      if (this.perfectBlock) {
        this.perfectBlock.timeLeft -= dt;
        if (this.perfectBlock.timeLeft <= 0) this.perfectBlock = null;
      }
      if (this.divineCast) {
        this.elapsed += dt;
        this.updateDivineSkillCast(dt);
        this.tickHUD(dt);
        return;
      }
      if (
        this.ultimate?.mode === "image" &&
        this.ultimate.time < 3 &&
        !ui.holyUltimate.hidden
      ) {
        this.elapsed += dt;
        this.updateUltimate(dt);
        return;
      }

      const rawDt = dt;
      this.elapsed += rawDt;
      const focusTarget = (this.player.x + this.enemy.x) / 2;
      this.cameraFocus = lerp(this.cameraFocus, clamp(focusTarget, 500, 940), Math.min(1, rawDt * 7.5));
      this.cameraKick = moveToward(this.cameraKick, 0, rawDt * 0.34);
      this.cameraRoll = moveToward(this.cameraRoll, 0, rawDt * 0.1);
      this.shake = Math.max(0, this.shake - rawDt * 52);
      this.flash = Math.max(0, this.flash - rawDt * 2.95);
      this.crowdEnergy = Math.max(0, this.crowdEnergy - rawDt * 0.42);

      if (this.hitStop <= 0 && this.slowMotion > 0 && this.phase === "playing" && !this.paused) {
        this.slowMotion = Math.max(0, this.slowMotion - rawDt);
        dt *= 0.5;
      }
      this.updateEffects(this.hitStop > 0 ? rawDt * 0.12 : dt);

      if (this.paused) return;

      if (this.hitStop > 0) {
        this.hitStop -= rawDt;
        return;
      }

      if (this.phase === "countdown") {
        this.countdown -= dt;
        if (this.countdown > 2.22) this.showCallout("3", "3");
        else if (this.countdown > 1.22) this.showCallout("2", "2");
        else if (this.countdown > 0.22) this.showCallout("1", "1");
        else if (this.calloutKey !== "go") {
          this.showCallout("开打！", "go", true);
          this.phase = "playing";
          gameFrame.classList.add("is-playing");
          audio.suspendLobbyMusic();
          audio.roundStart();
          this.startMatchMusic();
          this.syncPauseButton();
        }
        this.player.update(dt);
        this.enemy.update(dt);
        this.tickHUD(rawDt);
        return;
      }

      if (this.ultimate) {
        this.updateUltimate(dt);
        if (this.ultimate?.damageStarted) {
          this.player.update(dt);
          this.enemy.update(dt);
          this.separateFighters();
          this.updateBurnEffects(dt);
          this.updateDivineShield(dt);
          this.tickHUD(rawDt);
        }
        return;
      }

      if (this.phase === "playing") {
        if (this.debugDivinePreview && !this.debugDivineStarted) {
          this.debugDivineStarted = true;
          this.divineForm = true;
          this.divineRebirthUsed = true;
          this.player.health = this.player.maxHealth;
          this.updatePlayerIdentity();
          this.showCallout("神-奶娃", "divine-debug", true);
        }
        if (this.debugRebirthPreview && !this.debugRebirthStarted) {
          this.debugRebirthStarted = true;
          this.player.health = 80;
          this.player.meter = MAX_METER;
          this.enemy.x = this.player.x + 150;
          this.enemy.startAttack("heavy");
          return;
        }
        if (this.debugEnemyCharge && !this.debugEnemyChargeStarted) {
          this.debugEnemyChargeStarted = true;
          this.enemy.x = this.player.x + 300;
          this.enemy.meter = MAX_METER;
          this.enemy.startUltimate();
          return;
        }
        if (this.debugKOPreview && !this.debugKOStarted) {
          this.debugKOStarted = true;
          this.enemy.x = this.player.x + 185;
          this.enemy.health = 1;
          this.enemy.thinkTimer = 1;
          this.player.startAttack("rush");
        }
        if (this.debugBlockPreview) this.keys.add("z");
        if (this.debugPerfectPreview && !this.debugPerfectStarted) {
          this.debugPerfectStarted = true;
          this.enemy.x = this.player.x + 300;
          this.enemy.meter = MAX_METER;
          this.enemy.startUltimate();
          this.keys.add("z");
          this.tryArmPerfectBlock();
          return;
        }
        if (this.debugPerfectSkillPreview && !this.debugPerfectSkillStarted) {
          this.debugPerfectSkillStarted = true;
          this.enemy.x = this.player.x + 175;
          this.enemy.startAttack("heavy");
          this.keys.add("z");
          this.tryArmPerfectBlock();
          return;
        }
        if (this.debugUltimatePreview && !this.debugUltimateStarted) {
          this.debugUltimateStarted = true;
          this.player.meter = MAX_METER;
          this.player.startUltimate();
          return;
        }
        if (this.debugDivineSkillDemo) this.updateDivineSkillDemo(dt);
        this.roundTime = Math.max(0, this.roundTime - dt);
        if (!this.debugDivineSkillDemo && this.onlineMode !== "host") this.updateAI(dt);
        this.player.update(dt);
        this.enemy.update(dt);
        this.separateFighters();
        this.updateProjectiles(dt);
        this.updateBurnEffects(dt);
        this.updateDivineShield(dt);
        this.updateDivineBarrage(dt);
        if (this.comboClock > 0) {
          this.comboClock -= dt;
          if (this.comboClock <= 0) {
            this.playerCombo = 0;
            this.enemyCombo = 0;
            this.updateComboCallout();
          }
        }

        if (this.roundTime <= 0 && this.phase === "playing") this.finishByTimeout();
        this.tickHUD(rawDt);
        return;
      }

      if (this.phase === "ko") {
        this.player.update(dt);
        this.enemy.update(dt);
        if (this.debugKOHold && this.koFinisherActive) return;
        this.koTimer += dt;
        if (
          this.koTimer >=
          (this.koFinisherActive ? this.koFinisherDuration || 2.9 : 1.75)
        ) {
          this.finalizeRound();
        }
      }
    }

    tickHUD(dt, force = false) {
      this.hudAccumulator += dt;
      if (!force && this.hudAccumulator < 0.033) return;
      this.hudAccumulator = 0;
      this.updateHUD();
    }

    updateHUD() {
      const playerHealth = clamp(this.player.health, 0, this.player.maxHealth);
      const enemyHealth = clamp(this.enemy.health, 0, this.enemy.maxHealth);
      const playerHealthPercent = (playerHealth / this.player.maxHealth) * 100;
      const enemyHealthPercent = (enemyHealth / this.enemy.maxHealth) * 100;
      const setWidth = (element, value) => {
        const width = `${value}%`;
        if (element.style.width !== width) element.style.width = width;
      };
      setWidth(ui.playerHealth, playerHealthPercent);
      setWidth(ui.playerHealthLag, playerHealthPercent);
      setWidth(ui.enemyHealth, enemyHealthPercent);
      setWidth(ui.enemyHealthLag, enemyHealthPercent);
      ui.playerHealth.title = `${Math.ceil(playerHealth)} / ${this.player.maxHealth}`;
      ui.enemyHealth.title = `${Math.ceil(enemyHealth)} / ${this.enemy.maxHealth}`;
      const playerLow = playerHealth <= this.player.maxHealth * 0.28;
      const enemyLow = enemyHealth <= this.enemy.maxHealth * 0.28;
      if (ui.playerHealth.classList.contains("is-low") !== playerLow) ui.playerHealth.classList.toggle("is-low", playerLow);
      if (ui.enemyHealth.classList.contains("is-low") !== enemyLow) ui.enemyHealth.classList.toggle("is-low", enemyLow);

      setWidth(ui.playerMeter, this.player.meter);
      setWidth(ui.enemyMeter, this.enemy.meter);
      const playerMeter = String(Math.floor(this.player.meter));
      const enemyMeter = String(Math.floor(this.enemy.meter));
      if (ui.playerMeterText.textContent !== playerMeter) ui.playerMeterText.textContent = playerMeter;
      if (ui.enemyMeterText.textContent !== enemyMeter) ui.enemyMeterText.textContent = enemyMeter;
      const playerFull = this.player.meter >= MAX_METER;
      const enemyFull = this.enemy.meter >= MAX_METER;
      if (ui.playerMeter.classList.contains("is-full") !== playerFull) ui.playerMeter.classList.toggle("is-full", playerFull);
      if (ui.enemyMeter.classList.contains("is-full") !== enemyFull) ui.enemyMeter.classList.toggle("is-full", enemyFull);

      const seconds = Math.max(0, Math.ceil(this.roundTime));
      const secondsText = seconds.toString().padStart(2, "0");
      if (ui.timer.textContent !== secondsText) ui.timer.textContent = secondsText;
      const timerColor = seconds <= 10 ? "#ff8266" : "";
      if (ui.timer.style.color !== timerColor) ui.timer.style.color = timerColor;

      const controlledFighter = this.onlineMode === "guest" ? this.enemy : this.player;
      for (const card of ui.skillCards) {
        const skill = card.dataset.skill;
        let unavailable = this.phase !== "playing" || controlledFighter.action;
        if (skill === "heal" && this.getFighterCharacter(controlledFighter) !== "divine")
          unavailable ||=
            controlledFighter.meter < 25 || controlledFighter.health >= controlledFighter.maxHealth;
        if (skill === "ultimate") unavailable ||= controlledFighter.meter < MAX_METER;
        card.classList.toggle("is-unavailable", unavailable);
        card.classList.toggle(
          "is-ready",
          skill === "ultimate" && controlledFighter.meter >= MAX_METER,
        );
      }
    }

    loop(time) {
      const rawDelta = (time - this.lastFrame) / 1000;
      const dt = Math.min(rawDelta, 0.034);
      this.lastFrame = time;
      if (document.visibilityState === "hidden") {
        requestAnimationFrame((nextTime) => this.loop(nextTime));
        return;
      }
      this.update(dt);
      this.draw(time / 1000);
      if (this.onlineMode === "host" && this.networkReady) {
        this.networkSendAccumulator += rawDelta;
        if (this.networkSendAccumulator >= 0.05) {
          this.networkSendAccumulator = 0;
          this.sendNetwork(this.createNetworkSnapshot());
        }
      }
      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    buildBackgroundCache() {
      const background = document.createElement("canvas");
      background.width = WIDTH;
      background.height = HEIGHT;
      const mainContext = ctx;
      ctx = background.getContext("2d", { alpha: false });

      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#173347");
      sky.addColorStop(0.38, "#4d8e89");
      sky.addColorStop(0.72, "#c7cd8c");
      sky.addColorStop(1, "#f4cf75");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const glow = ctx.createRadialGradient(1120, 155, 20, 1120, 155, 260);
      glow.addColorStop(0, "rgba(255, 243, 189, .82)");
      glow.addColorStop(0.23, "rgba(255, 233, 146, .3)");
      glow.addColorStop(1, "rgba(255, 225, 128, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(760, 0, 680, 500);
      ctx.fillStyle = "#fff2b0";
      ctx.beginPath();
      ctx.arc(1120, 162, 88, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < 6; i += 1) {
        ctx.strokeStyle = "#fff5c8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(1120, 162, 118 + i * 21, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      this.drawCity(0);
      this.drawLanternStrings(0);
      this.drawAudience(0);
      this.drawGround(0);

      ctx = mainContext;
      this.backgroundCanvas = background;
    }

    drawBackground(time) {
      if (!this.backgroundCanvas) this.buildBackgroundCache();
      ctx.drawImage(this.backgroundCanvas, 0, 0);

      if (this.crowdEnergy > 0.12) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.45, this.crowdEnergy * 0.42);
        ctx.strokeStyle = "rgba(255, 245, 188, .82)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 14; i += 1) {
          const x = 40 + i * 100;
          const lift = 8 + Math.sin(time * 5 + i) * 7 + this.crowdEnergy * 11;
          ctx.beginPath();
          ctx.moveTo(x, 600);
          ctx.lineTo(x - 8, 600 - lift);
          ctx.moveTo(x + 18, 600);
          ctx.lineTo(x + 26, 600 - lift);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#fff8ce";
      for (let i = 0; i < 16; i += 1) {
        const x = (i * 257 + time * (6 + (i % 3) * 4)) % (WIDTH + 80) - 40;
        const y = 180 + ((i * 47) % 430) + Math.sin(time * 0.9 + i) * 8;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawCity(time) {
      ctx.save();
      const horizonY = 565;
      ctx.fillStyle = "rgba(31, 64, 66, .28)";
      const buildings = [
        [0, 415, 185, 180],
        [150, 445, 150, 150],
        [280, 385, 155, 210],
        [415, 460, 185, 135],
        [940, 430, 160, 165],
        [1080, 392, 210, 203],
        [1270, 438, 170, 157],
      ];
      for (const [x, y, w, h] of buildings) {
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(255, 241, 174, .12)";
        for (let wx = x + 20; wx < x + w - 15; wx += 37) {
          for (let wy = y + 24; wy < y + h - 15; wy += 34) {
            if ((Math.round(wx + wy) + Math.floor(time * 0.1)) % 3 !== 0) ctx.fillRect(wx, wy, 9, 13);
          }
        }
        ctx.fillStyle = "rgba(31, 64, 66, .28)";
      }
      ctx.fillStyle = "rgba(20, 48, 54, .45)";
      ctx.fillRect(0, horizonY - 48, WIDTH, 48);
      ctx.strokeStyle = "rgba(255, 246, 196, .28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY - 50);
      ctx.lineTo(WIDTH, horizonY - 50);
      ctx.stroke();
      ctx.restore();
    }

    drawLanternStrings(time) {
      ctx.save();
      ctx.strokeStyle = "rgba(20, 29, 34, .48)";
      ctx.lineWidth = 2;
      for (let row = 0; row < 2; row += 1) {
        const y = 112 + row * 92;
        ctx.beginPath();
        ctx.moveTo(-20, y + 20);
        ctx.quadraticCurveTo(WIDTH * 0.5, y + 85, WIDTH + 20, y + 9);
        ctx.stroke();
        for (let i = 0; i < 11; i += 1) {
          const t = (i + 1) / 12;
          const x = t * WIDTH;
          const curveY = (1 - t) * (1 - t) * (y + 20) + 2 * (1 - t) * t * (y + 85) + t * t * (y + 9);
          const swing = Math.sin(time * 1.25 + i * 0.9 + row) * 0.09;
          ctx.save();
          ctx.translate(x, curveY);
          ctx.rotate(swing);
          ctx.strokeStyle = "rgba(24, 30, 30, .45)";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 18);
          ctx.stroke();
          ctx.fillStyle = row === 1 && i % 2 ? "#ffca56" : "#fff2ad";
          ctx.beginPath();
          ctx.roundRect(-9, 17, 18, 25, 6);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    drawAudience(time) {
      ctx.save();
      const baseY = 604;
      for (let i = 0; i < 68; i += 1) {
        const x = 20 + i * 21.6 + Math.sin(i * 7.2) * 7;
        const row = i % 3;
        const y = baseY + row * 23;
        const bounce = Math.sin(time * 4 + i * 0.85) * (2 + row + this.crowdEnergy * 8);
        const r = 11 + (i % 4);
        ctx.fillStyle = ["rgba(21, 44, 49, .77)", "rgba(57, 70, 61, .68)", "rgba(28, 36, 43, .72)"][row];
        ctx.beginPath();
        ctx.arc(x, y + bounce, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + r + 14 + bounce, 17, 12, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        if (this.crowdEnergy > 0.35 && i % 7 === 0) {
          ctx.strokeStyle = "rgba(255, 245, 188, .45)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x - r, y - r - 6 + bounce);
          ctx.lineTo(x - r - 8, y - r - 23 + bounce);
          ctx.moveTo(x + r, y - r - 6 + bounce);
          ctx.lineTo(x + r + 8, y - r - 23 + bounce);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawGround(time) {
      const floor = ctx.createLinearGradient(0, 632, 0, HEIGHT);
      floor.addColorStop(0, "#6b5a4b");
      floor.addColorStop(0.18, "#4d403c");
      floor.addColorStop(1, "#251f27");
      ctx.fillStyle = floor;
      ctx.fillRect(0, 632, WIDTH, HEIGHT - 632);

      ctx.save();
      ctx.strokeStyle = "rgba(255, 226, 163, .12)";
      ctx.lineWidth = 2;
      for (let x = -WIDTH; x < WIDTH * 2; x += 130) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2 + (x - WIDTH / 2) * 0.15, 632);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 654; y < HEIGHT; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 232, 181, .26)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(135, GROUND_Y - 12);
      ctx.quadraticCurveTo(WIDTH / 2, GROUND_Y - 42, WIDTH - 135, GROUND_Y - 12);
      ctx.stroke();

      ctx.globalAlpha = 0.3 + Math.sin(time * 2.1) * 0.04;
      ctx.fillStyle = "#f4cc65";
      ctx.fillRect(120, GROUND_Y - 4, WIDTH - 240, 5);
      ctx.restore();
    }

    drawFighterShadow(fighter) {
      const heightFactor = clamp(1 - (GROUND_Y - fighter.y) / 500, 0.35, 1);
      ctx.save();
      ctx.translate(fighter.x, GROUND_Y + 2);
      ctx.fillStyle = "rgba(11, 10, 15, .3)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 96 * heightFactor, 20 * heightFactor, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawPlayer(fighter, time, character = this.getFighterCharacter(fighter)) {
      this.drawFighterShadow(fighter);
      const isMini = character === "mini";
      const isDivine = character === "divine";
      const divineArt = isDivine ? images.divineAura : null;
      let pose = isMini ? "miniIdle" : "guard";
      if (fighter.action === "heavy") pose = isMini ? "miniKick" : "palm";
      if (fighter.action === "rush") pose = isMini ? "miniHeart" : "fist";
      if (fighter.action === "light" && isMini) pose = "miniPoke";
      if (fighter.action === "heal" && isMini) pose = "miniHeart";
      const image = divineArt || images[pose] || (isMini ? images.miniIdle || images.guard : images.guard);
      if (!image) return;
      const targetHeights = {
        guard: 248,
        palm: 247,
        fist: 235,
        miniIdle: 218,
        miniPoke: 208,
        miniKick: 218,
        miniHeart: 202,
      };
      const targetHeight = divineArt ? 326 : targetHeights[pose];
      const scale = targetHeight / image.height;
      const width = image.width * scale;
      const height = image.height * scale;
      const idleBob =
        fighter.grounded && !fighter.action && !fighter.ko
          ? Math.sin(time * 3.25) * 3 + Math.sin(fighter.walkPhase) * Math.abs(fighter.vx) * 0.008
          : 0;
      const progress = fighter.action
        ? clamp(fighter.actionTime / Math.max(0.01, fighter.actionDuration), 0, 1)
        : 0;
      const bellyDrive =
        fighter.action === "light"
          ? Math.sin(clamp(progress / 0.58, 0, 1) * Math.PI)
          : 0;
      const heavyDrive =
        fighter.action === "heavy"
          ? Math.sin(clamp(progress / 0.62, 0, 1) * Math.PI)
          : 0;
      const rushDrive =
        fighter.action === "rush"
          ? Math.sin(clamp(progress / 0.6, 0, 1) * Math.PI)
          : 0;
      let poseKick = 0;
      if (fighter.action === "light") poseKick = bellyDrive * (isDivine ? 66 : 34);
      if (fighter.action === "heavy") poseKick = heavyDrive * (isDivine ? 82 : 46);
      if (fighter.action === "rush") poseKick = rushDrive * (isDivine ? 24 : 52);
      const imageFacesLeft = divineArt ? false : pose !== "palm" && pose !== "miniKick";
      const flip = fighter.facing * (imageFacesLeft ? -1 : 1);
      const impactSquash = 1 + Math.min(0.13, fighter.hitFlash * 0.58);

      if (isDivine && !fighter.ko) {
        const auraPulse = 0.76 + Math.sin(time * 5.2) * 0.16;
        ctx.save();
        ctx.translate(fighter.x, fighter.y - 128);
        const aura = ctx.createRadialGradient(0, 0, 18, 0, 0, 154);
        aura.addColorStop(0, `rgba(255, 252, 211, ${0.12 * auraPulse})`);
        aura.addColorStop(0.56, `rgba(255, 215, 74, ${0.18 * auraPulse})`);
        aura.addColorStop(1, "rgba(255, 137, 31, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 154, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 240, 158, ${0.32 + auraPulse * 0.22})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 2; i += 1) {
          const side = i === 0 ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(side * 22, -170);
          ctx.bezierCurveTo(
            side * (90 + auraPulse * 16),
            -210,
            side * 128,
            -110,
            side * 72,
            -18,
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fighter.action === "heal" && !fighter.ko && !isDivine) {
        const pulse = Math.sin(clamp(progress, 0, 1) * Math.PI);
        ctx.save();
        ctx.translate(fighter.x, fighter.y - 132);
        ctx.scale(1, 1.32);
        const healGlow = ctx.createRadialGradient(0, 0, 12, 0, 0, 142);
        healGlow.addColorStop(0, `rgba(227, 255, 170, ${0.3 + pulse * 0.28})`);
        healGlow.addColorStop(0.48, `rgba(131, 222, 104, ${0.16 + pulse * 0.2})`);
        healGlow.addColorStop(1, "rgba(131, 222, 104, 0)");
        ctx.fillStyle = healGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 142, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(226, 255, 176, ${0.26 + pulse * 0.54})`;
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 72 + i * 28 + progress * 22, time * 1.4 + i * 1.9, time * 1.4 + i * 1.9 + Math.PI * 1.28);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fighter.blocking && !fighter.ko) {
        const shieldPulse = 0.96 + Math.sin(time * 7.5) * 0.04;
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * 20, fighter.y - 146);
        ctx.scale(1, 1.28);
        const shieldGlow = ctx.createRadialGradient(0, 0, 26, 0, 0, 118);
        shieldGlow.addColorStop(0, "rgba(195, 245, 222, .02)");
        shieldGlow.addColorStop(0.7, "rgba(163, 232, 207, .09)");
        shieldGlow.addColorStop(0.93, "rgba(221, 255, 236, .34)");
        shieldGlow.addColorStop(1, "rgba(151, 228, 197, 0)");
        ctx.fillStyle = shieldGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 112 * shieldPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(208, 255, 232, ${0.5 + Math.sin(time * 8) * 0.12})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 92 * shieldPulse, -1.12, 1.12);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 247, 203, .32)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 105 * shieldPulse, -0.88, 0.88);
        ctx.stroke();
        ctx.restore();
      }

      if (
        (fighter.action === "light" || fighter.action === "heavy" || fighter.action === "rush") &&
        !fighter.ko
      ) {
        const trailDistance = fighter.action === "rush" ? 44 : fighter.action === "heavy" ? 34 : 18;
        const trailAlpha =
          Math.sin(progress * Math.PI) * (fighter.action === "rush" ? 0.24 : fighter.action === "heavy" ? 0.19 : 0.12);
        ctx.save();
        ctx.translate(fighter.x - fighter.facing * trailDistance, fighter.y - 5);
        ctx.scale(flip, 1);
        ctx.globalAlpha = trailAlpha;
        ctx.globalCompositeOperation = divineArt ? "screen" : "source-over";
        ctx.drawImage(image, -width / 2, -height, width, height);
        ctx.restore();
      }

      if (fighter.action === "light" && !fighter.ko) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (54 + bellyDrive * 30), fighter.y - 148);
        ctx.rotate(-fighter.facing * 0.08 * bellyDrive);
        const bellyGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 76);
        bellyGlow.addColorStop(0, `rgba(255, 249, 196, ${0.24 + bellyDrive * 0.3})`);
        bellyGlow.addColorStop(0.5, `rgba(255, 210, 73, ${0.13 + bellyDrive * 0.18})`);
        bellyGlow.addColorStop(1, "rgba(255, 210, 73, 0)");
        ctx.fillStyle = bellyGlow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 78, 58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 240, 156, ${0.25 + bellyDrive * 0.55})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 48 + bellyDrive * 44, 35 + bellyDrive * 30, 0, -1.2, 1.2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 229, ${0.3 + bellyDrive * 0.5})`;
        ctx.lineWidth = 3;
        for (let line = 0; line < 3; line += 1) {
          const y = -20 + line * 20;
          ctx.beginPath();
          ctx.moveTo(72 + line * 8, y);
          ctx.lineTo(105 + bellyDrive * 36 + line * 8, y - 7 + line * 7);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fighter.action === "light" && !fighter.ko && isMini) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (86 + bellyDrive * 54), fighter.y - 142);
        ctx.scale(fighter.facing, 1);
        ctx.globalAlpha = 0.34 + bellyDrive * 0.54;
        ctx.strokeStyle = "#fff2aa";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        for (let i = 0; i < 3; i += 1) {
          const y = -22 + i * 22;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(78 + bellyDrive * 28, y - 5 + i * 4);
          ctx.stroke();
        }
        ctx.fillStyle = "#ffcf69";
        ctx.beginPath();
        ctx.arc(96 + bellyDrive * 26, 0, 8 + bellyDrive * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (fighter.action === "heavy" && !fighter.ko) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (62 + heavyDrive * 66), fighter.y - 154);
        ctx.rotate(-fighter.facing * 0.12 * heavyDrive);
        const blast = ctx.createRadialGradient(0, 0, 7, 0, 0, 112);
        blast.addColorStop(0, `rgba(255, 249, 201, ${0.3 + heavyDrive * 0.4})`);
        blast.addColorStop(0.42, `rgba(255, 201, 64, ${0.18 + heavyDrive * 0.25})`);
        blast.addColorStop(1, "rgba(255, 158, 44, 0)");
        ctx.fillStyle = blast;
        ctx.beginPath();
        ctx.ellipse(0, 0, 104 + heavyDrive * 32, 76 + heavyDrive * 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 239, 145, ${0.35 + heavyDrive * 0.55})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, 62 + heavyDrive * 58, -1.1, 1.18);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 233, .72)";
        ctx.lineWidth = 3;
        for (let line = 0; line < 4; line += 1) {
          const offset = -42 + line * 28;
          ctx.beginPath();
          ctx.moveTo(86 + heavyDrive * 28, offset);
          ctx.lineTo(122 + heavyDrive * 56 + line * 8, offset * 1.12);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fighter.action === "rush" && !fighter.ko && !isMini) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (88 + rushDrive * 76), fighter.y - 176);
        ctx.scale(fighter.facing, 1);
        ctx.globalAlpha = 0.35 + rushDrive * 0.6;
        ctx.strokeStyle = "#fff3aa";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(18, 0, 58 + rushDrive * 34, -1.05, 1.05);
        ctx.stroke();
        ctx.globalAlpha *= 0.72;
        for (let line = 0; line < 4; line += 1) {
          const y = -34 + line * 23;
          ctx.beginPath();
          ctx.moveTo(-78 - rushDrive * 28, y);
          ctx.lineTo(-22 + rushDrive * 36, y - 3);
          ctx.stroke();
        }
        const punchGlow = ctx.createRadialGradient(52, 0, 2, 52, 0, 82);
        punchGlow.addColorStop(0, "rgba(255, 255, 230, .9)");
        punchGlow.addColorStop(0.42, "rgba(255, 222, 80, .35)");
        punchGlow.addColorStop(1, "rgba(255, 201, 52, 0)");
        ctx.fillStyle = punchGlow;
        ctx.beginPath();
        ctx.arc(52, 0, 82, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (fighter.action === "rush" && !fighter.ko && isMini) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (64 + rushDrive * 24), fighter.y - 112);
        const heartGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 88);
        heartGlow.addColorStop(0, "rgba(255, 255, 255, .7)");
        heartGlow.addColorStop(0.38, "rgba(255, 171, 195, .34)");
        heartGlow.addColorStop(1, "rgba(255, 129, 166, 0)");
        ctx.fillStyle = heartGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 88, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 5; i += 1) {
          const a = time * 2 + (i * Math.PI * 2) / 5;
          ctx.fillStyle = i % 2 ? "#fff5c5" : "#ffb8ca";
          ctx.beginPath();
          ctx.arc(Math.cos(a) * (48 + rushDrive * 20), Math.sin(a) * 36, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (fighter.action === "light" && !fighter.ko && isDivine) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (82 + bellyDrive * 62), fighter.y - 152);
        ctx.scale(fighter.facing, 1);
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.34 + bellyDrive * 0.6;
        ctx.strokeStyle = "#ffe56d";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        for (let ring = 0; ring < 3; ring += 1) {
          const radius = 24 + ring * 18 + bellyDrive * 34;
          ctx.beginPath();
          ctx.arc(0, 0, radius, -0.9 + ring * 0.18, 0.9 - ring * 0.12);
          ctx.stroke();
        }
        ctx.fillStyle = "#fff7bf";
        ctx.beginPath();
        ctx.moveTo(18 + bellyDrive * 36, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if (fighter.action === "rush" && !fighter.ko && isDivine) {
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (94 + rushDrive * 76), fighter.y - 148);
        ctx.scale(fighter.facing, 1);
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.3 + rushDrive * 0.58;
        ctx.strokeStyle = "#9dffe3";
        ctx.lineWidth = 5;
        for (let ring = 0; ring < 3; ring += 1) {
          ctx.beginPath();
          ctx.ellipse(0, 0, 38 + rushDrive * 46 + ring * 20, 66 + ring * 18, 0, -1.08, 1.08);
          ctx.stroke();
        }
        ctx.strokeStyle = "#fff2a1";
        ctx.lineWidth = 3;
        for (let line = 0; line < 4; line += 1) {
          const y = -42 + line * 28;
          ctx.beginPath();
          ctx.moveTo(-58 - rushDrive * 24, y);
          ctx.lineTo(18 + rushDrive * 36, y - 4);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (fighter.action === "heal" && !fighter.ko && isDivine) {
        const fireProgress = Math.sin(clamp(progress, 0, 1) * Math.PI);
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * (72 + fireProgress * 22), fighter.y - 154);
        ctx.scale(fighter.facing, 1);
        ctx.globalCompositeOperation = "screen";
        for (let shot = 0; shot < 2; shot += 1) {
          const y = shot === 0 ? -34 : 34;
          const shotGlow = ctx.createRadialGradient(4, y, 2, 4, y, 34);
          shotGlow.addColorStop(0, `rgba(255, 255, 233, ${0.52 + fireProgress * 0.4})`);
          shotGlow.addColorStop(0.42, `rgba(255, 220, 76, ${0.28 + fireProgress * 0.32})`);
          shotGlow.addColorStop(1, "rgba(255, 122, 28, 0)");
          ctx.fillStyle = shotGlow;
          ctx.beginPath();
          ctx.arc(4, y, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 245, 186, .8)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(4, y);
          ctx.lineTo(62 + fireProgress * 36, y - shot * 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      if (fighter.ko) {
        ctx.translate(fighter.x, fighter.y - height * 0.55);
        ctx.rotate(fighter.koRotation + fighter.hitTilt);
        ctx.scale(flip, 1);
        ctx.globalAlpha = clamp(fighter.y / GROUND_Y, 0.12, 1);
        if (fighter.hitFlash > 0) ctx.filter = "brightness(2.3) saturate(.4)";
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        const blockTuck = fighter.blocking ? 1 : 0;
        ctx.translate(
          fighter.x + fighter.facing * poseKick,
          fighter.y + idleBob + bellyDrive * 4 + heavyDrive * 5 + rushDrive * 7 + blockTuck * 3,
        );
        ctx.rotate(
          fighter.hitTilt -
            fighter.facing * (bellyDrive * 0.065 + heavyDrive * 0.085 + rushDrive * 0.1),
        );
        ctx.scale(
          flip *
            impactSquash *
            (1 + bellyDrive * 0.13 + heavyDrive * 0.18 + rushDrive * 0.12 + blockTuck * 0.025),
          (1 / impactSquash) *
            (1 - bellyDrive * 0.055 - heavyDrive * 0.085 - rushDrive * 0.04 - blockTuck * 0.035),
        );
        if (fighter.hitFlash > 0) ctx.filter = "brightness(2) saturate(.55)";
        else if (isDivine) ctx.filter = "brightness(1.08) saturate(1.14)";
        if (divineArt) {
          ctx.globalAlpha = 0.98;
          ctx.drawImage(image, -width / 2, -height, width, height);
        } else {
          ctx.drawImage(image, -width / 2, -height, width, height);
        }
      }
      ctx.restore();

      if (fighter.meter >= MAX_METER && !fighter.action && fighter.invulnerable <= 0) {
        ctx.save();
        ctx.globalAlpha = 0.36 + Math.sin(time * 4) * 0.12;
        ctx.strokeStyle = "#fff2a0";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(fighter.x, fighter.y - 130, 92 + Math.sin(time * 4) * 5, 145, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawProjectiles(time) {
      for (const projectile of this.projectiles) {
        const pulse = 1 + Math.sin(projectile.phase) * 0.05;
        ctx.save();
        ctx.translate(projectile.x, projectile.y + Math.sin(projectile.phase * 0.7) * 5);
        ctx.scale(projectile.owner.facing * pulse, pulse);
        if (projectile.divineKind) {
          if (projectile.divineKind === "blast") {
            ctx.globalAlpha = 0.88;
            ctx.globalCompositeOperation = "screen";
            const tail = ctx.createLinearGradient(-92, 0, 10, 0);
            tail.addColorStop(0, "rgba(255, 61, 21, 0)");
            tail.addColorStop(0.42, "rgba(255, 101, 23, .42)");
            tail.addColorStop(1, "rgba(255, 239, 140, .95)");
            ctx.fillStyle = tail;
            ctx.beginPath();
            ctx.moveTo(-96, 0);
            ctx.bezierCurveTo(-52, -22, -18, -24, 8, -14);
            ctx.bezierCurveTo(18, -5, 18, 5, 8, 14);
            ctx.bezierCurveTo(-18, 24, -52, 22, -96, 0);
            ctx.fill();
            const blastGlow = ctx.createRadialGradient(0, 0, 3, 0, 0, projectile.radius * 1.7);
            blastGlow.addColorStop(0, "rgba(255, 255, 237, 1)");
            blastGlow.addColorStop(0.34, "rgba(255, 226, 92, .92)");
            blastGlow.addColorStop(0.72, "rgba(255, 112, 25, .62)");
            blastGlow.addColorStop(1, "rgba(255, 63, 18, 0)");
            ctx.fillStyle = blastGlow;
            ctx.beginPath();
            ctx.arc(0, 0, projectile.radius * 1.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff6c4";
            ctx.beginPath();
            ctx.arc(4, 0, projectile.radius * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
          }
          ctx.globalAlpha = 0.82;
          ctx.strokeStyle = "#ffe874";
          ctx.lineWidth = projectile.divineKind === "silence" ? 6 : 4;
          ctx.beginPath();
          ctx.moveTo(-52, 0);
          ctx.lineTo(18, 0);
          ctx.stroke();
          const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, projectile.radius * 1.8);
          glow.addColorStop(0, "rgba(255, 255, 235, .96)");
          glow.addColorStop(0.38, "rgba(255, 229, 105, .78)");
          glow.addColorStop(1, "rgba(255, 132, 31, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, projectile.radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(time * 3.2);
          ctx.strokeStyle = "#fff7bb";
          ctx.lineWidth = 3;
          for (let i = 0; i < 3; i += 1) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.moveTo(0, -projectile.radius);
            ctx.lineTo(0, projectile.radius);
            ctx.stroke();
          }
          ctx.restore();
          continue;
        }
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#ffd7df";
        ctx.lineWidth = 7;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(-24 - i * 17, 0, projectile.radius - i * 5, -1, 1);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, projectile.radius * 1.5);
        glow.addColorStop(0, "rgba(255, 255, 255, .9)");
        glow.addColorStop(0.42, "rgba(255, 183, 203, .62)");
        glow.addColorStop(1, "rgba(255, 136, 170, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, projectile.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(0, 0);
        ctx.rotate(-0.12);
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.bezierCurveTo(-54, -8, -30, -45, 0, -16);
        ctx.bezierCurveTo(30, -45, 54, -8, 0, 30);
        ctx.closePath();
        ctx.fillStyle = "#ff8fac";
        ctx.fill();
        ctx.strokeStyle = "#5d302f";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }

    drawDivineInfernoStatus(fighter, time, intensity) {
      const motionScale = this.reducedMotion ? 0.45 : 1;
      const flameCount = this.reducedMotion ? 6 : 10;
      const emberCount = this.reducedMotion ? 10 : 22;
      ctx.save();
      ctx.translate(fighter.x, fighter.y);

      ctx.globalAlpha = 0.34 + intensity * 0.34;
      ctx.fillStyle = "#35120a";
      ctx.beginPath();
      ctx.ellipse(0, 0, 92, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 102, 25, ${0.34 + intensity * 0.36})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -1, 84, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "screen";
      const glow = ctx.createRadialGradient(0, -122, 18, 0, -122, 190);
      glow.addColorStop(0, `rgba(255, 235, 143, ${0.17 + intensity * 0.2})`);
      glow.addColorStop(0.52, `rgba(255, 115, 24, ${0.15 + intensity * 0.16})`);
      glow.addColorStop(1, "rgba(255, 55, 16, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -122, 190, 0, Math.PI * 2);
      ctx.fill();

      const outerGradient = ctx.createLinearGradient(0, -270, 0, -18);
      outerGradient.addColorStop(0, "rgba(255, 57, 15, .12)");
      outerGradient.addColorStop(0.46, "rgba(255, 83, 17, .68)");
      outerGradient.addColorStop(1, "rgba(255, 177, 39, .92)");
      const innerGradient = ctx.createLinearGradient(0, -218, 0, -24);
      innerGradient.addColorStop(0, "rgba(255, 126, 28, .12)");
      innerGradient.addColorStop(0.42, "rgba(255, 210, 68, .72)");
      innerGradient.addColorStop(1, "rgba(255, 253, 194, .98)");

      for (let i = 0; i < flameCount; i += 1) {
        const normalized = flameCount === 1 ? 0 : i / (flameCount - 1) - 0.5;
        const baseX = normalized * 176 + Math.sin(time * 7.4 + i * 1.43) * 8 * motionScale;
        const baseY = -18 - Math.abs(normalized) * 22;
        const height =
          (118 + (i % 4) * 19 + Math.sin(time * 5.6 + i * 0.92) * 18 * motionScale) *
          (0.72 + intensity * 0.4);
        const width = 15 + (i % 3) * 4;
        const sway = Math.sin(time * (8.3 + i * 0.07) + i * 1.61) * (18 + i % 4 * 4) * motionScale;
        const drawTongue = (scale, fill) => {
          const tongueWidth = width * scale;
          const tongueHeight = height * scale;
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.moveTo(baseX - tongueWidth, baseY);
          ctx.bezierCurveTo(
            baseX - tongueWidth * 1.2,
            baseY - tongueHeight * 0.34,
            baseX + sway * 0.22,
            baseY - tongueHeight * 0.67,
            baseX + sway,
            baseY - tongueHeight,
          );
          ctx.bezierCurveTo(
            baseX + tongueWidth * 0.44,
            baseY - tongueHeight * 0.6,
            baseX + tongueWidth * 1.08,
            baseY - tongueHeight * 0.28,
            baseX + tongueWidth,
            baseY,
          );
          ctx.quadraticCurveTo(baseX, baseY + 13, baseX - tongueWidth, baseY);
          ctx.fill();
        };
        drawTongue(1, outerGradient);
        drawTongue(0.56, innerGradient);
      }

      ctx.lineCap = "round";
      for (let i = 0; i < 4; i += 1) {
        ctx.strokeStyle = `rgba(255, 201, 101, ${0.07 + intensity * 0.09})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-94 - i * 7, -18 - i * 32);
        ctx.bezierCurveTo(
          -22,
          -52 - i * 31 + Math.sin(time * 5 + i) * 11,
          48,
          -34 - i * 38 + Math.cos(time * 4.2 + i) * 12,
          106 + i * 5,
          -62 - i * 34,
        );
        ctx.stroke();
      }

      for (let i = 0; i < emberCount; i += 1) {
        const life = (time * (0.27 + (i % 5) * 0.027) + i * 0.137) % 1;
        const emberX = Math.sin(time * 2.8 + i * 1.91) * (48 + (i % 4) * 13);
        const emberY = -22 - life * 252;
        const alpha = (1 - life) * (0.45 + intensity * 0.4);
        ctx.fillStyle = i % 3 === 0 ? `rgba(255, 251, 202, ${alpha})` : `rgba(255, ${112 + i * 5}, 32, ${alpha})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 1.7 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(31, 12, 5, .82)";
      ctx.fillRect(-57, -304, 114, 25);
      ctx.strokeStyle = `rgba(255, 184, 58, ${0.55 + intensity * 0.38})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-57, -304, 114, 25);
      ctx.fillStyle = "#ffd266";
      ctx.font = '900 13px "Arial Black", "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`神火 ${fighter.burnTime.toFixed(1)}s`, 0, -291);
      ctx.restore();
    }

    drawDivineMarkStatus(fighter, time) {
      if (fighter.divineMarkTime <= 0 || fighter.ko) return;
      const pulse = 0.78 + Math.sin(time * 7.2) * 0.18;
      ctx.save();
      ctx.translate(fighter.x, fighter.y - 142);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.34 + pulse * 0.2;
      ctx.strokeStyle = "#ffb33e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 62 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.rotate(time * 0.9);
      ctx.strokeStyle = "#ff6b24";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -76);
        ctx.lineTo(18, -48);
        ctx.lineTo(0, -30);
        ctx.lineTo(-18, -48);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(42, 17, 6, .84)";
      ctx.fillRect(-54, -259, 108, 24);
      ctx.strokeStyle = "rgba(255, 177, 61, .88)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-54, -259, 108, 24);
      ctx.fillStyle = "#ffd16b";
      ctx.font = '900 12px "Arial Black", "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`焚印 ${fighter.divineMarkTime.toFixed(1)}s`, 0, -247);
      ctx.restore();
    }

    drawDivineShieldStatus(fighter, time) {
      if (fighter.shield <= 0 || fighter.ko) return;
      const ratio = clamp(fighter.shield / Math.max(1, fighter.shieldMax), 0, 1);
      const pulse = 1 + Math.sin(time * 4.8) * 0.025;
      ctx.save();
      ctx.translate(fighter.x, fighter.y - 128);
      ctx.globalCompositeOperation = "screen";
      const dome = ctx.createRadialGradient(0, 0, 26, 0, 0, 140);
      dome.addColorStop(0, "rgba(168, 255, 226, .015)");
      dome.addColorStop(0.68, "rgba(146, 255, 219, .08)");
      dome.addColorStop(0.92, `rgba(171, 255, 225, ${0.18 + ratio * 0.2})`);
      dome.addColorStop(1, "rgba(111, 244, 201, 0)");
      ctx.fillStyle = dome;
      ctx.beginPath();
      ctx.ellipse(0, 0, 120 * pulse, 178 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(178, 255, 229, ${0.38 + ratio * 0.48})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 111 * pulse, 169 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 239, 157, .46)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 87 + Math.sin(time * 5.3) * 4, -1.15, 1.15);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(18, 48, 41, .84)";
      ctx.fillRect(-62, -205, 124, 25);
      ctx.strokeStyle = "rgba(157, 255, 220, .86)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-62, -205, 124, 25);
      ctx.fillStyle = "#c9ffe9";
      ctx.font = '900 12px "Arial Black", "Microsoft YaHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`结界 ${Math.ceil(fighter.shield)}/${fighter.shieldMax}`, 0, -192);
      ctx.restore();
    }

    drawBurnStatus(fighter, time) {
      if (fighter.burnTime <= 0 || fighter.ko) return;
      const inferno = fighter.burnInferno || fighter.burnDamage >= 500;
      const intensity = clamp(fighter.burnTime / Math.max(0.1, fighter.burnMaxTime || 3.2), 0, 1);
      if (inferno) {
        this.drawDivineInfernoStatus(fighter, time, intensity);
        return;
      }
      ctx.save();
      ctx.translate(fighter.x, fighter.y - 112);
      const glow = ctx.createRadialGradient(0, 0, 18, 0, 0, inferno ? 168 : 132);
      glow.addColorStop(0, `rgba(255, 226, 91, ${(inferno ? 0.2 : 0.1) + intensity * 0.16})`);
      glow.addColorStop(0.66, `rgba(255, 84, 24, ${(inferno ? 0.16 : 0.08) + intensity * 0.14})`);
      glow.addColorStop(1, "rgba(255, 82, 22, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, inferno ? 168 : 132, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineCap = "round";
      for (let i = 0; i < (inferno ? 11 : 7); i += 1) {
        const side = i % 2 ? -1 : 1;
        const sway = Math.sin(time * (inferno ? 10.5 : 8) + i * 1.7) * (inferno ? 14 : 9);
        ctx.strokeStyle = i % 3 === 0 ? "#fff3ad" : i % 2 ? "#ff8b27" : "#ff4d1f";
        ctx.lineWidth = (inferno ? 4 : 3) + (i % 2);
        ctx.beginPath();
        ctx.moveTo(side * (28 + i * 8), 62);
        ctx.bezierCurveTo(
          side * (38 + i * 8) + sway,
          24,
          side * (19 + i * 7) - sway,
          -26 - i * (inferno ? 9 : 7),
          side * (34 + i * 8) + sway * 0.5,
          -76 - i * (inferno ? 6 : 4),
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    drawEnemy(fighter, time) {
      this.drawFighterShadow(fighter);
      const progress = fighter.action
        ? clamp(fighter.actionTime / Math.max(0.01, fighter.actionDuration), 0, 1)
        : 0;
      const bob = fighter.grounded && !fighter.action && !fighter.ko ? Math.sin(time * 3.7 + 1.1) * 3 : 0;
      const attackLean =
        fighter.action === "heavy"
          ? Math.sin(progress * Math.PI) * 28
          : fighter.action === "light"
            ? Math.sin(progress * Math.PI) * 15
            : 0;
      const squash = fighter.action === "heal" ? 1 + Math.sin(progress * Math.PI) * 0.045 : 1;
      const impactSquash = 1 + Math.min(0.14, fighter.hitFlash * 0.62);

      ctx.save();
      if (fighter.ko) {
        ctx.translate(fighter.x, fighter.y - 115);
        ctx.rotate(fighter.koRotation + fighter.hitTilt);
        ctx.globalAlpha = clamp(fighter.y / GROUND_Y, 0.1, 1);
      } else {
        ctx.translate(fighter.x - fighter.facing * attackLean, fighter.y + bob);
        ctx.rotate(fighter.hitTilt);
      }
      ctx.scale(squash * impactSquash, (2 - squash) / impactSquash);
      if (fighter.hitFlash > 0) ctx.filter = "brightness(1.9) saturate(.45)";

      const body = ctx.createLinearGradient(-85, -230, 70, 0);
      body.addColorStop(0, "#738653");
      body.addColorStop(0.45, "#4f5d3a");
      body.addColorStop(1, "#30382b");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-57, -212);
      ctx.bezierCurveTo(-112, -184, -113, -107, -92, -48);
      ctx.bezierCurveTo(-77, -8, -27, 0, 0, 0);
      ctx.bezierCurveTo(35, 0, 94, -20, 92, -105);
      ctx.bezierCurveTo(92, -172, 55, -222, 20, -233);
      ctx.bezierCurveTo(-8, -242, -35, -230, -57, -212);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#22291f";
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = "#c7d598";
      ctx.beginPath();
      ctx.ellipse(-3, -103, 65, 76, -0.04, 0, Math.PI * 2);
      ctx.fill();

      const chargeUltimate =
        this.ultimate?.mode === "enemyCharge" && this.ultimate.owner === fighter ? this.ultimate : null;
      let armReach =
        fighter.action === "heavy"
          ? Math.sin(progress * Math.PI) * 105
          : fighter.action === "light"
            ? Math.sin(progress * Math.PI) * 62
            : 16;
      let fistScale = 1;
      if (chargeUltimate) {
        if (chargeUltimate.damageStarted) {
          const punchProgress = clamp((chargeUltimate.time - 1.18) / 0.24, 0, 1);
          armReach = 18 + Math.sin(punchProgress * Math.PI) * 172;
          fistScale = 1 + Math.sin(punchProgress * Math.PI) * 0.38;
        } else {
          const chargeProgress = clamp(chargeUltimate.time / 1.18, 0, 1);
          armReach = -10 - chargeProgress * 18;
          fistScale = 1 + chargeProgress * 0.22;
        }
      }
      ctx.strokeStyle = "#4b573a";
      ctx.lineWidth = 25;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-66, -147);
      ctx.lineTo(-113, -116);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(71, -150);
      ctx.lineTo(106 + armReach * fighter.facing, -132 - armReach * 0.1);
      ctx.stroke();
      ctx.fillStyle = "#353d2e";
      ctx.beginPath();
      ctx.ellipse(
        106 + armReach * fighter.facing,
        -130 - armReach * 0.1,
        22 * fistScale,
        18 * fistScale,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-113, -115, 19, 16, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#d6e691";
      ctx.beginPath();
      ctx.ellipse(-26, -195, 19, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(37, -195, 19, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#171b17";
      ctx.beginPath();
      ctx.arc(-21 + fighter.facing * 4, -196, 7, 0, Math.PI * 2);
      ctx.arc(42 + fighter.facing * 4, -196, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#242b22";
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (fighter.action === "heavy") {
        ctx.arc(4, -171, 17, 0, Math.PI * 2);
      } else {
        ctx.moveTo(-17, -174);
        ctx.quadraticCurveTo(6, -161, 28, -174);
      }
      ctx.stroke();

      ctx.fillStyle = "#303729";
      ctx.beginPath();
      ctx.ellipse(-48, -2, 36, 17, -0.04, 0, Math.PI * 2);
      ctx.ellipse(48, -2, 36, 17, 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (this.ultimate?.mode === "enemyCharge" && this.ultimate.owner === fighter && !fighter.ko) {
        const charge = clamp(this.ultimate.time / 1.18, 0, 1);
        ctx.save();
        ctx.translate(fighter.x + fighter.facing * 82, fighter.y - 136);
        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 72 + charge * 42);
        glow.addColorStop(0, "rgba(255, 249, 194, .82)");
        glow.addColorStop(0.35, `rgba(239, 206, 79, ${0.2 + charge * 0.34})`);
        glow.addColorStop(1, "rgba(255, 158, 45, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 72 + charge * 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 244, 169, ${0.35 + charge * 0.55})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 34 + charge * 38, -Math.PI, Math.PI);
        ctx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const angle = time * 3 + (i * Math.PI) / 3;
          const radius = 55 + charge * 34;
          ctx.fillStyle = i % 2 ? "#fff5c3" : "#f4ca55";
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.68, 2.5 + charge * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (fighter.meter >= MAX_METER && !fighter.ko) {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(time * 4.2) * 0.12;
        ctx.strokeStyle = "#d8ed77";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(fighter.x, fighter.y - 130, 100 + Math.sin(time * 4.2) * 5, 146, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawEffects() {
      for (const effect of this.effects) {
        const alpha = clamp(effect.life / effect.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (effect.type === "spark") {
          ctx.translate(effect.x, effect.y);
          ctx.rotate(effect.rotation);
          ctx.fillStyle = effect.color;
          if (effect.shape === "square") {
            ctx.fillRect(-effect.size, -effect.size, effect.size * 2, effect.size * 2);
          } else {
            ctx.fillRect(-effect.size * 1.6, -2, effect.size * 3.2, 4);
          }
        } else if (effect.type === "ring") {
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.width || 4;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (effect.type === "word") {
          ctx.translate(effect.x, effect.y);
          ctx.rotate(effect.rotation);
          ctx.font = `900 ${effect.size}px "Microsoft YaHei UI", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 5;
          ctx.strokeStyle = "rgba(23, 23, 35, .58)";
          ctx.strokeText(effect.text, 0, 0);
          ctx.fillStyle = effect.color;
          ctx.fillText(effect.text, 0, 0);
        } else if (effect.type === "dust") {
          ctx.fillStyle = effect.color;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect.type === "confetti") {
          ctx.translate(effect.x, effect.y);
          ctx.rotate(effect.rotation);
          ctx.fillStyle = effect.color;
          ctx.fillRect(-effect.size, -effect.size * 0.42, effect.size * 2, effect.size * 0.84);
        }
        ctx.restore();
      }
    }

    drawImpacts() {
      for (const impact of this.impacts) {
        const progress = 1 - impact.life / impact.maxLife;
        const alpha = Math.pow(clamp(impact.life / impact.maxLife, 0, 1), 0.72);
        const scale = 1 + progress * (impact.heavy ? 0.95 : 0.62);
        const radius = impact.ultimate ? 215 : impact.heavy ? 178 : 112;
        const points = impact.heavy ? 20 : 14;

        ctx.save();
        ctx.translate(impact.x, impact.y);
        ctx.rotate(impact.seed + progress * 0.08 + impact.direction * 0.045);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
        glow.addColorStop(0, "rgba(255, 255, 231, .98)");
        glow.addColorStop(0.18, "rgba(255, 239, 151, .72)");
        glow.addColorStop(0.52, "rgba(255, 183, 65, .24)");
        glow.addColorStop(1, "rgba(255, 140, 61, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = impact.heavy ? "rgba(255, 243, 178, .86)" : "rgba(255, 251, 220, .72)";
        ctx.beginPath();
        for (let i = 0; i < points * 2; i += 1) {
          const angle = (i / (points * 2)) * Math.PI * 2;
          const wobble = 0.68 + ((Math.sin(i * 13.7 + impact.seed) + 1) / 2) * 0.42;
          const length = radius * (i % 2 === 0 ? wobble : 0.37);
          const x = Math.cos(angle) * length;
          const y = Math.sin(angle) * length * 0.62;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, .92)";
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.22, radius * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = impact.heavy ? "rgba(255, 231, 113, .96)" : "rgba(255, 249, 212, .82)";
        ctx.lineWidth = impact.heavy ? 8 : 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-radius * 1.14, 0);
        ctx.lineTo(radius * 1.14, 0);
        ctx.moveTo(-radius * 0.54, -radius * 0.17);
        ctx.lineTo(radius * 0.62, -radius * 0.08);
        ctx.stroke();

        ctx.fillStyle = "rgba(23, 23, 35, .86)";
        ctx.font = `900 ${impact.heavy ? 25 : 19}px "Microsoft YaHei UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(impact.ultimate ? "轰！" : impact.heavy ? "砰！" : "啪！", 0, 0);
        ctx.restore();
      }
    }

    drawDamageFloats() {
      for (const float of this.damageFloats) {
        const alpha = clamp(float.life / float.maxLife, 0, 1);
        const progress = 1 - alpha;
        const pop = progress < 0.16 ? lerp(1.72, 1, progress / 0.16) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(float.x, float.y);
        ctx.scale(pop, pop);
        ctx.rotate(Math.sin(float.life * 16) * 0.025);
        ctx.font = `900 ${float.size}px "Impact", "Microsoft YaHei UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(23, 23, 35, .52)";
        ctx.strokeText(float.text, 0, 0);
        ctx.fillStyle = float.color;
        ctx.fillText(float.text, 0, 0);
        ctx.restore();
      }
    }

    draw(time) {
      if (this.divineTransitionActive) return;
      if (this.phase === "menu" && this.menuFrameDrawn) return;
      if (this.ultimate?.mode === "image" && !ui.holyUltimate.hidden) {
        return;
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.save();
      const reducedMotion = this.reducedMotion;
      const shakeAmount = reducedMotion ? 0 : this.shake;
      const cameraZoom = reducedMotion ? 1 : 1 + this.cameraKick;
      const cameraRoll = reducedMotion ? 0 : this.cameraRoll;
      if (shakeAmount > 0) {
        ctx.translate(
          random(-shakeAmount, shakeAmount),
          random(-shakeAmount * 0.46, shakeAmount * 0.46),
        );
      }
      this.drawBackground(time);

      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT * 0.72);
      ctx.rotate(cameraRoll);
      ctx.scale(cameraZoom, cameraZoom);
      ctx.translate(-this.cameraFocus, -HEIGHT * 0.72);

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#fff";
      ctx.font = '900 140px "Impact", sans-serif';
      ctx.letterSpacing = "8px";
      ctx.fillText("MILK DISTRICT", 58, 505);
      ctx.restore();

      const drawOrder = [this.player, this.enemy].sort((a, b) => a.y - b.y);
      for (const fighter of drawOrder) {
        if (fighter.isPlayer || this.onlineMode) {
          this.drawPlayer(fighter, time, this.getFighterCharacter(fighter));
        }
        else this.drawEnemy(fighter, time);
        this.drawBurnStatus(fighter, time);
        this.drawDivineShieldStatus(fighter, time);
        this.drawDivineMarkStatus(fighter, time);
      }
      this.drawProjectiles(time);
      this.drawImpacts();
      this.drawEffects();
      this.drawDamageFloats();
      ctx.restore();
      ctx.restore();

      if (this.flash > 0) {
        ctx.save();
        ctx.globalAlpha = clamp(this.flash, 0, 0.52);
        ctx.fillStyle = "#fff9dc";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
      }

      if (this.phase === "menu") {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#11101a";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
      }

      if (this.paused) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();
      }

      if (this.phase === "menu") this.menuFrameDrawn = true;
    }
  }

  function boot() {
    const fallback = createFallbackNaiwa();
    const miniFallback = createFallbackMini();
    for (const key of Object.keys(assetSources)) {
      images[key] = key.startsWith("mini") ? miniFallback : fallback;
    }
    images.divineAura = null;
    ui.startButton.disabled = false;
    ui.onlineButton.disabled = false;
    ui.startButtonLabel.textContent = "一口奶气，正式开打";
    new NaiwaGame();

    const entries = Object.entries(assetSources).filter(([key]) => key !== "divineAura");
    void Promise.allSettled(
      entries.map(async ([key, source]) => [key, await loadImage(source)]),
    ).then((loaded) => {
      loaded.forEach((result) => {
        if (result.status === "fulfilled") {
          const [key, image] = result.value;
          images[key] = image;
        }
      });
    });
    const preloadDivineAura = () => {
      const game = window.__NAIWA_GAME__;
      if (game) void game.ensureDivineAura().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preloadDivineAura, { timeout: 4500 });
    } else {
      window.setTimeout(preloadDivineAura, 2800);
    }
  }

  boot();
})();
