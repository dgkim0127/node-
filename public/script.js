import { db, storage } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const form = document.getElementById('postForm');
const fileInput = document.getElementById('fileInput');
const uploadedFiles = document.getElementById('uploadedFiles');
const postButton = document.getElementById('postButton');
const postFormModal = document.getElementById('postFormModal');
const closeModalButton = document.getElementById('closeModal');

// 게시물 작성 페이지 열기
postButton.addEventListener('click', () => {
    postFormModal.style.display = 'flex';
});

// 게시물 작성 페이지 닫기
closeModalButton.addEventListener('click', () => {
    postFormModal.style.display = 'none';
});

// 파일 업로드 후 Firestore에 저장
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = fileInput.files; // 여러 파일 선택 가능
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;

    if (!files.length) {
        alert("Please select at least one file!");
        return;
    }

    const fileUrls = [];
    
    try {
        // 여러 파일을 Firebase Storage에 업로드
        for (const file of files) {
            const fileRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);
            fileUrls.push(fileUrl); // 각 파일의 URL 저장
        }

        // Firestore에 게시물 정보 저장 (제목, 내용은 포함하되, 화면에선 표시하지 않음)
        const docRef = await addDoc(collection(db, 'uploads'), {
            title: postTitle,
            content: postContent,
            fileUrls: fileUrls, // 여러 파일의 URL 배열로 저장
            createdAt: new Date()
        });

        alert("Post uploaded successfully!");
        postFormModal.style.display = 'none'; // 모달 닫기
        displayUploadedFiles(fileUrls, docRef.id);
    } catch (error) {
        alert("Error uploading post: " + error.message);
    }
});

// 업로드된 파일 목록 불러오기 (사진만 표시)
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFiles(data.fileUrls, doc.id);
    });
}

// 업로드된 파일을 화면에 표시하는 함수 (사진만 표시)
function displayUploadedFiles(fileUrls, docId) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    // 여러 이미지 표시
    const imageContainer = document.createElement('div');
    fileUrls.forEach((fileUrl) => {
        const imgElement = document.createElement('img');
        imgElement.src = fileUrl;
        imgElement.alt = "Uploaded Image";
        imgElement.style.width = '100px';
        imgElement.style.marginRight = '10px'; // 이미지 간 간격
        imageContainer.appendChild(imgElement);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFile(docId, fileUrls, fileElement);

    fileElement.appendChild(imageContainer);
    fileElement.appendChild(deleteButton);
    uploadedFiles.appendChild(fileElement);
}

// 파일 삭제 함수
async function deleteFile(docId, fileUrls, fileElement) {
    try {
        // Firestore에서 문서 삭제
        await deleteDoc(doc(db, 'uploads', docId));

        // Firebase Storage에서 여러 파일 삭제
        for (const fileUrl of fileUrls) {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        }

        // 화면에서 파일 삭제
        fileElement.remove();
        alert("File deleted successfully!");
    } catch (error) {
        alert("Error deleting file: " + error.message);
    }
}

// 페이지 로드 시 업로드된 파일 목록을 불러옵니다.
document.addEventListener('DOMContentLoaded', loadUploadedFiles);
