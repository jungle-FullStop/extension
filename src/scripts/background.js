// const BACKEND_URL = "http://localhost:3000/extension/history";
const BACKEND_URL = "https://tilfullstop.site/api/extension/history";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "extractTabInfo":
            extractTabInfo().then(response => {
                sendResponse({data: response});
            }).catch(error => {
                sendResponse({error: error.toString()});
            });
            return true; // Keep the message channel open for the asynchronous response
        case "checkLogin":
            // Assuming checkLoginStatus is also async
            checkLoginStatus().then(status => {
                sendResponse({loggedIn: status});
            }).catch(error => {
                sendResponse({error: error.toString()});
            });
            return true;
        case "sendRequestToBackend":
            console.log("REQ :",request.data)
            sendRequestToBackend(request.data).then(response => {
                console.log("익스텐션 : ",response)
                sendResponse({data: response});
            }).catch(error => {
                sendResponse({error: error.toString()});
            });
            return true;
    }
});

function extractTabInfo() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            if (tabs.length > 0) {
                var activeTab = tabs[0];
                resolve({url: activeTab.url, title: activeTab.title});
            } else {
                reject(new Error("No active tab found"));
            }
        });
    });
}
chrome.cookies.onChanged.addListener(changeInfo => {
    if (changeInfo.cookie.name === 'utk') {
        chrome.runtime.sendMessage({ loggedIn: changeInfo.cookie.value !== '' });
    }
});

function checkLoginStatus(sendResponse) {
    const loggedIn = true; // Placeholder for actual login check logic
    sendResponse({ loggedIn });
}

async function sendRequestToBackend(data = {}) {
    try {
        const result = await chrome.cookies.get({ url: BACKEND_URL, name: 'utk' })
        console.log("쿠기 :", result)
        if (result) {
            const response = await actualSendRequestFunction(data, result.value);
            return response
        } else {
            console.log("No cookie found in local storage.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function actualSendRequestFunction(data, cookieValue) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, utk: cookieValue }),
    });
    return response.json();
}
