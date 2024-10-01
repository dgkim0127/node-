// upload.js
import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

const uploadForm = document.getElementById('upload-form');

// 업로드 폼 제출 시 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productNumberInput = document.getElementById('productNumber');

        if (!productNumberInput) {
            console.error('Product number input not found!');
            return;
        }

        const productNumber = productNumberInput.value;
        const files = document.getElementById('mediaFiles').files;

        let mediaURLs = [];

        for (let file of files) {
            const storageRef = ref(storage, `media/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            mediaURLs.push(downloadURL);
        }

        await addDoc(collection(db, "posts"), {
            productNumber: productNumber,
            media: mediaURLs,
            createdAt: new Date()
        });

        alert('Post uploaded successfully!');
        window.location.href = 'dashboard.html';
    });
});
