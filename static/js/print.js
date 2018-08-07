

$("#confirm_print_btn").on('click', function() {
	$(this).hide();
	window.print();
	$(this).show();
});


//function CloseAfterPrint() {
//	if(tata = document.execCommand("print")) {
//		layui.use("layer", function() {
//			var layer = layui.layer;
//			var index = parent.layer.getFrameIndex(window.name);
//			parent.layer.close(index);
//		});
//	} else setTimeout("CloseAfterPrint();", 300);
//}
//CloseAfterPrint();

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}

