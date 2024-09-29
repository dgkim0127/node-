import { db, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// 팝업 창 관련 요소
const modal = document.getElementById('uploadModal');
const closeBtn = document.querySelector('.close');
const openUploadModalButton = document.getElementById('openUploadModalButton');
const popupUploadForm = document.getElementById('popupUploadForm');
const popupFileInput = document.getElementById('popupFileInput');
const popupThumbnailSelect = document.getElementById('popupThumbnailSelect');
const popupMessage = document.getElementById('popupMessage');

// 팝업 열기
openUploadModalButton.addEventListener('click', () => {
    modal.style.display = "block";
});

// 팝업 닫기
closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

// 팝업 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
});

// 파일 선택 시 대표 이미지 선택 옵션 업데이트
popupFileInput.addEventListener('change', () => {
    const files = popupFileInput.files;
    popupThumbnailSelect.innerHTML = ''; // 기존 옵션 제거

    Array.from(files).forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = file.name;
        popupThumbnailSelect.appendChild(option);
    });
});

// 팝업 창에서 파일 업로드 처리
popupUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = popupFileInput.files;
    const thumbnailIndex = popupThumbnailSelect.value;

    if (!files.length) {
        popupMessage.textContent = "Please select at least one file!";
        return;
    }

    const imageUrls = [];
    let thumbnailUrl = '';

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            imageUrls.push(fileUrl);

            if (i == thumbnailIndex) {
                thumbnailUrl = fileUrl;
            }
        }

        await addDoc(collection(db, 'uploads'), {
            thumbnailUrl: thumbnailUrl,
            imageUrls: imageUrls,
            createdAt: new Date()
        });

        popupMessage.textContent = "Files uploaded successfully!";
        modal.style.display = "none";  // 업로드 후 팝업 닫기
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        popupMessage.textContent = "Error uploading files: " + error.message;
    }
});

// 업로드된 파일 목록 불러오기
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.thumbnailUrl, data.imageUrls);
    });
}

// 업로드된 파일을 화면에 표시하는 함수
function displayUploadedFile(thumbnailUrl, imageUrls) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = thumbnailUrl;  // 썸네일 이미지 표시
    imgElement.style.width = '200px';

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View All Images";
    viewMoreButton.onclick = () => viewAllImages(imageUrls);  // 모든 이미지 보기

    fileElement.appendChild(imgElement);
    fileElement.appendChild(viewMoreButton);
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

// 상세 페이지에서 모든 이미지 표시
function viewAllImages(imageUrls) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    imageUrls.forEach((url) => {
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.style.width = '200px';
        modal.appendChild(imgElement);
    });

    document.body.appendChild(modal);
}
