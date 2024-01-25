const BACKEND_URL = 'http://localhost:5173';

  document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('toggle-switch');
  
    // 저장된 상태를 로드하여 스위치 설정
    chrome.storage.sync.get('extensionEnabled', function(data) {
      checkbox.checked = data.extensionEnabled;
    });
  
    // 스위치 상태 변경 시, 새로운 값을 저장
    checkbox.addEventListener('change', function() {
      chrome.storage.sync.set({'extensionEnabled': checkbox.checked});
    });

    checkLoginStatus()

  });


  const check_cookies = null;

  document.getElementById('login-button').addEventListener('click', function() {
    console.log(check_cookies);
    // 여기에 로그인 페이지로 리디렉션하거나 OAuth 프로세스 시작하는 코드 작성
    chrome.windows.create({
      url: BACKEND_URL, // 로그인 페이지 URL
      type: 'popup', // 창 유형을 'popup'으로 설정
    });
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.loggedIn) {
      // 로그인 상태에 따라 UI 업데이트
      document.getElementById('login-status').textContent = 'Logged In';
    } else {
      document.getElementById('login-status').textContent = 'Not Logged In';
    }
  });

  function checkLoginStatus() {
    // 웹사이트에서 쿠키를 가져옵니다
    chrome.cookies.get({ url: BACKEND_URL, name: 'utk' }, function(newCookie) {
      console.log(newCookie);
      if (newCookie) {
        // 확장 프로그램에서 저장된 쿠키값을 확인합니다
        chrome.storage.local.get(['utkCookie'], function(result) {
          if (!result.utkCookie || result.utkCookie.value !== newCookie.value) {
            // 쿠키가 다르면 새로운 쿠키값으로 갱신합니다
            chrome.storage.local.set({ utkCookie: newCookie }, function() {
              console.log('Extension cookie updated:', newCookie);
            });
          }
        });
        updateUI(true);
      } else {
        updateUI(false);
      }
    });
  }
  
  function setExtensionCookie(newCookie) {
    chrome.cookies.set({
      url: BACKEND_URL, // 쿠키를 설정할 URL
      name: newCookie.name, // 쿠키 이름
      value: newCookie.value, // 쿠키 값
      // 필요한 경우 다른 쿠키 속성들도 설정할 수 있습니다
    }, function(setCookie) {
      // 새로 설정된 쿠키에 대한 처리
      console.log('New Cookie Set:', setCookie);
    });
  }


  function updateUI(loggedIn) {
    if (loggedIn) {
      document.getElementById('login-status').textContent = 'Logged In';
    } else {
      // 로그아웃 상태일 때 UI 업데이트
      document.getElementById('login-status').textContent = 'Logged Out';
    }
  }

  /*

  애시당초, Extension을 열었다면 그때 로그인 체크하는데
  체크하는 로직이 쿠키값으로 판단해야 하는데

  */