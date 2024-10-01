import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// URL 쿼리 스트링에서 ID 가져오기
const getPostIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');  // 쿼리 스트링에서 'id' 값을 반환
};

// Firestore에서 게시물 데이터를 가져와 상세 페이지에 표시
const loadPostDetail = async () => {
    const postId = getPostIdFromURL();
    if (!postId) {
        console.error('No post ID found in URL');
        return;
    }

    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const postData = postSnap.data();
            document.getElementById('product-number').textContent = `Product Number: ${postData.productNumber}`;
            document.getElementById('post-image').src = postData.thumbnail || 'default-thumbnail.png';
            // 추가적인 상세 정보도 여기에 표시 가능
        } else {
            console.error('No such post!');
        }
    } catch (error) {
        console.error('Error loading post:', error);
    }
};

// 페이지 로드 시 상세 정보를 불러옴
window.addEventListener('DOMContentLoaded', loadPostDetail);


loadPostDetails();
