/* global axios, Swal */

(function() {
  "use strict";

  const modal = document.getElementById("myPageModal");
  const openBtn = document.getElementById("openMyPage");
  const saveBtn = document.getElementById("mp_saveBtn");
  const verifyBtn = document.getElementById("mp_verifyBtn");
  const zipSearchBtn = document.getElementById("mp_zipSearchBtn");

  const profileInput = document.getElementById("mp_profileInput");
  const profilePreview = document.getElementById("mp_profilePreview");
  const profileChangeBtn = document.getElementById("mp_profileChangeBtn");
  const profileDeleteBtn = document.getElementById("mp_profileDeleteBtn");
  
  const DEFAULT_IMG = "/dist/assets/images/man1.png";

  if (!modal || !openBtn || !saveBtn || !verifyBtn) return;

  // ------- helpers -------
  function qs(id) { return document.getElementById(id); }
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

  function setVerifiedUI(isVerified) {
    const verifyWrap = qs("mp_verifyWrap");
    const formWrap = qs("mp_formWrap");
    const saveWrap = qs("mp_saveWrap");
    const bodyEl = modal.querySelector(".bt-modal__body");
    if (isVerified) {
      verifyWrap.classList.add("hidden");
      formWrap.classList.remove("hidden");
      saveBtn.disabled = false;
      if (saveWrap) saveWrap.classList.remove("hidden");
      modal.classList.add("mp-step-verified");
      if (bodyEl) bodyEl.classList.remove("is-verify");
    } else {
      verifyWrap.classList.remove("hidden");
      formWrap.classList.add("hidden");
      saveBtn.disabled = true;
      if (saveWrap) saveWrap.classList.add("hidden");
      modal.classList.remove("mp-step-verified");
      if (bodyEl) bodyEl.classList.add("is-verify");
    }
  }

  function setVerifyMsg(text, type) {
    const el = qs("mp_verifyMsg");
    el.classList.remove("is-error", "is-ok");
    if (type === "error") el.classList.add("is-error");
    if (type === "ok") el.classList.add("is-ok");
    el.textContent = text || "";
  }

async function loadProfile() {
    try {
      const { data } = await axios.get("/rest/mypage/me");
      
      qs("mp_empNm").value = data.empNm || "";
      qs("mp_posNm").value = data.posNm || "";
      qs("mp_deptNm").value = data.deptNm || "";
      qs("mp_email").value = data.empEmail || "";
      qs("mp_hp").value = data.hpNo || "";
      qs("mp_zip").value = data.zipCd || "";
      qs("mp_addr1").value = data.addr1 || "";
      qs("mp_addr2").value = data.addr2 || "";

      if (data.profileImgDto && data.profileImgDto.fileMeta) {
        const meta = data.profileImgDto.fileMeta;
        
        const s3Key = meta.filePath + meta.saveFileNm;
        
        const s3BucketUrl = "https://finalfileserver.s3.ap-northeast-2.amazonaws.com/";
        
        profilePreview.src = s3BucketUrl + s3Key;
        
      } else {
        profilePreview.src = DEFAULT_IMG;
      }

      qs("mp_newPwd").value = "";
      qs("mp_newPwd2").value = "";
      
    } catch (e) {
      console.error("데이터 로드 중 에러 발생:", e);
      Swal.fire({ icon: "error", title: "불러오기 실패", text: "정보를 가져오지 못했습니다." });
    }
  }

  function normalize(s) {
    return (s ?? "").toString().trim();
  }

  async function verifyCurrentPassword() {
    const currentPwd = normalize(qs("mp_currentPwd").value);
    if (!currentPwd) {
      setVerifyMsg("현재 비밀번호를 입력해주세요.", "error");
      qs("mp_currentPwd").focus();
      return;
    }

    verifyBtn.disabled = true;
    setVerifyMsg("확인 중...", "");
    try {
      const { data } = await axios.post("/rest/mypage/verify", { currentPwd });
      if (data === "success") {
        setVerifyMsg("확인되었습니다. 정보를 불러오는 중...", "ok");
        setVerifiedUI(true);
        await loadProfile();
        setVerifyMsg("", "");
        qs("mp_newPwd").focus();
      } else {
        setVerifiedUI(false);
        setVerifyMsg("현재 비밀번호가 올바르지 않습니다.", "error");
      }
    } catch (e) {
      setVerifiedUI(false);
      const msg = e?.response?.data?.message || "비밀번호 확인 중 오류가 발생했습니다.";
      setVerifyMsg(msg, "error");
    } finally {
      verifyBtn.disabled = false;
    }
  }

  async function saveProfile() {
	
   const newPwd = normalize(qs("mp_newPwd").value);
   const newPwd2 = normalize(qs("mp_newPwd2").value);

    if ((newPwd || newPwd2) && newPwd !== newPwd2) {
      Swal.fire({ icon: "warning", title: "확인 필요", text: "비밀번호 확인 값이 일치하지 않습니다." });
      return;
    }

    const formData = new FormData();
    if (profileInput.files[0]) {
      formData.append("profileImg", profileInput.files[0]);
    }
    
    formData.append("newPwd", newPwd || "");
    formData.append("newPwdConfirm", newPwd2 || "");
    formData.append("empEmail", normalize(qs("mp_email").value));
    formData.append("hpNo", normalize(qs("mp_hp").value));
    formData.append("zipCd", normalize(qs("mp_zip").value));
    formData.append("addr1", normalize(qs("mp_addr1").value));
    formData.append("addr2", normalize(qs("mp_addr2").value));
    
    try {
      const { data } = await axios.put("/rest/mypage/me", formData);
      
      if (data === "success") {
        const sidebarImg = document.getElementById("sidebarProfileImg");
        if (sidebarImg) {
          sidebarImg.src = profilePreview.src; 
        }

        sessionStorage.setItem('profileImgUrl', profilePreview.src);

        Swal.fire({ 
          icon: "success", 
          title: "저장 완료", 
          timer: 800, 
          showConfirmButton: false 
        }).then(() => {
          closeModal(); 
          
          qs("mp_currentPwd").value = "";
          qs("mp_newPwd").value = "";
          qs("mp_newPwd2").value = "";
          setVerifiedUI(false); 
        });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "저장 중 오류가 발생했습니다.";
      Swal.fire({ icon: "error", title: "저장 실패", text: msg });
    }
  }

  if (profileChangeBtn) {
    profileChangeBtn.addEventListener("click", () => profileInput.click());
  }

  if (profileInput) {
    profileInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => profilePreview.src = ev.target.result; // 미리보기
        reader.readAsDataURL(file);
      }
    });
  }

 if (profileDeleteBtn) {
    profileDeleteBtn.addEventListener("click", async function() {
      if (confirm("프로필 이미지를 삭제하시겠습니까?")) {
        try {
          const { data } = await axios.delete("/rest/mypage/profile-img");

          if (data === "success") {
            profilePreview.src = DEFAULT_IMG; 
            profileInput.value = "";
            
            const sidebarImg = document.getElementById("sidebarProfileImg");
            if (sidebarImg) sidebarImg.src = DEFAULT_IMG;

            sessionStorage.removeItem('profileImgUrl'); 

            Swal.fire({ icon: "success", title: "삭제 완료", timer: 1000, showConfirmButton: false });
          } else {
            Swal.fire({ icon: "error", title: "삭제 실패", text: "다시 시도해주세요." });
          }
        } catch (e) {
          console.error("삭제 중 에러:", e);
          Swal.fire({ icon: "error", title: "오류 발생", text: "서버 통신 중 문제가 발생했습니다." });
        }
      }
    });
  }

  // ------- events -------
  openBtn.addEventListener("click", async function() {
    openModal();
    qs("mp_currentPwd").value = "";
    setVerifyMsg("", "");
    setVerifiedUI(false);
    qs("mp_currentPwd").focus();
  });

  modal.addEventListener("click", function(e) {
    const close = e.target && e.target.closest && e.target.closest("[data-close='true']");
    if (close) closeModal();
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  saveBtn.addEventListener("click", saveProfile);
  verifyBtn.addEventListener("click", verifyCurrentPassword);
  qs("mp_currentPwd").addEventListener("keydown", function(e) {
    if (e.key === "Enter") verifyCurrentPassword();
  });

  if (zipSearchBtn) {
    zipSearchBtn.addEventListener("click", () => {
        new window.daum.Postcode({
          oncomplete: function(data) {
            qs("mp_zip").value = data.zonecode;
            qs("mp_addr1").value = data.roadAddress || data.jibunAddress;
            qs("mp_addr2").focus();
          }
        }).open();
    });
  }

})();

