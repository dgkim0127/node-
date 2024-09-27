import { db, storage } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');
const uploadedFiles = document.getElementById('uploadedFiles');

// 파일 업로드 후 Firestore에 저장
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "Please select a file!";
        return;
    }

    const storageRef = ref(storage);
    const fileRef = ref(storageRef, file.name);
    
    try {
        await uploadBytes(fileRef, file);
        message.textContent = "File uploaded successfully!";

        const fileUrl = await getDownloadURL(fileRef);
        await addDoc(collection(db, 'uploads'), {
            name: file.name,
            url: fileUrl,
            createdAt: new Date() 
        });

        displayUploadedFile(file.name, fileUrl);
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});

// 업로드된 파일 목록 불러오기
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.name, data.url);
    });
}

// 업로드된 파일을 화면에 표시하는 함수
function displayUploadedFile(fileName, fileUrl) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = fileUrl;
    imgElement.alt = fileName;
    imgElement.style.width = '200px'; // 이미지 크기 조절

    const nameElement = document.createElement('p');
    nameElement.textContent = fileName;

    fileElement.appendChild(imgElement);
    fileElement.appendChild(nameElement);
    uploadedFiles.appendChild(fileElement);
}

// 페이지 로드 시 업로드된 파일 목록을 불러옵니다.
document.addEventListener('DOMContentLoaded', loadUploadedFiles);
