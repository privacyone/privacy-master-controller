let ublock_blocked_count;
let ublock_allowed_count;
let badger_blocked_count;
let badger_allowed_count;
let url_blocked_count;
let old_url_blocked_count;
let blocked;
let old_blocked;
let allowed;
let old_allowed;
let refreshing;
let refreshTimerID;
let should_refresh;

window.onload = init;
window.onbeforeunload = reportMetricsBeforeClose;

function init(){
    init_vars();
    popupSync();
    init_listeners();
    init_intervals();
}

function init_vars(){
    ublock_blocked_count = 0;
    ublock_allowed_count = 0;
    badger_blocked_count = 0;
    badger_allowed_count = 0;
    url_blocked_count = 0;
    old_url_blocked_count = 0;
    blocked = 0;
    old_blocked = 0;
    allowed = 0;
    old_allowed = 0;
    refreshing = false;
    should_refresh = false;
}

function init_listeners(){
    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        if(request.what=="ublock_blocked_count"){
            ublock_blocked_count = request.blockCount;
            ublock_allowed_count = request.allowedCount;
            aggregateCounts();
            //logger();
        }
    });

    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        if(request.what=="badger_blocked_count"){
            badger_blocked_count = request.blockCount;
            badger_allowed_count = request.allowedCount;
            aggregateCounts();
            //logger();
        }
    });

    chrome.runtime.onMessage.addListener(function(r, s, sR){
        if(r.what == "url_count"){
            if((r.info.lastURL) && (window.location.href != r.info.lastURL)) return;
            url_blocked_count = r.info.counter;
            aggregateCounts();
        }
    })

    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        if(request.what=="get_metrics" && !refreshing){
            sendResponse(
            {
                blocked_count: blocked, 
                old_blocked_count: old_blocked,
                should_refresh
            });
        }
    });

    chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
        if(request.what=="refresh_signal"){
            refreshing = true;
            let time = request.time;
            let id = request.id;
            let host = request.tabHost;
            startRefreshTimer(time, id, host);
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
        if(request.what == "should_refresh"){
            should_refresh = true;
        }
    });
}

function popupSync(){
    chrome.runtime.sendMessage({what : "restart_counting"});
    chrome.runtime.sendMessage({what : "remove_refresh_reminder"});
}

function init_intervals(){
    setInterval(function(){
        metricsReport();
    },3000);
}

///HELPER FUNCTIONS///

function reportMetricsBeforeClose(){
   metricsReport();
   return null;
}

function aggregateCounts(){
    blocked = ublock_blocked_count+badger_blocked_count+url_blocked_count;
    allowed = ublock_allowed_count + badger_allowed_count;
}

function metricsReport(){
    let blockDiff = blocked - old_blocked;
    let allowedDiff = allowed - old_allowed;
    let urlDiff = url_blocked_count - old_url_blocked_count;
    if(blockDiff || allowedDiff){
        chrome.runtime.sendMessage("eabnfhopkgkfldmbhljheahllnecbbij", {what:"total_counts_from_master", blockCount : blockDiff, allowedCount : allowedDiff, urlCount : urlDiff});
    }
    old_blocked = blocked;
    old_allowed = allowed;
    old_url_blocked_count = url_blocked_count;
}

function returnTotalBlockedCount(){
    return ublock_blocked_count+badger_blocked_count;
}

function logger(){
    console.log("ublock count : " +ublock_blocked_count)
    console.log("badger count : " +badger_blocked_count)
    console.log("url count : " +url_blocked_count)
}

function refreshCurrentTab(id, host) {
    chrome.runtime.sendMessage({"what":"refresh","id":id,"host":host})
}

function startRefreshTimer(time, id, host){
    clearInterval(refreshTimerID);
    refreshTimerID = setTimeout(function(){
        refreshCurrentTab(id, host);
    }, time);
}