// 공통 유틸리티 함수들 + 강화된 다국어 지원

// HSL을 HEX로 변환
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// 복사 알림 표시
function showCopyNotification(
  message = "복사되었습니다!</br>Copied to clipboard!"
) {
  const notification = document.getElementById("copyNotification");
  if (notification) {
    notification.innerHTML = message;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 2000);
  }
}

// 랜덤 숫자 생성
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 배열 셔플
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 요소에 클래스 토글
function toggleClass(element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className);
  } else {
    element.classList.add(className);
  }
}

// 클립보드에 텍스트 복사
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

// 시간 지연 함수
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 요소가 화면에 보이는지 확인
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 숫자를 천 단위 구분 기호로 포맷
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 퍼센트 계산
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// 평균 계산
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
}

// 현재 언어 전역 변수
let currentLanguage = localStorage.getItem("userLanguage") || "ko";

// 현재 언어 가져오기
function getCurrentLanguage() {
  return currentLanguage;
}
/*
// 번역 텍스트 가져오기
function getTranslation(key, fallback = key) {
  if (
    window.translations &&
    window.translations[currentLanguage] &&
    window.translations[currentLanguage][key]
  ) {
    return window.translations[currentLanguage][key];
  }
  return fallback;
}
*/
// 언어별 알림 메시지 표시
function showLocalizedNotification(messageKey, fallbackMessage = null) {
  const message = getTranslation(messageKey, fallbackMessage || messageKey);
  showCopyNotification(message);
}

// 현재 언어로 번역된 복사 알림
function showLocalizedCopyNotification() {
  const message = getTranslation("copyNotification", "복사되었습니다!");
  showCopyNotification(message);
}

// 브라우저 언어 감지
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith("ko")) {
    return "ko";
  } else if (browserLang.startsWith("en")) {
    return "en";
  }
  return "ko"; // 기본값
}
/*
// 언어 버튼 상태 업데이트
function updateLanguageButtonStates(lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.lang === lang) {
      btn.classList.add("active");
    }
  });
}
*/
// 언어 변경 콜백 함수들 관리
const languageChangeCallbacks = [];

function addLanguageChangeCallback(callback) {
  if (typeof callback === "function") {
    languageChangeCallbacks.push(callback);
  }
}

function triggerLanguageChangeCallbacks(newLanguage) {
  languageChangeCallbacks.forEach((callback) => {
    try {
      callback(newLanguage);
    } catch (error) {
      console.error("Error in language change callback:", error);
    }
  });
}

// 메인 언어 변경 함수
function setLanguage(lang) {
  console.log("Setting language to:", lang);

  // 현재 언어 업데이트
  currentLanguage = lang;
  localStorage.setItem("userLanguage", lang);

  // HTML lang 속성 설정
  document.documentElement.lang = lang;

  // 버튼 상태 업데이트
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.lang === lang) {
      btn.classList.add("active");
    }
  });

  // 현재 경로를 기반으로 새로운 경로 생성 및 이동
  const currentPath = window.location.pathname;
  let newPath;

  if (lang === "en") {
    newPath = currentPath.replace(/^\/ko\//, "/en/");
  } else {
    newPath = currentPath.replace(/^\/en\//, "/ko/");
  }

  if (newPath !== currentPath) {
    window.location.href = newPath;
  }
}

// 언어 시스템 초기화
function initializeLanguage() {
  console.log("Initializing language system...");

  // 저장된 언어 또는 브라우저 언어 감지
  const savedLang = localStorage.getItem("userLanguage");
  const detectedLang = detectBrowserLanguage();
  const initialLang = savedLang || detectedLang;

  console.log("Initial language determined as:", initialLang);

  // 현재 언어 설정
  currentLanguage = initialLang;
  window.currentLanguage = initialLang;

  console.log("Language system initialized with:", initialLang);
}

// DOM 로드 시 다국어 시스템 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializeLanguage, 200);
  });
} else {
  setTimeout(initializeLanguage, 200);
}

// 언어 변경 시 페이지별 특별 처리 콜백 등록
addLanguageChangeCallback(applyPageSpecificTranslations);

// 전역 함수로 노출
window.getCurrentLanguage = getCurrentLanguage;
window.getTranslation = getTranslation;
window.showLocalizedNotification = showLocalizedNotification;
window.showLocalizedCopyNotification = showLocalizedCopyNotification;

window.setLanguage = setLanguage;
window.initializeLanguage = initializeLanguage;

window.addLanguageChangeCallback = addLanguageChangeCallback;
window.currentLanguage = currentLanguage;
