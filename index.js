const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const app = express();

// 정적 파일 제공 (public 폴더에 있는 HTML, CSS, JS 파일 제공)
app.use(express.static('public'));

// 업로드된 파일을 제공하는 설정
app.use(express.static(path.join(__dirname, 'uploads')));

// 파일 업로드 미들웨어 설정
app.use(fileUpload());

// 파일 업로드 처리
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedFile = req.files.file;

    // 파일 확장자 확인 (이미지와 동영상만 허용)
    const fileExtension = path.extname(uploadedFile.name).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.avi', '.wmv'];

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).send('Only images and videos are allowed.');
    }

    // uploads 폴더가 없으면 생성
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
    }

    const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);

    // 파일을 지정된 경로에 저장
    uploadedFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);
        res.send(`File uploaded! <a href="/uploads/${uploadedFile.name}">View File</a>`);
    });
});

// 서버 실행
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
