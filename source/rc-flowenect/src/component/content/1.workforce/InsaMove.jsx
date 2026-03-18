import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import styles from "./InsaMove.module.css";
import clsx from "clsx";
import apiClient from "../../../api/apiClient";

// ━━━ 상수 ━━━
const STATUS_CONFIG = {
  대기중:    { bg: "#fff8e6", color: "#b07d00", dot: "#f5a623" },
  승인:      { bg: "#e6f9ee", color: "#4f46e5", dot: "#4f46e5" },
  반려:      { bg: "#fde8ea", color: "#a01c2a", dot: "#dc3545" },
  SUBMITTED: { bg: "#fff8e6", color: "#b07d00", dot: "#f5a623" },
  APPROVED:  { bg: "#e6f9ee", color: "#1a7a3f", dot: "#28a745" },
  REJECTED:  { bg: "#fde8ea", color: "#a01c2a", dot: "#dc3545" },
};

const STATUS_LABEL = {
  SUBMITTED: "대기중",
  APPROVED:  "승인",
  REJECTED:  "반려",
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["대기중"];
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span className={clsx(styles.imBadge)} style={{ background: cfg.bg, color: cfg.color }}>
      <span className={clsx(styles.imBadgeDot)} style={{ background: cfg.dot }} />
      {label}
    </span>
  );
};

const getToday    = () => new Date().toISOString().split("T")[0];
const getMonthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
};

const isPending = (statCd) => statCd === "대기중" || statCd === "SUBMITTED";

// ━━━ 부서코드 → 한글 매핑 ━━━
const DEPT_MAP = {
  "2026HR01": "인사부서",
  "2026PD01": "생산제조부서",
  "2026DV01": "개발1부서",
  "2026DV02": "개발2부서",
  "2026PM01": "서비스기획부서",
  "2026CS01": "고객지원부서",
  "2026MK01": "마케팅부서",
  "2026SL01": "영업부서",
};
const deptName = (cd) => DEPT_MAP[cd] ?? cd;

// ━━━ 직위코드 → 한글 매핑 ━━━
const POS_MAP = {
  "POS_06": "대표",
  "POS_05": "부장",
  "POS_04": "차장",
  "POS_03": "과장",
  "POS_02": "대리",
  "POS_01": "사원",
};
const posName = (cd) => POS_MAP[cd] ?? cd;



