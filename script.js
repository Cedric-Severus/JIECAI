const q = (selector, scope = document) => scope.querySelector(selector);
const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const toast = (message) => {
  const el = q("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
};

q("#year").textContent = new Date().getFullYear();

const bgm = q("#bgm");
bgm.volume = 0.72;
let musicOn = false;

function playCurseAnimation(turningOn) {
  const effect = q("#curseFx");
  q(".curse-domain span", effect).textContent = turningOn ? "CURSED ENERGY / SOUND ON" : "CURSED ENERGY / SOUND OFF";
  effect.classList.remove("active");
  document.body.classList.remove("burst");
  void document.body.offsetWidth;
  effect.classList.add("active");
  document.body.classList.add("burst");
  setTimeout(() => effect.classList.remove("active"), 1500);
  setTimeout(() => document.body.classList.remove("burst"), 950);
}

q("#energy").addEventListener("click", async () => {
  const shouldPlay = !musicOn;
  if (shouldPlay) {
    try {
      await bgm.play();
      musicOn = true;
    } catch (error) {
      musicOn = false;
      toast("音乐启动失败，请检查浏览器或系统音量");
      console.error("BGM playback failed", error);
    }
  } else {
    bgm.pause();
    musicOn = false;
  }
  const button = q("#energy");
  button.setAttribute("aria-pressed", String(musicOn));
  q("span", button).textContent = musicOn ? "收束咒力 · BGM ON" : "释放咒力 · BGM OFF";
  playCurseAnimation(musicOn);
  if (musicOn || !shouldPlay) toast(musicOn ? "咒力展开 · BGM 已开启" : "咒力收束 · BGM 已关闭");
});

bgm.addEventListener("error", () => {
  musicOn = false;
  q("#energy").setAttribute("aria-pressed", "false");
  q("#energy span").textContent = "释放咒力 · BGM OFF";
  toast("BGM 文件加载失败");
});

const themes = {
  ring: ["RING · BOND", "戒指 / 羁绊", "“真正的约定，不会因为时间过去就消失。”", 0, "images/yuta-ring.png", "银色戒指与羁绊主题原创海报插画"],
  sword: ["KATANA · RESOLVE", "武士刀 / 决意", "“拔刀不是为了证明强大，而是为了守住不能失去的人。”", 1, "images/yuta-sword.png", "武士刀与决意主题原创海报插画"],
  copy: ["COPY · LEARNING", "术式复制 / 学习", "“学习不是模仿的终点，而是找到自己的开始。”", 2, "images/yuta-copy.png", "戒指、刀与术式回响主题原创抽象插画"]
};

const quotes = [
  ["“ 这是纯爱。”", "— 戒指 / 羁绊"],
  ["“ 如果力量有意义，那就是为了守护重要的人。”", "— 武士刀 / 决意 · 角色精神意译"],
  ["“ 害怕也没关系，仍然选择向前就够了。”", "— 术式复制 / 学习 · 角色精神意译"]
];

let quoteIndex = 0;
function showQuote() {
  q("#quoteText").textContent = quotes[quoteIndex][0];
  q("#quoteNote").textContent = quotes[quoteIndex][1];
  q("#quoteNum").textContent = `0${quoteIndex + 1} / 03`;
}
function moveQuote(direction) {
  quoteIndex = (quoteIndex + direction + quotes.length) % quotes.length;
  showQuote();
}

qa(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    qa(".tabs button").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    const theme = themes[button.dataset.key];
    const image = q("#themeImage");
    image.classList.add("switching");
    setTimeout(() => {
      q("#themeLabel").textContent = theme[0];
      q("#themeTitle").textContent = theme[1];
      q("#themeCopy").textContent = theme[2];
      image.src = theme[4];
      image.alt = theme[5];
      image.classList.remove("switching");
    }, 140);
    quoteIndex = theme[3];
    showQuote();
  });
});
q("#prev").addEventListener("click", () => moveQuote(-1));
q("#next").addEventListener("click", () => moveQuote(1));

