// dashboard.js
import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firestore에서 게시물 데이터를 로드하는 함수
const loadPosts = async () => {
    const postCollection = collection(db, "posts"); // "posts" 컬렉션에서 데이터 가져오기
    const postSnapshot = await getDocs(postCollection); // 데이터 스냅샷 가져오기
    const postList = postSnapshot.docs.map(doc => doc.data()); // 데이터 리스트로 변환

    const postGrid = document.getElementById('post-grid');
    postGrid.innerHTML = ''; // 기존 콘텐츠 초기화

    // 각 게시물을 썸네일 형태로 표시
    postList.forEach(post => {
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
