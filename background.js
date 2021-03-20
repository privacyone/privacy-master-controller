const uBlockID = "fgofngljcefhkomnjmgicgnlfkpnihkd";
const privacyBadgerID = "dimclakablppepgmfneppnpmnnkgijad";
const clearurlsID = "dkfgkjfhlmhiajhifjcngkaflbfbndmo";
const cookieID = "bilnggnhajjcfjieeghjkngldbpaekkl";
const httpsID = "mnkgnmablainbpiihkhnpjlihpoajfoa";
const dashboardID = "eabnfhopkgkfldmbhljheahllnecbbij";

window.onload = init;

function init(){
    initShieldColor();
    initListeners();
    initIntervals();
}

function initListeners(){
   refreshListener();
   storageChangeListener();
   informTabsToRefreshListener()
   urlCountListener();
}

function initShieldColor(){
    chrome.storage.local.get("master_toggle", res => {
        let color;
        if(res["master_toggle"] != undefined){
            color = res["master_toggle"] ? "blue" : "red";
        }
        else{
            color = "blue";
        }
        setShieldColor(color);
    })
}

function storageChangeListener(){
    chrome.storage.onChanged.addListener(function(changes, area){
        if(area == "local"){
            let key = Object.keys(changes)[0];
            let  value = changes[key].newValue;

            if(key == "master_toggle"){
                let color = value ? "blue" : "red";
                setShieldColor(color);
            }

            chrome.runtime.sendMessage({
                what : "sync_toggles", 
                toggle_name : key,
                toggle_value : value
            });
        }
    })
}

function refreshListener(){
    ///REFRESH FUNCTIONS///
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "refresh"){
            let tabId = request.id;
            let host = request.host;
            chrome.browsingData.remove(
            {
                "origins":[host]            
            }, 
            {
                "cache": true,
                "cacheStorage": true,
            });
            chrome.tabs.reload(tabId, {"bypassCache":true});
        }
    })
    //////////////////////
}

function informTabsToRefreshListener(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "refresh_pages_signal"){
            let excluded_tab_id = request.tab_id;

            chrome.runtime.sendMessage({what : "refresh_page", excluded_tab_id});

            chrome.tabs.query({}, function(tabs){
                tabs.forEach(tab=>{
                    if(tab.id != excluded_tab_id && tab.url[0] == "h"){
                        chrome.tabs.sendMessage(tab.id, {what: "should_refresh"});
                    }
                })
            });
        }
    });
}

function urlCountListener(){
    chrome.runtime.onMessageExternal.addListener(function(r, s, sR){
        if(r.what == "badges"){
            for(let tabId in r.badges){
                let tab_id = parseInt(tabId)
                let info = r.badges[tabId];
                chrome.tabs.sendMessage(tab_id, {what : "url_count", info : info});
            }
        }
    })
}


function initIntervals(){
    ///UBLOCK FUNCTIONS///
    setInterval(function() {
            chrome.tabs.query({
            }, function(tabs) {
                let tabIds = [];
                tabs.forEach(tab => { if(tab.url[0] == "h") { tabIds.push(tab.id) } });
                chrome.runtime.sendMessage(uBlockID, {
                        what: "count",
                        tabIds: tabIds,
                    },
                    function(response) {
                        if(chrome.runtime.lastError) { return; }
                        (response.response).forEach(tab =>{
                            chrome.tabs.sendMessage(tab.tabId,{what:"ublock_blocked_count", blockCount: tab.blockCount, allowedCount: tab.allowedCount});
                        })
                    });
            });
    }, 1500);
    //////////////////////

    ///BADGER FUNCTIONS///
    setInterval(function(){
        chrome.runtime.sendMessage(privacyBadgerID,{
            what : "badger_blocked_count"
        },
        function(response){
            if(chrome.runtime.lastError) { return; }
            for(let key in response){
                let tabId = parseInt(key);
                let blockCount = 0;
                let originArray = Object.values(response[key].origins);
                if(originArray.length == 0) { continue; }
                let allowedCount = 0;
                originArray.forEach(origin =>{
                    if(origin == "block" || origin =="cookieblock"){
                        blockCount++;
                    }
                     if(origin == "allow"){
                        allowedCount++;
                    }
                })
                chrome.tabs.sendMessage(tabId, {what: "badger_blocked_count", blockCount, allowedCount});
            }
        })
    },1500);
    //////////////////////
}

/// HELPER FUNCTIONS ///

function setShieldColor(color){
    chrome.browserAction.setIcon({
        path : `/icons/${color}Shield16.png`
    });           
}

function makePrettyUrl(uglyUrl){
    let prettyUrl;
    if(uglyUrl.includes("https://")) {
        prettyUrl = uglyUrl.substr(8);
    }
    else {
        prettyUrl = uglyUrl.substr(7);
    }
    let pos = prettyUrl.indexOf("/");
    prettyUrl = prettyUrl.substr(0,pos);
    return prettyUrl;
}

function cstoreValue(key, value){
    chrome.storage.local.set({ [key] : value});
}