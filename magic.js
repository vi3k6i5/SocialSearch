$(document).ready(function() {
    (function(){
        var htmlTemplate = $("#outer-result-container-template").html();
        var searchQuery = "";
        var itemsDisplayed = {};
        var descriptTemplate = '<div id="he-sm-discription-container" class="he-sm-discription-container"><div class="he-sm-discription">${DESCRIPTION}</div><div class="read-more-btn"><a href="${URL}" target="_blank">link</a></div></div>';
        var addDisplayItem = function(item, isappend) {
            var id = item["id"],
                userId = item["user_id"],
                user = item["user"] || item["source"],
                user_link = item["user_link"],
                user_image = item["user_image"],
                timestamp = item["timestamp"],
                link = item["link"],
                favicon = item["favicon"],
                title = item["title"],
                description = item["description"],

                htmlData = "",
                dateTime;

            if(timestamp) {
                dateTime = new Date(timestamp * 1000).toISOString();
            }

            htmlData = htmlTemplate
            htmlData = htmlData.replace("${TITLE}", title || "");
            htmlData = htmlData.split("${URL}").join(link || "");
            htmlData = htmlData.replace("${FAVICON}", favicon || "");
            htmlData = htmlData.replace("${DESCRIPTION}", description || "");
            htmlData = htmlData.split("${TIMESTAMP}").join(dateTime || "");
            htmlData = htmlData.replace("${USER_LINK}", user_link || "");
            htmlData = htmlData.replace("${USER_IMG}", user_image || "");
            htmlData = htmlData.replace("${USER}", user || "");


            if(isappend) {
                $("#he-sm-social").append(htmlData);
            }
            else if(!itemsDisplayed[id]){
                $("#he-sm-social").prepend(htmlData);
            }
            itemsDisplayed[id] = 1;
        }

        var displaySocialMention = function(results, isAppend) {
            for(var index = 0; index < results["items"].length; index += 1)
            {
                addDisplayItem(results["items"][index], isAppend);
            }
            $("abbr.timeago").timeago();
        }

        var displayFreshSocialMention = function(results) {
            
            itemsDisplayed = {};
            displaySocialMention(results, true);
        }

        var searchSocialMentions = function(query, callback) {
            $.ajax({
                type: 'GET',
                url: 'http://api2.socialmention.com/search',
                data: { q: query, f: 'json', t: 'all' },
                jsonpCallback: 'jsonp',
                dataType: 'jsonp',
                beforeSend: function(xhr){
                    $("#show-loading").removeClass("hide");
                    $("#refresh-result").attr('disabled',true);
                },
                success: function(results){
                    callback(results);
                    searchQuery = query;
                },
                complete: function(xhr, status){
                    $("#show-loading").addClass("hide");
                    $("#refresh-result").attr('disabled',false);
                }
            });
        }

        var displayDescription = function(results) {

            var description = results["Definition"] || results["AbstractText"],
                source = results["AbstractURL"],
                htmlData = descriptTemplate;

            if(!description && source) {
                description = "Read about " + results["Heading"] + " from " + results["AbstractSource"];
            }
            htmlData = htmlData.replace("${DESCRIPTION}", description || "");
            htmlData = htmlData.replace("${URL}", source || "");

            if(description && source) {
                $("#he-sm-discription-box").append(htmlData);
            }

        }

        var searchDescription = function(query) {
            $.ajax({
                type: 'GET',
                url: 'http://api.duckduckgo.com/',
                data: { q: query, format: 'json'},
                jsonpCallback: 'jsonp',
                dataType: 'jsonp',
                success: function(results){
                    displayDescription(results);
                }
            });
        }

        var initiateNewSearch = function() {
            var query = $("#he-sm-search").val();
            if(!query) {
                return;
            }
            $("#he-sm-social").html("");
            $("#he-sm-discription-box").html("");
            searchSocialMentions(query, displayFreshSocialMention);
            searchDescription(query);
        }

        var initiateSearchRefresh = function() {
            searchSocialMentions(searchQuery, displaySocialMention);
            
        }

        var initiateSearch = function() {
            if($("#he-sm-search").val() === searchQuery) {
                initiateSearchRefresh();
            }
            else {
                initiateNewSearch();
            }
        }
        $("#he-sm-search").keydown(function(event){
            if(event.which === 13) {
                initiateSearch();
            }
        });

        $("#refresh-result").click(function(){
            initiateSearch();
        });
    })();
});
