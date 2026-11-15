/**
 * 말로 만드는 세상, 바이브 코딩 - 슬라이더 제어 스크립트 (리모컨)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 필요한 요소(버튼, 트랙, 표시기 등) 가져오기
  const slidesTrack = document.getElementById('slides-track');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dots = document.querySelectorAll('.dot');
  const currentNumEl = document.getElementById('current-num');
  const progressBar = document.getElementById('progress-bar');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const notesBtn = document.getElementById('notes-btn');
  const wrapper = document.querySelector('.presentation-wrapper');

  const totalSlides = slides.length;
  let currentSlide = 0;

  /**
   * 화면 갱신 함수 (장표 넘기기)
   * @param {number} index 이동할 슬라이드 번호 (0 ~ totalSlides - 1)
   */
  function goToSlide(index) {
    // 범위를 벗어나지 않도록 방어
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    currentSlide = index;

    // 슬라이드 활성화 (페이드 & 미세 글라이드 모션)
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlide);
    });

    // 상단 번호 및 진행률 표시줄 갱신
    currentNumEl.textContent = currentSlide + 1;
    const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // 하단 동그라미(도트) 활성화 상태 갱신
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    // 이전/다음 버튼 활성/비활성화 처리
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;

    // 발표자 노트 팝업 내용 갱신
    updateNotes();
  }

  // 2. 버튼 클릭 이벤트 연결
  prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide + 1);
  });

  // 3. 하단 동그라미 점(도트) 클릭 이벤트
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.dataset.index, 10);
      goToSlide(targetIndex);
    });
  });

  // 4. 키보드 리모컨 조작 (방향키, 스페이스바, F키)
  window.addEventListener('keydown', (e) => {
    // input이나 textarea에 타이핑 중일 때는 슬라이드 전환 방지
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        goToSlide(currentSlide - 1);
        break;

      case 'ArrowRight':
      case 'PageDown':
      case ' ': // 스페이스바
        e.preventDefault();
        goToSlide(currentSlide + 1);
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;

      case 'f':
      case 'F':
        toggleFullScreen();
        break;

      case 's':
      case 'S':
        e.preventDefault();
        toggleNotes();
        break;
    }
  });

  // 5. 전체화면 토글 기능
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
      fullscreenBtn.textContent = '✕';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      fullscreenBtn.textContent = '⛶';
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullScreen);

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.textContent = '⛶';
    }
  });

  // 6. 발표자 노트(Speaker Notes) 팝업 창 기능 (S 키 또는 🎙️ 버튼)
  let notesWindow = null;

  function toggleNotes() {
    if (notesWindow && !notesWindow.closed) {
      notesWindow.close();
      notesWindow = null;
      return;
    }
    notesWindow = window.open('', 'SpeakerNotes', 'width=540,height=440,top=100,left=100');
    if (!notesWindow) return; // 팝업 차단 시 방어
    notesWindow.document.write(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>발표자 노트 (Speaker Notes)</title><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif;
         background: #111827; color: #f3f4f6; padding: 24px; line-height: 1.7; }
  .slide-num { font-size: 13px; color: #9ca3af; margin-bottom: 8px; font-family: monospace; font-weight: 700; }
  .label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
           color: #60a5fa; margin-bottom: 14px; font-weight: 800; }
  .notes { font-size: 16px; color: #e5e7eb; white-space: pre-line; word-break: keep-all; }
  .tip { margin-top: 24px; padding-top: 14px; border-top: 1px solid #374151; font-size: 12px; color: #6b7280; }
</style></head><body>
  <div class="slide-num" id="sn"></div>
  <div class="label">🎙️ SPEAKER NOTES</div>
  <div class="notes" id="nt"></div>
  <div class="tip">💡 슬라이드를 넘기면 발표자 노트 내용이 실시간으로 동기화됩니다. (S 키로 닫기)</div>
</body></html>`);
    notesWindow.document.close();
    updateNotes();
  }

  function updateNotes() {
    if (!notesWindow || notesWindow.closed) return;
    try {
      const currentSlideEl = slides[currentSlide];
      const note = currentSlideEl ? (currentSlideEl.dataset.notes || '(작성된 발표자 노트가 없습니다.)') : '';
      const ntEl = notesWindow.document.getElementById('nt');
      const snEl = notesWindow.document.getElementById('sn');
      if (ntEl) ntEl.textContent = note;
      if (snEl) snEl.textContent = `Slide ${currentSlide + 1} / ${totalSlides}`;
    } catch (e) {}
  }

  if (notesBtn) {
    notesBtn.addEventListener('click', toggleNotes);
  }

  // 7. 모바일 터치 스와이프 제스처 지원 (손가락으로 밀기)
  let touchStartX = 0;
  let touchEndX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50; // 50px 이상 쓸어넘겼을 때 동작
    if (touchEndX < touchStartX - swipeThreshold) {
      // 왼쪽으로 쓱 밈 ➔ 다음 슬라이드
      goToSlide(currentSlide + 1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // 오른쪽으로 쓱 밈 ➔ 이전 슬라이드
      goToSlide(currentSlide - 1);
    }
  }

  // 초기 슬라이드 상태(1번 슬라이드) 설정
  goToSlide(0);
});
