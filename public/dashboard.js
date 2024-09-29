import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 업로드 버튼 클릭 시 페이지 이동
document.getElementById('uploadButton').addEventListener('click', function() {
    window.location.href = 'upload.html';  // 업로드 페이지로 이동
});

const postContainer = document.querySelector('.posts');

// Firestore에서 게시물 데이터를 불러오기
async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    
    querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <img src="${postData.fileURL}" alt="${postData.productNumber}">
            <div class="info">
                <p>품번: ${postData.productNumber}</p>
                <p>종류: ${postData.type}</p>
                <p>중량: ${postData.weight}</p>
                <p>사이즈: ${postData.size}</p>
                <p>내용: ${postData.content}</p>
            </div>
        `;

        postContainer.appendChild(postElement);
    });
}

loadPosts();
