const uBlockID = "fgofngljcefhkomnjmgicgnlfkpnihkd";
const privacyBadgerID = "dimclakablppepgmfneppnpmnnkgijad";
const clearurlsID = "dkfgkjfhlmhiajhifjcngkaflbfbndmo";
const cookieID = "bilnggnhajjcfjieeghjkngldbpaekkl";
const httpsID = "mnkgnmablainbpiihkhnpjlihpoajfoa";
const dashboardID = "eabnfhopkgkfldmbhljheahllnecbbij";

let unifiedBlockCount;
let togglePrivacy;
let toggleSecurity;
let toggleCosmetic;
let viewDashboard;
let toggleMaster;
let previous_block_count;
let current_block_count;
let masterToggleStatus;
let maserToggleClass;
let updateCountTimer;
let virginity;
let counting;
let sections;
let popup_tab;

window.onload = init;

async function init(){
    await getElements();
    setElementProperties();
    shouldRun();
    startListeners();
}

async function getElements(){
    unifiedBlockCount = document.getElementById("unified");
    togglePrivacy = document.querySelector("#privacy-toggle input");
    toggleSecurity = document.querySelector("#security-toggle input");
    toggleCosmetic = document.querySelector("#cosmetic-toggle input");
    viewDashboard = document.getElementById("view-dashboard");
    toggleMaster = document.getElementById("master-toggle");
    previous_block_count = 0;
    current_block_count = 0;
    masterToggleStatus = 0;
    maserToggleClass = 0;
    virginity = true;
    counting = false;
    popup_tab = await getCurrentTab();
}

function setElementProperties(){
    cSetToggleValues();

    sections = document.querySelectorAll(".slider");
    let n = sections.length;
    for(let i = 0; i < n; i++){
        sections[i].classList.add("smooth");
    }

    ///START OF MASTER TOGGLE FUNCTIONS///
    toggleMaster.addEventListener("click", masterToggle);
    toggleMaster.addEventListener("click", function(){sendResetSignal(1000); sendRefreshPagesSignal();});
    ///END OF MASTER TOGGLE FUNCTIONS///

    ///START OF PRIVACY FUNCTIONS///
    togglePrivacy.addEventListener("click", privacyChange);
    togglePrivacy.addEventListener("click", function(){sendResetSignal(3000); sendRefreshPagesSignal();});
    ///END OF PRIVACY FUNCTIONS///

    ///START OF SECURITY FUNCTIONS///
    toggleSecurity.addEventListener("click", securityChange);
    toggleSecurity.addEventListener("click", function(){sendResetSignal(3000); sendRefreshPagesSignal();});
    ///END OF SECURITY FUNCTIONS///

    ///START OF COSMETIC FUNCTIONS///
    toggleCosmetic.addEventListener("click", cosmeticChange);
    toggleCosmetic.addEventListener("click", function(){sendResetSignal(3000); sendRefreshPagesSignal();});
    ///END OF COSMETIC FUNCTIONS///

    ///START OF DASHBOARD FUNCTIONS///
    viewDashboard.onclick = function(){
        chrome.tabs.create({url: 'breeze://dashboard'});
    }
    ///END OF DASHBOARD FUNCTIONS///
}

function masterToggle(){
    masterToggleStatus = !(togglePrivacy.checked || toggleCosmetic.checked || toggleSecurity.checked);
    togglePrivacy.checked = masterToggleStatus;
    toggleCosmetic.checked =  masterToggleStatus;
    toggleSecurity.checked = masterToggleStatus;

    virginity = false;

    setMasterToggleClass();

    stopCountingOnUpcommingRefresh()

    privacyChange(null, true);
    cosmeticChange(null, true);
    securityChange(null, true);
}

function privacyChange(e, by_master = false) {
    cstoreValue("privacy_toggle", togglePrivacy.checked);

    if(!by_master){
        stopCountingOnUpcommingRefresh();
        setMasterToggleClass();
        virginity = false;
    }
    

    chrome.runtime.sendMessage(uBlockID, {   
        what : "toggle",
        type : "privacy",
        toggle_value : togglePrivacy.checked
    });
    chrome.runtime.sendMessage(dashboardID, {
        what : "privacy_status",
        status : togglePrivacy.checked
    });
    chrome.management.get(clearurlsID, function(extension) {
        let enabled = togglePrivacy.checked;
        let id = extension.id;
        chrome.management.setEnabled(id, enabled);
    });
    chrome.management.get(privacyBadgerID, function(extension) {
        let enabled = togglePrivacy.checked;
        let id = extension.id;
        chrome.management.setEnabled(id, enabled);
    });
}

function securityChange(e, by_master = false) {
    cstoreValue("security_toggle", toggleSecurity.checked);

    if(!by_master){
        stopCountingOnUpcommingRefresh();
        setMasterToggleClass();
        virginity = false;
    }


    chrome.management.get(httpsID, function(extension) {
        let enabled = toggleSecurity.checked;
        let id = extension.id;
        chrome.management.setEnabled(id, enabled);
    });
    chrome.runtime.sendMessage(uBlockID,
    {   
        what : "toggle",
        type : "security",
        toggle_value : toggleSecurity.checked
    });
}

function cosmeticChange(e, by_master = false) {
    cstoreValue("cosmetic_toggle", toggleCosmetic.checked);

    if(!by_master){
        stopCountingOnUpcommingRefresh();
        setMasterToggleClass();
        virginity = false;
    }
    
    chrome.runtime.sendMessage(uBlockID,
    {   
        what : "toggle",
        type : "cosmetic",
        toggle_value : toggleCosmetic.checked
    });
}

