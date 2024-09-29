import { storage, db, auth } from './firebaseConfig.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 게시물 업로드 폼 이벤트 핸들러
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const file = document.getElementById('file').files[0];
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Firebase Storage에 파일 업로드
    try {
        if (!file) {
            throw new Error("파일이 선택되지 않았습니다.");
        }

        const fileRef = ref(storage, `uploads/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // 업로드 진행 상태를 확인할 수 있습니다.
            }, 
            (error) => {
                errorMessage.textContent = '파일 업로드 실패: ' + error.message;
            }, 
            async () => {
                // 파일 업로드가 성공하면 Firestore에 데이터 저장
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const docRef = await addDoc(collection(db, 'posts'), {
                    title,
                    description,
                    fileUrl: downloadURL,
                    fileName: file.name,
                    createdAt: new Date(),
                    userId: auth.currentUser.uid
                });

                successMessage.textContent = '게시물 업로드 성공!';
                uploadForm.reset(); // 폼 초기화
            }
        );
    } catch (error) {
        errorMessage.textContent = '업로드 실패: ' + error.message;
    }
});
