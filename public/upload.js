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
    const thumbnailFile = document.getElementById('thumbnailUpload').files[0];
    const mainFile = document.getElementById('fileUpload').files[0];

    if (!thumbnailFile || !mainFile) {
        alert('모든 파일을 선택해주세요');
        return;
    }

    try {
        // 1. 썸네일 이미지를 Firebase Storage에 업로드
        const thumbnailRef = ref(storage, `thumbnails/${thumbnailFile.name}`);
        await uploadBytes(thumbnailRef, thumbnailFile);
        const thumbnailURL = await getDownloadURL(thumbnailRef);

        // 2. 업로드된 파일(사진 또는 동영상)을 Firebase Storage에 업로드
        const mainFileRef = ref(storage, `uploads/${mainFile.name}`);
        await uploadBytes(mainFileRef, mainFile);
        const mainFileURL = await getDownloadURL(mainFileRef);

        // 3. Firestore에 게시물 정보 저장
        await addDoc(collection(db, 'posts'), {
            productNumber,
            type,
            weight,
            size,
            content,
            thumbnailURL,  // 썸네일 이미지 URL
            fileURL: mainFileURL,  // 업로드된 파일(사진 또는 영상)의 URL
            createdAt: new Date()
        });

        alert('업로드 성공!');
        window.location.href = 'dashboard.html';  // 업로드 완료 후 대시보드로 이동

    } catch (error) {
        console.error('업로드 중 오류 발생:', error);
        alert('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});
