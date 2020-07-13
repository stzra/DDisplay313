

function getTodayNum() {
    var arMonth = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    var arDay = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
    var dtNow = new Date();
    var iResult = 0;
    var sNow = "";
    sNow = "" + dtNow.getFullYear() + "" + arMonth[dtNow.getMonth()] + "" + arDay[dtNow.getDate()];
    try{
        iResult = parseInt(sNow, 10);
    }
    catch (e) {
        iResult = 0;
    }
    if (isNaN(iResult)) iResult = 0;
    return iResult;
}

function getTimeStr() {
    var arTime = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60"];
    var dtNow = new Date();
    var sNow = "";
    sNow = "" + arTime[dtNow.getHours()] + "" + arTime[dtNow.getMinutes()] + "" + arTime[dtNow.getSeconds()];
    return sNow;
}

function getRandomID(leng) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < leng; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function MAlert(txt) {
    if (GetDevicePlatformName() == "windows") {
        try{
            window.external.Alert(txt);
        }
        catch (ex) {
            alert(txt);
        }
    }
    else if (GetDevicePlatformName() == "android") {
        alert(txt);
    }
}

function MConfirm(txt) {
    var res = false;
    if (GetDevicePlatformName() == "windows") {
        try {
            res = (window.external.Confirm(txt) == 0) ? false : true;
        }
        catch (ex) {
            res = confirm(txt);
        }
    }
    else if (GetDevicePlatformName() == "android") {
        res = confirm(txt);
    }

    return res;
}


