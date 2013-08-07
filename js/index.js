var html_ky_list;
var data_ky_list=null;
$( document ).one( "pageshow", "#home_loading_page", function() {
        html_ky_list = $( '#ky_search' );
        fetch_keertaneeye(true);
});

$( document ).one( "pageshow", "#ky_list_page", function() {
        if(data_ky_list === null){
            html_ky_list = $( '#ky_search' );
            fetch_keertaneeye(false);
        }
        setupKySearch();
});

function fetch_keertaneeye(isHomePage) {
    showLoading("Fetching Keertaneeye list...");
    var statement = 'select content from html \n\
                    where url="http://akj.org/skins/one/search.php" and \n\
                    xpath=\'//select[contains(@name,"keertaneeya")]/option\' ';
    $.queryYQL(statement, function (data) {
        data_ky_list = data.query.results.option;
        console.log(data_ky_list);
        hideLoading();
        if(isHomePage) {
            goto_ky_list_page();
        }
    });
} 

//redirect page functions
function goto_ky_list_page() {
    hideLoading();
    $.mobile.changePage("#ky_list_page", {transition : "slide"});
}

function goto_keertan_mp3_page() {
    hideLoading();
    $.mobile.changePage("#keertan_mp3_list_page", {transition : "slide"});
}

//internal array search setup(to improve performance
function setupKySearch() {
    html_ky_list.on( "listviewbeforefilter", function ( e, data ) {
            var $ul = $( this ),
                    $input = $( data.input ),
                    value = $input.val(),
                    html = "";
            $ul.html( "" );
            if ( value && value.length > 2 ) {
                updateKyList(value);
            }
    });
    
    hideLoading();
}


//yql related functions
function updateKyList(kySearch){
    showLoading();
    var localKyList = jQuery.extend(true, {}, data_ky_list);
    
    var html = "";
    for (var ky_index in localKyList) {
        var currKy = localKyList[ky_index];
        if(currKy) {
            if (currKy.toLowerCase().indexOf(kySearch) != -1) {
                html += "<li class='ky'><a href='#'>" + currKy + "</a></li>";
                delete localKyList[ky_index];
            }
        }
    }
    
    html_ky_list.html( html );
    html_ky_list.listview( "refresh" );
    html_ky_list.trigger( "updatelayout");
    html_ky_list.children('li.ky').click(function(){
            var ky = $(this).find('a').text();
            fetch_mp3_links(ky);
    });
    hideLoading();
}

function fetch_mp3_links(ky_name) {
    showLoading("Loading MP3 list...");
    var statement = 'select * from htmlpost where url="http://akj.org/skins/one/results.php" and \n\
                    postdata="keertaneeya='+ky_name+'" and \n\
                    xpath="//img[contains(@alt,\'MP3\')]/../../..//a"';
    console.log(statement);
    $.queryYQL(statement, "all", function (data) {
        var data_mp3_list = data.query.results.postresult.a;
        console.log(data_mp3_list);
        hideLoading();
    });
}

function showLoading(load_text){
    setTimeout(function(){
        $.mobile.loading( "show", {
            text: load_text,
            textVisible: load_text? true :false
        });
    }, 1);
}

function hideLoading(){
    setTimeout(function(){
        $.mobile.loading("hide");
    }, 1); 
}
