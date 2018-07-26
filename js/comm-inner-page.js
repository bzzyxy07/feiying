layui.use('form', function() {
	var form = layui.form;
	var searchUrlArr = [];
	var selLength = $("select[url]").length;
	var fillLength = $(".fill-container[fill-url]").length;
	//从数据库中获取select选项
	$("select[url]").each(function(index, element) {
		var $this = $(this),
			dataText = $this.attr("data-text"),
			dataValue = $this.attr("data-value"),
			searchUrl = $this.attr("url");

		if(searchUrlArr.indexOf(searchUrl) != -1) return false;

		searchUrlArr.push(searchUrl);
		comm.getDataByCondition({
			ajax: {
				url: searchUrl,
				type: $this.attr("my-type"),
				success: function(data) {
					if(data && data.Data && data.Data.length) {
						var sel = '<option value="">未选择</option>';
						for(var i = 0, len = data.Data.length; i < len; i++) {
							sel += '<option value="' + data["Data"][i][dataValue] + '">' + data["Data"][i][dataText] + '</option>';
						}
						$("select[url]").html(sel);

						if(selLength - 1 === index) {
							form.render('select');
							(fillLength !== 0) && fillContainer();
						}
					}
				},
				error: function(data) {
					layer.close(index);
					layer.msg("服务器错误：查询" + $this.prev("span").text() + "失败");
				}
			}
		});
	});
	$(".layui-form:not(.ignore-comm-submit)").each(function() {
		var filter = $(this).attr("lay-filter");
		!filter && (filter = $(this).attr("id") || "form" + comm.uuid()) && $(this).attr("lay-filter", filter);
		comm.submitForm(filter);
	});
	(selLength === 0) && fillContainer();
	//表单回填
	function fillContainer() {
		$(".fill-container[fill-url]").each(function() {
			var $this = $(this);
			comm && comm.getDataByCondition({
				ajax: {
					url: $this.attr("fill-url"),
					type: $this.attr("fill-type") || "get",
					data: $this.attr("fill-data") || {},
					success: function(data) {
						$this.hasClass("fill-page-container") && nemo.fillPage(".fill-page-container[url='" + $this.attr("fill-url") + "']", data.Obj);
						$this.hasClass("fill-form-container") && nemo.fillForm(".fill-form-container[url='" + $this.attr("fill-url") + "']", data.Obj);
					}
				}
			});
		});
	}
});