import { db, storage } from './firebaseConfig.js'; 
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const uploadButton = document.getElementById('uploadButton');
const uploadPopup = document.getElementById('uploadPopup');
const postsContainer = document.getElementById('postsContainer');

// 업로드 버튼 클릭 시 팝업을 열고 닫는 기능
uploadButton.addEventListener('click', () => {
    uploadPopup.classList.toggle('hidden'); // 업로드 팝업을 표시/숨기기
});

// 업로드 폼 처리
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const previewImageFile = document.getElementById('previewImage').files[0];
    const subImageOrVideoFiles = document.getElementById('subImageOrVideo').files;
    const productNumber = document.getElementById('productNumber').value;
    const category = document.getElementById('category').value;
    const weight = document.getElementById('weight').value;
    const size = document.getElementById('size').value;
    const description = document.getElementById('description').value;

    try {
        // Firebase Storage에 파일 업로드
        const previewImageRef = ref(storage, `uploads/${previewImageFile.name}`);
        await uploadBytes(previewImageRef, previewImageFile);
        const previewImageUrl = await getDownloadURL(previewImageRef);

        // Firestore에 게시물 정보 저장
        await addDoc(collection(db, 'posts'), {
            previewImageUrl,
            productNumber,
            category,
            weight,
            size,
            description,
            createdAt: new Date()
        });

        // 업로드 창을 숨김
        uploadPopup.classList.add('hidden');
        loadPosts(); // 게시물 목록 새로고침
    } catch (error) {
        console.error('업로드 실패:', error);
    }
});

// 게시물 목록 불러오기
async function loadPosts() {
    postsContainer.innerHTML = ''; // 기존 게시물 지우기
    const querySnapshot = await getDocs(collection(db, 'posts'));
    querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');
        
        postCard.innerHTML = `
            <img src="${post.previewImageUrl}" alt="미리보기 이미지">
            <h3>${post.productNumber}</h3>
            <p>종류: ${post.category}</p>
            <p>무게: ${post.weight}</p>
            <p>사이즈: ${post.size}</p>
            <p>${post.description}</p>
        `;
        
        postsContainer.appendChild(postCard);
    });
}

// 페이지 로드 시 게시물 목록 불러오기
window.addEventListener('DOMContentLoaded', loadPosts);
