import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 업로드 버튼 클릭 시 페이지 이동
document.getElementById('uploadButton').addEventListener('click', function() {
    window.location.href = 'upload.html';  // 올바른 경로로 설정
});

const postContainer = document.querySelector('.posts');

// Firestore에서 게시물 데이터를 불러오기
async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, 'posts'));

    querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // 썸네일 이미지가 있는지 확인하고 표시
        const thumbnailURL = postData.thumbnailURL;

        if (thumbnailURL) {
            postElement.innerHTML = `
                <a href="detail.html?id=${doc.id}">
                    <img src="${thumbnailURL}" alt="썸네일 이미지">
                </a>
            `;
        } else {
            postElement.innerHTML = `
                <a href="detail.html?id=${doc.id}">
                    <p>이미지가 없습니다</p>
                </a>
            `;
        }

        postContainer.appendChild(postElement);
    });
}

loadPosts();
