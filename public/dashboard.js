// 업로드 버튼 클릭 시 이벤트 처리
document.getElementById('uploadButton').addEventListener('click', function() {
    alert('업로드 페이지로 이동합니다.');
    // 실제 구현 시 업로드 페이지로 리디렉션
    window.location.href = 'upload.html';
});

// 예시로 게시물을 동적으로 추가 (실제 데이터는 서버에서 받아와야 함)
const posts = [
    {
        thumbnail: 'image1.jpg',
        productNumber: 'B_0001E',
        type: '14K',
        weight: '15g',
        size: '10cm',
        content: 'Beautiful bracelet with gold details.'
    },
    {
        thumbnail: 'image2.jpg',
        productNumber: 'G_0002R',
        type: '18K',
        weight: '20g',
        size: '15cm',
        content: 'Elegant ring with silver and gold mix.'
    }
];

const postContainer = document.querySelector('.posts');
posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    postElement.innerHTML = `
        <img src="${post.thumbnail}" alt="${post.productNumber}">
        <div class="info">
            <p>품번: ${post.productNumber}</p>
            <p>종류: ${post.type}</p>
            <p>중량: ${post.weight}</p>
            <p>사이즈: ${post.size}</p>
            <p>내용: ${post.content}</p>
        </div>
    `;
    
    postContainer.appendChild(postElement);
});