function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function removeLineBreaks(str) {
    var temp = str.replace(/(\r\n|\n|\r)/gm, "");
    temp = replaceAll(temp, "%20", "");
    temp = replaceAll(temp, " ", "");
    return temp;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


function getURLLocation(urls) {
    var match = urls.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: urls,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

function getFilenameFromURL(url) {
    var filename = url;
    try{
        filename = url.substring(url.lastIndexOf('/') + 1);
    }
    catch (ex) {

    }
    return filename;
}

function FileUpdatableExist(fname, count) {
    var localfname = getFilenameFromURL(fname);
    //localfname = "file:///" + getUpdatableFolder() + localfname;
    /*
    if (GetDevicePlatformName() == "windows") {
        localfname = "update/" + localfname;
    }
    else if (GetDevicePlatformName() == "android") {
        localfname = "files/" + localfname;
    }
    try {
        if (localfname.fileExist()) {
            return true;
        }
        else {
            return false;
        }
    } catch (ex) {
        MAlert(ex.message);
        return false;
    }
    */

    if (GetDevicePlatformName() == "windows") {
        return window.external.FileExist(localfname);
    }
    else if (GetDevicePlatformName() == "android") {
        return arFileExistAnd[count];
        /*
        //localfname = "files/" + localfname;
        localfname = "file:///" + getUpdatableFolder() + localfname;
        try {
            //if (localfname.fileExist()) {
            //    return true;
            //}
            //else {
            //    return false;
            //}
            MAlert("before:  " + localfname);
            checkIfFileExists(localfname);
        } catch (ex) {
            MAlert(ex.message);
            return false;
        }*/
    }

    //localfname = getAppStorageFolder() + localfname;
    //MAlert(localfname);
    return false;
}

function checkIfFileExists(path, count) {
    // path is the full absolute path to the file.
    //window.resolveLocalFileSystemURL(path, fileExists, fileDoesNotExist);
    window.resolveLocalFileSystemURL(path, function (fileEntry) {
        //alert("File " + fileEntry.fullPath + " exists!");
        //MAlert("arFileExistAnd[" + count + "] = true");
        arFileExistAnd[count] = true;
    }, function () {
        //alert("file does not exist");
        //MAlert("arFileExistAnd[" + count + "] = false");
        arFileExistAnd[count] = false;
    });
}
/*
function fileExists(fileEntry) {
    alert("File " + fileEntry.fullPath + " exists!");
}
function fileDoesNotExist() {
    alert("file does not exist");
}*/

function getAppStorageFolder() {
    var sResult = "";
    if (sDevicePlatform == "android") {
        try {
            var sPath = cordova.file.externalApplicationStorageDirectory;
            sResult = sPath.replace("file://", "") + "files/";  // sudah ada / di belakang
            //var sFilename = sFileUrl.replace(/^.*[\\\/]/, '');
            //sPath + sFilename,
            //"/storage/emulated/0/Android/data/com.demo.ddisplay/files/"
        }
        catch (ex) {
            MAlert(ex.message);
        }
    }
    return sResult;
}

function getTextLogFolder() {
    var sResult = "";
    if (sDevicePlatform == "android") {
        try {
            var sPath = cordova.file.externalApplicationStorageDirectory;
            sResult = sPath.replace("file://", "") + "files/";  // sudah ada / di belakang
        }
        catch (ex) {
            MAlert(ex.message);
        }
    }
    else if (sDevicePlatform == "windows") {
        try {
            //sResult = "/update/"; //window.external.GetUpdatableFolder();
            sResult = window.external.GetTextLogFolder();
        }
        catch (ex) {
            //alert(ex.message);
            sResult = "/log/";
        }
    }
    else {
        //
    }

    return sResult;
}

function getUpdatableFolder() {
    var sResult = "";
    if (sDevicePlatform == "android") {
        try {
            var sPath = cordova.file.externalApplicationStorageDirectory;
            sResult = sPath.replace("file://", "") + "files/";  // sudah ada / di belakang
            //var sFilename = sFileUrl.replace(/^.*[\\\/]/, '');
            //sPath + sFilename,
            //"/storage/emulated/0/Android/data/com.demo.ddisplay/files/"
        }
        catch (ex) {
            MAlert(ex.message);
        }
    }
    else if (sDevicePlatform == "windows") {
        try {
            //sResult = "/update/"; //window.external.GetUpdatableFolder();
            sResult = window.external.GetUpdatableFolder();
        }
        catch (ex) {
            //alert(ex.message);
            sResult = "";
            if (GetDeviceID() == "proto12345") sResult = "C:/Users/User/Documents/GitHub/DDisplay/www/update/";   //dev
        }
    }
    else {
        //
    }

    return sResult;
}


var errorHandlerWriteToFile = function (fileName, e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'Storage quota exceeded';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'File not found';
            break;
        case FileError.SECURITY_ERR:
            msg = 'Security error';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'Invalid modification';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'Invalid state';
            break;
        default:
            msg = 'Unknown error ' + e.code + ' file = ' + fileName;
            break;
    };
    //alert("Error handler: " + msg + " filename = " + fileName);
    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Error Handler = " + msg);
}

function writeToFile(fileName, data) {
    //data = JSON.stringify(data, null, '\t');
    try {
        //alert("file://" + getTextLogFolder() + fileName);
        window.resolveLocalFileSystemURL("file://" + getTextLogFolder(), function (directoryEntry) {
            //directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function (e) {
                        // for real-world usage, you might consider passing a success callback
                        //console.log('Write of file "' + fileName + '"" completed.');
                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Write notfound.txt success");
                    };

                    fileWriter.onerror = function (e) {
                        // you could hook this up with our global error handler, or pass in an error callback
                        //console.log('Write failed: ' + e.toString());
                        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Write notfound.txt failed error code = " + e.code);
                    };

                    var blob = new Blob([data], { type: 'text/plain' });
                    fileWriter.write(blob);
                }, errorHandlerWriteToFile.bind(null, fileName));
            }, errorHandlerWriteToFile.bind(null, fileName));
        }, errorHandlerWriteToFile.bind(null, fileName));
    }
    catch (ex) {
        //if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Write notfound.txt failed. Exception = " + ex.message);
        //alert("Exception : " + ex.message);
    }
}




function gotFS(fileSystem) {
    fileSystem.root.getFile(getAppStorageFolder() + "notfound.txt", { create: true }, gotFileEntry, failFS);
}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, failFS);
}

function gotFileWriter(writer) {
    writer.onwrite = function (evt) {
        //console.log("write success");
        if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Write notfound.txt success");
    };

    writer.write("404");
    writer.abort();
    // contents of file now 'some different text'
}

