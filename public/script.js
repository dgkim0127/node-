import { db, storage } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');

// 이미지 미리보기 함수
function previewImages() {
    preview.innerHTML = '';
    const files = fileInput.files;
    if (files) {
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.margin = '10px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 업로드 처리
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = fileInput.files;
    const prefix = document.getElementById('prefix').value;
    const number = document.getElementById('number').value;
    const suffix = document.getElementById('suffix').value;
    const lastNumber = document.getElementById('lastNumber').value;
    const partNumber = `${prefix}_${number}${suffix}${lastNumber ? '-' + lastNumber : ''}`;

    const size = document.getElementById('size').value.trim();
    const weight = document.getElementById('weight').value.trim();
    const type = document.getElementById('type').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!files.length || !partNumber || !size || !weight || !type) {
        document.getElementById('message').textContent = "모든 필드를 입력하고 파일을 선택하세요!";
        return;
    }

    const imageUrls = [];
    let thumbnailUrl = '';

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `uploads/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            imageUrls.push(fileUrl);

            // 첫 번째 파일을 대표 이미지로 지정
            if (i === 0) {
                thumbnailUrl = fileUrl;
            }
        }

        await addDoc(collection(db, 'uploads'), {
            partNumber: partNumber,
            size: size,
            weight: weight + 'g',
            type: type,
            description: description,
            thumbnailUrl: thumbnailUrl,
            imageUrls: imageUrls,
            createdAt: new Date()
        });

        document.getElementById('message').textContent = "Files uploaded successfully!";
        loadUploadedFiles(); // 파일 목록 새로고침
    } catch (error) {
        document.getElementById('message').textContent = "Error uploading files: " + error.message;
    }
});

// 파일 목록 로드 (기존 코드와 동일)
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.thumbnailUrl, data.imageUrls, doc.id);
    });
}

function displayUploadedFile(thumbnailUrl, imageUrls, docId) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    const imgElement = document.createElement('img');
    imgElement.src = thumbnailUrl;
    imgElement.style.width = '200px';

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View All Images";
    viewMoreButton.onclick = () => viewAllImages(imageUrls);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFile(docId, fileElement);

    fileElement.appendChild(imgElement);
    fileElement.appendChild(viewMoreButton);
    fileElement.appendChild(deleteButton);
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

function viewAllImages(imageUrls) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    imageUrls.forEach((url) => {
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.style.width = '200px';
        modal.appendChild(imgElement);
    });

    document.body.appendChild(modal);
}

// 파일 삭제 처리
async function deleteFile(docId, fileElement) {
    try {
        await deleteDoc(doc(db, 'uploads', docId));
        fileElement.remove();
        document.getElementById('message').textContent = "File deleted successfully!";
    } catch (error) {
        document.getElementById('message').textContent = "Error deleting file: " + error.message;
    }
}
