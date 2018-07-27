!! function() {
	layui.use('element');
	$("#left_menu .layui-nav-item").on("click", function(e) {
		$("#main_container").load($(this).attr("url"));
		$(this).addClass("layui-this").siblings(".layui-this").removeClass("layui-this");
		$("#page_address").html($(this).html());
	});
	document.querySelector("#left_menu .layui-nav-item").click();
}();