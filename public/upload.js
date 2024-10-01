import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const previewGrid = document.getElementById('preview-grid');
    let selectedThumbnail = null; // 선택한 썸네일을 저장할 변수
    let mediaURLs = [];  // 업로드한 파일 URL을 저장할 배열

    // 미디어 파일 미리보기
    mediaFilesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewGrid.innerHTML = ''; // 기존 미리보기 초기화
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = document.createElement('img');
                imgElement.src = e.target.result;
                imgElement.alt = `preview-${index}`;
                imgElement.addEventListener('click', () => {
                    // 선택한 썸네일을 강조 표시
                    const selected = document.querySelector('.selected');
                    if (selected) selected.classList.remove('selected');
                    imgElement.classList.add('selected');
                    selectedThumbnail = index;  // 썸네일 인덱스 저장
                });
                previewGrid.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        });
    });

    // 업로드 폼 제출 시 처리
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productNumber = document.getElementById('productNumber').value;
        const type = document.getElementById('type').value;
        const size = document.getElementById('size').value;
        const weight = document.getElementById('weight').value;
        const content = document.getElementById('content').value;
        const files = mediaFilesInput.files;

        // 제품 번호 중복 확인
        const productQuery = query(collection(db, "posts"), where("productNumber", "==", productNumber));
        const productSnapshot = await getDocs(productQuery);
        if (!productSnapshot.empty) {
            alert('This product number already exists!');
            return;
        }

        // Firebase Storage에 파일 업로드 및 URL 저장
        mediaURLs = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `media/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            mediaURLs.push(downloadURL);
        }

        // 선택한 썸네일 URL 가져오기
        const thumbnailURL = mediaURLs[selectedThumbnail] || mediaURLs[0];

        // Firestore에 데이터 저장
        try {
            await addDoc(collection(db, "posts"), {
                productNumber: productNumber,
                type: type,
                size: size,
                weight: weight,
                content: content,
                media: mediaURLs,
                thumbnail: thumbnailURL,
                createdAt: new Date()
            });
            alert('Post uploaded successfully!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error uploading post:', error);
        }
    });
});
