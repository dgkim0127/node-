import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 게시물 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// DOM 요소 참조
const productNumberElement = document.getElementById('productNumber');
const typeElement = document.getElementById('type');
const sizeElement = document.getElementById('size');
const weightElement = document.getElementById('weight');
const contentElement = document.getElementById('content');
const mainImage = document.getElementById('mainImage');
const mainVideo = document.getElementById('mainVideo');
const subImagesContainer = document.getElementById('subImagesContainer');

// 수정 버튼 클릭 시 수정 페이지로 이동
const editButton = document.getElementById('editButton');
editButton.addEventListener('click', () => {
    window.location.href = `edit.html?id=${postId}`;
});

// Firestore에서 게시물 정보 로드
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();

        // 제품 정보 표시
        productNumberElement.textContent = postData.productNumber;
        typeElement.textContent = postData.type;
        sizeElement.textContent = postData.size;
        weightElement.textContent = postData.weight;
        contentElement.textContent = postData.content || '내용 없음';

        // 동영상 또는 썸네일 표시
        if (postData.fileURLs && postData.fileURLs.some(url => url.match(/\.(mp4|webm|ogg)$/))) {
            const videoURL = postData.fileURLs.find(url => url.match(/\.(mp4|webm|ogg)$/));
            mainVideo.src = videoURL;
            mainVideo.style.display = 'block';
        } else {
            mainImage.src = postData.thumbnailURL;
            mainImage.style.display = 'block';
        }

        // 서브 이미지 표시 (이미지 파일만)
        postData.fileURLs.forEach((url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
                const subImage = document.createElement('img');
                subImage.src = url;
                subImage.classList.add('sub-image');

                // 서브 이미지 클릭 시 메인 이미지와 교체
                subImage.addEventListener('click', () => {
                    mainImage.src = url;
                    mainImage.style.display = 'block';
                    mainVideo.style.display = 'none';  // 동영상 숨기기
                });

                subImagesContainer.appendChild(subImage);
            }
        });
    } else {
        console.log('해당 게시물을 찾을 수 없습니다.');
    }
}

loadPostDetails();
