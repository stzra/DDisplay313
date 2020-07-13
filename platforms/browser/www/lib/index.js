
var sDeviceID = "";
var sDevicePlatform = "windows";
var sDevicePlatformVersion = "7";
var sBufferXMLData = "";
var sLayoutID = "-1";
var sLayoutName = "";
var sCompanyID = "-1";
var sLocation = "Indonesia";
var sUserID = "-1";
var sXMLUrl = "";
var iXMLVersionNumber = 0;
var sPreloadImages = "";
var bFirstLoad = true;
var iShowDebugLog = -1;
var iMixedContentTimerID = -1;
var iVersionCheckTimer = -1;
var iVideoCount = 0;  //only accept 1 video 
//updatable files
var arUpdatableFileList = [];
var arUpdatableFileFlag = [];
var arUpdatableFileMD5 = [];
var arUpdatableFileMD5Result = [];
var iUpdatableDownloadCounter = 0;
var bDownloadFailed = false;
var bDownloading = false;
var sOnlineMode = "Unknown";  //unknown, online, offline

var sInitScreen1 = $("#dvInitScreen1").html();
var sInitScreen2 = $("#dvInitScreen2").html();
var sInitScreen2b = $("#dvInitScreen2b").html();




$(document).ready(function () {
    try {
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    } catch (e) { }

    try {
        document.addEventListener("deviceready", onDeviceReady, false);
    } catch (e) { }

    try {
        String.prototype.fileExist = function () {
            filename = this.trim();
            //MAlert("filename:" + filename);
            var response = jQuery.ajax({
                url: filename,
                type: 'GET',
                method: 'GET',
                isLocal: false,
                cache: false,
                crossDomain: true,
                async: false
            }).status;
            //if (response != "200") MAlert("response=" + response);
            return (response != "200") ? false : true;
        }
    }
    catch (ex) { /*MAlert(ex.message);*/ }

    initDevice();

    setKeyPress();
 
});

function onDeviceReady() {
    // Now safe to use device APIs
    initContent();

}



function initContent() {
    //hide reset button
    $(".dvReset").css("visibility", "hidden");
    $(".dvReset").css("display", "none");
    //<br /><br />&nbsp;&nbsp;<input id='txURL' type='text' value='http://192.168.1.253:3000/201809TS.xml' style='width:200px;' />&nbsp;<input type='button' value='LOAD' onclick='resetContent();' />&nbsp;<input type='button' value='DOWNLOAD' onclick='downloadFile();' style='visibility:hidden;' />  &nbsp;<input type='button' value='SAVE' onclick='testsave();' style='visibility:visible;' />&nbsp;<input type='button' value='LOAD' onclick='testload();' style='visibility:visible;' />&nbsp;<input type='button' value='DELETE' onclick='testdelete();' style='visibility:visible;' />

    ClearAllTimeouts();
    if (iMixedContentTimerID > -1) {
        clearInterval(iMixedContentTimerID);
    }
    if (iVersionCheckTimer != -1) {
        clearInterval(iVersionCheckTimer);
    }
    isVideoPlaying = false;
    isVideoEnded = false;
    if (sDevicePlatform == "windows") {
        try {
            window.external.VLCPlayerStop();
        }
        catch (ex) {

        }
    }

    initDevice();
    //alert(""+GetDeviceID()+","+GetDevicePlatformName()+","+GetDevicePlatformVersion());

    $("#dvDebugDisplay").removeClass("debugok").addClass("debughide");

    if (isXMLDataExist()) {
        //xml exist
        var oResult = getXMLDataStringFromStorage();
        if (!bFirstLoad) {
            if (sXMLUrl.indexOf(".xml") >= 0) {  //offline mode
                $("#spRegions").html(sInitScreen2b);
                $("#btnBack").css("visibility", "visible");
                $("#btnBack").css("display", "block");
                var xml_node = $('layout', oResult.data);
                $(xml_node).each(function () {
                    var version = $(this).find("version").text();
                    var group = $(this).find("group").text();
                    var subgroup = $(this).find("subgroup").text();
                    var swidth = $(this).find("screen>width").text();
                    var sheight = $(this).find("screen>height").text();

                    //$("#spSTBCompanyB").html(group + "</br>" + subgroup);
                    $("#spSTBCompanyB").html(group);
                    $("#spSTBResolution").html(swidth + " x " + sheight);
                    $("#spSTBVersion").html(version);
                    if (sDeviceID == "") sDeviceID = "proto12345";  //for development
                    $("#spSTBID").html(GetDeviceID());
                    $("#spSTBIDb").html(GetDeviceID());
                    $("#spSTBLayout").html(sLayoutName);
                    $("#spSTBLocation").html(sLocation);
                    $("#spSTBConnection").html(sOnlineMode);
                    $("#spSTBConnectionb").html(sOnlineMode);
                });
            }
            else {
                //online mode
                $("#spRegions").html(sInitScreen2);

                $("#btnBack").css("visibility", "visible");
                $("#btnBack").css("display", "block");
                var xml_node = $('layout', oResult.data);
                $(xml_node).each(function () {
                    var version = $(this).find("version").text();
                    var group = $(this).find("group").text();
                    var subgroup = $(this).find("subgroup").text();
                    var swidth = $(this).find("screen>width").text();
                    var sheight = $(this).find("screen>height").text();

                    $("#spSTBCompany").html(group);
                    if (sDeviceID == "") sDeviceID = "proto12345";  //for development
                    $("#spSTBID").html(GetDeviceID());
                    $("#spSTBIDb").html(GetDeviceID());
                    $("#spSTBLayout").html(sLayoutName);
                    $("#spSTBLocation").html(sLocation);
                    $("#spSTBConnection").html(sOnlineMode);
                    $("#spSTBConnectionb").html(sOnlineMode);
                    
                });
            }
        }
        else {
            //first time running stb with layout already exist in storage
            bFirstLoad = false;
            deleteCache();
            loadLayoutFromStorage(true);  //false
            runCheckVersionTimer();
        }
    }
    else {
        //xml not exist yet
        //show init screen 1 -> ask ip address
        $("#spRegions").html(sInitScreen1);
        $("#spSTBIDLogin").html(sDeviceID);
        $("#spSTBIDLogin2").html(sDeviceID);
    }
}

function initDevice() {
    //set device id
    try {
        var did = "" + device.uuid;
        var dplatform = "" + device.platform;
        var dplatformversion = "" + device.version;
        SetDeviceID(did.toLowerCase());
        SetDevicePlatform(dplatform.toLocaleLowerCase(), dplatformversion.toLocaleLowerCase());
    } catch (e) {
        //MAlert("init > " + e.message);
        //SetDevicePlatform("windows", "7");
    }
    try {
        writeToFile("notfound.txt", "404");
    }
    catch (ex) {

    }
}

