// 업로드 버튼 클릭 시 업로드 창을 보여주는 기능
const uploadButton = document.getElementById('uploadButton');
const uploadFormSection = document.getElementById('uploadFormSection');

uploadButton.addEventListener('click', () => {
    uploadFormSection.classList.toggle('active'); // 업로드 섹션 표시/숨기기
});
