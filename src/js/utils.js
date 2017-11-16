$(document).ready(function () {
    $("#addNewTask").click(function () {
        $.get(chrome.extension.getURL('page/newTask.html'), function(data) {
            var code = "var newElement = document.createElement('div'); newElement.innerHTML = \""+data.split("\"").join("\\\"").replace(/(?:\\[rn]|[\r\n]+)+/g, "")+"\";document.getElementsByTagName(\"body\")[0].appendChild(newElement);";
            var query = { active: true, currentWindow: true };
            chrome.tabs.query(query, function (tabs) {
                chrome.tabs.executeScript(tabs[0].id, { code: code });
                chrome.tabs.executeScript(tabs[0].id, { file: 'js/newTask.js'});
            });
        });
        //window.close();
    });
});