function failFS(error) {
    //console.log("error : " + error.code);
    if (iShowDebugLog == 1) $("#spDebugDisplay").html($("#spDebugDisplay").html() + "<br/>Write notfound.txt failed error code = " + error.code);
}


var gbFileUrl = "";
function downloadFile(sFileUrl) {
    try {
        sFileUrl = removeLineBreaks(sFileUrl);
        $("#spPrepInfo").html($("#spPrepInfo").html() + "<br />" + getFilenameFromURL(sFileUrl));
        if (sDevicePlatform == "android") {
            //alert("android");
            //var sPath = cordova.file.externalApplicationStorageDirectory;
            //sPath = sPath.replace("file://", "") + "files/";  //and cache
            var sPath = getUpdatableFolder();
            var sFilename = sFileUrl.replace(/^.*[\\\/]/, '');
            //alert(sFilename); return;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                fileSystem.root.getFile("dummy.html", { create: true, exclusive: false }, function gotFileEntry(fileEntry) {
                    var fileTransfer = new FileTransfer();
                    fileEntry.remove();

                    fileTransfer.onprogress = function (progressEvent) {
                        var percent = progressEvent.loaded / progressEvent.total * 100;
                        percent = Math.round(percent);
                        //$("#spProgress").html(percent);
                        ShowDownloadPercentage(percent);
                    };
                    gbFileUrl = sFileUrl;
                    fileTransfer.download(
                        sFileUrl,
                        sPath + sFilename,
                        //"/storage/emulated/0/Android/data/com.demo.ddisplay/files/bgpattern1.jpg",
                        function (theFile) {
                            //console.log("download complete: " + theFile.toURI());
                            //$("#txURL").val(theFile.toURI());
                            //alert("download success, " + theFile.toURI());
                            DownloadDone(sFileUrl, "false");
                        },
                        function (error) {
                            //alert(error.source + ' , ' + error.target + ' , ' + error.http_status + ' , ' + error.body + ' , ' + error.code);
                            //alert(error.exception.getMessage());
                            //DownloadDone(error.source + ' , ' + error.target + ' , ' + error.http_status + ' , ' + error.body + ' , ' + error.code, "true");
                            DownloadDone(sFileUrl, "true");

                            //console.log("download error source " + error.source);
                            //console.log("download error target " + error.target);
                            //console.log("upload error code: " + error.code);
                        }
                    );
                }, failDL);
            }, failDL);
        }
        else if (sDevicePlatform == "windows") {
            //alert("windows");
            try {
                window.external.DownloadFile(sFileUrl);
                //DownloadDone("", "false"); //handled by exe
            }
            catch (e) {
                //function DownloadDone(serror, scancelled) {
                if (GetDeviceID() == "proto12345") {
                    DownloadDone(sFileUrl, "false");    //dev -> false
                }
                else DownloadDone(sFileUrl, "true");
            }
        }
        else {
            MAlert(sDevicePlatform);
        }
    }
    catch (e) {
        MAlert(e.message);
    }
};

function failDL(error) {
    //MAlert(error.source + ' , ' + error.target + ' , ' + error.http_status + ' , ' + error.body + ' , ' + error.code);
    //MAlert(error.exception.getMessage());
    DownloadDone(gbFileUrl, "true");
}


