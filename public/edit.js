import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 게시물 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// DOM 요소 참조
const productNumberInput = document.getElementById('productNumber');
const typeInput = document.getElementById('type');
const sizeInput = document.getElementById('size');
const weightInput = document.getElementById('weight');
const contentInput = document.getElementById('content');
const saveButton = document.getElementById('saveButton');

// Firestore에서 게시물 정보 로드
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();

        // 게시물 정보를 입력 필드에 표시
        productNumberInput.value = postData.productNumber;
        typeInput.value = postData.type;
        sizeInput.value = postData.size;
        weightInput.value = postData.weight;
        contentInput.value = postData.content || '';
    } else {
        console.log('해당 게시물을 찾을 수 없습니다.');
    }
}

// 게시물 업데이트 처리
saveButton.addEventListener('click', async () => {
    const updatedProductNumber = productNumberInput.value;
    const updatedType = typeInput.value;
    const updatedSize = sizeInput.value;
    const updatedWeight = weightInput.value;
    const updatedContent = contentInput.value || '내용 없음';

    try {
        const docRef = doc(db, 'posts', postId);
        await updateDoc(docRef, {
            productNumber: updatedProductNumber,
            type: updatedType,
            size: updatedSize,
            weight: updatedWeight,
            content: updatedContent
        });

        alert('수정 완료!');
        window.location.href = `detail.html?id=${postId}`;
    } catch (error) {
        console.error('수정 중 오류 발생:', error);
        alert('수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});

// 게시물 로드
loadPostDetails();