function getJSONDataStringFromURLAsync(sUrl, sParams, iPhase) {
    var bSuccess = false;
    var sResult;
    try {

        $.ajax({
            type: 'POST',
            method: 'POST',
            cache: false,
            url: sUrl,
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            data: '' + sParams + '&r=' + getRandomID(10),
            processData: false,
            crossDomain: true,
            async: true,
            success: function (resp) {
                //var xmlString = (new XMLSerializer()).serializeToString(data);
                //sResult = (new XMLSerializer()).serializeToString(data);
                sResult = resp;
                bSuccess = true;
                var oData = {
                    success: bSuccess,
                    data: sResult
                };
                if (iPhase == 1) {
                    try {
                        if (oData.success) {
                            //errmsg = string, success = int(kalau -1 = device direset, 1 success, 0 gagal)
                            var iVerNo = oData.data.verno;
                            var iReqCode = oData.data.reqcode;
                            var iReqTag = oData.data.reqtag;
                            var iReqPar = oData.data.reqpar;
                            var iSuccess = 0;
                            try {
                                iSuccess = parseInt(oData.data.success);
                            }
                            catch (ex) { iSuccess = 0; }
                            if (isNaN(iSuccess)) iSuccess = 0;
                            if (iSuccess == -1) {
                                //device has been reset by cms
                                $(".dvReset").css("visibility", "hidden");
                                $(".dvReset").css("display", "none");

                                ClearAllTimeouts();
                                if (iMixedContentTimerID > -1) {
                                    clearInterval(iMixedContentTimerID);
                                }
                                if (iVersionCheckTimer != -1) {
                                    clearInterval(iVersionCheckTimer);
                                }
                                isVideoPlaying = false;
                                isVideoEnded = false;
                                if (sDevicePlatform == "windows") {
                                    try {
                                        window.external.VLCPlayerStop();
                                    }
                                    catch (ex) {

                                    }
                                }
                                bFirstLoad = true;
                                deleteXMLDataStringFromStorage();
                                sBufferXMLData = "";
                                $("#spRegions").html(sInitScreen1);
                                try {
                                    $("#spSTBIDLogin").html(sDeviceID);
                                    $("#spSTBIDLogin2").html(sDeviceID);
                                } catch (ex) { }
                                MAlert("This device has been reset from CMS.");
                                return;
                            }
                            if (iVerNo <= iXMLVersionNumber) {
                                if (iShowDebugLog == 1) {
                                    $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>New version not found.</font>");
                                    $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>Ver No = " + iVerNo + "</font>");
                                    $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>Req Code = " + iReqCode + "</font>");
                                    $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>Req Tag = " + iReqTag + "</font>");
                                    $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>Req Par = " + iReqPar + "</font>");

                                    if (iReqCode == 1) {
                                        //text log
                                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Getting text log " + iReqPar + ".txt");
                                        getTextLog(iReqTag, iReqPar);
                                    }
                                    else if (iReqCode == 2) {
                                        //screenshot
                                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Getting screenshot ...");
                                        getScreenShot(iReqTag);
                                    }
                                    else {
                                        setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
                                    }
                                }
                                //return;
                            }
                            else {
                                //if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:green;'>New version detected, applying new layout...</font>");
                                //get new version
                                //==version changed
                                getJSONDataStringFromURLAsync(sXMLUrl, "act=getlayoutdata&deviceid=" + GetDeviceID() + "&layoutid=" + sLayoutID + "&r=" + getRandomID(10), 2);
                            }

                        }
                        else {
                            //if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>New layout applied!");
                            if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
                            //return;
                        }
                    }
                    catch (ex) {
                        //alert("Error in getlayoutver, " + ex.message);
                        if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
                        //return;
                    }
                }
                else if (iPhase == 2) {  //iphase == 2
                    if (oData.success) {
                        //sBufferXMLData = decodeURIComponent((oData.data.xmldata + '').replace(/\+/g, '%20'));
                        var sTempData = decodeURIComponent((oData.data.xmldata + '').replace(/\+/g, '%20'));
                        var xml_node = $('layout', sTempData);
                        $(xml_node).each(function () {
                            var version = $(this).find("version").text();
                            var iNewVersion = parseInt(version);
                            if (isNaN(iNewVersion)) iNewVersion = 0;
                            if (iNewVersion > iXMLVersionNumber) {
                                try{
                                    ////if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:green;'>New version detected, applying new layout...</font>");
                                    //new layout version detected
                                    //save new layout first
                                    sBufferXMLData = sTempData;
                                    setXMLDataStringToStorage(sTempData);   //set new ver here
                                    deleteCache();

                                    //load new layout to screen
                                    //loadLayoutFromStorage(false);

                                    if (iVersionCheckTimer != -1) {
                                        clearInterval(iVersionCheckTimer);
                                    }

                                    iLoadImageTimer = 0;
                                    bFirstLoad = false;
                                    isVideoPlaying = false;
                                    isVideoEnded = false;
                                    ClearAllTimeouts();
                                    loadLayoutFromStorage(true);  //update ver here
                                    //runCheckVersionTimer();

                                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:green;'>New version detected, applying new layout...</font>");
                                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>New layout applied!");
                                }
                                catch (ex) {
                                    //MAlert("Exception = " + ex.message);
                                }
                                if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
                            }
                            else {
                                //no new version detected
                                ////if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>New version not found.</font>");
                            }
                        });
                    }
                    else {
                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/><font style='color:red;'>Failed to load XML!</font>");
                    }
                }
                else {

                }


            },
            error: function (resp) {
                bSuccess = false;

                try {
                    sResult = resp.responseJSON.errmsg;
                    if (typeof sResult === 'undefined') sResult = "" + resp.status + " " + resp.statusText;
                }
                catch (ex) {
                    sResult = "" + resp.status + " " + resp.statusText;
                }

                var oData = {
                    success: bSuccess,
                    data: sResult
                };



            },
            timeout: 3000
        });
    }
    catch (e) {
        bSuccess = false;
        sResult = "";
        var oData = {
            success: bSuccess,
            data: sResult
        };
    }


    
}

function getJSONDataStringFromURL(sUrl, sParams) {
    var bSuccess = false;
    var sResult;
    try {
        
        $.ajax({
            type: 'POST',
            method: 'POST',
            cache: false,
            url: sUrl,
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            data: '' + sParams + '&r=' + getRandomID(10),
            processData: false,
            crossDomain: true,
            async: false,
            success: function (resp) {
                //var xmlString = (new XMLSerializer()).serializeToString(data);
                //sResult = (new XMLSerializer()).serializeToString(data);
                sResult = resp;
                bSuccess = true;
            },
            error: function (resp) {
                bSuccess = false;
                try {
                    sResult = resp.responseJSON.errmsg;
                    if (typeof sResult === 'undefined') sResult = "" + resp.status + " " + resp.statusText;
                }
                catch (ex) {
                    sResult = "" + resp.status + " " + resp.statusText;
                }
            },
            timeout: 3000
        });
    }
    catch (e) {
        bSuccess = false;
        sResult = "";
    }
    

    return {
        success: bSuccess,
        data: sResult
    }
}

//not using XML anymore, now using JSON. NOTE: only used for offline mode (file:/// url)
function getXMLDataStringFromURL(sUrl) {
    var bSuccess = false;
    var sResult = "";
    try {
        $.ajax({
            type: "GET",
            cache: false,
            url: sUrl,
            dataType: 'xml',
            crossDomain: true,
            async: false,
            success: function (data) {
                var xmlString = (new XMLSerializer()).serializeToString(data);
                sResult = (new XMLSerializer()).serializeToString(data);
                bSuccess = true;
            },
            error: function (jqXHR, textStatus, errorThrown) { //(data) {
                //MAlert("" + jqXHR.status + " , " + textStatus + " , " + errorThrown);
                bSuccess = false;
                sResult = "";
            },
            timeout: 5000
        });
    }
    catch (e) {
        //MAlert(e.message);
        bSuccess = false;
        sResult = "";
    }
    return {
        success: bSuccess,
        data: sResult
    }
}

function setDownloadingStatus() {
    try {
        var iDownloading = 0;
        if (bDownloading == true) iDownloading = 1;
        try {
            window.localStorage.setItem('filedownloading', iDownloading);
        }
        catch (e2) { }
        if (sDevicePlatform == "windows") {
            try {
                window.external.SetLocalStorage('filedownloading', iDownloading);
            }
            catch (e2) { }
        }
    }
    catch (e) {
    }
}

function getDownloadingStatus() {
    var iResult = false;
    try {
        var iDownloading = 0;
        try {
            iDownloading = window.localStorage.getItem('filedownloading');
        }
        catch (e2) { }
        if (sDevicePlatform == "windows") {
            try {
                iDownloading = window.external.GetLocalStorage('filedownloading');
            }
            catch (e2) { }
        }
        if (iDownloading == 1) iResult = true;
    }
    catch (e) {
    }
    return iResult;
}

function setXMLDataStringToStorage(datax) {
    var bSuccess = false;
    try {
        try {
            window.localStorage.setItem('xmldata', datax);
            window.localStorage.setItem('xmlurl', sXMLUrl);
            window.localStorage.setItem('layoutid', sLayoutID);
            window.localStorage.setItem('layoutname', sLayoutName);
            window.localStorage.setItem('location', sLocation);
            window.localStorage.setItem('companyid', sCompanyID);
            window.localStorage.setItem('deviceid', sDeviceID);
            window.localStorage.setItem('network', sOnlineMode);
            bSuccess = true;
        }
        catch (e2) { }
        if (sDevicePlatform == "windows") {
            try {
                window.external.SetLocalStorage('xmldata', datax);
                window.external.SetLocalStorage('xmlurl', sXMLUrl);
                window.external.SetLocalStorage('layoutid', sLayoutID);
                window.external.SetLocalStorage('layoutname', sLayoutName);
                window.external.SetLocalStorage('location', sLocation);
                window.external.SetLocalStorage('companyid', sCompanyID);
                window.external.SetLocalStorage('deviceid', sDeviceID);
                window.external.SetLocalStorage('network', sOnlineMode);
                bSuccess = true;
            }
            catch (e2) { }
        }
    }
    catch (e) {
        bSuccess = false;
    }
    return bSuccess;
}

function getXMLDataStringFromStorage() {
    var bSuccess = false;
    var sResult = "";
    try {
        try {
            sResult = window.localStorage.getItem('xmldata');
            sXMLUrl = window.localStorage.getItem('xmlurl');
            sLayoutID = window.localStorage.getItem('layoutid');
            sLayoutName = window.localStorage.getItem('layoutname');
            sLocation = window.localStorage.getItem('location');
            sCompanyID = window.localStorage.getItem('companyid');
            sDeviceID = window.localStorage.getItem('deviceid');
            sOnlineMode = window.localStorage.getItem('network');
        }
        catch(e2) {}
        if (sDevicePlatform == "windows") {
            try {
                sResult = window.external.GetLocalStorage('xmldata');
                sXMLUrl = window.external.GetLocalStorage('xmlurl');
                sLayoutID = window.external.GetLocalStorage('layoutid');
                sLayoutName = window.external.GetLocalStorage('layoutname');
                sLocation = window.external.GetLocalStorage('location');
                sCompanyID = window.external.GetLocalStorage('companyid');
                sDeviceID = window.external.GetLocalStorage('deviceid');
                sOnlineMode = window.external.GetLocalStorage('network');
            }catch(e2) {}
        }

        if ((sResult == null) || (sResult == "")) {
            bSuccess = false;
            sResult = "";
        }
        else {
            bSuccess = true;
        }
    }
    catch (e) {
        bSuccess = false;
        sResult = "";
    }
    return {
        success: bSuccess,
        data: sResult
    }
}


