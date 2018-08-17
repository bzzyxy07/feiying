layui.use(['element', 'layer'], function() {
	var layer = layui.layer;
	$("#left_menu .layui-nav-item").on("click", function(e) {
		var $this = $(this);
		sessionStorage.setItem("menuUrl", $(this).attr("url"));
		layer.closeAll();
		//加载模块页面
		$("#main_container").load($(this).attr("url"), function() {
			var activeTabUrl = sessionStorage.getItem("tabUrl");
			var $activeTab = $('#main_container>.layui-tab-card>.layui-tab-title>li.layui-this[link-url]');
			//			if($activeTab.attr("link-url") != activeTabUrl) {
			//				$activeTab = $('#main_container>.layui-tab-card>.layui-tab-title>li[link-url="' + activeTabUrl + '"]');
			//				$activeTab.addClass("layui-this").siblings("li").removeClass("layui-this");
			//				var $targetTab = $('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item:eq(' + $activeTab.index() + ')');
			//				$targetTab.addClass("layui-this").siblings().removeClass("layui-this");
			//			}
			$activeTab.length &&
				tabClickCb($activeTab);
		});
		$(this).addClass("layui-this").siblings(".layui-this").removeClass("layui-this");
		$("#page_address").html($(this).html());
	});

	var menuUrl = sessionStorage.getItem("menuUrl");
	var tabUrl = sessionStorage.getItem("tabUrl");
	if(menuUrl) {
		$("#left_menu .layui-nav-item[url='" + menuUrl + "']").click();
	} else {
		$("#left_menu .layui-nav-item").first().click();
	}

	//加载内部tab页面
	$('#main_container').on('click', '>.layui-tab-card>.layui-tab-title>li[link-url]', function() {
		sessionStorage.setItem("tabUrl", $(this).attr("link-url"));
		//		layer.closeAll();
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

function jumpPage(param) {
	var menuUrl = param.menuUrl;
	var tabUrl = param.tabUrl;
	sessionStorage.setItem("menuUrl", menuUrl);
	layer.closeAll();
	//加载模块页面
	var $activeMenu = $("#left_menu .layui-nav-item[url='" + menuUrl + "']");
	$activeMenu.addClass("layui-this").siblings("li").removeClass("layui-this");
	$("#main_container").load(menuUrl, function() {
		var $activeTab = $('#main_container>.layui-tab-card>.layui-tab-title>li[link-url="' + tabUrl + '"]')
		$activeTab.addClass("layui-this").siblings("li").removeClass("layui-this");
		$targetTab = $('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item:eq(' + $activeTab.index() + ')');
		$targetTab.addClass("layui-show").siblings().removeClass("layui-show");
		$activeTab.length &&
			tabClickCb($activeTab);

		$("#page_address").html($activeMenu.html());
	});
}