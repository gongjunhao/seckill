var standerTime = new Date().getTime();
$("#standTime").text(formatDateTime(standerTime));
$(document).ready(function () {

    //标题长度限制
    var titleLength = 17;

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
                console.error("调用接口获取北京时间失败！");
                updateTime();
                exit;
            }
            for(var i in data.result){
                var property=data.result[i];
                if(i == "timestamp") {
                    standerTime = parseInt(property+"000");
                    var diff = (new Date().getTime() - startTime)/2;
                    standerTime += (diff + 500);
                    updateTime();
                }
            }
        },
        error:function(){
            console.error("调用接口获取北京时间失败！");
            updateTime();
        }
    });

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

    //加载任务列表数据
    chrome.storage.local.get({"tasks": new Array()}, function(value){
        var tasks = value.tasks;
        console.log(tasks);
        if(tasks.length > 0) {
            for(var i=0; i<tasks.length; i++) {
                var card = $("#templateCard").clone();
                $(card).find(".taskContainer").removeAttr("id");
                $(card).find(".taskContainer").css("display","block");
                //重置标题
                $(card).find("#title").text(tasks[i].name.length > titleLength? tasks[i].name.substr(0, titleLength)+"..." : tasks[i].name);
                $("#message").after($(card).html());
            }
        } else {
            $("#message").text("暂无秒杀任务，快去新增吧！");
        }
    });

    //任务列表数据操作
    //启动
    //挂起
    //删除
    //更新状态



});

/**
 * 更新popup page的北京时间
 */
function updateTime() {
    setInterval(function () {
        standerTime += 1000;
        $("#standTime").text(formatDateTime(standerTime));
    }, 1000);
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