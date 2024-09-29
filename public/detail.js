import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 게시물 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postDetails = document.getElementById('postDetails');

// Firestore에서 게시물 상세 정보 불러오기
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();
        postDetails.innerHTML = `
            <div class="post">
                <img src="${postData.thumbnailURL}" alt="썸네일 이미지" />
                <div class="info">
                    <p>품번: ${postData.productNumber}</p>
                    <p>종류: ${postData.type}</p>
                    <p>중량: ${postData.weight}</p>
                    <p>사이즈: ${postData.size}</p>
                    <p>내용: ${postData.content}</p>
                </div>
                <a href="${postData.fileURL}" target="_blank">파일 보기</a>
            </div>
        `;
    } else {
        postDetails.innerHTML = `<p>게시물을 찾을 수 없습니다.</p>`;
    }
}

loadPostDetails();
