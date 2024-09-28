import { db, auth, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// IP 주소 가져오는 함수
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return null;
    }
}

// Firestore에서 로그인 기록을 불러와 웹 페이지에 표시하는 함수
async function displayLoginRecords() {
    const recordsContainer = document.getElementById('loginRecords');  // 데이터를 표시할 HTML 요소

    try {
        const querySnapshot = await getDocs(collection(db, 'login_records'));
        
        // 가져온 데이터를 순회하며 웹 페이지에 추가
        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const recordElement = document.createElement('div');
            recordElement.innerHTML = `
                <p><strong>User ID:</strong> ${record.userId}</p>
                <p><strong>Email:</strong> ${record.email}</p>
                <p><strong>IP Address:</strong> ${record.ipAddress}</p>
                <p><strong>Login Time:</strong> ${record.loginTime}</p>
                <hr>
            `;
            recordsContainer.appendChild(recordElement);  // 기록을 웹 페이지에 추가
        });
    } catch (error) {
        console.error("Error fetching login records: ", error);
    }
}

// 회원가입 처리
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const signupMessage = document.getElementById('signupMessage');

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

// 로그인 처리 및 IP 기록
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginMessage = document.getElementById('loginMessage');

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

            // IP 주소와 로그인 시간 기록
            const ipAddress = await getIPAddress();
            const loginTime = new Date().toISOString();

            // Firestore에 로그인 기록 저장
            await addDoc(collection(db, 'login_records'), {
                userId: auth.currentUser.uid,
                email: auth.currentUser.email,
                ipAddress: ipAddress,
                loginTime: loginTime
            });

            console.log('Login record saved successfully');
            displayLoginRecords();  // 로그인 기록 표시
        } else {
            loginMessage.textContent = "Username not found.";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        loginMessage.textContent = `Error: ${error.message}`;
        loginMessage.style.color = "red";
    }
});

// 파일 업로드 및 업로드 목록 표시
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('fileInput').files[0];
    const message = document.getElementById('message');

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
    } catch (error) {
        message.textContent = "Error uploading file: " + error.message;
    }
});
