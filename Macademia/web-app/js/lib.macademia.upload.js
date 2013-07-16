
/**
 * This upload functionality assumes the following:
 */

macademia = macademia || {};
macademia.upload = {};

macademia.upload.complete = function(event, queueId, fileObj, response, data) {
    var path = response;
    $(".editPicture img").attr("src", macademia.makeActionUrl('image', 'retrieve') + '?subPath=' + path);
    $(".editPicture input[name='imageSubpath']").val(path);
    macademia.upload.updateCaptions();
    return true;
};

macademia.upload.deleteImg = function() {
    var img = $(".editPicture img");
    img.attr("src", img.attr('defaultImage'));
    $(".editPicture input[name='imageSubpath']").attr('value', "");
    macademia.upload.updateCaptions();
    return false;
};

macademia.upload.init = function() {
  $('#imgUploader').uploadify({
      uploader : '/Macademia/js/uploadify/uploadify.swf',
      script : macademia.makeActionUrl('image', 'upload'),
      folder : 'foo',
      auto : true,
      hideButton : true,
      wmode : 'transparent',
      multi : false,
      onComplete : macademia.upload.complete,
      cancelImg : '/Macademia/js/uploadify/cancel.png'
  });
  $(".editPicture .delete").click(macademia.upload.deleteImg);
    macademia.upload.updateCaptions();
};

macademia.upload.updateCaptions = function() {
  if ($(".editPicture input[name='imageSubpath']").attr('value')) {
      $(".editPicture .change").html("change image");
      $(".editPicture .separator").show();
      $(".editPicture .delete").show();
  } else {
      $(".editPicture .change").html("add image");
      $(".editPicture .separator").hide();
      $(".editPicture .delete").hide();
  }
}