q("#text").addEventListener("input", (event) => {
  const value = event.target.value;
  q("#chars").textContent = value.length;
  q("#words").textContent = value.trim() ? value.trim().split(/\s+|(?=[\u4e00-\u9fff])/).filter(Boolean).length : 0;
  q("#lines").textContent = value.split("\n").length;
});

const focusSeconds = 1500;
let seconds = focusSeconds;
let timerId;
let endTime;
function drawTimer() {
  q("#timer").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  q("#timerRing").style.setProperty("--progress", `${(1 - seconds / focusSeconds) * 360}deg`);
  document.title = timerId ? `${q("#timer").textContent} · 专注中` : "芥菜 · 个人空间";
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}
q("#start").addEventListener("click", () => {
  if (timerId) {
    stopTimer();
    q("#start").textContent = "继续";
    q("#timerState").textContent = "结界暂停";
    drawTimer();
    return;
  }
  endTime = Date.now() + seconds * 1000;
  q("#start").textContent = "暂停";
  q("#timerState").textContent = "专注中 · 勿扰";
  timerId = setInterval(() => {
    seconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    drawTimer();
    if (seconds === 0) {
      stopTimer();
      q("#start").textContent = "再来一次";
      q("#timerState").textContent = "训练完成";
      toast("25 分钟专注完成！");
    }
  }, 250);
  drawTimer();
});
q("#reset").addEventListener("click", () => {
  stopTimer();
  seconds = focusSeconds;
  q("#start").textContent = "开始";
  q("#timerState").textContent = "准备专注";
  drawTimer();
});

let todos = [];
try { todos = JSON.parse(localStorage.getItem("jiecaiTodos") || "[]"); } catch { todos = []; }
function saveTodos() {
  localStorage.setItem("jiecaiTodos", JSON.stringify(todos));
  renderTodos();
}
function renderTodos() {
  q("#todoList").innerHTML = "";
  todos.forEach((todo, index) => {
    const item = document.createElement("li");
    item.className = todo.done ? "done" : "";
    item.innerHTML = `<button type="button" aria-label="${todo.done ? "标记为未完成" : "标记为已完成"}">${todo.done ? "●" : "○"}</button><span></span><button type="button" aria-label="删除任务">×</button>`;
    item.children[1].textContent = todo.text;
    item.children[0].addEventListener("click", () => { todos[index].done = !todos[index].done; saveTodos(); });
    item.children[2].addEventListener("click", () => { todos.splice(index, 1); saveTodos(); });
    q("#todoList").append(item);
  });
  const remaining = todos.filter((todo) => !todo.done).length;
  q("#todoSum").textContent = todos.length ? `${remaining} 项待完成 · 共 ${todos.length} 项` : "还没有任务，写下第一件吧";
}
q("#todoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = q("#todoInput");
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  input.value = "";
  saveTodos();
  toast("任务已加入清单");
});
renderTodos();

const messageKey = "jiecaiModeratedMessages";
const supabaseConfig = window.JIECAI_SUPABASE || {};
const onlineMessages = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
let messages = [];
if (!onlineMessages) {
  try { messages = JSON.parse(localStorage.getItem(messageKey) || "[]"); } catch { messages = []; }
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: supabaseConfig.anonKey,
    Authorization: `Bearer ${supabaseConfig.anonKey}`,
    ...extra
  };
}

function saveMessages() {
  localStorage.setItem(messageKey, JSON.stringify(messages));
  renderLocalMessages();
}

function formatMessageDate(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(timestamp));
}

function renderPublicMessages(approved) {
  const publicList = q("#messageList");
  publicList.innerHTML = "";
  approved.forEach((message) => {
    const card = document.createElement("article");
    card.className = "message-card";
    card.innerHTML = "<p></p><footer><strong></strong><span></span></footer>";
    q("p", card).textContent = `“${message.content || message.text}”`;
    q("strong", card).textContent = message.name;
    q("span", card).textContent = formatMessageDate(message.created_at || message.createdAt);
    publicList.append(card);
  });
  q("#messageEmpty").hidden = approved.length > 0;
}

