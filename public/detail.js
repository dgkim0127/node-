import { db, auth } from './firebaseConfig.js';
import { doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// URL에서 게시물 ID 가져오기
const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

// 현재 사용자 정보 확인
let currentUser = null;
let isAdmin = false;

// 사용자 인증 상태 확인 및 관리자 권한 확인
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            // Firestore에서 해당 사용자의 관리자 권한 확인
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                isAdmin = userDocSnap.data().isAdmin;
                if (isAdmin) {
                    document.getElementById('deleteButton').style.display = 'block'; // 관리자에게만 삭제 버튼 표시
                } else {
                    console.error("사용자가 관리자 권한이 없습니다.");
                }
            } else {
                console.error("사용자 문서를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("관리자 권한 확인 중 오류:", error);
        }
    } else {
        console.error("사용자가 로그인되지 않았습니다.");
    }
});

// 게시물 정보 불러오기 함수
async function getPostDetails(docId) {
    if (!docId) {
        document.getElementById('detailSection').textContent = "Invalid Post ID.";
        return;
    }

    try {
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
        } else {
            document.getElementById('detailSection').textContent = "게시물을 찾을 수 없습니다.";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        document.getElementById('detailSection').textContent = "게시물 불러오기 에러.";
    }
}

// 게시물 삭제 함수
async function deletePost(docId) {
    if (!docId) {
        alert("게시물 ID가 유효하지 않습니다.");
        return;
    }

    if (isAdmin) {
        const confirmDelete = confirm("정말로 이 게시물을 삭제하시겠습니까?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, 'uploads', docId)); // Firestore에서 문서 삭제
                alert("게시물이 삭제되었습니다.");
                window.location.href = 'index.html'; // 삭제 후 메인 페이지로 이동
            } catch (error) {
                console.error("게시물 삭제 중 오류:", error);
                alert("게시물 삭제 중 오류가 발생했습니다.");
            }
        }
    } else {
        alert("삭제 권한이 없습니다.");
    }
}

// 삭제 버튼 클릭 시 게시물 삭제
document.getElementById('deleteButton').addEventListener('click', () => {
    deletePost(docId);
});

// 페이지 로드 시 게시물 정보 불러오기
getPostDetails(docId);
