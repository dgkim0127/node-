import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const postContainer = document.querySelector('.posts');

// Firestore에서 게시물 데이터를 불러오기
async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, 'posts'));

    querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // 썸네일만 표시
        const thumbnailURL = postData.thumbnailURL;

        if (thumbnailURL) {
            postElement.innerHTML = `
                <a href="detail.html?id=${doc.id}">
                    <img src="${thumbnailURL}" alt="썸네일 이미지">
                </a>
            `;
        }

        postContainer.appendChild(postElement);
    });
}

loadPosts();
