//FLAGS
var DOWNLOADING = false; 

//ICON PATHS
var availablePathMain = "/icons/MAIN_AVAILABLE_32.png";
var unavailablePathMain = "/icons/MAIN_UNAVAILABLE_32.png"; 
var downloading1PathMain = "/icons/MAIN_DOWNLOADING_32.png";
var downloading2PathMain = "/icons/MAIN_DOWNLOADING_ALT_32.png";


//MESSAGE RECIEVER
chrome.runtime.onMessage.addListener(function(request, sender) {
    if(request.message === "DOWNLOAD"){
        GetYoutubeID();
    }
    if(request.message === "ONUPDATED"){
        setMainIcon(request.url);
    }
});

//COMMANDS
chrome.commands.onCommand.addListener(function(command){
    if(command === "download-mp3"){
        GetYoutubeID();
    }
});

//TAB IS LOADED
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
        setMainIcon(tab.url);
    }
});

//TAB IS CHANGED
chrome.tabs.onHighlighted.addListener(function(highlightInfo){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        setMainIcon(tabs[0].url);
    });
});

function GetYoutubeID(){
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let url = tabs[0].url;
        // use `url` here inside the callback because it's asynchronous!
        if(url.length == 0){
            url = tabs[0].pendingUrl;
        }
        if(url.includes("www.youtube.com")){
            //https://www.youtube.com/watch?v=2ap2_erSXBQ&list=LL87ysCrXGPUsuyyKc04gFdQ&index=35&t=16s == URL
            //Between "v=" and "&"
            if(url.includes("&")){
                var ID = url.substring(
                    url.indexOf("=") + 1,
                    url.indexOf("&")
                );
            } else{
                var ID = url.substring(
                    url.indexOf("=") + 1
                );
            }
            
            console.log("Sending: " + ID);
            //chrome.storage.local.set({'id': ID});
            //Call AjaxYouTubeID(ID) from background.js;
            AjaxYouTubeID(ID);
        }
    });
}

var dObject;
function AjaxYouTubeID(id){
    var dataValue = { "ID": id };
    console.log("Requesting: " + id);
    DOWNLOADING = true;
    var d = setInterval(setDownloadingIcon, 1000);
    dObject = d;
    $.ajax({
        type: "GET",
        url: "https://vibeattack.com/youtube",
        data: dataValue,
        contentType: 'application/json',
        dataType:'json',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("Request: " + XMLHttpRequest.toString() + "\n\nStatus: " + textStatus + "\n\nError: " + errorThrown);
            DOWNLOADING = false;
        },
        success: function (result) {
            console.log("Downloading :" + JSON.stringify(result));
            DOWNLOADING = false;
            chrome.downloads.download({
                url: result.downloadURLMP3,
                filename: result.fileName
            });
        }
    });
}

var toggle = true;
function setDownloadingIcon(){
    if(DOWNLOADING){
        if(toggle){
            chrome.browserAction.setIcon({path: downloading1PathMain});
        }else{
            chrome.browserAction.setIcon({path: downloading2PathMain});
        }
        toggle = !toggle;
    }
    else{
        chrome.browserAction.setIcon({path: availablePathMain});
        clearInterval(dObject);
    }
}

function setMainIcon(url){
    console.log("CHECKING URL...");
    if(url.includes("youtube.com/watch?v=") && !DOWNLOADING)
    {
        chrome.browserAction.setIcon({path: availablePathMain});
    }
    else {
        chrome.browserAction.setIcon({path: unavailablePathMain});
    }
}