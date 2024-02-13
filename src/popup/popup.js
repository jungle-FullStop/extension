// Define backend URL
const BACKEND_URL = 'https://tilfullstop.site';
// const BACKEND_URL = 'http://localhost:5173';

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  setupToggleSwitch();
  setupLoginButton();
  checkLoginStatus();
}

// 슬라이드 부분
function setupToggleSwitch() {
  const checkbox = document.getElementById('toggle-switch');
  chrome.storage.sync.get('extensionEnabled', data => {
    checkbox.checked = !!data.extensionEnabled;
  });
  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ 'extensionEnabled': checkbox.checked });
  });
}

function setupLoginButton() {
  // Initially check if the user is already logged in
  checkLoginStatus().then(isLoggedIn => {
    if (isLoggedIn) {
      updateUI(true); // User is already logged in, update UI accordingly
    } else {
      // Setup the login button for users not logged in
      const loginButton = document.getElementById('login-button');
      const loginFeedback = document.getElementById('login-feedback'); // Assuming you have this element for feedback
      loginFeedback.style.display = 'none'; // Hide feedback by default

      loginButton.addEventListener('click', () => {
        loginButton.disabled = true; // Disable button to prevent multiple clicks
        loginFeedback.style.display = 'block'; // Show login feedback

        initiateLoginProcess()
          .then(token => {
            // Authentication token retrieved after successful login
            updateUI(true); // Update UI for logged-in state
            // Optionally store the retrieved token for future use
            chrome.storage.local.set({ 'authToken': token }, () => {
              console.log('Authentication token stored:', token);
            });
          })
          .catch(error => {
            // Log and optionally display the error if login failed
            console.error('Login failed:', error);
            updateUI(false);
          })
          .finally(() => {
            // Re-enable the login button and hide the feedback regardless of the outcome
            loginButton.disabled = false;
            loginFeedback.style.display = 'none';
          });
      });
    }
  });
}

function initiateLoginProcess() {
  return new Promise((resolve, reject) => {
    // Open login page
    chrome.windows.create({ url: BACKEND_URL, type: 'popup' }, (newWindow) => {
      const tabId = newWindow.tabs[0].id;
      // Listen for updates to the tab
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo, tab) {
        // 로그인하게 되면 무조건 /home 으로 가기에 해당 url 감지하기
        if (updatedTabId === tabId && changeInfo.url && changeInfo.url.includes(BACKEND_URL + '/home')) {
          // 로그인한 페이지의 쿠키값 확인이 된다면
          chrome.cookies.get({ url: BACKEND_URL, name: 'utk' }, function(cookie) {
            if (cookie) {
              chrome.tabs.onUpdated.removeListener(listener); // Stop listening
              chrome.tabs.remove(tabId); // Close the login tab/window
              resolve(cookie.value); // Resolve the promise with the authToken value
            } else {
              reject(new Error('Auth token not found in cookies'));
            }
          });
        }
      });
    });
  });
}

function checkLoginStatus() {
  return new Promise(resolve => {
    chrome.cookies.get({ url: BACKEND_URL, name: 'utk' }, function(cookie) {
      resolve(!!cookie); // Resolves true if the cookie exists, indicating logged-in status
    });
  });
}

function updateUI(loggedIn) {
  const statusText = loggedIn ? 'Logged In' : 'Logged Out';
  document.getElementById('login-status').textContent = statusText;
  // Optionally, adjust the login button based on login status
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.style.display = loggedIn ? 'none' : 'block'; // Hide login button if logged in
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.loggedIn !== undefined) {
    updateUI(message.loggedIn);
  }
});
