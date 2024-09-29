import { db, auth } from './firebaseConfig.js';
import { doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

// 현재 사용자 정보 확인
let currentUser = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            isAdmin = userDocSnap.data().isAdmin;
            if (isAdmin) {
                document.getElementById('deleteButton').style.display = 'block';
            }
        }
    }
});

// 게시물 정보 불러오기 함수
async function getPostDetails(docId) {
    const docRef = doc(db, 'uploads', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('partNumber').textContent = `품번: ${data.partNumber}`;
        document.getElementById('description').textContent = `내용: ${data.description}`;
        document.getElementById('size').textContent = `사이즈: ${data.size}`;
        document.getElementById('weight').textContent = `중량: ${data.weight}`;
        document.getElementById('type').textContent = `종류: ${data.type}`;

        const imagesDiv = document.getElementById('images');
        data.imageUrls.forEach((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '200px';
            imagesDiv.appendChild(img);
        });
    }
}

// 게시물 삭제 함수
async function deletePost(docId) {
    if (isAdmin) {
        const confirmDelete = confirm("정말로 이 게시물을 삭제하시겠습니까?");
        if (confirmDelete) {
            await deleteDoc(doc(db, 'uploads', docId));
            alert("게시물이 삭제되었습니다.");
            window.location.href = 'index.html';
        }
    } else {
        alert("삭제 권한이 없습니다.");
    }
}

document.getElementById('deleteButton').addEventListener('click', () => {
    deletePost(docId);
});

getPostDetails(docId);
