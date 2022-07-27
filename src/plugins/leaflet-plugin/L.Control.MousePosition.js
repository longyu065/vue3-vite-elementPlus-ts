!function (t) {
    "function" == typeof define && define.amd ? define(t) : t()
}(function () {
    L.Control.MousePosition = L.Control.extend({
        options: {
            position: 'bottomleft',
            separator: ' : ',
            emptyString: 'Unavailable',
            lngFirst: false,
            numDigits: 5,
            lngFormatter: undefined,
            latFormatter: undefined,
            prefix: ""
        },

        onAdd: function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
            L.DomEvent.disableClickPropagation(this._container);
            map.on('mousemove', this._onMouseMove, this);
            this._container.innerHTML = this.options.emptyString;
            return this._container;
        },

        onRemove: function (map) {
            map.off('mousemove', this._onMouseMove)
        },

        _onMouseMove: function (e) {
            var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
            var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
            var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
            var prefixAndValue = this.options.prefix + ' ' + value;
            this._container.innerHTML = prefixAndValue;
        }

    });

    L.Map.mergeOptions({
        positionControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.positionControl) {
            this.positionControl = new L.Control.MousePosition();
            this.addControl(this.positionControl);
        }
    });

    L.control.mousePosition = function (options) {
        return new L.Control.MousePosition(options);
    };
    L.Map = L.Map.extend({
        options: {
            crs: L.CRS.EPSG4326,
            attributionControl: false,
            minZoom: 2
        },
        getScales: function () {
            return [
                5.916587109091312E8,
                2.958293554545656E8,
                1.479146777272828E8,
                7.39573388636414E7,
                3.69786694318207E7,
                1.848933471591035E7,
                9244667.357955175,
                4622333.678977588,
                2311166.839488794,
                1155583.419744397,
                577791.7098721985,
                288895.85493609926,
                144447.92746804963,
                72223.96373402482,
                36111.98186701241,
                18055.990933506204,
                9027.995466753102,
                4513.997733376551,
                2256.998866688275,
                1128.4994333441375,
                564.2497166720685
            ];
        }
    });
})
