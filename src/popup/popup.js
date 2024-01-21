
// document.getElementById('sendData').addEventListener('click', function() {

//   chrome.history.search({text: '', maxResults: 10}, function(data) {
//       console.log(data);
//   });
// });

// document
//   .querySelector('#sendData')
//   .addEventListener('click', async () => { 
   
//     var startDate = new Date(2024, 0, 1); // 2023년 1월 1일
//     var endDate = new Date(2024, 0, 2); // 2023년 1월 2일

//     chrome.history.search({
//       'text': '', // 검색할 텍스트 쿼리, 빈 문자열은 모든 기록을 의미
//       'startTime': startDate.getTime(),
//       'endTime': endDate.getTime(),
//       'maxResults': 1000
//     }, function(historyItems) {
//       // historyItems 배열에서 방문 기록 데이터를 사용
//       var t_array = []
//       for (var i = 0; i < historyItems.length; ++i) {
//         var item = historyItems[i];

//         t_array.push(item['title'] )

//         //console.log(item['title']); // 기록된 URL
//         // 여기에서 추가 데이터 처리를 수행할 수 있습니다.
//       }

//       console.log(t_array.concat("\n"));
//     });
//   });


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
  });

  