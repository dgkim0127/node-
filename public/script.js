import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// 로그인 및 회원가입 관련 DOM 요소
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

// 파일 업로드 및 미리보기 관련 처리 (이전 코드와 동일)
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');

function previewImages() {
    const preview = document.getElementById('preview');
    preview.innerHTML = ''; // 미리보기 영역 초기화
    const files = document.getElementById('fileInput').files;

    if (files) {
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.margin = '10px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file); // 파일을 읽어 미리보기로 변환
        });
    }
}

// 업로드 처리
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = fileInput.files;
    const prefix = document.getElementById('prefix').value;
    const number = document.getElementById('number').value;
    const suffix = document.getElementById('suffix').value;
    const lastNumber = document.getElementById('lastNumber').value;
    const partNumber = `${prefix}_${number}${suffix}${lastNumber ? '-' + lastNumber : ''}`;

    const size = document.getElementById('size').value.trim();
    const weight = document.getElementById('weight').value.trim();
    const type = document.getElementById('type').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!files.length || !partNumber || !size || !weight || !type) {
        document.getElementById('message').textContent = "모든 필드를 입력하고 파일을 선택하세요!";
        return;
    }

    const imageUrls = [];
    let thumbnailUrl = '';

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            imageUrls.push(fileUrl);

            // 첫 번째 파일을 썸네일로 지정
            if (i === 0) {
                thumbnailUrl = fileUrl;
            }
        }

        await addDoc(collection(db, 'uploads'), {
            partNumber: partNumber,
            size: size,
            weight: weight + 'g',
            type: type,
            description: description,
            thumbnailUrl: thumbnailUrl,
            imageUrls: imageUrls,
            createdAt: new Date()
        });

        document.getElementById('message').textContent = "Files uploaded successfully!";
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        document.getElementById('message').textContent = "Error uploading files: " + error.message;
    }
});

// 업로드된 파일 목록 로드
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.thumbnailUrl, data.imageUrls, doc.id);
    });
}

function displayUploadedFile(thumbnailUrl, imageUrls, docId) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = thumbnailUrl;
    imgElement.style.width = '200px';

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View Details";
    viewMoreButton.onclick = () => viewDetailsPage(docId);  // 상세 페이지로 이동

    fileElement.appendChild(imgElement);
    fileElement.appendChild(viewMoreButton);
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

// 상세 페이지로 이동하는 함수
function viewDetailsPage(docId) {
    window.location.href = `details.html?id=${docId}`;
}
