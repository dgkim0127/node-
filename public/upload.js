import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 파일 미리보기와 썸네일 선택
const fileUpload = document.getElementById('fileUpload');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const thumbnailSelect = document.getElementById('thumbnailSelect');

fileUpload.addEventListener('change', function(event) {
    const files = event.target.files;
    filePreviewContainer.innerHTML = '';
    thumbnailSelect.innerHTML = '<option value="">썸네일 선택</option>'; // 초기화

    Array.from(files).forEach((file, index) => {
        const fileURL = URL.createObjectURL(file);
        
        // 미리보기 이미지 또는 동영상 생성
        const previewElement = document.createElement('div');
        previewElement.style.marginBottom = '10px';
        if (file.type.startsWith('image/')) {
            previewElement.innerHTML = `<img src="${fileURL}" style="max-width: 150px; height: auto; border-radius: 5px;">`;
            // 썸네일 선택 옵션 추가 (이미지 파일만)
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `이미지 ${index + 1}`;
            thumbnailSelect.appendChild(option);
        } else if (file.type.startsWith('video/')) {
            previewElement.innerHTML = `<video src="${fileURL}" controls style="max-width: 150px; height: auto;"></video>`;
        }

        filePreviewContainer.appendChild(previewElement);
    });
});

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

    const thumbnailIndex = thumbnailSelect.value;
    if (thumbnailIndex === '') {
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
        const thumbnailURL = uploadedFileURLs[thumbnailIndex]; // 선택한 썸네일

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
