// 공통 컴포넌트 로더 시스템 + 토글 사이드바 + 강화된 다국어 지원
class ComponentLoader {
  static async loadComponent(selector, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = html;
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Component loading failed for ${componentPath}:`, error);
      return false;
    }
  }

  static async loadHeader() {
    const success = await this.loadComponent(
      "header",
      "/shared/components/header-ko.html"
    );
    if (success) {
      this.initHeaderEvents();
      this.setActiveNavigation();
    }
    return success;
  }

  static async loadFooter() {
    const success = await this.loadComponent(
      "footer",
      "/shared/components/footer-ko.html"
    );
    if (success) {
      this.initFooterEvents();
    }
    return success;
  }

  static async loadGameSidebar() {
    const success = await this.loadComponent(
      "#game-sidebar",
      "/shared/game-sidebar.html"
    );
    if (success) {
      this.initGameSidebarEvents();
    }
    return success;
  }

  static async loadToolSidebar() {
    const success = await this.loadComponent(
      "#tool-sidebar",
      "/shared/tool-sidebar.html"
    );
    if (success) {
      this.initToolSidebarEvents();
    }
    return success;
  }

  // 토글 사이드바 로드 및 초기화 (인덱스 페이지 제외)
  static initToggleSidebar(pageType, pageId = null) {
    console.log(
      "Initializing toggle sidebar for:",
      pageType,
      "pageId:",
      pageId
    );

    // 인덱스 페이지에서는 토글 사이드바를 생성하지 않음
    if (!pageId) {
      console.log("Index page detected, skipping toggle sidebar");
      return;
    }

    // 토글 버튼 생성
    this.createToggleButton();

    // 모바일 사이드바 생성
    this.createMobileSidebar(pageType, pageId);

    // 오버레이 생성
    this.createOverlay();

    // 이벤트 리스너 설정
    this.setupToggleEvents();
  }

  static createToggleButton() {
    // 기존 토글 버튼 제거
    const existingToggle = document.querySelector(".sidebar-toggle");
    if (existingToggle) {
      existingToggle.remove();
    }

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "sidebar-toggle";
    toggleBtn.innerHTML = "☰";
    toggleBtn.setAttribute("aria-label", "Toggle Sidebar");
    document.body.appendChild(toggleBtn);
  }

  static async createMobileSidebar(pageType, pageId = null) {
    // 기존 모바일 사이드바 제거
    const existingSidebar = document.querySelector(".sidebar-mobile");
    if (existingSidebar) {
      existingSidebar.remove();
    }

    const mobileSidebar = document.createElement("div");
    mobileSidebar.className = "sidebar-mobile";

    let sidebarContent = "";

    if (pageType === "games") {
      sidebarContent = `
        <h3>🎯 게임 목록</h3>
        <ul class="game-list">
          <li class="game-item" data-game="fps-aim" >🎯 FPS 에임 훈련</li>
          <li class="game-item" data-game="reaction-test" >🎲 반응속도 테스트</li>
          <li class="game-item" data-game="memory-game" >🎪 메모리 게임</li>
          <li class="game-item" data-game="color-match" >🎨 색깔 맞추기</li>
        </ul>
      `;
    } else if (pageType === "tools") {
      sidebarContent = `
        <h3>🛠️ 도구 목록</h3>
        <ul class="tool-list">
          <li class="tool-item" data-tool="color-palette" >🎨 색상 팔레트 생성기</li>
          <li class="tool-item" data-tool="keywords" >💡 오늘의 키워드</li>
          <li class="tool-item" data-tool="unit-converter">📏 단위 변환기</li>
          <li class="tool-item" data-tool="text-transformer" >🔤 텍스트 변환기</li>
        </ul>
      `;
    }

    mobileSidebar.innerHTML = sidebarContent;
    document.body.appendChild(mobileSidebar);
    /*
    // 번역 적용
    if (typeof window.updateAllTranslations === "function") {
      setTimeout(() => {
        window.updateAllTranslations();
      }, 100);
    }
*/
    // 사이드바 이벤트 설정
    if (pageType === "games") {
      this.initMobileGameSidebarEvents();
    } else if (pageType === "tools") {
      this.initMobileToolSidebarEvents();
    }

    // 활성 아이템 설정
    if (pageId) {
      setTimeout(() => {
        if (pageType === "games") {
          this.setActiveMobileGameSidebar(pageId);
        } else if (pageType === "tools") {
          this.setActiveMobileToolSidebar(pageId);
        }
      }, 200);
    }
  }

  static createOverlay() {
    // 기존 오버레이 제거
    const existingOverlay = document.querySelector(".sidebar-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
  }

  static setupToggleEvents() {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileSidebar = document.querySelector(".sidebar-mobile");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggleBtn || !mobileSidebar || !overlay) {
      console.error("Toggle elements not found");
      return;
    }

    // 토글 버튼 클릭
    toggleBtn.addEventListener("click", () => {
      this.toggleSidebar();
    });

    // 오버레이 클릭으로 닫기
    overlay.addEventListener("click", () => {
      this.closeSidebar();
    });

    // ESC 키로 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeSidebar();
      }
    });
  }

  static toggleSidebar() {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileSidebar = document.querySelector(".sidebar-mobile");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggleBtn || !mobileSidebar || !overlay) return;

    const isOpen = mobileSidebar.classList.contains("open");

    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  static openSidebar() {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileSidebar = document.querySelector(".sidebar-mobile");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggleBtn || !mobileSidebar || !overlay) return;

    toggleBtn.classList.add("active");
    mobileSidebar.classList.add("open");
    overlay.classList.add("open");
    overlay.style.display = "block";

    // 스크롤 방지
    document.body.style.overflow = "hidden";
  }

  static closeSidebar() {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileSidebar = document.querySelector(".sidebar-mobile");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggleBtn || !mobileSidebar || !overlay) return;

    toggleBtn.classList.remove("active");
    mobileSidebar.classList.remove("open");
    overlay.classList.remove("open");

    // 애니메이션 후 오버레이 숨기기 및 pointer-events 차단
    setTimeout(() => {
      if (!overlay.classList.contains("open")) {
        overlay.style.display = "none";
      }
    }, 300);

    // 스크롤 복원
    document.body.style.overflow = "";
  }

  static initMobileGameSidebarEvents() {
    document.querySelectorAll(".sidebar-mobile .game-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const game = item.dataset.game;
        console.log("Mobile game sidebar item clicked:", game);
        if (game) {
          // 사이드바 닫기
          this.closeSidebar();
          // 페이지 이동
          window.location.href = `/ko/games/${game}.html`;
        }
      });
    });
  }

  static initMobileToolSidebarEvents() {
    document.querySelectorAll(".sidebar-mobile .tool-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tool = item.dataset.tool;
        console.log("Mobile tool sidebar item clicked:", tool);
        if (tool) {
          // 사이드바 닫기
          this.closeSidebar();
          // 페이지 이동
          window.location.href = `/ko/tools/${tool}.html`;
        }
      });
    });
  }

  static setActiveMobileGameSidebar(gameId) {
    setTimeout(() => {
      document
        .querySelectorAll(".sidebar-mobile .game-item")
        .forEach((item) => {
          item.classList.remove("active");
          if (item.dataset.game === gameId) {
            item.classList.add("active");
          }
        });
    }, 100);
  }

  static setActiveMobileToolSidebar(toolId) {
    setTimeout(() => {
      document
        .querySelectorAll(".sidebar-mobile .tool-item")
        .forEach((item) => {
          item.classList.remove("active");
          if (item.dataset.tool === toolId) {
            item.classList.add("active");
          }
        });
    }, 100);
  }

  static initHeaderEvents() {
    // 로고 클릭 이벤트
    const logo = document.querySelector(".logo");
    if (logo) {
      logo.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        e.preventDefault();
        if (href.startsWith("/ko/")) {
          window.location.href = "/ko/";
        } else if (href.startsWith("/en/")) {
          window.location.href = "/en/";
        } else {
          window.location.href = "/";
        }
      });
    }

    // 네비게이션 아이템 클릭 이벤트
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        if (href && !href.startsWith("#")) {
          return;
        }
        e.preventDefault();
      });
    });
  }

  static initFooterEvents() {
    // 푸터 메뉴 이벤트
    document.querySelectorAll(".footer-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          window.location.href = `/ko/about/${page}.html`;
        }
      });
    });
  }

  static initGameSidebarEvents() {
    document.querySelectorAll("#game-sidebar .game-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const game = item.dataset.game;
        console.log("Game sidebar item clicked:", game);
        if (game) {
          window.location.href = `/ko/games/${game}.html`;
        }
      });
    });
  }

  static initToolSidebarEvents() {
    // 도구 사이드바 이벤트 - tool-item 클래스 사용
    document.querySelectorAll("#tool-sidebar .tool-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tool = item.dataset.tool;
        console.log("Tool sidebar item clicked:", tool);
        if (tool) {
          window.location.href = `/ko/tools/${tool}.html`;
        }
      });
    });
  }

  static setActiveNavigation() {
    const currentPath = window.location.pathname;
    //console.log("Setting active navigation for path:", currentPath); // 디버깅

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      const href = item.getAttribute("href");
      //console.log("Checking nav item:", href); // 디버깅

      if (
        href === currentPath ||
        (currentPath === "/" && href === "/") ||
        (currentPath.startsWith("/ko/games") && href === "/ko/games/") ||
        (currentPath.startsWith("/ko/tools") && href === "/ko/tools/") ||
        (currentPath.includes("/ko/about") &&
          href === "/ko/about/about.html") ||
        // about 폴더 하위 모든 페이지에 대해 소개 메뉴 활성화
        //(currentPath.startsWith("/about/") && href === "/about/about.html")
        // 푸터에서 about 페이지로 갈 때 헤더의 소개 메뉴 활성화
        //(currentPath === "/about/about.html" && href === "/about/about.html")
        //about 경로를 유연하게 매칭
        ((currentPath === "/ko/about/about.html" ||
          currentPath === "/ko/about/about") &&
          (href === "/ko/about/about.html" || href === "/ko/about/about"))
      ) {
        item.classList.add("active");
        //console.log("Activated nav item:", href); // 디버깅
      }
    });
  }

  static setActiveGameSidebar(gameId) {
    setTimeout(() => {
      document.querySelectorAll("#game-sidebar .game-item").forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.game === gameId) {
          item.classList.add("active");
        }
      });
    }, 100);
  }

  static setActiveToolSidebar(toolId) {
    console.log("Setting active tool sidebar for:", toolId);

    setTimeout(() => {
      document.querySelectorAll("#tool-sidebar .tool-item").forEach((item) => {
        item.classList.remove("active");
        console.log(
          "Checking tool item:",
          item.dataset.tool,
          "against",
          toolId
        );

        if (item.dataset.tool === toolId) {
          item.classList.add("active");
          console.log("Activated tool item:", toolId);
        }
      });
    }, 100);
  }

  // 반응형 레이아웃 적용 (강화됨)
  static applyResponsiveLayout(pageType = null, pageId = null) {
    const width = window.innerWidth;
    console.log(
      "Applying responsive layout for width:",
      width,
      "pageType:",
      pageType,
      "pageId:",
      pageId
    );

    // 토글 사이드바 관리 (pageType과 pageId 전달)
    this.manageToggleSidebar(width, pageType, pageId);

    const gameContainers = document.querySelectorAll(
      ".games-container, .tools-container"
    );
    const homeLayouts = document.querySelectorAll(".home-layout");
    const aboutContainers = document.querySelectorAll(".about-container");

    // 게임/도구 컨테이너 처리
    gameContainers.forEach((container) => {
      if (width >= 1200) {
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.gap = "30px";
      } else {
        // 태블릿/모바일에서는 block으로 전체 너비 사용
        container.style.display = "block";
        container.style.width = "100%";
      }
    });

    // 홈 레이아웃 처리
    homeLayouts.forEach((layout) => {
      if (width >= 1200) {
        layout.style.display = "flex";
        layout.style.gap = "20px";
      } else {
        layout.style.display = "block";
      }
    });

    // About 컨테이너 처리
    aboutContainers.forEach((container) => {
      if (width >= 1200) {
        container.style.display = "flex";
        container.style.gap = "20px";
        container.style.maxWidth = "1200px";
        container.style.margin = "0 auto";
      } else {
        container.style.display = "block";
        container.style.maxWidth = "100%";
        container.style.margin = "0";
      }
    });

    // 요소 순서 및 크기 설정
    const sidebars = document.querySelectorAll(".sidebar");
    const contents = document.querySelectorAll(
      ".game-content, .tool-content, .about-content, .home-content"
    );
    const adSidebars = document.querySelectorAll(".ad-sidebar");

    sidebars.forEach((sidebar) => {
      sidebar.style.order = "1";
      if (width >= 1200) {
        sidebar.style.width = "250px";
        sidebar.style.flexShrink = "0";
        sidebar.style.display = "block";
      } else {
        sidebar.style.display = "none";
      }
    });

    contents.forEach((content) => {
      if (width >= 1200) {
        content.style.order = "2";
        content.style.flex = "1";
        content.style.minWidth = "0";
      } else {
        content.style.order = "1";
        content.style.width = "100%";
      }
    });

    adSidebars.forEach((adSidebar) => {
      adSidebar.style.order = "3";
      if (width >= 1200) {
        adSidebar.style.display = "flex";
        adSidebar.style.flexDirection = "column";
        adSidebar.style.width = "200px";
        adSidebar.style.flexShrink = "0";
      } else {
        adSidebar.style.display = "none";
      }
    });
  }

  // 토글 사이드바 관리 (인덱스 페이지 고려)
  static manageToggleSidebar(width, pageType = null, pageId = null) {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const mobileSidebar = document.querySelector(".sidebar-mobile");
    const overlay = document.querySelector(".sidebar-overlay");

    // 인덱스 페이지에서는 토글 사이드바 완전 제거
    if (!pageId) {
      if (toggleBtn) {
        toggleBtn.remove();
      }
      if (mobileSidebar) {
        mobileSidebar.remove();
      }
      if (overlay) {
        overlay.remove();
      }
      return;
    }

    if (width >= 1200) {
      // PC에서는 토글 사이드바 숨김
      if (toggleBtn) toggleBtn.style.display = "none";
      if (mobileSidebar) mobileSidebar.style.display = "none";
      if (overlay) {
        overlay.style.display = "none";
        overlay.classList.remove("open");
      }
      // 사이드바가 열려있다면 닫기
      this.closeSidebar();
      // 스크롤 복원
      document.body.style.overflow = "";
    } else {
      // 모바일/태블릿에서는 토글 사이드바 표시 (pageId가 있는 경우만)
      if (toggleBtn) toggleBtn.style.display = "block";
      if (mobileSidebar) mobileSidebar.style.display = "block";
    }
  }

  // 초기화 함수 (강화됨)
  static async init(pageType, pageId = null) {
    try {
      console.log("ComponentLoader initializing...", { pageType, pageId });

      // 기본 컴포넌트 로드
      await this.loadHeader();
      await this.loadFooter();

      // 헤더 로드 후 네비게이션 활성화
      setTimeout(() => {
        this.setActiveNavigation();
      }, 100);

      // 페이지 타입별 사이드바 로드 (PC용) - pageId가 있는 경우만
      if (pageId && pageType === "games") {
        await this.loadGameSidebar();
        this.setActiveGameSidebar(pageId);
      } else if (pageId && pageType === "tools") {
        await this.loadToolSidebar();
        this.setActiveToolSidebar(pageId);
      }

      // 토글 사이드바 초기화 (모바일/태블릿용) - pageId가 있는 경우만
      if (pageId && (pageType === "games" || pageType === "tools")) {
        setTimeout(() => {
          this.initToggleSidebar(pageType, pageId);
        }, 100);
      }

      // 반응형 레이아웃 적용 (pageType과 pageId 전달)
      this.applyResponsiveLayout(pageType, pageId);

      // 리사이즈 이벤트 리스너 (개선됨)
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          console.log("Window resized, applying responsive layout");
          this.applyResponsiveLayout(pageType, pageId);
        }, 100);
      });

      console.log("Component initialization complete");
      return true;
    } catch (error) {
      console.error("Component initialization failed:", error);
      return false;
    }
  }
}
// 전역으로 노출
window.ComponentLoader = ComponentLoader;
