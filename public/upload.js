import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const fileUpload = document.getElementById('fileUpload');
const filePreviewContainer = document.getElementById('filePreviewContainer');
let selectedThumbnail = null;  // 썸네일로 선택된 파일

// 파일 미리보기 및 썸네일 선택 기능
fileUpload.addEventListener('change', function(event) {
    const files = event.target.files;
    filePreviewContainer.innerHTML = ''; // 기존 미리보기 삭제
    selectedThumbnail = null; // 초기화

    Array.from(files).forEach((file, index) => {
        const fileURL = URL.createObjectURL(file);
        
        // 미리보기 이미지 또는 동영상 생성
        const previewElement = document.createElement('div');
        previewElement.classList.add('preview-item');
        
        // 이미지 파일일 경우에만 클릭으로 썸네일 설정 가능
        if (file.type.startsWith('image/')) {
            previewElement.innerHTML = `<img src="${fileURL}" class="preview-image" data-index="${index}" alt="이미지 미리보기">`;
            previewElement.addEventListener('click', () => selectThumbnail(index, previewElement));
        } else if (file.type.startsWith('video/')) {
            previewElement.innerHTML = `<video src="${fileURL}" controls class="preview-image" alt="동영상 미리보기"></video>`;
        }

        filePreviewContainer.appendChild(previewElement);
    });
});

// 썸네일 선택 함수
function selectThumbnail(index, element) {
    // 기존 선택된 썸네일 스타일 제거
    if (selectedThumbnail !== null) {
        document.querySelectorAll('.preview-item')[selectedThumbnail].classList.remove('selected-thumbnail');
    }
    // 새로운 썸네일 선택
    selectedThumbnail = index;
    element.classList.add('selected-thumbnail');
}

// 업로드 처리
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productPrefix = document.getElementById('productCodePrefix').value;
    const productNumber = document.getElementById('productNumber').value;
    const productSuffix = document.getElementById('productCodeSuffix').value;
    const optionalNumber = document.getElementById('optionalNumber').value;
    const fullProductNumber = `${productPrefix}-${productNumber}${productSuffix ? '-' + productSuffix : ''}${optionalNumber ? '-' + optionalNumber : ''}`;

    const type = document.getElementById('type').value;
    const weight = document.getElementById('weight').value;
    const size = document.getElementById('size').value;
    const content = document.getElementById('content').value || '내용 없음';
    const files = fileUpload.files;

    if (files.length === 0) {
        alert('파일을 선택해주세요');
        return;
    }

    if (selectedThumbnail === null) {
        alert('썸네일 이미지를 선택해주세요');
        return;
    }

    try {
        // Firebase Storage에 파일 업로드
        const fileUploads = Array.from(files).map((file, index) => {
            const fileRef = ref(storage, `uploads/${file.name}`);
            return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef));
        });

        const uploadedFileURLs = await Promise.all(fileUploads);
        const thumbnailURL = uploadedFileURLs[selectedThumbnail]; // 선택한 썸네일 URL

        // Firestore에 게시물 정보 저장
        await addDoc(collection(db, 'posts'), {
            productNumber: fullProductNumber,
            type,
            weight,
            size,
            content,
            thumbnailURL,
            fileURLs: uploadedFileURLs,
            createdAt: new Date()
        });

        alert('업로드 성공!');
        window.location.href = 'dashboard.html';  // 업로드 완료 후 대시보드로 이동
    } catch (error) {
        console.error('업로드 중 오류 발생:', error);
        alert('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});
