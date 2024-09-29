import { db, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const signupButton = document.getElementById('signupButton');
const uploadSection = document.querySelector('.upload-section');
const fileUploadSection = document.querySelector('.file-upload-section');
const showUploadButton = document.getElementById('showUploadButton');

let currentUser = null;
let isAdmin = false;

// 로그인 처리
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
                showUploadSection();
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

// 회원가입 버튼 클릭 시 처리
signupButton.addEventListener('click', () => {
    const username = prompt("새로운 아이디를 입력하세요:");
    const password = prompt("새로운 비밀번호를 입력하세요:");

    if (username && password) {
        signupUser(username, password);
    }
});

// 회원가입 함수
async function signupUser(username, password) {
    try {
        await addDoc(collection(db, 'users'), {
            username: username,
            password: password,
            isAdmin: false
        });

        loginMessage.textContent = "회원가입이 완료되었습니다! 로그인하세요.";
        loginMessage.style.color = "green";
    } catch (error) {
        loginMessage.textContent = `회원가입 에러: ${error.message}`;
        loginMessage.style.color = "red";
    }
}

// 로그인 후 업로드 버튼 표시
function showUploadSection() {
    loginForm.style.display = "none";
    signupButton.style.display = "none";

    if (isAdmin) {
        uploadSection.style.display = "block";
    } else {
        alert("관리자만 파일을 업로드할 수 있습니다.");
    }
    document.querySelector('.uploaded-files-section').style.display = "block";
    loadUploadedFiles();
}

// 업로드 버튼 클릭 시 파일 업로드 섹션 표시
showUploadButton.addEventListener('click', () => {
    fileUploadSection.style.display = 'block';
    showUploadButton.style.display = 'none';
});

// 파일 업로드 처리
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const thumbnailSelect = document.getElementById('thumbnailSelect');
const message = document.getElementById('message');

// 품번, 사이즈, 중량, 종류, 내용 필드
const partNumberInput = document.getElementById('partNumber');
const sizeInput = document.getElementById('size');
const weightInput = document.getElementById('weight');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = fileInput.files;
    const thumbnailIndex = thumbnailSelect.value;
    const partNumber = partNumberInput.value.trim();
    const size = sizeInput.value.trim();
    const weight = weightInput.value.trim();
    const type = typeInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!files.length || !partNumber || !size || !weight || !type) {
        message.textContent = "모든 필드를 입력하고 파일을 선택하세요!";
        return;
    }

    const imageUrls = [];
    let thumbnailUrl = '';

    try {
        // 각 파일을 Storage에 업로드
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

        // Firestore에 게시물 정보 저장
        await addDoc(collection(db, 'uploads'), {
            partNumber: partNumber,
            size: size,
            weight: weight + 'g',
            type: type,
            description: description,
            thumbnailUrl: thumbnailUrl,
            imageUrls: imageUrls,  // 모든 이미지 URL
            createdAt: new Date()
        });

        message.textContent = "Files uploaded successfully!";
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        message.textContent = "Error uploading files: " + error.message;
    }
});

// 업로드된 파일 목록 불러오기
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
    imgElement.src = thumbnailUrl;  // 썸네일 이미지 표시
    imgElement.style.width = '200px';

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View All Images";
    viewMoreButton.onclick = () => viewAllImages(imageUrls);  // 모든 이미지 보기

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFile(docId, fileElement);

    fileElement.appendChild(imgElement);
    fileElement.appendChild(viewMoreButton);
    fileElement.appendChild(deleteButton);
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

// 파일 삭제 처리
async function deleteFile(docId, fileElement) {
    try {
        await deleteDoc(doc(db, 'uploads', docId)); // Firestore에서 문서 삭제

        fileElement.remove();
        document.getElementById('message').textContent = "File deleted successfully!";
    } catch (error) {
        document.getElementById('message').textContent = "Error deleting file: " + error.message;
    }
}
