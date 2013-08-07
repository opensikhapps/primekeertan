var $ky_list;
$( document ).one( "pageshow", "#home_loading_page", function() {
            $ky_list = $( '#ky_search' );
            fetch_keertaneeye(true);
});

$( document ).one( "pageshow", "#ky_list_page", function() {
            $ky_list = $( '#ky_search' );
            if($ky_list.is(':empty')){
                fetch_keertaneeye(false);
            }
});

function showLoading(load_text){
    setTimeout(function(){
        $.mobile.loading( "show", {
            text: load_text,
            textVisible: true
        });
    }, 1);
}

function hideLoading(){
    setTimeout(function(){
        $.mobile.loading("hide");
    }, 1); 
}

function fetch_keertaneeye(isHome) {
    showLoading("Fetching Keertaneeye list...");
    var html = "";
    var statement = 'select content from html \n\
                    where url="http://akj.org/skins/one/search.php" and \n\
                    xpath=\'//select[contains(@name,"keertaneeya")]/option\' ';
    $.queryYQL(statement, function (data) {
        var data_ky_list = data.query.results.option;
        //console.log(data_ky_list);
        $.each(data_ky_list, function (i,val) {
            if(val) {
                html += "<li class='ky'><a href='#'>" + val + "</a></li>";
            }
        });
        $ky_list.html( html );
        hideLoading();
        if(isHome) {
            goto_ky_list_page();
        } else {
            $ky_list.listview( "refresh" );
            $ky_list.trigger( "updatelayout");
        }
        $ky_list.children('li.ky').click(function(){
            var ky = $(this).find('a').text();
            fetch_mp3_links(ky);
        });
    });
} 

function goto_ky_list_page() {
    hideLoading();
    $.mobile.changePage("#ky_list_page", {transition : "slide"});
}

function fetch_mp3_links(ky) {
    showLoading("Loading MP3 list...");
    var statement = 'select * from htmlpost where url="http://akj.org/skins/one/results.php" and \n\
                    postdata="keertaneeya='+ky+'" and \n\
                    xpath="//img[contains(@alt,\'MP3\')]/../../..//a"';
    console.log(statement);
    $.queryYQL(statement, "all", function (data) {
        var data_mp3_list = data.query.results.postresult.a;
        console.log(data_mp3_list);
        hideLoading();
    });
}
