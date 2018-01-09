var dialogId = 0;
var oldTimer = null;
var fastTime = 600; //本地时间加快600ms
$(document).ready(function () {
    var standerTime = new Date().getTime();
    updateTime(standerTime+fastTime);
    $("#standTime").text(formatDateTime(standerTime));
    //标题长度限制
    var titleLength = 17;

    //url长度
    var urlLength = 25;

    //任务列表
    var tasks = new Array();

    //新建任务
    $("#addNewTask").click(function () {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, function (tabs) {
            chrome.tabs.executeScript(tabs[0].id, { file: 'js/newTask.js'});
        });
    });

    //关闭窗口
    $("#close").click(function () {
        window.close();
    });

    //切换本地时间和服务器世家你
    $("input:radio[name='useLocalTime']").change(function (){
        if($(this).val() == 0) {   //北京时间
            getServerTimeAndUpdate();
            $("#calibration").show();
        } else {    //本机时间
            $("#calibration").hide();
            updateTime(new Date().getTime()+fastTime);
        }
    });

    //北京标准时间校对
    $("#calibration").click(function () {
        getServerTimeAndUpdate();
    });

    //加载任务列表数据
    chrome.storage.local.get({"tasks": new Array()}, function(value){
        tasks = value.tasks;
        console.log(tasks);
        if(tasks.length > 0) {
            for(var i=0; i<tasks.length; i++) {
                var card = $("#templateCard").clone();
                $(card).find(".taskContainer").removeAttr("id");
                $(card).find(".taskContainer").css("display","block");
                //重置标题
                $(card).find("span[datafld='name']").text(tasks[i].name.length > titleLength? tasks[i].name.substr(0, titleLength)+"..." : tasks[i].name);
                $(card).find("span[datafld='name']").attr("taskId", tasks[i].id);
                $(card).find("span[datafld='name']").attr("title", tasks[i].name);
                $(card).find("span[datafld='url']").text(tasks[i].url.length > urlLength? tasks[i].url.substr(0, urlLength)+"..." : tasks[i].url);
                $(card).find("span[datafld='url']").attr("title", tasks[i].url);
                $(card).find("span[datafld='selector']").text(tasks[i].selector);
                $(card).find("span[datafld='location']").text(tasks[i].location.length > urlLength? tasks[i].location.substr(0, urlLength)+"..." : tasks[i].location);
                $(card).find("span[datafld='location']").attr("title", tasks[i].location);
                $(card).find("span[datafld='killTime']").text(tasks[i].killTime.replace("T", " "));
                $(card).find("span[datafld='leftTime']").text(getLeftTime(new Date(tasks[i].killTime).getTime() - standerTime));
                $(card).find("span[datafld='leftTime']").attr("killTime", new Date(tasks[i].killTime).getTime());
                $(card).find("span[datafld='frequency']").text(tasks[i].frequency+"ms/次");
                $(card).find("span[datafld='count']").text(tasks[i].count+"次");
                $(card).find(".footer ul").attr("id", tasks[i].id);
                if(new Date(tasks[i].killTime).getTime() - standerTime <= 0) {
                    tasks[i].status  = 2; //已过期
                }
                var statusText = "运行中";
                switch (tasks[i].status) {
                    case 0:
                        statusText = "运行中";
                        $(card).find("li[datatype='status']").css("color","green");
                        break;
                    case 1:
                        statusText = "已暂停";
                        $(card).find("li[datatype='status']").css("color","yellow");
                        break;
                    case 2:
                        statusText = "已过期";
                        $(card).find("li[datatype='status']").css("color","red");
                        break;
                }
                $(card).find("li[datatype='status']").text(statusText);
                $("#message").after($(card).html());
            }
        } else {
            $("#message").text("暂无秒杀任务，快去新增吧！");
        }
    });

    //任务列表数据操作
    $(document).delegate(".footer ul li", "click", function(){
        var currentTask = null;
        for(var i=0; i<tasks.length; i++) {
            if(tasks[i].id == $(this).parent().attr("id")) {
                currentTask = tasks[i];
                break;
            }
        }
        //启动
        if($(this).index() == 1 && currentTask.status == 1) {
            currentTask.status = 0;
            $(this).siblings(":first").text("运行中");
            $(this).siblings(":first").css("color","green");
            var opt = { type: "basic", title: "秒杀助手提醒", message: currentTask.name + "\n秒杀任务已启动！", iconUrl: "image/runing.png"};
            chrome.notifications.create(dialogId+++"", opt);
        }

        //挂起
        if($(this).index() == 2 && currentTask.status == 0) {
            currentTask.status = 1;
            $(this).siblings(":first").text("已暂停");
            $(this).siblings(":first").css("color","yellow");
            var opt = { type: "basic", title: "秒杀助手提醒", message:  currentTask.name + "\n秒杀任务已暂停！", iconUrl: "image/pause.png" };
            chrome.notifications.create(dialogId+++"", opt);
        }

        //删除
        if($(this).index() == 3) {
            tasks.splice($.inArray(currentTask, tasks), 1);
            $(this).parent().parent().parent().remove();
            var opt = { type: "basic", title: "秒杀助手提醒", message:  currentTask.name + "\n秒杀任务删除成功！", iconUrl: "image/delete.png" };
            chrome.notifications.create(dialogId+++"", opt);
        }
        //更新任务列表
        chrome.storage.local.set({"tasks": tasks});
    });

    //点击任务名称,打开地址
    $(document).delegate(".header span", "click", function(){
        var currentTask = null;
        for(var i=0; i<tasks.length; i++) {
            if(tasks[i].id == $(this).attr("taskId")) {
                currentTask = tasks[i];
                chrome.tabs.query({url: tasks[i].url}, function(results) {
                    if(results != null && results.length > 0) {
                        chrome.tabs.update(results[0].id, {"active":true}, function(){
                            console.log("抢购页面被激活！");
                        });
                    } else {
                        chrome.tabs.create({url: currentTask.url});
                    }
                });
            }
        }
    });

});

