$(document).ready(function () {
    $("#addNewTask").click(function () {
        $.get(chrome.extension.getURL('page/newTask.html'), function(data) {
            var code = "$($.parseHTML("+data+")).appendTo('body')";
            chrome.tabs.getCurrent(function (tabId) {
                console.log(tabId);
                chrome.tabs.executeScript(tabId, { code: code });
            })
        });
        //window.close();
    });
});