// ━━━ 메인 컴포넌트 ━━━
const InsaMove = () => {
  const [activeTab, setActiveTab] = useState("인사이동");
  const [isLoading, setIsLoading] = useState(false);

  // 인사이동 상태
  const [apList, setApList]         = useState([]);
  const [apSelected, setApSelected] = useState([]);
  const [apDetail, setApDetail]     = useState(null);
  const [apSearch, setApSearch]     = useState("");
  const [apStart, setApStart]       = useState(getMonthAgo());
  const [apEnd, setApEnd]           = useState(getToday());

  // 승진 상태
  const [prList, setPrList]         = useState([]);
  const [prSelected, setPrSelected] = useState([]);
  const [prDetail, setPrDetail]     = useState(null);
  const [prSearch, setPrSearch]     = useState("");
  const [prStart, setPrStart]       = useState(getMonthAgo());
  const [prEnd, setPrEnd]           = useState(getToday());

  useEffect(() => {
    fetchApData();
    fetchPrData();
  }, []);

  // 인사이동 목록 조회
  const fetchApData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/transfer/readList");
      setApList(response.data);
      return response.data;
    } catch (error) {
      console.error("인사이동 데이터 로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 승진 목록 조회
  const fetchPrData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/promotion/readList");
      setPrList(response.data);
      return response.data;
    } catch (error) {
      console.error("승진 데이터 로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // ─ 인사이동 필터/통계 ─
  const apFiltered = useMemo(() =>
    apList
      .filter(i =>
        (i.docWrtrEmpNm || "").includes(apSearch) &&
        (!apStart || i.submitDtm >= apStart) &&
        (!apEnd   || i.submitDtm <= apEnd)
      )
      .sort((a, b) =>
        isPending(a.statCd) === isPending(b.statCd) ? 0 : isPending(a.statCd) ? -1 : 1
      ),
  [apList, apSearch, apStart, apEnd]);

  const apStats = useMemo(() => ({
    total:    apList.length,
    waiting:  apList.filter(i => isPending(i.statCd)).length,
    approved: apList.filter(i => i.statCd === "승인" || i.statCd === "APPROVED").length,
    rejected: apList.filter(i => i.statCd === "반려" || i.statCd === "REJECTED").length,
  }), [apList]);

  const apPending    = apFiltered.filter(i => isPending(i.statCd));
  const apAllChecked = apPending.length > 0 && apPending.every(i => apSelected.includes(i.aprvNo));
  const apToggleAll  = (e) => setApSelected(e.target.checked ? apPending.map(i => i.aprvNo) : []);
  const apToggleItem = (id) => setApSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const apProcess = async (status) => {
    if (!apSelected.length) return alert("처리할 항목을 선택해주세요.");
    if (!window.confirm(`${apSelected.length}건을 ${status} 처리하시겠습니까?`)) return;
    try {
      const statCd = status === "승인" ? "APPROVED" : "REJECTED";
      await apiClient.post("/api/transfer/approve/bulk", {
        aprvNos: apSelected,
        statCd,
      });
      // 처리 후 목록 재조회 (DB 반영 결과를 그대로 표시)
      await fetchApData();
      setApSelected([]);
      setApDetail(null);
      alert(`${status} 처리되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const apProcessOne = async (status, item) => {
    if (!window.confirm(`이 건을 ${status} 처리하시겠습니까?`)) return;
    try {
      const statCd = status === "승인" ? "APPROVED" : "REJECTED";
      await apiClient.post("/api/transfer/approve/one", {
        aprvNo: item.aprvNo,
        statCd,
      });
      // 처리 후 목록 재조회 → 반환된 최신 데이터에서 상세 패널 갱신
      const refreshed = await fetchApData();
      const updated = refreshed.find(i => String(i.aprvNo) === String(item.aprvNo));
      setApDetail(updated ?? { ...item, statCd });
      alert(`${status} 처리되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  // ─ 승진 필터/통계 ─
  const prFiltered = useMemo(() =>
    prList
      .filter(i =>
        (i.targetEmpNm || "").includes(prSearch) &&
        (!prStart || i.submitDtm >= prStart) &&
        (!prEnd   || i.submitDtm <= prEnd)
      )
      .sort((a, b) =>
        isPending(a.statCd) === isPending(b.statCd) ? 0 : isPending(a.statCd) ? -1 : 1
      ),
  [prList, prSearch, prStart, prEnd]);

  const prStats = useMemo(() => ({
    total:    prList.length,
    waiting:  prList.filter(i => isPending(i.statCd)).length,
    approved: prList.filter(i => i.statCd === "승인" || i.statCd === "APPROVED").length,
    rejected: prList.filter(i => i.statCd === "반려" || i.statCd === "REJECTED").length,
  }), [prList]);

  const prPending    = prFiltered.filter(i => isPending(i.statCd));
  const prAllChecked = prPending.length > 0 && prPending.every(i => prSelected.includes(i.aprvNo));
  const prToggleAll  = (e) => setPrSelected(e.target.checked ? prPending.map(i => i.aprvNo) : []);
  const prToggleItem = (id) => setPrSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const prProcess = async (status) => {
    if (!prSelected.length) return alert("처리할 항목을 선택해주세요.");
    if (!window.confirm(`${prSelected.length}건을 ${status} 처리하시겠습니까?`)) return;
    try {
      const statCd = status === "승인" ? "APPROVED" : "REJECTED";
      await apiClient.post("/api/promotion/approve/bulk", {
        aprvNos: prSelected,
        statCd,
      });
      await fetchPrData();
      setPrSelected([]);
      setPrDetail(null);
      alert(`${status} 처리되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const prProcessOne = async (status, item) => {
    if (!window.confirm(`이 건을 ${status} 처리하시겠습니까?`)) return;
    try {
      const statCd = status === "승인" ? "APPROVED" : "REJECTED";
      await apiClient.post("/api/promotion/approve/one", {
        aprvNo: item.aprvNo,
        statCd,
      });
      const refreshed = await fetchPrData();
      const updated = refreshed.find(i => String(i.aprvNo) === String(item.aprvNo));
      setPrDetail(updated ?? { ...item, statCd });
      alert(`${status} 처리되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const stats  = activeTab === "인사이동" ? apStats  : prStats;
  const detail = activeTab === "인사이동" ? apDetail : prDetail;

  return (
    <div className={clsx(styles.imRoot)}>
      <div className={clsx(styles.imPageHeader)}>
        <div>
          <div className={clsx(styles.imPageTitle)}>인사이동 관리</div>
          <div className={clsx(styles.imPageSub)}>
            전자결재 완료된 인사이동·승진 신청서를 조회하고 최종 결재합니다
          </div>
        </div>
      </div>

      <div className={clsx(styles.imBody)}>
        <div className={clsx(styles.imLeft)}>
          <div className={clsx(styles.imCard)}>

            {/* 탭 */}
            <div className={clsx(styles.imTabs)}>
              {["인사이동", "승진"].map(key => (
                <button
                  key={key}
                  className={clsx(styles.imTab, { [styles.active]: activeTab === key })}
                  onClick={() => { setActiveTab(key); setApSelected([]); setPrSelected([]); }}
                >
                  <FileText size={14} /> {key}
                </button>
              ))}
            </div>

            {/* 필터 바 */}
            <div className={clsx(styles.imFilterBar)}>
              <div className={clsx(styles.imFilterGroup)}>
                <Calendar size={15} color="#8892a4" />
                <input type="date" className={clsx(styles.imDateInput)}
                  value={activeTab === "인사이동" ? apStart : prStart}
                  onChange={e => activeTab === "인사이동" ? setApStart(e.target.value) : setPrStart(e.target.value)} />
                <span className={clsx(styles.imDateSep)}>~</span>
                <input type="date" className={clsx(styles.imDateInput)}
                  value={activeTab === "인사이동" ? apEnd : prEnd}
                  onChange={e => activeTab === "인사이동" ? setApEnd(e.target.value) : setPrEnd(e.target.value)} />
              </div>
              <div className={clsx(styles.imSearchBox)}>
                <Search size={14} color="#b0b8c8" />
                <input type="text" placeholder="사원명 검색"
                  value={activeTab === "인사이동" ? apSearch : prSearch}
                  onChange={e => activeTab === "인사이동" ? setApSearch(e.target.value) : setPrSearch(e.target.value)} />
              </div>
              <div className={clsx(styles.imFilterActions)}>
                {(activeTab === "인사이동" ? apSelected : prSelected).length > 0 && (
                  <span className={clsx(styles.imSelectedBadge)}>
                    {(activeTab === "인사이동" ? apSelected : prSelected).length}건 선택됨
                  </span>
                )}
                <button className={clsx(styles.imRejectBtn)}
                  onClick={() => activeTab === "인사이동" ? apProcess("반려") : prProcess("반려")}>
                  <XCircle size={14} /> 반려
                </button>
                <button className={clsx(styles.imApproveBtn)}
                  onClick={() => activeTab === "인사이동" ? apProcess("승인") : prProcess("승인")}>
                  <CheckCircle size={14} /> 승인
                </button>
              </div>
            </div>

            {/* 테이블 */}
            <div className={clsx(styles.imTableWrap)}>
              {activeTab === "인사이동" ? (
                <table className={clsx(styles.imTable)}>
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}>
                        <input type="checkbox" checked={apAllChecked} onChange={apToggleAll} />
                      </th>
                      <th>결재번호</th>
                      <th>상신일</th>
                      <th>사원번호</th>
                      <th>사원명</th>
                      <th>변경전 부서</th>
                      <th>변경후 부서</th>
                      <th>발령일</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="9" className={clsx(styles.imEmpty)}>
                        <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> 데이터를 불러오는 중입니다...
                      </td></tr>
                    ) : apFiltered.length === 0 ? (
                      <tr><td colSpan="9" className={clsx(styles.imEmpty)}>조회된 결과가 없습니다</td></tr>
                    ) : apFiltered.map(item => (
                      <tr key={item.aprvNo}
                        className={clsx(
                          apSelected.includes(item.aprvNo) && styles.imRowSelected,
                          !isPending(item.statCd) && styles.imRowProcessed,
                        )}
                        onClick={() => setApDetail(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          {isPending(item.statCd) && (
                            <input type="checkbox"
                              checked={apSelected.includes(item.aprvNo)}
                              onChange={() => apToggleItem(item.aprvNo)} />
                          )}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{item.aprvNo}</td>
                        <td>{item.submitDtm}</td>
                        <td>{item.targetEmpNo}</td>
                        <td className={clsx(styles.imHighlight)}>{item.targetEmpNm}</td>
                        <td>{deptName(item.befDeptCd)}</td>
                        <td className={clsx(styles.imHighlight)}>{deptName(item.aftDeptCd)}</td>
                        <td>{item.effectiveDt}</td>
                        <td><Badge status={item.statCd} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className={clsx(styles.imTable)}>
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}>
                        <input type="checkbox" checked={prAllChecked} onChange={prToggleAll} />
                      </th>
                      <th>결재번호</th>
                      <th>상신일</th>
                      <th>사원번호</th>
                      <th>사원명</th>
                      <th>현재 직위</th>
                      <th>승진 직위</th>
                      <th>발효일</th>
                      <th>승진 사유</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="10" className={clsx(styles.imEmpty)}>
                        <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> 데이터를 불러오는 중입니다...
                      </td></tr>
                    ) : prFiltered.length === 0 ? (
                      <tr><td colSpan="10" className={clsx(styles.imEmpty)}>조회된 결과가 없습니다</td></tr>
                    ) : prFiltered.map(item => (
                      <tr key={item.aprvNo}
                        className={clsx(
                          prSelected.includes(item.aprvNo) && styles.imRowSelected,
                          !isPending(item.statCd) && styles.imRowProcessed,
                        )}
                        onClick={() => setPrDetail(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          {isPending(item.statCd) && (
                            <input type="checkbox"
                              checked={prSelected.includes(item.aprvNo)}
                              onChange={() => prToggleItem(item.aprvNo)} />
                          )}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{item.aprvNo}</td>
                        <td>{item.submitDtm}</td>
                        <td>{item.targetEmpNo}</td>
                        <td className={clsx(styles.imHighlight)}>{item.targetEmpNm}</td>
                        <td>{posName(item.currentPosCd)}</td>
                        <td className={clsx(styles.imHighlight)} style={{ color: "#8b5cf6" }}>↑ {posName(item.targetPosCd)}</td>
                        <td>{item.effectiveDtm}</td>
                        <td className={clsx(styles.imReasonCell)} title={item.reason}>{item.reason}</td>
                        <td><Badge status={item.statCd} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── 오른쪽 패널 ── */}
        <div className={clsx(styles.imRight)}>
          <div className={clsx(styles.imStatsCard)}>
            <div className={clsx(styles.imStatsCardHeader)}>
              <span className={clsx(styles.imStatsCardTitle)}>현황 요약</span>
            </div>
            <div className={clsx(styles.imStatsGrid)}>
              <div className={clsx(styles.imStatItem, styles.blue)}>
                <span className={clsx(styles.imStatNum)}>{stats.total}</span>
                <span className={clsx(styles.imStatLabel)}>전체 건수</span>
              </div>
              <div className={clsx(styles.imStatItem, styles.amber)}>
                <span className={clsx(styles.imStatNum)}>{stats.waiting}</span>
                <span className={clsx(styles.imStatLabel)}>대기중</span>
              </div>
              <div className={clsx(styles.imStatItem, styles.green)}>
                <span className={clsx(styles.imStatNum)}>{stats.approved}</span>
                <span className={clsx(styles.imStatLabel)}>승인 완료</span>
              </div>
              <div className={clsx(styles.imStatItem, styles.red)}>
                <span className={clsx(styles.imStatNum)}>{stats.rejected}</span>
                <span className={clsx(styles.imStatLabel)}>반려</span>
              </div>
            </div>
          </div>

          <div className={clsx(styles.imDetailCard)}>
            <div className={clsx(styles.imDetailCardHeader)}>
              <span className={clsx(styles.imDetailCardTitle)}>상세 정보</span>
              {detail && <Badge status={detail.statCd} />}
            </div>

            {!detail ? (
              <div className={clsx(styles.imEmptyDetail)}>
                목록에서 항목을 선택하면<br />상세 정보가 표시됩니다
              </div>
            ) : activeTab === "인사이동" ? (
              <div className={clsx(styles.imPanelBody)}>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>결재번호</div>
                  <div className={clsx(styles.imFieldValue)} style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {detail.aprvNo}
                  </div>
                </div>
                <div className={clsx(styles.imFieldRow)}>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>사원번호</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.targetEmpNo}</div>
                  </div>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>사원명</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.targetEmpNm}</div>
                  </div>
                </div>
                {/* 변경전/후 부서 */}
                <div className={clsx(styles.imFieldRow)}>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>변경전 부서</div>
                    <div className={clsx(styles.imFieldValue)}>{deptName(detail.befDeptCd)}</div>
                  </div>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>변경후 부서</div>
                    <div className={clsx(styles.imFieldValue, styles.imFieldValueAccent)}>{deptName(detail.aftDeptCd)}</div>
                  </div>
                </div>
                {/* 상신일 / 발령일 */}
                <div className={clsx(styles.imFieldRow)}>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>상신일</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.submitDtm}</div>
                  </div>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>발령일</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.effectiveDt}</div>
                  </div>
                </div>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>기안자</div>
                  <div className={clsx(styles.imFieldValue)}>{detail.drafter}</div>
                </div>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>사유</div>
                  <div className={clsx(styles.imFieldValue, styles.imFieldValueReason)}>{detail.reason}</div>
                </div>
                {isPending(detail.statCd) && (
                  <div className={clsx(styles.imDetailActions)}>
                    <button className={clsx(styles.imApproveBtn)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => apProcessOne("승인", detail)}>
                      <CheckCircle size={14} /> 승인
                    </button>
                    <button className={clsx(styles.imRejectBtn)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => apProcessOne("반려", detail)}>
                      <XCircle size={14} /> 반려
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={clsx(styles.imPanelBody)}>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>결재번호</div>
                  <div className={clsx(styles.imFieldValue)} style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {detail.aprvNo}
                  </div>
                </div>
                <div className={clsx(styles.imFieldRow)}>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>사원번호</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.targetEmpNo}</div>
                  </div>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>사원명</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.targetEmpNm}</div>
                  </div>
                </div>
                <div className={clsx(styles.imPromotionCard)}>
                  <div className={clsx(styles.imPromotionFrom)}>
                    <div className={clsx(styles.imFieldLabel)}>현재 직위</div>
                    <div className={clsx(styles.imPromotionPos)}>{posName(detail.currentPosCd)}</div>
                  </div>
                  <div className={clsx(styles.imPromotionArrowIcon)}>→</div>
                  <div className={clsx(styles.imPromotionTo)}>
                    <div className={clsx(styles.imFieldLabel)}>승진 직위</div>
                    <div className={clsx(styles.imPromotionPos, styles.imPromotionPosHighlight)}>{posName(detail.targetPosCd)}</div>
                  </div>
                </div>
                <div className={clsx(styles.imFieldRow)}>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>상신일</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.submitDtm}</div>
                  </div>
                  <div className={clsx(styles.imFieldGroup)}>
                    <div className={clsx(styles.imFieldLabel)}>발효일</div>
                    <div className={clsx(styles.imFieldValue)}>{detail.effectiveDt}</div>
                  </div>
                </div>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>기안자</div>
                  <div className={clsx(styles.imFieldValue)}>{detail.writerNm} · {detail.writerPos}</div>
                </div>
                <div className={clsx(styles.imFieldGroup)}>
                  <div className={clsx(styles.imFieldLabel)}>승진 사유</div>
                  <div className={clsx(styles.imFieldValue, styles.imFieldValueReason)}>{detail.reason}</div>
                </div>
                {isPending(detail.statCd) && (
                  <div className={clsx(styles.imDetailActions)}>
                    <button className={clsx(styles.imApproveBtn)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => prProcessOne("승인", detail)}>
                      <CheckCircle size={14} /> 승인
                    </button>
                    <button className={clsx(styles.imRejectBtn)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => prProcessOne("반려", detail)}>
                      <XCircle size={14} /> 반려
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsaMove;