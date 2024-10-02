import { storage, db } from './firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const prefixInput = document.getElementById('prefix');
    const numberInput = document.getElementById('number');
    const suffixInput = document.getElementById('suffix');
    const qCheckInput = document.getElementById('q-check');
    const extraInput = document.getElementById('extra');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const previewGrid = document.getElementById('preview-grid');
    const sizeInput = document.getElementById('size');
    const weightInput = document.getElementById('weight');
    const sizeUnitInput = document.getElementById('size-unit');
    const loadingOverlay = document.getElementById('loading-overlay'); // 로딩 오버레이

    let selectedThumbnail = null; // 선택한 썸네일을 저장할 변수
    let mediaURLs = [];  // 업로드한 파일 URL을 저장할 배열

    // 뒤로 가기 버튼
    const backButton = document.getElementById('back-btn');
    backButton.addEventListener('click', () => {
        window.history.back();  // 이전 페이지로 이동
    });

    // 미디어 파일 미리보기 (이미지 및 동영상)
    mediaFilesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewGrid.innerHTML = ''; // 기존 미리보기 초기화
        Array.from(files).forEach((file, index) => {
            const mediaType = file.type.split('/')[0]; // 이미지 또는 비디오 확인
            const reader = new FileReader();
            reader.onload = (e) => {
                if (mediaType === 'image') {
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;
                    imgElement.alt = `preview-${index}`;
                    imgElement.addEventListener('click', () => {
                        const selected = document.querySelector('.selected');
                        if (selected) selected.classList.remove('selected');
                        imgElement.classList.add('selected');
                        selectedThumbnail = index;
                    });
                    previewGrid.appendChild(imgElement);
                } else if (mediaType === 'video') {
                    const videoElement = document.createElement('video');
                    videoElement.src = e.target.result;
                    videoElement.controls = true;
                    videoElement.alt = `preview-${index}`;
                    videoElement.addEventListener('click', () => {
                        const selected = document.querySelector('.selected');
                        if (selected) selected.classList.remove('selected');
                        videoElement.classList.add('selected');
                        selectedThumbnail = index;
                    });
                    previewGrid.appendChild(videoElement);
                }
            };
            reader.readAsDataURL(file);
        });
    });

    // 업로드 폼 제출 처리
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 필수 필드 확인
        if (!mediaFilesInput.files.length) {
            alert('Please upload at least one image or video.');
            return;
        }
        if (!numberInput.value || !weightInput.value || !sizeInput.value) {
            alert('Product number, weight, and size are required fields.');
            return;
        }

        // 업로드 시작 시 로딩 오버레이 표시
        loadingOverlay.style.display = 'flex';

        const productNumber = `${prefixInput.value}-${numberInput.value}${suffixInput.value}${qCheckInput.checked ? 'Q' : ''}${extraInput.value ? `-${extraInput.value}` : ''}`;
        const type = Array.from(document.querySelectorAll('#type-container input:checked')).map(el => el.value).join(', ');
        const size = `${sizeInput.value}${sizeUnitInput.value}`;
        const weight = weightInput.value;
        const content = document.getElementById('content').value;
        const files = mediaFilesInput.files;

        // 제품 번호 중복 확인
        const productQuery = query(collection(db, "posts"), where("productNumber", "==", productNumber));
        const productSnapshot = await getDocs(productQuery);
        if (!productSnapshot.empty) {
            alert('This product number already exists!');
            loadingOverlay.style.display = 'none'; // 중복 확인 후 로딩 오버레이 숨김
            return;
        }

        // Firebase Storage에 파일 업로드 및 URL 저장
        mediaURLs = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `media/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            mediaURLs.push(downloadURL);
        }

        // 선택한 썸네일 URL 가져오기
        const thumbnailURL = mediaURLs[selectedThumbnail] || mediaURLs[0];

        // Firestore에 데이터 저장
        try {
            await addDoc(collection(db, "posts"), {
                productNumber: productNumber,
                type: type,
                size: size,
                weight: weight,
                content: content,
                media: mediaURLs,
                thumbnail: thumbnailURL,
                createdAt: new Date()
            });
            alert('Post uploaded successfully!');
            window.location.href = 'dashboard.html'; // 업로드 완료 후 대시보드로 이동
        } catch (error) {
            console.error('Error uploading post:', error);
            alert('Error uploading post');
        } finally {
            // 업로드 완료 시 로딩 오버레이 숨김
            loadingOverlay.style.display = 'none';
        }
    });
});

