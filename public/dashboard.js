// dashboard.js
import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 예시 코드에서 게시물 데이터를 가져오는 부분
const loadPosts = async () => {
    const postCollection = collection(db, "posts"); // "posts" 컬렉션에서 데이터 가져오기
    const postSnapshot = await getDocs(postCollection);
    const postList = postSnapshot.docs.map(doc => doc.data());

    const postGrid = document.getElementById('post-grid');
    postGrid.innerHTML = ''; // 기존 콘텐츠 초기화

    // 게시물 썸네일을 가져오는 부분에서 undefined 발생 가능성 확인
    postList.forEach(post => {
        if (!post.thumbnail) {
            console.error('Thumbnail is undefined for post:', post);
            return;
        }

        const postElement = document.createElement('div');
        postElement.classList.add('post-item');
        postElement.innerHTML = `
            <img src="${post.thumbnail}" alt="${post.productNumber}">
            <p>Product: ${post.productNumber}</p>
        `;
        postGrid.appendChild(postElement);
    });
};


// 페이지 로드 시 게시물 로드
window.addEventListener('DOMContentLoaded', loadPosts);
