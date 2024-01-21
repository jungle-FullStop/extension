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
