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
        
        if (downloadLink && downloadLink.trim() !== '') {
            // 직접 다운로드를 위해 임시 링크 생성 후 클릭
            const tempLink = document.createElement('a');
            tempLink.href = downloadLink;
            tempLink.rel = 'noopener noreferrer';
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
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

// 내부망 다운로드 버튼
const intranetDownloadBtn = document.querySelector('.intranet-download-btn');
const intranetGuide = document.querySelector('.intranet-guide');
const intranetGuideStatus = document.getElementById('intranet-guide-status');

function convertNetworkPathToFileUrl(path) {
    if (!path) return null;
    let trimmed = path.trim();
    if (trimmed.startsWith('file://')) {
        return trimmed;
    }
    trimmed = trimmed.replace(/^\\\\/, '');
    return `file://${trimmed.replace(/\\/g, '/')}`;
}

function showIntranetGuide() {
    if (!intranetGuide) return;
    intranetGuide.classList.add('visible');
    intranetGuide.setAttribute('aria-hidden', 'false');
}

function hideIntranetGuide() {
    if (!intranetGuide) return;
    intranetGuide.classList.remove('visible');
    intranetGuide.setAttribute('aria-hidden', 'true');
    if (intranetGuideStatus) {
        intranetGuideStatus.textContent = '';
        intranetGuideStatus.classList.remove('visible', 'error');
    }
}

function updateIntranetGuideStatus(message, isError = false) {
    if (!intranetGuideStatus) return;
    intranetGuideStatus.textContent = message;
    intranetGuideStatus.classList.add('visible');
    intranetGuideStatus.classList.toggle('error', isError);
}

if (intranetDownloadBtn) {
    intranetDownloadBtn.addEventListener('click', async function() {
        if (intranetGuide && intranetGuide.classList.contains('visible')) {
            hideIntranetGuide();
            return;
        }
        
        const networkPath = this.getAttribute('data-network-path');
        
        if (!networkPath || networkPath.trim() === '') {
            showIntranetGuide();
            updateIntranetGuideStatus('내부망 공유 폴더 경로가 설정되지 않았습니다.', true);
            return;
        }
        
        const fileUrl = convertNetworkPathToFileUrl(networkPath);
        let newWindow = null;
        
        if (fileUrl) {
            try {
                newWindow = window.open(fileUrl, '_blank', 'noopener');
            } catch (error) {
                newWindow = null;
            }
        }
        
        if (!newWindow) {
            try {
                await navigator.clipboard.writeText(networkPath);
                updateIntranetGuideStatus('경로를 클립보드에 복사했습니다. 탐색기 주소창에 붙여넣어 Enter를 눌러 주세요.', false);
            } catch (err) {
                updateIntranetGuideStatus(`브라우저 제한으로 자동 복사가 되지 않았습니다. 아래 경로를 직접 복사해 탐색기에 입력해 주세요: ${networkPath}`, true);
            }
        } else {
            this.classList.add('active');
            setTimeout(() => this.classList.remove('active'), 1000);
            updateIntranetGuideStatus('탐색기를 새 창으로 여는 중입니다. 열리지 않으면 클립보드를 이용해 접근해 주세요.', false);
        }

        showIntranetGuide();
    });
}

// iframe 뷰어 제어
const dashboardView = document.getElementById('dashboard-view');
const iframeView = document.getElementById('iframe-view');
const contentIframe = document.getElementById('content-iframe');
const navTitle = document.getElementById('nav-title');
const homeBtn = document.getElementById('home-btn');

let currentUrl = '';
let historyStack = [];
let historyIndex = -1;

// iframe에 URL 로드
function loadUrlInIframe(url, title, addToHistory = true) {
    if (!url || url.trim() === '') return;
    
    currentUrl = url;
    contentIframe.src = url;
    
    // 제목 설정
    if (title) {
        navTitle.textContent = title;
    } else {
        navTitle.textContent = '페이지 로딩 중...';
    }
    
    // 히스토리 스택에 추가 (뒤로가기/앞으로가기로 이동할 때는 추가하지 않음)
    if (addToHistory) {
        // 현재 위치 이후의 히스토리 제거 (새로운 페이지로 이동)
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(url);
        historyIndex = historyStack.length - 1;
    }
    
    // 뷰 전환
    dashboardView.style.display = 'none';
    iframeView.style.display = 'flex';
    
    // 히스토리 상태 추가
    pushHistoryState();
    
    // 네비게이션 버튼 상태 업데이트 (홈 버튼만 있으므로 불필요)
    
    // iframe 로드 완료 시 제목 업데이트
    contentIframe.onload = function() {
        try {
            const iframeDoc = contentIframe.contentDocument || contentIframe.contentWindow.document;
            const iframeTitle = iframeDoc.title || title || '페이지';
            navTitle.textContent = iframeTitle;
        } catch (e) {
            // CORS 오류 시 원래 제목 유지
            navTitle.textContent = title || '페이지';
        }
    };
}

// 홈으로 돌아가기
function goHome() {
    dashboardView.style.display = 'flex';
    iframeView.style.display = 'none';
    contentIframe.src = '';
    currentUrl = '';
    historyStack = [];
    historyIndex = -1;
    pushHistoryState();
}

// 네비게이션 버튼 상태 업데이트
function updateNavButtons() {
    // 홈 버튼만 있으므로 업데이트 불필요
}

// 홈으로
homeBtn.addEventListener('click', goHome);

// 브라우저 뒤로가기/앞으로가기 제어
window.addEventListener('popstate', function(event) {
    // 브라우저 뒤로가기/앞으로가기를 막고 앱 내 네비게이션 사용
    if (iframeView.style.display !== 'none') {
        event.preventDefault();
        goHome();
    }
});

// 히스토리 상태 추가 (브라우저 뒤로가기 방지)
function pushHistoryState() {
    if (iframeView.style.display !== 'none') {
        history.pushState({ page: 'iframe' }, '', '#iframe');
    } else {
        history.pushState({ page: 'dashboard' }, '', '#dashboard');
    }
}

// 링크 카드 클릭 이벤트
document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        const title = this.querySelector('.link-title').textContent;
        
        if (url && url.trim() !== '') {
            // 새로운 페이지 로드 시 히스토리 초기화하지 않고 추가
            loadUrlInIframe(url, title, true);
        } else {
            // URL이 설정되지 않은 경우
            const urlInput = prompt(`${title}의 URL을 입력해주세요:`, 'https://');
            
            if (urlInput && urlInput.trim() !== '') {
                this.setAttribute('data-url', urlInput);
                loadUrlInIframe(urlInput, title, true);
            }
        }
    });
});

// 브랜드 카드 클릭 이벤트
document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        const title = this.querySelector('.brand-title').textContent;
        const openInNewWindow = this.getAttribute('data-new-window') === 'true';
        
        if (url && url.trim() !== '') {
            if (openInNewWindow) {
                window.open(url, '_blank', 'noopener');
            } else {
                loadUrlInIframe(url, title, true);
            }
        } else {
            // URL이 설정되지 않은 경우
            const urlInput = prompt(`${title} 브랜드 사이트의 URL을 입력해주세요:`, 'https://');
            
            if (urlInput && urlInput.trim() !== '') {
                this.setAttribute('data-url', urlInput);
                if (openInNewWindow) {
                    window.open(urlInput, '_blank', 'noopener');
                } else {
                    loadUrlInIframe(urlInput, title, true);
                }
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

// 초기 히스토리 상태 설정
if (window.location.hash !== '#iframe') {
    history.replaceState({ page: 'dashboard' }, '', '#dashboard');
}

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


