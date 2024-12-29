let tags = [];

const musicTagForm = document.getElementById('music_tag_form');
const musicTagInput = document.getElementById('music_tag_input');
const musicTagList = document.getElementById('music-tag-list');
const musicPlayBtn = document.getElementById('music_play_btn');

// 태그 렌더링 함수
function renderTags() {
  musicTagList.innerHTML = '';
  if (tags.length === 0) {
    musicTagList.innerHTML = '아직 설정된 태그가 없어요! (최대 5개)';
    musicPlayBtn.style.display = 'none';
  } else {
    tags.forEach((tag, index) => {
      const tagItem = document.createElement('div');
      tagItem.classList.add('tag-item');
      tagItem.textContent = tag;

      // 삭제 버튼 추가
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.onclick = () => {
        removeTag(index);
      };

      tagItem.appendChild(deleteBtn);
      musicTagList.appendChild(tagItem);
    });

    musicPlayBtn.style.display = 'block'; // 태그가 있으면 버튼 표시
    musicPlayBtn.textContent = '태그 목록으로 음악 재생'; // 버튼 텍스트 설정
  }
}

// 태그 추가 함수
function addTag(event) {
  event.preventDefault();
  const tag = musicTagInput.value.trim();
  if (tags.length >= 5) {
    alert("최대 5개의 태그만 추가 가능합니다!");
    return;
  }

  if (tag.length > 14) {
    alert("태그는 최대 14자까지 입력할 수 있습니다.");
    musicTagInput.value = tag.substring(0, 14);
    return;
  }

  if (tag && !tags.includes(tag)) {
    tags.push(tag);
    saveTags();
    renderTags();
    musicTagInput.value = '';
  } else {
    alert('같은 태그는 입력하실 수 없습니다!');
  }
}

// 태그 삭제 함수
function removeTag(index) {
  tags.splice(index, 1); // 해당 인덱스의 태그 삭제
  saveTags(); // 변경된 태그 배열 저장
  renderTags(); // 태그 목록 렌더링
}

// 태그 저장 함수
function saveTags() {
  chrome.storage.sync.set({ tags }, () => {
    console.log('태그 저장 성공:', tags);
  });
}

// 태그 로드 함수
function loadTags() {
  chrome.storage.sync.get('tags', (data) => {
    if (data.tags) {
      tags = data.tags;
      renderTags();
    }
  });
}

// 음악 재생 함수
function playMusicByTags() {
  if (tags.length === 0) {
    alert("태그를 추가하세요!");
    return;
  }

  // 요청할 곡의 총 개수
  const totalResults = 20;
  const resultsPerTag = Math.floor(totalResults / tags.length);
  const extraResults = totalResults % tags.length;
  
  let requests = [];

  tags.forEach((tag, index) => {
    const numResults = resultsPerTag + (index < extraResults ? 1 : 0); // 나머지가 있다면 분배
    const API_KEY="";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${tag}+music&type=video&videoCategoryId=10&videoDuration=long&maxResults=${numResults}&key=${API_KEY}`;

    requests.push(fetch(searchUrl).then(response => response.json()));
  });

  // 모든 요청이 끝나면 결과 처리
  Promise.all(requests)
    .then(responses => {
      let videoUrls = [];
      responses.forEach(response => {
        response.items.forEach(item => {
          videoUrls.push(`https://www.youtube.com/watch?v=${item.id.videoId}`);
        });
      });

      // 백그라운드로 재생 요청 보내기
      chrome.runtime.sendMessage({ action: "playMusic", videoUrl: videoUrls[0] });
    })
    .catch(error => {
      console.error("API 요청 중 오류 발생:", error);
      alert("음악을 찾는 중 오류가 발생했습니다.");
    });
}

// 이벤트 리스너 설정
musicPlayBtn.addEventListener('click', playMusicByTags);
musicTagForm.addEventListener('submit', addTag);

loadTags();