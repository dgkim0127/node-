import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 게시물 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// DOM 요소 참조
const typeElement = document.getElementById('type');
const sizeElement = document.getElementById('size');
const weightElement = document.getElementById('weight');
const contentElement = document.getElementById('content');
const editForm = document.getElementById('editForm');

// Firestore에서 게시물 정보 로드
async function loadPostDetails() {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();

        // 기존 데이터 표시
        typeElement.value = postData.type;
        sizeElement.value = postData.size;
        weightElement.value = postData.weight;
        contentElement.value = postData.content || '';
    } else {
        console.log('게시물을 찾을 수 없습니다.');
    }
}

// 수정된 게시물 저장
async function saveChanges(e) {
    e.preventDefault();

    const updatedType = typeElement.value;
    const updatedSize = sizeElement.value;
    const updatedWeight = weightElement.value;
    const updatedContent = contentElement.value;

    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            type: updatedType,
            size: updatedSize,
            weight: updatedWeight,
            content: updatedContent,
        });
        alert('변경사항이 저장되었습니다.');
        window.location.href = `detail.html?id=${postId}`;  // 저장 후 상세 페이지로 이동
    } catch (error) {
        console.error('변경사항 저장 중 오류 발생:', error);
        alert('변경사항 저장에 실패했습니다.');
    }
}

// 페이지 로드 시 게시물 정보 불러오기
loadPostDetails();
editForm.addEventListener('submit', saveChanges);
