// aprvAssetManage.js
(function () {
  function isImageFile(file) {
    return file && file.type && file.type.toLowerCase().startsWith("image/");
  }

  function setPreview(previewBox, file) {
    if (!previewBox) return;

    previewBox.innerHTML = "";

    if (!file) {
      let empty = document.createElement("div");
      empty.className = "aprv-preview__empty";
      empty.textContent = "미리보기";
      previewBox.appendChild(empty);
      return;
    }

    let img = document.createElement("img");
    img.alt = "미리보기";
    previewBox.appendChild(img);

    let reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function bindForm(form) {
    let kind = form.getAttribute("data-form");
    let fileInput = form.querySelector('input[type="file"][name="file"]');
    let previewBox = document.querySelector('.aprv-preview[data-preview="' + kind + '"]');

    if (!fileInput) return;

    setPreview(previewBox, null);

    fileInput.addEventListener("change", function () {
      let file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

      if (file && !isImageFile(file)) {
        Swal.fire({
          icon: "warning",
          title: "업로드 불가",
          text: "이미지 파일만 업로드할 수 있습니다.",
          confirmButtonText: "확인"
        });
        fileInput.value = "";
        setPreview(previewBox, null);
        return;
      }

      setPreview(previewBox, file);
    });

    // ✅ submit은 async로 처리해야 preventDefault 타이밍 맞음
    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // ✅ 일단 막고

      let file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

      if (!file) {
        await Swal.fire({
          icon: "warning",
          title: "파일 없음",
          text: "업로드할 이미지 파일을 선택해 주세요.",
          confirmButtonText: "확인"
        });
        return;
      }

      if (!isImageFile(file)) {
        await Swal.fire({
          icon: "warning",
          title: "업로드 불가",
          text: "이미지 파일만 업로드할 수 있습니다.",
          confirmButtonText: "확인"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          icon: "warning",
          title: "파일 용량 초과",
          text: "파일 용량이 너무 큽니다. (최대 5MB)",
          confirmButtonText: "확인"
        });
        return;
      }

      // ✅ 모든 검증 통과 시 실제 submit
      form.submit();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    let forms = document.querySelectorAll("form.aprv-form");
    forms.forEach(bindForm);
  });
})();