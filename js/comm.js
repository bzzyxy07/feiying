var comm,
	path = "http://119.28.23.40:8081",
	modelId,
	userInfo;
layui.use(['layer', 'form'], function() {
	var layer = layui.layer;
	var form = layui.form;
	comm = {
		/*退出系统 */
		exitSystem: function() {
			$.ajax({
				url: "./logout",
				success: function() {
					sessionStorage.clear();
					window.location.href = "./login.html";
				},
				error: function() {
					layui.use('layer', function() {
						var layer = layui.layer;
						layer.msg("网络异常，无法正常退出！")
					});
				}
			});
		},
		/*系统超时*/
		systemTimeout: function() {
			var msg = arguments[0] || "系统超时或非法访问！";
			layui.use('layer', function() {
				var layer = layui.layer;
				layer.alert(msg + "系统将在<span id='interval_time'>5</span>秒后自动退出", {
					skin: 'layui-layer-blue',
					icon: arguments[1] || 2,
					btn: ['立即退出'],
					closeBtn: 0
				}, function() {
					sessionStorage.clear();
					window.location.href = "./login.html";
				});

				var i = 5;
				var interval = setInterval(function() {
					i--;
					$("#interval_time").text(i);
					if(i === 0) {
						clearInterval(interval);
						sessionStorage.clear();
						window.location.href = "./login.html";
					}
				}, 1000);
			});
			return false;
		},
		getDataByFilterform: function() {

		},
		getDataByCondition: function(condition) {
			if(condition.loading) {
				var uuid = comm.uuid();
				$(condition.loading).parents(".layui-tab-item").append('<div class="loading-container" id="loading_' + uuid + '"><img src="./img/loading.gif" alt="加载中..." width="38.99" height="38.99"></div>');
			}
			var ajaxData = $.extend({
				url: '',
				type: 'get',
				data: {},
			}, condition.ajax);
			if(!condition.login) {
				ajaxData.beforeSend = function(request) {
					request.setRequestHeader("Authorization", sessionStorage.getItem("authen"));
				};
			}

			ajaxData.url = path + ajaxData.url;
			ajaxData.success = function(data) {
				uuid && $("#loading_" + uuid).remove();
				if(!data.Success) {
					layer.msg("系统异常：" + data.Errors[0]);
					return false;
				}

				if(condition.login) {
					modelId = data.modelId;
					userInfo = data.Object;
					//					sessionStorage.setItem("userInfo", data.Object);
					sessionStorage.setItem("authen", data.Token);
				}
				condition.ajax.success && condition.ajax.success(data.Object);
				return data.Object;
			};
			ajaxData.error = function(data) {
				uuid && $("#loading_" + uuid).remove();
				if(data.status == 401) {
					comm.systemTimeout();
					return false;
				}
				layer.msg("服务器异常：请联系管理员！");
				condition.ajax.error && condition.ajax.error(data);
				return false;
			};
			$.ajax(ajaxData);
		},
		initTableByData: function() {

		},
		/**
		 * 根据数据填充页面
		 * @param {Object} data  数据
		 * @param {string} container 容器 例：".container", "#container"
		 */
		fillPageByData: function(data, container) {
			for(var key in data) {
				$(container + ' .page-field-cont[name="' + key + '"]').html(data[key]);
			}
		},
		fillFormByData: function() {
			for(var key in data) {
				$(container + ' .form-field-cont[name="' + key + '"]').val(data[key]);
			}
		},
		initImageByData: function() {

		},
		getFormData: function($form) {
			var unindexed_array = $form.serializeArray();
			var indexed_array = {};

			$.map(unindexed_array, function(n, i) {
				indexed_array[n['name']] = n['value'];
			});
			return indexed_array;
		},
		/**
		 * 绑定搜索表单的点击事件
		 * @param {
		 *     formId: 	"test", 搜索表单的id
		 *     success: function(data) { //成功回调函数
		 * 	
		 *     },
		 *     error: function(data) { //失败回调函数
		 * 	
		 *     }
		 * }
		 */
		bindFilterForm: function(param) {
			var filterForm = document.getElementById(param.formId);

			$("#" + param.formId + " .form-condition").each(function() {
				$(filterForm).append('<input type="hidden" name="' + $(this).attr("name") + '">');
			});
			$("#" + param.formId + " .form-condition li").on("click", function() {
				$(this).addClass("active").siblings("li").removeClass("active");
				$("#" + param.formId + ' input[name="' + $(this).parent(".form-condition").attr("name") + '"]').val($(this).attr("data-value"));
				$("#" + param.formId + " .filter-btn").click();
			});
			form.on('select()', function(data) {
				$("#" + param.formId + " .filter-btn").click();
			});

			$(filterForm).on("click", ".filter-btn", function() {
				var $this = $(this);

				if(param.renderTable) {
					var uuid = comm.uuid();
					$(filterForm).parents(".layui-tab-item").append('<div class="loading-container" id="loading_' + uuid + '"><img src="./img/loading.gif" alt="加载中..." width="38.99" height="38.99"></div>');
					var renderData = $.extend({
						url: path + filterForm.getAttribute("url"),
						method: filterForm.getAttribute("my-type") || "get",
						request: {
							pageName: 'Page',
							limitName: 'page_size'
						},
						page: {
							count: 'Total'
						},
						headers: {
							"Authorization": sessionStorage.getItem("#page_address")
						},
						response: {
							statusName: 'Success',
							statusCode: true,
							msgName: 'msg'
						},
						where: comm.getFormData($(filterForm)),
						done: function(data) {
							$("#loading_" + uuid).remove();
							if(data.status == 401) {
								comm.systemTimeout();
								return false;
							}
							if(!data.Success) {
								layer.msg("系统异常：" + data.Errors[0]);
								return false;
							}
							console.info(data)
							//param.success && param.success(data);
						}

					}, param.renderTable)

					comm.renderTable({
						loading: true,
						table: renderData
					});
				}
				param.callback && param.callback();
			});
			$("#" + param.formId + " .filter-btn").click();
		},
		/**
		 * 改写layui.table的render方法
		 * @param {Object} param
		 */
		renderTable: function(param) {
			layui.use('table', function() {
				var table = layui.table;

				table.render(param.table);
			});
		},

		/**
		 * 通用表单的提交
		 * @param {Object} lay-filter的内容
		 */
		submitForm: function(filter) {
			form.on('submit(' + filter + ')', function(data) {
				var $form = $(".layui-form[lay-filter=" + filter + "]");
				comm.getDataByCondition({
					loading: ".layui-form[lay-filter=" + filter + "]",
					ajax: {
						url: $form.attr("submit-url"),
						type: $form.attr("submit-type") || "get",
						data: $form.serialize(),
						success: function(data) {
							$form.attr("succ-msg") && layer.msg($form.attr("succ-msg"));
							$form.attr("succ-cb") && eval($form.attr("succ-cb"));
						}
					}
				});
				return false;
			});
		},
		uuid: function() {
			function S4() {
				return(((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			}
			return(S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		}
	}
});