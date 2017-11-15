$(document).ready(function () {
    $.get(chrome.extension.getURL('page/newTask.html'), function(data) {
        $($.parseHTML(data)).appendTo('body');
    });
    $("#secKillForm #close").on("click", function () {
        $("#secKillForm").remove();
    })
});