// 状態の初期化
const initialState = {
    dogName: "",
    hunger: 50,
    happiness: 50,
    energy: 100,
    coins: 0,
    inventory: [],
    equipped: null,
    logs: []
};

// ローカルストレージから読み込み
let state = JSON.parse(localStorage.getItem('dogAppStateFinal')) || initialState;

// アイテムデータ
const items = {
    premium_food: { name: "高級な肉", icon: "🍖", effect: "hunger", value: 40 },
    treat: { name: "おやつ", icon: "🍰", effect: "happiness", value: 30 },
    ribbon: { name: "リボン", icon: "🎀", type: "accessory" },
    hat: { name: "ぼうし", icon: "🎩", type: "accessory" }
};

// DOM要素
const hungerBar = document.getElementById('hunger-bar');
const happinessBar = document.getElementById('happiness-bar');
const energyBar = document.getElementById('energy-bar');
const coinCount = document.getElementById('coin-count');
const dogEmoji = document.getElementById('dog');
const accessorySlot = document.getElementById('accessory-slot');
const messageBubble = document.getElementById('message');
const logList = document.getElementById('log-list');
const shopView = document.getElementById('shop-view');
const inventoryList = document.getElementById('inventory-list');
const displayDogName = document.getElementById('display-dog-name');
const namingOverlay = document.getElementById('naming-overlay');
const dogNameInput = document.getElementById('dog-name-input');

// UIの更新
function updateUI() {
    hungerBar.style.width = `${state.hunger}%`;
    happinessBar.style.width = `${state.happiness}%`;
    energyBar.style.width = `${state.energy}%`;
    coinCount.textContent = state.coins;
    displayDogName.textContent = state.dogName || "わんこ";

    // アクセサリーの表示
    if (state.equipped) {
        accessorySlot.textContent = items[state.equipped].icon;
    } else {
        accessorySlot.textContent = "";
    }

    // ログの更新
    logList.innerHTML = '';
    state.logs.slice().reverse().forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });

    // メッセージの更新
    if (state.hunger < 20) {
        messageBubble.textContent = "おなかすいたワン...";
        dogEmoji.textContent = "🥺";
    } else if (state.happiness < 20) {
        messageBubble.textContent = "あそんでほしいな...";
        dogEmoji.textContent = "💧";
    } else if (state.energy < 20) {
        messageBubble.textContent = "むにゃむにゃ...";
        dogEmoji.textContent = "💤";
    } else {
        messageBubble.textContent = "きょうもたのしいね！";
        dogEmoji.textContent = "🐶";
    }

    updateInventory();
}

function updateInventory() {
    inventoryList.innerHTML = '';
    state.inventory.forEach(itemId => {
        const item = items[itemId];
        if (item.type === "accessory") {
            const slot = document.createElement('div');
            slot.className = `inv-slot ${state.equipped === itemId ? 'active' : ''}`;
            slot.textContent = item.icon;
            slot.onclick = () => toggleAccessory(itemId);
            inventoryList.appendChild(slot);
        }
    });
}

// 状態の保存
function saveState() {
    localStorage.setItem('dogAppStateFinal', JSON.stringify(state));
}

// ログの追加
function addLog(text) {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.logs.push(`[${timeStr}] ${text}`);
    if (state.logs.length > 20) state.logs.shift(); // ログを多めに保存
    saveState();
    updateUI();
}

// アクション
function feed() {
    if (state.hunger >= 100) {
        messageBubble.textContent = "おなかいっぱいだワン！";
        return;
    }
    state.hunger = Math.min(100, state.hunger + 15);
    addLog(`${state.dogName}は ごはんを たべた！`);
    animateDog();
}

function play() {
    if (state.energy < 15) {
        messageBubble.textContent = "つかれちゃった...";
        return;
    }
    state.happiness = Math.min(100, state.happiness + 20);
    state.energy = Math.max(0, state.energy - 15);
    
    // コインをゲット
    const reward = 10 + Math.floor(Math.random() * 6);
    state.coins += reward;
    
    addLog(`${state.dogName}と あそんで ${reward}コイン ゲット！`);
    animateDog();
}

function sleep() {
    state.energy = 100;
    state.hunger = Math.max(0, state.hunger - 10);
    addLog(`${state.dogName}は ぐっすり ねむった。`);
    dogEmoji.textContent = "💤";
    setTimeout(updateUI, 2000);
}

function animateDog() {
    dogEmoji.classList.remove('bounce');
    void dogEmoji.offsetWidth; // リフロー
    dogEmoji.classList.add('bounce');
}

// ショップ機能
function buyItem(itemId, price) {
    if (state.coins < price) {
        alert("コインがたりないよ！");
        return;
    }
    
    const item = items[itemId];
    state.coins -= price;

    if (item.type === "accessory") {
        if (!state.inventory.includes(itemId)) {
            state.inventory.push(itemId);
            addLog(`${item.name}を かったよ！`);
        } else {
            alert("もうもってるよ！");
            state.coins += price; // 返金
        }
    } else {
        // 即時使用アイテム
        if (item.effect === "hunger") state.hunger = Math.min(100, state.hunger + item.value);
        if (item.effect === "happiness") state.happiness = Math.min(100, state.happiness + item.value);
        addLog(`${item.name}を つかった！`);
    }
    
    saveState();
    updateUI();
}

function toggleAccessory(itemId) {
    if (state.equipped === itemId) {
        state.equipped = null;
    } else {
        state.equipped = itemId;
    }
    saveState();
    updateUI();
}

// 名前設定
function setDogName() {
    const name = dogNameInput.value.trim();
    if (!name) {
        alert("なまえをいれてね！");
        return;
    }
    state.dogName = name;
    namingOverlay.classList.add('hidden');
    addLog(`${state.dogName}との せいかつが はじまった！`);
    saveState();
    updateUI();
}

// 初期化チェック
function init() {
    if (!state.dogName) {
        namingOverlay.classList.remove('hidden');
    } else {
        namingOverlay.classList.add('hidden');
    }
    updateUI();
}

// 自動減少
setInterval(() => {
    if (!state.dogName) return; // 名前が決まるまでは減らない
    state.hunger = Math.max(0, state.hunger - 1);
    state.happiness = Math.max(0, state.happiness - 1);
    state.energy = Math.max(0, state.energy - 1);
    saveState();
    updateUI();
}, 20000);

// イベントリスナー
document.getElementById('feed-btn').addEventListener('click', feed);
document.getElementById('play-btn').addEventListener('click', play);
document.getElementById('sleep-btn').addEventListener('click', sleep);
document.getElementById('shop-tab-btn').addEventListener('click', () => shopView.classList.remove('hidden'));
document.getElementById('close-shop-btn').addEventListener('click', () => shopView.classList.add('hidden'));
document.getElementById('start-game-btn').addEventListener('click', setDogName);

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.getAttribute('data-item');
        const price = parseInt(btn.getAttribute('data-price'));
        buyItem(item, price);
    });
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('ぜんぶリセットして最初からやりなおす？')) {
        localStorage.removeItem('dogAppStateFinal');
        state = { ...initialState, inventory: [], logs: [] };
        saveState();
        location.reload();
    }
});

// 開始
init();
