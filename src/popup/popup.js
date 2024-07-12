// Define backend URL
const BACKEND_URL = 'https://tilfullstop.site';
// const BACKEND_URL = 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  setupToggleSwitch();
  setupLoginButton();
  checkLoginStatus().then(updateUI);
  setupListToggle(); 
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
  checkLoginStatus().then(isLoggedIn => {
    if (isLoggedIn) {
      updateUI(true);
    } else {
      const loginButton = document.getElementById('login-button');
      const loginFeedback = document.getElementById('login-feedback');
      loginFeedback.style.display = 'none';

      loginButton.addEventListener('click', () => {
        loginButton.disabled = true; 
        loginFeedback.style.display = 'block';

        initiateLoginProcess()
          .then(token => {
            updateUI(true);
            chrome.storage.local.set({ 'authToken': token }, () => {
              console.log('Authentication token stored:', token);
            });
          })
          .catch(error => {
            console.error('Login failed:', error);
            updateUI(false);
          })
          .finally(() => {
            loginButton.disabled = false;
            loginFeedback.style.display = 'none';
          });
      });
    }
  });
}

function initiateLoginProcess() {
  return new Promise((resolve, reject) => {
    chrome.windows.create({ url: BACKEND_URL, type: 'popup' }, (newWindow) => {
      const tabId = newWindow.tabs[0].id;
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo, tab) {
        if (updatedTabId === tabId && changeInfo.url && changeInfo.url.includes(BACKEND_URL + '/home')) {
          chrome.cookies.get({ url: BACKEND_URL, name: 'utk' }, function(cookie) {
            if (cookie) {
              chrome.tabs.onUpdated.removeListener(listener); 
              chrome.tabs.remove(tabId);
              resolve(cookie.value);
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
  const loginButton = document.getElementById('login-button');
  const listContainer = document.getElementById('list-container');
  const toggleListButton = document.getElementById('toggle-list-button');
  
  console.log('aa')
  if (loginButton) {
    loginButton.style.display = loggedIn ? 'none' : 'block'; // Hide login button if logged in
  }

  if (loggedIn) {
    toggleListButton.style.display = 'block';
    fetchList();
  } else {
    listContainer.style.display = 'none';
    toggleListButton.style.display = 'none';
  }

}



// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.loggedIn !== undefined) {
//     updateUI(message.loggedIn);
//   }
// });



function fetchList() {
  chrome.runtime.sendMessage({action: "fetchList"}, response => {
      if (response.error) {
          console.error('Error fetching list:', response.error);
      } else {
          displayList(response.data);
      }
  });
}


function displayList(data) {
  const listContainer = document.getElementById('list-container');
  listContainer.innerHTML = ''; // Clear existing list items if any
  
  data.forEach(record => {
    const itemElement = document.createElement('div');
    itemElement.className = `list-item data-item-${record.id}`;
    
    // Display rawData as title
    const titleElement = document.createElement('span');
    titleElement.textContent = record.rawData; // rawData serves as the title
    itemElement.appendChild(titleElement);
    
    // Create and append delete button with SVG icon
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = `
      <svg class="icon-trash" fill="white" viewBox="0 0 24 24" width="24px" height="24px">
        <path d="M 10 2 L 9 3 L 4 3 L 4 4 L 7 4 L 17 4 L 20 4 L 20 3 L 15 3 L 14 2 L 10 2 z M 5 5 L 5 19 C 5 20.105 5.895 21 7 21 L 17 21 C 18.105 21 19 20.105 19 19 L 19 5 L 5 5 z M 7 7 L 9 7 L 9 19 L 7 19 L 7 7 z M 11 7 L 13 7 L 13 19 L 11 19 L 11 7 z M 15 7 L 17 7 L 17 19 L 15 19 L 15 7 z"/>
      </svg>
    `;
    deleteButton.onclick = () => deleteListItem(record.id);
    
    itemElement.appendChild(deleteButton);
    listContainer.appendChild(itemElement);
  });
}

function setupListToggle() {
  const toggleListButton = document.getElementById('toggle-list-button');
  const listContainer = document.getElementById('list-container');

  toggleListButton.addEventListener('click', () => {
    const isListVisible = listContainer.style.display !== 'none';
    listContainer.style.display = isListVisible ? 'none' : 'block';
    toggleListButton.textContent = isListVisible ? '펼치기' : '닫기';
  });
}


function deleteListItem(itemId) {
  chrome.runtime.sendMessage({action: "deleteItem", itemId: itemId}, response => {
    if (response.error) {
      console.error('Error deleting item:', response.error);
    } else {
      document.querySelector(`.data-item-${itemId}`).remove();
    }
  });
}