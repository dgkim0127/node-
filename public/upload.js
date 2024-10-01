import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // 기본 폼 제출 방지

        // productNumber 입력 필드를 가져옴
        const productNumberInput = document.getElementById('productNumber');
        if (!productNumberInput) {
            console.error('Product number input not found!');
            return;
        }

        const productNumber = productNumberInput.value;  // 제품 번호 추출
        const files = document.getElementById('mediaFiles').files;  // 파일 입력 필드에서 파일 목록 추출

        // 파일 목록이 있는지 확인
        if (!files.length) {
            console.error('No files selected for upload.');
            return;
        }

        let mediaURLs = [];

        // 각 파일을 Firebase Storage에 업로드하고 URL을 저장
        for (let file of files) {
            if (!file.name) {
                console.error('File name is undefined.');
                continue;
            }

            try {
                // Firebase Storage 경로 설정 (file.path 대신 file.name 사용)
                const storageRef = ref(storage, `media/${file.name}`);
                // 파일을 Firebase Storage에 업로드
                await uploadBytes(storageRef, file);
                // 업로드된 파일의 다운로드 URL 가져오기
                const downloadURL = await getDownloadURL(storageRef);
                mediaURLs.push(downloadURL);  // URL 배열에 추가
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
            }
        }

        // Firestore에 게시물 데이터 저장
        try {
            await addDoc(collection(db, "posts"), {
                productNumber: productNumber,  // 제품 번호
                media: mediaURLs,  // 미디어 파일들의 URL
                createdAt: new Date()  // 생성 날짜
            });

            alert('Post uploaded successfully!');  // 성공 메시지
            window.location.href = 'dashboard.html';  // 대시보드로 이동
        } catch (error) {
            console.error('Error saving post data to Firestore:', error);
        }
    });
});
