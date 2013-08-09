var html_ky_list;
var html_mp3_list;
var data_ky_list = null;
var data_mp3_list = null;
var data_ky_name = null;

//timer functions for smooth update
var typingTimer;
var doneTypingInterval = 2500;

$( "div[data-role='page']" ).one("pageinit",function() {
    $( "#errorPopup" ).popup({ positionTo: "window" });
    $( "#errorPopup" ).find("#errorRefresh").click(function(){
        refreshPage();
    });
});

$( document ).one( "pageshow", "#home_loading_page", function() {
    html_ky_list = $( '#ky_search' );
    fetch_keertaneeye(true);
});

$( document ).one( "pageshow", "#ky_list_page", function() {
    if(data_ky_list === null){
        html_ky_list = $( '#ky_search' );
        fetch_keertaneeye(false);
    } else {
        setupKySearch();
    }
});

$( document ).on( "pageshow", "#keertan_mp3_list_page", function() {
    html_mp3_list = $( '#mp3_list' );
    if(data_ky_name === null){
        var selectedKy = $.cookie('selected_ky_name'); 
        if(selectedKy) { //found keertanee name in cookie
            fetch_mp3_links(selectedKy,false);
        } else {    //need to go back to ky list
            goto_ky_list_page("slideup");
        }
    } else {
        setupMP3Links();
    }
});

//redirect page functions
function goto_ky_list_page(custom_trans) {
    hideLoading();
    if (custom_trans) {
        $.mobile.changePage("#ky_list_page", {transition : custom_trans});
    } else { 
        $.mobile.changePage("#ky_list_page", {transition : "slidedown"});
    }
}

function goto_keertan_mp3_page(custom_trans) {
    hideLoading();
    if (custom_trans) {
        $.mobile.changePage("#keertan_mp3_list_page", {transition : custom_trans});
    } else { 
        $.mobile.changePage("#keertan_mp3_list_page", {transition : "slide"});
    }
}
function refreshPage() {
  $.mobile.changePage(
    window.location.href,
    {
      allowSamePageTransition : true,
      transition              : 'none',
      showLoadMsg             : false,
      reloadPage              : true
    }
  );
}

//internal array search setup(to improve performance)
function setupKySearch() {
    html_ky_list.on( "listviewbeforefilter", function ( e, data ) {
            var $ul = $( this ),
                    $input = $( data.input ),
                    value = $input.val(),
                    html = "";
            $ul.html( "" );
            if ( value && value.length > 2 ) {
                showLoading();
                timedUpdateKyList(value);
            }
    });
    hideLoading();
}

function timedUpdateKyList(kySearch){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){updateKyList(kySearch)}, doneTypingInterval);
}

function updateKyList(kySearch){
    showLoading();
    var localKyList = jQuery.extend(true, {}, data_ky_list);
    kySearch = kySearch.toLowerCase();
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
            fetch_mp3_links(ky,true);
    });
    hideLoading();
}

//mp3 page setup functions
function setupMP3Links() {
    showLoading();
    var mp3ListLength = data_mp3_list.length;
    html_mp3_list.html('<li data-role="list-divider">'+data_ky_name+' <span class="ui-li-count">'+mp3ListLength+'</span></li>');
    
    for (var i = 0; i<mp3ListLength; i++) {
        var currMP3Link = data_mp3_list[i];
        var currMP3Attr = currMP3Link.split("/");
        addToMP3List(currMP3Link,currMP3Attr[4],currMP3Attr[5]);
    }
    html_mp3_list.listview( "refresh" );
    html_mp3_list.trigger( "updatelayout");
    hideLoading();
}

function addToMP3List(link,place,year){
    
    var mp3Html = '<li><a href="'+link+'">\n\
                    <h4>'+place+'</h4>\n\
                    <p class="ui-li-aside"><strong>'+year+'</strong></p>\n\
                    </a></li>';
    html_mp3_list.append(mp3Html);
}

//yql related functions
function fetch_keertaneeye(isHomePage) {
    showLoading("Fetching Keertaneeye list...");
    var statement = 'select content from html \n\
                    where url="http://akj.org/skins/one/search.php" and \n\
                    xpath=\'//select[contains(@name,"keertaneeya")]/option\' ';
    $.queryYQL(statement, function (data) {
        if(data.query.results) {
            data_ky_list = data.query.results.option;
            console.log(data_ky_list);
            hideLoading();
            if(isHomePage) {
                goto_ky_list_page();
            } else {
                setupKySearch();
            }
        } else {
            hideLoading();
            $( "#errorPopup" ).popup( "open" );
        }
    });
} 

function fetch_mp3_links(ky_name,isKyListPage) {
    data_ky_name = ky_name;
    
    showLoading("Loading MP3 list...");
    var statement = 'select * from htmlpost where url="http://akj.org/skins/one/results.php" and \n\
                    postdata="keertaneeya='+ky_name+'" and \n\
                    xpath="//img[contains(@alt,\'MP3\')]/../..//a//@href"';
    console.log(statement);
    $.queryYQL(statement, "all", function (data) {
        if(data.query.results.postresult) {
            var allLinks = data.query.results.postresult;
            data_mp3_list = allLinks.split("\n");
            console.log(data_mp3_list);
            hideLoading();

            if(isKyListPage) {
                //manage cookies
                $.removeCookie('selected_ky_name');
                $.cookie('selected_ky_name', ky_name);
                goto_keertan_mp3_page();
            } else {
                setupMP3Links();
            }
        } else {
            hideLoading();
            $( "#errorPopup" ).popup( "open" );
        }
    });
}

//loading functions
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