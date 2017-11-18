$(document).ready(function () {
    $("#addNewTask").click(function () {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, function (tabs) {
            chrome.tabs.executeScript(tabs[0].id, { file: 'js/newTask.js'});
        });
    });
    chrome.storage.local.get({"tasks": new Array()}, function(value){
        console.log(value.tasks);
    });
});