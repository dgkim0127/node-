import { db, auth, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

let isAdmin = false;  // 사용자 권한 변수

// 사용자 로그인 여부 및 관리자 여부 확인
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const userDocSnapshot = await getDocs(userDocQuery);

        if (!userDocSnapshot.empty) {
            const userData = userDocSnapshot.docs[0].data();
            isAdmin = userData.isAdmin || false;  // Firestore에서 관리자 여부 가져옴

            // 로그인한 사용자에게 게시물을 보여줌
            displayPosts();

            // 관리자인 경우 파일 업로드 섹션 보이기
            if (isAdmin) {
                document.querySelector('.upload-section').style.display = 'block';
            } else {
                document.querySelector('.upload-section').style.display = 'none';
            }
        }
    } else {
        // 로그인되지 않았으면 게시물 숨김
        document.querySelector('#posts').style.display = 'none';
    }
});

// 게시물 표시
async function displayPosts() {
    const postsContainer = document.getElementById('posts');
    const querySnapshot = await getDocs(collection(db, 'uploads'));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <h3>${data.name}</h3>
            <img src="${data.url}" alt="${data.name}" style="width: 200px;">
        `;
        postsContainer.appendChild(postElement);
    });

    postsContainer.style.display = 'block';  // 로그인한 경우에만 게시물 표시
}

// 회원가입 처리
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !email || !password) {
        alert("All fields are required!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore에 사용자 정보 저장 (관리자 여부 포함)
        await addDoc(collection(db, 'users'), {
            username: username,
            email: email,
            isAdmin: false  // 기본적으로 관리자 아님
        });

        alert("Sign up successful!");
    } catch (error) {
        console.error("Error signing up: ", error);
    }
});

// 로그인 처리
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
    } catch (error) {
        console.error("Error logging in: ", error);
        alert("Login failed!");
    }
});

// 파일 업로드 처리 (관리자만 가능)
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isAdmin) {
        alert("Only admins can upload files!");
        return;
    }

    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        alert("Please select a file!");
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
        alert("File uploaded successfully!");
    } catch (error) {
        console.error("Error uploading file: ", error);
        alert("Error uploading file!");
    }
});