function isXMLDataExist() {
    var data = "";
    try {
        data = window.localStorage.getItem('xmldata');
    }
    catch(e){}
    if (sDevicePlatform == "windows") {
        try{
            data = window.external.GetLocalStorage('xmldata');
        }catch(e){}
    }
    if ((data == null) || (data == "")) return false;
    else return true;
}

function deleteXMLDataStringFromStorage() {
    try {
        window.localStorage.removeItem('xmldata');
    }
    catch (e) {

    }

    try {
        if (sDevicePlatform == "windows") {
            window.external.DeleteLocalStorage('xmldata');
        }
    }
    catch (e) {

    }
}

function stbRetrieve() {
    var sIPAddress = "";
    var sPort = "";
    var sUserName = "";
    var sUserPass = "";
    var sURL = "";
    try {
        /* test md5
        var params = { data: "Hello World!", hash: "md5" };
        window.hashString(params, function (hash) {
            MAlert(params.hash + ": " + hash);
        });
        return;
        */
        sIPAddress = document.getElementById("txServerIP").value; //$("#txServerIP").val();
        sPort = document.getElementById("txServerPort").value;//$("#txServerPort").val();
        sUserName = document.getElementById("txUserName").value; //$("#txServerIP").val();
        sUserPass = document.getElementById("txUserPass").value;//$("#txServerPort").val();
        if ((sIPAddress == "core") || (sIPAddress == "0")) {
            sURL = "data.xml";
            sXMLUrl = sURL;

            var oData = getXMLDataStringFromURL(sURL);
            if (oData.success) {
                sBufferXMLData = oData.data;
                $("#spRegions").html(sInitScreen2b);
                if (!bFirstLoad) {
                    $("#btnBack").css("visibility", "visible");
                    $("#btnBack").css("display", "block");
                }
                else {
                    $("#btnBack").css("visibility", "hidden");
                    $("#btnBack").css("display", "none");
                }
                var xml_node = $('layout', oData.data);
                $(xml_node).each(function () {
                    var version = $(this).find("version").text();
                    var group = $(this).find("group").text();
                    var subgroup = $(this).find("subgroup").text();
                    var swidth = $(this).find("screen>width").text();
                    var sheight = $(this).find("screen>height").text();

                    $("#spSTBCompanyB").html(group + "</br>" + subgroup);
                    $("#spSTBResolution").html(swidth + " x " + sheight);
                    $("#spSTBVersion").html(version);
                    if (sDeviceID == "") sDeviceID = "proto12345"; // for development
                    $("#spSTBID").html(GetDeviceID());
                    $("#spSTBIDb").html(GetDeviceID());
                    $("#spSTBLocation").html(sLocation);
                    $("#spSTBConnection").html(sOnlineMode);
                    $("#spSTBConnectionb").html(sOnlineMode);
                });

            }
            else {
                //failed to load xml from url
                MAlert("Failed to load layout data from " + sURL + ".");
                //sBufferXMLData = "";
            }
            return;
        }
        else {
            if (sPort == "") sPort = "80";
            if (sIPAddress == "1") {
                sIPAddress = "192.168.0.236";
                sPort = "80";
                sUserName = "nspushmail@gmail.com";
                sUserPass = "st3ph3n";
            }
            sURL = "http://" + sIPAddress + ":" + sPort + "/stbapi.php";
            //sURL = "http://" + sIPAddress + ":" + sPort + "/data.xml";
            sXMLUrl = sURL;

            var oData = getJSONDataStringFromURL(sURL, "act=login&uname=" + sUserName + "&passwd=" + sUserPass + "&r=" + getRandomID(10));
            if (oData.success) {
                try {
                    if (oData.data.success == 1) {
                        //alert(oData.data.layout[0].name);
                        $("#spRegions").html(sInitScreen2);
                        if (!bFirstLoad) {
                            $("#btnBack").css("visibility", "visible");
                            $("#btnBack").css("display", "block");
                            $("#spSTBLocation").html(sLocation);
                            $("#spSTBConnection").html(sOnlineMode);
                            $("#spSTBConnectionb").html(sOnlineMode);
                        }
                        else {
                            $("#btnBack").css("visibility", "hidden");
                            $("#btnBack").css("display", "none");
                            $("#btnReset").val("CANCEL");
                            $("#spSTBLocation").html("<input id='txLocation' type='text' inputmode='text' style='width:55%;' maxlength='249' />");
                        }
                        $("#spSTBCompany").html(oData.data.companyname);
                        if (sDeviceID == "") sDeviceID = "proto12345"; //for development
                        $("#spSTBID").html(GetDeviceID());
                        $("#spSTBIDb").html(GetDeviceID());
                        sUserID = "" + oData.data.userid;
                        sCompanyID = "" + oData.data.companyid;
                        //populate dropdown
                        var sDropDownText = "";
                        for (var ilp = 0; ilp < oData.data.layout.length; ilp++) {
                            sDropDownText += "<option value='" + oData.data.layout[ilp].id + "'>" + oData.data.layout[ilp].name + "</option>";
                        }
                        if (oData.data.layout.length > 0) {
                            sDropDownText = "<select id='ddSTBLayout' style='position:absolute;min-width: 30%;max-width: 99%'>" + sDropDownText + "</select>";
                            $("#spSTBLayout").html(sDropDownText);
                        }
                    }
                    else {
                        //error from server
                        MAlert(oData.data.errmsg);
                    }
                }
                catch (ex) { MAlert("JSON data received but invalid."); }
            }
            else {
                var sStatus = "";
                try { sStatus = oData.data;}
                catch(ex){}
                MAlert("Failed to load JSON data from " + sURL + ". " + sStatus);
            }
        }
        //alert(sURL);
        
    }
    catch (e) {
        MAlert(e.message);
    }
}

function stbBack() {

    var iMD5FailedCount = 0;
    for (var lp = 0; lp < arUpdatableFileMD5Result.length; lp++) {
        if (arUpdatableFileMD5Result[lp] == "0") {
            iMD5FailedCount++;
            //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + arUpdatableFileList[lp] + " MD5 Gagal");
        }
        else {
            //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + arUpdatableFileList[lp] + " MD5 Berhasil");
        }
    }
    if (iMD5FailedCount > 0) {
        //gagal md5 check
        $("#spRegions").html("<div style='width:100%;height:100%;background-color:black;'><center><h1 style='color:white;'><br/><br/><br/><br/><br/>Invalid content detected, please reset device!</h1></center></div>");
        $(".dvReset").css("visibility", "visible");
        $(".dvReset").css("display", "block");
        return;
    }

    loadLayoutFromStorage(false);
    runCheckVersionTimer();
}

function stbReset() {
    if (bFirstLoad) {
        bFirstLoad = true;
        deleteXMLDataStringFromStorage();
        sBufferXMLData = "";
        $("#spRegions").html(sInitScreen1);
        return;
    }
    if (MConfirm("Are you sure? This will delete the current saved layout permanently.")) {
        try {
            if (sOnlineMode == "Offline") {
                bFirstLoad = true;
                deleteXMLDataStringFromStorage();
                sBufferXMLData = "";
                $("#spRegions").html(sInitScreen1);
                try {
                    $("#spSTBIDLogin").html(sDeviceID);
                    $("#spSTBIDLogin2").html(sDeviceID);
                } catch (ex) { }
            }
            else {
                oData = getJSONDataStringFromURL(sXMLUrl, "act=unreg&deviceid=" + GetDeviceID() + "&companyid=" + sCompanyID + "&r=" + getRandomID(10));
                if (oData.success) {
                    var xxxxxx = "" + oData.success;
                    bFirstLoad = true;
                    deleteXMLDataStringFromStorage();
                    sBufferXMLData = "";
                    $("#spRegions").html(sInitScreen1);
                    try {
                        $("#spSTBIDLogin").html(sDeviceID);
                        $("#spSTBIDLogin2").html(sDeviceID);
                    } catch (ex) { }
                }
                else {
                    //gagal request reset, cancel reset
                    MAlert("Unable to request reset, reset cancelled!");
                }
            }
        }
        catch (ex) {
            //gagal request reset, cancel reset
            MAlert("Unable to request reset, reset cancelled!");
        }
        
    }
}

function stbReset2() {
    try {
        if (bDownloading) ClearAllTimeouts();
        oData = getJSONDataStringFromURL(sXMLUrl, "act=unreg&deviceid=" + GetDeviceID() + "&r=" + getRandomID(10));
        if (oData.success) {
            var xxxxxx = "" + oData.success;
            $("#btnReset2").css("visibility", "hidden");
            $("#spRegions").html(sInitScreen1);
            try {
                $("#spSTBIDLogin").html(sDeviceID);
                $("#spSTBIDLogin2").html(sDeviceID);
            }
            catch (ex) { }
        }
        else {
            //gagal request reset, cancel reset
            MAlert("Unable to request reset, reset cancelled!");
            if (bDownloading) {
                $("#spPrepInfo").html("");
                loadLayoutFromStorage(true);
            }
        }
    }
    catch (ex) {
        //gagal request reset, cancel reset
        MAlert("Unable to request reset, reset cancelled!");
        if (bDownloading) {
            $("#spPrepInfo").html("");
            loadLayoutFromStorage(true);
        }
    }
     
}

