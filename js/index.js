var $ky_list;
$( document ).on( "pageshow", "#home_loading_page", function() {
            showLoading("Fetching Keertaneeye list...");
            $ky_list = $( '#ky_search' );
            //fetch list from yql
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

//funtion fetch_keertaneeye() {
    
//} 

function goto_ky_list_page() {
    hideLoading();
    $.mobile.changePage("#ky_list_page", {transition : "slide", changeHash: false });
}