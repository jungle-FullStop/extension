// 여기는 나중에 로그인이 되었을 때 진행되어야 하는 부분
chrome.storage.sync.get("extensionEnabled", function (data) {
  if (data.extensionEnabled) {
    createButton();
  } else {
    // 확장 프로그램 기능 비활성화
  }
});

const BACKEND_URL = "http://localhost:3000/extension/history";

function createButton() {
  const button = document.createElement("TIL");
  button.id = "my-fixed-button";
  button.style =
     'position: fixed; width:100px; height:100px; top: 40px; right: 10px; z-index: 100000000; background-image: url("' +
    chrome.runtime.getURL("logo.png") +
    '"); background-size: contain; background-color: transparent;';
  button.style.transition = "transform 0.5s ease";
  document.body.appendChild(button);
  initDraggable(button);
}

function initDraggable(button) {
  let isDragging = false;
  let dragStartX, dragStartY;
  const threshold = 5;

  button.addEventListener("mousedown", function (e) {
    handleMouseDown(e, button);
  });

  function handleMouseDown(e, button) {
    isDragging = false;
    dragStartX = e.clientX - button.offsetLeft;
    dragStartY = e.clientY - button.offsetTop;

    function handleMouseMove(e) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        isDragging = true;
        let newX = e.clientX - dragStartX;
        let newY = e.clientY - dragStartY;
        button.style.left = newX + "px";
        button.style.top = newY + "px";
      }
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  button.addEventListener("click", function () {
    if (!isDragging) {
      this.style.transform = "none";
      void this.offsetWidth;
      this.style.transform = "rotate(360deg)";

      this.addEventListener("transitionend", resetTransform);
      extractTapInfo();
    }
  });
}

function resetTransform() {
  // transform 스타일을 초기화합니다.
  this.style.transform = "none";
  // 이 이벤트 리스너를 제거합니다.
  this.removeEventListener("transitionend", resetTransform);
}

function extractTapInfo() {
  chrome.runtime.sendMessage(
    { action: "extractTapInfo" },
    function (response_data) {
      response_data["tag"] = htag_select();
      sendRequestToBackend(response_data)
    }
  );
}

function htag_select() {
  // h2, h3, h4 태그를 선택합니다.
  const htags = window.document.querySelectorAll("h2, h3");

  let combinedText = [];
  for (let htag of htags) {
    // 현재까지의 텍스트 길이와 추가될 텍스트 길이를 합쳤을 때 300글자를 넘지 않는지 확인합니다.
    if (combinedText.join("").length + htag.innerText.length > 300) {
      break; // 300글자를 넘으면 반복문을 종료합니다.
    }
    combinedText.push(htag.innerText);
    // combinedText += htag.innerText + ' '; // 텍스트를 병합합니다.
  }

  console.log(combinedText); // 최종 텍스트를 콘솔에 출력합니다.
  return combinedText; // 최종 텍스트를 반환합니다.
}

async function sendRequestToBackend(data = {}) {
  chrome.storage.local.get(['utkCookie'], function(result) {
    console.log("HH1 :" , result)
    if (result.utkCookie) {
      console.log("HH2 :" , result.utkCookie)
      // 쿠키값을 사용하여 백엔드에 요청을 보냅니다
      const url = BACKEND_URL;
      const cookieValue = result.utkCookie.value;

      data['utk'] = cookieValue;
      
      fetch(url, {
        method: 'POST', // 또는 'POST', 'PUT' 등
        headers: {
          'Cookie': 'utk=' + cookieValue,
          "Content-Type": "application/json", 
        },
        body : JSON.stringify(data),
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    } else {
      // 쿠키값이 없는 경우의 처리
      console.log("No cookie found in local storage.");
    }
  });
}


async function postData(url = "", data = {}) {
  // 요청에 대한 옵션 설정
  const requestOptions = {
    method: "POST", // HTTP 메소드 지정
    headers: {
      "Content-Type": "application/json", // 콘텐츠 타입 지정
    },
    body: JSON.stringify(data), // 데이터를 JSON 문자열로 변환
  };

  // fetch 요청
  const response = await fetch(url, requestOptions);
  return response.json(); // 응답을 JSON으로 변환
}