function renderLocalMessages() {
  const approved = messages.filter((message) => message.status === "approved").slice().reverse();
  const pending = messages.filter((message) => message.status === "pending");
  const pendingList = q("#pendingList");
  pendingList.innerHTML = "";
  renderPublicMessages(approved);

  pending.forEach((message) => {
    const item = document.createElement("article");
    item.className = "pending-item";
    item.innerHTML = "<div><strong></strong><small></small></div><p></p><div class=\"pending-actions\"><button type=\"button\">批准展示</button><button type=\"button\">删除</button></div>";
    q("strong", item).textContent = message.name;
    q("small", item).textContent = formatMessageDate(message.createdAt);
    q("p", item).textContent = message.text;
    const buttons = qa("button", item);
    buttons[0].addEventListener("click", () => {
      message.status = "approved";
      saveMessages();
      toast("留言已批准并公开展示");
    });
    buttons[1].addEventListener("click", () => {
      messages = messages.filter((entry) => entry.id !== message.id);
      saveMessages();
      toast("留言已删除");
    });
    pendingList.append(item);
  });
  q("#pendingBadge").textContent = `${pending.length} 条待审核`;
  if (!pending.length) pendingList.innerHTML = '<p class="pending-empty">目前没有待审核留言。</p>';
}

async function loadOnlineMessages() {
  const connection = q("#messageConnection");
  connection.innerHTML = "<i></i> CONNECTING";
  try {
    const endpoint = `${supabaseConfig.url.replace(/\/$/, "")}/rest/v1/messages?select=id,name,content,created_at&status=eq.approved&order=created_at.desc&limit=60`;
    const response = await fetch(endpoint, { headers: supabaseHeaders() });
    if (!response.ok) throw new Error(`Message fetch failed: ${response.status}`);
    renderPublicMessages(await response.json());
    connection.innerHTML = "<i></i> ONLINE WALL";
  } catch (error) {
    connection.textContent = "CONNECTION ERROR";
    q("#messageEmpty").hidden = false;
    q("#messageEmpty").textContent = "留言墙暂时无法连接，请稍后再试。";
    console.error(error);
  }
}

q("#messageText").addEventListener("input", (event) => {
  q("#messageCount").textContent = event.target.value.length;
});

q("#messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = q("#messageName").value.trim();
  const text = q("#messageText").value.trim();
  if (!name || !text) return;
  const submitButton = q("button[type='submit']", event.target);
  submitButton.disabled = true;
  submitButton.textContent = "正在送达……";
  try {
    if (onlineMessages) {
      const endpoint = `${supabaseConfig.url.replace(/\/$/, "")}/rest/v1/messages`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
        body: JSON.stringify({ name, content: text, status: "pending" })
      });
      if (!response.ok) throw new Error(`Message submit failed: ${response.status}`);
    } else {
      messages.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, text, status: "pending", createdAt: Date.now() });
      saveMessages();
    }
    event.target.reset();
    q("#messageCount").textContent = "0";
    toast("留言已送达，等待站长审核");
  } catch (error) {
    toast("留言暂时未能送达，请稍后重试");
    console.error(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "送入待审核区 ↗";
  }
});

if (onlineMessages) {
  q(".moderation").hidden = true;
  loadOnlineMessages();
} else {
  q("#messageConnection").innerHTML = "<i></i> LOCAL DEMO";
  q("#moderationMode").textContent = "当前为本机演示模式";
  renderLocalMessages();
}

const navLinks = qa("nav a");
const sections = navLinks.map((link) => q(link.getAttribute("href"))).filter(Boolean);
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-25% 0px -65%", threshold: 0 });
sections.forEach((section) => observer.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
qa(".reveal").forEach((section) => revealObserver.observe(section));

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const ratio = scrollable > 0 ? scrollY / scrollable : 0;
  q(".reading-progress i").style.transform = `scaleX(${ratio})`;
  q(".site-header").classList.toggle("scrolled", scrollY > 20);
}
addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();
drawTimer();
