import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // 기본 폼 제출 방지

        // 제품 번호 가져오기
        const productNumberInput = document.getElementById('productNumber');
        if (!productNumberInput) {
            console.error('Product number input not found!');
            return;
        }

        const productNumber = productNumberInput.value;  // 제품 번호
        const files = document.getElementById('mediaFiles').files;  // 파일 목록

        if (!files.length) {
            console.error('No files selected for upload.');
            return;
        }

        let mediaURLs = [];
        let thumbnailURL = '';  // 썸네일 URL

        // 각 파일을 Firebase Storage에 업로드하고 URL 저장
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name) {
                console.error('File name is undefined.');
                continue;
            }

            try {
                const storageRef = ref(storage, `media/${file.name}`);
                await uploadBytes(storageRef, file);  // 파일 업로드
                const downloadURL = await getDownloadURL(storageRef);  // 다운로드 URL
                mediaURLs.push(downloadURL);

                // 첫 번째 파일을 썸네일로 지정 (또는 사용자가 선택한 파일을 썸네일로 지정할 수 있음)
                if (i === 0) {
                    thumbnailURL = downloadURL;  // 첫 번째 파일을 썸네일로 지정
                }
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
            }
        }

        // Firestore에 데이터 저장
        try {
            await addDoc(collection(db, "posts"), {
                productNumber: productNumber,
                media: mediaURLs,
                thumbnail: thumbnailURL,  // 썸네일 URL 추가
                createdAt: new Date()
            });

            alert('Post uploaded successfully!');
            window.location.href = 'dashboard.html';  // 업로드 후 대시보드로 이동
        } catch (error) {
            console.error('Error saving post data to Firestore:', error);
        }
    });
});
