// Firebase와의 연결 설정
import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const fileUpload = document.getElementById('fileUpload');
const filePreviewContainer = document.getElementById('filePreviewContainer');
let selectedThumbnail = null;  // 썸네일로 선택된 파일

// 파일 미리보기 기능
fileUpload.addEventListener('change', function(event) {
    const files = event.target.files;
    filePreviewContainer.innerHTML = ''; // 기존 미리보기 삭제

    Array.from(files).forEach((file, index) => {
        const fileURL = URL.createObjectURL(file);

        const previewElement = document.createElement('div');
        previewElement.classList.add('preview-item');

        // 이미지 및 동영상 미리보기
        if (file.type.startsWith('image/')) {
            previewElement.innerHTML = `<img src="${fileURL}" class="preview-image" alt="이미지 미리보기">`;
        } else if (file.type.startsWith('video/')) {
            previewElement.innerHTML = `<video src="${fileURL}" controls class="preview-image"></video>`;
        }

        filePreviewContainer.appendChild(previewElement);
    });
});

// 업로드 폼 처리
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productNumber = document.getElementById('productNumber').value;
    const type = document.getElementById('type').value;
    const size = document.getElementById('size').value;
    const weight = document.getElementById('weight').value;
    const content = document.getElementById('content').value || '내용 없음';
