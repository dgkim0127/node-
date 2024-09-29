import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productNumber = document.getElementById('productNumber').value;
    const type = document.getElementById('type').value;
    const weight = document.getElementById('weight').value;
    const size = document.getElementById('size').value;
    const content = document.getElementById('content').value;
    const file = document.getElementById('fileUpload').files[0];

    if (!file) {
        alert('파일을 선택해주세요');
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

        alert('업로드 성공!');
        window.location.href = 'dashboard.html';  // 업로드 완료 후 대시보드로 이동

    } catch (error) {
        console.error('업로드 중 오류 발생:', error);
        alert('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});