function setMasterToggleClass() {
    let status = togglePrivacy.checked || toggleCosmetic.checked || toggleSecurity.checked;

    cstoreValue("master_toggle", status);

    if (status) {
        toggleMaster.className ="on";
    }
    else {
        toggleMaster.className = "off";
    }
}

function cSetToggleValues(){
    chrome.storage.local.get("privacy_toggle", res => {
        if(res["privacy_toggle"]!=undefined){
            togglePrivacy.checked = res["privacy_toggle"];
        }
        else{
            togglePrivacy.checked = true;
        }
        chrome.storage.local.get("security_toggle", res => {
            if(res["security_toggle"]!=undefined){
                toggleSecurity.checked = res["security_toggle"];
            }
            else{
                toggleSecurity.checked = true;
            }
            chrome.storage.local.get("cosmetic_toggle",res => {
                if(res["cosmetic_toggle"]!=undefined){
                    toggleCosmetic.checked = res["cosmetic_toggle"];
                }
                else{
                    toggleCosmetic.checked = true;
                }
                chrome.storage.local.get("master_toggle", res => {
                    if(res["master_toggle"]!=undefined){
                        toggleMaster.className = res["master_toggle"] ? "on" : "off";
                    }
                    else{
                        toggleMaster.className = "on";
                    }
                })
            })
        })
    })
}

async function shouldRun() {
    if(popup_tab.url[0] == "h") {
        ///START OF METRICS FUNCTIONS///
        initMetricsWrapper();
        ///END OF METRICS FUNCTIONS///
        clearInterval(updateCountTimer);
        updateCountTimer = setInterval(function(){
            updateCountVisual();
        },1000);
    }
}
        
async function initMetricsWrapper(){
    await initMetrics();
}

function initMetrics(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                what: "get_metrics"
            },
            function(response){
                if(chrome.runtime.lastError) { console.log(chrome.runtime.lastError); return; }
                if(response){
                    unifiedBlockCount.innerText = response.blocked_count.toLocaleString('en', {useGrouping:true});
                    current_block_count = response.blocked_count;
                    previous_block_count = response.blocked_count;
                    if(response.should_refresh){
                        //show refresh page info text
                    }
                    resolve();
                }
            })
        });
    });
}

async function updateCountVisual(){
    await checkMetrics();
    if (current_block_count <= previous_block_count) return;
    let tmp = current_block_count;
    function count(i) {
        setTimeout(function() { 
            unifiedBlockCount.innerHTML = i.toLocaleString('en', {useGrouping:true});
            if (i == tmp) counting = false;
            }, 800*(Math.log1p(tmp-previous_block_count)-Math.log1p(tmp-i)));
    }
    if (counting) return;
    counting = true;
    for (let i = previous_block_count; i <= tmp; i++) {
        count(i);
    }
    previous_block_count = tmp;
}

function startListeners(){
    //visualChangeListener();
    toggleSyncListener();
    restartCountingListener();
    refreshPageListener();
    removeRefreshReminderListener();
}

function stopCountingOnUpcommingRefresh(){
    previous_block_count = 0;
    current_block_count = 0;
    counting = false;
    clearInterval(updateCountTimer);
}

function restartCountingListener(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "restart_counting" && sender.tab.id == popup_tab.id && !virginity){
            unifiedBlockCount.innerHTML = 0;
            virginity = true;
            updateCountTimer = setInterval(function(){
                updateCountVisual();
            },1000);
        }
    })
}

function removeRefreshReminderListener(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "remove_refresh_reminder"){
            //remove refresh page info text
        }
    });
}

//refresh page listener for already open popup instances
function refreshPageListener(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "refresh_page" && popup_tab.id != request.excluded_tab_id && popup_tab.url[0] == "h"){
            //show refresh page info text
        }
    })
}

function toggleSyncListener(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        if(request.what == "sync_toggles"){
            let toggle_value = request.toggle_value;
            switch(request.toggle_name){
                case("master_toggle"):{
                    toggleMaster.className = toggle_value ? "on" : "off";
                    break;
                }
                case("privacy_toggle"):{
                    togglePrivacy.checked = toggle_value;
                    break;
                }
                case("security_toggle"):{
                    toggleSecurity.checked = toggle_value;
                    break;
                }  
                case("cosmetic_toggle"):{
                    toggleCosmetic.checked = toggle_value;
                    break;
                }    
            }
        }
    })
}

////////////////////

function cstoreValue(key, value){
    chrome.storage.local.set({ [key] : value});
}

function checkMetrics(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                what: "get_metrics"
            },
            function(response){
                if(chrome.runtime.lastError) { return; }
                if(response){
                    current_block_count = response.blocked_count;
                    resolve();
                }
            })
        });
    });
}

function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

function requestShieldColorChange(color){
    chrome.runtime.sendMessage({what : "change_shield", color : color})
}

function sendResetSignal(time){
    let tabId = popup_tab.id;
    let tabHost = (new URL(popup_tab.url)).origin;
    if(tabHost[0] == "h"){
        clearInterval(updateCountTimer);
        chrome.tabs.sendMessage(tabId, {"what":"refresh_signal","time":time,"id":tabId,"tabHost":tabHost});
    }
}

function sendRefreshPagesSignal(){
    chrome.runtime.sendMessage({what : "refresh_pages_signal", tab_id : popup_tab.id});
}