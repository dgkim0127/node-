const express = require('express');
const fileUpload = require('express-fileupload');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/storage');

// Firebase 서비스 계정 키를 사용하여 초기화
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin SDK 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "YOUR_PROJECT_ID.appspot.com"
});

// Firebase Firestore와 Storage 초기화
const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = process.env.PORT || 8080;

// 파일 업로드 미들웨어 설정
app.use(fileUpload());

// 정적 파일 제공
app.use(express.static('public'));

// 파일 업로드 API
app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const fileName = `${Date.now()}_${file.name}`;

    try {
        // Firebase Storage에 파일 업로드
        const fileRef = bucket.file(fileName);
        await fileRef.save(file.data);

        // 파일 URL 얻기
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Firestore에 파일 메타데이터 저장
        await db.collection('uploads').add({
            name: fileName,
            url: fileUrl,
            createdAt: new Date()
        });

        res.send({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error) {
        res.status(500).send({ message: 'Error uploading file', error });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
