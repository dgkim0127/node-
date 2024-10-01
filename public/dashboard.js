import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 함수
const loadPosts = async () => {
    try {
        const postCollection = collection(db, "posts");  // Firestore의 "posts" 컬렉션 참조
        const postSnapshot = await getDocs(postCollection);  // 컬렉션에서 문서 가져오기
        const postList = postSnapshot.docs.map(doc => doc.data());  // 문서 데이터를 배열로 변환

        const postGrid = document.getElementById('post-grid');  // 게시물을 표시할 그리드 요소 가져오기
        postGrid.innerHTML = '';  // 기존 콘텐츠 초기화

        if (postList.length === 0) {
            // 게시물이 없을 경우
            postGrid.innerHTML = '<p>No posts available</p>';
            return;
        }

        postList.forEach(post => {
            // 썸네일이 없으면 기본 이미지를 설정
            const thumbnail = post.thumbnail || 'default-thumbnail.png';  // 기본 이미지 경로 설정

            const postElement = document.createElement('div');
            postElement.classList.add('post-item');
            postElement.innerHTML = `
                <img src="${thumbnail}" alt="${post.productNumber}">
                <p>Product: ${post.productNumber}</p>
            `;
            postGrid.appendChild(postElement);  // 그리드에 게시물 추가
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        const postGrid = document.getElementById('post-grid');
        postGrid.innerHTML = '<p>Failed to load posts</p>';  // 오류 메시지 표시
    }
};

// 페이지 로드 시 게시물을 불러옴
window.addEventListener('DOMContentLoaded', loadPosts);
