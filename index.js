const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Firebase 초기화
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// 파일 업로드 엔드포인트
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const storageRef = ref(storage, `uploads/${file.name}`);

    // Firebase Storage에 파일 업로드
    await uploadBytes(storageRef, file.data);
    const fileUrl = await getDownloadURL(storageRef);

    // Firestore에 파일 정보 저장
    const docRef = await addDoc(collection(db, 'uploads'), {
      name: file.name,
      url: fileUrl,
      createdAt: new Date()
    });

    res.send({
      message: 'File uploaded successfully',
      fileUrl,
      docId: docRef.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

// 파일 목록 조회 엔드포인트
app.get('/files', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching files');
  }
});

// 파일 삭제 엔드포인트
app.delete('/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = doc(db, 'uploads', id);
    const docSnapshot = await deleteDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).send('File not found');
    }

    const fileData = docSnapshot.data();
    const fileRef = ref(storage, fileData.url);

    // Firebase Storage에서 파일 삭제
    await deleteObject(fileRef);

    // Firestore에서 파일 정보 삭제
    await deleteDoc(docRef);

    res.send('File deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting file');
  }
});

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
