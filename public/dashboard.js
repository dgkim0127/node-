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

        // 게시물 썸네일 또는 동영상 표시
        const fileURL = postData.thumbnailURL || postData.fileURL;
        if (fileURL) {
            if (fileURL.match(/\.(jpeg|jpg|gif|png)$/)) {
                // 이미지일 경우
                postElement.innerHTML = `
                    <a href="detail.html?id=${doc.id}">
                        <img src="${fileURL}" alt="썸네일 이미지">
                    </a>
                `;
            } else if (fileURL.match(/\.(mp4|webm|ogg)$/)) {
                // 동영상일 경우
                postElement.innerHTML = `
                    <a href="detail.html?id=${doc.id}">
                        <video src="${fileURL}" controls alt="동영상 미리보기"></video>
                    </a>
                `;
            }
        }

        postContainer.appendChild(postElement);
    });
}

loadPosts();
