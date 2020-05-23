chrome.runtime.onMessage.addListener(function(request, sender) {
    if(request.message === "DOWNLOAD"){
        GetYoutubeID();
    }
});

chrome.commands.onCommand.addListener(function(command){
    if(command === "download-mp3"){
        GetYoutubeID();
    }
});

//Change icon when downloading and change back when done

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

function AjaxYouTubeID(id){
    var dataValue = { "ID": id };
    console.log("Requesting: " + id);
    $.ajax({
        type: "GET",
        url: "https://vibeattack.com/youtube",
        data: dataValue,
        contentType: 'application/json',
        dataType:'json',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("Request: " + XMLHttpRequest.toString() + "\n\nStatus: " + textStatus + "\n\nError: " + errorThrown);
        },
        success: function (result) {
            console.log("Downloading :" + JSON.stringify(result));
            chrome.downloads.download({
                url: result.downloadURLMP3,
                filename: result.fileName
            });
        }
    });
}