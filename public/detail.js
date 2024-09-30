import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const saveChangesButton = document.getElementById('saveChanges');

// Firestore에서 게시물 정보 로드
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();

        // 기존 데이터 표시
        productNumberElement.textContent = postData.productNumber;
        typeElement.value = postData.type;
        sizeElement.value = postData.size;
        weightElement.value = postData.weight;
        contentElement.value = postData.content || '';

        // 썸네일 이미지 또는 동영상 표시
        if (postData.fileURLs && postData.fileURLs.some(url => url.match(/\.(mp4|webm|ogg)$/))) {
            const videoURL = postData.fileURLs.find(url => url.match(/\.(mp4|webm|ogg)$/));
            mainVideo.src = videoURL;
            mainVideo.style.display = 'block';
        } else if (postData.thumbnailURL) {
            mainImage.src = postData.thumbnailURL;
            mainImage.style.display = 'block';
        }

        // 서브 이미지 표시
        postData.fileURLs.forEach((url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
                const subImage = document.createElement('img');
                subImage.src = url;
                subImage.classList.add('sub-image');
                subImage.addEventListener('click', () => {
                    mainImage.src = url;
                    mainImage.style.display = 'block';
                    mainVideo.style.display = 'none';
                });
                subImagesContainer.appendChild(subImage);
            }
        });
    } else {
        console.log('게시물을 찾을 수 없습니다.');
    }
}

// 변경사항 저장
async function saveChanges() {
    const updatedType = typeElement.value;
    const updatedSize = sizeElement.value;
    const updatedWeight = weightElement.value;
    const updatedContent = contentElement.value;

    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            type: updatedType,
            size: updatedSize,
            weight: updatedWeight,
            content: updatedContent,
        });
        alert('변경사항이 저장되었습니다.');
    } catch (error) {
        console.error('변경사항 저장 중 오류 발생:', error);
        alert('변경사항 저장에 실패했습니다.');
    }
}

// 이벤트 리스너
saveChangesButton.addEventListener('click', saveChanges);

// 페이지 로드 시 게시물 정보 불러오기
loadPostDetails();
