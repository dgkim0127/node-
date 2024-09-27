import { db, storage } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');
const uploadedFiles = document.getElementById('uploadedFiles');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "Please select a file!";
        return;
    }

    // Firebase Storage에 파일 업로드
    const storageRef = ref(storage);
    const fileRef = ref(storageRef, file.name);
    
    try {
        await uploadBytes(fileRef, file);
        message.textContent = "File uploaded successfully!";

        // Firestore에 메타데이터 저장
        const fileUrl = await getDownloadURL(fileRef);
        await addDoc(collection(db, 'uploads'), { // Firestore에 문서를 추가
            name: file.name,
            url: fileUrl,
            createdAt: new Date() // 서버 시간을 사용하지 않으므로 Date 사용
        });

        displayUploadedFile(file.name, fileUrl);
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});

function displayUploadedFile(fileName, fileUrl) {
    const fileElement = document.createElement('a');
    fileElement.textContent = fileName;
    fileElement.href = fileUrl;
    fileElement.target = "_blank"; // 새 탭에서 열기
    uploadedFiles.appendChild(fileElement);
    uploadedFiles.appendChild(document.createElement('br'));
}
