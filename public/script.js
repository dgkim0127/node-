// 업로드된 파일을 화면에 표시하는 함수 (삭제 기능 없이)
function displayUploadedFile(thumbnailUrl, imageUrls, docId) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';

    if (thumbnailUrl.endsWith('.mp4') || thumbnailUrl.endsWith('.webm') || thumbnailUrl.endsWith('.ogg')) {
        const videoElement = document.createElement('video');
        videoElement.src = thumbnailUrl;
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.style.width = '200px';
        fileElement.appendChild(videoElement);
    } else {
        const imgElement = document.createElement('img');
        imgElement.src = thumbnailUrl;
        imgElement.style.width = '200px';
        fileElement.appendChild(imgElement);
    }

    // 썸네일 클릭 시 상세 페이지로 이동하는 이벤트 추가
    fileElement.addEventListener('click', () => {
        window.location.href = `detail.html?id=${docId}`;
    });

    const viewMoreButton = document.createElement('button');
    viewMoreButton.textContent = "View All Images";
    viewMoreButton.onclick = () => viewAllImages(imageUrls);

    fileElement.appendChild(viewMoreButton);
    document.getElementById('uploadedFiles').appendChild(fileElement);
}

// Firestore에서 데이터 로드 및 출력
async function loadUploadedFiles() {
    const querySnapshot = await getDocs(collection(db, 'uploads'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        displayUploadedFile(data.thumbnailUrl, data.imageUrls, doc.id);
    });
}

// 페이지 로드 시 업로드된 파일 목록 불러오기
loadUploadedFiles();
