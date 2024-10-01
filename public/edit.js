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

// Firestore에서 기존 게시물 정보를 로드
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();

        // 폼에 기존 게시물 정보 삽입
        productNumberInput.value = postData.productNumber;
        typeInput.value = postData.type;
        sizeInput.value = postData.size;
        weightInput.value = postData.weight;
        contentInput.value = postData.content || '';
    } else {
        console.log('해당 게시물을 찾을 수 없습니다.');
    }
}

loadPostDetails();

// 게시물 수정 처리
const editForm = document.getElementById('editForm');
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedProductNumber = productNumberInput.value;
    const updatedType = typeInput.value;
    const updatedSize = sizeInput.value;
    const updatedWeight = weightInput.value;
    const updatedContent = contentInput.value;

    try {
        const docRef = doc(db, 'posts', postId);
        await updateDoc(docRef, {
            productNumber: updatedProductNumber,
            type: updatedType,
            size: updatedSize,
            weight: updatedWeight,
            content: updatedContent
        });

        alert('게시물이 성공적으로 수정되었습니다.');
        window.location.href = `detail.html?id=${postId}`;
    } catch (error) {
        console.error('게시물 수정 중 오류 발생:', error);
        alert('게시물 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
});
