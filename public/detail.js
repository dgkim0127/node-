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

        // 서브 이미지와 동영상 모두 표시 (썸네일 포함)
        postData.fileURLs.forEach((url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
                // 이미지 파일 처리
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

            } else if (url.match(/\.(mp4|webm|ogg)$/)) {
                // 동영상 파일 처리
                const subVideo = document.createElement('video');
                subVideo.src = url;
                subVideo.controls = true;
                subVideo.classList.add('sub-image');

                // 서브 동영상 클릭 시 메인 동영상과 교체
                subVideo.addEventListener('click', () => {
                    mainVideo.src = url;
                    mainVideo.style.display = 'block';
                    mainImage.style.display = 'none';  // 이미지 숨기기
                });

                subImagesContainer.appendChild(subVideo);
            }
        });

        // 썸네일이나 메인 미디어를 메인 화면에 설정
        if (postData.fileURLs && postData.fileURLs.length > 0) {
            const firstMedia = postData.fileURLs[0];
            if (firstMedia.match(/\.(jpeg|jpg|gif|png)$/)) {
                mainImage.src = firstMedia;
                mainImage.style.display = 'block';
            } else if (firstMedia.match(/\.(mp4|webm|ogg)$/)) {
                mainVideo.src = firstMedia;
                mainVideo.style.display = 'block';
            }
        }
    } else {
        console.log('해당 게시물을 찾을 수 없습니다.');
    }
}

loadPostDetails();
