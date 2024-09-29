import { db, auth, storage } from './firebaseConfig.js';  // Firebase 설정 가져오기
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// 로그인 처리
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("로그인 성공:", userCredential.user);
        // 로그인 성공 후, 파일 업로드 섹션 표시
        document.querySelector('.upload-section').style.display = 'block';
    } catch (error) {
        console.error("로그인 실패:", error.message);
    }
});

// 파일 업로드 및 썸네일 선택 기능
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const thumbnailSelect = document.getElementById('thumbnailSelect');

// 파일 미리보기 및 썸네일 선택 기능
fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    thumbnailSelect.innerHTML = '';  // 기존 목록 비우기

    Array.from(files).forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Thumbnail ${index + 1}: ${file.name}`;
        thumbnailSelect.appendChild(option);  // 썸네일 선택 목록에 파일 이름 추가
    });
});

// 파일 업로드 처리
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = fileInput.files;
    const partNumber = document.getElementById('partNumber').value;
    const size = document.getElementById('size').value;
    const weight = document.getElementById('weight').value;
    const type = document.getElementById('type').value;

    if (!files.length || !partNumber || !size || !weight || !type) {
        document.getElementById('message').textContent = "모든 필드를 입력하고 파일을 선택하세요!";
        return;
    }

    const selectedThumbnailIndex = thumbnailSelect.value;  // 사용자가 선택한 썸네일 인덱스
    const imageUrls = [];
    let thumbnailUrl = '';

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            imageUrls.push(fileUrl);

            // 선택한 파일을 썸네일로 지정
            if (i == selectedThumbnailIndex) {
                thumbnailUrl = fileUrl;
            }
        }

        await addDoc(collection(db, 'uploads'), {
            partNumber,
            size,
            weight: `${weight}g`,
            type,
            description: document.getElementById('description').value,
            thumbnailUrl,
            imageUrls,
            createdAt: new Date()
        });

        document.getElementById('message').textContent = "파일 업로드 성공!";
        loadUploadedFiles();
    } catch (error) {
        document.getElementById('message').textContent = `파일 업로드 실패: ${error.message}`;
    }
});

// 파일 목록 로드 (기존 파일 불러오기)
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.thumbnailUrl, data.imageUrls, doc.id);
    });
}

// 업로드된 파일을 화면에 표시하는 함수
function displayUploadedFile(thumbnailUrl, imageUrls, docId) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = thumbnailUrl;
    imgElement.style.width = '200px';

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View Details";
    viewMoreButton.onclick = () => viewDetailsPage(docId);  // 상세 페이지로 이동

    fileElement.appendChild(imgElement);
    fileElement.appendChild(viewMoreButton);
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

// 상세 페이지로 이동하는 함수
function viewDetailsPage(docId) {
    window.location.href = `details.html?id=${docId}`;
}
