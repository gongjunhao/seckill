$(document).ready(function () {
    $("#secKillForm #close").on("click", function () {
        $("#secKillForm").remove();
    });
    $("#killTime").click(function () {
        WdatePicker({el:this,dateFmt:'yyyy-MM-dd HH:mm:ss'});
    });
});
