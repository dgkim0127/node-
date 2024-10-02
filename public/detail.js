import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// URL에서 게시물 ID를 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Firestore에서 게시물 정보를 가져오는 함수
const loadPostDetail = async () => {
    if (!postId) {
        console.error('No post ID found in URL');
        return;
    }

    try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            console.error('Post not found');
            return;
        }

        const postData = postDoc.data();
        const postTitle = document.getElementById('post-title');
        const mediaContainer = document.getElementById('media-container');
        const productNumberElem = document.getElementById('product-number');
        const productTypeElem = document.getElementById('product-type');
        const productSizeElem = document.getElementById('product-size');
        const productWeightElem = document.getElementById('product-weight');
        const productContentElem = document.getElementById('product-content');

        // 품번을 해더에 표시
        postTitle.textContent = postData.productNumber;

        // 제품 정보를 표시
        productNumberElem.textContent = postData.productNumber;
        productTypeElem.textContent = postData.type;
        productSizeElem.textContent = postData.size;
        productWeightElem.textContent = postData.weight;
        productContentElem.textContent = postData.content || 'No content available';

        // 미디어 파일들을 표시
        const mediaFiles = postData.media || [];
        mediaFiles.forEach((mediaURL) => {
            const mediaType = mediaURL.split('.').pop();  // 파일 확장자로 타입 확인

            if (mediaType === 'mp4' || mediaType === 'webm' || mediaType === 'ogg') {
                // 비디오 파일일 경우
                const videoElement = document.createElement('video');
                videoElement.src = mediaURL;
                videoElement.controls = true;
                videoElement.style.width = '100%';
                mediaContainer.appendChild(videoElement);
            } else {
                // 이미지 파일일 경우
                const imgElement = document.createElement('img');
                imgElement.src = mediaURL;
                imgElement.alt = `Media for ${postData.productNumber}`;
                imgElement.style.width = '100%';
                mediaContainer.appendChild(imgElement);
            }
        });
    } catch (error) {
        console.error('Error loading post details:', error);
    }
};

// 페이지 로드 시 게시물 정보를 불러옴
window.addEventListener('DOMContentLoaded', loadPostDetail);

// 뒤로 가기 버튼 이벤트
const backBtn = document.getElementById('back-btn');
backBtn.addEventListener('click', () => {
    window.history.back();
});
