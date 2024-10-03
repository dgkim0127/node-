import { db, storage } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// 게시물 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

let existingMediaURLs = []; // 기존 미디어 URLs
let selectedMediaIndex = null; // 선택한 미디어 인덱스
let newMediaURLs = []; // 새로운 미디어 URLs

document.addEventListener('DOMContentLoaded', async () => {
    const postNameElement = document.getElementById('post-name');
    const productNameInput = document.getElementById('product-name');
    const productTypeInput = document.getElementById('product-type');
    const productSizeInput = document.getElementById('product-size');
    const productWeightInput = document.getElementById('product-weight');
    const productContentInput = document.getElementById('product-content');
    const mainMediaContainer = document.getElementById('main-media-container');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const previewGrid = document.getElementById('preview-grid');
    const deleteMediaBtn = document.getElementById('delete-media-btn');
    const editForm = document.getElementById('edit-form');
    const backButton = document.getElementById('back-btn');

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

                existingMediaURLs = postData.media || [];

                // 메인 미디어 표시
                const mainMediaURL = existingMediaURLs[0];
                displayMainMedia(mainMediaURL);

                // 썸네일 갤러리 표시
                existingMediaURLs.forEach((mediaURL, index) => {
                    createThumbnail(mediaURL, index);
                });
            } else {
                postNameElement.textContent = 'Post Not Found';
            }
        } catch (error) {
            console.error("Error loading post details for edit:", error);
            postNameElement.textContent = 'Error loading post';
        }
    };

    // 메인 미디어 표시 함수
    const displayMainMedia = (mediaURL) => {
        const mediaType = mediaURL.split('.').pop().split('?')[0];
        mainMediaContainer.innerHTML = '';
        if (['mp4', 'webm', 'ogg'].includes(mediaType)) {
            const videoElement = document.createElement('video');
            videoElement.src = mediaURL;
            videoElement.controls = true;
            videoElement.style.width = '60%';
            mainMediaContainer.appendChild(videoElement);
        } else {
            const imgElement = document.createElement('img');
            imgElement.src = mediaURL;
            imgElement.alt = "Main media image";
            imgElement.style.width = '60%';
            mainMediaContainer.appendChild(imgElement);
        }
    };

    // 썸네일 생성 함수
    const createThumbnail = (mediaURL, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = mediaURL;
        imgElement.alt = `Thumbnail ${index}`;
        imgElement.addEventListener('click', () => {
            displayMainMedia(mediaURL);
            selectedMediaIndex = index; // 선택한 미디어 인덱스 저장
            deleteMediaBtn.style.display = 'block'; // 미디어 선택 시 삭제 버튼 표시
        });
        thumbnailGallery.appendChild(imgElement);
    };

    // 미디어 파일 미리보기
    mediaFilesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewGrid.innerHTML = ''; // 기존 미리보기 초기화
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const mediaType = file.type.split('/')[0];
                if (mediaType === 'image') {
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;
                    previewGrid.appendChild(imgElement);
                } else if (mediaType === 'video') {
                    const videoElement = document.createElement('video');
                    videoElement.src = e.target.result;
                    videoElement.controls = true;
                    previewGrid.appendChild(videoElement);
                }
            };
            reader.readAsDataURL(file);
        });
    });

    // 미디어 삭제 버튼 클릭 시
    if (deleteMediaBtn) {
        deleteMediaBtn.addEventListener('click', async () => {
            if (selectedMediaIndex !== null && existingMediaURLs[selectedMediaIndex]) {
                const mediaURL = existingMediaURLs[selectedMediaIndex];

                // Firebase Storage에서 해당 파일 삭제
                const storageRef = ref(storage, mediaURL);
                try {
                    await deleteObject(storageRef);
                    existingMediaURLs.splice(selectedMediaIndex, 1); // 미디어 URL 배열에서 제거
                    selectedMediaIndex = null;
                    deleteMediaBtn.style.display = 'none'; // 삭제 후 버튼 숨김
                    alert('Media deleted successfully!');
                    thumbnailGallery.innerHTML = ''; // 썸네일 갤러리 초기화
                    existingMediaURLs.forEach((mediaURL, index) => createThumbnail(mediaURL, index)); // 갤러리 재구성
                } catch (error) {
                    console.error('Error deleting media:', error);
                    alert('Error deleting media');
                }
            }
        });
    }

    // 게시물 수정 폼 제출 처리
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 기존 필드 업데이트
            const updatedData = {
                name: productNameInput.value,
                type: productTypeInput.value,
                size: productSizeInput.value,
                weight: productWeightInput.value,
                content: productContentInput.value,
                media: existingMediaURLs // 삭제 및 추가된 미디어 반영
            };

            // 새로운 미디어 업로드
            const files = mediaFilesInput.files;
            if (files.length > 0) {
                newMediaURLs = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const storageRef = ref(storage, `media/${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);
                    newMediaURLs.push(downloadURL);
                }
                updatedData.media = [...existingMediaURLs, ...newMediaURLs];
            }

            try {
                await updateDoc(doc(db, "posts", postId), updatedData);
                alert('Post updated successfully!');
                window.location.href = `detail.html?id=${postId}`;
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Error updating post');
            }
        });
    }

    // 뒤로가기 버튼
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    loadPostDetailForEdit();
});
