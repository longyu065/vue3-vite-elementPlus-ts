!function (t) {
    "function" == typeof define && define.amd ? define(t) : t()
}(function () {
    "use strict";
    var tk = "5a5419ba24cab694576f1a5ad863ae3f";
    var cesiumAsset = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ODA2MDdlOS0wNDY3LTRhMGItOTU2MC02Y2NjYWUzZTQ4NDgiLCJpZCI6NjE5OTEsImlhdCI6MTYyNjYxNzYwMn0.qLJ3KaNGnfjZyXwOzh7a2w2lybXq6i0ByFZ8gyEBwEI";

    L.TileLayer.TiandituLayer = L.TileLayer.extend({
        getTileUrl: function (tilePoint) {
            var h = parseInt(Math.random() * 7);
            var layerType = this.options.layerType;
            var url = "https://t" + h + ".tianditu.gov.cn/" + layerType + "_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + layerType + "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&" + "TILECOL=" + tilePoint.x + "&TILEROW=" + tilePoint.y + "&TILEMATRIX=" + tilePoint.z + '&tk=5a5419ba24cab694576f1a5ad863ae3f';
            return url;
        }
    });
    L.tileLayer.tiandituLayer = function (options) {
        return new L.TileLayer.TiandituLayer('', options);
    };
})
