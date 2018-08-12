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
		if(param.url) {
			if(!param.data) {
				comm.getDataByCondition({
					ajax: {
						url: param.url,
						success: function(data) {
							comm.groupInitialBase(param, data)
						}
					}
				});
			} else {
				comm.getDataByCondition({
					ajax: {
						url: param.url,
						data: param.data,
						success: function(data) {
							comm.groupInitialBase(param, data)
						}
					}
				});
			}

		} else {
			comm.groupInitialBase(param, param.data);
		}

	},
	groupInitialBase: function(param, data) {
		$(param.cont + ' select[initial-name]').each(function() {
			var m = $(this),
				key = m.attr("initial-name"),
				sel = '<option value="">请选择</option>',
				sepData = data[key],
				id = m.attr("initial-value"),
				name = m.attr("initial-text");

			sepData && sepData.map(function(v) {
				sepid = v[id] || v.id;
				sepname = v[name] || v.name;

				if(m.data("data") && (sepid == m.data("data"))) {
					sel += '<option value="' + sepid + '" selected="selected">' + sepname + '</option>';
				} else {
					sel += '<option value="' + sepid + '">' + sepname + '</option>';
				}
			});
			m.html(sel);
			//m.html(sel).data("data") && m.val(m.data("data"));
		})
		layui.use('form', function() {
			var form = layui.form;
			form.render('select');
		});
		param.cb && param.cb(data);
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
				comm.closeLoading();
			});
			param.cb && param.cb();
		});
	},
	changeTabContent: function(param) {
		$("#main_container").data("data", param.data);
		var $showTab = $('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show')
		$showTab.load(param.url, function() {
			if(!$(".return-prev").length) {
				$showTab.prepend('<div class="layui-text"><a class="return-prev">返回上页&gt;&gt;</a></div>');
				$(".return-prev").unbind("click").on("click", function() {
					$showTab.load($('#main_container>.layui-tab-card>.layui-tab-title>.layui-this').attr('link-url'));
				});
			}
			comm.fillSelAndCont();
		});
	},
	refreshInnerPage: function() {
		$('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show').load($('#main_container>.layui-tab-card>.layui-tab-title>.layui-this').attr('link-url'));
	},
	returnPrev: function() {
		$(".return-prev").click();
	},
	initLoading: function() {
		$(".loading-container").remove();
		if($(".loading-container").length) return false;
		if($(".popup-page-store").length) {
			$('.popup-page-store').append('<div class="loading-container"><img src="./static/img/loading.gif" alt="加载中..." width="37" height="37"></div>');
		} else {
			$('#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show').append('<div class="loading-container"><img src="./static/img/loading.gif" alt="加载中..." width="37" height="37"></div>');
		}
	},
	closeLoading: function() {
		$(".loading-container").remove();
	},
	closeOpenPage: function() {
		$(".layui-layer-shade").remove();
		$(".popup-page-store").data("url", "");
		$(".popup-page-container").html("");
		layer.closeAll();
	},
	fillSelAndCont: function() {
		var target = arguments[0] || '#main_container>.layui-tab-card>.layui-tab-content>.layui-tab-item.layui-show';
		if($(target + " select[url]").length) comm.initLoading();
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

							var data = data.Data || data;
							if((!data) || (!data.length)) return false;
							if($this.prop("tagName") === 'SELECT') {
								var sel = '<option value="">未选择</option>';
								for(var i = 0, len = data.length; i < len; i++) {
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
							if(index == selLength) comm.closeLoading();
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
				var $this = $(this);
				comm.showImgFile(e, $(this));
				var fileObj = $(this)[0].files[0]; // js 获取文件对象
				if(typeof(fileObj) == "undefined" || fileObj.size <= 0) {
					alert("请选择图片");
					return;
				}
				var formFile = new FormData();
				formFile.append("action", "UploadVMKImagePath");
				formFile.append("file", fileObj); //加入文件对象

				var data = formFile;
				$.ajax({
					url: path + "/api/OrderTransportOrder/upload_image",
					beforeSend: function(request) {
						request.setRequestHeader("Authorization", sessionStorage.getItem("authen"));
					},
					data: data,
					type: "post",
					dataType: "json",
					cache: false,
					processData: false,
					contentType: false,
					success: function(data) {
						if(!data.Success) {
							layer.msg(data.Errors[0] || data.Message);
							return false;
						}
						$this.next("input.upload-img-url").val(data.Object);
					},
					error: function(data) {
						if(data.status == 401) {
							comm.systemTimeout();
							return false;
						}
						layui.use('layer', function() {
							var layer = layui.layer;
							layer.msg("服务器异常：请联系管理员！");
						});
						return false;
					}
				});

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
		});
	},
	getDataByFilterform: function() {

	},
	getDataByCondition: function(condition) {
		layui.use('layer', function() {
			var layer = layui.layer;
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
			} else {
				layer.load(1);
			}

			ajaxData.url = path + ajaxData.url;
			ajaxData.success = function(data) {
				layer.closeAll();
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
					sessionStorage.setItem("local-depotName", userInfo.DepotName);
					sessionStorage.setItem("local-depotId", userInfo.DepotId);
				}
				condition.ajax.success && condition.ajax.success(data.Object, data);
				return data.Object;
			};
			//		ajaxData.processData = false;
			//		ajaxData.contentType = false;
			ajaxData.error = function(data) {
				layer.closeAll();
				comm.closeLoading();
				if(data.status == 401) {
					comm.systemTimeout();
					return false;
				}
				layui.use('layer', function() {
					var layer = layui.layer;
					layer.msg("服务器异常：请联系管理员！");
					condition.ajax.error && condition.ajax.error(data);
				});

				return false;
			};
			$.ajax(ajaxData);
		});
	},
	initTableByData: function() {

	},
	fillContainerByUrl: function(param) {
		comm.initLoading();
		var $container = param.cont;
		comm.getDataByCondition({
			ajax: {
				url: $container.attr("fill-url"),
				type: $container.attr("fill-type") || "get",
				data: $container.attr("fill-data") || {},
				success: function(data) {
					comm.closeLoading();
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
	//	fillPageByData: function(data, $container, fieldName) {
	//		fieldName = fieldName || "name";
	//		(typeof data === 'object') && data['Data'] && (data = data['Data'][0]);
	//		for(var key in data) {
	//			var sepCont = $container.find('.field-cont[' + fieldName + '="' + key + '"]');
	//			if (sepCont.hasClass("field-img")) {
	//				sepCont.attr("src", data[key]);
	//			} else {
	//				sepCont.html(data[key]);
	//			}
	//		}
	//	},
	fillPageByData: function(data, $container, fieldName) {
		fieldName = fieldName || "name";
		(typeof data === 'object') && data['Data'] && (data = data['Data'][0]);
		var containers = $container.find('.field-cont');
		containers.each(function() {
			var sepCont = $(this),
				key = sepCont.attr(fieldName);
			if(sepCont.hasClass("field-img")) {
				if(data[key]) {
					sepCont.attr("src", data[key]);
				} else {
					sepCont.attr("src", "./static/img/no-img.png");
				}

			} else {
				if(data[key]) {
					sepCont.html(data[key]);
				} else {
					sepCont.html("");
				}
			}
		});
	},
	fillFormByData: function(data, $container, fieldName) {
		fieldName = fieldName || "name";
		(typeof data === 'object') && data['Data'] && (data = data['Data'][0]);
		for(var key in data) {
			var sepCont = $container.find('.field-cont[' + fieldName + '="' + key + '"]');
			if(!data[key] || !sepCont.length) continue;
			sepCont.val("");
			sepCont.hasClass("upload-img-url") &&
				sepCont.parent("a").next("img").attr("src", "./static/img/no-img.png");

			if(sepCont.hasClass("upload-img-url")) {
				var $img = sepCont.parent("a").next("img");
				$img.attr("src", data[key]).attr("onerror", "imgerror(this)");
				$img.prev("a").children(".upload-img-url").val(data[key]);
			} else {
				if(sepCont.prop("tagName") == 'SELECT') {
					sepCont.find('option[value=' + data[key] + ']').attr("selected", "selected");
				} else if(sepCont.prop("tagName") === 'INPUT') {
					sepCont.val(data[key]);
				}
				sepCont.data("data", data[key]);
			}

			(sepCont.attr('lay-filter') == "relate-province") &&
			comm.relateSelect({
				container: [sepCont, $container.find('.field-cont[lay-filter="relate-city"]')]
			});
			//			layui.use('form', function() {
			//				var form = layui.form;
			//				form.render('select');
			//			});
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
		comm.initLoading();
		layui.use('form', function() {
			var form = layui.form;
			var filterForm = document.getElementById(param.formId);
			$("#" + param.formId + " .form-condition:not(.auto-click-condition)").each(function() {
				$(filterForm).append('<input type="hidden" name="' + $(this).attr("name") + '">');
			});

			$("#" + param.formId + " .form-condition:not(.auto-click-condition) li").on("click", function() {
				$(this).addClass("active").siblings("li").removeClass("active");
				$("#" + param.formId + ' input[name="' + $(this).parent(".form-condition").attr("name") + '"]').val($(this).attr("data-value"));
				$("#" + param.formId + " .filter-btn").click();
			});

			$("#" + param.formId + " .form-condition.auto-click-condition li").on("click", function() {
				var $this = $(this);
				var clickArr = $(this).attr("click-name").split(",");
				var dataArr = $(this).attr("data-value").split(",");
				var $sibs = $this.siblings('input.auto-click-input');
				$sibs.each(function() {
					$(this).val("");
				});
				$this.addClass("active").siblings("li").removeClass("active");
				clickArr.map(function(v, index) {
					if(!$("#" + param.formId + " input[name=" + v + "]").length) {
						$this.after('<input type="hidden" name="' + v + '" class="auto-click-input">');
					}
					$('input.auto-click-input[name="' + v + '"]').val(dataArr[index]);
				});
				$("#" + param.formId + " .filter-btn").click();
			});

			//			$("#" + param.formId + " .form-condition.auto-click-condition li").on("click", function() {
			//				$(this).addClass("active").siblings("li").removeClass("active");
			//				$(this).siblings(".auto-click-input[name=" + $(this).attr("click-name") + "]").val($(this).attr("data-value")).attr("name", $(this).attr("click-name"));
			//				$("#" + param.formId + " .filter-btn").click();
			//			});
			form.on('select()', function(data) {
				$("#" + param.formId + " .filter-btn").click();
			});
			form.render();

			if(param.renderTable) {
				var array = param.renderTable.cols[0];
				param.order && array.unshift({
					type: 'numbers',
					title: '',
				});
				param.checkbox && array.unshift({
					checkbox: true
				});
			}

			$(filterForm).on("click", ".filter-btn", function() {
				var $this = $(this);
				if(param.renderTable) {
					comm.renderTablePre({
						filterForm: filterForm,
						param: param
					});
				}
				param.callback && param.callback();
			});
			$("#" + param.formId + " .filter-btn").click();

			$("#" + param.formId + " .layui-btn[type=reset]").on("click", function(e) {
				e.preventDefault();
				$("#" + param.formId + " ul li:first-child").addClass("active");
				$("#" + param.formId)[0].reset();
				$("#" + param.formId + " .filter-btn").click();
			});
		});
	},
	renderTablePre: function(params) {
		var filterForm = params.filterForm,
			param = params.param,
			baseUrl = "",
			baseMethod = "";
		if(filterForm) {
			baseUrl = filterForm.getAttribute("url");
			baseMethod = filterForm.getAttribute("my-type") || "get";
		}
		param.url && (param.url = path + param.url);
		param.renderTable.request = $.extend({
			pageName: 'Page',
			limitName: 'page_size'
		}, param.renderTable.request);
		var renderData = $.extend({
			url: path + baseUrl,
			method: baseMethod,
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
				param.succ && param.succ(data);
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
	renderTableSimple: function(param) {

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
					loading: true,
					ajax: {
						url: $form.attr("submit-url"),
						type: $form.attr("submit-type") || "get",
						data: formData,
						success: function(data) {
							comm.closeLoading();
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
				nameArr = [];

			relateList.map(function(v) {
				provinceSel += '<option value="' + v.regionname + '">' + v.regionname + '</option>';
				nameArr.push(v.regionname);
			});

			$(container0).attr("lay-filter", "relate-province").html(provinceSel);
			$(container0).data("provinceArr", nameArr);
			$(container0).data("regionData", relateList);

			if($(container0).data("data")) {
				$(container0).val($(container0).data("data"));

				var citySel = '<option value="">请选择市</option>';
				var cityList = relateList[nameArr.indexOf($(container0).data("data"))]['children'];
				cityList.map(function(v) {
					citySel += '<option zipcode="' + v.zipcode + '" value="' + v.regionname + '">' + v.regionname + '</option>';
				});
				$(container1).html(citySel);
				form.render('select');
			}
			$(container1).attr("lay-filter", "relate-city").html('<option value="">请选择市</option>');
			$(container1).data("data") && $(container1).val($(container0).data("data"));
			form.render('select');

			form.on('select(relate-province)', function(data) {
				var citySel = '<option value="">请选择市</option>';
				var cityList = relateList[nameArr.indexOf(data.value)]['children'];
				cityList.map(function(v) {
					citySel += '<option zipcode="' + v.zipcode + '" value="' + v.regionname + '">' + v.regionname + '</option>';
				});
				$(container1).html(citySel);
				form.render('select');
			});

			if(param.zipcode) {
				form.on('select(relate-city)', function(data) {
					$(zipcode).val($(data.elem).find("option:selected").attr("zipcode"));
				});
			}
		});
	},
	/**
	 * 对于省市联动回填时默认select
	 * @param {
	 * 	container: ["#cont1", "#cont2"]
	 * } 
	 */
	relateSelect: function(param) {
		layui.use('form', function() {
			var form = layui.form,
				container0 = param.container[0],
				container1 = param.container[1],
				nameArr = $(container0).data("provinceArr"),
				relateList = $(container0).data("regionData"),
				defaultValue = $(container0).data("data");

			if(!nameArr || !nameArr.length) {
				var interval = setInterval(function() {
					if($(container0).data("provinceArr") && $(container0).data("provinceArr").length) {
						clearInterval(interval);
						setSel($(container0).data("provinceArr"), $(container0).data("regionData"), defaultValue);
					}
				}, 500);
			} else {
				setSel(nameArr, relateList, defaultValue);
			}

			function setSel(nameArr, relateList, defaultValue) {
				$(container0).val(defaultValue);
				var citySel = '<option value="">请选择市</option>';
				if(!relateList[nameArr.indexOf(defaultValue)]) return false;
				var cityList = relateList[nameArr.indexOf(defaultValue)]['children'];
				cityList.map(function(v) {
					citySel += '<option zipcode="' + v.zipcode + '" value="' + v.regionname + '">' + v.regionname + '</option>';
				});
				$(container1).html(citySel);
				$(container1).data("data") && $(container1).val($(container1).data("data"));
				form.render('select');
			}

		});
	},
	/**
	 * 带普通搜索条件的省市联动
	 */
	searchRelateSelect: function(param) {
		comm.getDataByCondition({
			ajax: {
				url: "/api/BasicRegion/GetTreeView?parent=中国",
				type: "get",
				success: function(data) {
					//初始化省市联动
					comm.initRelateSelect({
						container: param.container,
						data: data[0].children,
						zipcode: param.zipcode
					});
				}
			}
		});
	}
}

function imgerror(img) {
	img.src = "./static/img/illegal-img.png";
	img.onerror = null;
}