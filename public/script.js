import { db, storage } from './firebaseConfig.js';
import { collection, getDocs, addDoc, query, where, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// 회원가입 처리
const signupForm = document.getElementById('signupForm');
const signupUsername = document.getElementById('signupUsername');
const signupPassword = document.getElementById('signupPassword');
const signupMessage = document.getElementById('signupMessage');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();

    if (!username || !password) {
        signupMessage.textContent = "아이디와 비밀번호를 입력해주세요.";
        signupMessage.style.color = "red";
        return;
    }

    try {
        // Firestore에 사용자 정보 저장
        await addDoc(collection(db, 'users'), {
            username: username,
            password: password,
            isAdmin: false  // 기본값: 관리자 아님
        });
        signupMessage.textContent = "회원가입이 완료되었습니다!";
        signupMessage.style.color = "green";
    } catch (error) {
        signupMessage.textContent = `에러: ${error.message}`;
        signupMessage.style.color = "red";
    }
});

// 로그인 처리
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        loginMessage.textContent = "아이디와 비밀번호를 입력해주세요.";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            if (userData.password === password) {
                loginMessage.textContent = "로그인 성공!";
                loginMessage.style.color = "green";
                currentUser = userData;
                isAdmin = userData.isAdmin;
                showUploadSection(); // 관리자일 때 업로드 섹션 보이기
            } else {
                loginMessage.textContent = "비밀번호가 틀렸습니다.";
                loginMessage.style.color = "red";
            }
        } else {
            loginMessage.textContent = "아이디를 찾을 수 없습니다.";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        loginMessage.textContent = `에러: ${error.message}`;
        loginMessage.style.color = "red";
    }
});

// 로그인 후 업로드 섹션 활성화
function showUploadSection() {
    loginForm.style.display = "none";
    signupForm.style.display = "none";

    if (isAdmin) {
        document.querySelector('.upload-section').style.display = "block";
    } else {
        alert("관리자만 파일을 업로드할 수 있습니다.");
    }
    document.querySelector('.uploaded-files-section').style.display = "block";
    loadUploadedFiles();  // 업로드된 파일 목록 불러오기
}

// 업로드된 파일 목록 불러오기
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    
    if (querySnapshot.empty) {
        console.log("No uploaded files found.");
        return;
    }
    
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
        await deleteDoc(doc(db, 'uploads', docId));

        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);

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
    if (!isAdmin) {
        message.textContent = "관리자만 파일을 업로드할 수 있습니다!";
        message.style.color = "red";
        return;
    }

    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "파일을 선택해주세요!";
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
        message.textContent = "파일이 성공적으로 업로드되었습니다!";
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        message.textContent = `파일 업로드 오류: ${error.message}`;
    }
});
