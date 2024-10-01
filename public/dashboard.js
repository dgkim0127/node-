import { db } from './firebaseConfig.js';
import { collection, getDocs, query, limit, startAfter, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let lastVisible = null; // 마지막으로 로드한 게시물의 참조를 저장
const pageSize = 42; // 한 페이지당 게시물 수
let currentQuery = null; // 현재 쿼리 저장 (검색 쿼리 및 Type 필터링 포함)

// Firestore에서 데이터를 로드하여 대시보드에 표시하는 함수
const loadPosts = async (isNextPage = false, searchTerm = '', selectedType = '') => {
    try {
        const postCollection = collection(db, "posts");
        let postQuery = query(postCollection, limit(pageSize));

        // Type이 선택된 경우 해당 Type으로 필터링
        if (selectedType) {
            postQuery = query(postCollection, where("type", "==", selectedType));
        }

        const postSnapshot = await getDocs(postQuery);
        let postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 마지막으로 로드한 문서를 저장하여 다음 페이지에서 사용
        lastVisible = postSnapshot.docs[postSnapshot.docs.length - 1];
        currentQuery = postQuery;

        const postGrid = document.getElementById('post-grid');
        postGrid.innerHTML = '';

        if (postList.length === 0) {
            postGrid.innerHTML = '<p>No posts available</p>';
            return;
        }

        // 검색어가 있는 경우 productNumber 필드에서 4자리 숫자만 추출하여 부분 일치 검색
        if (searchTerm) {
            const isNumeric = /^\d+$/.test(searchTerm); // 검색어가 숫자인지 확인
            if (isNumeric) {
                postList = postList.filter(post => {
                    const numberMatch = post.productNumber.match(/\d{4}/); // 품번에서 4자리 숫자 추출
                    return numberMatch && numberMatch[0].includes(searchTerm); // 부분 일치 확인
                });
            }
        }

        // 게시물을 품번의 4자리 숫자 기준으로 오름차순 정렬
        postList = postList.sort((a, b) => {
            const numA = parseInt(a.productNumber.match(/\d{4}/) || 0); // 품번에서 4자리 숫자 추출
            const numB = parseInt(b.productNumber.match(/\d{4}/) || 0);
            return numA - numB; // 오름차순 정렬
        });

        if (postList.length === 0) {
            postGrid.innerHTML = '<p>No matching posts found</p>';
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

// 검색 기능 처리
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    const selectedType = document.getElementById('type-filter').value; // 선택된 Type
    loadPosts(false, searchTerm, selectedType); // 검색어가 변경될 때마다 검색
});

// Type 필터링 기능 처리
const typeFilter = document.getElementById('type-filter');
typeFilter.addEventListener('change', () => {
    const selectedType = typeFilter.value;
    const searchTerm = searchInput.value.trim(); // 현재 입력된 검색어
    loadPosts(false, searchTerm, selectedType); // 선택된 Type에 따라 필터링
});

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