function DownloadDone(serror, scancelled) {
    //$("#spProgress").html("100 Done, " + serror + " , " + scancelled);
    var sDownloadResult = "";

    if (scancelled == "true") {
        bDownloadFailed = true;
        sDownloadResult = "<font style='color:red'>FAILED</font>";
    }
    else {
        //check file md5
        //arUpdatableFileMD5[iUpdatableDownloadCounter] -> dlm http di server
        var sLocalFilename = getFilenameFromURL(arUpdatableFileList[iUpdatableDownloadCounter]);
        sLocalFilename = getUpdatableFolder() + sLocalFilename;
        sDownloadResult = "<font style='color:lightgreen'>OK</font>";
        //sDownloadResult = "<font style='color:purple'>local file: " + sLocalFilename + "</font>";
        var bMD5Ok = MatchMD5(sLocalFilename, arUpdatableFileMD5[iUpdatableDownloadCounter], iUpdatableDownloadCounter);
        if (bMD5Ok) {
            //untuk platform windows
            if (sDevicePlatform == "windows") arUpdatableFileMD5Result[iUpdatableDownloadCounter] = "1";
        }
        else {
            //untuk platform windows
            if (sDevicePlatform == "windows") arUpdatableFileMD5Result[iUpdatableDownloadCounter] = "0";
        }
    }

    //$("#spPrepInfo").html($("#spPrepInfo").html() + "<br />" + getFilenameFromURL(serror) + "&nbsp;" + sDownloadResult);
    $("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;" + sDownloadResult);
    iUpdatableDownloadCounter++;

    if (iUpdatableDownloadCounter < arUpdatableFileList.length) $("#spPrepFiles").html("" + (iUpdatableDownloadCounter + 1) + "/" + arUpdatableFileList.length);
    else {
        $("#spPrepInfo").html($("#spPrepInfo").html() + "<br/><br/>Validating Files...");
        if (!bDownloadFailed) setTimeout("runDisplay();", 10000); //3000
    }
    

    startDownload(iUpdatableDownloadCounter);
}

function ClearAllTimeouts() {
    var id = window.setTimeout(function () { }, 0);

    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }
}

var TransSpeed = "1000";

function FadeTo(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "0");
    $("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").fadeTo(TransSpeed, 0, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
    });
}

function ClipTo(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "1");
    //$("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").effect("clip", {}, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
    });
}

function ShrinkTo(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "1");
    //$("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").effect("scale", { percent: 0 }, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
    });
}

function LeftToRight(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    var scrwidth = "" + $("#" + idScreen + "Top").css("width");
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "0");
    $("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").animate({ left: scrwidth, width: '0px' }, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
        $("#" + idScreen + "Top").css("left", "0%");
        $("#" + idScreen + "Top").css("width", scrwidth);
    });
}

function RightToLeft(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    var scrwidth = "" + $("#" + idScreen + "Top").css("width");
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "0");
    $("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").animate({ width: '0px' }, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
        $("#" + idScreen + "Top").css("left", "0%");
        $("#" + idScreen + "Top").css("width", scrwidth);
    });
}

function TopToBottom(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    var scrheight = "" + $("#" + idScreen + "Top").css("height");
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "0");
    $("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").animate({ top: scrheight, height: '0px' }, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
        $("#" + idScreen + "Top").css("top", "0%");
        $("#" + idScreen + "Top").css("height", scrheight);
    });
}

function BottomToTop(idScreen, oldImage, newImage, zindex) {
    var ztop = zindex + 2000;
    var zbottom = zindex + 1000;
    var scrheight = "" + $("#" + idScreen + "Top").css("height");
    $("#" + idScreen + "Top").attr("style", "z-index:" + ztop + ";");
    $("#" + idScreen + "Bottom").attr("style", "z-index:" + zbottom + ";");
    $("#" + idScreen + "Top").attr("src", $("#" + oldImage).attr("src"));
    $("#" + idScreen + "Bottom").attr("src", $("#" + newImage).attr("src"));
    $("#" + idScreen + "Bottom").css("opacity", "0");
    $("#" + idScreen + "Bottom").animate({ opacity: 1 }, 1000);
    $("#" + idScreen + "Top").animate({ height: '0px' }, TransSpeed, function () {
        $("#" + idScreen + "Top").attr("src", $("#" + newImage).attr("src"));
        $("#" + idScreen + "Top").css("top", "0%");
        $("#" + idScreen + "Top").css("height", scrheight);
    });
}


