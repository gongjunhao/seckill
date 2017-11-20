//调用接口获取北京时间
var standerTime = new Date().getTime();

var dialogId = 0;

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
            processTask();
            exit;
        }
        for(var i in data.result){
            var property=data.result[i];
            if(i == "timestamp") {
                standerTime = parseInt(property+"000");
                var diff = (new Date().getTime() - startTime)/2;
                standerTime += (diff + 500);
                processTask();
            }
        }
    },
    error:function(){
        console.error("调用接口获取北京时间失败！");
        processTask();
    }
});

/**
 * 每隔500ms去检查任务,异步处理任务
 */
function processTask() {
    console.log("get time then start deal tasks");
    setInterval(function () {
        standerTime += 1000;
        chrome.storage.local.get({"tasks": new Array()}, function(value) {
            var tasks = value.tasks;
            if(tasks != undefined && tasks.length > 0) {
                for(var i=0; i<tasks.length; i++) {
                    if(tasks[i].status == 0) {
                        if((new Date(tasks[i].killTime) - standerTime) >120000 && (new Date(tasks[i].killTime) - standerTime) < 120600){
                            //秒杀开始提醒（检查是否打开相关标签页）没有提示打开
                            var opt = { type: "basic", title: "秒杀助手提醒", message: tasks[i].name + "\n秒杀任务2分钟后开始，请检查相关页面是否打开并已经登录！", iconUrl: "image/bell.png"};
                            chrome.notifications.create(dialogId+++"", opt);
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