function stbSave() {
    try {
        var oData;

        if (bFirstLoad) {
            sLayoutID = $("#ddSTBLayout").val();
            sLayoutName = $('#ddSTBLayout :selected').text();
            sLocation = $('#txLocation').val();
            //call reg api
            //act=reg&companyid=4&userid=9&deviceid=&osversion=&deviceos=windows&layoutid=491&r=uqMW7AgPKE
            oData = getJSONDataStringFromURL(sXMLUrl, "act=reg&location=" + encodeURI(sLocation) + "&companyid=" + sCompanyID + "&userid=" + sUserID + "&deviceid=" + GetDeviceID() + "&osversion=" + GetDevicePlatformVersion() + "&deviceos=" + GetDevicePlatformName() + "&layoutid=" + sLayoutID + "&r=" + getRandomID(10));
            var sErrMsg = "";
            try {
                sErrMsg = oData.data;
            } catch (ex) { sErrMsg = ex.message; }
            if (oData.success) {
                var xxxxxx = "" + oData.success;
            }
            else {
                if (sXMLUrl.indexOf(".xml") >= 0) {
                    if (setXMLDataStringToStorage(sBufferXMLData)) {
                        //load the xml data and set the screen
                        deleteCache();
                        loadLayoutFromStorage(true);
                        ////runCheckVersionTimer();
                        return;
                    }
                    return;
                }
                MAlert("Unable to register STB! " + sErrMsg);
                bFirstLoad = true;
                deleteXMLDataStringFromStorage();
                sBufferXMLData = "";
                $("#spRegions").html(sInitScreen1);
                return;
            }
        }

        

        //call getlayoutdata api
        //alert("act=getlayoutdata&deviceid=" + GetDeviceID() + "&layoutid=" + sLayoutID + "&r=" + getRandomID(10));
        oData = getJSONDataStringFromURL(sXMLUrl, "act=getlayoutdata&deviceid=" + GetDeviceID() + "&layoutid=" + sLayoutID + "&r=" + getRandomID(10));
        if (oData.success) {
            //sBufferXMLData = decodeURIComponent(oData.data.xmldata);
            //alert("xmldata=" + oData.data.xmldata);
            sBufferXMLData = decodeURIComponent((oData.data.xmldata + '').replace(/\+/g, '%20'));
        }
        else {
            MAlert("Unable to get layout! " + oData.data);
            bFirstLoad = true;
            deleteXMLDataStringFromStorage();
            sBufferXMLData = "";
            $("#spRegions").html(sInitScreen1);
            return;
        }
        
        if (setXMLDataStringToStorage(sBufferXMLData)) {
            //load the xml data and set the screen
            deleteCache();
            loadLayoutFromStorage(true);
            ////runCheckVersionTimer();
            return;
        }
        else {
            //alert("Layout is not saved!");
        }
    }
    catch (ex) {

    }
    //failed
    MAlert("Layout is not saved!");
    bFirstLoad = true;
    deleteXMLDataStringFromStorage();
    sBufferXMLData = "";
    $("#spRegions").html(sInitScreen1);
}

function loadLayoutFromStorage(redownloadfiles) {
    var data = ""; //window.localStorage.getItem('xmldata');  //if key does not exist, returns null
    RegionListClear();  //clear old list
    initDevice();
    try {
        data = window.localStorage.getItem('xmldata');
    }
    catch (ex) { }
    if (sDevicePlatform == "windows") {
        try {
            data = window.external.GetLocalStorage('xmldata');
        } catch (ex) { }
    }

    try {
        var xml_node = $('layout', data);
        $(xml_node).each(function () {
            var version = $(this).find("version").text();
            iXMLVersionNumber = parseInt(version, 10);
            if (isNaN(iXMLVersionNumber)) iXMLVersionNumber = 0;
        });
    }
    catch (e) {
        iXMLVersionNumber = 0;
    }

    //$("#spRegions").html(encodeURI(data)); $("#mkey").focus(); return;

    sBufferXMLData = data;
    var xml_node = $('region', data);
    var res1 = "";
    var res2 = "";
    var jscript = "";
    var iRegionMixedCount = 0;
    iVideoCount = 0;
    bFirstLoad = false;
    bFirstSlide = true;
    arUpdatableFileList = [];
    arUpdatableFileFlag = [];
    arUpdatableFileMD5 = [];
    arUpdatableFileMD5Result = [];

    $("#spPreLoadImages").html("");
    sPreloadImages = "";

    $(xml_node).each(function () {
        var media = ""; //$(this).find("media").text();
        var left = $(this).find("posx").text();
        var top = $(this).find("posy").text();
        var zindex = $(this).find("posz").text();
        var width = $(this).find("width").text();
        var height = $(this).find("height").text();
        var regname = $(this).find("name").text();
        
        res1 += ("<div style='position:absolute; top:" + top + "%; left:" + left + "%; width: " + width + "%; height: " + height + "%; z-index: " + zindex + "; background-color: transparent;' >"); // border:1px solid white;

        var iSlideCount = 0;
        var iMarqCount = 0;
        var iBGCount = 0;
        var iWebVCount = 0;
        //main loop===========================================================================================================================================
        
        var xml_subnode = $(this).find("playlist>material");
        $(xml_subnode).each(function () {
            media = $(this).find("media").text();
            var sUrl = removeLineBreaks($(this).find("url").text());
            var sMD5 = $(this).find("materialid").text();
            var sUrlType = $(this).find("url").attr("linktype");
            var iNewFile = 1;
            try {
                iNewFile = parseInt($(this).find("new").text());
            }
            catch (ex) { iNewFile = 1; }
            if (isNaN(iNewFile)) iNewFile = 1;

            if (sUrlType == "core") {
                sUrl = "md/" + sUrl;
            }
            else if (sUrlType == "live") {
                //
            }
            else if ((sUrlType == "updatable") && ((media == "image") || (media == "video") || (media == "video2") || (media == "background"))) {
                arUpdatableFileList.push(sUrl);
                arUpdatableFileFlag.push(iNewFile);
                arUpdatableFileMD5.push(sMD5);
                arUpdatableFileMD5Result.push("1");
                sUrl = getUpdatableFolder() + getFilename(sUrl);
                if (sUrl.indexOf("/") == 0) {
                    sUrl = "file://" + sUrl;
                }
                else {
                    sUrl = "file:///" + sUrl;
                }
                //if (GetDeviceID() == "proto12345") sUrl = "md/" + getFilename(sUrl); //dev
                //alert(sUrl);
            }
            else {

            }

            //checking for video2 (not available for android)
            if ((GetDevicePlatformName() == "android") && (media == "video2")) {
                media = "video"; //convert to native video player
            }
            if ((media == "video2") && (GetDeviceID() == "proto12345")) {
                media = "video"; ////dev
            }

            if (media == "background") {
                var sBgColor = $(this).find("bgcolor").text();
                iBGCount++;
                if (iBGCount == 1) {
                    if (sUrl != "") {
                        sPreloadImages += "<img src='" + sUrl + "'>";  //preload image
                        res2 += "<img class='nocursor' src='" + sUrl + "?r=" + getRandomID(10) + "' srcori='" + sUrl + "' style='position:absolute; width: 100%; height: 100%;' alt='' onerror='this.src=\"md/black1px.png\"'>";
                    }
                    else {
                        res2 += "<div class='nocursor' style='width:100%;height:100%;background-color:" + sBgColor + ";'></div>";
                    }
                }
            }
            else if (media == "webview") {
                var sBgColor = $(this).find("bgcolor").text();
                var sName = "wv" + getRandomID(10);
                iWebVCount++;
                if (iWebVCount == 1) {
                    if (sUrl != "") {
                        res2 += "<div style='width:100%;height:100%;border:none;'><iframe src='" + sUrl + "' id='" + sName + "' name='" + sName + "' style='width:100%;height:100%;border:none;background-color:" + sBgColor + ";' sandbox='allow-forms allow-pointer-lock allow-same-origin allow-scripts' onload='onFrameLoaded(this)' onerror='onFrameError(this);'></iframe></div>";
                    }
                    else {
                        res2 += "<div class='nocursor' style='width:100%;height:100%;background-color:white;'></div>";
                    }
                }

            }
            else if (media == "movingtext") {
                var sBgColor = $(this).find("bgcolor").text();
                var sText = $(this).find("text").text();
                var sBorderThickness = $(this).find("border").text();
                var sBorderColor = $(this).find("border").attr("color");
                var sBgColor = $(this).find("background").text();
                var sFontColor = $(this).find("font").attr("color");
                var sFontSize = $(this).find("font").text();
                var dFontSize = 1.0;
                var sSpeed = $(this).find("speed").text();
                var sTransType = $(this).find("transtype").text();
                try {
                    dFontSize = parseFloat(sFontSize);
                    if (isNaN(dFontSize)) dFontSize = 100;
                    dFontSize = dFontSize / 100;
                }
                catch (ex) {
                    dFontSize = 1.0;
                }
                //res2 += "<table class='nocursor' border='0' width='100%' height='100%' style='font-size:" + dFontSize + "em; color:" + sFontColor + "; background-color:" + sBgColor + "; border:" + sBorderThickness + "px solid " + sBorderColor + ";'><tr><td><div class='marquee marquee-speed-slow' data-marquee='" + sText + "'></div></td></tr></table>";
                iMarqCount++;
                //if (iMarqCount == 1) res2 += "<div style='width: 100%; height: 100%; background-color: " + sBgColor + "; border: " + sBorderThickness + "px solid " + sBorderColor + "; color:" + sFontColor + ";'><h1 id='dvMQ" + iMarqCount + "Tx' style='height: 100%; color:" + sFontColor + "; visibility: hidden;' speed='" + sSpeed + "' transtype='" + sTransType + "' >" + sText + "</h1></div>";
                if (iMarqCount == 1) res2 += "<div style='width: 100%; height: 100%; background-color: " + sBgColor + "; -webkit-box-shadow:inset 0px 0px 0px " + sBorderThickness + "px " + sBorderColor + "; -moz-box-shadow:inset 0px 0px 0px " + sBorderThickness + "px " + sBorderColor + "; box-shadow:inset 0px 0px 0px " + sBorderThickness + "px " + sBorderColor + "; color:" + sFontColor + ";'><h1 id='dvMQ" + iMarqCount + "Tx' style='height: 100%; color:" + sFontColor + "; visibility: hidden;' speed='" + sSpeed + "' transtype='" + sTransType + "' >" + sText + "</h1></div>";

            }
            else if (media == "image") {
                var effect = $(this).find("effect").text();
                var transtype = $(this).find("transtype").text();
                var duration = $(this).find("duration").text();
                var startdate = $(this).find("startdate").text();
                var stopdate = $(this).find("stopdate").text();
                var starttime = $(this).find("starttime").text();
                var stoptime = $(this).find("stoptime").text();
                if (sUrl != "") {
                    iSlideCount++;

                    if (iSlideCount == 1) { // new mixed region, initialize it
                        iRegionMixedCount++;
                        RegionListAdd(regname, left, top, zindex, width, height);
                        res2 += "<img id='imgScreen" + iRegionMixedCount + "Top' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' /><img id='imgScreen" + iRegionMixedCount + "Bottom' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' />";
                    }

                    RegionPlaylistAdd(iRegionMixedCount - 1, sUrl, sUrlType, media, effect, transtype, duration, startdate, stopdate, starttime, stoptime);

                    sPreloadImages += "<img id='org" + iRegionMixedCount + "-" + iSlideCount + "' src='" + sUrl + "' regname='" + regname + "'>";  //preload image
                    
                    //res2 += "<img class='nocursor' src='" + sUrl + "?r=" + getRandomID(10) + "' srcori='" + sUrl + "' style='position:absolute; width: 100%; height: 100%;' alt='' onerror='this.src=\"md/black1px.png\"'>";
                }

            }
            else if (media == "video") {
                var effect = $(this).find("effect").text();
                var transtype = 1;
                var duration = 5000;
                var sFileType = "video/mp4";
                var startdate = $(this).find("startdate").text();
                var stopdate = $(this).find("stopdate").text();
                var starttime = $(this).find("starttime").text();
                var stoptime = $(this).find("stoptime").text();
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
                    sFileType = "video/mp4";
                }
                if (sUrl != "") {
                    if (iVideoCount < 1) {  //only allow 1 vid
                        iVideoCount++;
                        res2 += "<video style='position:absolute;visible:hidden;display:none;z-index:" + (3000 + zindex) + ";width:100%;height:100%;' " + effect + " id='vidObj1'  preload='auto'  poster='md/black1px.png' regname='" + regname + "' vidtype='native'>";
                        res2 += "<source id='vidSrc1' src='" + sUrl + "' type='" + sFileType + "'></video>";
                    }

                    iSlideCount++;

                    if (iSlideCount == 1) { // new mixed region, initialize it
                        iRegionMixedCount++;
                        RegionListAdd(regname, left, top, zindex, width, height);
                        res2 += "<img id='imgScreen" + iRegionMixedCount + "Top' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' /><img id='imgScreen" + iRegionMixedCount + "Bottom' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' />";
                    }

                    //alert("video > " + sUrl);
                    RegionPlaylistAdd(iRegionMixedCount - 1, sUrl, sUrlType, media, effect, transtype, duration, startdate, stopdate, starttime, stoptime);

                    //add a black screen after video
                    //iSlideCount++;
                    //RegionPlaylistAdd(iRegionMixedCount - 1, "md/black1px.png", "core", "image", "", "1", "1000");


                }

            }
            else if (media == "video2") {
                var effect = $(this).find("effect").text();
                var transtype = 1;
                var duration = 5000;
                var sFileType = "video/mp4";
                var startdate = $(this).find("startdate").text();
                var stopdate = $(this).find("stopdate").text();
                var starttime = $(this).find("starttime").text();
                var stoptime = $(this).find("stoptime").text();
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
                    sFileType = "video/mp4";
                }
                if (sUrl != "") {
                    if (iVideoCount < 1) {  //only allow 1 vid
                        iVideoCount++;
                        res2 += "<video style='position:absolute;visible:hidden;display:none;z-index:" + (3000 + zindex) + ";width:100%;height:100%;' " + effect + " id='vidObj1'  preload='auto'  poster='md/black1px.png' regname='" + regname + "' vidtype='vlc'>";
                        res2 += "<source id='vidSrc1' src='" + sUrl + "' type='" + sFileType + "'></video>";
                        try {
                            window.external.VLCPlayerDimension(left, top, width, height);
                        }
                        catch (ex) { }
                    }

                    iSlideCount++;

                    if (iSlideCount == 1) { // new mixed region, initialize it
                        iRegionMixedCount++;
                        RegionListAdd(regname, left, top, zindex, width, height);
                        res2 += "<img id='imgScreen" + iRegionMixedCount + "Top' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' /><img id='imgScreen" + iRegionMixedCount + "Bottom' src='md/trans.gif' alt='' onerror='SlideOnError(this);' onload='SlideOnLoad(this);' regname='" + regname + "' />";
                    }

                    //alert("video2 > " + sUrl);
                    RegionPlaylistAdd(iRegionMixedCount - 1, sUrl, sUrlType, "video", effect, transtype, duration, startdate, stopdate, starttime, stoptime);

                    //add a black screen after video
                    //iSlideCount++;
                    //RegionPlaylistAdd(iRegionMixedCount - 1, "md/black1px.png", "core", "image", "", "1", "1000");

                }

            }
            

        });


        //main loop===========================================================================================================================================

        res1 += (res2 + "</div>");
        res2 = "";


    });


    //showPrepDisplay(res1);
    
    if (redownloadfiles == true) {

        //show prep display first for download files
        showPrepDisplay(res1);
    }

    else {
        //no download necessary
        sDisplayContent = res1;
        //$("#spRegions").html(res1);
        runDisplay2();

    }
    
    
    
    
}

