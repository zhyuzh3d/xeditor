/*基于代码派aframe模版创建,此示例仅供参考*/

AFRAME.registerComponent('remove', {
    schema: {
        default: ''
    },
    update: function () {
        var el = this.el;
        var data = this.data;
        this.el.addEventListener(data, function () {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    },
    init: function () {},
});
