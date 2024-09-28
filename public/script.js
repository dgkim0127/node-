import { db, auth, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const signupForm = document.getElementById('signupForm');
const signupUsername = document.getElementById('signupUsername');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupMessage = document.getElementById('signupMessage');

const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');

// 회원가입 처리
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();

    if (!username || !email || !password) {
        signupMessage.textContent = "All fields are required!";
        signupMessage.style.color = "red";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore에 아이디와 이메일 저장
        await addDoc(collection(db, 'users'), {
            username: username,
            email: email
        });

        signupMessage.textContent = "Sign up successful!";
        signupMessage.style.color = "green";
    } catch (error) {
        signupMessage.textContent = `Error: ${error.message}`;
        signupMessage.style.color = "red";
    }
});

// 로그인 처리
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        loginMessage.textContent = "Both fields are required!";
        loginMessage.style.color = "red";
        return;
    }

    try {
        // Firestore에서 아이디에 해당하는 이메일 찾기
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const email = userData.email;

            // 이메일로 Firebase Auth 로그인
            await signInWithEmailAndPassword(auth, email, password);
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
            showUploadSection();
        } else {
            loginMessage.textContent = "Username not found.";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        loginMessage.textContent = `Error: ${error.message}`;
        loginMessage.style.color = "red";
    }
});

// 로그인 후 업로드 및 파일 목록 섹션을 보여줌
function showUploadSection() {
    signupForm.style.display = "none";
    loginForm.style.display = "none";
    document.querySelector('.upload-section').style.display = "block";
    document.querySelector('.uploaded-files-section').style.display = "block";
    loadUploadedFiles();  // 파일 목록 로드
}

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
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

// 파일 삭제 처리
async function deleteFile(docId, storagePath, fileElement) {
    try {
        // Firestore에서 문서 삭제
        await deleteDoc(doc(db, 'uploads', docId));

        // Firebase Storage에서 파일 삭제
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);

        // 화면에서 파일 삭제
        fileElement.remove();
        document.getElementById('message').textContent = "File deleted successfully!";
    } catch (error) {
        document.getElementById('message').textContent = "Error deleting file: " + error.message;
    }
}

// 파일 업로드 처리
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "Please select a file!";
        return;
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    
    try {
        await uploadBytes(storageRef, file);
        const fileUrl = await getDownloadURL(storageRef);
        await addDoc(collection(db, 'uploads'), {
            name: file.name,
            url: fileUrl,
            storagePath: storageRef.fullPath,
            createdAt: new Date()
        });
        message.textContent = "File uploaded successfully!";
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});
