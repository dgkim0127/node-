import { db, storage } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
        const docRef = await addDoc(collection(db, 'uploads'), {
            name: file.name,
            url: fileUrl,
            storagePath: fileRef.fullPath, // Firebase Storage의 파일 경로 저장
            createdAt: new Date()
        });

        displayUploadedFile(file.name, fileUrl, docRef.id, fileRef.fullPath);
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});

// 업로드된 파일 목록 불러오기
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.name, data.url, doc.id, data.storagePath);
    });
}

// 업로드된 파일을 화면에 표시하는 함수
function displayUploadedFile(fileName, fileUrl, docId, storagePath) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = fileUrl;
    imgElement.alt = fileName;
    imgElement.style.width = '200px';

    const nameElement = document.createElement('p');
    nameElement.textContent = fileName;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFile(docId, storagePath, fileElement);

    fileElement.appendChild(imgElement);
    fileElement.appendChild(nameElement);
    fileElement.appendChild(deleteButton);
    uploadedFiles.appendChild(fileElement);
}

// 파일 삭제 함수
async function deleteFile(docId, storagePath, fileElement) {
    try {
        // Firestore에서 문서 삭제
        await deleteDoc(doc(db, 'uploads', docId));

        // Firebase Storage에서 파일 삭제
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);

        // 화면에서 파일 삭제
        fileElement.remove();
        message.textContent = "File deleted successfully!";
    } catch (error) {
        message.textContent = "Error deleting file: " + error.message;
    }
}

// 페이지 로드 시 업로드된 파일 목록을 불러옵니다.
document.addEventListener('DOMContentLoaded', loadUploadedFiles);
