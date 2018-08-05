layui.use(['element', 'layer'], function() {
	var layer = layui.layer;
	$("#left_menu .layui-nav-item").on("click", function(e) {
		layer.closeAll();
		//加载模块页面
		$("#main_container").load($(this).attr("url"), function() {
			var $activeTab = $('#main_container>.layui-tab-card>.layui-tab-title>li.layui-this[link-url]');
			$activeTab.length &&
				tabClickCb($activeTab);
		});
		$(this).addClass("layui-this").siblings(".layui-this").removeClass("layui-this");
		$("#page_address").html($(this).html());
	});
	document.querySelector("#left_menu .layui-nav-item").click();

	//加载内部tab页面
	$('#main_container').on('click', '>.layui-tab-card>.layui-tab-title>li[link-url]', function() {
		layer.closeAll();
		tabClickCb($(this));
	});
});

function tabClickCb($clickTab) {
	var $target = $('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item:eq(' + $clickTab.index() + ')');
	$target.load($clickTab.attr("link-url"), function() {
		comm.fillSelAndCont();
	});
}

function fillSelAndCont() {

}