function MarqueeRun() {
    //run marquee
    for (var iLp = 1; iLp < 21; iLp++) {
        try {
            $("#dvMQ" + iLp + "Tx").fitText(0.7);
            $("#dvMQ" + iLp + "Tx").css("visibility", "visible");
            $("#dvMQ" + iLp + "Tx").marquee({ leftToRight: true, count: 1, speed: 10 }).done(MarqueeStop);
        }
        catch (ex) { }
    }
}

function MarqueeStop(e) {
    //alert(e[0].id);
    $('#' + e[0].id).marquee({ leftToRight: true, count: 1, speed: 10 }).done(MarqueeStop);
}



function onFrameLoaded(frm) {
    //var iframeDocument = frm.contentDocument || frm.contentWindow.document;
    //alert(iframeDocument)
}

function onFrameError() {
    MAlert("error");
}

function SetDeviceID(did) {
    sDeviceID = did;
    try {
        $("#spSTBIDLogin").html(sDeviceID);
        $("#spSTBIDLogin2").html(sDeviceID);

        try {
            window.localStorage.setItem('deviceid', sDeviceID);
        }
        catch (e2) { }
        if (sDevicePlatform == "windows") {
            try {
                window.external.SetLocalStorage('deviceid', sDeviceID);
            }
            catch (e2) { }
        }
    } catch (ex) { }
}

function SetDevicePlatform(dplatform, dplatformversion) {
    sDevicePlatform = dplatform;
    sDevicePlatformVersion = dplatformversion;
}

function GetDeviceID() {
    //if (sDeviceID == "") sDeviceID = "proto12345";
    //if ((typeof window.external.VLCPlayerStop == "undefined") && (sDevicePlatform == "windows")) sDeviceID = "proto12345";
    return sDeviceID;
}

function GetDevicePlatformName() {
    return sDevicePlatform;
}

function GetDevicePlatformVersion() {
    //if (sDevicePlatformVersion == "") sDevicePlatformVersion = "7";
    return sDevicePlatformVersion;
}

function ShowDownloadPercentage(percent) {
    $("#spPrepPercent").html("(" + percent + "%)");
}

//===============================================================================================
var textlogtry = 0;
var textlogireqtag = "0";
var textlogfname = "";
var textlogmime = "";

function getTextLog(ireqtag, fname){
    try {
        var fpath = getTextLogFolder();
        var filefullname = fpath + fname + ".txt";
        if (fpath != "") {
            //alert(filefullname);
            //return;
            if (sDevicePlatform == "android") {
                textlogtry = 0;
                textlogireqtag = "" + ireqtag;
                textlogfname = filefullname;
                textlogmime = "text/plain";
                uploadFile(filefullname, ireqtag, "text/plain");
            }
            else if (sDevicePlatform == "windows") {
                var oURL = getURLLocation(sXMLUrl);
                var res2 = window.external.HttpUploadFile("http://" + oURL.host + "/sendlog.php", filefullname, "bindata", "text/plain", GetDeviceID(), "" + ireqtag, getRandomID(10));
                //var res2 = "error";
                if (res2.indexOf("error") < 0) {
                    //success
                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Upload text log success!");
                }
                else {
                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Upload text log failed! Message: " + res2);
                }
            }
            if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/Upload text log " + filefullname + ".txt success!");
        }
        else {
            if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get text log " + filefullname + " failed!");
        }
    }
    catch(ex){
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get text log failed! " + ex.message);
    }
    if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
}


