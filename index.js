const express = require('express');
const fileUpload = require('express-fileupload');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('./path/to/your/firebase-service-account.json'); // 서비스 계정 키 파일 경로
initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-firebase-project.appspot.com' // Firebase Storage 버킷 이름
});

const bucket = getStorage().bucket();

const app = express();

// 파일 업로드 미들웨어 사용
app.use(fileUpload());
app.use(express.static('public')); // 정적 파일 서빙 (HTML, CSS 등)

// 파일 업로드 경로
app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const uploadedFile = req.files.file;

    // 파일을 임시 경로에 저장
    const tempFilePath = path.join(__dirname, 'uploads', uploadedFile.name);
    uploadedFile.mv(tempFilePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Firebase Storage에 파일 업로드
        const uploadToFirebase = async () => {
            await bucket.upload(tempFilePath, {
                destination: `uploads/${uploadedFile.name}`,
                metadata: {
                    contentType: uploadedFile.mimetype,
                },
            });
            // 파일 업로드 후 로컬 파일 삭제
            fs.unlinkSync(tempFilePath);

            res.send('File uploaded successfully to Firebase Storage!');
        };

        uploadToFirebase().catch((error) => {
            console.error('Error uploading to Firebase:', error);
            res.status(500).send('Error uploading to Firebase');
        });
    });
});

// 포트 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