document.addEventListener('DOMContentLoaded', function() {
    if (window.LOGIN_USER && window.LOGIN_USER.empNo && !sessionStorage.getItem('profileImgUrl')) {
        
        console.log("로그인 감지: 프로필 세션 갱신을 시작합니다.");

        axios.get("/rest/mypage/me")
            .then(({ data }) => {
                let profileUrl = "/dist/assets/images/man1.png";

                if (data && data.profileImgDto && data.profileImgDto.fileMeta) {
                    const meta = data.profileImgDto.fileMeta;
                    const s3BucketUrl = "https://finalfileserver.s3.ap-northeast-2.amazonaws.com/";
                    profileUrl = s3BucketUrl + meta.filePath + meta.saveFileNm;
                }
                
                sessionStorage.setItem('profileImgUrl', profileUrl);
                
                const sidebarImg = document.getElementById('sidebarProfileImg');
                if (sidebarImg) {
                    sidebarImg.src = profileUrl;
                    sidebarImg.style.visibility = 'visible';
                }
            })
            .catch(err => {
                console.warn("로그인 프로필 동기화 실패:", err);
                sessionStorage.setItem('profileImgUrl', "/dist/assets/images/man1.png");
            });
    }
});

function handleLogout() {
    sessionStorage.clear();
    localStorage.clear();
    location.href = "/logout"; 
}

document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    sessionStorage.clear();
    localStorage.clear();
});