(function ($) {

    $.fn.fitText = function (kompressor, options) {
        kompressor = 1 / kompressor;
        // Setup options
        var compressor = kompressor || 1,
            settings = $.extend({
                'minFontSize': Number.NEGATIVE_INFINITY,
                'maxFontSize': Number.POSITIVE_INFINITY
            }, options);

        return this.each(function () {

            // Store the object
            var $this = $(this);

            // Resizer() resizes items based on the object width divided by the compressor * 10
            var resizer = function () {
                var swidth = $this.width();
                var sheight = $this.height();
                //alert(sheight);
                $this.css('font-size', Math.max(Math.min(sheight / (compressor * 1.1), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
                $this.css('line-height', '' + sheight + 'px');
                $this.css('vertical-align', 'middle');
            };

            // Call once to set.
            resizer();

            // Call on resize. Opera debounces their resize by default.
            $(window).on('resize.fittext orientationchange.fittext', resizer);

        });

    };

    /*
    $('h1').marquee();
    $('h2').marquee({ count: 2 });
    $('h3').marquee({ speed: 5 });
    $('h4').marquee({ leftToRight: true });
    $('h5').marquee({ count: 1, speed: 2 }).done(function() { $('h5').css('color', '#f00'); })
    */
    $.fn.marquee = function (args) {
        var that = $(this);
        var textWidth = that.textWidth(),
            offset = that.width(),
            width = offset,
            css = {
                'text-indent': that.css('text-indent'),
                'overflow': that.css('overflow'),
                'white-space': that.css('white-space')
            },
            marqueeCss = {
                'text-indent': width,
                'overflow': 'hidden',
                'white-space': 'nowrap'
            },
            args = $.extend(true, { count: -1, speed: 1e1, leftToRight: false }, args),
            i = 0,
            stop = textWidth * -1,
            dfd = $.Deferred();

        function go1() {
            if (!that.length) return dfd.reject(that);

            that.css('text-indent', width + 'px');
            if (args.leftToRight) {
                width++;
                if (width >= stop) {
                    i++;
                    if (i == args.count) {
                        //that.css(css);
                        return dfd.resolve(that);
                    }
                    if (args.leftToRight) {
                        width = textWidth * -1;
                    } else {
                        width = offset;
                    }
                }
            } else {
                width--;
                if (width <= (stop - (textWidth * 2))) {
                    i++;
                    if (i == args.count) {
                        //that.css(css);
                        return dfd.resolve(that);
                    }
                    if (args.leftToRight) {
                        width = textWidth * -1;
                    } else {
                        width = offset;
                    }
                }
            }
            setTimeout(go1, args.speed);
        };
        if (args.leftToRight) {
            width = textWidth * -1;
            width++;
            stop = offset;
        } else {
            width--;
        }
        that.css(marqueeCss);
        go1();
        return dfd.promise(that);
    };


    $.fn.textWidth = function () {
        var calc = '<span style="display:none">' + $(this).text() + '</span>';
        $('body').append(calc);
        var width = $('body').find('span:last').width();
        $('body').find('span:last').remove();
        return width;
    };

})(jQuery);



function WriteTextLog(data) {
    //MAlert("WriteTextLog ENTER " + GetDevicePlatformName());
    if (GetDevicePlatformName() == "android") {
        try {
            WriteTextLogAndroid(getTodayNum() + ".log", "" + getTimeStr() + "|" + data + "\r\n");
        } catch (ex) { }
    }
    else if (GetDevicePlatformName() == "windows") {
        try {
            window.external.WriteTextLogWindows(getTextLogFolder(), data);
        }
        catch (ex) {

        }
    }
}

function WriteTextLogAndroid(fileName, data) {
    //data = JSON.stringify(data, null, '\t');
    try {
        //MAlert("WriteTextLogAndroid ENTER file://" + fileName);
        window.resolveLocalFileSystemURL("file://" + getTextLogFolder(), function (directoryEntry) {
            //directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function (e) {
                        //MAlert("WriteTextLogAndroid success");
                    };

                    fileWriter.onerror = function (e) {
                        //MAlert("WriteTextLogAndroid error code = " + e.code);
                    };

                    var blob = new Blob([data], { type: 'text/plain' });
                    //MAlert("File length = " + fileWriter.length);

                    if (fileWriter.length > 0) fileWriter.seek(fileWriter.length);
                    fileWriter.write(blob);
                }, errorHandlerWriteToFile.bind(null, fileName));
            }, errorHandlerWriteToFile.bind(null, fileName));
        }, errorHandlerWriteToFile.bind(null, fileName));
    }
    catch (ex) {
        MAlert("WriteTextLogAndroid Exception : " + ex.message);
    }
}

