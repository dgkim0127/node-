import { db, storage } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

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
    const storageRef = ref(storage); // 수정된 부분
    const fileRef = ref(storageRef, file.name); // 수정된 부분
    
    try {
        await uploadBytes(fileRef, file); // uploadBytes로 파일 업로드
        message.textContent = "File uploaded successfully!";

        // Firestore에 메타데이터 저장
        const fileUrl = await getDownloadURL(fileRef); // 수정된 부분
        await db.collection('uploads').add({
            name: file.name,
            url: fileUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        displayUploadedFile(file.name, fileUrl);
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});

// 업로드된 파일을 표시하는 함수
function displayUploadedFile(fileName, fileUrl) {
    const fileElement = document.createElement('a');
    fileElement.textContent = fileName;
    fileElement.href = fileUrl;
    fileElement.target = "_blank"; // 새 탭에서 열기
    uploadedFiles.appendChild(fileElement);
    uploadedFiles.appendChild(document.createElement('br'));
}