function getScreenShot(ireqtag) {
    //alert("taking screenshot");
    try {

        if (sDevicePlatform == "android") {
            //pause videos first?
            //$('.vidobj').get(0).pause();
            navigator.screenshot.save(function (error, res) {
                if (error) {
                    //alert(error);
                    //alert("Screenshot failed!");
                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed!");
                } else {
                    //alert('Saved as ' + res.filePath); //should be path/to/myScreenshot.jpg
                    try{
                        uploadFile(res.filePath, ireqtag, "image/jpeg");
                        //alert("Successfuly uploaded " + res.filePath); //async, alert on callback
                    }
                    catch (ex) { if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed! " + ex.message); }
                }
            }, 'jpg', 80, '' + getTodayNum() + getTimeStr());
        }
        else if (sDevicePlatform == "windows") {
            try{
                var res = window.external.GetScreenShot("" + getTodayNum() + getTimeStr() + ".jpg");
                if (res.indexOf("error")  < 0) {
                    //alert("Saved as " + res);
                    //uploadFile(res);
                    var oURL = getURLLocation(sXMLUrl);

                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot success!");
                    var res2 = window.external.HttpUploadFile("http://" + oURL.host + "/sendlog.php", res, "bindata", "image/jpeg", GetDeviceID(), "" + ireqtag, getRandomID(10));
                    if (res2.indexOf("error") < 0) {
                        //success
                        //alert("Successfuly uploaded " + res);
                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Upload screenshot success!");
                    }
                    else {
                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed!");
                    }
                }
                else
                {
                    //alert("Screenshot failed!");
                    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed!");
                }
            }
            catch (ex) {
                if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed! " + ex.message);
            }

            if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
        }

        //

        //alert("screenshot done");
    }
    catch (e) {
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Get screenshot failed! " + e.message);
    }
}

function uploadFile(fname, ireqtag, mime) {

    var options = new FileUploadOptions();
    options.fileKey = "bindata";
    options.fileName = fname; //getFilenameFromURL(fname);
    options.mimeType = mime;

    var params = {};
    params.act = "sendlog";
    params.deviceid = GetDeviceID(); // ;"e8377cca3c5311b59410861273249c30";
    params.reqtag = "" + ireqtag;
    params.r = getRandomID(10);

    options.params = params;
    options.chunkedMode = false;

    try {

        var oURL = getURLLocation(sXMLUrl);
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Uploading " + fname + " to http://" + oURL.host + "/sendlog.php");
        var ft = new FileTransfer();

        ft.upload(fname, "http://" + oURL.host + "/sendlog.php", win, fail, options);
    }
    catch (ex) {
        if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
    }

    function win() {
        //alert("Successfuly uploaded " + fname);
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Upload file success!");
        if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
    }
    function fail(er) {
        //alert("not bro");
        if (er.code == 1) {
            textlogtry++;
            if (textlogtry == 1) {
                //first time
                //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, failFS);
                //downloadFile("log/notfound.txt");
                //writeToFile("notfound.txt", "404");
                uploadFile(getAppStorageFolder() + "notfound.txt", textlogireqtag, textlogmime);
                return;
            }
        }
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Upload file failed! code = " + er.code);
        if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 17000);
    }

}

function showInfo() {
    MAlert("cordova.file.externalApplicationStorageDirectory = " + cordova.file.externalApplicationStorageDirectory);
}


function getFilename(furl) {
    try {
        return furl.replace(/^.*[\\\/]/, '');
    }
    catch (ex) {
        return furl;
    }
}

function deleteCache() {
    try {
        var sPath = cordova.file.externalApplicationStorageDirectory;
        sPath = sPath.replace("file://", "") + "cache/";
        clearDirectory(sPath);
    }
    catch (ex) {
        //alert(ex.message);
    }
}

function clearDirectory(dir) {
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    }
    catch (e) { }
    function fail(evt) {
        //alert("FILE SYSTEM FAILURE" + evt.target.error.code);
    }
    function onFileSystemSuccess(fileSystem) {
        fileSystem.root.getDirectory(
             dir,
            { create: true, exclusive: false },
            function (entry) {
                entry.removeRecursively(function () {
                    //alert("Remove Recursively Succeeded");
                }, fail);
            }, fail);
    }
}

var sDisplayContent = "";

function showPrepDisplay(sdisplay) {
    try {
        sDisplayContent = sdisplay;
        $("#spRegions").html($("#dvPrepScreen").html());
        iUpdatableDownloadCounter = 0;
        bDownloadFailed = false;
        $("#spPrepInfo").html("");
        $("#spPrepStatus").html("Downloading files...");
        $("#spPrepFiles").html("" + (iUpdatableDownloadCounter + 1) + "/" + arUpdatableFileList.length);
        
        arFileExistAnd = [];

        if (GetDevicePlatformName() == "windows") {
            startDownload(iUpdatableDownloadCounter);
        }
        else if (GetDevicePlatformName() == "android") {
            checkFileExistAndroid(iUpdatableDownloadCounter);
        }

        
    }
    catch (ex) {
        MAlert(ex.message);
    }

    //$("#spRegions").html(sdisplay);
    //intervalID = setInterval("runSlideShows()", iTimerDuration);

    //runVideos();

    //$(".dvReset").css("visibility", "hidden");
    //$(".dvReset").css("display", "none");
}

var arFileExistAnd = [];
function checkFileExistAndroid(count) {
    if (count < arUpdatableFileList.length) {
        var localfname = getFilenameFromURL(arUpdatableFileList[count]);
        localfname = "file:///" + getUpdatableFolder() + localfname;
        checkIfFileExists(localfname, count);
        iUpdatableDownloadCounter++;
        checkFileExistAndroid(iUpdatableDownloadCounter);
    }
    else {
        iUpdatableDownloadCounter = 0;
        setTimeout("startDownload(" + iUpdatableDownloadCounter + ");", 2000);
    }
}

function startDownload(count) {
    if (count < arUpdatableFileList.length) {
        bDownloading = true;
        setDownloadingStatus();
        $("#spPrepPercent").html("(0%)");
        ////check file exist and new flag
        var bFileExist = false;
        var bFileNew = true;
        try {
            bFileExist = FileUpdatableExist(arUpdatableFileList[count], count);
            //MAlert("" + arUpdatableFileList[count] + " " + ((arFileExistAnd[count]) ? "exist" : "not exist"));
        }
        catch (ex) { }
        try {
            bFileNew = (arUpdatableFileFlag[count] == 0) ? false : true;  //1 = new file
        }
        catch (ex) { }

        if (bFileNew || !bFileExist) {
            //MAlert("bFileNew=" + ((bFileNew) ? "True" : "False") + ", bFileExist=" + ((bFileExist) ? "True" : "False") + ", DOWNLOAD: " + getFilenameFromURL(arUpdatableFileList[count]));
            downloadFile(arUpdatableFileList[count]);
        }
        else {
            //MAlert("bFileNew=" + ((bFileNew) ? "True" : "False") + ", bFileExist=" + ((bFileExist) ? "True" : "False") + ", IGNORE: " + getFilenameFromURL(arUpdatableFileList[count]));
            $("#spPrepInfo").html($("#spPrepInfo").html() + "<br/>" + getFilenameFromURL(arUpdatableFileList[count]) + "&nbsp;<font style='color:yellow'>Exist</font>");

            //check md5
            var sLocalFilename = getFilenameFromURL(arUpdatableFileList[iUpdatableDownloadCounter]);
            sLocalFilename = getUpdatableFolder() + sLocalFilename;
            var bMD5Ok = MatchMD5(sLocalFilename, arUpdatableFileMD5[iUpdatableDownloadCounter], iUpdatableDownloadCounter);
            if (GetDevicePlatformName() == "windows") {
                if (bMD5Ok) {
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><font style='color:purple'>MD5 SUCCESS</font>");
                    //for windows platform
                    arUpdatableFileMD5Result[iUpdatableDownloadCounter] = "1";
                }
                else {
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><font style='color:purple'>MD5 FAILED</font>");
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><font style='color:purple'>" + sLocalFilename + "</font>");
                    //for windows platform
                    arUpdatableFileMD5Result[iUpdatableDownloadCounter] = "0";
                }
            }

            iUpdatableDownloadCounter++;

            if (iUpdatableDownloadCounter < arUpdatableFileList.length) {
                $("#spPrepFiles").html("" + (iUpdatableDownloadCounter + 1) + "/" + arUpdatableFileList.length);
                startDownload(iUpdatableDownloadCounter);
            }
            else {
                $("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><br/>Validating Files...");
                if (!bDownloadFailed) setTimeout("runDisplay();", 10000); //3000
            }

            
        }

    }
    else {
        //done downloading all files in array
        if (bDownloadFailed == false) {
            //$("#spPreLoadImages").html(sPreloadImages);
            //download success
            if (arUpdatableFileList.length == 0) {
                $("#spPrepInfo").html("");
                $("#spPrepStatus").html("Loading...");
                $("#spPrepFiles").html("");
                $("#spPrepPercent").html("");
                setTimeout("runDisplay();", 10000); //3000      
                
            }
            //setTimeout("runDisplay();", 3000);
        }
        else {
            //download failed
            //show reset button
            
            iRetryCount = 5;
            $("#btnReset2").css("visibility", "visible");
            $("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><br/>Retrying in " + iRetryCount + " second...");
            setTimeout("retryDownload();", 2000);

            //bFirstLoad = true;
            //deleteXMLDataStringFromStorage();
            //sBufferXMLData = "";
            //$("#btnReset2").css("visibility", "visible");
        }
    }
}