function SlideOnLoad(obj) {
    try {
        var fname = getFilenameFromURL(obj.src);
        if ((fname == "black1px.png") || (fname == "trans.gif")) {
            //built-in images, no need to log
        }
        else {
            WriteTextLog("" + obj.getAttribute("regname") + "|" + getFilenameFromURL(obj.src) + "|success");
        }
    } catch (ex) { }
}

function SlideOnError(obj) {
    try {
        WriteTextLog("" + obj.getAttribute("regname") + "|" + getFilenameFromURL(obj.src) + "|error");
        obj.src = "md/black1px.png";
    } catch (ex) { }
}

function MatchMD5(filename, md5hash, arrayindex) {
    var bResult = false;
    try {
        if (sDevicePlatform == "windows") {
            try {
                var iRes = window.external.VerifyMD5(filename, md5hash);
                if (iRes == 1) bResult = true;
            } catch (ex) { }
        }
        else if (sDevicePlatform == "android") {
            try {
                var iRes = VerifyMD5Android(filename, md5hash, arrayindex);
                if (iRes == 1) bResult = true;
            } catch (ex) { }
        }
    }
    catch (ex) { bResult = false; }
    return bResult;
}


function VerifyMD5Android(filename, md5hash, arrayindex) {
    var iResult = 1;
    arUpdatableFileMD5Result[arrayindex] = "1";
    try {
        if (filename.indexOf(".mp4") > -1) {
            //video file
            var params = { data: "Hello World!", hash: "md5", idx: arrayindex };
            window.hashString(params, function (hash) {
                //MAlert(params.hash + ": " + hash);
            });
            arUpdatableFileMD5Result[arrayindex] = "1";
            iResult = 1;
        }
        else {
            //"/mnt/sdcard/helloworld.txt"
            var params = { data: filename, hash: "md5", idx: arrayindex };
            window.hashFile(params, function (hash) {
                //console.log(params.hash + ": " + hash);
                if ((hash.toLowerCase().trim()) == (md5hash.toLowerCase().trim())) {
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>hash success");
                    iResult = 1;
                    arUpdatableFileMD5Result[params.idx] = "1";
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + params.data + " , SVR: " + md5hash.toLowerCase() + " , LCL: " + hash.toLowerCase() + " BERHASIL");
                }
                else {
                    iResult = 0;
                    arUpdatableFileMD5Result[params.idx] = "0";
                    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>File: " + params.data + " , SVR: " + md5hash.toLowerCase() + " , LCL: " + hash.toLowerCase() + " GAGAL");
                    try {
                        DeleteFileAndroid(params.data);
                    }
                    catch (ex) {
                        //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>EXCEPTION: " + ex.message);
                    }
                }
                //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>" + hash.toLowerCase() + "||" + md5hash.toLowerCase());
            });
        }
        
    }
    catch (ex) {
        iResult = 0;
        arUpdatableFileMD5Result[arrayindex] = "0";
        //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;" + ex.message);
    }

    return iResult;
}

function DeleteFileAndroid(fullpathfilename) {
    //var path = "file:///storage/emulated/0";
    //var filename = "myfile.txt";
    var path = "file://" + getUpdatableFolder();
    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/><br/>PATH: " + path);
    var filename = getFilenameFromURL(fullpathfilename);
    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>FILENAME: " + filename);

    //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>FULLFILENAME: " + (path + filename));

    //return;
    window.resolveLocalFileSystemURL(path, function (dir) {
        dir.getFile(filename, { create: false }, function (fileEntry) {
            fileEntry.remove(function () {
                // The file has been removed succesfully
                //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>REMOVE SUCCESS");
            }, function (error) {
                // Error deleting the file
                //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>REMOVE FAIL1");
            }, function () {
                // The file doesn't exist
                //$("#spPrepInfo").html($("#spPrepInfo").html() + "&nbsp;<br/>REMOVE FAIL2");
            });
        });
    });
}

var zipProgressCallback = function(progressEvent) {
    //$( "#progressbar" ).progressbar("value", Math.round((progressEvent.loaded / progressEvent.total) * 100));
    //$("#spBrowseFile").html($("#spBrowseFile").html() + "," + Math.round((progressEvent.loaded / progressEvent.total) * 100));
};

