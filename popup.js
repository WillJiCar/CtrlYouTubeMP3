
 //Get Link

  let sendLink = document.getElementById('sendYouTubeLink');

  sendLink.onclick = function(element) {
    chrome.runtime.sendMessage({message: "DOWNLOAD"});
  };


