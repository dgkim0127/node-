// Firebase와 연동된 업로드 처리
import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 폼 제출 이벤트 처리
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 사용자 입력 값 가져오기
    const productNumber = document.getElementById('productNumber').value;
    const type = document.getElementById('type').value;
    const weight = document.getElementById('weight').value;
    const size = document.getElementById('size').value;
    const content = document.getElementById('content').value;
    const file = document.getElementById('fileUpload').files[0];

    // 입력 필드 검증 (필요에 따라)
    if (!productNumber || !type || !weight || !size || !content || !file) {
        alert('모든 필드를 입력해야 합니다.');
        return;
    }

    try {
        // Firebase Storage에 파일 업로드
        const storageRef = ref(storage, `uploads/${file.name}`);
        await uploadBytes(storageRef, file);

        // 업로드된 파일의 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(storageRef);

        // Firestore에 게시물 정보 저장
        await addDoc(collection(db, 'posts'), {
            productNumber,
            type,
            weight,
            size,
            content,
            fileURL: downloadURL,
            createdAt: new Date()
        });

        alert('게시물 업로드 성공!');
        // 업로드 완료 후 대시보드 페이지로 리디렉션
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('업로드 중 오류 발생:', error);
        alert('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});
