const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const app = express();

// Firebase 초기화
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
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
    const storageRef = storage.ref();
    const fileRef = storageRef.child(uploadedFile.name);

    fileRef.put(uploadedFile).then(() => {
        return fileRef.getDownloadURL();
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
