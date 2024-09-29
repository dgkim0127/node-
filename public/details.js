import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// URL에서 문서 ID 추출
const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('id');

// 파일 상세 정보를 가져와서 화면에 표시
async function loadFileDetails() {
    if (!docId) {
        document.getElementById('detailsContent').innerText = 'No file selected.';
        return;
    }

    try {
        const docRef = doc(db, 'uploads', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            displayFileDetails(data);
        } else {
            document.getElementById('detailsContent').innerText = 'No details found for this file.';
        }
    } catch (error) {
        document.getElementById('detailsContent').innerText = 'Error fetching details: ' + error.message;
    }
}

// 파일 상세 정보를 화면에 표시하는 함수
function displayFileDetails(data) {
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <h2>품번: ${data.partNumber}</h2>
        <p>사이즈: ${data.size}</p>
        <p>중량: ${data.weight}</p>
        <p>종류: ${data.type}</p>
        <p>설명: ${data.description}</p>
        <img src="${data.thumbnailUrl}" alt="Thumbnail" style="width: 300px;">
        <h3>All Images</h3>
        ${data.imageUrls.map(url => `<img src="${url}" style="width: 100px; margin: 10px;">`).join('')}
    `;
}

loadFileDetails();
