import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id'); // URL에서 id 가져오기
    const postNameElement = document.getElementById('post-name'); // 이름을 표시할 요소
    const mediaContainer = document.getElementById('media-container');
    const postInfoContainer = document.getElementById('post-info');
    const backButton = document.getElementById('back-btn');

    // 뒤로가기 버튼 기능
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    if (postId) {
        try {
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                const { name, type, size, weight, content, media } = postData;

                // 이름 표시
                postNameElement.textContent = name || 'Unknown Product';

                // 미디어 파일 표시
                media.forEach((mediaURL, index) => {
                    const mediaType = mediaURL.split('.').pop(); // 파일 확장자로 타입 확인
                    if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
                        const videoElement = document.createElement('video');
                        videoElement.src = mediaURL;
                        videoElement.controls = true;
                        mediaContainer.appendChild(videoElement);
                    } else {
                        const imgElement = document.createElement('img');
                        imgElement.src = mediaURL;
                        mediaContainer.appendChild(imgElement);
                    }
                });

                // 제품 정보 표시
                postInfoContainer.innerHTML = `
                    <p>Type: ${type || 'N/A'}</p>
                    <p>Size: ${size || 'N/A'}</p>
                    <p>Weight: ${weight || 'N/A'} g</p>
                    <p>Content: ${content || 'No content provided'}</p>
                `;
            } else {
                postNameElement.textContent = 'Post not found';
            }
        } catch (error) {
            console.error('Error retrieving post data:', error);
            postNameElement.textContent = 'Error loading post';
        }
    } else {
        postNameElement.textContent = 'Invalid post ID';
    }
});
