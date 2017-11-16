(function() {
    $("#secKillForm #close").click(function () {
        $("#secKillForm").remove();
    });
    $("#secKillForm #killTime").click(function () {
        var picker = new Pikaday({
            field: document.getElementById('killTime'),
            format: 'YYYY-MM-DD HH:mm:ss',
            firstDay: 1,
            showTime: true,
            autoClose: false,
            use24hour: true
        });
    });
    $("#secKillForm #add").click(function () {
        //
        // Define your database
        //
        var db = new Dexie("friend_database");
        db.version(1).stores({
            friends: 'name,shoeSize'
        });

        //
        // Put some data into it
        //
        db.friends.put({name: "Nicolas", shoeSize: 8}).then (function(){
            //
            // Then when data is stored, read from it
            //
            return db.friends.get('Nicolas');
        }).then(function (friend) {
            //
            // Display the result
            //
            alert ("Nicolas has shoe size " + friend.shoeSize);
        }).catch(function(error) {
            //
            // Finally don't forget to catch any error
            // that could have happened anywhere in the
            // code blocks above.
            //
            alert ("Ooops: " + error);
        });
        // document.getElementById("close").addEventListener("click", function(e) {
        //     var element = document.getElementById("secKillForm");
        //     element.outerHTML = "";
        //     delete element;
        // }, true);
    });
})();

