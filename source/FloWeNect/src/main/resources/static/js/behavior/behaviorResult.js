/* global Swal, axios, agGrid */

document.addEventListener("DOMContentLoaded", () => {
  BehaviorResult.init();
});

const BehaviorResult = (() => {
  const dom = {};
  const state = {
    selectedDept: "ALL",
    selectedEmp: null, // {empNo, empNm, deptNm, posNm, deptCd}
    selectedTestNo: "",
    startDate: "",
    endDate: "",

    rspnsList: [],
    gridApi: null,
  };

  function init() {
    cacheDom();
    bindEvents();
    boot();
  }

  function cacheDom() {
    dom.ctx = document.querySelector("meta[name='ctx']")?.content || "";

    dom.deptSelect = document.getElementById("deptSelect");
    dom.empList = document.getElementById("empList");
    dom.empMeta = document.getElementById("empMeta");
    dom.empEmpty = document.getElementById("empEmpty");

    dom.selectedEmpName = document.getElementById("selectedEmpName");

    dom.testSelect = document.getElementById("testSelect");
    dom.startDate = document.getElementById("startDate");
    dom.endDate = document.getElementById("endDate");
    dom.btnHalf = document.getElementById("btnHalf");
    dom.btnReload = document.getElementById("btnReload");

    dom.rspnsGrid = document.getElementById("rspnsGrid");
    dom.rspnsEmpty = document.getElementById("rspnsEmpty");

    dom.detailModal = document.getElementById("detailModal");
    dom.detailBody = document.getElementById("detailBody");
    dom.detailTitle = document.getElementById("detailTitle");
  }

  function bindEvents() {
    dom.deptSelect?.addEventListener("change", (e) => {
      state.selectedDept = e.target.value || "ALL";
      filterEmpList();
      clearSelection();
    });

    dom.empList?.addEventListener("click", (e) => {
      const card = e.target.closest(".bt-person");
      if (!card) return;

      const empNo = card.dataset.empNo;
      const empNm = card.dataset.empNm;
      const deptNm = card.dataset.deptNm;
      const posNm = card.dataset.posNm;
      const deptCd = card.dataset.deptCd;
      if (!empNo) return;

      state.selectedEmp = { empNo, empNm, deptNm, posNm, deptCd };
      highlightSelectedEmp();
      renderSelectedEmp();

      // 사원 선택 시 즉시 조회(기존 UX 유지)
      syncFilterStateFromDom();
      loadRspns();
    });

    // 필터 변경 시 즉시 조회하지 않음 (조회 버튼 클릭 시에만 조회)
    dom.testSelect?.addEventListener("change", (e) => {
      state.selectedTestNo = e.target.value || "";
    });

    dom.startDate?.addEventListener("change", () => {
      state.startDate = dom.startDate.value;
    });

    dom.endDate?.addEventListener("change", () => {
      state.endDate = dom.endDate.value;
    });

    dom.btnHalf?.addEventListener("click", () => {
      setHalfRange(); // 값만 변경
    });

    dom.btnReload?.addEventListener("click", () => {
      if (!state.selectedEmp) return;
      syncFilterStateFromDom();
      loadRspns();
    });

    dom.detailModal?.addEventListener("click", (e) => {
      const close = e.target.closest("[data-close='true']");
      if (close) closeDetailModal();
    });
  }

  function boot() {
    setHalfRange();
    filterEmpList();
    renderSelectedEmp();
    initGrid();
    setGridRows([]);
  }

  function setHalfRange() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const firstHalf = m <= 6;
    const s = firstHalf ? `${y}-01-01` : `${y}-07-01`;
    const e = firstHalf ? `${y}-07-01` : `${y + 1}-01-01`;
    state.startDate = s;
    state.endDate = e;
    if (dom.startDate) dom.startDate.value = s;
    if (dom.endDate) dom.endDate.value = e;
  }

  function syncFilterStateFromDom() {
    state.selectedTestNo = dom.testSelect?.value || "";
    state.startDate = dom.startDate?.value || "";
    state.endDate = dom.endDate?.value || "";
  }

  function filterEmpList() {
    const cards = dom.empList?.querySelectorAll(".bt-person") || [];
    let visible = 0;

    cards.forEach((c) => {
      const deptCd = c.dataset.deptCd || "";
      const ok = state.selectedDept === "ALL" ? true : deptCd === state.selectedDept;
      c.classList.toggle("is-hidden", !ok);
      if (ok) visible += 1;
    });

    if (dom.empMeta) dom.empMeta.textContent = String(visible);
    dom.empEmpty?.classList.toggle("is-hidden", visible > 0);
  }

  function clearSelection() {
    state.selectedEmp = null;
    highlightSelectedEmp();
    renderSelectedEmp();
    setGridRows([]);
  }

  function highlightSelectedEmp() {
    const cards = dom.empList?.querySelectorAll(".bt-person") || [];
    cards.forEach((c) => {
      const isActive = state.selectedEmp && c.dataset.empNo === state.selectedEmp.empNo;
      c.classList.toggle("active", !!isActive);
    });
  }

  function renderSelectedEmp() {
    if (!state.selectedEmp) {
      if (dom.selectedEmpName) dom.selectedEmpName.textContent = "-";
      return;
    }
    if (dom.selectedEmpName) dom.selectedEmpName.textContent = state.selectedEmp.empNm || "-";
  }

  /* =========================
     ✅ AG Grid (Quartz)
     ========================= */

  function initGrid() {
    if (!dom.rspnsGrid) return;

    const columnDefs = [
      {
        headerName: "응답일시",
        field: "rspnsDtm",
        width: 160,
        sortable: true,
        cellRenderer: (p) => {
          const v = p.data?.rspnsDtm;
          const { date, time } = splitDateTime(v);

          const wrap = document.createElement("div");
          wrap.className = "br-cell__dt";
          wrap.innerHTML = `
            <div class="br-cell__dtDate">${escapeHtml(date)}</div>
            <div class="br-cell__dtTime">${escapeHtml(time)}</div>
          `;
          return wrap;
        },
      },
      {
        headerName: "설문",
        field: "testNm",
        flex: 1,
        minWidth: 240,
        cellRenderer: (p) => {
          const testNm = escapeHtml(p.data?.testNm || "-");
          const wrap = document.createElement("div");
          wrap.className = "br-cell__test";
          wrap.innerHTML = `<div class="br-cell__testTitle">${testNm}</div>`;
          return wrap;
        },
      },
      {
        headerName: "응답자",
        field: "rspnrEmpNm",
        flex: 1,
        minWidth: 240,
        headerClass: "br-hc--center",
        cellClass: "br-col--center",
        cellRenderer: (p) => {
          const nm = escapeHtml(p.data?.rspnrEmpNm || "-");
          const dept = escapeHtml(p.data?.rspnrDeptNm || "-");
          const pos = escapeHtml(p.data?.rspnrPosNm || "-");
          const el = document.createElement("div");
          el.className = "br-cell__rspnr";
          el.textContent = `${nm} (${dept} · ${pos})`;
          return el;
        },
      },
      {
        headerName: "행동유형결과",
        field: "actnTypeRslt",
        width: 160,
        headerClass: "br-hc--center",
        cellClass: "br-col--center",
        cellRenderer: (p) => {
          const act = escapeHtml(p.data?.actnTypeRslt || "-");
          const span = document.createElement("span");
          span.className = "bt-chip bt-chip--primary";
          span.textContent = act;
          return span;
        },
      },
      {
        headerName: "작업",
        field: "rspnsNo",
        width: 140,
        sortable: false,
        headerClass: "br-hc--center",
        cellClass: "br-col--center",
        cellRenderer: (p) => {
          const rspnsNo = Number(p.data?.rspnsNo || 0);
          const wrap = document.createElement("div");
          wrap.className = "br-cell__actions";

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "bt-btn bt-btn--ghost bt-btn--sm";
          btn.innerHTML = `<i class="bi bi-search"></i><span>상세보기</span>`;
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (rspnsNo) openDetail(rspnsNo);
          });

          wrap.appendChild(btn);
          return wrap;
        },
      },
    ];

    const gridOptions = {
      columnDefs,
      defaultColDef: {
        resizable: false,
        sortable: true,
      },
      rowData: [],
      rowHeight: 44,
      headerHeight: 44,
      animateRows: true,
      suppressCellFocus: true,
      overlayLoadingTemplate: `<span class="bt-table__muted">불러오는 중...</span>`,
      overlayNoRowsTemplate: `<span class="bt-table__muted">결과가 없습니다</span>`,
    };

    try {
      // v31+ : agGrid.createGrid
      if (agGrid?.createGrid) {
        state.gridApi = agGrid.createGrid(dom.rspnsGrid, gridOptions);
        state.gridApi?.sizeColumnsToFit?.();
        return;
      }
      // legacy : new agGrid.Grid + api 획득
      if (agGrid?.Grid) {
        new agGrid.Grid(dom.rspnsGrid, gridOptions);
        state.gridApi = gridOptions.api || null;
        state.gridApi?.sizeColumnsToFit?.();
      }
    } catch (e) {
      console.error("AG Grid init failed:", e);
    }
  }

  function setGridRows(rows) {
    const list = Array.isArray(rows) ? rows : [];
    state.rspnsList = list;

    // fallback empty
    dom.rspnsEmpty?.classList.toggle("is-hidden", list.length > 0);

    if (!state.gridApi) return;

    // rowData 세팅 (버전별 호환)
    if (typeof state.gridApi.setRowData === "function") {
      state.gridApi.setRowData(list);
    } else if (typeof state.gridApi.setGridOption === "function") {
      state.gridApi.setGridOption("rowData", list);
    }

    if (list.length === 0) state.gridApi.showNoRowsOverlay?.();
    else state.gridApi.hideOverlay?.();
  }

  function setGridLoading(isLoading) {
    if (!state.gridApi) return;
    if (isLoading) state.gridApi.showLoadingOverlay?.();
    else state.gridApi.hideOverlay?.();
  }

  /* =========================
     ✅ Load list
     ========================= */

  async function loadRspns() {
    if (!state.selectedEmp) return;

    if (state.startDate && state.endDate && state.startDate > state.endDate) {
      await Swal.fire({
        icon: "warning",
        title: "기간을 확인해주세요",
        text: "시작일이 종료일보다 늦습니다.",
      });
      return;
    }

    try {
      setGridLoading(true);
      dom.rspnsEmpty?.classList.add("is-hidden");

      const res = await axios({
        method: "GET",
        url: `${dom.ctx}/api/behavior/result/rspns`,
        params: {
          empNo: state.selectedEmp.empNo,
          testNo: state.selectedTestNo || undefined,
          startDate: state.startDate || undefined,
          endDate: state.endDate || undefined,
        },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setGridRows(list);
    } catch (err) {
      console.error(err);
      setGridRows([]);
      await Swal.fire({
        icon: "error",
        title: "목록 조회 실패",
        text: "설문 결과 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setGridLoading(false);
    }
  }

  /* =========================
     상세 모달 (기존 유지)
     ========================= */

  async function openDetail(rspnsNo) {
    try {
      if (dom.detailTitle) dom.detailTitle.textContent = "상세보기";
      if (dom.detailBody) {
        dom.detailBody.innerHTML = `
          <div class="bt-empty">
            <div class="bt-empty__title">불러오는 중...</div>
            <div class="bt-empty__desc">잠시만 기다려주세요.</div>
          </div>
        `;
      }
      openDetailModal();

      const res = await axios({
        method: "GET",
        url: `${dom.ctx}/api/behavior/result/detail`,
        params: { rspnsNo },
      });

      renderDetail(res.data);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "상세 조회 실패",
        text: "상세 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      });
      closeDetailModal();
    }
  }

  function renderDetail(data) {
    const mst = data?.mst;
    const type = data?.type;
    const answers = Array.isArray(data?.answers) ? data.answers : [];
    if (!dom.detailBody) return;

    if (!mst) {
      dom.detailBody.innerHTML = `
        <div class="bt-empty">
          <div class="bt-empty__title">데이터가 없습니다</div>
          <div class="bt-empty__desc">응답 정보를 찾지 못했습니다.</div>
        </div>
      `;
      return;
    }

    if (dom.detailTitle) dom.detailTitle.textContent = `${mst.testNm || "설문"} · 결과 상세`;

    const head = `
      <div class="bt-kv">
        <div class="bt-kv__k">응답일시</div><div class="bt-kv__v">${escapeHtml(formatDateTime(mst.rspnsDtm))}</div>
        <div class="bt-kv__k">응답자</div><div class="bt-kv__v">${escapeHtml(mst.rspnrEmpNm || "-")} (${escapeHtml(mst.rspnrDeptNm || "-")} · ${escapeHtml(mst.rspnrPosNm || "-")})</div>
        <div class="bt-kv__k">대상자</div><div class="bt-kv__v">${escapeHtml(mst.trgtEmpNm || "-")} (${escapeHtml(mst.trgtDeptNm || "-")} · ${escapeHtml(mst.trgtPosNm || "-")})</div>
        <div class="bt-kv__k">행동유형결과</div><div class="bt-kv__v">${escapeHtml(mst.actnTypeRslt || "-")}</div>
      </div>
      <div style="height:10px"></div>
    `;

    const byQ = new Map();
    answers.forEach((a) => {
      const key = String(a.qstNo ?? "");
      if (!byQ.has(key)) byQ.set(key, { qstNo: a.qstNo, qstNm: a.qstNm, rows: [] });
      byQ.get(key).rows.push(a);
    });

    const reportTitle = type?.typeNm ? `${escapeHtml(type.typeNm)} 리포트` : "리포트";
    const reportBody = type?.typeCn ? escapeHtmlKeepBreaks(type.typeCn) : `<div class="bt-table__muted">리포트 내용이 없습니다.</div>`;

    const reportSection = `
      <details class="br-acc" open>
        <summary class="br-acc__sum">
          <div class="br-acc__ttl"><i class="bi bi-file-text"></i> ${reportTitle}</div>
          <div class="br-acc__sub">
            <span class="bt-chip bt-chip--primary">${escapeHtml(type?.typeCd || mst.actnTypeRslt || "-")}</span>
          </div>
        </summary>
        <div class="br-acc__body">
          <div class="br-report">${reportBody}</div>
        </div>
      </details>
    `;

    const answerSections = Array.from(byQ.values())
      .sort((a, b) => Number(a.qstNo) - Number(b.qstNo))
      .map((q, idx) => {
        const rows = (q.rows || [])
          .sort((a, b) => Number(a.itemNo) - Number(b.itemNo))
          .map((r) => {
            return `
              <div class="bt-ansRow">
                <div class="bt-ansRow__txt">${escapeHtml(r.itemCn || "-")}</div>
                <div class="bt-ansRow__score">${escapeHtml(String(r.rspnsVal ?? "-"))}점</div>
              </div>
            `;
          })
          .join("");

        return `
          <details class="br-acc">
            <summary class="br-acc__sum">
              <div class="br-acc__ttl"><i class="bi bi-list-check"></i> ${idx + 1}. ${escapeHtml(q.qstNm || "-")}</div>
            </summary>
            <div class="br-acc__body">
              ${rows || `<div class="bt-empty"><div class="bt-empty__title">항목이 없습니다</div></div>`}
            </div>
          </details>
        `;
      })
      .join("");

    const answersWrap = answerSections || `
      <div class="bt-empty">
        <div class="bt-empty__title">상세 항목이 없습니다</div>
        <div class="bt-empty__desc">응답 결과가 비어있습니다.</div>
      </div>
    `;

    dom.detailBody.innerHTML = head + reportSection + `<div style="height:10px"></div>` + answersWrap;
  }

  function openDetailModal() {
    dom.detailModal?.classList.add("is-open");
    dom.detailModal?.setAttribute("aria-hidden", "false");
  }

  function closeDetailModal() {
    dom.detailModal?.classList.remove("is-open");
    dom.detailModal?.setAttribute("aria-hidden", "true");
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

  // ✅ 응답일시를 날짜/시간으로 분리
  function splitDateTime(v) {
    if (!v) return { date: "-", time: "" };

    if (typeof v === "string") {
      const s = v.trim();
      const parts = s.split(" ");
      const date = parts[0] || "-";
      const time = parts[1] || "";
      return { date, time };
    }

    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return { date: String(v), time: "" };

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}:${ss}` };
    } catch (_) {
      return { date: String(v), time: "" };
    }
  }

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
