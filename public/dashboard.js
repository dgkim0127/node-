import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 함수
const loadPosts = async () => {
    try {
        const postCollection = collection(db, "posts");
        const postSnapshot = await getDocs(postCollection);
        const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

            // 게시물을 클릭하면 상세 페이지로 이동
            postElement.addEventListener('click', () => {
                window.location.href = `detail.html?id=${post.id}`;  // 제품 ID를 URL에 포함
            });

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

// 업로드 버튼 클릭 시 업로드 페이지로 이동
const uploadButton = document.getElementById('upload-button');
uploadButton.addEventListener('click', () => {
    window.location.href = 'upload.html';
});

// 회원가입 버튼 클릭 시 회원가입 페이지로 이동
const signupButton = document.getElementById('signup-button');
signupButton.addEventListener('click', () => {
    window.location.href = 'signup.html';  // 회원가입 페이지로 이동
});
