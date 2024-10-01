import { db } from './firebaseConfig.js';
import { collection, getDocs, query, limit, startAfter } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let lastVisible = null; // 마지막으로 로드한 게시물의 참조를 저장
const pageSize = 42; // 한 페이지당 게시물 수

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 함수
const loadPosts = async (isNextPage = false) => {
    try {
        const postCollection = collection(db, "posts");
        let postQuery = query(postCollection, limit(pageSize));

        // 다음 페이지를 불러오는 경우, 마지막 게시물 이후부터 가져옴
        if (isNextPage && lastVisible) {
            postQuery = query(postCollection, startAfter(lastVisible), limit(pageSize));
        }

        const postSnapshot = await getDocs(postQuery);
        const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 마지막으로 로드한 문서를 저장하여 다음 페이지에서 사용
        lastVisible = postSnapshot.docs[postSnapshot.docs.length - 1];

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

        // "다음 페이지" 버튼 표시 여부 결정
        const nextPageButton = document.getElementById('next-page-btn');
        if (postList.length < pageSize) {
            nextPageButton.style.display = 'none'; // 더 이상 게시물이 없으면 숨김
        } else {
            nextPageButton.style.display = 'block'; // 다음 페이지가 있을 경우 표시
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        const postGrid = document.getElementById('post-grid');
        postGrid.innerHTML = '<p>Failed to load posts</p>';
    }
};

// 페이지 로드 시 첫 번째 페이지의 게시물을 불러옴
window.addEventListener('DOMContentLoaded', () => loadPosts());

// 다음 페이지로 이동하는 함수
const nextPageButton = document.getElementById('next-page-btn');
nextPageButton.addEventListener('click', () => loadPosts(true));

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
