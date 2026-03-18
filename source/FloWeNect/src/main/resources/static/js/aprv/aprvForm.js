document.addEventListener('DOMContentLoaded', function () {
  let root = document;

  let formEl = root.querySelector('form.aprv-form');
  if (!formEl) return;

  // ===== 0) 공통 유틸 =====

  let selectAllOptions = function (sel) {
    if (!sel) return;
    let opts = sel.querySelectorAll('option');
    opts.forEach(function (o) {
      if (!o.value) return;
      o.selected = true;
    });
  };

  let safeRequestSubmit = function () {
    if (typeof formEl.requestSubmit === 'function') {
      formEl.requestSubmit();
      return;
    }
    let tmp = root.createElement('button');
    tmp.type = 'submit';
    tmp.style.display = 'none';
    formEl.appendChild(tmp);
    tmp.click();
    tmp.remove();
  };

  let formCdSelect = root.getElementById('formCdSelect');

  // ===== 0-1) 제목/내용 기본값(양식별) =====
  let getDefaultDocMeta = function (formCd) {
    let map = {
      'LEAVE':       { title: '휴가 신청의 건',     content: '다음의 내용으로 휴가신청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' },
      'APPOINTMENT': { title: '발령 요청의 건',     content: '다음의 내용으로 발령요청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' },
      'HEADCOUNT':   { title: '인원충원 요청의 건', content: '다음의 내용으로 인원충원요청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' },
      'LOA':         { title: '휴직 신청의 건',     content: '다음의 내용으로 휴직신청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' },
      'PROMOTION':   { title: '승진 요청의 건',     content: '다음의 내용으로 승진요청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' },
      'RETIRE':      { title: '퇴직 신청의 건',     content: '다음의 내용으로 퇴직신청서를 제출하오니, 검토 후 재가하여 주시기 바랍니다.' }
    };
    return map[formCd] || { title: '', content: '' };
  };

  let applyDefaultTitleAndContentIfEmpty = function (formCd) {
    let ttlEl = root.getElementById('aprvTtl');
    let cnEl = root.getElementById('aprvCn');
    let meta = getDefaultDocMeta(formCd);
    if (ttlEl) { let cur = (ttlEl.value || '').trim(); if (!cur && meta.title) ttlEl.value = meta.title; }
    if (cnEl)  { let cur = (cnEl.value  || '').trim(); if (!cur && meta.content) cnEl.value = meta.content; }
  };

  let applyDefaultTitleAndContentOnFormChange = function (prevFormCd, nextFormCd) {
    let ttlEl = root.getElementById('aprvTtl');
    let cnEl = root.getElementById('aprvCn');
    let prevMeta = getDefaultDocMeta(prevFormCd);
    let nextMeta = getDefaultDocMeta(nextFormCd);
    if (ttlEl && nextMeta.title) {
      let cur = (ttlEl.value || '').trim();
      if (!cur || cur === (prevMeta.title || '').trim()) ttlEl.value = nextMeta.title;
    }
    if (cnEl && nextMeta.content) {
      let cur = (cnEl.value || '').trim();
      if (!cur || cur === (prevMeta.content || '').trim()) cnEl.value = nextMeta.content;
    }
  };

  let applyFormPane = function (formCd) {
    let host = formEl.querySelector('#formHost');
    if (!host) return;
    let panes = host.querySelectorAll('.aprv-formpane');
    panes.forEach(function (p) {
      let isTarget = p.getAttribute('data-form') === formCd;
      p.style.display = isTarget ? 'block' : 'none';
      let ctrls = p.querySelectorAll('input, select, textarea');
      ctrls.forEach(function (c) { c.disabled = !isTarget; });
    });
    let titleText = formEl.querySelector('#formTitleText');
    if (titleText && formCdSelect) {
      titleText.textContent = formCdSelect.options[formCdSelect.selectedIndex].text;
    }
  };

  let resetInputsInPane = function (formCd) {
    let host = formEl.querySelector('#formHost');
    if (!host) return;
    let target = host.querySelector('.aprv-formpane[data-form="' + formCd + '"]');
    if (!target) return;
    let inputs = target.querySelectorAll('input, select, textarea');
    inputs.forEach(function (i) {
      if (i.type === 'radio' || i.type === 'checkbox') i.checked = false;
      else i.value = '';
    });
  };

  // ===== 1) 양식 변경 Confirm → SweetAlert2 =====
  if (formCdSelect) {
    formCdSelect.addEventListener('change', async function () {
      let nextFormCd = formCdSelect.value;
      let prevFormCdInput = formEl.querySelector('input[name="prevFormCd"]');
      let prevFormCd = prevFormCdInput ? prevFormCdInput.value : '';

      if (nextFormCd === prevFormCd) return;

      // ✅ SweetAlert2 confirm
      const result = await Swal.fire({
        icon: 'warning',
        title: '양식 변경',
        text: '양식을 변경하면 우측 입력내용이 초기화됩니다. 변경하시겠습니까?',
        showCancelButton: true,
        confirmButtonText: '변경',
        cancelButtonText: '취소'
      });

      if (!result.isConfirmed) {
        formCdSelect.value = prevFormCd;
        return;
      }

      let hiddenFormCd = formEl.querySelector('input[name="formCd"]');
      if (hiddenFormCd) hiddenFormCd.value = nextFormCd;

      applyDefaultTitleAndContentOnFormChange(prevFormCd, nextFormCd);
      if (prevFormCdInput) prevFormCdInput.value = nextFormCd;

      applyFormPane(nextFormCd);
      resetInputsInPane(nextFormCd);
    });
  }

  let hiddenFormCd = formEl.querySelector('input[name="formCd"]');
  applyFormPane(hiddenFormCd ? hiddenFormCd.value : (formCdSelect ? formCdSelect.value : 'LEAVE'));
  applyDefaultTitleAndContentIfEmpty(hiddenFormCd ? hiddenFormCd.value : (formCdSelect ? formCdSelect.value : 'LEAVE'));

  // ===== 2) 임시저장/상신 → SweetAlert2 =====
  let submitWithType = async function (actionType) {
    let actionTypeInput = formEl.querySelector('input[name="actionType"]');
    if (actionTypeInput) actionTypeInput.value = actionType;

    if (actionType === 'SUBMIT') {
      let hiddenHost = formEl.querySelector('#approverHidden');
      let hasApprover = hiddenHost && hiddenHost.querySelectorAll('input[name="approverEmpNoList"]').length > 0;

      if (!hasApprover) {
        // ✅ SweetAlert2 alert
        await Swal.fire({
          icon: 'warning',
          title: '결재라인 없음',
          text: '상신하려면 결재라인을 최소 1명 이상 추가해야 합니다.',
          confirmButtonText: '확인'
        });
        return;
      }

      // ✅ SweetAlert2 confirm
      const result = await Swal.fire({
        icon: 'question',
        title: '상신 확인',
        text: '상신 후에는 결재라인 변경이 불가합니다. 상신하시겠습니까?',
        showCancelButton: true,
        confirmButtonText: '상신',
        cancelButtonText: '취소'
      });
      if (!result.isConfirmed) return;
    }

    selectAllOptions(root.getElementById('rcvEmpNos'));
    selectAllOptions(root.getElementById('refEmpNos'));
    safeRequestSubmit();
  };

  let btnTempSave = root.getElementById('btnTempSave');
  if (btnTempSave) {
    btnTempSave.addEventListener('click', function () { submitWithType('TEMP_SAVE'); });
  }
  let btnSubmit = root.getElementById('btnSubmit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () { submitWithType('SUBMIT'); });
  }

  // ===== 3) 결재자 리스트 =====
  let picker = root.getElementById('approverPicker');
  let list = root.getElementById('approverList');
  let hidden = root.getElementById('approverHidden');

  let renumber = function () {
    if (!list) return;
    let rows = list.querySelectorAll('.aprv-lineitem');
    rows.forEach(function (r, i) {
      let step = r.querySelector('.aprv-lineitem__step');
      if (step) step.textContent = String(i + 1) + '차';
    });
  };

  let hidePickerOption = function (empNo) {
    if (!picker || !empNo) return;
    let opt = picker.querySelector('option[value="' + empNo + '"]');
    if (opt) opt.style.display = 'none';
  };

  let showPickerOption = function (empNo) {
    if (!picker || !empNo) return;
    let opt = picker.querySelector('option[value="' + empNo + '"]');
    if (opt) opt.style.display = '';
  };

  let addApprover = async function () {
    if (!picker || !picker.value) return;

    let empNo = picker.value;
    let label = picker.options[picker.selectedIndex].text;

    let exists = hidden && hidden.querySelector('input[name="approverEmpNoList"][value="' + empNo + '"]');
    if (exists) {
      // ✅ SweetAlert2 alert
      await Swal.fire({
        icon: 'warning',
        title: '중복 결재자',
        text: '이미 추가된 결재자입니다.',
        confirmButtonText: '확인'
      });
      picker.value = '';
      return;
    }

    if (list) {
      let row = root.createElement('div');
      row.className = 'aprv-lineitem';
      row.setAttribute('data-emp-no', empNo);
      row.innerHTML = ''
        + '<div class="aprv-lineitem__step">' + (list.children.length + 1) + '차</div>'
        + '<div class="aprv-lineitem__main">'
        + '  <div class="aprv-lineitem__name">' + label + '</div>'
        + '  <div class="aprv-lineitem__sub">결재 예정</div>'
        + '</div>'
        + '<div class="aprv-lineitem__stat">'
        + '  <button type="button" class="aprv-btn aprv-btn--ghost" data-action="remove-approver">삭제</button>'
        + '</div>';
      list.appendChild(row);
    }

    if (hidden) {
      let input = root.createElement('input');
      input.type = 'hidden';
      input.name = 'approverEmpNoList';
      input.value = empNo;
      hidden.appendChild(input);
    }

    hidePickerOption(empNo);
    picker.value = '';
    renumber();
  };

  let addApproverByEmpNo = function (empNo) {
    if (!picker || !empNo) return;
    let exists = hidden && hidden.querySelector('input[name="approverEmpNoList"][value="' + empNo + '"]');
    if (exists) return;
    let opt = picker.querySelector('option[value="' + empNo + '"]');
    if (!opt) return;
    picker.value = empNo;
    addApprover();
  };

  let removeApprover = function (empNo) {
    if (list) {
      let row = list.querySelector('.aprv-lineitem[data-emp-no="' + empNo + '"]');
      if (row) row.remove();
    }
    if (hidden) {
      let input = hidden.querySelector('input[name="approverEmpNoList"][value="' + empNo + '"]');
      if (input) input.remove();
    }
    showPickerOption(empNo);
    renumber();
  };

  let btnAddApprover = root.getElementById('btnAddApprover');
  if (btnAddApprover) { btnAddApprover.addEventListener('click', addApprover); }

  let btnClearApprovers = root.getElementById('btnClearApprovers');
  if (btnClearApprovers) {
    btnClearApprovers.addEventListener('click', function () {
      if (list) list.innerHTML = '';
      if (hidden) hidden.innerHTML = '';
      if (picker) {
        let opts = picker.querySelectorAll('option');
        opts.forEach(function (o) { o.style.display = ''; });
        picker.value = '';
      }
    });
  }

  if (list) {
    list.addEventListener('click', function (e) {
      let btn = e.target.closest('button[data-action="remove-approver"]');
      if (!btn) return;
      let row = btn.closest('.aprv-lineitem');
      if (!row) return;
      removeApprover(row.getAttribute('data-emp-no'));
    });
  }

  let d1 = root.getElementById('defaultApprover1');
  let d2 = root.getElementById('defaultApprover2');
  addApproverByEmpNo(d1 ? d1.value : '');
  addApproverByEmpNo(d2 ? d2.value : '');

  // ===== 4) 수신/참조 =====
  let refDeptSelect = root.getElementById('refDeptSelect');
  let refSearch = root.getElementById('refSearch');
  let candEmpNos = root.getElementById('refCandidateEmpNos');
  let rcvEmpNos = root.getElementById('rcvEmpNos');
  let refEmpNos = root.getElementById('refEmpNos');

  let buildRefDeptOptions = function () {
    if (!refDeptSelect || !candEmpNos) return;
    let map = {};
    let opts = candEmpNos.querySelectorAll('option');
    opts.forEach(function (o) {
      let deptCd = o.getAttribute('data-dept-cd') || '';
      if (!deptCd) return;
      let deptNm = o.getAttribute('data-dept-nm') || deptCd;
      if (!map[deptCd]) map[deptCd] = deptNm;
    });
    refDeptSelect.innerHTML = '<option value="">- 부서 선택 -</option>';
    Object.keys(map).sort().forEach(function (cd) {
      let opt = root.createElement('option');
      opt.value = cd;
      opt.textContent = map[cd];
      refDeptSelect.appendChild(opt);
    });
  };

  let norm = function (s) { return (s || '').toLowerCase().replace(/\s+/g, ''); };

  let filterCandidates = function () {
    if (!candEmpNos) return;
    let deptCd = refDeptSelect ? refDeptSelect.value : '';
    let q = norm(refSearch ? refSearch.value : '');
    let opts = candEmpNos.querySelectorAll('option');
    opts.forEach(function (o) {
      if (!o.value) return;
      let okDept = (!deptCd) || (o.getAttribute('data-dept-cd') || '') === deptCd;
      let okQ = (!q) || norm(o.textContent).indexOf(q) >= 0;
      o.style.display = (okDept && okQ) ? '' : 'none';
    });
  };

  let syncCandidateDisabled = function () {
    if (!candEmpNos) return;
    let used = {};
    let mark = function (sel) {
      if (!sel) return;
      sel.querySelectorAll('option').forEach(function (o) {
        if (!o.value) return;
        used[o.value] = true;
        o.selected = true;
      });
    };
    mark(rcvEmpNos);
    mark(refEmpNos);
    candEmpNos.querySelectorAll('option').forEach(function (o) {
      if (!o.value) return;
      o.disabled = !!used[o.value];
    });
  };

  let addSelectedTo = function (targetSel) {
    if (!candEmpNos || !targetSel) return;
    let selected = Array.from(candEmpNos.selectedOptions || []);
    if (selected.length === 0) return;
    selected.forEach(function (o) {
      if (!o.value || o.disabled) return;
      let exists = targetSel.querySelector('option[value="' + o.value + '"]');
      if (exists) { exists.selected = true; return; }
      let opt = root.createElement('option');
      opt.value = o.value;
      opt.textContent = o.textContent;
      opt.selected = true;
      targetSel.appendChild(opt);
    });
    if (targetSel === rcvEmpNos && refEmpNos) {
      let rcvVals = Array.from(rcvEmpNos.querySelectorAll('option')).map(function (x) { return x.value; });
      rcvVals.forEach(function (v) {
        let dup = refEmpNos.querySelector('option[value="' + v + '"]');
        if (dup) dup.remove();
      });
    }
    syncCandidateDisabled();
  };

  let removeSelectedFrom = function (sel) {
    if (!sel) return;
    Array.from(sel.selectedOptions || []).forEach(function (o) { o.remove(); });
    syncCandidateDisabled();
  };

  if (refDeptSelect && candEmpNos) {
    buildRefDeptOptions();
    let loginDeptCdEl = root.getElementById('loginDeptCd');
    let loginDeptCd = loginDeptCdEl ? loginDeptCdEl.value : '';
    if (loginDeptCd) refDeptSelect.value = loginDeptCd;
    filterCandidates();
    refDeptSelect.addEventListener('change', filterCandidates);
  }
  if (refSearch) refSearch.addEventListener('input', filterCandidates);

  let btnAddRcv = root.getElementById('btnAddRcv');
  if (btnAddRcv) btnAddRcv.addEventListener('click', function () { addSelectedTo(rcvEmpNos); });
  let btnAddRef = root.getElementById('btnAddRef');
  if (btnAddRef) btnAddRef.addEventListener('click', function () { addSelectedTo(refEmpNos); });
  let btnRemoveRcv = root.getElementById('btnRemoveRcv');
  if (btnRemoveRcv) btnRemoveRcv.addEventListener('click', function () { removeSelectedFrom(rcvEmpNos); });
  let btnRemoveRef = root.getElementById('btnRemoveRef');
  if (btnRemoveRef) btnRemoveRef.addEventListener('click', function () { removeSelectedFrom(refEmpNos); });

  syncCandidateDisabled();

  // ===== 5) 승진 =====
  let promoDeptSelect = root.getElementById('promoDeptSelect');
  let promoPosSelect = root.getElementById('promoPosSelect');
  let promoEmpSelect = root.getElementById('promoEmpSelect');

  let filterPromotionEmpByDept = function () {
    if (!promoEmpSelect) return;
    let deptCd = promoDeptSelect ? promoDeptSelect.value : '';
    promoEmpSelect.querySelectorAll('option').forEach(function (o) {
      if (!o.value) return;
      o.style.display = (!deptCd || (o.getAttribute('data-dept-cd') || '') === deptCd) ? '' : 'none';
    });
    let sel = promoEmpSelect.value;
    if (sel) {
      let cur = promoEmpSelect.querySelector('option[value="' + sel + '"]');
      if (cur && cur.style.display === 'none') promoEmpSelect.value = '';
    }
  };

  let syncPromotionCurPos = function () {
    if (!promoEmpSelect || !promoPosSelect) return;
    let sel = promoEmpSelect.value;
    if (!sel) { promoPosSelect.value = ''; return; }
    let opt = promoEmpSelect.querySelector('option[value="' + sel + '"]');
    promoPosSelect.value = opt ? (opt.getAttribute('data-pos-cd') || '') : '';
  };

  if (promoDeptSelect) promoDeptSelect.addEventListener('change', function () { filterPromotionEmpByDept(); syncPromotionCurPos(); });
  if (promoEmpSelect) promoEmpSelect.addEventListener('change', syncPromotionCurPos);
  filterPromotionEmpByDept();
  syncPromotionCurPos();

  // ===== 6) 발령 =====
  let apptDeptSelect = root.getElementById('apptDeptSelect');
  let apptEmpSelect = root.getElementById('apptEmpSelect');
  let apptCurPosSelect = root.getElementById('apptCurPosSelect');
  let apptCurPosHidden = root.getElementById('apptCurPosHidden');

  let filterAppointmentEmpByDept = function () {
    if (!apptEmpSelect) return;
    let deptCd = apptDeptSelect ? apptDeptSelect.value : '';
    apptEmpSelect.querySelectorAll('option').forEach(function (o) {
      if (!o.value) return;
      o.style.display = (!deptCd || (o.getAttribute('data-dept-cd') || '') === deptCd) ? '' : 'none';
    });
    let sel = apptEmpSelect.value;
    if (sel) {
      let cur = apptEmpSelect.querySelector('option[value="' + sel + '"]');
      if (cur && cur.style.display === 'none') apptEmpSelect.value = '';
    }
  };

  let syncAppointmentCurPos = function () {
    if (!apptEmpSelect) return;
    let sel = apptEmpSelect.value;
    if (!sel) {
      if (apptCurPosSelect) apptCurPosSelect.value = '';
      if (apptCurPosHidden) apptCurPosHidden.value = '';
      return;
    }
    let opt = apptEmpSelect.querySelector('option[value="' + sel + '"]');
    let posCd = opt ? (opt.getAttribute('data-pos-cd') || '') : '';
    if (apptCurPosSelect) apptCurPosSelect.value = posCd;
    if (apptCurPosHidden) apptCurPosHidden.value = posCd;
  };

  if (apptDeptSelect) apptDeptSelect.addEventListener('change', function () { filterAppointmentEmpByDept(); syncAppointmentCurPos(); });
  if (apptEmpSelect) apptEmpSelect.addEventListener('change', syncAppointmentCurPos);
  filterAppointmentEmpByDept();
  syncAppointmentCurPos();

});