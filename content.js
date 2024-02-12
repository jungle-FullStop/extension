const BACKEND_URL = "https://tilfullstop.site/extension/history";

// Initialize extension based on stored state
chrome.storage.sync.get("extensionEnabled", data => {
  if (data.extensionEnabled) {
    createButton();
  }
});

function createButton() {
  const button = document.createElement("TIL");
  button.id = "my-fixed-button";
  button.style = getButtonStyle();
  document.body.appendChild(button);
  makeButtonDraggable(button);
}

function getButtonStyle() {
  return `
    position: fixed; 
    width: 100px; 
    height: 100px; 
    top: 40px; 
    right: 10px; 
    z-index: 100000000; 
    background-image: url('${chrome.runtime.getURL("logo.png")}'); 
    background-size: contain; 
    background-color: transparent; 
    transition: transform 0.5s ease;
  `;
}

function showTopProgressBar() {
  const progressBar = document.createElement('div');
  const progressIndicator = document.createElement('div');

  // Style the container of the progress bar
  progressBar.style.position = 'fixed';
  progressBar.style.top = '0';
  progressBar.style.left = '0';
  progressBar.style.width = '100%';
  progressBar.style.height = '5px';
  progressBar.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  progressBar.style.zIndex = '100000002'; // Ensure high visibility
  progressBar.style.opacity = '1';
  progressBar.style.transition = 'opacity 1s ease-in-out'; // Fade-out transition

  // Style the progress indicator within the container
  progressIndicator.style.height = '100%';
  progressIndicator.style.width = '0';
  progressIndicator.style.backgroundColor = '#4CAF50'; // Green for progress
  progressIndicator.style.transition = 'width 2s ease-in-out';

  // Append the indicator to the container, and the container to the body
  progressBar.appendChild(progressIndicator);
  document.body.appendChild(progressBar);

  // Start the filling animation
  setTimeout(() => {
    progressIndicator.style.width = '100%';
  }, 100);

  // Wait for the fill animation to complete, then fade out
  setTimeout(() => {
    progressBar.style.opacity = '0';
  }, 2100); // Timing adjusted for fade-out to begin right after filling

  // Remove the progress bar after fade-out
  progressBar.ontransitionend = () => {
    if (progressBar.style.opacity === '0') {
      progressBar.remove();
    }
  };
}



function makeButtonDraggable(button) {
  let isDragging = false;
  let dragStartX, dragStartY;
  const threshold = 5;

  button.onmousedown = e => handleMouseDown(e, button);

  function handleMouseDown(e, button) {
    isDragging = false;
    dragStartX = e.clientX - button.offsetLeft;
    dragStartY = e.clientY - button.offsetTop;

    const handleMouseMove = e => moveButton(e, button);
    const handleMouseUp = () => stopDragging(handleMouseMove, handleMouseUp);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function moveButton(e, button) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!isDragging && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
      isDragging = true;
    }
    if (isDragging) {
      button.style.left = `${e.clientX - dragStartX}px`;
      button.style.top = `${e.clientY - dragStartY}px`;
    }
  }

  function stopDragging(handleMouseMove, handleMouseUp) {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  button.onclick = () => {
    if (!isDragging) {
      rotateButton(button);
      showTopProgressBar(); 
      extractTabInfoAndSend();
    }
  };
}

function rotateButton(button) {
  button.style.transform = "rotate(360deg)";
  button.ontransitionend = () => button.style.transform = "none";
}

// function extractTapInfo() {
//   chrome.runtime.sendMessage(
//     { action: "extractTapInfo" },
//     function (response_data) {
//       response_data["tag"] = htag_select();
//       sendRequestToBackend(response_data)
//     }
//   );
// }

function extractTabInfoAndSend() {
  chrome.runtime.sendMessage({ action: "extractTabInfo" }, function (response) {
    console.log("res:",response)
    const data = { ...response.data , 
                  tag: selectHTags(), 
                  description: selectDescription(),
                  thumbnail: selectThumbnail()
                 };
    sendRequestToBackend(data);
  });
}

function htag_select() {
  // h2, h3, h4 태그를 선택합니다.
  const htags = document.querySelectorAll("h1, h2, h3");

  let combinedText = [];
  for (let htag of htags) {
    // 현재까지의 텍스트 길이와 추가될 텍스트 길이를 합쳤을 때 300글자를 넘지 않는지 확인합니다.
    if (combinedText.join("").length + htag.innerText.length > 300) {
      break; // 300글자를 넘으면 반복문을 종료합니다.
    }
    combinedText.push(htag.innerText);
    // combinedText += htag.innerText + ' '; // 텍스트를 병합합니다.
  }
  return combinedText; // 최종 텍스트를 반환합니다.
}


function selectDescription() {
  return document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
}

function selectThumbnail() {
  return document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
}

async function sendRequestToBackend(data = {}) {
  chrome.runtime.sendMessage({ action: "sendRequestToBackend", data }, response => {
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      console.log('Response:', response.data);
    }
  });
}
