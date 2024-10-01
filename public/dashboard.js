// dashboard.js
import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 로직
const loadPosts = async () => {
    const postCollection = collection(db, "posts");  // "posts" 컬렉션에서 데이터 가져오기
    const postSnapshot = await getDocs(postCollection);
    const postList = postSnapshot.docs.map(doc => doc.data());

    const postGrid = document.getElementById('post-grid');
    postGrid.innerHTML = '';  // 기존 콘텐츠 초기화

    postList.forEach(post => {
        // 썸네일이 없으면 기본 이미지를 설정
        const thumbnail = post.thumbnail || 'default-thumbnail.png';  // 기본 이미지 경로

        const postElement = document.createElement('div');
        postElement.classList.add('post-item');
        postElement.innerHTML = `
            <img src="${thumbnail}" alt="${post.productNumber}">
            <p>Product: ${post.productNumber}</p>
        `;
        postGrid.appendChild(postElement);
    });
};
