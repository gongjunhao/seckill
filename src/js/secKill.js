/**
 * 根据任务ID获取任务，执行点击
 * @param taskId
 */
function secKill(taskId) {
    console.log("开始秒杀！");
    console.log(taskId);
    chrome.storage.local.get({"tasks": new Array()}, function(value) {
        tasks = value.tasks;
        if(tasks != undefined && tasks != null && tasks.length > 0) {
            for(var i=0; i<tasks.length; i++) {
                if(taskId == tasks[i].id) {
                    dealTask(tasks[i]);
                }
            }
        }
    });
}

/**
 * 根据xPath查询节点
 * @param STR_XPATH
 * @returns {Array}
 */
function getElementsByXPath(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }
    return xnodes;
}

/**
 * 处理任务
 * @param task
 */
function dealTask(task) {
    var count = 1;
    var timer = setInterval(function () {
        if(task.selector == "jQuery") {
            $(task.location).each(function(){
                this.click();
            });
        } else {
            $(getElementsByXPath(task.location)).each(function(){
                this.click();
            });
        }
        count++;
        if(count>task.count) {
            clearInterval(timer);
        }
    }, task.frequency);

}