/**
 * 获取北京时间
 */
function getServerTimeAndUpdate() {
    //北京时间接口路径
    var apiUrl = "https://sapi.k780.com/?app=life.time&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json&jsoncallback=data";

    //调用接口获取北京时间
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
                console.error("调用接口获取北京时间失败！使用本机时间");
                updateTime(new Date().getTime()+fastTime);
            }
            for(var i in data.result){
                var property=data.result[i];
                if(i == "timestamp") {
                    standerTime = parseInt(property+"000");
                    var diff = (new Date().getTime() - startTime)/2;
                    standerTime += (diff + 500);
                    updateTime(standerTime);
                }
            }
        },
        error:function(){
            console.error("调用接口获取北京时间失败！使用本机时间");
            updateTime(new Date().getTime()+fastTime);
        }
    });
}

/**
 * 更新popup page的北京时间，剩余时间和设定后台的时间
 */
function updateTime(standerTime) {
    var timer = setInterval(function () {
        standerTime += 1000;
        $("#standTime").text(formatDateTime(standerTime));
        $("span[datafld='leftTime']").each(function () {
            $(this).text(getLeftTime(parseInt($(this).attr("killTime"))-standerTime+1000));
        });
    }, 1000);
    if(oldTimer != null) {
        clearInterval(oldTimer);
    }

    //更新Background的时间 开始
    var port = chrome.extension.connect({
        name: "update standerTime"
    });
    port.postMessage(standerTime);
    port.onMessage.addListener(function(msg) {
        console.log("后台反馈：" + msg);
    });
    //更新Background的时间 结束
    oldTimer = timer;
}


function getLeftTime(leftTime) {
    if(!isNaN(leftTime)) {
        if(leftTime <= 0) {
            return "00:00:00";
        } else {
            var date = new Date(null);
            date.setMilliseconds(leftTime)
            var result = date.toISOString().substr(11, 8);
            return result;
        }
    }
}

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