const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('./path/to/your/firebase-service-account.json'); // Firebase 서비스 계정 키 파일 경로
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-firebase-project.appspot.com' // Firebase Storage 버킷 이름
});

const bucket = admin.storage().bucket();
const app = express();

// 파일 업로드 미들웨어 사용
app.use(fileUpload());
app.use(express.static('public')); // 정적 파일 서빙 (HTML, CSS 등)

// 'uploads' 디렉토리 존재 여부 확인 및 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// 파일 업로드 경로
app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const uploadedFile = req.files.file;

    // 파일을 임시 경로에 저장
    const tempFilePath = path.join(uploadsDir, uploadedFile.name);
    uploadedFile.mv(tempFilePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Firebase Storage에 파일 업로드
        const uploadToFirebase = async () => {
            try {
                await bucket.upload(tempFilePath, {
                    destination: `uploads/${uploadedFile.name}`,
                    metadata: {
                        contentType: uploadedFile.mimetype,
                    },
                });
                // 파일 업로드 후 로컬 파일 삭제
                fs.unlinkSync(tempFilePath);

                res.send('File uploaded successfully to Firebase Storage!');
            } catch (error) {
                console.error('Error uploading to Firebase:', error);
                res.status(500).send('Error uploading to Firebase');
            }
        };

        uploadToFirebase();
    });
});

// 포트 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
