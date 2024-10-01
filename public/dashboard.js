import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 함수
const loadPosts = async () => {
    try {
        const postCollection = collection(db, "posts");
        const postSnapshot = await getDocs(postCollection);
        const postList = postSnapshot.docs.map(doc => doc.data());

        const postGrid = document.getElementById('post-grid');
        postGrid.innerHTML = '';

        if (postList.length === 0) {
            postGrid.innerHTML = '<p>No posts available</p>';
            return;
        }

        postList.forEach(post => {
            const thumbnail = post.thumbnail || 'default-thumbnail.png';  // 기본 이미지 설정

            const postElement = document.createElement('div');
            postElement.classList.add('post-item');
            postElement.innerHTML = `
                <img src="${thumbnail}" alt="${post.productNumber}">
            `;
            postGrid.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        const postGrid = document.getElementById('post-grid');
        postGrid.innerHTML = '<p>Failed to load posts</p>';
    }
};

// 페이지 로드 시 게시물을 불러옴
window.addEventListener('DOMContentLoaded', loadPosts);
