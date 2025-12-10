// 현재 시간 업데이트
function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // 멋진 시간 표시 형식: [아이콘] HH:MM:SS
        timeElement.innerHTML = `
            <i class="fas fa-clock"></i>
            <span class="time-value">${hours}<span class="time-separator">:</span>${minutes}<span class="time-separator">:</span>${seconds}</span>
        `;
    }
}

// 초기 시간 설정 및 1초마다 업데이트
updateTime();
setInterval(updateTime, 1000);

// 비밀번호 상수
const DOWNLOAD_PASSWORD = 'eibe2005@@';

// 비밀번호 모달 관련 요소
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const passwordConfirm = document.getElementById('password-confirm');
const passwordCancel = document.getElementById('password-cancel');
const passwordModalClose = document.getElementById('password-modal-close');
const passwordToggle = document.getElementById('password-toggle');
const passwordEyeIcon = document.getElementById('password-eye-icon');

// 현재 다운로드할 버튼 정보 저장
let currentDownloadButton = null;

// 비밀번호 모달 표시
function showPasswordModal(button) {
    currentDownloadButton = button;
    passwordModal.classList.add('active');
    passwordInput.value = '';
    passwordError.textContent = '';
    passwordInput.focus();
    
    // ESC 키로 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closePasswordModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// 비밀번호 모달 닫기
function closePasswordModal() {
    passwordModal.classList.remove('active');
    passwordInput.value = '';
    passwordError.textContent = '';
    currentDownloadButton = null;
}

// 비밀번호 확인 및 다운로드 실행
function executeDownload() {
    if (!currentDownloadButton) return;
    
    const downloadLink = currentDownloadButton.getAttribute('data-link');
    const openMode = currentDownloadButton.getAttribute('data-open-mode') || 'direct';
    const customTitle = currentDownloadButton.getAttribute('data-link-title');
    const fallbackTitle = currentDownloadButton.closest('.menu-card')?.querySelector('.card-title')?.textContent || '다운로드';
    const viewerTitle = customTitle ? `${customTitle}` : `${fallbackTitle} 다운로드`;
    
    closePasswordModal();
    
    if (openMode === 'viewer') {
        if (downloadLink && downloadLink.trim() !== '') {
            loadUrlInIframe(downloadLink, viewerTitle, true);
        } else {
            alert('다운로드 링크를 설정해주세요. Google Drive 파일 링크를 data-link 속성에 추가하세요.');
        }
        return;
    }

    if (openMode === 'tab') {
        if (downloadLink && downloadLink.trim() !== '') {
            const tempAnchor = document.createElement('a');
            tempAnchor.href = downloadLink;
            tempAnchor.target = '_blank';
            tempAnchor.rel = 'noopener noreferrer';
            tempAnchor.style.display = 'none';
            document.body.appendChild(tempAnchor);
            tempAnchor.click();
            document.body.removeChild(tempAnchor);
        } else {
            alert('다운로드 링크를 설정해주세요. Google Drive 파일 링크를 data-link 속성에 추가하세요.');
        }
        return;
    }
    
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
        currentDownloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>DOWNLOADING...</span>';
        currentDownloadButton.style.opacity = '0.7';
        
        setTimeout(() => {
            currentDownloadButton.innerHTML = '<i class="fas fa-cloud-download-alt"></i><span>DOWNLOAD</span>';
            currentDownloadButton.style.opacity = '1';
        }, 2000);
    } else {
        alert('다운로드 링크를 설정해주세요. Google Drive 파일 ID를 data-link 속성에 추가하세요.');
    }
}

// 비밀번호 검증
function validatePassword() {
    const inputPassword = passwordInput.value.trim();
    
    if (inputPassword === '') {
        passwordError.textContent = '비밀번호를 입력해주세요.';
        passwordError.classList.add('show');
        passwordInput.focus();
        return false;
    }
    
    if (inputPassword !== DOWNLOAD_PASSWORD) {
        passwordError.textContent = '비밀번호가 일치하지 않습니다.';
        passwordError.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // 에러 메시지 3초 후 자동 제거
        setTimeout(() => {
            passwordError.classList.remove('show');
        }, 3000);
        return false;
    }
    
    passwordError.classList.remove('show');
    return true;
}

// 비밀번호 모달 이벤트 리스너
if (passwordConfirm) {
    passwordConfirm.addEventListener('click', function() {
        if (validatePassword()) {
            executeDownload();
        }
    });
}

if (passwordCancel) {
    passwordCancel.addEventListener('click', closePasswordModal);
}