var zipCallback = function (status) {
    if (status == 0) {
        //console.log("Files succesfully decompressed");
        //$("#spBrowseFile").html($("#spBrowseFile").html() + "<br/>Files succesfully decompressed");
        RunDisplayOffline();
    }

    if (status == -1) {
        //console.error("Oops, cannot decompress files");
        //$("#spBrowseFile").html($("#spBrowseFile").html() + "<br/>Oops, cannot decompress files");
        MAlert("Unable to load layout from zip file!");
        bFirstLoad = true;
        deleteXMLDataStringFromStorage();
        sBufferXMLData = "";
        $("#spRegions").html(sInitScreen1);
    }
};

function zipProcessUnZip(zipSource, destination) {
    try {
        window.zip.unzip(zipSource, destination, zipCallback, zipProgressCallback);
    } catch (ex) {
        //$("#spBrowseFile").html(e.message);
        MAlert(e.message);
    }
}

function stbBrowseOffline() {
    sOfflineZipFile = "";
    sOfflineUser = "";
    sOfflinePass = "";
    try {
        if (sDevicePlatform == "windows") {
            try {
                stbBrowseWin();
            } catch (ex) { }
        }
        else if (sDevicePlatform == "android") {
            try {
                stbBrowseAndroid();
            } catch (ex) { }
        }
    }
    catch (ex) { }
}

function stbBrowseAndroid() {
    sOfflineZipFile = "";
    window.OurCodeWorld.Filebrowser.filePicker.single({
        success: function (data) {
            if (!data.length) {
                // No file selected
                return;
            }
            sOfflineZipFile = data[0];
            $('#spBrowseFile').html(sOfflineZipFile);

            /*
            $('#spBrowseFile').html(data[0] + '<br/>' + getUpdatableFolder());
            try {
                zipProcessUnZip(data[0], getUpdatableFolder());
            } catch (ex) {
                $("#spBrowseFile").html(e.message);
            }
            */
            //console.log(data);
            // Array with the file path
            // ["file:///storage/emulated/0/360/security/file.txt"]
        },
        // Start in a custom directory
        //startupPath:"/emulated/0/",
        error: function (err) {
            //console.log(err);
            //$('#spBrowseFile').html('ERROR: ' + err);
            sOfflineZipFile = "";
        }
    });
}

function stbBrowseWin() {
    $('#btnBrowse').click();
    sOfflineZipFile = $('#btnBrowse').val();
    $('#spBrowseFile').html(sOfflineZipFile);
    

}

var sOfflineZipFile = "";
var sOfflineUser = "";
var sOfflinePass = "";

function stbLoadOffline() {
    if (sOfflineZipFile == "") {
        MAlert("Select a file first!");
        return;
    }
    try {
        sOfflineUser = $('#txUserName2').val();
        sOfflinePass = $('#txUserPass2').val();

        if (sDevicePlatform == "windows") {
            try {
                var ret = window.external.UnzipFile(sOfflineZipFile, getUpdatableFolder());
                if (ret.indexOf("Error") < 0) {
                    RunDisplayOffline();
                }
                else {
                    MAlert(ret);
                }
            } catch (ex1) { MAlert(ex1.message); }
        }
        else if (sDevicePlatform == "android") {
            try {
                zipProcessUnZip(sOfflineZipFile, getUpdatableFolder());
                //android is using async callback !@#!$
            } catch (ex2) { MAlert(ex2.message); }
        }

    }
    catch (ex3) { MAlert(ex3.message); }
    //
}

