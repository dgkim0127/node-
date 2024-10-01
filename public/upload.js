// upload.js
import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

const uploadForm = document.getElementById('upload-form');

// 업로드 폼 제출 시 이벤트 처리
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    const files = document.getElementById('mediaFiles').files; // 업로드할 파일들
    const productNumber = document.getElementById('productNumber').value; // 제품 번호

    let mediaURLs = [];

    // 각 파일을 Firebase Storage에 업로드하고 URL을 저장
    for (let file of files) {
        const storageRef = ref(storage, `media/${file.name}`); // 파일 경로 설정
        await uploadBytes(storageRef, file); // 파일 업로드
        const downloadURL = await getDownloadURL(storageRef); // 다운로드 URL 가져오기
        mediaURLs.push(downloadURL); // URL 목록에 추가
    }

    // Firestore에 게시물 데이터 저장
    await addDoc(collection(db, "posts"), {
        productNumber: productNumber,
        media: mediaURLs,
        createdAt: new Date() // 생성 날짜 추가
    });

    alert('Post uploaded successfully!'); // 성공 메시지
    window.location.href = 'dashboard.html'; // 대시보드로 이동
});
