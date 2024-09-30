import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 게시물 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

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
        document.getElementById('productNumber').textContent = postData.productNumber;
        document.getElementById('type').textContent = postData.type;
        document.getElementById('size').textContent = postData.size;
        document.getElementById('weight').textContent = postData.weight;
        document.getElementById('content').textContent = postData.content || '내용 없음';

        // 미디어 처리 (썸네일 이미지 또는 동영상)
        if (postData.fileURLs && postData.fileURLs.some(url => url.match(/\.(mp4|webm|ogg)$/))) {
            const videoURL = postData.fileURLs.find(url => url.match(/\.(mp4|webm|ogg)$/));
            document.getElementById('mainVideo').src = videoURL;
            document.getElementById('mainVideo').style.display = 'block';
        } else {
            document.getElementById('mainImage').src = postData.thumbnailURL;
            document.getElementById('mainImage').style.display = 'block';
        }

        // 서브 이미지 표시
        postData.fileURLs.forEach((url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
                const subImage = document.createElement('img');
                subImage.src = url;
                subImage.classList.add('sub-image');
                subImage.addEventListener('click', () => {
                    document.getElementById('mainImage').src = url;
                    document.getElementById('mainImage').style.display = 'block';
                    document.getElementById('mainVideo').style.display = 'none';
                });
                document.getElementById('subImagesContainer').appendChild(subImage);
            }
        });
    } else {
        console.log('해당 게시물을 찾을 수 없습니다.');
    }
}

loadPostDetails();
