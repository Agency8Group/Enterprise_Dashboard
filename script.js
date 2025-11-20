// 현재 시간 업데이트
function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = timeString;
    }
}

// 초기 시간 설정 및 1초마다 업데이트
updateTime();
setInterval(updateTime, 1000);

// 다운로드 버튼 이벤트
document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const downloadLink = this.getAttribute('data-link');
        
        if (downloadLink && downloadLink !== 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_1') {
            // 새 창에서 다운로드 링크 열기
            window.open(downloadLink, '_blank');
            
            // 다운로드 시작 피드백
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>DOWNLOADING...</span>';
            this.style.opacity = '0.7';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cloud-download-alt"></i><span>DOWNLOAD</span>';
                this.style.opacity = '1';
            }, 2000);
        } else {
            alert('다운로드 링크를 설정해주세요. Google Drive 파일 ID를 data-link 속성에 추가하세요.');
        }
    });
});

// 링크 카드 클릭 이벤트
document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        
        if (url && url.trim() !== '') {
            window.open(url, '_blank');
        } else {
            // URL이 설정되지 않은 경우
            const title = this.querySelector('.link-title').textContent;
            const urlInput = prompt(`${title}의 URL을 입력해주세요:`, 'https://');
            
            if (urlInput && urlInput.trim() !== '') {
                this.setAttribute('data-url', urlInput);
                window.open(urlInput, '_blank');
            }
        }
    });
});

// 브랜드 카드 클릭 이벤트
document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        
        if (url && url.trim() !== '') {
            window.open(url, '_blank');
        } else {
            // URL이 설정되지 않은 경우
            const title = this.querySelector('.brand-title').textContent;
            const urlInput = prompt(`${title} 브랜드 사이트의 URL을 입력해주세요:`, 'https://');
            
            if (urlInput && urlInput.trim() !== '') {
                this.setAttribute('data-url', urlInput);
                window.open(urlInput, '_blank');
            }
        }
    });
});

// 메뉴 카드 호버 효과 강화
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// 페이지 로드 시 페이드인 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // 헤더 애니메이션
    const header = document.querySelector('.dashboard-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'opacity 1s ease, transform 1s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
});

// 키보드 접근성 개선
document.addEventListener('keydown', function(e) {
    // ESC 키로 포커스 리셋
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
});

// 스크롤 시 헤더 효과
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector('.dashboard-header');
    
    if (header) {
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    }
    
    lastScroll = currentScroll;
});

// Google Drive 파일 ID를 실제 링크로 변환하는 헬퍼 함수
function setGoogleDriveLink(elementId, fileId) {
    const element = document.getElementById(elementId);
    if (element) {
        const link = `https://drive.google.com/uc?export=download&id=${fileId}`;
        element.setAttribute('data-link', link);
    }
}

// 사용 예시 (필요시 주석 해제하여 사용):
// setGoogleDriveLink('크로네', 'YOUR_GOOGLE_DRIVE_FILE_ID');

