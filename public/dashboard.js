import { auth, db, storage } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const postsContainer = document.getElementById('postsContainer');

// 로그인 상태를 확인하고 게시물 불러오기
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadPosts();
    } else {
        window.location.href = 'index.html'; // 로그인 페이지로 이동
    }
});

// 게시물 불러오기
async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, 'posts')); // Firestore에서 'posts' 컬렉션 가져오기
    postsContainer.innerHTML = ''; // 게시물 목록 초기화

    querySnapshot.forEach(async (doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <img src="" alt="게시물 이미지" id="postImage-${doc.id}">
        `;

        // Firebase Storage에서 이미지 URL 불러오기
        const imageRef = ref(storage, post.imagePath);
        const imageUrl = await getDownloadURL(imageRef);
        document.getElementById(`postImage-${doc.id}`).src = imageUrl;

        postsContainer.appendChild(postElement);
    });
}

// 로그아웃 기능
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('로그아웃 성공');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
    }
});
