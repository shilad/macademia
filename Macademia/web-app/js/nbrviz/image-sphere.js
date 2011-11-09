
var ImageSphere = LabeledSphere.extend({
    init : function(params) {
        var x = params.x, y = params.y;

        params.hue = 0.0;
        params.brightness = 0.0;
        params.sat = 0.0001;
        params.xOffset = 0;
        params.yOffset = params.r * 1.1;

        this._super(params);

        // constants
        this.IMAGE_ASPECT = 130.0 / 194.0;
        this.IMAGE_WIDTH = 28;
        this.IMAGE_HEIGHT = this.IMAGE_WIDTH / this.IMAGE_ASPECT;
        this.LABEL_VERT_OFFSET = 13;
        this.LABEL_HORIZ_OFFSET = 13;

        this.picture = params.picture || '';

        this.font = params.font || macademia.nbrviz.mainFont;
        this.imageHeight = params.imageHeight || this.IMAGE_HEIGHT;
        this.imageWidth = params.imageWidth || (this.imageHeight * this.IMAGE_ASPECT);
        this.picture = this.paper.image(this.picture,
                x-this.imageWidth/2, y-this.imageHeight/2,
                this.imageWidth, this.imageHeight);
        this.type = 'person';
    },
    getLayers : function() {
        var layers = this._super();
        layers.splice(0, 0, this.picture);
        return layers;
    },
    animate : function(attrs, millis, arg1, arg2) {
        var self = this;
        var a = $.extend({}, attrs);    // copy
        a.scale = attrs.scale || 1.0;
        a.x = (attrs.x || this.getX()) - this.imageWidth * a.scale / 2;
        a.y = (attrs.y || this.getY()) - this.imageHeight * a.scale / 2;
        a.width = this.imageWidth * a.scale;
        a.height = this.imageHeight * a.scale;

         // if callback (arg2) is not null, only the parent should use it.
        this.picture.animate(a, millis, arg1, null);
        this._super(attrs, millis, arg1, arg2);
    }
});