const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const app = express();

// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyDFysg8I_qKtDqDJLWg1_npTPBWRMM_5WY",
    authDomain: "jjji-4240b.firebaseapp.com",
    projectId: "jjji-4240b",
    storageBucket: "jjji-4240b.appspot.com",
    messagingSenderId: "876101785840",
    appId: "1:876101785840:web:6e58681ea9c9780e454a35"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// 정적 파일 제공
app.use(express.static('public'));
app.use(fileUpload());

// 파일 업로드 처리
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedFile = req.files.file;

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.avi', '.wmv'];
    
    if (!allowedExtensions.includes(path.extname(uploadedFile.name).toLowerCase())) {
        return res.status(400).send('Only images and videos are allowed.');
    }

    // Firebase Storage에 파일 업로드
    const storageRef = ref(storage); // 수정된 부분
    const fileRef = ref(storageRef, uploadedFile.name); // 수정된 부분

    uploadBytes(fileRef, uploadedFile).then(() => { // 수정된 부분
        return getDownloadURL(fileRef); // 수정된 부분
    }).then((fileUrl) => {
        // Firestore에 메타데이터 저장
        return db.collection('uploads').add({
            name: uploadedFile.name,
            url: fileUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).then(() => {
        res.send(`File uploaded! <a href="${fileUrl}">View File</a>`);
    }).catch((error) => {
        res.status(500).send(error);
    });
});

// 서버 실행
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
