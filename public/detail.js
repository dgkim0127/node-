import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 id 쿼리 매개변수 가져오기
const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

// Firestore에서 해당 ID로 문서 가져오기
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
            document.getElementById('detailSection').textContent = "No such document!";
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        document.getElementById('detailSection').textContent = "Error fetching post details.";
    }
}

// 문서 정보 불러오기
getPostDetails(docId);
