const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Firebase Admin SDK 초기화
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "YOUR_PROJECT_ID.appspot.com"
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static('public'));

// 파일 업로드 API 예시
app.post('/upload', async (req, res) => {
    const file = req.body.file;
    const bucket = admin.storage().bucket();
    
    try {
        const fileRef = bucket.file(file.name);
        await fileRef.save(Buffer.from(file.data, 'base64'), { contentType: file.type });
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        
        res.json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
