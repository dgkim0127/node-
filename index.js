const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const admin = require('firebase-admin');

// Firebase 관리자 SDK 초기화
const serviceAccount = require('./path-to-your-firebase-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-project-id.appspot.com'
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

// Express 애플리케이션 설정
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // 정적 파일 제공
app.use(fileUpload()); // 파일 업로드 미들웨어

// 파일 업로드 처리
app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const fileName = file.name;
  const filePath = path.join(__dirname, 'uploads', fileName);

  try {
    // Firebase Storage에 파일 업로드
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false
    });

    blobStream.on('error', (err) => {
      res.status(500).send(err.message);
    });

    blobStream.on('finish', async () => {
      // 파일 URL 가져오기
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Firestore에 파일 정보 저장
      await db.collection('uploads').add({
        name: fileName,
        url: publicUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).send({ fileName, fileUrl: publicUrl });
    });

    blobStream.end(file.data);
  } catch (error) {
    res.status(500).send('Error uploading file: ' + error.message);
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
