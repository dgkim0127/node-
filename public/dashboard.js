// 업로드 버튼 클릭 시 팝업을 열고 닫는 기능
const uploadButton = document.getElementById('uploadButton');
const uploadPopup = document.getElementById('uploadPopup');

uploadButton.addEventListener('click', () => {
    uploadPopup.classList.toggle('hidden'); // 업로드 팝업을 표시/숨기기
});

// 업로드 폼 처리 (기본적인 이벤트 처리)
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 파일 업로드 및 데이터 처리 로직 구현 필요
    console.log('폼 제출');
    
    // 업로드 창을 다시 숨김
    uploadPopup.classList.add('hidden');
});
