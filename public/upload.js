import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

// DOM이 완전히 로드된 후 이벤트 리스너를 설정
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');

    // 업로드 폼 제출 시 실행
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // 폼의 기본 제출 동작을 막음

        // productNumber 입력 필드를 가져옴
        const productNumberInput = document.getElementById('productNumber');
        if (!productNumberInput) {
            console.error('Product number input not found!');
            return;
        }

        const productNumber = productNumberInput.value;  // 제품 번호 값 추출
        const files = document.getElementById('mediaFiles').files;  // 파일 입력 필드에서 파일 목록 추출

        // 업로드된 미디어 파일의 URL을 저장할 배열
        let mediaURLs = [];

        // 각 파일을 Firebase Storage에 업로드하고 URL을 저장
        for (let file of files) {
            const storageRef = ref(storage, `media/${file.name}`);  // Storage 경로 설정
            await uploadBytes(storageRef, file);  // 파일을 Firebase Storage에 업로드
            const downloadURL = await getDownloadURL(storageRef);  // 업로드된 파일의 다운로드 URL 가져오기
            mediaURLs.push(downloadURL);  // URL 배열에 추가
        }

        // Firestore에 게시물 데이터 저장
        await addDoc(collection(db, "posts"), {
            productNumber: productNumber,  // 제품 번호
            media: mediaURLs,  // 미디어 파일들의 URL
            createdAt: new Date()  // 생성 날짜
        });

        alert('Post uploaded successfully!');  // 성공 메시지
        window.location.href = 'dashboard.html';  // 업로드 완료 후 대시보드로 이동
    });
});
