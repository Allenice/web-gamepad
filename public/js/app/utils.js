/*
* utils
* */


define(function () {
  var utils = {

    // 获取两点的之间的距离
    getDelta: function (prevPoint, curPoint) {
      return {
        x: curPoint.x - prevPoint.x,
        y: curPoint.y - prevPoint.y
      }
    },

    // 获取一个 touch 对象的坐标位置
    getPoint: function (touch) {
      return {x: touch.pageX, y: touch.pageY};
    },

    /*
     * 获取 url 参数
     * @param {string} paramName - 参数名
     * @param {string} url - url 可选，默认是当前页面的 url
     */
    getUrlParam: function(paramName, url) {
      var search = url ? (url.split('?')[1] || '') : window.location.search;
      return decodeURI(
        (new RegExp(paramName + '=(.+?)(&|$)').exec(search) || [, ''])[1]
      );
    }
  };

  return utils;
});