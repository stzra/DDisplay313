
//this function is not being used anymore, use loadLayoutFromStorage instead
function loadXML(furl) {
    var bSuccess = false;
    var sResult = "";
    try {
        $.ajax({
            url: furl,
            dataType: 'xml',
            async: false,
            success: function (data) {
                // Extract relevant data from XML
                var xml_node = $('region', data);
                var res1 = "";
                var res2 = "";
                var jscript = "";
                var regimgcounter = 1;
                var regvidcounter = 1;
                $(xml_node).each(function () {
                    var media = $(this).find("media").text();
                    var left = $(this).find("posx").text();
                    var top = $(this).find("posy").text();
                    var zindex = $(this).find("posz").text();
                    var width = $(this).find("width").text();
                    var height = $(this).find("height").text();
                    var effect = $(this).find("effect").text();
                    res1 += ("<div style='position:absolute; top:" + top + "%; left:" + left + "%; width: " + width + "%; height: " + height + "%; z-index: " + zindex + "; background-color: black;'>"); // border:1px solid white;
                    //==============================================================================================================================================
                    if (media == "image") {
                        var xml_subnode = $(this).find("playlist>material");
                        var matcounter = 1;
                        $(xml_subnode).each(function () {
                            var sUrl = $(this).find("url").text();
                            var sUrlType = $(this).find("url").attr("linktype");
                            if (sUrlType == "core") {
                                sUrl = "md/" + sUrl;
                            }
                            else if (sUrlType == "live") {
                                //
                            }
                            else {

                            }
                            if (matcounter == 1) {
                                res2 += "<img src='" + sUrl + "' class='slide" + regimgcounter + "' id='firstSlide" + regimgcounter + "' stype='" + getTransitionType($(this).find("transtype").text()) + "' dur='" + $(this).find("duration").text() + "' stadt='" + $(this).find("startdate").text() + "' stpdt='" + $(this).find("stopdate").text() + "'>";
                            }
                            else {
                                res2 += "<img src='" + sUrl + "' class='slide" + regimgcounter + "' style='display: none;' stype='" + getTransitionType($(this).find("transtype").text()) + "' dur='" + $(this).find("duration").text() + "' stadt='" + $(this).find("startdate").text() + "' stpdt='" + $(this).find("stopdate").text() + "'>";
                            }

                            if (matcounter == 1) {
                                var iDuration = 3000;  //default if can't get from xml
                                try {
                                    iDuration = parseInt($(this).find("duration").text());
                                } catch (e) {
                                    iDuration = 3000;
                                }
                                if (isNaN(iDuration)) iDuration = 3000;
                                arSlideTimerIdx[matcounter - 1] = iDuration;
                            }

                            matcounter++;

                            //<div style='position:absolute; top:50%; left:50%; width: 50%; height: 50%;'>
                            //<img src='img/cover1.jpg' class='slide1' id='firstSlide1' stype='topdown' stadt='' stpdt=''>
                            //<img src='img/cover2.jpg' class='slide1' style='display: none;' stype='bottomup' stadt='' stpdt=''>
                            //</div>

                        });
                        regimgcounter++;
                    }
                    else if (media == "video") {
                        var xml_subnode = $(this).find("playlist>material");
                        var matcounter = 1;
                        /*
                        <video autoplay loop preload="metadata" width="100%" height="100%">
                        <source src="media/news1.mp4" type="video/mp4">
                        </video>
                        */
                        res2 += "<video " + effect + " id='vidObj" + (regvidcounter - 1) + "'  preload='none' width='100%' height='100%' poster='md/black1px.png'>";
                        $(xml_subnode).each(function () {
                            var sFileType = "video/mp4";
                            var sUrl = $(this).find("url").text();
                            var sUrlType = $(this).find("url").attr("linktype");
                            var iStartDt = 0;
                            var iStopDt = 0;
                            var iRunOnce = 0;
                            //check url mode
                            if (sUrlType == "core") {
                                sUrl = "md/" + sUrl;
                            }
                            else if (sUrlType == "live") {

                            }
                            else {

                            }
                            //check file type
                            if (sUrl.indexOf(".m3u8") !== -1) {
                                //contains string
                                sFileType = "application/x-mpegURL";
                            }
                            else if (sUrl.indexOf(".mp4") !== -1) {
                                //contains string
                                sFileType = "video/mp4";
                            }
                            else if (sUrl.indexOf(".mpg") !== -1) {
                                //contains string
                                sFileType = "video/mp4";
                            }
                            else if (sUrl.indexOf(".mpeg") !== -1) {
                                //contains string
                                sFileType = "video/mp4";
                            }
                            else if (sUrl.indexOf(".ogg") !== -1) {
                                //contains string
                                sFileType = "video/ogg";
                            }
                            else {

                            }

                            try {
                                iStartDt = parseInt($(this).find("startdate").text());
                            } catch (e) { iStartDt = 0; }
                            if (isNaN(iStartDt)) iStartDt = 0;
                            try {
                                iStopDt = parseInt($(this).find("stopdate").text());
                            } catch (e) { iStopDt = 0; }
                            if (isNaN(iStopDt)) iStopDt = 0;
                            try {
                                iRunOnce = parseInt($(this).find("runonce").text());
                            } catch (e) { iRunOnce = 0; }
                            if (isNaN(iRunOnce)) iRunOnce = 0;

                            if (matcounter == 1) {
                                res2 += ("<source id='vidSrc" + (regvidcounter - 1) + "' src='" + sUrl + "' type='" + sFileType + "'>");
                            }

                            arVidList[regvidcounter - 1][matcounter - 1] = sUrl;
                            arVidType[regvidcounter - 1][matcounter - 1] = sFileType;
                            arVidStart[regvidcounter - 1][matcounter - 1] = iStartDt;
                            arVidStop[regvidcounter - 1][matcounter - 1] = iStopDt;
                            arVidRunOnce[regvidcounter - 1][matcounter - 1] = iRunOnce;

                            matcounter++;
                        });

                        arVidPlayMax[regvidcounter - 1] = matcounter - 1;
                        arVidPlayIdx[regvidcounter - 1] = 0;

                        res2 += "</video>";
                        regvidcounter++;
                    }
                    else if (media == "background") {
                        var xml_subnode = $(this).find("playlist>material");
                        var matcounter = 1;
                        $(xml_subnode).each(function () {
                            var sUrl = $(this).find("url").text();
                            var sUrlType = $(this).find("url").attr("linktype");
                            var sBgColor = $(this).find("bgcolor").text();
                            if (sUrlType == "core") {
                                sUrl = "md/" + sUrl;
                            }
                            else if (sUrlType == "live") {
                                //
                            }
                            else {

                            }

                            if (sUrl != "") {
                                res2 += "<img src='" + sUrl + "' style='position:absolute; width: 100%; height: 100%;' >";
                            }
                            else {
                                res2 += "<div style='width:100%;height:100%;background-color:" + sBgColor + ";'></div>";
                            }
                            matcounter++;
                        });
                    }
                    else if (media == "webview") {
                        var xml_subnode = $(this).find("playlist>material");
                        var matcounter = 1;
                        $(xml_subnode).each(function () {
                            var sName = $(this).find("name").text();
                            var sUrl = $(this).find("url").text();
                            var sUrlType = $(this).find("url").attr("linktype");
                            var sBgColor = $(this).find("bgcolor").text();
                            if (sUrlType == "core") {
                                sUrl = "md/" + sUrl;
                            }
                            else if (sUrlType == "live") {
                                //
                            }
                            else {

                            }

                            res2 += "<div style='width:100%;height:100%;'><iframe src='" + sUrl + "' name='" + sName + "' style='width:100%;height:100%;background-color:" + sBgColor + ";'></iframe></div>";

                            matcounter++;
                        });
                    }
                    else if (media == "movingtext") {
                        var xml_subnode = $(this).find("playlist>material");
                        var matcounter = 1;
                        $(xml_subnode).each(function () {
                            var sText = $(this).find("text").text();
                            var sBorderThickness = $(this).find("border").text();
                            var sBorderColor = $(this).find("border").attr("color");
                            var sBgColor = $(this).find("background").text();
                            var sFontColor = $(this).find("font").attr("color");
                            var sFontSize = $(this).find("font").text();
                            var sUrl = $(this).find("url").text();
                            var sUrlType = $(this).find("url").attr("linktype");
                            if (sUrlType == "core") {
                                sUrl = "md/" + sUrl;
                            }
                            else if (sUrlType == "live") {
                                //
                            }
                            else {

                            }
                            //class="marquee marquee-speed-slow" data-marquee="Find the latest breaking news and information on the top stories, weather, business, entertainment, politics, and more."></div>
                            //res2 += "<img src='" + sUrl + "' style='position:absolute; width: 100%; height: 100%;' >";
                            res2 += "<table border='0' width='100%' height='100%' style='font-size:" + sFontSize + "em; color:" + sFontColor + "; background-color:" + sBgColor + "; border:" + sBorderThickness + "px solid " + sBorderColor + ";'><tr><td><div class='marquee marquee-speed-slow' data-marquee='" + sText + "'></div></td></tr></table>";
                            matcounter++;
                        });
                    }
                    else {

                    }

                    res1 += (res2 + "</div>");
                    res2 = "";


                });
                //alert(res1);
                iVidRegCount = regvidcounter - 1;
                bSuccess = true;
                sResult = res1;

            },
            error: function (data) {
                //alert("error")
                bSuccess = false;
            }
        });


    }
    catch (e) {
        //alert("exception");
        bSuccess = false;
    }

    return {
        success: bSuccess,
        html: sResult
    }
}


function loadHTML(httpurl, targetid) {
    var bSuccess = false;
    var sResult = "";
    try {
        $.ajax({
            url: httpurl,
            dataType: 'html',
            async: false,
            success: function (data) {



                sResult = data;
                bSuccess = true;

                //$("#stbId" + targetid).html(data);
                //$("#" + targetid).css("background-color", "black");
                //$("#" + targetid).attr("src", "data:text/html;charset=\"UTF-8\"," + data);
                //window.open(httpurl, targetid);
                $("#" + targetid).attr("src", "data:text/html;charset=utf-8," + encodeURI("<html><body style='background-color:green;color:black;'><br><br><br><center><h1>TEST</h1></center></body></html>"));
                //$("#" + targetid).attr("src", httpurl);
            },
            error: function (data) {
                //alert("error")
                bSuccess = false;
            }
        });


    }
    catch (e) {
        //alert("exception");
        bSuccess = false;
    }

    return {
        success: bSuccess,
        html: sResult
    }
}