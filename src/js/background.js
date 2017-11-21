//调用接口获取北京时间
var standerTime = new Date().getTime();

var dialogId = 0;

//需要打开激活的url
var tasks = null;

//检查准备工作URL自动打开（账号登录 商品规格选择 手工）
var tickTime = 30000;   //120000

//北京时间接口路径
var apiUrl = "https://sapi.k780.com/?app=life.time&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json&jsoncallback=data";
var startTime = new Date().getTime();
$.ajax({
    type          : 'get',
    async         : false,
    url           : apiUrl,
    dataType      : 'jsonp',
    jsonp         : 'callback',
    jsonpCallback : 'data',
    success       : function(data){
        if(data.success!='1'){
            console.error(data.msgid+' '+data.msg);
            console.error("调用接口获取北京时间失败！");
            processTask(false);
            exit;
        }
        for(var i in data.result){
            var property=data.result[i];
            if(i == "timestamp") {
                standerTime = parseInt(property+"000");
                var diff = (new Date().getTime() - startTime)/2;
                standerTime += (diff + 500);
                processTask(true);
            }
        }
    },
    error:function(){
        console.error("调用接口获取北京时间失败！");
        processTask(false);
    }
});

/**
 * 每隔500ms去检查任务,异步处理任务
 */
function processTask(isServerTime) {
    if(isServerTime) {
        console.log("use beijing stander timer");
    } else {
        console.warn("use the local timer");
    }
    setInterval(function () {
        standerTime += 500;
        console.log(formatDateTime(standerTime) + "===========" +formatDateTime(new Date().getTime()));
        chrome.storage.local.get({"tasks": new Array()}, function(value) {
            tasks = value.tasks;
            if(tasks != undefined && tasks.length > 0) {
                for(var i=0; i<tasks.length; i++) {
                    if(tasks[i].status == 0) {
                        if((new Date(tasks[i].killTime) - standerTime) > tickTime && (new Date(tasks[i].killTime) - standerTime) < (tickTime+600)){
                            //秒杀开始提醒（检查是否打开相关标签页）没有提示打开
                            var opt = null;
                            chrome.tabs.query({url: tasks[i].url}, function(results) {
                                if (results.length == 0) {
                                    chrome.notifications.create("openLinkNotify-"+tasks[i].id, {
                                        type:    "basic",
                                        iconUrl: "image/link.png",
                                        title:   "秒杀助手提醒",
                                        message: tasks[i].name + "\n任务将在2分钟后开始，抢购页面尚未打开，是否前往相关页面！",
                                        buttons: [{ title: "打开抢购页面" }, { title: "忽略" }]
                                    });
                                } else {
                                    chrome.notifications.create("activeTabNotify-"+tasks[i].id, {
                                        type:    "basic",
                                        iconUrl: "image/bell.png",
                                        title:   "秒杀助手提醒",
                                        message: tasks[i].name + "\n秒杀任务2分钟后开始，请手动检查登录及商品规格选择验证码等！",
                                        buttons: [{ title: "切换Tab抢购页面" }, { title: "忽略" }]
                                    });
                                }
                            });
                        }
                        if((new Date(tasks[i].killTime) - standerTime) >0 && (new Date(tasks[i].killTime) - standerTime) < 600){
                            //异步执行点击事件
                            var opt = { type: "basic", title: "秒杀助手提醒", message: tasks[i].name + "\n秒杀任务完成！", iconUrl: "image/bell.png"};
                            chrome.notifications.create(dialogId+++"", opt);
                        }
                    }
                }
            }
        });
    }, 500);
}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId.startsWith("openLinkNotify-")) {
        if (btnIdx === 0) {
            var taskId = notifId.split("-")[1];
            for(var i=0; i<tasks.length; i++) {
                if(taskId == tasks[i].id) {
                    chrome.tabs.create({url: tasks[i].url});
                }
            }
        } else if (btnIdx === 1) {
            chrome.notifications.clear("openLinkNotify", function(){
                console.log("忽略本次秒杀！");
            })
        }
    }
    if (notifId.startsWith("activeTabNotify-")) {
        if (btnIdx === 0) {
            var taskId = notifId.split("-")[1];
            for(var i=0; i<tasks.length; i++) {
                if(taskId == tasks[i].id) {
                    chrome.tabs.query({url: tasks[i].url}, function(results) {
                        chrome.tabs.update(results.id, {"active":true}, function(){
                            console.log("抢购页面被激活！");
                        });
                    });
                }
            }
        } else if (btnIdx === 1) {
            chrome.notifications.clear("openLinkNotify", function(){
                console.log("抢购页面未被激活！");
            })
        }
    }
});

/**
 * 日期格式化
 * @param inputTime
 * @returns {string}
 */
function formatDateTime(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
}