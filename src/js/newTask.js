(function() {

    //页面注入任务表单
    var newElement = document.createElement('div');
    var html = "<div id=\"secKillForm\">\n" +
        "    <div class=\"secKill-logo\">\n" +
        "        新增秒杀\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">秒杀商品:</span><br/>\n" +
        "        <input type=\"text\" name=\"taskName\" class=\"secKill-input-text\" value=\"\" id=\"taskName\" placeholder=\"请输入商品名称\" />\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">选择器:</span><br/>\n" +
        "        <input type=\"radio\" name=\"selector\" id=\"rb1\" value=\"jQuery\" checked=\"checked\"/>\n" +
        "        <label for=\"rb1\">jQuery</label>\n" +
        "        <input type=\"radio\" name=\"selector\" id=\"rb2\" value=\"xPath\"/>\n" +
        "        <label for=\"rb2\">xPath</label>\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">选取结果:</span><br/>\n" +
        "        <input type=\"text\" name=\"location\" class=\"secKill-input-text\" id=\"location\" value=\"\" placeholder=\"#secKill-btn\"/>\n" +
        "    </div>\n" +
        "    <div class=\"secKill-button\" style=\"width: 50px;\" id=\"search\">\n" +
        "        定位(<span class=\"secKill-result\" id=\"result\">0</span>)\n" +
        "    </div>\n" +
        "    <div class=\"secKill-button\" id=\"reset\">\n" +
        "        重选\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">秒杀时间:</span><br/>\n" +
        "        <input type=\"datetime-local\"  class=\"secKill-input-text\" value=\""+formatDateTime(new Date().getTime())+"T12:00:00\" step=\"1\" id=\"killTime\" name=\"killTime\">\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">秒杀频率(ms):</span><br/>\n" +
        "        <input type=\"number\" name=\"frequency\"  class=\"secKill-input-number\"  id=\"frequency\"value=\"500\" min=\"100\" placeholder=\"单位：毫秒（ms）\"/>\n" +
        "    </div>\n" +
        "    <div class=\"secKill-filed\">\n" +
        "        <span class=\"secKill-name\">秒杀次数:</span><br/>\n" +
        "        <input type=\"number\" name=\"count\" class=\"secKill-input-number\" id=\"count\" value=\"10\" placeholder=\"尝试次数\"/>\n" +
        "    </div>\n" +
        "    <div class=\"secKill-button\" id=\"add\"> 新增 </div>\n" +
        "    <div class=\"secKill-button\" id=\"close\"> 关闭 </div>\n" +
        "</div>";
    newElement.innerHTML = html;
    if($("#secKillForm").length === 0) {
        document.getElementsByTagName("body")[0].appendChild(newElement);
    }

    //设置秒杀名称
    $("#taskName").val("秒杀"+document.title);

    //光标定位元素获取location
    var targetSelected = false;

    //根据光标定位元素
    window.onmouseover = function(e) {
        //光标锁定
        if(!targetSelected) {
            $(".secKillTarget").removeClass("secKillTarget");
            $(e.target).addClass("secKillTarget");
        }
        //重选
        $(e.target).click(function () {
            if ($(this).attr("id") == "reset") {
                $(".secKillTarget").removeClass("secKillTarget");
                $("#secKillForm #location").val("");
                $("#secKillForm #result").text(0);
                targetSelected = false;
                return false;
            }
        });
        //右键选中目标
        $(e.target).contextmenu(function(rightClickEvent){
            if (!targetSelected) {
                targetSelected = true;
                var selector = $("#secKillForm input[name=selector]:checked").val();
                if (selector == "jQuery") {
                    var path = getDomPath(e.target);
                    $("#secKillForm #location").val(path.join(' > '));
                } else {
                    var path = getXPathTo(e.target);
                    $("#secKillForm #location").val(path);
                }
                $("#secKillForm #result").text(1);
                alert("目标已选中！");
                //return false;
            }
            //return false;
        });
    };

    //定位元素
    $("#secKillForm #search").click(function () {
        var location = $("#secKillForm #location").val();
        var selector = $("#secKillForm input[name=selector]:checked").val();
        console.log(location);
        if($.trim(location) != ""){
            $(".secKillTarget").removeClass("secKillTarget");
            if(selector == "jQuery") {
                $(location).addClass("secKillTarget");
                $("#secKillForm #result").text($(location).length);
            } else {
                $(getElementsByXPath(location)).addClass("secKillTarget");
                $("#secKillForm #result").text(getElementsByXPath(location).length);
            }
        } else {
            alert("请输入选取结果");
        }
    });

    //关闭任务表单
    $("#secKillForm #close").click(function () {
        $(".secKillTarget").removeClass("secKillTarget");
        $("#secKillForm").remove();
    });

    //新增任务
    $("#secKillForm #add").click(function () {
        var killTask = {};
        var location =  $("#secKillForm #location").val();
        if(location == undefined || $.trim(location) == "") {
            alert("请设定秒杀按钮选择结果");
            return false;
        }
        killTask.url = window.location.href;
        killTask.id = new Date().getTime();
        killTask.name = $("#secKillForm #taskName").val();
        killTask.selector = $("#secKillForm input[name=selector]:checked").val();
        killTask.location = location;
        killTask.killTime = $("#secKillForm #killTime").val();
        killTask.frequency = $("#secKillForm #frequency").val();
        if($("#secKillForm #frequency").val() < 100) {
            alert("秒杀频率最小值：100");
            return false;
        }
        killTask.count = $("#secKillForm #count").val();
        if($("#secKillForm #count").val() < 1){
            alert("秒杀次数最小值：1");
            return false;
        }
        killTask.status = 0;
        chrome.storage.local.get({"tasks": new Array()}, function(value){
            var tasks = value.tasks;
            tasks.push(killTask);
            chrome.storage.local.set({"tasks": value.tasks}, function() {
                $(".secKillTarget").removeClass("secKillTarget");
                $("#secKillForm").remove();
                alert("新增成功！");
                //chrome.extension.sendRequest({msg: "成功添加秒杀任务！"});
            });
        });
    });
})();

/**
 * 根据点击元素 获取Jquery path
 * @param el
 * @returns {Array.<*>}
 */
function getDomPath(el) {
    var stack = [];
    while ( el.parentNode != null ) {
        var sibCount = 0;
        var sibIndex = 0;
        for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
            var sib = el.parentNode.childNodes[i];
            if ( sib.nodeName == el.nodeName ) {
                if ( sib === el ) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        if ( el.hasAttribute('id') && el.id != '' ) {
            stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
        } else if ( sibCount > 1 ) {
            stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
            stack.unshift(el.nodeName.toLowerCase());
        }
        el = el.parentNode;
    }

    return stack.slice(1);
}

/**
 * 根据点击元素 获取 xPath
 * @param element
 * @returns {string}
 */
function getXPathTo(element) {
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element===document.body)
        return element.tagName;

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return getXPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
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
    return y + '-' + m + '-' + d;
}

