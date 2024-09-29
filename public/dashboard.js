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

        // 게시물 썸네일만 표시, 클릭 시 상세페이지로 이동
        postElement.innerHTML = `
            <a href="detail.html?id=${doc.id}">
                <img src="${postData.thumbnailURL}" alt="썸네일 이미지">
            </a>
        `;

        postContainer.appendChild(postElement);
    });
}

loadPosts();
