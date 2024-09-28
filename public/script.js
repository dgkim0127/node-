import { db, storage, auth } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginMessage = document.getElementById('loginMessage');

const uploadSection = document.querySelector('.upload-section');
const uploadedFilesSection = document.querySelector('.uploaded-files-section');

// 로그인 처리
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";
        showUploadSection();
    } catch (error) {
        loginMessage.textContent = `Error: ${error.message}`;
        loginMessage.style.color = "red";
    }
});

// 로그인 후 업로드 및 파일 목록 섹션을 보여줌
function showUploadSection() {
    loginForm.style.display = "none";
    uploadSection.style.display = "block";
    uploadedFilesSection.style.display = "block";
    loadUploadedFiles();  // 파일 목록 로드
}

// 현재 로그인 상태를 감지
onAuthStateChanged(auth, (user) => {
    if (user) {
        showUploadSection();
    } else {
        loginForm.style.display = "block";
        uploadSection.style.display = "none";
        uploadedFilesSection.style.display = "none";
    }
});

// 기존 파일 업로드 코드는 그대로 유지