function RunDisplayOffline() {
    sXMLUrl = "file:///" + getUpdatableFolder() + "data.xml";
    //if (GetDevicePlatformName() == "windows") sXMLUrl = "data.xml";
    MAlert("Layout file unzipped successfuly!");

    var oData = getXMLDataStringFromURL(sXMLUrl);
    if (sDevicePlatform == "windows") {
        oData.success = false;
        try {
            oData.data = window.external.ReadXML(sXMLUrl);
            oData.success = true;
        }
        catch (ex) { }
    }
    //oData = getJSONDataStringFromURL(sXMLUrl, "r=" + getRandomID(10));
    if (oData.success) {
        //sBufferXMLData = decodeURIComponent(oData.data.xmldata);
        //alert("xmldata=" + oData.data.xmldata);
        sBufferXMLData = oData.data;
        //sBufferXMLData = decodeURIComponent((oData.data.xmldata + '').replace(/\+/g, '%20'));

        //check password and deviceid
        var bDeviceIDExist = false;
        var sGUID = "";
        var xml_node = $('os', sBufferXMLData);
        $(xml_node).each(function () {
            var guid = $(this).find("guid").text();
            sGUID = guid;
            $(this).find("deviceid").each(function () {
                //alert("deviceid " + $(this).text());
                if (GetDeviceID().toLowerCase() == $(this).text().toLowerCase()) {
                    bDeviceIDExist = true;
                }
            });
            //alert("guid " + guid + " || " + StringMD5(sOfflineUser + epas(sOfflinePass)));  //toUpperCase

        });

        if (!bDeviceIDExist) {
            MAlert("Device is not registered to use this content!");
            try {
                bFirstLoad = true;
                deleteXMLDataStringFromStorage();
                sBufferXMLData = "";
                $("#spRegions").html(sInitScreen1);
            }
            catch (ex) {

            }
            return;
        }

        sMD5UserPassGlobal = sGUID;

        var smd5user = StringMD5(sOfflineUser + epas(sOfflinePass)).toLowerCase();

        if (sDevicePlatform == "windows") {
            if (sGUID.toLowerCase() != smd5user) {
                MAlert("Unauthorized user / wrong password!");
                //MAlert("guid " + sGUID.toLowerCase() + " || " + smd5user + " || " + sMD5ReturnGlobal);
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
        }
    }
    else {
        MAlert("Unable to get layout!");
        bFirstLoad = true;
        deleteXMLDataStringFromStorage();
        sBufferXMLData = "";
        $("#spRegions").html(sInitScreen1);
        return;
    }

    
}

function RunDisplayOfflineStep2() {  //because of android async callback!!!
    //sMD5ReturnGlobal
    //sMD5UserPassGlobal
    if (sMD5UserPassGlobal.toLowerCase() != sMD5ReturnGlobal.toLocaleLowerCase()) {
        MAlert("Unauthorized user / wrong password!");
        //MAlert("guid " + sMD5UserPassGlobal.toLowerCase() + " || " + sMD5ReturnGlobal);
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
}

function stbOnlineBack() {
    $("#spRegions").html(sInitScreen1);
    sOnlineMode = "Unknown";
}

function stbOfflineBack() {
    $("#spRegions").html(sInitScreen1);
    sOnlineMode = "Unknown";
}

function stbOnlineClicked() {
    sOfflineZipFile == "";
    $("#spRegions").html($("#dvInitLogin1").html());
    sOnlineMode = "Online";
}

function stbOfflineClicked() {
    sOfflineZipFile = "";
    $("#spRegions").html($("#dvInitLogin2").html());
    sOnlineMode = "Offline";
}

function epas(txt) {
    var sRet = "";
    try {
        for (var lp = 0; lp < txt.length; lp++) {
            sRet += (txt.charCodeAt(lp) - 23);
        }
    }
    catch (ex) {
        //alert(ex.message);
        sRet = false;
    }
    return sRet;
}

var sMD5ReturnGlobal = "";
var sMD5UserPassGlobal = "";
function StringMD5(txt) {
    var sRet = "";
    if (sDevicePlatform == "windows") {
        try {
            sRet = window.external.StringMD5(txt);
        }
        catch (ex) { }
    }
    else if (sDevicePlatform == "android") {
        try {
            var params = { data: txt, hash: "md5" };
            window.hashString(params, function (hash) {
                sRet = hash;
                sMD5ReturnGlobal = hash;
                //MAlert(params.hash + ": " + hash);
                RunDisplayOfflineStep2();
            });
        }
        catch (ex) { MAlert(ex.message); }
    }
    return sRet;
}