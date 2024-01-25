chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extractTapInfo") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            var url = activeTab.url;
            var title = activeTab.title;
            sendResponse({url: url, title: title});
        });
        return true; // 비동기 응답을 위해 필요합니다.
    }
});



// 변환되는 쿠키값을 찾아서, 만일 해당 쿠키값이 변경되면 바로 익스텐션 화면에 적용될 수 있게 해주는 함수. 차후 구현예정
chrome.cookies.onChanged.addListener(function(changeInfo) {
    if (changeInfo.cookie.name === 'utk') {
      console.log("HEY!")
      chrome.runtime.sendMessage({ loggedIn: changeInfo.cookie.value !== '' });
    }
  });


  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkLogin") {
      // 로그인 상태 확인 로직
      var loggedIn = true;
      sendResponse({ loggedIn: loggedIn });
    }
  });