import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 게시물 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postNameElement = document.getElementById('post-name');
const productNameInput = document.getElementById('product-name');
const productTypeInput = document.getElementById('product-type');
const productSizeInput = document.getElementById('product-size');
const productWeightInput = document.getElementById('product-weight');
const productContentInput = document.getElementById('product-content');
const mainMediaContainer = document.getElementById('main-media-container');
const thumbnailGallery = document.getElementById('thumbnail-gallery');

// Firestore에서 게시물 데이터를 불러와 수정 가능한 폼에 표시하는 함수
const loadPostDetailForEdit = async () => {
    if (!postId) {
        postNameElement.textContent = 'Post Not Found';
        return;
    }

    try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
            const postData = postDoc.data();
            postNameElement.textContent = postData.productNumber || "No Product Number";

            // 폼 필드에 기존 데이터 채우기
            productNameInput.value = postData.name || '';
            productTypeInput.value = postData.type || '';
            productSizeInput.value = postData.size || '';
            productWeightInput.value = postData.weight || '';
            productContentInput.value = postData.content || '';

            // 메인 미디어 표시
            const mainMediaURL = postData.media[0];
            const mediaType = mainMediaURL.split('.').pop().split('?')[0];
            if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
                const videoElement = document.createElement('video');
                videoElement.src = mainMediaURL;
                videoElement.controls = true;
                videoElement.style.width = '60%';
                mainMediaContainer.appendChild(videoElement);
            } else {
                const imgElement = document.createElement('img');
                imgElement.src = mainMediaURL;
                imgElement.alt = "Main media image";
                imgElement.style.width = '60%';
                mainMediaContainer.appendChild(imgElement);
            }

            // 썸네일 갤러리 표시
            postData.media.forEach((mediaURL, index) => {
                if (index > 0) {
                    const imgElement = document.createElement('img');
                    imgElement.src = mediaURL;
                    imgElement.alt = `Thumbnail ${index}`;
                    thumbnailGallery.appendChild(imgElement);
                }
            });
        } else {
            postNameElement.textContent = 'Post Not Found';
        }
    } catch (error) {
        console.error("Error loading post details for edit:", error);
        postNameElement.textContent = 'Error loading post';
    }
};

// DOM이 로드된 후에 이벤트 리스너를 추가
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-form');
    const backButton = document.getElementById('back-btn');

    if (editForm) {
        // 게시물 수정 폼 제출 처리
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedData = {
                name: productNameInput.value,
                type: productTypeInput.value,
                size: productSizeInput.value,
                weight: productWeightInput.value,
                content: productContentInput.value
            };

            try {
                await updateDoc(doc(db, "posts", postId), updatedData);
                alert('Post updated successfully!');
                window.location.href = `detail.html?id=${postId}`; // 수정 후 상세 페이지로 돌아가기
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Error updating post');
            }
        });
    }

    if (backButton) {
        // 뒤로가기 버튼 클릭 시
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // 페이지 로드 시 게시물 세부 정보 불러오기
    loadPostDetailForEdit();
});
