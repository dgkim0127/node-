const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(fileUpload());
app.use(express.static('uploads'));

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedFile = req.files.file;
    const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);

    uploadedFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);
        res.send(`File uploaded! <a href="/uploads/${uploadedFile.name}">View File</a>`);
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