var iRetryCount = 5;
function retryDownload() {
    iRetryCount--;
    if (iRetryCount < 2) {
        $("#btnReset2").css("visibility", "hidden");
    }
    else {
        $("#btnReset2").css("visibility", "visible");
    }
    if (iRetryCount <= 0) {
        $("#spPrepInfo").html("");
        loadLayoutFromStorage(true);
    }
    else {
        $("#spPrepInfo").html($("#spPrepInfo").html() + "<br/>Retrying in " + iRetryCount + " second...");
        setTimeout("retryDownload();", 2000);
    }
}

function runDisplay() {
    //check md5
    bDownloading = false;
    setDownloadingStatus();
    var iMD5FailedCount = 0;
    for (var lp = 0; lp < arUpdatableFileMD5Result.length; lp++) {
        if (arUpdatableFileMD5Result[lp] == "0") {
            iMD5FailedCount++;
            //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + arUpdatableFileList[lp] + " MD5 Gagal");
        }
        else {
            //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + arUpdatableFileList[lp] + " MD5 Berhasil");
        }
    }
    if (iMD5FailedCount > 0) {
        //gagal md5 check
        $("#spRegions").html("<div style='width:100%;height:100%;background-color:black;'><center><h1 style='color:white;'><br/><br/><br/><br/><br/>Invalid content detected, please reset device!</h1></center></div>");
        $(".dvReset").css("visibility", "visible");
        $(".dvReset").css("display", "block");
        return;
    }

    setTimeout("runDisplay2();", 5000);
}

function runDisplay2() {


    $("#spRegions").html(sDisplayContent);
    $("#spPreLoadImages").html(sPreloadImages);
    setTimeout("MarqueeRun();", 5000);
    setTimeout("setKeyPress();", 5000);
    SetFirstImageForMixedContent();
    iMixedContentTimerID = setInterval("MixedContentTimer();", 100);
    //intervalID = setInterval("runSlideShows()", iTimerDuration);
    //runVideos();
    runCheckVersionTimer();
    $(".dvReset").css("visibility", "visible");
    $(".dvReset").css("display", "block");
}

function SetFirstImageForMixedContent() {
    try {
        for (var lp = 0; lp < listRegion.length; lp++) {
            //$("#imgScreen" + (lp + 1) + "Top").attr("src", listRegion[lp].playlist[0].url);



            //check license for current material
            var reg = listRegion[lp];
            var currentPlaylistIndex = reg.playlistIndex;
            var iMatStartDate = 0;
            var iMatStopDate = 0;
            var iMatStartTime = 0;
            var iMatStopTime = 0;
            var iCheckTry = 100;
            while (iCheckTry > 0) {  //limit check try to avoid unlimited loop
                try {
                    iMatStartDate = parseInt(reg.playlist[currentPlaylistIndex].startdate, 10);
                    iMatStopDate = parseInt(reg.playlist[currentPlaylistIndex].stopdate, 10);
                    try {
                        iMatStartTime = parseInt(reg.playlist[currentPlaylistIndex].starttime, 10);
                        iMatStopTime = parseInt(reg.playlist[currentPlaylistIndex].stoptime, 10);
                    }
                    catch (ex) {
                        iMatStartTime = 0;
                        iMatStopTime = 0;
                    }
                    var iCurrentDate = getTodayNum();
                    var iCurrentTime = parseInt(getTimeStr(), 10);
                    if (isNaN(iMatStartDate)) iMatStartDate = 0;
                    if (isNaN(iMatStopDate)) iMatStopDate = 0;
                    if (isNaN(iMatStartTime)) iMatStartTime = 0;
                    if (isNaN(iMatStopTime)) iMatStopTime = 0;
                    if (iMatStartTime > iMatStopTime) {
                        //in case of 22:00 to 03:00 for example and current time is 23:00
                        if ((iCurrentTime < iMatStopTime) && (iCurrentTime >= 0)) iCurrentTime += 240000;
                        iMatStopTime += 240000;
                    }
                    if ((iMatStartTime == 0) && (iMatStopTime)) {
                        //starttime dan stoptime is not defined
                        iMatStartTime = 0;
                        iMatStopTime = 235959;
                    }

                    if (((iCurrentDate >= iMatStartDate) && (iCurrentDate <= iMatStopDate)) && ((iCurrentTime >= iMatStartTime) && (iCurrentTime <= iMatStopTime))) {
                        //valid dates
                        $("#imgScreen" + (lp + 1) + "Top").attr("src", listRegion[lp].playlist[0].url);
                    }
                    else {
                        //invalid dates
                        //MAlert("invalid dates");
                        $("#imgScreen" + (lp + 1) + "Top").attr("src", "md/black1px.png");
                    }
                }
                catch (ex) { }
                iCheckTry--;
            }
            if (iCheckTry == 0) {  //failed check don't change anything, process next material
                //continue;
            }

        }
    }
    catch (ex) {

    }

    try{
        var vidObj = document.getElementById("vidObj1");
        vidObj.addEventListener("ended", VideoEnded1);
    }
    catch (ex) {

    }
}

function VideoStart(furl) {
    try {
        isVideoEnded = false;
        isVideoPlaying = true;
        if ($("#vidObj1").attr("vidtype") == "vlc") {
            //this is for vlc player
            //MAlert(furl);
            try {
                if (GetDevicePlatformName() == "windows") {
                    window.external.VLCPlayerAddFile(furl);
                    window.external.VLCPlayerStart();
                }
            }
            catch (e) { setTimeout("VideoEnded1();", 1000); }
        }
        else {
            $("#vidObj1").css("visibility", "visible");
            $("#vidObj1").css("display", "block");
            //$("#vidObj1").css("z-index", "3000");
            var vidObj = document.getElementById("vidObj1");
            var vidSrc = document.getElementById("vidSrc1");
            vidSrc.src = furl;
            vidObj.addEventListener("ended", VideoEnded1);

            vidObj.load();
            vidObj.play();
        }
        try {
            WriteTextLog("" + $("#vidObj1").attr("regname") + "|" + getFilenameFromURL(furl) + "|success");
        } catch (ex) { }
        
    }
    catch (ex) {
        //isVideoEnded = false;
        //isVideoPlaying = true;
    }
}

function VideoEnded1() {
    $("#vidObj1").css("visibility", "hidden");
    isVideoEnded = true;
    isVideoPlaying = false;
    try {
        if (GetDevicePlatformName() == "windows") {
            window.external.VLCPlayerStop();
        }
    }
    catch (e) { }
}

var isVideoPlaying = false;
var isVideoEnded = false;

