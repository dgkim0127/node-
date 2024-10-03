import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 게시물 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postNameElement = document.getElementById('post-name');
const mainMediaContainer = document.getElementById('main-media-container');
const thumbnailGallery = document.getElementById('thumbnail-gallery');
const postInfoSection = document.getElementById('post-info');

// Firestore에서 게시물 데이터를 불러와 상세 페이지에 표시하는 함수
const loadPostDetail = async () => {
    if (!postId) {
        postNameElement.textContent = 'Post Not Found';
        return;
    }

    try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
            const postData = postDoc.data();

            // 게시물 이름 설정 (헤더에 품번 표시)
            postNameElement.textContent = postData.productNumber || "No Product Number";

            // 메인 미디어 표시
            const mainMediaURL = postData.media[0]; // 첫 번째 미디어를 메인으로 설정
            const mediaType = mainMediaURL.split('.').pop().split('?')[0];
            mainMediaContainer.innerHTML = '';

            if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
                const videoElement = document.createElement('video');
                videoElement.src = mainMediaURL;
                videoElement.controls = true;
                videoElement.autoplay = true;
                videoElement.loop = true;
                videoElement.muted = true;
                videoElement.style.width = '60%';
                mainMediaContainer.appendChild(videoElement);
            } else {
                const imgElement = document.createElement('img');
                imgElement.src = mainMediaURL;
                imgElement.alt = "Main media image";
                imgElement.style.width = '60%';
                mainMediaContainer.appendChild(imgElement);
            }

            // 썸네일 갤러리 설정
            postData.media.forEach((mediaURL, index) => {
                if (index > 0) {
                    const thumbnailElement = document.createElement('img');
                    thumbnailElement.src = mediaURL;
                    thumbnailElement.alt = `Thumbnail ${index}`;
                    thumbnailElement.addEventListener('click', () => {
                        mainMediaContainer.innerHTML = '';
                        if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
                            const newVideoElement = document.createElement('video');
                            newVideoElement.src = mediaURL;
                            newVideoElement.controls = true;
                            newVideoElement.autoplay = true;
                            newVideoElement.loop = true;
                            newVideoElement.muted = true;
                            newVideoElement.style.width = '60%';
                            mainMediaContainer.appendChild(newVideoElement);
                        } else {
                            const newImgElement = document.createElement('img');
                            newImgElement.src = mediaURL;
                            newImgElement.alt = "Main media image";
                            newImgElement.style.width = '60%';
                            mainMediaContainer.appendChild(newImgElement);
                        }
                    });
                    thumbnailGallery.appendChild(thumbnailElement);
                }
            });

            // 게시물 정보 표시
            postInfoSection.innerHTML = `
                <p><strong>Product Number:</strong> ${postData.productNumber || 'N/A'}</p>
                <p><strong>Type:</strong> ${postData.type || 'N/A'}</p>
                <p><strong>Size:</strong> ${postData.size || 'N/A'}</p>
                <p><strong>Weight:</strong> ${postData.weight || 'N/A'}g</p>
                <p><strong>Content:</strong> ${postData.content || 'No content available'}</p>
            `;
        } else {
            postNameElement.textContent = 'Post Not Found';
        }
    } catch (error) {
        console.error("Error loading post details:", error);
        postNameElement.textContent = 'Error loading post';
    }
};

// "Go to Dashboard" 버튼 클릭 시 대시보드로 이동
document.getElementById('dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // 대시보드 페이지로 이동
});

// 수정 버튼 클릭 시 수정 페이지로 이동
document.getElementById('edit-btn').addEventListener('click', () => {
    window.location.href = `edit.html?id=${postId}`; // 수정 페이지로 이동
});

// 페이지 로드 시 게시물 세부 정보 불러오기
window.addEventListener('DOMContentLoaded', loadPostDetail);