if (passwordModalClose) {
    passwordModalClose.addEventListener('click', closePasswordModal);
}

// 비밀번호 입력 필드에서 Enter 키 처리
if (passwordInput) {
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (validatePassword()) {
                executeDownload();
            }
        }
    });
}

// 비밀번호 표시/숨김 토글
if (passwordToggle) {
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            passwordEyeIcon.classList.remove('fa-eye');
            passwordEyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordEyeIcon.classList.remove('fa-eye-slash');
            passwordEyeIcon.classList.add('fa-eye');
        }
    });
}

// 모달 오버레이 클릭 시 닫기
if (passwordModal) {
    passwordModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('password-modal-overlay')) {
            closePasswordModal();
        }
    });
}

// 다운로드 버튼 이벤트 (비밀번호 모달 표시)
document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // TOOLBOX DOWNLOAD 섹션의 버튼인지 확인
        const isToolboxButton = this.closest('.menu-card')?.getAttribute('data-category') === 'toolbox';
        
        if (isToolboxButton) {
            // 비밀번호 모달 표시
            showPasswordModal(this);
        } else {
            // 다른 섹션의 버튼은 기존 로직 실행
            const downloadLink = this.getAttribute('data-link');
            const openMode = this.getAttribute('data-open-mode') || 'direct';
            const customTitle = this.getAttribute('data-link-title');
            const fallbackTitle = this.closest('.menu-card')?.querySelector('.card-title')?.textContent || '다운로드';
            const viewerTitle = customTitle ? `${customTitle}` : `${fallbackTitle} 다운로드`;
            
            if (openMode === 'viewer') {
                if (downloadLink && downloadLink.trim() !== '') {
                    loadUrlInIframe(downloadLink, viewerTitle, true);
                } else {
                    alert('다운로드 링크를 설정해주세요. Google Drive 파일 링크를 data-link 속성에 추가하세요.');
                }
                return;
            }

            if (openMode === 'tab') {
                if (downloadLink && downloadLink.trim() !== '') {
                    const tempAnchor = document.createElement('a');
                    tempAnchor.href = downloadLink;
                    tempAnchor.target = '_blank';
                    tempAnchor.rel = 'noopener noreferrer';
                    tempAnchor.style.display = 'none';
                    document.body.appendChild(tempAnchor);
                    tempAnchor.click();
                    document.body.removeChild(tempAnchor);
                } else {
                    alert('다운로드 링크를 설정해주세요. Google Drive 파일 링크를 data-link 속성에 추가하세요.');
                }
                return;
            }
            
            if (downloadLink && downloadLink.trim() !== '') {
                const tempLink = document.createElement('a');
                tempLink.href = downloadLink;
                tempLink.rel = 'noopener noreferrer';
                tempLink.style.display = 'none';
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>DOWNLOADING...</span>';
                this.style.opacity = '0.7';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cloud-download-alt"></i><span>DOWNLOAD</span>';
                    this.style.opacity = '1';
                }, 2000);
            } else {
                alert('다운로드 링크를 설정해주세요. Google Drive 파일 ID를 data-link 속성에 추가하세요.');
            }
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
let isNavigating = false; // 네비게이션 중복 방지

// iframe에 URL 로드
function loadUrlInIframe(url, title, addToHistory = true) {
    if (!url || url.trim() === '' || isNavigating) return;
    
    isNavigating = true;
    currentUrl = url;
    
    // 제목 설정
    if (title) {
        navTitle.textContent = title;
    } else {
        navTitle.textContent = '페이지 로딩 중...';
    }
    
    // 대시보드 뷰 숨기기 (부드러운 전환)
    dashboardView.classList.add('hiding');
    
    // 약간의 딜레이 후 iframe 뷰 표시
    setTimeout(() => {
        dashboardView.style.display = 'none';
        iframeView.style.display = 'flex';
        
        // 다음 프레임에서 활성화하여 부드러운 전환
        requestAnimationFrame(() => {
            iframeView.classList.add('active');
            contentIframe.src = url;
            isNavigating = false;
        });
    }, 150);
    
    // 히스토리 스택에 추가 (뒤로가기/앞으로가기로 이동할 때는 추가하지 않음)
    if (addToHistory) {
        // 현재 위치 이후의 히스토리 제거 (새로운 페이지로 이동)
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(url);
        historyIndex = historyStack.length - 1;
    }
    
    // 히스토리 상태 추가 (한 번만)
    setTimeout(() => {
        pushHistoryState();
    }, 200);
    
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
    
    // 에러 처리
    contentIframe.onerror = function() {
        navTitle.textContent = title || '페이지 로드 오류';
        isNavigating = false;
    };
}

