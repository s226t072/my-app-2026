// 状態の初期化
const initialState = {
    hunger: 50,
    happiness: 50,
    energy: 100,
    logs: []
};

let state = JSON.parse(localStorage.getItem('dogAppState')) || initialState;

// DOM要素
const hungerBar = document.getElementById('hunger-bar');
const happinessBar = document.getElementById('happiness-bar');
const energyBar = document.getElementById('energy-bar');
const dogEmoji = document.getElementById('dog');
const messageBubble = document.getElementById('message');
const logList = document.getElementById('log-list');

// UIの更新
function updateUI() {
    hungerBar.style.width = `${state.hunger}%`;
    happinessBar.style.width = `${state.happiness}%`;
    energyBar.style.width = `${state.energy}%`;

    // バーの色を変える
    updateBarColor(hungerBar, state.hunger);
    updateBarColor(happinessBar, state.happiness);
    updateBarColor(energyBar, state.energy);

    // ログの更新
    logList.innerHTML = '';
    state.logs.slice().reverse().forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });

    // メッセージの更新
    if (state.hunger < 20) {
        messageBubble.textContent = "おなかがすいたよ...";
        dogEmoji.textContent = "😢";
    } else if (state.happiness < 20) {
        messageBubble.textContent = "つまんないなぁ...";
        dogEmoji.textContent = "😞";
    } else if (state.energy < 20) {
        messageBubble.textContent = "ねむいよ...";
        dogEmoji.textContent = "😴";
    } else {
        messageBubble.textContent = "わんわん！元気だよ！";
        dogEmoji.textContent = "🐶";
    }
}

function updateBarColor(bar, value) {
    if (value < 20) {
        bar.style.backgroundColor = '#f44336'; // 赤
    } else if (value < 50) {
        bar.style.backgroundColor = '#ff9800'; // オレンジ
    } else {
        bar.style.backgroundColor = '#4caf50'; // 緑
    }
}

// 状態の保存
function saveState() {
    localStorage.setItem('dogAppState', JSON.stringify(state));
}

// ログの追加
function addLog(text) {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.logs.push(`[${timeStr}] ${text}`);
    if (state.logs.length > 20) state.logs.shift();
    saveState();
    updateUI();
}

// アクション
function feed() {
    if (state.hunger >= 100) {
        messageBubble.textContent = "もうおなかいっぱい！";
        return;
    }
    state.hunger = Math.min(100, state.hunger + 20);
    addLog("ごはんを食べた！");
    animateDog('bounce');
}

function play() {
    if (state.energy < 20) {
        messageBubble.textContent = "つかれてあそべないよ...";
        return;
    }
    state.happiness = Math.min(100, state.happiness + 25);
    state.energy = Math.max(0, state.energy - 20);
    addLog("いっしょに遊んだ！");
    animateDog('bounce');
}

function sleep() {
    state.energy = 100;
    state.hunger = Math.max(0, state.hunger - 10);
    addLog("ぐっすり眠った。");
    animateDog('sleep-anim');
}

function animateDog(className) {
    dogEmoji.classList.add('bounce');
    setTimeout(() => {
        dogEmoji.classList.remove('bounce');
    }, 1000);
}

// 自動的にステータスが減る
setInterval(() => {
    state.hunger = Math.max(0, state.hunger - 2);
    state.happiness = Math.max(0, state.happiness - 1);
    state.energy = Math.max(0, state.energy - 1);
    saveState();
    updateUI();
}, 10000); // 10秒ごとに少しずつ減る

// イベントリスナー
document.getElementById('feed-btn').addEventListener('click', feed);
document.getElementById('play-btn').addEventListener('click', play);
document.getElementById('sleep-btn').addEventListener('click', sleep);
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('最初からやりなおしますか？')) {
        state = { ...initialState, logs: [] };
        saveState();
        updateUI();
    }
});

// 初期実行
updateUI();
