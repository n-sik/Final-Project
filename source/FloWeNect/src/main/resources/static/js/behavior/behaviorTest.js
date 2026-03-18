/* global Swal, axios */

document.addEventListener("DOMContentLoaded", () => {
  BehaviorTest.init();
});

const BehaviorTest = (() => {
  const dom = {};
  const state = {
    mode: "other", // other | self
    selectedTest: null, // {testNo,testNm,testDesc}
    selectedTarget: null, // {empNo, empNm, deptNm, posNm}
    started: false,

    testData: null, // { testMst, questions, questionItems }
    answers: {}, // { [itemNo]: { itemNo, qstNo, score } }

    loginEmpNo: "", // meta에서 읽기

    // 셀프테스트 결과 모달 제어
    selfResultShown: false,
    lastSelfTypeCd: "",
  };

  // ====== init ======
  function init() {
    cacheDom();
    bindEvents();
    boot();
  }

  function cacheDom() {
    dom.ctx = document.querySelector("meta[name='ctx']")?.content || "";
    state.loginEmpNo = (window.LOGIN_USER && window.LOGIN_USER.empNo) || document.querySelector("meta[name='loginEmpNo']")?.content || "";
    dom.tabOther = document.getElementById("tabOther");
    dom.tabSelf = document.getElementById("tabSelf");

    dom.btnReset = document.getElementById("btnReset");
    dom.btnSubmit = document.getElementById("btnSubmit");

    dom.surveyList = document.getElementById("surveyList");
    dom.surveyMeta = document.getElementById("surveyMeta");
    dom.surveyEmpty = document.getElementById("surveyEmpty");

    dom.selectedPill = document.getElementById("selectedPill");
    dom.selectedSurveyTitle = document.getElementById("selectedSurveyTitle");

    dom.targetPanel = document.getElementById("targetPanel");
    dom.btnPickTarget = document.getElementById("btnPickTarget");
    dom.targetChip = document.getElementById("targetChip");
    dom.targetName = document.getElementById("targetName");
    dom.btnClearTarget = document.getElementById("btnClearTarget");

    dom.btnStartCenter = document.getElementById("btnStartCenter");
    dom.btnCollapseAll = document.getElementById("btnCollapseAll");
    dom.btnExpandAll = document.getElementById("btnExpandAll");

    dom.centerGate = document.getElementById("centerGate");
    dom.gateSurvey = document.getElementById("gateSurvey");
    dom.gateTarget = document.getElementById("gateTarget");
    dom.gateTargetCard = document.getElementById("gateTargetCard");
    dom.gateSub = document.getElementById("gateSub");
    dom.gateNote = document.getElementById("gateNote");

    dom.viewer = document.getElementById("viewer");
    dom.paper = document.getElementById("paper");
    dom.viewerTestName = document.getElementById("viewerTestName");
    dom.viewerTargetBadge = document.getElementById("viewerTargetBadge");
    dom.viewerTargetName = document.getElementById("viewerTargetName");
    dom.resultArea = document.getElementById("resultArea");

    dom.targetModal = document.getElementById("targetModal");
    dom.targetList = document.getElementById("targetList");
    dom.targetEmpty = document.getElementById("targetEmpty");

    // ✅ 셀프테스트 결과 모달(test 전용)
    dom.selfModal = document.getElementById("selfResultModal");
    dom.selfBody  = document.getElementById("selfResultBody");
    dom.selfTitle = document.getElementById("selfResultTitle");

}

  function bindEvents() {
    // null 방어(하나라도 없으면 전체 JS가 죽는 걸 방지)
    dom.tabOther?.addEventListener("click", () => setMode("other"));
    dom.tabSelf?.addEventListener("click", () => setMode("self"));

    dom.btnReset?.addEventListener("click", resetAll);
    dom.btnSubmit?.addEventListener("click", onSubmit);

    dom.btnPickTarget?.addEventListener("click", onOpenTargetModal);

    // 설문 시작 이후에는 대상자 해제 불가(초기화로만)
    dom.btnClearTarget?.addEventListener("click", async () => {
      if (state.started) {
        await Swal.fire({
          icon: "info",
          title: "설문 진행 중",
          text: "설문을 시작한 이후에는 대상자를 변경/해제할 수 없습니다. 변경하려면 초기화를 눌러주세요.",
          confirmButtonText: "확인",
        });
        return;
      }
      state.selectedTarget = null;
      renderTarget();
      renderGate();
      syncStartButtons();
    });

    dom.btnStartCenter?.addEventListener("click", onStartSurvey);

    dom.btnCollapseAll?.addEventListener("click", () => toggleAll(false));
    dom.btnExpandAll?.addEventListener("click", () => toggleAll(true));

    dom.targetModal?.addEventListener("click", (e) => {
      const close = e.target.closest("[data-close='true']");
      if (close) closeTargetModal();
    });

    dom.selfModal?.addEventListener("click", (e) => {
      const close = e.target.closest("[data-st-close='true']");
      if (close) closeSelfModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dom.selfModal?.classList.contains("is-open")) {
        closeSelfModal();
      }
    });

    // 설문 목록(SSR) 클릭 이벤트 위임
    dom.surveyList?.addEventListener("click", (e) => {
      const item = e.target.closest(".bt-item");
      if (!item) return;

      // 설문 시작 이후 설문 변경 금지
      if (state.started) {
        Swal.fire({
          icon: "info",
          title: "설문 진행 중",
          text: "설문을 시작한 이후에는 설문을 변경할 수 없습니다. 변경하려면 초기화를 눌러주세요.",
          confirmButtonText: "확인",
        });
        return;
      }

      const testNo = Number(item.dataset.testNo);
      const testNm = item.dataset.testNm || "";
      const testDesc = item.dataset.testDesc || "";
      if (!testNo) return;

      selectTest({ testNo, testNm, testDesc });
    });

    // 대상자 목록(JS 렌더링) 클릭 이벤트 위임
    dom.targetList?.addEventListener("click", (e) => {
      const el = e.target.closest(".bt-person");
      if (!el) return;

      // 설문 시작 이후 대상자 변경 금지
      if (state.started) {
        Swal.fire({
          icon: "info",
          title: "설문 진행 중",
          text: "설문을 시작한 이후에는 대상자를 변경할 수 없습니다. 변경하려면 초기화를 눌러주세요.",
          confirmButtonText: "확인",
        });
        return;
      }

      // 완료 대상자 선택 불가
      const doneYn = (el.dataset.doneYn || "N").toUpperCase();
      if (doneYn === "Y") {
        Swal.fire({
          icon: "info",
          title: "설문 완료",
          text: "해당 대상자는 이번 반기에 이미 설문을 완료했습니다.",
          confirmButtonText: "확인",
        });
        return;
      }

      const empNo = el.dataset.empNo || "";
      const empNm = el.dataset.empNm || "";
      const deptNm = el.dataset.deptNm || "";
      const posNm = el.dataset.posNm || "";
      if (!empNo) return;

      state.selectedTarget = { empNo, empNm, deptNm, posNm };

      renderTarget();
      renderGate();
      syncStartButtons();
      closeTargetModal();
    });
  }

  // ====== boot ======
  function boot() {
    const count = dom.surveyList?.querySelectorAll(".bt-item").length || 0;
    if (dom.surveyMeta) dom.surveyMeta.textContent = String(count);
    if (dom.surveyEmpty) dom.surveyEmpty.classList.toggle("is-hidden", count > 0);

    dom.targetEmpty?.classList.add("is-hidden");

    setMode("other");
    syncStartButtons();
  }

  // ====== mode ======
  function setMode(mode) {
    // 설문 시작 이후 모드 변경 불가
    if (state.started) {
      Swal.fire({
        icon: "info",
        title: "설문 진행 중",
        text: "설문을 시작한 이후에는 모드를 변경할 수 없습니다. 변경하려면 초기화를 눌러주세요.",
        confirmButtonText: "확인",
      });
      dom.tabOther?.classList.toggle("active", state.mode === "other");
      dom.tabSelf?.classList.toggle("active", state.mode === "self");
      return;
    }

    state.mode = mode;
    dom.tabOther?.classList.toggle("active", mode === "other");
    dom.tabSelf?.classList.toggle("active", mode === "self");

    dom.targetPanel?.classList.toggle("is-hidden", mode === "self");
    dom.viewerTargetBadge?.classList.toggle("is-hidden", mode === "self");
    dom.gateTargetCard?.classList.toggle("is-hidden", mode === "self");

    // 제출은 타인평가에서만
    if (dom.btnSubmit) dom.btnSubmit.disabled = true;

    // 모드 변경 시 대상자 초기화
    state.selectedTarget = null;
    renderTarget();

    renderGate();
    syncStartButtons();
  }

  // ====== select test ======
  function selectTest(test) {
    state.selectedTest = test;
    state.started = false;
    state.testData = null;
    state.answers = {};

    // 타인 모드면 대상자 다시 선택
    if (state.mode === "other") {
      state.selectedTarget = null;
      renderTarget();
    }

    renderSelectedPill();
    highlightSelectedTest();
    renderGate();
    showGate();
    syncStartButtons();
    updateSubmitState();
    renderResultPreview();
  }

  function highlightSelectedTest() {
    const items = dom.surveyList?.querySelectorAll(".bt-item") || [];
    items.forEach((it) => {
      const isActive = state.selectedTest && String(state.selectedTest.testNo) === String(it.dataset.testNo);
      it.classList.toggle("active", isActive);
    });
  }

  // ====== header pill / target enable ======
  function renderSelectedPill() {
    const name = state.selectedTest ? state.selectedTest.testNm : "-";
    if (dom.selectedSurveyTitle) dom.selectedSurveyTitle.textContent = name;

    const isSel = !!state.selectedTest;
    dom.selectedPill?.classList.toggle("is-selected", isSel);

    const canPickTarget = !!state.selectedTest;
    const lockPickTarget = state.started;

    dom.targetPanel?.classList.toggle("is-disabled", !canPickTarget || lockPickTarget);
    if (dom.btnPickTarget) dom.btnPickTarget.disabled = !canPickTarget || lockPickTarget;

    if (!canPickTarget) dom.btnPickTarget?.classList.remove("is-active");
  }

  function renderTarget() {
    if (!state.selectedTarget) {
      dom.targetChip?.classList.add("is-hidden");
      if (dom.targetName) dom.targetName.textContent = "-";
      dom.btnPickTarget?.classList.remove("is-hidden");
      return;
    }

    dom.btnPickTarget?.classList.add("is-hidden");
    dom.targetChip?.classList.remove("is-hidden");
    if (dom.targetName) dom.targetName.textContent = `${state.selectedTarget.empNm || "-"}`;
  }

  // ====== gate ======
  function renderGate() {
    if (dom.gateSurvey) dom.gateSurvey.textContent = state.selectedTest ? state.selectedTest.testNm : "-";

    if (state.mode === "other") {
      if (dom.gateSub) dom.gateSub.textContent = "타인 테스트는 설문 + 대상자 선택이 필요합니다.";
      if (dom.gateTarget) dom.gateTarget.textContent = state.selectedTarget ? `${state.selectedTarget.empNm || "-"}` : "-";
      if (dom.gateNote) dom.gateNote.textContent = "설문과 대상자를 선택해야 시작할 수 있어요.";
    } else {
      if (dom.gateSub) dom.gateSub.textContent = "셀프 테스트는 설문 선택만 필요합니다.";
      if (dom.gateNote) dom.gateNote.textContent = "셀프 테스트는 결과만 확인하며 DB에 저장하지 않습니다.";
    }
  }

  function showGate() {
    dom.centerGate?.classList.remove("is-hidden");
    dom.viewer?.classList.add("is-hidden");
  }

  function showViewer() {
    dom.centerGate?.classList.add("is-hidden");
    dom.viewer?.classList.remove("is-hidden");
  }

  function syncStartButtons() {
    const okSurvey = !!state.selectedTest;
    const okTarget = state.mode === "self" ? true : !!state.selectedTarget;
    const canStart = okSurvey && okTarget && !state.started;

    if (dom.btnStartCenter) dom.btnStartCenter.disabled = !canStart;
    if (dom.btnSubmit) dom.btnSubmit.disabled = true;

    if (dom.btnClearTarget) dom.btnClearTarget.disabled = !!state.started;

    renderSelectedPill();
  }

  // ====== target modal (비동기 로드) ======
  function onOpenTargetModal() {
    if (!state.selectedTest) return;

    // 설문 시작 이후 모달 열기 불가
    if (state.started) {
      Swal.fire({
        icon: "info",
        title: "설문 진행 중",
        text: "설문을 시작한 이후에는 대상자를 변경할 수 없습니다. 변경하려면 초기화를 눌러주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    dom.btnPickTarget?.classList.add("is-active");
    openTargetModal();
    loadTargets();
  }

  function openTargetModal() {
    dom.targetModal?.classList.add("is-open");
    dom.targetModal?.setAttribute("aria-hidden", "false");
  }

  function closeTargetModal() {
    dom.targetModal?.classList.remove("is-open");
    dom.targetModal?.setAttribute("aria-hidden", "true");
    dom.btnPickTarget?.classList.remove("is-active");
  }

  async function loadTargets() {
    if (!state.selectedTest) return;

    if (dom.targetList) {
      dom.targetList.innerHTML = `
        <div class="bt-empty">
          <div class="bt-empty__title">대상자 목록 불러오는 중...</div>
          <div class="bt-empty__desc">잠시만 기다려주세요.</div>
        </div>
      `;
    }
    dom.targetEmpty?.classList.add("is-hidden");

    try {
      const res = await axios({
        method: "GET",
        url: `${dom.ctx}/rest/behavior/test/targets`,
        params: {
          testNo: state.selectedTest.testNo,
          rspnrEmpNo: state.loginEmpNo,
        },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      renderTargetList(list);
    } catch (err) {
      console.error(err);
      if (dom.targetList) dom.targetList.innerHTML = "";
      if (dom.targetEmpty) {
        dom.targetEmpty.classList.remove("is-hidden");
        const t = dom.targetEmpty.querySelector(".bt-empty__title");
        const d = dom.targetEmpty.querySelector(".bt-empty__desc");
        if (t) t.textContent = "대상자 로드 실패";
        if (d) d.textContent = "잠시 후 다시 시도해주세요.";
      }
    }
  }

  function renderTargetList(list) {
    if (!dom.targetList) return;
    dom.targetList.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      dom.targetEmpty?.classList.remove("is-hidden");
      return;
    }
    dom.targetEmpty?.classList.add("is-hidden");

    const frag = document.createDocumentFragment();
    list.forEach((p) => {
      const doneYn = String(p.doneYn || "N").toUpperCase();
      const card = document.createElement("div");
      card.className = "bt-person";
      if (doneYn === "Y") card.style.opacity = "0.55";

      card.dataset.empNo = p.empNo || "";
      card.dataset.empNm = p.empNm || "";
      card.dataset.deptNm = p.deptNm || "";
      card.dataset.posNm = p.posNm || "";
      card.dataset.doneYn = doneYn;

      const chipClass = doneYn === "Y" ? "bt-chip bt-chip--primary" : "bt-chip";
      const chipText = doneYn === "Y" ? "설문완료" : "설문필요";

      card.innerHTML = `
        <div class="bt-person__name">
          ${escapeHtml(p.empNm || "-")}
          <span class="${chipClass}" style="margin-left:8px;">${chipText}</span>
        </div>
        <div class="bt-person__meta">
          ${escapeHtml(p.deptNm || "-")} · ${escapeHtml(p.posNm || "-")}
        </div>
      `;
      frag.appendChild(card);
    });

    dom.targetList.appendChild(frag);
  }

  // ====== start survey ======
  async function onStartSurvey() {
    if (dom.btnStartCenter?.disabled) return;
    if (!state.selectedTest) return;
    if (state.mode === "other" && !state.selectedTarget) return;

    try {
      const res = await axios({
        method: "GET",
        url: `${dom.ctx}/rest/behavior/test`,
        headers: { "Content-Type": "application/json" },
        params: { testNo: state.selectedTest.testNo },
      });

      const data = res.data;

      console.log(data);

      state.testData = data;
      state.answers = {};
      state.started = true;

      if (dom.viewerTestName) dom.viewerTestName.textContent = data.testMst?.testNm || state.selectedTest.testNm;
      if (state.mode === "other" && dom.viewerTargetName) dom.viewerTargetName.textContent = `${state.selectedTarget.empNm || "-"}`;

      renderPaper(data);
      showViewer();

      if (dom.btnCollapseAll) dom.btnCollapseAll.disabled = false;
      if (dom.btnExpandAll) dom.btnExpandAll.disabled = false;

      syncStartButtons();
      updateSubmitState();
      renderResultPreview();
    } catch (err) {
      Swal.close();
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "설문 로드 실패",
        text: "설문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  }

  // ====== render ======
  function renderPaper(data) {
    if (!dom.paper) return;
    dom.paper.innerHTML = "";

    const itemsByQ = new Map();
    (data.questionItems || []).forEach((it) => {
      if (!itemsByQ.has(it.qstNo)) itemsByQ.set(it.qstNo, []);
      itemsByQ.get(it.qstNo).push(it);
    });

    (data.questions || []).forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "bt-q";
      card.dataset.qstNo = q.qstNo;

      const list = itemsByQ.get(q.qstNo) || [];

      const rows = list
        .map((it) => {
          const name = `item_${it.itemNo}`;
          const scored = state.answers[it.itemNo]?.score ?? null;

          const rate = [1, 2, 3, 4, 5]
            .map((s) => {
              const checked = Number(scored) === s ? "checked" : "";
              return `
                <label class="bt-rate__opt" title="${s}점">
                  <input type="radio" name="${name}" value="${s}" ${checked} />
                  <span class="bt-rate__pill">${s}</span>
                </label>
              `;
            })
            .join("");

          return `
            <div class="bt-row"
                 data-item-no="${it.itemNo}"
                 data-qst-no="${it.qstNo}"
                 data-item-type="${escapeHtml(it.itemType || "")}">
              <div class="bt-row__txt">${escapeHtml(it.itemCn)}</div>
              <div class="bt-rate" role="radiogroup" aria-label="점수 선택 (1~5)">
                ${rate}
              </div>
            </div>
          `;
        })
        .join("");

      card.innerHTML = `
        <div class="bt-q__head">
          <div class="bt-q__title"><i class="bi bi-list-check"></i> ${idx + 1}. ${escapeHtml(q.qstNm)}</div>
          <div class="bt-chip">미응답</div>
        </div>
        <div class="bt-q__body">
          ${rows || `<div class="bt-empty"><div class="bt-empty__title">항목이 없습니다</div></div>`}
        </div>
      `;

      card.addEventListener("change", (e) => {
        const input = e.target.closest("input[type='radio']");
        if (!input) return;

        const row = input.closest(".bt-row");
        if (!row) return;

        const itemNo = Number(row.dataset.itemNo);
        const qstNo = Number(row.dataset.qstNo);
        const score = Number(input.value);

        state.answers[itemNo] = { itemNo, qstNo, score };

        refreshSectionChip(card, qstNo, itemsByQ);
        renderResultPreview();
        updateSubmitState();
      });

      refreshSectionChip(card, q.qstNo, itemsByQ);
      dom.paper.appendChild(card);
    });
  }

  function isAllAnswered() {
    const items = Array.isArray(state.testData?.questionItems) ? state.testData.questionItems : [];
    if (items.length === 0) return false;
    return items.every((it) => !!state.answers[Number(it.itemNo)]?.score);
  }

  async function openSelfResultDetail(typeCd) {
    try {
      if (dom.selfTitle) dom.selfTitle.textContent = "셀프 테스트 결과";
      if (dom.selfBody) {
        dom.selfBody.innerHTML = `
          <div class="bt-empty">
            <div class="bt-empty__title">불러오는 중...</div>
            <div class="bt-empty__desc">잠시만 기다려주세요.</div>
          </div>
        `;
      }
      openSelfModal();

      const res = await axios({
        method: "GET",
        url: `${dom.ctx}/api/behavior/result/self-detail`,
        params: {
          testNo: Number(state.selectedTest?.testNo || 0),
          typeCd,
        },
      });

      renderDetail(res.data);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "결과 조회 실패",
        text: "결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      });
      closeSelfModal();
    }
  }

  function renderDetail(data) {
    const mst = data?.mst;
    const type = data?.type;
    if (!dom.selfBody) return;

    if (!mst) {
      dom.selfBody.innerHTML = `
        <div class="bt-empty">
          <div class="bt-empty__title">데이터가 없습니다</div>
          <div class="bt-empty__desc">결과 정보를 찾지 못했습니다.</div>
        </div>
      `;
      return;
    }

    // ✅ 셀프 전용: 단순 결과 화면(스크롤은 st-modal__body에서 처리)
    if (dom.selfTitle) dom.selfTitle.textContent = `${mst.testNm || "설문"} · 결과`;

    const typeCd = type?.typeCd || mst.actnTypeRslt || "-";
    const typeNm = type?.typeNm || "";
    const report = type?.typeCn ? escapeHtmlKeepBreaks(type.typeCn) : "<p>리포트 내용이 없습니다.</p>";

    dom.selfBody.innerHTML = `
      <div class="st-result">
        <div class="st-result__head">
          <div class="st-result__type">
            <div class="st-result__badge"><i class="bi bi-award"></i> ${escapeHtml(typeCd)}</div>
            <div class="st-result__name">${escapeHtml(typeNm || "결과 유형")}</div>
            <div class="st-result__meta">응답일시: ${escapeHtml(formatDateTime(mst.rspnsDtm))}</div>
          </div>
        </div>
        <div class="st-result__body">${report}</div>
      </div>
    `;
  }

  function openSelfModal() {
    if (!dom.selfModal) return;
    dom.selfModal.classList.add("is-open");
    dom.selfModal.setAttribute("aria-hidden", "false");
  }

  function closeSelfModal() {
    if (!dom.selfModal) return;
    dom.selfModal.classList.remove("is-open");
    dom.selfModal.setAttribute("aria-hidden", "true");
  }

  function formatDateTime(v) {
    if (!v) return "-";
    if (typeof v === "string") return v;
    try {
      return new Date(v).toISOString().replace("T", " ").slice(0, 19);
    } catch (_) {
      return String(v);
    }
  }

  function refreshSectionChip(card, qstNo, itemsByQ) {
    const items = itemsByQ.get(qstNo) || [];
    const allDone = items.length > 0 && items.every((it) => !!state.answers[it.itemNo]?.score);

    const chip = card.querySelector(".bt-q__head .bt-chip");
    if (!chip) return;

    if (allDone) {
      chip.textContent = "응답 완료";
      chip.classList.add("bt-chip--primary");
    } else {
      chip.textContent = "미응답";
      chip.classList.remove("bt-chip--primary");
    }
  }

  // ====== calc ======
  function calcAllTypeScores() {
    if (!state.testData) {
      return { byQuestion: {}, overall: { typeAgg: {} }, resultType: "" };
    }

    const items = Array.isArray(state.testData.questionItems) ? state.testData.questionItems : [];

    const itemMeta = new Map();
    items.forEach((it) => {
      const itemNo = Number(it.itemNo);
      if (!itemNo) return;
      itemMeta.set(itemNo, { qstNo: Number(it.qstNo), itemType: String(it.itemType || "").trim() });
    });

    const byQuestion = {};
    const overallTypeAgg = {};

    const answers = Object.values(state.answers || {});
    answers.forEach((ans) => {
      const meta = itemMeta.get(Number(ans.itemNo));
      if (!meta) return;

      const qstNo = meta.qstNo;
      const type = meta.itemType || "UNKNOWN";
      const score = Number(ans.score) || 0;

      if (!byQuestion[qstNo]) byQuestion[qstNo] = { qstNo, typeAgg: {}, winnerType: "" };
      if (!byQuestion[qstNo].typeAgg[type]) byQuestion[qstNo].typeAgg[type] = { sum: 0, count: 0, max: 0, avg: 0, pct: 0 };
      if (!overallTypeAgg[type]) overallTypeAgg[type] = { sum: 0, count: 0, max: 0, avg: 0, pct: 0 };

      const qAgg = byQuestion[qstNo].typeAgg[type];
      qAgg.sum += score;
      qAgg.count += 1;
      qAgg.max += 5;

      const oAgg = overallTypeAgg[type];
      oAgg.sum += score;
      oAgg.count += 1;
      oAgg.max += 5;
    });

    // ✅ 차원별 최종 동점일 때 선택 우선순위 (원하는대로 바꿔도 됨)
    // - D/M, R/C, P/E, S/F 에 대해서는 현업에서 흔히 쓰는 "왼쪽 우선" 규칙
    const TYPE_PREF = {
      D: 1, M: 2,
      R: 1, C: 2,
      P: 1, E: 2,
      S: 1, F: 2,
    };

    Object.values(byQuestion).forEach((q) => {
      const entries = Object.entries(q.typeAgg);

      entries.forEach(([, a]) => {
        a.avg = a.count > 0 ? a.sum / a.count : 0;
        a.pct = a.max > 0 ? (a.sum / a.max) * 100 : 0;
      });

      if (!entries.length) {
        q.winnerType = "";
        return;
      }

      // ✅ 핵심 수정: 동점이어도 무조건 1글자 winner 선택 (TIE 제거)
      entries.sort((a, b) => {
        const A = a[1];
        const B = b[1];

        // 1) pct 높은 쪽
        if (B.pct !== A.pct) return B.pct - A.pct;

        // 2) sum 높은 쪽
        if (B.sum !== A.sum) return B.sum - A.sum;

        // 3) avg 높은 쪽
        if (B.avg !== A.avg) return B.avg - A.avg;

        // 4) 차원 우선순위(D>M, R>C, P>E, S>F)
        const pa = TYPE_PREF[a[0]] ?? 99;
        const pb = TYPE_PREF[b[0]] ?? 99;
        if (pa !== pb) return pa - pb;

        // 5) 그래도 같으면 타입 코드 알파벳순(완전 결정적)
        return String(a[0]).localeCompare(String(b[0]));
      });

      q.winnerType = entries[0][0]; // 항상 1글자
    });

    Object.entries(overallTypeAgg).forEach(([, a]) => {
      a.avg = a.count > 0 ? a.sum / a.count : 0;
      a.pct = a.max > 0 ? (a.sum / a.max) * 100 : 0;
    });

    const qOrder = Array.isArray(state.testData.questions) ? state.testData.questions.map((q) => Number(q.qstNo)) : [];
    const resultType = qOrder.map((qstNo) => byQuestion[qstNo]?.winnerType || "").join("");

    return { byQuestion, overall: { typeAgg: overallTypeAgg }, resultType };
  }

  function renderResultPreview() {
    const vals = Object.values(state.answers);
    const answered = vals.length;

    const total = vals.reduce((a, v) => a + (v.score || 0), 0);
    const max = answered * 5;

    const calc = calcAllTypeScores();
    const rt = calc?.resultType ? ` / resultType: ${calc.resultType}` : "";

    if (dom.resultArea) dom.resultArea.textContent = `응답 ${answered}개 / 합계 ${total}점 (최대 ${max}점)${rt}`;
  }

  function toggleAll(expand) {
    const cards = dom.paper?.querySelectorAll(".bt-q") || [];
    cards.forEach((card) => {
      const body = card.querySelector(".bt-q__body");
      if (!body) return;
      body.style.display = expand ? "" : "none";
    });
  }

  // ✅ 모드별 submit enable
  function updateSubmitState() {
    if (!state.started || !state.testData) {
      if (dom.btnSubmit) dom.btnSubmit.disabled = true;
      return;
    }

    const totalItems = (state.testData.questionItems || []).length;
    const answeredItems = Object.keys(state.answers).length;

    const allDone = totalItems > 0 && answeredItems === totalItems;

    // 타인평가: 저장 제출
    // 셀프테스트: 결과 모달 오픈(저장 없음)
    if (dom.btnSubmit) dom.btnSubmit.disabled = !allDone;
  }

  // ====== submit ======
  async function onSubmit() {
    if (dom.btnSubmit?.disabled) return;

    // ✅ 셀프테스트: 저장 없이 결과 모달만 띄움
    if (state.mode === "self") {
      if (!isAllAnswered()) {
        await Swal.fire({
          icon: "info",
          title: "미응답 항목이 있습니다",
          text: "모든 항목을 체크한 뒤 제출을 눌러주세요.",
          confirmButtonText: "확인",
        });
        return;
      }

      const calc = calcAllTypeScores();
      const typeCd = calc?.resultType || "";

      if (!typeCd) {
        await Swal.fire({
          icon: "error",
          title: "결과 계산 실패",
          text: "결과 유형을 계산하지 못했습니다. 다시 시도해주세요.",
          confirmButtonText: "확인",
        });
        return;
      }

      // 중복 오픈 방지(연속 클릭/중복 요청)
      if (state.selfResultShown && state.lastSelfTypeCd === typeCd && dom.selfModal?.classList.contains("is-open")) {
        return;
      }
      state.selfResultShown = true;
      state.lastSelfTypeCd = typeCd;

      await openSelfResultDetail(typeCd);
      return;
    }

    // ✅ 타인평가: 서버 저장 제출
    if (state.mode !== "other") return;

    dom.btnSubmit.disabled = true;

    try {
      // await Swal.fire({
      //   title: "제출 중",
      //   text: "응답을 서버에 저장하고 있습니다...",
      //   allowOutsideClick: false,
      //   didOpen: () => Swal.showLoading(),
      // });

      const payload = buildSubmitPayload();

      console.log(payload);

      const res = await axios({
        method: "POST",
        url: `${dom.ctx}/rest/behavior/test`,
        headers: { "Content-Type": "application/json" },
        data: payload,
      });

      // Swal.close();

      if (res?.data?.ok !== false) {
        await Swal.fire({
          icon: "success",
          title: "제출 완료",
          text: "응답이 저장되었습니다.",
          confirmButtonText: "확인",
        });
        resetAll();
      } else {
        throw new Error("submit failed");
      }
    } catch (err) {
      Swal.close();
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "제출 실패",
        text: "잠시 후 다시 시도해주세요.",
      });
      updateSubmitState();
    }
  }

  // ✅ 카멜케이스 payload (BehaviorTestReq / RspnsReq / RspnsResultsReq에 맞춤)
  function buildSubmitPayload() {
    const calc = calcAllTypeScores();
    const resultType = calc?.resultType || "";

    const rspns = {
      testNo: String(state.selectedTest.testNo),
      rspnrEmpNo: String(state.loginEmpNo),
      trgtEmpNo: String(state.selectedTarget.empNo),
      actnTypeRslt: resultType,
    };

    const rspnsResults = Object.values(state.answers).map((ans) => ({
      itemNo: String(ans.itemNo),
      rspnsVal: String(ans.score),
    }));

    return {
      // 서버에서 필요 없으면 제거 가능(그대로 둬도 무방)
      testMst: {
        testNo: state.selectedTest.testNo,
        testNm: state.selectedTest.testNm,
      },
      rspns,
      rspnsResults,
      raw: { answers: state.answers },
    };
  }

  // ====== reset ======
  function resetAll() {
    state.selectedTest = null;
    state.selectedTarget = null;
    state.started = false;
    state.testData = null;
    state.answers = {};

    state.selfResultShown = false;
    state.lastSelfTypeCd = "";

    if (dom.selectedSurveyTitle) dom.selectedSurveyTitle.textContent = "-";
    dom.selectedPill?.classList.remove("is-selected");

    if (dom.paper) dom.paper.innerHTML = "";
    if (dom.resultArea) dom.resultArea.textContent = "설문 진행 중 선택 점수를 바탕으로 결과를 계산할 영역입니다.";

    dom.btnPickTarget?.classList.remove("is-active");
    if (dom.btnClearTarget) dom.btnClearTarget.disabled = false;

    renderTarget();
    renderGate();
    showGate();

    highlightSelectedTest();
    syncStartButtons();
    updateSubmitState();
  }

  // ====== utils ======
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeHtmlKeepBreaks(str) {
    return escapeHtml(str).replaceAll("\n", "<br/>");
  }

  return { init };
})();