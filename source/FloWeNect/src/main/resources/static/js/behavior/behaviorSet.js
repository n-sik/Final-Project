/* global Swal, axios */

document.addEventListener("DOMContentLoaded", () => {
  BehaviorSet.init();
});

const BehaviorSet = (() => {
  const dom = {};
  const db = new Map();

  const state = {
    tab: "qna",
    currentSurveyId: null,
    dirty: false,

    working: null,
    activeSectionId: null,
    activeQuestionId: null,
    activeResultId: null,

    editingKey: null, // { type, id }
    surveyFilter: "",
  };

  function init() {
    cacheDom();
    bindEvents();

    renderAll();
    loadInitialData();
  }

  function cacheDom() {
    dom.surveyList = document.querySelector("#surveyList");
    dom.surveyEmpty = document.querySelector("#surveyEmpty");
    dom.surveyMeta = document.querySelector("#surveyMeta");

    dom.surveySearch = document.querySelector("#surveySearch");
    dom.btnClearSurveySearch = document.querySelector("#btnClearSurveySearch");

    dom.selectedPill = document.querySelector("#selectedPill");
    dom.selectedSurveyTitle = document.querySelector("#selectedSurveyTitle");
    dom.selectedMeta = document.querySelector("#selectedMeta");
    dom.badgeSections = document.querySelector("#badgeSections");

    dom.btnSave = document.querySelector("#btnSave");

    dom.tabBtns = document.querySelectorAll(".tab-btn");
    dom.tabQna = document.querySelector("#tabQna");
    dom.tabResult = document.querySelector("#tabResult");

    dom.btnAddSurvey = document.querySelector("#btnAddSurvey");

    dom.sectionList = document.querySelector("#sectionList");
    dom.sectionEmpty = document.querySelector("#sectionEmpty");
    dom.btnAddSection = document.querySelector("#btnAddSection");

    dom.questionTitle = document.querySelector("#questionTitle");
    dom.questionList = document.querySelector("#questionList");
    dom.questionEmpty = document.querySelector("#questionEmpty");
    dom.btnAddQuestion = document.querySelector("#btnAddQuestion");

    dom.resultList = document.querySelector("#resultList");
    dom.resultEmpty = document.querySelector("#resultEmpty");
    dom.btnAddResult = document.querySelector("#btnAddResult");

    dom.resultTitle = document.querySelector("#resultTitle");
    dom.resultDetail = document.querySelector("#resultDetail");

    dom.btnEditResult = document.querySelector("#btnEditResult");
    dom.btnResultCancelHead = document.querySelector("#btnResultCancelHead");
    dom.btnResultOkHead = document.querySelector("#btnResultOkHead");
  }

  function bindEvents() {
    dom.btnAddSurvey?.addEventListener("click", addSurveyInline);
    dom.btnSave?.addEventListener("click", saveSurvey);

    dom.tabBtns?.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        renderTabs();
      });
    });

    if (dom.surveySearch) {
      dom.surveySearch.addEventListener("input", () => {
        state.surveyFilter = (dom.surveySearch.value || "").trim();
        renderSurveyList();
      });
    }
    if (dom.btnClearSurveySearch) {
      dom.btnClearSurveySearch.addEventListener("click", () => {
        dom.surveySearch.value = "";
        state.surveyFilter = "";
        renderSurveyList();
        dom.surveySearch.focus();
      });
    }

    dom.surveyList?.addEventListener("click", onSurveyListClick);
    dom.sectionList?.addEventListener("click", onSectionListClick);
    dom.questionList?.addEventListener("click", onQuestionListClick);
    dom.resultList?.addEventListener("click", onResultListClick);

    dom.btnAddSection?.addEventListener("click", addSectionInline);
    dom.btnAddQuestion?.addEventListener("click", addQuestionInline);
    dom.btnAddResult?.addEventListener("click", addResultInline);

    dom.btnEditResult?.addEventListener("click", enterResultContentEdit);
    dom.btnResultCancelHead?.addEventListener("click", cancelResultContentEdit);
    dom.btnResultOkHead?.addEventListener("click", applyResultContentEdit);

    document.addEventListener("click", (e) => {
      if (e.target.closest(".menu-root")) return;
      closeAllMenus();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllMenus();

        if (state.editingKey?.type === "resultContent") {
          cancelResultContentEdit();
          return;
        }

        if (state.editingKey) cancelInlineEdit();
      }

      if (!state.editingKey) return;

      if (e.key === "Enter") {
        const el = document.activeElement;
        if (el && el.tagName === "TEXTAREA") return;
        if (state.editingKey?.type === "resultContent") return;
        commitInlineEdit();
      }
    });
  }

  // =========================
  // Async (GET)
  // =========================
  async function loadInitialData() {
    const ctx = getCtx();

    try {
      const res = await axios({
        method: "GET",
        url: `${ctx}/api/behavior/set`,
        headers: { "Content-Type": "application/json" },
      });

      hydrateDbFromApi(res.data);

      const firstId = Array.from(db.keys())[0] || null;
      if (firstId) await selectSurvey(firstId, true);
      else renderAll();
    } catch (err) {
      console.error(err);
      await toast("error", "초기 데이터를 불러오지 못했습니다.");
      renderAll();
    }
  }

  // =========================
  // API JSON → db(Map)
  // =========================
  function hydrateDbFromApi(api) {
    db.clear();

    const tests = normalizeArray(api?.testMst);
    const questions = normalizeArray(api?.questions);
    const items = normalizeArray(api?.questionItems);
    const types = normalizeArray(api?.behaviorTypes);

    tests.forEach((t) => {
      const id = toStr(t?.testNo);
      if (!id) return;

      db.set(id, {
        id,
        title: t?.testNm ?? "",
        content: t?.testDesc ?? "",
        sections: [],
        results: [],
      });
    });

    const secByQstNo = new Map(); // qstNo -> section ref
    questions.forEach((q) => {
      const surveyId = toStr(q?.testNo);
      const survey = db.get(surveyId);
      if (!survey) return;

      const qstId = toStr(q?.qstNo);
      if (!qstId) return;

      const sec = {
        id: qstId,
        name: q?.qstNm ?? "",
        questions: [],
      };

      survey.sections.push(sec);
      secByQstNo.set(qstId, sec);
    });

    // ✅ (변경) QUESTION_ITEM: itemType까지 hydrate
    items.forEach((it) => {
      const qstId = toStr(it?.qstNo);
      const sec = secByQstNo.get(qstId);
      if (!sec) return;

      const itemId = toStr(it?.itemNo) || makeId("qi");
      sec.questions.push({
        id: itemId,
        text: it?.itemCn ?? "",
        itemType: it?.itemType ?? "", // ✅ 추가
      });
    });

    types.forEach((bt) => {
      const surveyId = toStr(bt?.testNo);
      const survey = db.get(surveyId);
      if (!survey) return;

      const typeId = toStr(bt?.typeNo) || makeId("bt");
      survey.results.push({
        id: typeId,
        title: bt?.typeCd ?? "",
        label: bt?.typeNm ?? "",
        content: bt?.typeCn ?? "",
      });
    });

    db.forEach((survey) => {
      survey.sections.sort((a, b) => num(a.id) - num(b.id));
      survey.sections.forEach((sec) => sec.questions.sort((a, b) => num(a.id) - num(b.id)));
      survey.results.sort((a, b) => num(a.id) - num(b.id));
    });
  }

  function normalizeArray(v) {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }
  function toStr(v) {
    if (v === null || v === undefined) return "";
    return String(v);
  }
  function num(v) {
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? 0 : n;
  }

  // =========================
  // UI helpers
  // =========================
  function setCardTitle(el, { icon, title, chipText, chipIcon }) {
    if (!el) return;

    const chip = chipText
      ? `<span class="bs-title-chip"><i class="bi ${chipIcon || "bi-record-circle"}"></i>${escapeHtml(
          chipText
        )}</span>`
      : "";

    el.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${escapeHtml(title)}</span>
      ${chip}
    `;
  }

  function menuTemplate({ editAction, deleteAction, id }) {
    return `
      <div class="menu-root">
        <button type="button" class="menu-trigger" data-menu-trigger="true" title="메뉴">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <div class="menu">
          <button type="button" class="menu-btn" data-action="${escapeAttr(editAction)}" data-id="${escapeAttr(id)}">
            <i class="bi bi-pencil"></i> 편집
          </button>
          <button type="button" class="menu-btn danger" data-action="${escapeAttr(deleteAction)}" data-id="${escapeAttr(
      id
    )}">
            <i class="bi bi-trash"></i> 삭제
          </button>
        </div>
      </div>
    `;
  }

  function isEditingInputTarget(target) {
    return !!target.closest("input, textarea, select, [contenteditable='true'], .inline-field");
  }

  function stopBubbling(e) {
    e.stopPropagation();
  }

  // ✅ (변경) itemType input도 stop bubbling 대상에 포함
  function bindStopToEditors() {
    const els = document.querySelectorAll(
      '[data-edit-title="true"], [data-edit-content="true"], [data-edit-input="true"], [data-edit-type="true"], #resultLabelInput, #resultContentTextarea'
    );

    els.forEach((el) => {
      if (el.dataset.stopBound === "1") return;
      el.dataset.stopBound = "1";
      el.addEventListener("pointerdown", stopBubbling);
      el.addEventListener("mousedown", stopBubbling);
      el.addEventListener("click", stopBubbling);
    });
  }

  function closeAllMenus() {
    document.querySelectorAll(".menu-root.open").forEach((m) => m.classList.remove("open"));
  }

  function toggleMenu(rootEl) {
    const isOpen = rootEl.classList.contains("open");
    closeAllMenus();
    if (!isOpen) rootEl.classList.add("open");
  }

  function finalizeEditBeforeNavigate() {
    if (!state.editingKey) return;

    if (state.editingKey.type === "resultContent") {
      const r = getActiveResult();
      if (r) {
        const label = document.querySelector("#resultLabelInput")?.value || "";
        const content = document.querySelector("#resultContentTextarea")?.value || "";
        r.label = label;
        r.content = content;
        setDirty(true);
      }
      state.editingKey = null;
      return;
    }

    commitInlineEdit(true);
  }

  // =========================
  // Add
  // =========================
  async function addSurveyInline() {
    const ok = await confirmDiscardIfDirty(
      "새 설문을 추가하면 현재 작성 중인 내용이 저장되지 않고 삭제될 수 있습니다.\n계속할까요?"
    );
    if (!ok) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const id = makeId("survey");
    db.set(id, { id, title: "새 설문", content: "", sections: [], results: [] });

    await selectSurvey(id, true);

    startInlineEdit({ type: "surveyEdit", id });
    setDirty(true);
  }

  function addSectionInline() {
    if (!ensureSurveySelected()) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const id = makeId("sec");
    state.working.sections.push({ id, name: "새 문항", questions: [] });
    state.activeSectionId = id;
    state.activeQuestionId = null;

    setDirty(true);
    renderQna();
    updateButtons();

    startInlineEdit({ type: "sectionName", id });
  }

  // ✅ (변경) 질문(문항 항목) 추가 시 itemType 기본값 포함
  function addQuestionInline() {
    if (!ensureSurveySelected()) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const sec = getActiveSection();
    if (!sec) {
      toast("info", "문항을 먼저 선택하세요.");
      return;
    }

    const id = makeId("q");
    sec.questions.push({ id, text: "새 항목", itemType: "" }); // ✅ itemType 추가
    state.activeQuestionId = id;

    setDirty(true);
    renderQna();

    startInlineEdit({ type: "questionText", id });
  }

  function addResultInline() {
    if (!ensureSurveySelected()) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const id = makeId("res");
    state.working.results.push({ id, title: "새 결과", label: "", content: "" });
    state.activeResultId = id;

    setDirty(true);
    renderResults();
    updateButtons();

    startInlineEdit({ type: "resultTitle", id });
  }

  // =========================
  // Delete
  // =========================
  async function deleteSurvey(id) {
    const s = db.get(id);
    if (!s) return;

    const ok = await confirmDanger(
      "설문 삭제",
      "설문(검사종류)을 삭제하면 문항/질문/결과가 함께 삭제됩니다. 계속할까요?"
    );
    if (!ok) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    if (!isPersistedId(id)) {
      const wasCurrent = state.currentSurveyId === id;
      db.delete(id);

      if (wasCurrent) resetSelection();

      renderAll();
      await toast("success", "로컬 설문이 삭제되었습니다.");
      return;
    }

    const ctx = getCtx();

    try {
      await axios({
        method: "DELETE",
        url: `${ctx}/api/behavior/set/${id}`,
        headers: { "Content-Type": "application/json" },
      });

      const wasCurrent = state.currentSurveyId === id;
      db.delete(id);
      if (wasCurrent) resetSelection();

      const nextId = Array.from(db.keys())[0] || null;
      if (nextId) await selectSurvey(nextId, true);
      else renderAll();

      await toast("success", "설문이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      await toast("error", "서버 삭제에 실패했습니다.");
    }
  }

  async function deleteSection(secId) {
    const sec = state.working?.sections.find((s) => s.id === secId);
    if (!sec) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const ok = await confirmDanger(
      "문항 삭제",
      `문항을 삭제하면 연결된 질문 ${sec.questions.length}개가 함께 삭제됩니다. 계속할까요?`
    );
    if (!ok) return;

    state.working.sections = state.working.sections.filter((s) => s.id !== secId);

    if (state.activeSectionId === secId) {
      state.activeSectionId = state.working.sections[0]?.id || null;
      state.activeQuestionId = null;
    }

    setDirty(true);
    renderQna();
    updateButtons();
  }

  async function deleteQuestion(qId) {
    const sec = getActiveSection();
    if (!sec) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const ok = await confirmDanger("질문 삭제", "질문을 삭제할까요?");
    if (!ok) return;

    sec.questions = sec.questions.filter((q) => q.id !== qId);

    if (state.activeQuestionId === qId) {
      state.activeQuestionId = sec.questions[0]?.id || null;
    }

    setDirty(true);
    renderQna();
  }

  async function deleteResult(resId) {
    const r = state.working?.results.find((x) => x.id === resId);
    if (!r) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    const ok = await confirmDanger("결과 삭제", "결과를 삭제할까요?");
    if (!ok) return;

    state.working.results = state.working.results.filter((x) => x.id !== resId);

    if (state.activeResultId === resId) {
      state.activeResultId = state.working.results[0]?.id || null;
    }

    if (state.editingKey?.type === "resultContent") state.editingKey = null;

    setDirty(true);
    renderResults();
    updateButtons();
  }

  // =========================
  // Inline edit
  // =========================
  function startInlineEdit(key) {
    state.editingKey = key;
    closeAllMenus();
    renderAll();

    setTimeout(() => {
      bindStopToEditors();

      const title = document.querySelector('[data-edit-title="true"]');
      const single = document.querySelector('[data-edit-input="true"]');
      const content = document.querySelector('[data-edit-content="true"]');

      const first = title || single || content;
      first?.focus();
      first?.select?.();
    }, 0);
  }

  function cancelInlineEdit() {
    state.editingKey = null;
    renderAll();
  }

  // ✅ (변경) questionText 편집 시 itemType도 함께 커밋
  function commitInlineEdit(silent = false) {
    if (!state.editingKey) return;

    const { type, id } = state.editingKey;

    if (type === "surveyEdit") {
      const titleEl = document.querySelector('[data-edit-title="true"]');
      const contentEl = document.querySelector('[data-edit-content="true"]');
      const title = (titleEl?.value || "").trim();
      const content = contentEl?.value || "";

      if (!title) {
        if (!silent) return;
      } else {
        const survey = db.get(id);
        if (survey) {
          survey.title = title;
          survey.content = content;
          if (state.currentSurveyId === id && state.working) {
            state.working.title = title;
            state.working.content = content;
          }
        }
        setDirty(true);
      }

      state.editingKey = null;
      renderAll();
      return;
    }

    // 질문 편집은 text + itemType 2필드이므로 분기 처리
    if (type === "questionText") {
      const textInput = document.querySelector('[data-edit-input="true"]');
      const typeInput = document.querySelector('[data-edit-type="true"]');

      const textValue = (textInput?.value || "").trim();
      const typeValue = (typeInput?.value || "").trim();

      if (!textValue) {
        if (!silent) return;
        state.editingKey = null;
        renderAll();
        return;
      }

      const sec = getActiveSection();
      if (sec) {
        const q = sec.questions.find((x) => x.id === id);
        if (q) {
          q.text = textValue;
          q.itemType = typeValue; // ✅ 추가
        }
      }
      setDirty(true);

      state.editingKey = null;
      renderAll();
      return;
    }

    const input = document.querySelector('[data-edit-input="true"]');
    if (!input) {
      state.editingKey = null;
      renderAll();
      return;
    }

    const value = (input.value || "").trim();
    if (!value) {
      if (!silent) return;
      state.editingKey = null;
      renderAll();
      return;
    }

    if (type === "sectionName") {
      const sec = state.working.sections.find((s) => s.id === id);
      if (sec) sec.name = value;
      setDirty(true);
    }

    if (type === "resultTitle") {
      const r = state.working.results.find((x) => x.id === id);
      if (r) r.title = value;
      setDirty(true);
    }

    state.editingKey = null;
    renderAll();
  }

  // =========================
  // Click handlers
  // =========================
  function onSurveyListClick(e) {
    const menuTrigger = e.target.closest("[data-menu-trigger='true']");
    if (menuTrigger) {
      const root = menuTrigger.closest(".menu-root");
      if (root) toggleMenu(root);
      return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      closeAllMenus();

      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;

      if (action === "edit") {
        if (state.currentSurveyId !== id && db.get(id)) {
          selectSurvey(id, true);
        }
        startInlineEdit({ type: "surveyEdit", id });
      }
      if (action === "delete") deleteSurvey(id);
      if (action === "ok") commitInlineEdit();
      if (action === "cancel") cancelInlineEdit();
      return;
    }

    if (isEditingInputTarget(e.target)) return;

    const item = e.target.closest(".item-base[data-id]");
    if (!item) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();
    selectSurvey(item.dataset.id, false);
  }

  function onSectionListClick(e) {
    const menuTrigger = e.target.closest("[data-menu-trigger='true']");
    if (menuTrigger) {
      const root = menuTrigger.closest(".menu-root");
      if (root) toggleMenu(root);
      return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      closeAllMenus();

      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;

      if (action === "edit") {
        state.activeSectionId = id;
        state.activeQuestionId = null;
        renderQna();
        startInlineEdit({ type: "sectionName", id });
      }
      if (action === "delete") deleteSection(id);
      if (action === "ok") commitInlineEdit();
      if (action === "cancel") cancelInlineEdit();
      return;
    }

    if (isEditingInputTarget(e.target)) return;

    const item = e.target.closest(".item-base[data-id]");
    if (!item) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    state.activeSectionId = item.dataset.id;
    state.activeQuestionId = null;
    renderQna();
    updateButtons();
  }

  function onQuestionListClick(e) {
    const menuTrigger = e.target.closest("[data-menu-trigger='true']");
    if (menuTrigger) {
      const root = menuTrigger.closest(".menu-root");
      if (root) toggleMenu(root);
      return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      closeAllMenus();

      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;

      if (action === "edit") {
        state.activeQuestionId = id;
        renderQna();
        startInlineEdit({ type: "questionText", id });
      }
      if (action === "delete") deleteQuestion(id);
      if (action === "ok") commitInlineEdit();
      if (action === "cancel") cancelInlineEdit();
      return;
    }

    if (isEditingInputTarget(e.target)) return;

    const item = e.target.closest(".item-base[data-id]");
    if (!item) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    state.activeQuestionId = item.dataset.id;
    renderQna();
  }

  function onResultListClick(e) {
    const menuTrigger = e.target.closest("[data-menu-trigger='true']");
    if (menuTrigger) {
      const root = menuTrigger.closest(".menu-root");
      if (root) toggleMenu(root);
      return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      closeAllMenus();

      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;

      if (action === "edit-title") {
        state.activeResultId = id;
        renderResults();
        startInlineEdit({ type: "resultTitle", id });
      }
      if (action === "delete") deleteResult(id);
      if (action === "ok") commitInlineEdit();
      if (action === "cancel") cancelInlineEdit();
      return;
    }

    if (isEditingInputTarget(e.target)) return;

    const item = e.target.closest(".item-base[data-id]");
    if (!item) return;

    finalizeEditBeforeNavigate();
    closeAllMenus();

    state.activeResultId = item.dataset.id;

    if (state.editingKey?.type === "resultContent") state.editingKey = null;

    renderResults();
    updateButtons();
  }

  // =========================
  // Result content edit
  // =========================
  function enterResultContentEdit() {
    if (!ensureSurveySelected()) return;
    const r = getActiveResult();
    if (!r) {
      toast("info", "결과를 먼저 선택하세요.");
      return;
    }

    closeAllMenus();
    state.editingKey = { type: "resultContent", id: r.id };
    renderResults();

    setTimeout(() => {
      bindStopToEditors();
      document.querySelector("#resultLabelInput")?.focus();
    }, 0);
  }

  function cancelResultContentEdit() {
    if (state.editingKey?.type !== "resultContent") return;
    state.editingKey = null;
    renderResults();
  }

  function applyResultContentEdit() {
    if (state.editingKey?.type !== "resultContent") return;
    const r = getActiveResult();
    if (!r) return;

    const label = document.querySelector("#resultLabelInput")?.value || "";
    const content = document.querySelector("#resultContentTextarea")?.value || "";
    r.label = label;
    r.content = content;

    setDirty(true);
    state.editingKey = null;
    renderResults();
  }

  // =========================
  // Payload (UPSERT)
  // =========================
  function toApiPayload(working) {
    const w = deepClone(working);

    return {
      id: w.id,
      testNm: w.title ?? "",
      testDesc: w.content ?? "",
      sections: (w.sections || []).map((sec) => ({
        id: sec.id,
        qstNm: sec.name ?? "",
        questions: (sec.questions || []).map((q) => ({
          id: q.id,
          itemCn: q.text ?? "",
          itemType: q.itemType ?? "", // ✅ (추가) JSON 전송 반영
        })),
      })),
      results: (w.results || []).map((r) => ({
        id: r.id,
        typeCd: r.title ?? "",
        typeNm: r.label ?? "",
        typeCn: r.content ?? "",
      })),
    };
  }

  // =========================
  // SAVE
  // =========================
  async function saveSurvey() {
    if (!state.currentSurveyId || !state.working || !state.dirty) return;

    finalizeEditBeforeNavigate();

    const res = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      text: "현재 작성한 내용을 저장합니다.",
      showCancelButton: true,
      confirmButtonText: "저장",
      cancelButtonText: "취소",
    });

    if (!res.isConfirmed) return;

    const payload = toApiPayload(state.working);
    console.log(payload)
    const ctx = getCtx();
    const isUpdate = isPersistedId(payload.id);

    const beforePersisted = new Set(Array.from(db.keys()).filter((k) => isPersistedId(k)));
    const beforeAll = new Set(Array.from(db.keys()));
    const tempId = String(state.currentSurveyId);
    const tempTitle = String(state.working?.title || "");

    try {
      await axios({
        method: isUpdate ? "PUT" : "POST",
        url: `${ctx}/api/behavior/set`,
        headers: { "Content-Type": "application/json" },
        data: payload,
      });

      if (isUpdate) {
        db.set(state.currentSurveyId, deepClone(state.working));
        setDirty(false);
        await Swal.fire({ icon: "success", title: "저장 완료", timer: 900, showConfirmButton: false });
        renderAll();
        return;
      }

      await Swal.fire({ icon: "success", title: "저장 완료", timer: 900, showConfirmButton: false });

      await reloadFromServer();

      const afterPersisted = Array.from(db.keys()).filter((k) => isPersistedId(k));
      const added = afterPersisted.filter((k) => !beforePersisted.has(k));

      let pick = null;

      if (added.length) {
        pick = added.sort((a, b) => num(b) - num(a))[0];
      }

      if (!pick && tempTitle) {
        const matches = Array.from(db.values()).filter((s) => (s.title || "").trim() === tempTitle.trim());
        if (matches.length) pick = matches.sort((a, b) => num(b.id) - num(a.id))[0]?.id || null;
      }

      if (!pick) {
        const newAny = Array.from(db.keys()).filter((k) => !beforeAll.has(k));
        pick = newAny[0] || Array.from(db.keys())[0] || null;
      }

      if (pick) {
        await selectSurvey(String(pick), true);
      } else {
        renderAll();
      }

      if (db.has(tempId) && !isPersistedId(tempId)) db.delete(tempId);

      setDirty(false);
      renderAll();
    } catch (err) {
      console.error(err);
      await toast("error", "저장에 실패했습니다.");
    }
  }

  async function reloadFromServer() {
    const ctx = getCtx();
    const res = await axios({
      method: "GET",
      url: `${ctx}/api/behavior/set`,
      headers: { "Content-Type": "application/json" },
    });
    hydrateDbFromApi(res.data);
  }

  // =========================
  // Select
  // =========================
  async function selectSurvey(nextId, skipConfirm) {
    if (state.currentSurveyId === nextId) return;

    if (!skipConfirm) {
      const ok = await confirmDiscardIfDirty("설문을 변경하면 작성 내용이 저장되지 않고 삭제됩니다.\n계속할까요?");
      if (!ok) return;
    }

    const survey = db.get(nextId);
    if (!survey) return;

    state.currentSurveyId = nextId;
    state.working = deepClone(survey);

    state.activeSectionId = state.working.sections[0]?.id || null;
    state.activeQuestionId = null;
    state.activeResultId = state.working.results[0]?.id || null;

    state.editingKey = null;
    setDirty(false);

    closeAllMenus();
    renderAll();
  }

  // =========================
  // Render
  // =========================
  function renderAll() {
    renderTabs();
    renderHeader();
    renderSurveyList();
    renderQna();
    renderResults();
    updateButtons();

    setTimeout(() => bindStopToEditors(), 0);
  }

  function renderTabs() {
    dom.tabBtns?.forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
    dom.tabQna?.classList.toggle("active", state.tab === "qna");
    dom.tabResult?.classList.toggle("active", state.tab === "result");
  }

  function renderHeader() {
    const title = state.working?.title || "-";
    if (dom.selectedSurveyTitle) dom.selectedSurveyTitle.textContent = title;

    if (dom.selectedPill) dom.selectedPill.classList.toggle("is-selected", !!state.working);

    if (!state.working) {
      dom.selectedMeta?.classList.add("is-hidden");
      return;
    }

    if (dom.badgeSections) dom.badgeSections.textContent = `문항 ${sectionCount(state.working)}`;
    dom.selectedMeta?.classList.remove("is-hidden");
  }

  function renderSurveyList() {
    if (!dom.surveyList) return;

    dom.surveyList.innerHTML = "";

    const surveys = Array.from(db.values());
    if (dom.surveyMeta) dom.surveyMeta.textContent = String(surveys.length);

    const q = (state.surveyFilter || "").toLowerCase();
    const filtered = q
      ? surveys.filter((s) => {
          const t = (s.title || "").toLowerCase();
          const c = (s.content || "").toLowerCase();
          return t.includes(q) || c.includes(q);
        })
      : surveys;

    if (dom.surveyEmpty) dom.surveyEmpty.classList.toggle("is-hidden", filtered.length > 0);

    filtered.forEach((s) => {
      const isActive = s.id === state.currentSurveyId;
      const isEditing = isSameEditKey({ type: "surveyEdit", id: s.id });

      const el = document.createElement("div");
      el.className = "item-base" + (isActive ? " active" : "") + (isEditing ? " editing" : "");
      el.dataset.id = s.id;

      if (isEditing) {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left item-left--full">
              <input class="inline-field title" data-edit-title="true" value="${escapeAttr(s.title)}" />
              <textarea class="inline-field sub" data-edit-content="true">${escapeHtml(s.content || "")}</textarea>
            </div>
            <div class="item-right">
              <div class="item-actions">
                <button type="button" class="menu-trigger" data-action="ok" data-id="${escapeAttr(s.id)}" title="확인">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button type="button" class="menu-trigger" data-action="cancel" data-id="${escapeAttr(s.id)}" title="취소">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left">
              <div class="item-title">${escapeHtml(s.title)}</div>
              <div class="item-sub">${escapeHtml(s.content || "설명 없음")}</div>
            </div>
            <div class="item-right">
              ${menuTemplate({ editAction: "edit", deleteAction: "delete", id: s.id })}
            </div>
          </div>
        `;
      }

      dom.surveyList.appendChild(el);
    });
  }

  // ✅ (변경) 문항 항목(질문) 보기/편집 렌더링에 itemType 추가
  function renderQna() {
    if (!dom.sectionList || !dom.questionList) return;

    dom.sectionList.innerHTML = "";
    dom.questionList.innerHTML = "";

    const hasSurvey = !!state.currentSurveyId && !!state.working;
    dom.sectionEmpty?.classList.toggle("is-hidden", hasSurvey);

    const sec = getActiveSection();
    setCardTitle(dom.questionTitle, {
      icon: "bi-question-circle",
      title: "문항 항목",
      chipText: sec ? sec.name : "",
      chipIcon: "bi-list-ul",
    });

    if (!hasSurvey) {
      dom.questionEmpty?.classList.remove("is-hidden");
      return;
    }

    state.working.sections.forEach((secItem) => {
      const isActive = secItem.id === state.activeSectionId;
      const isEditing = isSameEditKey({ type: "sectionName", id: secItem.id });

      const el = document.createElement("div");
      el.className = "item-base" + (isActive ? " active" : "") + (isEditing ? " editing" : "");
      el.dataset.id = secItem.id;

      if (isEditing) {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left item-left--full">
              <input class="inline-field title" data-edit-input="true" value="${escapeAttr(secItem.name)}" />
            </div>
            <div class="item-right">
              <div class="item-actions">
                <button type="button" class="menu-trigger" data-action="ok" data-id="${escapeAttr(secItem.id)}" title="확인">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button type="button" class="menu-trigger" data-action="cancel" data-id="${escapeAttr(secItem.id)}" title="취소">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left">
              <div class="item-title">${escapeHtml(secItem.name)}</div>
            </div>
            <div class="item-right">
              <span class="badge">항목 ${secItem.questions.length}</span>
              ${menuTemplate({ editAction: "edit", deleteAction: "delete", id: secItem.id })}
            </div>
          </div>
        `;
      }

      dom.sectionList.appendChild(el);
    });

    if (!sec) {
      dom.questionEmpty?.classList.remove("is-hidden");
      return;
    }
    dom.questionEmpty?.classList.add("is-hidden");

    sec.questions.forEach((q, idx) => {
      const isActive = q.id === state.activeQuestionId;
      const isEditing = isSameEditKey({ type: "questionText", id: q.id });

      const el = document.createElement("div");
      el.className = "item-base compact" + (isActive ? " active" : "") + (isEditing ? " editing" : "");
      el.dataset.id = q.id;

      if (isEditing) {
        // ✅ 편집모드: 텍스트 + itemType 입력 2개
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left item-left--full">
              <div class="q-edit-row">
                <input class="inline-field title" data-edit-input="true" value="${escapeAttr(q.text)}" placeholder="항목 내용" />
                <input class="inline-field type" data-edit-type="true" value="${escapeAttr(q.itemType || "")}" placeholder="itemType" />
              </div>
            </div>
            <div class="item-right">
              <div class="item-actions">
                <button type="button" class="menu-trigger" data-action="ok" data-id="${escapeAttr(q.id)}" title="확인">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button type="button" class="menu-trigger" data-action="cancel" data-id="${escapeAttr(q.id)}" title="취소">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        // ✅ 보기모드: itemType 칩 표시
        const typeText = (q.itemType || "").trim() ? q.itemType.trim() : "TYPE 없음";

        el.innerHTML = `
          <div class="item-row">
            <div class="item-left">
              <div class="item-title">${idx + 1}. ${escapeHtml(q.text)}</div>
            </div>
            <div class="item-right">
              <span class="qtype-chip" title="${escapeAttr(typeText)}"><i class="bi bi-hash"></i>${escapeHtml(typeText)}</span>
              ${menuTemplate({ editAction: "edit", deleteAction: "delete", id: q.id })}
            </div>
          </div>
        `;
      }

      dom.questionList.appendChild(el);
    });
  }

  function renderResults() {
    if (!dom.resultList || !dom.resultDetail) return;

    dom.resultList.innerHTML = "";

    const hasSurvey = !!state.currentSurveyId && !!state.working;
    dom.resultEmpty?.classList.toggle("is-hidden", hasSurvey);

    const r = getActiveResult();

    setCardTitle(dom.resultTitle, {
      icon: "bi-card-text",
      title: "결과 내용",
      chipText: r ? r.title : "",
      chipIcon: "bi-diagram-3",
    });

    if (!hasSurvey) {
      dom.resultDetail.innerHTML = `
        <div class="bs-empty">
          <div class="bs-empty__title">결과를 선택해주세요.</div>
          <div class="bs-empty__desc">좌측에서 검사 종류를 선택하면 결과 항목이 표시됩니다.</div>
        </div>
      `;
      if (dom.btnEditResult) dom.btnEditResult.disabled = true;
      toggleResultHeadButtons(false);
      return;
    }

    state.working.results.forEach((resItem) => {
      const isActive = resItem.id === state.activeResultId;
      const isEditing = isSameEditKey({ type: "resultTitle", id: resItem.id });

      const el = document.createElement("div");
      el.className = "item-base" + (isActive ? " active" : "") + (isEditing ? " editing" : "");
      el.dataset.id = resItem.id;

      if (isEditing) {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left item-left--full">
              <input class="inline-field title" data-edit-input="true" value="${escapeAttr(resItem.title)}" />
            </div>
            <div class="item-right">
              <div class="item-actions">
                <button type="button" class="menu-trigger" data-action="ok" data-id="${escapeAttr(resItem.id)}" title="확인">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button type="button" class="menu-trigger" data-action="cancel" data-id="${escapeAttr(resItem.id)}" title="취소">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="item-row">
            <div class="item-left">
              <div class="item-title">${escapeHtml(resItem.title)}</div>
              <div class="item-sub">${escapeHtml((resItem.label || "").trim() ? resItem.label : "라벨 없음")}</div>
            </div>
            <div class="item-right">
              ${menuTemplate({ editAction: "edit-title", deleteAction: "delete", id: resItem.id })}
            </div>
          </div>
        `;
      }

      dom.resultList.appendChild(el);
    });

    if (!r) {
      dom.resultDetail.innerHTML = `
        <div class="bs-empty">
          <div class="bs-empty__title">결과를 선택해주세요.</div>
          <div class="bs-empty__desc">좌측 목록에서 결과 항목을 클릭하세요.</div>
        </div>
      `;
      if (dom.btnEditResult) dom.btnEditResult.disabled = true;
      toggleResultHeadButtons(false);
      return;
    }

    const isContentEditing = state.editingKey?.type === "resultContent" && state.editingKey?.id === r.id;

    if (dom.btnEditResult) dom.btnEditResult.disabled = false;
    toggleResultHeadButtons(isContentEditing);

    if (isContentEditing) {
      dom.resultDetail.innerHTML = `
        <div class="result-edit">
          <div class="rv-line">
            <div class="rv-line__label"><i class="bi bi-tag"></i> 결과</div>
            <div class="rv-line__field">
              <input id="resultLabelInput" class="rv-line__input" value="${escapeAttr(r.label || "")}" />
            </div>
          </div>

          <div class="rv-section">
            <div class="rv-section__head"><i class="bi bi-card-text"></i> 내용</div>
            <div class="rv-section__body">
              <textarea id="resultContentTextarea" class="result-content-textarea">${escapeHtml(
                r.content || ""
              )}</textarea>
            </div>
          </div>
        </div>
      `;
      return;
    }

    dom.resultDetail.innerHTML = `
      <div class="result-view">
        <div class="rv-line">
          <div class="rv-line__label"><i class="bi bi-tag"></i> 요약내용</div>
          <div class="rv-line__field">
            <div class="rv-line__value">${escapeHtml((r.label || "").trim() ? r.label : "(내용 없음)")}</div>
          </div>
        </div>

        <div class="rv-section">
          <div class="rv-section__head"><i class="bi bi-card-text"></i> 내용</div>
          <div class="rv-section__body">
            <div class="rv-content-box">${escapeHtml((r.content || "").trim() ? r.content : "(내용 없음)")}</div>
          </div>
        </div>
      </div>
    `;
  }

  function toggleResultHeadButtons(isEditing) {
    if (!dom.btnEditResult) return;
    dom.btnEditResult.classList.toggle("is-hidden", !!isEditing);
    dom.btnResultCancelHead?.classList.toggle("is-hidden", !isEditing);
    dom.btnResultOkHead?.classList.toggle("is-hidden", !isEditing);
  }

  function updateButtons() {
    const hasSurvey = !!state.currentSurveyId && !!state.working;
    const hasSection = !!getActiveSection();

    if (dom.btnAddSection) dom.btnAddSection.disabled = !hasSurvey;
    if (dom.btnAddResult) dom.btnAddResult.disabled = !hasSurvey;
    if (dom.btnAddQuestion) dom.btnAddQuestion.disabled = !(hasSurvey && hasSection);
    if (dom.btnSave) dom.btnSave.disabled = !(hasSurvey && state.dirty);
  }

  // =========================
  // Helpers
  // =========================
  function ensureSurveySelected() {
    if (state.currentSurveyId) return true;
    toast("info", "설문을 먼저 선택하세요.");
    return false;
  }

  function setDirty(isDirty) {
    state.dirty = isDirty;
    updateButtons();
    renderHeader();
  }

  function getActiveSection() {
    if (!state.working) return null;
    return state.working.sections.find((s) => s.id === state.activeSectionId) || null;
  }

  function getActiveResult() {
    if (!state.working) return null;
    return state.working.results.find((r) => r.id === state.activeResultId) || null;
  }

  function isSameEditKey(key) {
    return !!state.editingKey && state.editingKey.type === key.type && state.editingKey.id === key.id;
  }

  function makeId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  async function confirmDiscardIfDirty(text) {
    if (!state.dirty) return true;

    const res = await Swal.fire({
      icon: "warning",
      title: "작성 내용이 삭제됩니다",
      text,
      showCancelButton: true,
      confirmButtonText: "계속",
      cancelButtonText: "취소",
    });

    return res.isConfirmed;
  }

  async function confirmDanger(title, text) {
    const res = await Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      confirmButtonColor: "#e03131",
    });

    return res.isConfirmed;
  }

  async function toast(icon, title) {
    await Swal.fire({ icon, title, timer: 900, showConfirmButton: false });
  }

  function isPersistedId(id) {
    return /^\d+$/.test(String(id));
  }

  function sectionCount(survey) {
    return survey?.sections?.length || 0;
  }

  function getCtx() {
    return document.querySelector("meta[name='ctx']")?.content || "";
  }

  function resetSelection() {
    state.currentSurveyId = null;
    state.working = null;
    state.activeSectionId = null;
    state.activeQuestionId = null;
    state.activeResultId = null;
    state.editingKey = null;
    setDirty(false);
  }

  return { init };
})();
