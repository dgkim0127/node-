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
    const generatedProductNumber = document.getElementById('generated-product-number');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const previewGrid = document.getElementById('preview-grid');
    let selectedThumbnail = null; // 선택한 썸네일을 저장할 변수
    let mediaURLs = [];  // 업로드한 파일 URL을 저장할 배열

    // 제품 번호 생성 함수
    const generateProductNumber = () => {
        const prefix = prefixInput.value ? `${prefixInput.value}-` : '';
        const number = numberInput.value || '0000';  // 기본값 0000
        const suffix = suffixInput.value ? `-${suffixInput.value}` : '';
        const qCheck = qCheckInput.checked ? 'Q' : '';  // Q 체크 여부
        const extra = extraInput.value ? `-${extraInput.value}` : '';  // 추가 숫자 (2자리)

        // 최종 제품 번호 생성
        const fullProductNumber = `${prefix}${number}${suffix}${qCheck}${extra}`;
        generatedProductNumber.textContent = fullProductNumber;  // HTML에 업데이트
    };

    // 입력 필드 변경 시 제품 번호 갱신
    [prefixInput, numberInput, suffixInput, qCheckInput, extraInput].forEach(input => {
        input.addEventListener('input', generateProductNumber);
    });

    // 미디어 파일 미리보기 (이미지 및 동영상 포함)
    mediaFilesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        previewGrid.innerHTML = ''; // 기존 미리보기 초기화
        Array.from(files).forEach((file, index) => {
            const fileType = file.type;
            const reader = new FileReader();

            reader.onload = (e) => {
                // 이미지 파일인 경우
                if (fileType.startsWith('image/')) {
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;
                    imgElement.alt = `preview-${index}`;
                    imgElement.style.width = '100%';
                    imgElement.addEventListener('click', () => {
                        const selected = document.querySelector('.selected');
                        if (selected) selected.classList.remove('selected');
                        imgElement.classList.add('selected');
                        selectedThumbnail = index;  // 썸네일 인덱스 저장
                    });
                    previewGrid.appendChild(imgElement);
                }

                // 비디오 파일인 경우
                else if (fileType.startsWith('video/')) {
                    const videoElement = document.createElement('video');
                    videoElement.src = e.target.result;
                    videoElement.controls = true; // 비디오 플레이어 컨트롤 표시
                    videoElement.style.width = '100%';
                    videoElement.alt = `preview-${index}`;
                    videoElement.addEventListener('click', () => {
                        const selected = document.querySelector('.selected');
                        if (selected) selected.classList.remove('selected');
                        videoElement.classList.add('selected');
                        selectedThumbnail = index;  // 썸네일 인덱스 저장
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
        const productNumber = generatedProductNumber.textContent;
        const type = document.getElementById('type').value;
        const size = document.getElementById('size').value;
        const weight = document.getElementById('weight').value;
        const content = document.getElementById('content').value;
        const files = mediaFilesInput.files;

        // 제품 번호 중복 확인
        const productQuery = query(collection(db, "posts"), where("productNumber", "==", productNumber));
        const productSnapshot = await getDocs(productQuery);
        if (!productSnapshot.empty) {
            alert('This product number already exists!');
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
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error uploading post:', error);
        }
    });
});
