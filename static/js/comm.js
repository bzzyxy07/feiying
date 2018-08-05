var path = "http://119.28.23.40:8081";
var comm = {
	/**
	 * 根据统一接口初始化全部选项
	 * @param {
	 * url: '接口路径'，
	 * cont: '.a' //统一容器（根据initial-name进行渲染） 
	 * cb：回调函数
	 * } 
	 */
	groupInitial: function(param) {
		//初始化表格选项数据
		comm.getDataByCondition({
			ajax: {
				url: param.url,
				success: function(data) {
					$(param.cont + ' select[initial-name]').each(function() {
						var m = $(this),
							key = m.attr("initial-name"),
							sel = '<option value="">请选择</option>',
							sepData = data[key],
							id = m.attr("initial-value"),
							name = m.attr("initial-text");

						sepData && sepData.map(function(v) {
							(sepid = v[id] || v.id) &&
							(sepname = v[name] || v.name) &&
							(sel += '<option value="' + sepid + '">' + sepname + '</option>');
						});
						m.html(sel).data("data") && m.val(m.data("data"));
					})
					layui.use('form', function() {
						var form = layui.form;
						form.render('select');
					});
					param.cb && param.cb(data);
				}
			}
		});
	},
	/**
	 * 临时二次封装layer.open用以打开页面
	 */
	openPage: function(param) {
		comm.initLoading();
		var index = layer.load(1);
		var wid = param.open.area && param.open.area[0] || "100%";
		$(".popup-page-container").css("width", wid).html('<div class="popup-page-store"></div>');
		param.data && $(".popup-page-store").data("data", param.data);
		$(".popup-page-store").data("url", param.url).load(param.url, function() {
			layui.use('layer', function() {
				var layer = layui.layer;
				var openParam = $.extend(param.open, {
					type: 1,
					shadeClose: true,
					//					shade: 0,
					content: $('.popup-page-store'),
					end: function() {
						$(".popup-page-container").html("");
					}
				});
				layer.open(openParam);
				layer.close(index);
				comm.fillSelAndCont('.popup-page-store');
			});
			param.cb && param.cb();
		});
	},
	initLoading: function() {
		if($(".popup-page-store .loading-container").length) return false;
		$(".popup-page-store").append('<div class="loading-container"><img src="./static/img/loading.gif" alt="加载中..." width="37" height="37"></div>');
	},
	closeLoading: function() {
		$(".popup-page-store").remove(".loading-container");
	},
	closeOpenPage: function() {
		$(".layui-layer-shade").remove();
		$(".popup-page-store").data("url", "");
		$(".popup-page-container").html("");
		layer.closeAll();
	},
	fillSelAndCont: function() {
		var target = arguments[0] || '#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show';
		layui.use('form', function() {
			var form = layui.form;
			var searchUrlArr = [];
			var selLength = $(target + " select[url]").length;
			var fillLength = $(target + " .fill-container[fill-url]").length;
			//从数据库中获取select选项
			$(target + " select[url]").each(function(index, element) {
				var $this = $(this),
					dataText = $this.attr("data-text") || "name",
					dataValue = $this.attr("data-value") || "id",
					searchUrl = $this.attr("url");
				if(searchUrlArr.indexOf(searchUrl) != -1) return false;
				searchUrlArr.push(searchUrl);
				comm.getDataByCondition({
					loading: true,
					ajax: {
						url: searchUrl,
						type: $this.attr("my-type"),
						success: function(data) {
							console.info(data)
							if(index == selLength) comm.closeLoading();
							var data = data.Data || data;
							if((!data) || (!data.length)) return false;
							if($this.prop("tagName") === 'SELECT') {

								var sel = '<option value="">未选择</option>';
								for(var i = 0, len = data.length; i < len; i++) {
									console.info(data[i])
									sel += '<option value="' + data[i][dataValue] + '">' + data[i][dataText] + '</option>';
								}
								$this.html(sel);
								$this.data("data") && $this.val($this.data("data"));

								if(selLength - 1 === index) {
									form.render('select');
									(fillLength !== 0) && fillContainer();
								}
							} else if($this.prop("tagName") === 'UL') {

							}
						},
						error: function(data) {
							if(index == selLength) comm.closeLoading();
							layer.close(index);
							layer.msg("服务器错误：查询" + $this.prev("span").text() + "失败");
						}
					}
				});
			});
			$(target + " .upload-img-file").on("change", function(e) {
				comm.showImgFile(e, $(this));
			}).parent("a").next("img").attr("src", "./static/img/no-img.png");

			$(target + " .layui-form:not(.ignore-comm-submit)").each(function() {
				var filter = $(this).attr("lay-filter");
				!filter && (filter = $(this).attr("id") || "form" + comm.uuid()) && $(this).attr("lay-filter", filter);
				comm.submitForm(filter);
			});
			(selLength === 0) && (fillLength !== 0) && fillContainer();

			form.render();
			//表单回填
			function fillContainer() {
				$(target + " .fill-container[fill-url]").each(function() {
					var $this = $(this);
					comm.getDataByCondition({
						ajax: {
							url: $this.attr("fill-url"),
							type: $this.attr("fill-type") || "get",
							data: $this.attr("fill-data") || {},
							success: function(data) {
								$this.hasClass("fill-page-container") && comm.fillPageByData(data, $this);
								$this.hasClass("fill-form-container") && comm.fillFormByData(data, $this);
								$this.attr("fill-cb") && eval($this.attr("fill-cb"));
							}
						}
					});
				});
			}
			comm.closeLoading();
		});
	},
	getDataByFilterform: function() {

	},
	getDataByCondition: function(condition) {
		condition.loading && comm.initLoading();
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
			comm.closeLoading();
			if(!data.Success) {
				layer.msg(data.Errors[0] || data.Message);
				return false;
			}

			if(condition.login) {
				userInfo = data.Object;
				//sessionStorage.setItem("userInfo", data.Object);
				sessionStorage.setItem("modelId", data.modelId);
				sessionStorage.setItem("authen", data.Token);
			}
			condition.ajax.success && condition.ajax.success(data.Object);
			return data.Object;
		};
//		ajaxData.processData = false;
//		ajaxData.contentType = false;
		ajaxData.error = function(data) {
			comm.closeLoading();
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
	fillContainerByUrl: function(param) {
		var $container = param.cont;
		comm.getDataByCondition({
			ajax: {
				url: $container.attr("fill-url"),
				type: $container.attr("fill-type") || "get",
				data: $container.attr("fill-data") || {},
				success: function(data) {
					$container.hasClass("fill-page-container") && comm.fillPageByData(data, $container);
					$container.hasClass("fill-form-container") && comm.fillFormByData(data, $container);
					param.cb && param.cb(data);

				}
			}
		});
	},
	/**
	 * 根据数据填充页面
	 * @param {Object} data  数据
	 * @param {string} container 容器 例：".container", "#container"
	 * @param {string} fleldName 填充字段名称 "id" 默认为"name"
	 */
	fillPageByData: function(data, $container, fieldName) {
		fieldName = fieldName || "name";
		(typeof data === 'object') && data['Data'] && (data = data['Data'][0]);
		for(var key in data) {
			$container.find('.field-cont[' + fieldName + '="' + key + '"]').html(data[key]);
		}
	},
	fillFormByData: function(data, $container, fieldName) {
		fieldName = fieldName || "name";
		(typeof data === 'object') && data['Data'] && (data = data['Data'][0]);
		for(var key in data) {
			var sepCont = $container.find('.field-cont[' + fieldName + '="' + key + '"]');
			if(!data[key] || !sepCont.length) continue;

			if(sepCont.hasClass("upload-img-file")) {
				var $img = sepCont.parent("a").next("img");
				$img.attr("src", data[key]).attr("onerror", "imgerror(this)");

			} else {
				sepCont.val(data[key]).data("data", data[key]);
			}
		}

		layui.use('form', function() {
			var form = layui.form;
			form.render();
		});
	},

	showImgFile: function(e, $input) {
		var file = e.target.files[0];
		if(!(/^image\/.*$/i.test(file.type))) {
			layui.use('layer', function() {
				var layer = layui.layer;
				layer.alert("请上传图片格式的文件！");
			});
			return false;
		}
		var freader = new FileReader();
		freader.readAsDataURL(file);
		freader.onload = function(e) {
			$input.parent("a").next("img").attr("src", e.target.result);
		};
	},
	initImageByData: function() {

	},
	/**
	 * 获取表单数据
	 * @param {Object} $form $("#form") 待处理的form表单dom对象
	 * @param {Object} fieldArr 获取的字段数组 可选
	 */
	getFormData: function($form, fieldArr) {
		var unindexed_array = $form.serializeArray();
		var indexed_array = {};
		if(!fieldArr || !fieldArr.length) {
			$.map(unindexed_array, function(n, i) {
				indexed_array[n['name']] = n['value'];
			});
		} else {
			$.map(unindexed_array, function(n, i) {
				if(fieldArr.indexOf(n['name']) == -1) return false;
				indexed_array[n['name']] = n['value'];
			});
		}
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
		layui.use('form', function() {
			var form = layui.form;
			var filterForm = document.getElementById(param.formId);
			$("#" + param.formId + " .form-condition:not(.auto-click-condition)").each(function() {
				$(filterForm).append('<input type="hidden" name="' + $(this).attr("name") + '">');
			});
			$("#" + param.formId + " .form-condition.auto-click-condition").each(function() {
				$(this).append('<input type="hidden" name="" class="auto-click-input">');
			});
			$("#" + param.formId + " .form-condition:not(.auto-click-condition) li").on("click", function() {
				$(this).addClass("active").siblings("li").removeClass("active");
				$("#" + param.formId + ' input[name="' + $(this).parent(".form-condition").attr("name") + '"]').val($(this).attr("data-value"));
				$("#" + param.formId + " .filter-btn").click();
			});
			$("#" + param.formId + " .form-condition.auto-click-condition li").on("click", function() {
				$(this).addClass("active").siblings("li").removeClass("active");
				$(this).siblings(".auto-click-input").val($(this).attr("data-value")).attr("name", $(this).attr("click-name"));
				$("#" + param.formId + " .filter-btn").click();
			});
			form.on('select()', function(data) {
				$("#" + param.formId + " .filter-btn").click();
			});
			form.render();

			$(filterForm).on("click", ".filter-btn", function() {
				comm.initLoading();
				var $this = $(this);
				if(param.renderTable) {
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
							msgName: 'msg',
							dataName: 'Data',
							countName: 'Total'
						},
						where: comm.getFormData($(filterForm)),
						done: function(data) {
							comm.closeLoading();
							if(data.status == 401) {
								comm.systemTimeout();
								return false;
							}
							if(!data.Success) {
								layer.msg(data.Errors[0], {
									icon: 5
								});
								return false;
							}
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
		});

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
		layui.use('form', function() {
			var form = layui.form;
			form.on('submit(' + filter + ')', function(data) {
				var $form = $(".layui-form[lay-filter=" + filter + "]");
				var formData = new FormData($form[0]);
				comm.getDataByCondition({
					loading: ".layui-form[lay-filter=" + filter + "]",
					ajax: {
						url: $form.attr("submit-url"),
						type: $form.attr("submit-type") || "get",
						data: formData,
						success: function(data) {
							$form.attr("succ-close") && layer.closeAll();
							$form.attr("succ-msg") && layer.msg($form.attr("succ-msg"));
							$form.attr("succ-reset") && $form[0].reset();
							$form.attr("succ-cb") && eval($form.attr("succ-cb"));
							$form.attr("succ-form-refresh") && $("#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show .filter-btn").click();
						}
					}
				});
				return false;
			});
		})

	},
	uuid: function() {
		function S4() {
			return(((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return(S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	},
	/**
	 * 获取路径中的参数
	 * @param {Object} 获取参数的名称
	 */
	getUrlParam: function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	},
	getUrlParamX: function(name) {
		var urlStr = $(".popup-page-store").data("url");
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = urlStr.substring(urlStr.indexOf("?")).substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	},
	getObjParam: function(name) {
		if(!name) return $(".popup-page-store").data("data");
		return $(".popup-page-store").data("data")[name];
	},
	/*退出系统 */
	exitSystem: function() {
		if(arguments.length) {
			layui.use('layer', function() {
				var layer = layui.layer;
				layer.confirm("确认退出本系统？", function() {
					exit();
				});
			});
		} else {
			exit();
		}

		function exit() {
			$.ajax({
				url: path + '/api/auth/logoff',
				type: 'post',
				beforeSend: function(request) {
					request.setRequestHeader("Authorization", sessionStorage.getItem("authen"));
				},
				success: function(data) {
					sessionStorage.clear();
					window.location.href = "./login.html";
				},
				error: function() {
					layer.msg("系统异常，退出失败，请重试！", {
						icon: 5
					});
				}
			});
		}
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
				comm.exitSystem();
			});

			var i = 5;
			var interval = setInterval(function() {
				i--;
				$("#interval_time").text(i);
				if(i === 0) {
					clearInterval(interval);
					comm.exitSystem();
				}
			}, 1000);
		});
		return false;
	},
	/**
	 * 二级省市联动
	 * @param {
	 * 	container: ["#cont1", "#cont2"],
	 *  data
	 * } 
	 */
	initRelateSelect: function(param) {
		layui.use('form', function() {
			var form = layui.form,
				container0 = param.container[0],
				container1 = param.container[1],
				relateList = param.data,
				provinceSel = '<option value="">请选择省</option>',
				idArr = [];

			relateList.map(function(v) {
				provinceSel += '<option value="' + v.id + '">' + v.regionname + '</option>';
				idArr.push(v.id);
			});

			$(container0).attr("lay-filter", "relate-province").html(provinceSel);
			$(container1).attr("lay-filter", "relate-city").html('<option value="">请选择市</option>');
			form.render('select');

			form.on('select(relate-province)', function(data) {
				var citySel = '<option value="">请选择市</option>';
				var cityList = relateList[idArr.indexOf(data.value)]['children'];
				cityList.map(function(v) {
					citySel += '<option value="' + v.id + '">' + v.regionname + '</option>';
				});
				$(container1).html(citySel);
				form.render('select');
			});
		});
	}
}

function imgerror(img) {
	img.src = "./static/img/illegal-img.png";
	img.onerror = null;
}