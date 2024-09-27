const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const message = document.getElementById('message');
const uploadedFiles = document.getElementById('uploadedFiles');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // 페이지 새로고침 방지
    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "Please select a file!";
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // 파일 업로드 요청
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.text();
            message.textContent = "File uploaded successfully!";
            displayUploadedFile(file.name); // 파일 이름을 이용해 업로드된 파일 표시
        } else {
            message.textContent = "File upload failed.";
        }
    } catch (error) {
        message.textContent = "There was an error uploading the file.";
    }
});

// 업로드된 파일을 표시하는 함수
function displayUploadedFile(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let fileElement;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        fileElement = document.createElement('img');
        fileElement.src = `/uploads/${fileName}`;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        fileElement = document.createElement('video');
        fileElement.src = `/uploads/${fileName}`;
        fileElement.controls = true;
    }

    if (fileElement) {
        uploadedFiles.appendChild(fileElement);
    }
}