function MixedContentTimer() {
    //if (isVideoPlaying) return;
    //$("#vidObj1").css("z-index", "99999");
    //$("#vidObj1").css("visibility", "visible");
    //$("#vidObj1").css("display", "block");
    try {
        for (var lp = 0; lp < listRegion.length; lp++) {
            try{
                var reg = listRegion[lp];
                var currentPlaylistIndex = reg.playlistIndex;

                //check license for current material
                var iMatStartDate = 0;
                var iMatStopDate = 0;
                var iMatStartTime = 0;
                var iMatStopTime = 0;
                var iCheckTry = 100;
                while (iCheckTry > 0) {  //limit check try to avoid unlimited loop
                    try {
                        iMatStartDate = parseInt(reg.playlist[currentPlaylistIndex].startdate, 10);
                        iMatStopDate = parseInt(reg.playlist[currentPlaylistIndex].stopdate, 10);
                        try {
                            iMatStartTime = parseInt(reg.playlist[currentPlaylistIndex].starttime, 10);
                            iMatStopTime = parseInt(reg.playlist[currentPlaylistIndex].stoptime, 10);
                        }
                        catch (ex) {
                            iMatStartTime = 0;
                            iMatStopTime = 0;
                        }
                        var iCurrentDate = getTodayNum();
                        var iCurrentTime = parseInt(getTimeStr(), 10);
                        if (isNaN(iMatStartDate)) iMatStartDate = 0;
                        if (isNaN(iMatStopDate)) iMatStopDate = 0;
                        if (isNaN(iMatStartTime)) iMatStartTime = 0;
                        if (isNaN(iMatStopTime)) iMatStopTime = 0;
                        if (iMatStartTime > iMatStopTime) {
                            //in case of 22:00 to 03:00 for example and current time is 23:00
                            if ((iCurrentTime < iMatStopTime) && (iCurrentTime >= 0)) iCurrentTime += 240000;
                            iMatStopTime += 240000;
                        }
                        if ((iMatStartTime == 0) && (iMatStopTime)) {
                            //starttime dan stoptime is not defined
                            iMatStartTime = 0;
                            iMatStopTime = 235959;
                        }

                        if (((iCurrentDate >= iMatStartDate) && (iCurrentDate <= iMatStopDate)) && ((iCurrentTime >= iMatStartTime) && (iCurrentTime <= iMatStopTime))) {
                            //valid dates
                            //do nothing
                            //MAlert("test");
                        }
                        else {
                            //invalid dates
                            //MAlert("invalid dates");
                            //set timer = duration then continue
                            if (reg.playlist[currentPlaylistIndex].media == "video") reg.playlist[currentPlaylistIndex].timer = reg.playlist[currentPlaylistIndex].duration;
                            //$("#imgScreen" + (lp + 1) + "Top").attr("src", "md/black1px.png");
                            //continue;
                        }
                    }
                    catch (ex) { }
                    iCheckTry--;
                }
                if (iCheckTry == 0) {  //failed check don't change anything, process next material
                    //continue;
                }


                if ((reg.playlist[currentPlaylistIndex].timer <= reg.playlist[currentPlaylistIndex].duration) && (!isVideoEnded)) {
                    //timer still under duration
                    reg.playlist[currentPlaylistIndex].timer += 100;
                    if ((reg.playlist[currentPlaylistIndex].media == "video") && (reg.playlist[currentPlaylistIndex].timer > 1000)) {
                        if (isVideoPlaying == false) {
                            //play vid
                            VideoStart(reg.playlist[currentPlaylistIndex].url);
                            //setTimeout("VideoStart('" + reg.playlist[currentPlaylistIndex].url + "');", 200);
                        }
                        //isVideoPlaying = true;
                        reg.playlist[currentPlaylistIndex].timer = 1500; //play vid until it finished (ignore duration)
                    }
                }
                else {
                    //change display
                    reg.playlist[currentPlaylistIndex].timer = 0; //reset timer
                    
                    var nextPlaylistIndex = currentPlaylistIndex + 1;
                    var iMatStartDate = 0;
                    var iMatStopDate = 0;
                    var iMatStartTime = 0;
                    var iMatStopTime = 0;
                    var iCheckTry = 100;

                    /*if (nextPlaylistIndex >= reg.playlist.length) {
                        reg.playlistIndex = 0;
                        nextPlaylistIndex = 0;
                    }
                    else {
                        reg.playlistIndex = nextPlaylistIndex;
                    }*/

                    //check datetime license for the next material
                    //MAlert("startdate=" + reg.playlist[nextPlaylistIndex].startdate + " , stopdate=" + reg.playlist[nextPlaylistIndex].stopdate);
                    //MAlert("starttime=" + reg.playlist[nextPlaylistIndex].starttime + " , stoptime=" + reg.playlist[nextPlaylistIndex].stoptime);
                    
                    while (iCheckTry > 0) {  //limit check try to avoid unlimited loop
                        try {
                            if (nextPlaylistIndex >= reg.playlist.length) nextPlaylistIndex = 0;
                            iMatStartDate = parseInt(reg.playlist[nextPlaylistIndex].startdate, 10);
                            iMatStopDate = parseInt(reg.playlist[nextPlaylistIndex].stopdate, 10);
                            try {
                                iMatStartTime = parseInt(reg.playlist[nextPlaylistIndex].starttime, 10);
                                iMatStopTime = parseInt(reg.playlist[nextPlaylistIndex].stoptime, 10);
                            }
                            catch (ex) {
                                iMatStartTime = 0;
                                iMatStopTime = 0;
                            }
                            var iCurrentDate = getTodayNum();
                            var iCurrentTime = parseInt(getTimeStr(), 10);
                            if (isNaN(iMatStartDate)) iMatStartDate = 0;
                            if (isNaN(iMatStopDate)) iMatStopDate = 0;
                            if (isNaN(iMatStartTime)) iMatStartTime = 0;
                            if (isNaN(iMatStopTime)) iMatStopTime = 0;
                            if (iMatStartTime > iMatStopTime) {
                                //in case of 22:00 to 03:00 for example and current time is 23:00
                                if ((iCurrentTime < iMatStopTime) && (iCurrentTime >= 0)) iCurrentTime += 240000;
                                iMatStopTime += 240000;
                            }
                            if ((iMatStartTime == 0) && (iMatStopTime)) {
                                //starttime dan stoptime is not defined
                                iMatStartTime = 0;
                                iMatStopTime = 235959;
                            }
                            
                            if (((iCurrentDate >= iMatStartDate) && (iCurrentDate <= iMatStopDate)) && ((iCurrentTime >= iMatStartTime) && (iCurrentTime <= iMatStopTime))) {
                                //valid dates
                                reg.playlistIndex = nextPlaylistIndex;
                                //MAlert("valid dates");
                                break;
                            }
                            else {
                                //invalid dates, try next material
                                //MAlert("invalid dates");
                                nextPlaylistIndex++;
                            }
                        }
                        catch (ex) { }
                        iCheckTry--;
                    }
                    if (iCheckTry == 0) {  //failed check, don't change anything
                        nextPlaylistIndex = currentPlaylistIndex;
                        reg.playlistIndex = nextPlaylistIndex;
                    }

                    //only 1 slide is valid
                    if ((nextPlaylistIndex == currentPlaylistIndex) && (reg.playlist[nextPlaylistIndex].media == "image")) {
                        continue;
                    }

                    if (reg.playlist[nextPlaylistIndex].media == "image") {
                        if (reg.playlist[currentPlaylistIndex].media == "video") {
                            FadeTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z);
                            isVideoEnded = false;
                            $("#vidObj1").css("visibility", "hidden");
                            $("#vidObj1").css("display", "none");
                        }
                        else {
                            
                            switch (reg.playlist[nextPlaylistIndex].transtype) {
                                case 1: FadeTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //fade
                                case 2: LeftToRight("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //leftright
                                case 3: RightToLeft("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //rightleft
                                case 4: TopToBottom("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //topdown
                                case 5: BottomToTop("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //bottomup
                                case 6: ShrinkTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //shrink
                                case 7: ClipTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //clip
                                default: FadeTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "org" + (lp + 1) + "-" + (nextPlaylistIndex + 1), reg.z); break; //fade
                            }
                        }
                    }
                    else if (reg.playlist[nextPlaylistIndex].media == "video") {
                        if (reg.playlist[currentPlaylistIndex].media == "video") {
                            //do nothing, let the next video starts
                            reg.playlist[currentPlaylistIndex].timer = 0;
                            reg.playlist[nextPlaylistIndex].timer = 0;
                            isVideoPlaying = false;
                            isVideoEnded = false;
                        }
                        else {
                            FadeTo("imgScreen" + (lp + 1), "org" + (lp + 1) + "-" + (currentPlaylistIndex + 1), "imgBlack", reg.z);
                        }
                    }

                }
            }
            catch (ex1) {

            }
        }  //close for loop
    }
    catch (ex2) {

    }
}

function setKeyPress() {
    try {
        $("#mkey").keypress(function (event) {
            if (event.which == 27) {
                //ESC
                //MAlert("ESC");
            }
            else if (event.which == 96) {
                //tilde
                initContent();
            }
            else if (event.which == 42) {
                //star (numkey)
                initContent();
            }
            else {
                return;
            }

            event.preventDefault();

        });
        $("#mkey").focus();
    } catch (e) { }
}

function runCheckVersionTimer() {
    if (sOnlineMode == "Offline") {
        //offline no need to check version?
    }
    else {
        if (iVersionCheckTimer != -1) {
            clearInterval(iVersionCheckTimer);
        }
        iVersionCheckTimer = setInterval("CheckVersion()", 30000);
    }
}

function CheckVersion() {
    //alert("checking " + sXMLUrl + " currentversion=" + iXMLVersionNumber);
    if (iShowDebugLog == 1) {
        $("#spDebugDisplay").html("");
        $("#dvDebugDisplay").removeClass("debughide").addClass("debugok");
    }

    try {
        var sUpdatedURL = sXMLUrl;
        //if ((sXMLUrl.indexOf("http://") > -1) && (sXMLUrl.indexOf("?r=") < 0)) sUpdatedURL += "?r=" + getRandomID(10);
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Getting " + sUpdatedURL + " ...");


        //var oData = getXMLDataStringFromURL(sUpdatedURL);

        //==check getlayoutver.php first, if version NOT changed => exit
        var oURL = getURLLocation(sXMLUrl);

        //alert("protocol=" + oURL.protocol + ", host=" + oURL.host + ", hostname=" + oURL.hostname + ", port=" + oURL.port + ", pathname=" + oURL.pathname + ", search=" + oURL.search + ", hash=" + oURL.hash);
        //return;
        getJSONDataStringFromURLAsync("http://" + oURL.host + "/getlayoutver.php", "act=getlayoutver&deviceid=" + GetDeviceID() + "&layoutid=" + sLayoutID + "&r=" + getRandomID(10), 1);





    }
    catch (e) {

    }
    if (iShowDebugLog == 1) setTimeout("$('#dvDebugDisplay').removeClass('debugok').addClass('debughide');", 7000);
}

function toggleDebugLog() {
    iShowDebugLog = iShowDebugLog * -1;
    if (iShowDebugLog == 1) MAlert("Now showing debug log");
    else {
        $('#dvDebugDisplay').removeClass('debugok').addClass('debughide');
        MAlert("Now hiding debug log");
    }
}

function CheckHB() {
    return getRandomID(10);
}