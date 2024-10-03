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
        // Firestore에서 게시물 정보 가져오기
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
            const postData = postDoc.data();
            console.log(postData); // 데이터 로드 확인용 콘솔 로그

            // 게시물 이름 설정
            postNameElement.textContent = postData.productNumber || "No Name";

            // 미디어 배열이 없는 경우 기본 메시지 표시
            if (!postData.media || postData.media.length === 0) {
                mainMediaContainer.innerHTML = '<p>No media available</p>';
                return;
            }

            // 메인 동영상 또는 이미지 표시
            const mainMediaURL = postData.media[0]; // 첫 번째 미디어를 메인으로 설정
            const mediaType = mainMediaURL.split('.').pop(); // 파일 확장자로 타입 결정

            if (mediaType === 'mp4' || mediaType === 'webm' || mediaType === 'ogg') {
                // 동영상일 경우
                const videoElement = document.createElement('video');
                videoElement.src = mainMediaURL;
                videoElement.controls = true;
                videoElement.style.width = '60%'; // 메인 비디오 크기
                mainMediaContainer.appendChild(videoElement);
            } else {
                // 이미지일 경우
                const imgElement = document.createElement('img');
                imgElement.src = mainMediaURL;
                imgElement.alt = "Main media image";
                imgElement.style.width = '60%'; // 메인 이미지 크기
                mainMediaContainer.appendChild(imgElement);
            }

            // 미리보기 갤러리에 나머지 미디어 추가
            postData.media.forEach((mediaURL, index) => {
                if (index > 0) {
                    const imgElement = document.createElement('img');
                    imgElement.src = mediaURL;
                    imgElement.alt = `Thumbnail ${index}`;
                    imgElement.addEventListener('click', () => {
                        // 클릭 시 메인 미디어 변경
                        mainMediaContainer.innerHTML = ''; // 기존 미디어 제거
                        const newMediaType = mediaURL.split('.').pop();
                        if (newMediaType === 'mp4' || newMediaType === 'webm' || newMediaType === 'ogg') {
                            const newVideoElement = document.createElement('video');
                            newVideoElement.src = mediaURL;
                            newVideoElement.controls = true;
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
                    thumbnailGallery.appendChild(imgElement);
                }
            });

            // 게시물 정보 표시
            postInfoSection.innerHTML = `
                <p><strong>Product Number:</strong> ${postData.productNumber || 'N/A'}</p>
                <p><strong>Type:</strong> ${Array.isArray(postData.type) ? postData.type.join(', ') : postData.type || 'N/A'}</p>
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

// 뒤로가기 버튼 클릭 시
document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back();
});

// 페이지 로드 시 게시물 세부 정보 불러오기
window.addEventListener('DOMContentLoaded', loadPostDetail);
