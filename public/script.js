import { db, storage, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const signupButton = document.getElementById('signupButton');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const thumbnailSelect = document.getElementById('thumbnailSelect');
const message = document.getElementById('message');

// 추가 필드
const partNumberInput = document.getElementById('partNumber');
const sizeInput = document.getElementById('size');
const weightInput = document.getElementById('weight');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');

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
        // Firestore에서 아이디로 사용자 정보 찾기
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            // 입력된 비밀번호와 Firestore에 저장된 비밀번호 비교
            if (userData.password === password) {
                loginMessage.textContent = "로그인 성공!";
                loginMessage.style.color = "green";

                // 사용자 권한 및 추가 작업 처리
                currentUser = userData;  // currentUser 변수 초기화
                isAdmin = userData.isAdmin;
                showUploadSection();  // 관리자만 접근 가능한 업로드 섹션 활성화
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
        // Firestore에 사용자 정보 저장 (아이디와 비밀번호)
        await addDoc(collection(db, 'users'), {
            username: username,
            password: password,
            isAdmin: false  // 기본값은 관리자 아님
        });

        loginMessage.textContent = "회원가입이 완료되었습니다! 로그인하세요.";
        loginMessage.style.color = "green";
    } catch (error) {
        loginMessage.textContent = `회원가입 에러: ${error.message}`;
        loginMessage.style.color = "red";
    }
}

// 로그인 후 업로드 버튼만 표시
function showUploadSection() {
    loginForm.style.display = "none";
    signupButton.style.display = "none";

    if (isAdmin) {
        uploadSection.style.display = "block";  // 업로드 버튼 표시
    } else {
        alert("관리자만 파일을 업로드할 수 있습니다.");
    }
    document.querySelector('.uploaded-files-section').style.display = "block";
    loadUploadedFiles();  // 파일 목록 로드
}

// 업로드 버튼 클릭 시 파일 업로드 섹션 표시
showUploadButton.addEventListener('click', () => {
    fileUploadSection.style.display = 'block';  // 파일 업로드 섹션 보이기
    showUploadButton.style.display = 'none';    // 업로드 버튼 숨기기
});

// 파일 선택 시 썸네일 선택 옵션 업데이트
fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    thumbnailSelect.innerHTML = ''; // 기존 옵션 제거

    Array.from(files).forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = file.name;
        thumbnailSelect.appendChild(option);
    });
});

// 파일 업로드 처리
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = fileInput.files;
    const thumbnailIndex = thumbnailSelect.value;

    // 추가된 필드 값 가져오기
    const partNumber = partNumberInput.value.trim();
    const size = sizeInput.value.trim();
    const weight = weightInput.value.trim();
    const type = typeInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!files.length || !partNumber || !size || !weight || !type || !description) {
        message.textContent = "모든 필드를 채워주세요.";
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

            // 선택된 썸네일 저장
            if (i == thumbnailIndex) {
                thumbnailUrl = fileUrl;
            }
        }

        // Firestore에 게시물 정보 저장 (파일 정보 및 추가 필드 포함)
        await addDoc(collection(db, 'uploads'), {
            thumbnailUrl: thumbnailUrl,
            imageUrls: imageUrls,  // 모든 이미지 URL
            partNumber: partNumber,  // 품번
            size: size,              // 사이즈
            weight: weight,          // 중량
            type: type,              // 종류
            description: description,  // 내용
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
