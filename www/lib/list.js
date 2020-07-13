
var listRegion = [];

function RegionListClear() {
    listRegion = [];
}

function RegionListAdd(rname, rx, ry, rz, rwidth, rheight) {
    try{
        var newItem = {
            name: rname,
            x: parseInt(rx, 10),
            y: parseInt(ry, 10),
            z: parseInt(rz, 10),
            width: parseInt(rwidth, 10),
            height: parseInt(rheight, 10),
            playlist: [],
            playlistIndex: 0
        };
        listRegion.push(newItem);
    }
    catch (ex) {

    }
}

function RegionPlaylistAdd(index, purl, ptype, pmedia, peffect, ptrans, pdur, pstartdate, pstopdate, pstarttime, pstoptime) {
    try{
        var region = listRegion[index];
        var newList = {
            url: purl,
            urltype: ptype,
            effect: peffect,
            media: pmedia,
            transtype: parseInt(ptrans, 10),
            duration: parseInt(pdur, 10),
            timer: 0,
            startdate: pstartdate,
            stopdate: pstopdate,
            starttime: pstarttime,
            stoptime: pstoptime
        }
        region.playlist.push(newList);
    }
    catch (ex) {
        alert(ex.message);
    }
}

function testregion(obj) {  //dev
    MAlert("Mixed Region = " + listRegion.length + " , First Mixed Region Playlist = " + listRegion[0].playlist.length);
}