// 홈으로 돌아가기
function goHome() {
    if (isNavigating) return;
    
    isNavigating = true;
    
    // iframe 뷰 숨기기 (부드러운 전환)
    iframeView.classList.remove('active');
    
    // 약간의 딜레이 후 대시보드 뷰 표시
    setTimeout(() => {
        iframeView.style.display = 'none';
        dashboardView.style.display = 'flex';
        dashboardView.classList.remove('hiding');
        
        // 다음 프레임에서 iframe 초기화
        requestAnimationFrame(() => {
            contentIframe.src = '';
            currentUrl = '';
            historyStack = [];
            historyIndex = -1;
            isNavigating = false;
        });
    }, 150);
    
    // 히스토리 상태 업데이트
    setTimeout(() => {
        pushHistoryState();
    }, 200);
}

// 네비게이션 버튼 상태 업데이트
function updateNavButtons() {
    // 홈 버튼만 있으므로 업데이트 불필요
}

// 홈으로
homeBtn.addEventListener('click', goHome);

// 브라우저 뒤로가기/앞으로가기 제어
let isPopStateHandled = false;

window.addEventListener('popstate', function(event) {
    // popstate는 취소할 수 없으므로 상태만 확인
    if (iframeView.style.display !== 'none' && !isPopStateHandled) {
        isPopStateHandled = true;
        goHome();
        // 다음 popstate를 위해 다시 pushState
        setTimeout(() => {
            pushHistoryState();
            isPopStateHandled = false;
        }, 100);
    }
});

// 히스토리 상태 추가 (브라우저 뒤로가기 방지)
let lastHistoryState = null;

function pushHistoryState() {
    const currentState = iframeView.style.display !== 'none' ? 'iframe' : 'dashboard';
    
    // 중복 push 방지
    if (lastHistoryState === currentState) {
        return;
    }
    
    lastHistoryState = currentState;
    
    if (currentState === 'iframe') {
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

// 브랜드 카드 클릭 이벤트 (모든 브랜드 사이트는 새 탭에서 열림)
document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        const title = this.querySelector('.brand-title').textContent;
        
        if (url && url.trim() !== '') {
            window.open(url, '_blank', 'noopener');
        } else {
            // URL이 설정되지 않은 경우
            const urlInput = prompt(`${title} 브랜드 사이트의 URL을 입력해주세요:`, 'https://');
            
            if (urlInput && urlInput.trim() !== '') {
                this.setAttribute('data-url', urlInput);
                window.open(urlInput, '_blank', 'noopener');
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
    lastHistoryState = 'dashboard';
}

// 페이지 로드 시 고급스러운 부드러운 페이드인 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    const dashboardContainer = document.querySelector('.dashboard-container');
    const bgParticles = document.querySelector('.bg-particles');
    const bgGrid = document.querySelector('.bg-grid');
    const header = document.querySelector('.dashboard-header');
    const sections = document.querySelectorAll('.dashboard-section');
    const footer = document.querySelector('.dashboard-footer');
    const menuCards = document.querySelectorAll('.menu-card');
    const linkCards = document.querySelectorAll('.link-card');
    const brandCards = document.querySelectorAll('.brand-card');
    
    // 배경 효과 먼저 천천히 나타남
    setTimeout(() => {
        if (bgParticles) {
            bgParticles.classList.add('loaded');
        }
        if (bgGrid) {
            bgGrid.classList.add('loaded');
        }
    }, 100);
    
    // 헤더와 컨테이너가 부드럽게 나타남
    setTimeout(() => {
        if (dashboardContainer) {
            dashboardContainer.classList.add('loaded');
        }
        if (header) {
            header.classList.add('loaded');
        }
    }, 300);
    
    // 섹션들이 순차적으로 부드럽게 나타남 (간격을 넓게)
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('loaded');
        }, 500 + (index * 200));
    });
    
    // 카드들이 섹션 다음에 부드럽게 나타남
    setTimeout(() => {
        menuCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('loaded');
            }, index * 80);
        });
        linkCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('loaded');
            }, index * 80);
        });
        brandCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('loaded');
            }, index * 80);
        });
    }, 700);
    
    // 푸터 마지막에 부드럽게 나타남
    setTimeout(() => {
        if (footer) {
            footer.classList.add('loaded');
        }
    }, 900 + (sections.length * 200));
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


