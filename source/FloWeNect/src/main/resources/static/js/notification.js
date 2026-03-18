/* global axios */

(function() {
  "use strict";

  const bellBtn = document.getElementById("notiBellBtn");
  const dotEl = document.getElementById("notiUnreadDot");
  const popover = document.getElementById("notiPopover");
  const summaryList = document.getElementById("notiSummaryList");
  const closeBtn = document.getElementById("notiCloseBtn");
  const moreBtn = document.getElementById("notiMoreBtn");
  const readAllBtn = document.getElementById("notiReadAllBtn");

  const modal = document.getElementById("notiModal");
  const modalList = document.getElementById("notiModalList");
  const modalBody = modal.querySelector(".bt-modal__body");

  const toastStack = document.getElementById("notiToastStack");

  if (!bellBtn || !dotEl || !popover || !summaryList || !modal || !toastStack) return;

  const empNo = (window.LOGIN_USER && window.LOGIN_USER.empNo) || document.body?.dataset?.empNo || null;

  let stompClient = null;
  let modalPage = 1;
  const modalSize = 20;
  let modalTotal = 0;
  let modalLoading = false;
  let modalHasMore = true;

  // ---------- helpers ----------
  function openPopover() {
    popover.classList.add("open");
    popover.setAttribute("aria-hidden", "false");
  }

  function closePopover() {
    popover.classList.remove("open");
    popover.setAttribute("aria-hidden", "true");
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function esc(s) {
    return (s ?? "").toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTime(isoOrDate) {
    if (!isoOrDate) return "";
    // 서버는 LocalDateTime(JSON) 또는 Date(string) 형태일 수 있음
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }

  // ---------- toast queue (max 3 visible) ----------
  const toastQueue = [];
  let toastVisible = 0;
  const TOAST_MAX_VISIBLE = 3;
  const TOAST_DURATION = 1200;

  function buildToastEl(message, meta) {
    const el = document.createElement("div");
    el.className = "noti-toast";
    el.innerHTML = `
      <div class="noti-toast__title"><i class="fas fa-bell"></i> 신규 알림</div>
      <div class="noti-toast__msg"></div>
      <div class="noti-toast__meta"></div>
    `;
    const msgEl = el.querySelector(".noti-toast__msg");
    const metaEl = el.querySelector(".noti-toast__meta");
    if (msgEl) msgEl.textContent = message || "신규 알림이 발생했습니다.";
    if (metaEl) metaEl.textContent = meta || "";
    return el;
  }

  function pumpToastQueue() {
    while (toastVisible < TOAST_MAX_VISIBLE && toastQueue.length > 0) {
      const { message, meta } = toastQueue.shift();
      const el = buildToastEl(message, meta);
      toastStack.appendChild(el);
      // next tick for transition
      requestAnimationFrame(() => el.classList.add("show"));
      toastVisible += 1;

      window.setTimeout(() => {
        el.classList.remove("show");
        // transition 끝나고 제거
        window.setTimeout(() => {
          try { el.remove(); } catch (e) {}
          toastVisible = Math.max(0, toastVisible - 1);
          pumpToastQueue();
        }, 220);
      }, TOAST_DURATION);
    }
  }

  function showToast(message, meta) {
    toastQueue.push({ message, meta });
    pumpToastQueue();
  }

  async function refreshUnreadCount() {
    try {
      const { data } = await axios.get("/rest/notifications/unread-count", { params: { months: 3 } });
      const cnt = Number(data?.unreadCount ?? 0);
      dotEl.style.display = cnt > 0 ? "inline-block" : "none";
    } catch (e) {
      // 조용히
    }
  }

  function renderSummary(list) {
    if (!Array.isArray(list) || list.length === 0) {
      summaryList.innerHTML = `
        <div class="noti-item">
          <div class="noti-item__cn">최근 7일간 알림이 없습니다.</div>
        </div>
      `;
      return;
    }

    summaryList.innerHTML = list.map(n => {
      const unread = (n.readYn || "N") === "N";
      const cn = esc(n.notiCn);
      const t = esc(formatTime(n.regDtm));
      return `
        <div class="noti-item ${unread ? "is-unread" : ""}" data-id="${n.notiNo}" data-url="${esc(n.moveUrl || "")}">
          <div class="noti-item__cn">${cn}</div>
          <div class="noti-item__meta">${t}</div>
        </div>
      `;
    }).join("");

    summaryList.querySelectorAll(".noti-item[data-id]").forEach(el => {
      el.addEventListener("click", async () => {
        const id = el.getAttribute("data-id");
        const url = el.getAttribute("data-url") || "";
        try {
          await axios.post(`/rest/notifications/${id}/read`);
        } catch (e) {}
        await refreshUnreadCount();
        closePopover();
        if (url) window.location.href = url;
      });
    });
  }

  async function loadSummary() {
    summaryList.innerHTML = `
      <div class="noti-item"><div class="noti-item__cn">알림을 불러오는 중...</div></div>
    `;
    try {
      const { data } = await axios.get("/rest/notifications/summary", { params: { days: 7, limit: 10 } });
      renderSummary(data);
    } catch (e) {
      summaryList.innerHTML = `
        <div class="noti-item"><div class="noti-item__cn">알림을 불러오지 못했습니다.</div></div>
      `;
    }
  }

  function createModalItemHtml(n) {
    const unread = (n.readYn || "N") === "N";
    return `
      <div class="noti-modal-item ${unread ? "is-unread" : ""}" data-id="${n.notiNo}" data-url="${esc(n.moveUrl || "")}">
        <div class="noti-modal-item__cn">${esc(n.notiCn)}</div>
        <div class="noti-modal-item__meta">${esc(formatTime(n.regDtm))}</div>
      </div>
    `;
  }

  function bindModalItemEvents(scopeEl) {
    scopeEl.querySelectorAll(".noti-modal-item[data-id]").forEach(el => {
      if (el.dataset.bound === "Y") return;
      el.dataset.bound = "Y";
      el.addEventListener("click", async () => {
        const id = el.getAttribute("data-id");
        const url = el.getAttribute("data-url") || "";
        try {
          await axios.post(`/rest/notifications/${id}/read`);
          el.classList.remove("is-unread");
        } catch (e) {}
        await refreshUnreadCount();
        closeModal();
        if (url) window.location.href = url;
      });
    });
  }

  function upsertModalStatus(message, className = "") {
    let statusEl = modalList.querySelector(".noti-modal-status");
    if (!statusEl) {
      statusEl = document.createElement("div");
      statusEl.className = "noti-modal-status";
      modalList.appendChild(statusEl);
    }
    statusEl.className = `noti-modal-status ${className}`.trim();
    statusEl.textContent = message;
    return statusEl;
  }

  function clearModalStatus() {
    modalList.querySelector(".noti-modal-status")?.remove();
  }

  async function loadModalPage({ reset = false } = {}) {
    if (modalLoading) return;

    if (reset) {
      modalPage = 1;
      modalTotal = 0;
      modalHasMore = true;
      modalList.innerHTML = "";
      upsertModalStatus("불러오는 중...", "is-loading");
      if (modalBody) modalBody.scrollTop = 0;
    }

    if (!modalHasMore) return;

    modalLoading = true;
    if (!reset) {
      upsertModalStatus("불러오는 중...", "is-loading");
    }

    try {
      const { data } = await axios.get("/rest/notifications/page", {
        params: { months: 3, page: modalPage, size: modalSize }
      });

      const list = Array.isArray(data?.list) ? data.list : [];
      modalTotal = Number(data?.totalCount ?? 0);

      if (reset && list.length === 0) {
        modalHasMore = false;
        upsertModalStatus("알림 내역이 없습니다.");
        return;
      }

      clearModalStatus();

      if (list.length > 0) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = list.map(createModalItemHtml).join("");
        while (wrapper.firstElementChild) {
          modalList.appendChild(wrapper.firstElementChild);
        }
        bindModalItemEvents(modalList);
      }

      const loadedCount = modalList.querySelectorAll(".noti-modal-item").length;
      modalHasMore = list.length === modalSize && loadedCount < modalTotal;

      if (modalHasMore) {
        upsertModalStatus("스크롤하면 더 불러옵니다.");
        modalPage += 1;
      } else if (loadedCount > 0) {
        upsertModalStatus("마지막 알림입니다.");
      }
    } catch (e) {
      if (reset && modalList.querySelectorAll(".noti-modal-item").length === 0) {
        modalList.innerHTML = `<div class="noti-muted">알림 내역을 불러오지 못했습니다.</div>`;
      } else {
        upsertModalStatus("알림 내역을 더 불러오지 못했습니다.");
      }
    } finally {
      modalLoading = false;

      if (
        modal.classList.contains("is-open") &&
        modalHasMore &&
        modalBody &&
        modalBody.scrollHeight <= modalBody.clientHeight + 40
      ) {
        await loadModalPage();
      }
    }
  }

  async function markAllRead() {
    try {
      await axios.post("/rest/notifications/read-all");
    } catch (e) {}
    await refreshUnreadCount();
    if (popover.classList.contains("open")) {
      await loadSummary();
    }
    if (modal.classList.contains("is-open")) {
      await loadModalPage({ reset: true });
    }
  }

  // ---------- WebSocket ----------
  function initWebSocket() {
    const StompJSObject = window.StompJs || (typeof StompJs !== "undefined" ? StompJs : null);
    if (!StompJSObject) {
      console.warn("StompJs not loaded");
      return;
    }

    stompClient = new StompJSObject.Client({
      brokerURL: `ws://${window.location.host}/ws`,
      reconnectDelay: 2000,
      onConnect: () => {
        stompClient.subscribe("/user/queue/notifications", async (msg) => {
          try {
            const n = JSON.parse(msg.body);
            showToast(n?.notiCn || "신규 알림이 발생했습니다.", formatTime(n?.regDtm));
            await refreshUnreadCount();
            // 요약 드롭다운 열려 있으면 즉시 갱신
            if (popover.classList.contains("open")) {
              await loadSummary();
            }
          } catch (e) {
            showToast("신규 알림이 발생했습니다.");
            await refreshUnreadCount();
          }
        });
      },
      debug: () => {}
    });

    stompClient.activate();
  }

  // ---------- events ----------
  bellBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = popover.classList.contains("open");
    if (isOpen) {
      closePopover();
      return;
    }
    openPopover();
    await loadSummary();
  });

  if (closeBtn) closeBtn.addEventListener("click", closePopover);

  document.addEventListener("click", (e) => {
    if (!popover.contains(e.target) && !bellBtn.contains(e.target)) {
      closePopover();
    }
  });

  if (moreBtn) {
    moreBtn.addEventListener("click", async () => {
      closePopover();
      openModal();
      await loadModalPage({ reset: true });
    });
  }

  if (readAllBtn) {
    readAllBtn.addEventListener("click", async () => {
      await markAllRead();
    });
  }

  // modal close handlers
  modal.querySelectorAll("[data-close='true']").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  modalBody?.addEventListener("scroll", async () => {
    if (!modal.classList.contains("is-open") || modalLoading || !modalHasMore) return;

    const remain = modalBody.scrollHeight - modalBody.scrollTop - modalBody.clientHeight;
    if (remain <= 120) {
      await loadModalPage();
    }
  });

  // ---------- init ----------
  (async function init() {
    // 로그인 페이지 등에서 empNo 없을 수 있음
    if (!empNo) return;
    await refreshUnreadCount();
    initWebSocket();
  })();

})();
