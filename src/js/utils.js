$(document).ready(function () {

    var titleLength = 20;

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
        if(tasks.length >0) {
            for(var i=0; i<tasks.length; i++) {
                var card = $("#templateCard").clone();
                $(card).find(".taskContainer").removeAttr("id");
                $(card).find(".taskContainer").css("display","block");
                //重置标题
                $(card).find("#title").text(tasks[i].name.length > titleLength? tasks[i].name.substr(0, titleLength)+"..." : tasks[i].name);
                $("#message").after($(card).html());
            }
        } else {
            $("message").text("暂无秒杀任务，快去添加吧！");
        }
    });

    //任务列表数据操作
    //启动
    //挂起
    //删除
    //更新状态



});