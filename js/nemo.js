var nemo = {
	/**
	 * 设置选择时间区间的两个input
	 * 例  nemo.timeRange("#start","#end");
	 */
	timeRange: function(container0, container1) {
		layui.use('laydate', function() {
			var laydate = layui.laydate;
			var a = laydate.render({
				elem: container0,
				done: function(value, date, endDate) {
					b.config.min = {
						year: date.year,
						month: date.month - 1,
						date: date.date
					}
				}
			});
			var b = laydate.render({
				elem: container1,
				done: function(value, date, startDate) {
					a.config.max = {
						year: date.year,
						month: date.month - 1,
						date: date.date
					}
				}
			});
		});
	},
	/**
	 * 带大小限制的时间区间
	 * @param {Object} param0 例 {container: "#a", max: "20170102", min: "20160102"}
	 * @param {Object} param1
	 */
	timeRangeMaxMin: function(param0, param1) {
		layui.use('laydate', function() {
			var laydate = layui.laydate;
			var a = laydate.render({
				elem: param0.container,
				min: param0.min,
				max: param0.max,
				done: function(value, date, endDate) {
					b.config.min = {
						year: date.year,
						month: date.month - 1,
						date: date.date,

					}
				}
			});
			var b = laydate.render({
				elem: param1.container,
				min: param1.min,
				max: param1.max,
				done: function(value, date, startDate) {
					a.config.max = {
						year: date.year,
						month: date.month - 1,
						date: date.date,

					}
				}
			});
		});
	},
	ajax: function(param) {
		$.ajax($.extend({
			type: 'post',
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", sessionStorage.getItem("userToken"));
			},
			type: 'post',
			//data: '{}',
			contentType: 'application/json;charset=utf-8',
		}, param));
	},
	/**
	 * @param param
	 * container 例： ".a", "#b"
	 * struct  例 {word: ["name", "age"], img: ["photo"], link: ["myadress"]},
	 * order 排序用  例 [{title:"姓名",name:"name",width:100,cssStyle:"height:30px;color:red",tdWidth:100,tdCssStyle:"height:30px;color:red"}]
	 * json {name: "a", age: "12", photo: "e:\project\photo.png", myAdress: "e:\project\photo.png"}
	 * 
	 */
	initTableCol: function(param) {
		var container = param.container,
			struct = param.struct,
			order = param.order,
			data = param.data;

		$(container).addClass("nemo-col-table").html("");

		for(var i = 0, len = order.length; i < len; i++) {
			var valI = order[i].name;
			if((!data[valI]) || (data[valI] == "undefined")) {
				data[valI] = "";
			}
			$(container).append("<tr><th width='" + order[i].width + "' style='" + order[i].cssStyle + "'>" + order[i].title + "</th><td name=" + valI + " width='" + order[i].tdWidth + "' style='" + order[i].tdCssStyle + " text-align:" + order[i].align + "'></td></tr>");

			var $lastTh = $(container + " tr:last-child th");
			var $lastTd = $(container + " tr:last-child td");

			if((struct.word) && ((struct.word).indexOf(valI) != -1)) {
				$lastTd.html(data[valI]);
			} else if(struct.img && (struct.img.indexOf(valI) != -1)) {
				(function(datas, $lastTd) {
					var $lastTd = $lastTd;
					var url = 'http://192.168.100.104:8083/xsjr/getImage?path=' + datas;
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, true);
					xhr.responseType = "blob";
					xhr.setRequestHeader("Authorization", sessionStorage.getItem("userToken"));
					xhr.onload = function(e) {
						var blob = this.response;
						var img = document.createElement("img");
						img.onload = function(e) {
							window.URL.revokeObjectURL(img.src);
						};
						img.src = window.URL.createObjectURL(blob);
						$lastTd.addClass("table-img-td").html(img);
					}
					xhr.send();
				})(data[valI], $lastTd, $lastTh);

			}
		}
	},
	/**
	 * 生成多列详情表格（带连行连列）
	 * @param param
	 * container 例： ".a", "#b"
	 * tableCol: 2  表示表有4列，包括标题与内容
	 * struct  例 {word: ["name", "age"], img: ["photo"], link: ["myadress"]},
	 * order 排序用  例 [{title:"姓名",name:"name",colspan:3 //默认为1，可不传,width:100,cssStyle:"height:30px;color:red",tdWidth:100,tdCssStyle:"height:30px;color:red"}]  
	 * json {name: "a", age: "12", photo: "e:\project\photo.png", myAdress: "e:\project\photo.png"}
	 */
	initTableColX: function(param) {
		var container = param.container,
			struct = param.struct,
			order = param.order,
			tableCol = param.tableCol,
			data = param.data;

		$(container).addClass("nemo-col-table").html("");
		if(!data) {
			$(container).html("暂无数据");
			return false;
		}

		var hasCol = 0,
			tableStr = "";
		for(var i = 0, len = order.length; i < len; i++) {
			order[i].colspan = order[i].colspan ? order[i].colspan : 1;
			var valI = order[i].name;
			if((!data[valI]) || (data[valI] == "undefined")) {
				data[valI] = "";
			}
			(hasCol == 0) && (tableStr += "<tr>");
			tableStr += "<th width='" + order[i].width + "' style='" + order[i].cssStyle + "'>" + order[i].title + "</th><td colspan=" + order[i].colspan + " name=" + order[i].name + " width=" + order[i].tdWidth + " style='" + order[i].tdCssStyle + ";text-align:" + order[i].align + "'>" + data[valI] + "</td>";
			hasCol += 1 + order[i].colspan;

			if(hasCol == tableCol * 2) {
				hasCol = 0;
				tableStr += "</tr>";
			}
		}
		$(container).html(tableStr);
		param.downloadExcel && nemo.downloadExcel(param.downloadExcel, data);
	},
	/**
	 * 根据提供的对象数据填充表单元素（输入元素、select）
	 * @param  
	 * contId  表单id 例："#form"
	 * obj        {obj} 填充数据
	 * struct    例子 {inputArr: [a,b,c], selectArr: [d,e,f], radioArr: [d,e,f]}
	 */
	fillFormX: function(contId, obj, struct) {
		if(struct.inputArr) {
			for(var i = 0, len = struct.inputArr.length; i < len; i++) {
				var sepName = struct.inputArr[i];
				$(contId + ' input[name = "' + sepName + '"]').val(obj[sepName]);
			}
		}
		if(struct.radioArr) {
			for(var i = 0, len = struct.radioArr.length; i < len; i++) {
				var sepName = struct.radioArr[i];
				$(contId + ' input[name="' + sepName + '"][value="' + obj[sepName] + '"]').attr("checked", 'checked');
			}
		}
		if(struct.checkboxArr) {
			for(var i = 0, len = struct.checkboxArr.length; i < len; i++) {
				var sepName = struct.checkboxArr[i];
				for(j = 0, len1 = obj[sepName].length; j < len1; j++) {
					$(contId + ' input[name="' + sepName + '"][value="' + obj[sepName][j] + '"]').attr("checked", 'checked');
				}
			}
		}
		if(struct.selectArr) { //普通select的填充
			for(var i = 0, len = struct.selectArr.length; i < len; i++) {
				var sepName = struct.selectArr[i];
				$(contId + ' select[name="' + sepName + '"]').val(obj[sepName]);
			}
		}
		if(struct.areaArr) {
			for(var i = 0, len = struct.areaArr.length; i < len; i++) {
				nemo.initThreeArea(struct.areaArr[i]);
				nemo.pushThreeArea(struct.areaArr[i], obj);
			}
		}
		if(struct.imgArr) {
			for(var i = 0, len = struct.imgArr.length; i < len; i++) {
				var sepName = struct.imgArr[i];
				$(contId + ' img[name="' + sepName + '"]').attr("src", obj[sepName]);
			}
		}

	},
	/**
	 * 填充页面
	 * @param {Object} "" 被填充的容器
	 * @param {Object} 数据
	 */
	fillPage: function(container, data) {
		for(var key in data) {
			$(container + " *[name=" + key + "]").text(data[key]);
		}
	},
	/**
	 * 获取表单中元素的json形式，去掉空值
	 * @param {Object} elem 例： "#form"
	 */
	getFormData: function(elem) {
		var dataObj = {};
		$(elem + " input:not(.layui-unselect)").each(function() {
			var $this = $(this);
			if($.trim($this.val()) != "") {
				dataObj[$this.attr("name")] = $this.val();
			}
		});
		$(elem + " select").each(function() {
			var $this = $(this);
			if($.trim($this.val()) != "") {
				dataObj[$this.attr("name")] = $this.val();
			}
		});
		return JSON.stringify(dataObj);
	},
	/**
	 * 退出系统
	 */
	exitSystem: function() {
		$.ajax({
			url: "./logout",
			success: function() {
				sessionStorage.clear();
				window.location.href = "login.html";
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
		layui.use('layer', function() {
			layer.alert("系统超时或非法访问！系统将在<span id='interval_time'>9</span>秒后自动退出", {
				skin: 'layui-layer-dahong',
				icon: 2,
				btn: ['立即退出'],
				closeBtn: 0
			}, function() {
				nemo.exitSystem();
			});

			var i = 9;
			var interval = setInterval(function() {
				i--;
				$("#interval_time").text(i);
				if(i === 0) {
					clearInterval(interval);
					nemo.exitSystem();
				}
			}, 1000);
		});
		return false;
	},
	/*非法访问*/
	denyAccess: function() {
		layui.use('layer', function() {
			layer.alert("非法访问！系统将在<span id='interval_time'>9</span>秒后自动退出", {
				skin: 'layui-layer-dahong',
				icon: 2,
				btn: ['立即退出'],
				closeBtn: 0
			}, function() {
				nemo.exitSystem();
			});

			var i = 9;
			var interval = setInterval(function() {
				i--;
				$("#interval_time").text(i);
				if(i === 0) {
					clearInterval(interval);
					nemo.exitSystem();
				}
			}, 1000);
		});
		return false;
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

	getUrlParamX: function(name, urlStr) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = urlStr.substring(urlStr.indexOf("?")).substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	},

	//全屏
	fullScreen: function() {
		var docElm = document.documentElement;
		if(docElm.requestFullscreen) {
			docElm.requestFullscreen();
		} else if(docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		} else if(docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullScreen();
		} else if(docElm.msRequestFullscreen) {
			docElm.msRequestFullscreen();
		}
		$("#fullscreen_btn").addClass("hide");
		$("#cancel_fullscreen_btn").removeClass("hide").addClass("show");
	},
	//退出全屏
	cancelFullScreen: function() {
		if(document.exitFullscreen) {
			document.exitFullscreen();
		} else if(document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		} else {
			window.parent.showTopBottom();
			isflsgrn = false;
		}
		$("#fullscreen_btn").removeClass("hide");
		$("#cancel_fullscreen_btn").addClass("hide");

	},
	//关闭web页
	closeWebPage: function() {
		if(navigator.userAgent.indexOf("MSIE") > 0) {
			if(navigator.userAgent.indexOf("MSIE 6.0") > 0) {
				window.opener = null;
				window.close();
			} else {
				window.open('', '_top');
				window.top.close();
			}
		} else if(navigator.userAgent.indexOf("Firefox") > 0) {
			window.location.href = 'about:blank ';
		} else {
			window.opener = null;
			window.open('', '_self', '');
			window.close();
		}
	},
	treeTable: function(param) {
		layui.use(['layer', 'table'], function() {
			var layer = layui.layer,
				table = layui.table;
			if($('#fpxx_expand').length == 0)
				$("body").append('' +
					'<script type="text/html" id="fpxx_expand">' +
					'<div expandData={{JSON.stringify(d)}}>' +
					'<i class="fa fa-plus-square-o expand-logo" style="margin: 0;"></i>' +
					'<i class="fa fa-minus-square-o hide shrink-logo" style="margin: 0;"></i>' +
					'</div>' +
					'</script>');
			if(param.cols[0][0].field != 'expand')
				param.cols[0].unshift({
					field: 'expand',
					title: '',
					width: 45,
					templet: "#fpxx_expand",
				});
			param.size = 'sm';

			table.render(param);
			$("#tab_box_content>.layui-show .layui-table").on("click", "td[data-field = expand] .layui-table-cell", function(e) {
				var $this = $(this);
				e.stopPropagation();
				$this.children().children("i:not(.hide)").addClass("hide").siblings("i").removeClass("hide");
				if($this.children().children("i:not(.hide)").hasClass("shrink-logo")) { //点击展开
					if($this.parent("td").parent("tr").next("tr").hasClass("expand-tr")) {
						$this.parent("td").parent("tr").next(".expand-tr").removeClass("hide");
					} else {
						$("#tab_box_content>.layui-show .layui-real-table .expand-tr.active").removeClass("active");
						$this.parent("td").parent("tr").after("" +
							"<tr class='expand-tr active'>" +
							param.expandContent +
							"</tr>");

						param.expand($(this).children('div').attr("expandData"));
					}
				} else { //点击闭合
					if($this.parent("td").parent("tr").next("tr").hasClass("expand-tr")) {
						$this.parent("td").parent("tr").next(".expand-tr").addClass("hide");
					}
				}
			});

		});
	},
	/**
	 * 取出json字符串中的某个属性
	 * 例 var a = '{"name": "aaa", "age": 12}' 
	 * nemo.jsonElem(name, a) 返回“aaa”
	 */
	jsonElem: function(elemName, jsonStr) {
		var jsonStr = jsonStr.replace(/'/g, '"');
		return(eval('(' + jsonStr + ')')[elemName]);
	},
	/**
	 * json转化为对象
	 */
	jsonToObj: function(jsonStr) {
		return $.parseJSON(jsonStr);
	},
	//生成简单的一览表格
	initTableProcessSimple: function(param) {
		nemo.initPartialLoad(param.loadingContainer);

		layui.use('table', function() {
			var table = layui.table;
			if(param.searchUrl) {
				$.ajax({
					url: param.searchUrl,
					success: function(result) {
						if(result.no == "-2") {
							nemo.systemTimeout();
							return false;
						} else if(result.no != "1") {
							error();
							return false;
						}
						renderTable(param, result.obj);
					},
					error: function() {
						error();
					}
				});
			} else {
				renderTable(param, param.data)
			}

			function renderTable(param, rlt) {
				var tableParam = $.extend({
					data: rlt,
					size: 'sm'
				}, param.getSearchTable);

				table.render(tableParam);
				nemo.closePartialLoad(param.loadingContainer);
				param.downloadExcel && nemo.downloadExcel(param.downloadExcel, rlt);
			}

		});

		function error() {
			nemo.initPartialLoadError(param.loadingContainer, function(e) {
				nemo.initTableProcessSimple(param);
			});
		}

	},
	//生成可查询表格的全程;
	initTableProcess: function(param) {
		layui.use(['layer', 'table'], function() {
			var layer = layui.layer,
				table = layui.table;

			param.beforeSearch && param.beforeSearch();
			getFilterCondition();

			var cont = ($("#tab_box_content").length == 0) ? "" : "#tab_box_content>.layui-show";
			var getSearchResult = function() {
				nemo.initPartialLoad(cont + " .data-container");
				var searchData = param.searchData ? param.searchData() : $(cont + " .filter-form").serialize();
				$.ajax({
					url: param.searchUrl,
					data: searchData,
					success: function(result) {
						if(result.no == "-2") {
							nemo.systemTimeout();
							return false;
						} else if(result.no != "1") {
							error();
							return false;
						}
						var rlt = result.obj;
						var getSearchTable = function(pageLimit) {
							var tableParam = $.extend({
								data: rlt,
								page: true,
								limit: pageLimit,
								size: 'sm'
							}, param.getSearchTable);

							if(param.getSearchTable.type && (param.getSearchTable.type === 'tree-table')) {
								nemo.treeTable(tableParam);
							} else {
								table.render(tableParam);
							}
							param.getSearchTableCallback &&
								param.getSearchTableCallback(rlt, searchData);
						};
						nemo.closePartialLoad(cont + " .data-container");
						checkAllData(rlt.length);

						$(cont + " .filter-form .check-all-data").on("click", function() {
							getSearchTable(1000000);
						}).show();
						getSearchTable(10);

						param.downloadExcel && nemo.downloadExcel(param.downloadExcel, rlt);
					},
					error: function() {
						error();
					}
				});

				function error() {
					nemo.initPartialLoadError(cont + " .data-container", function(e) {
						getSearchResult();
					});
				}
			};

			$(cont + " .filter-form .filter-btn").on("click", function() {
				getSearchResult();
			}).click();

		});
	},
	/**
	 * param
	 *  {
			elem: 'div[name="export-zzsxxfpfzcx"]',
			pageData: true,
			allData: true,
			title: function() {
				return [$('#tab_box_content>.layui-show .layui-real-table th select[name="fzfs"]').val(), '份数', '金额', '税额', '环比趋势'];
			},
			data: function() {
				return ['fzxm', 'fs', 'je', 'se', 'hbqs'];
			}
		},
		rlt: 后台返回的json数据
		
	 * 1.准备下载 
	 * 2.格式化下载数据，格式化之后传入进行下载，格式化之后
	 */
	downloadExcel: function(param, rlt) {
		var btnText = (param.btnStyle == 2) ?
			'<i class="fa fa-download layui-badge gradient-red"></i>' :
			'<a class="layui-badge gradient-red" href="#"><i class="fa fa-download"></i>导出数据</a>';

		$(param.elem).addClass("export-all-data")
			.html(btnText);
		//		param.pageData && $(param.elem).prepend('<a class="layui-badge gradient-blue export-page-data" href="#"><i class="fa fa-download"></i>导出本页数据</a>');

		var titleArr0 = (typeof param.title === 'function') ? param.title() : param.title,
			titleArr = [],
			dataArr0 = (typeof param.data === 'function') ? param.data() : param.data,
			dataArr = [],
			fileName = param.name || "表格";

		titleArr0.map(function(item, index, arr) {
			titleArr.push({
				"value": item,
				"type": "ROW_HEADER_HEADER",
				"datatype": "string"
			});
		});

		for(var i = 0, len = rlt.length; i < len; i++) {
			dataArr[i] = [];
			dataArr0.map(function(item, index, arr) {
				var dataName = dataArr0[index];
				var dataI = (typeof dataName === 'string') ?
					rlt[i][dataName] :
					dataName(rlt[i]);

				dataArr[i].push({
					"value": dataI ? dataI.toString() : ((dataI === 0) ? "0" : ""),
					"type": "ROW_HEADER",
					"datatype": "string"
				});
			});
		}

		$(param.elem + ".export-all-data").on("click", function(e) {
			e.stopPropagation();
			nemo.JSONToExcelConvertor($(this), dataArr, fileName, titleArr);
		});

	},
	statusMsg: function(rlt) {
		layui.use('layer', function() {
			if(rlt.no == "-2") {
				nemo.systemTimeout();
				return false;
			} else if(rlt.no != "1") {
				layer.msg(rlt.msg);
				return false;
			}
		});
	},
	/**
	 * 实现局部加载效果
	 * @param  局部加载的容器 "#aaa"
	 */
	initPartialLoad: function(container) {
		var loadingStr = '<div class="loading-container"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>';
		$(container).append(loadingStr);
	},
	/**
	 * 关闭局部加载效果
	 * @param  局部加载的容器 "#aaa"
	 */
	closePartialLoad: function(container) {
		$(container + ">.loading-container").remove();
	},
	/**
	 * 实现局部加载错误信息的提示
	 * @container  局部加载的容器 "#aaa"
	 * @function   加载失败按钮绑定函数
	 */
	initPartialLoadError: function() {
		var container = arguments[0];
		$(container).html("" +
			"<div class='loading-container'>" +
			"<div class='loading-error'>" + "<button class='layui-btn layui-btn-sm' style='margin-right: 5px;'>" +
			"<i class='fa fa-repeat'></i>重试</button><span>加载失败，请点击重试...</span>" +
			"</div>" +
			"</div>");
		if(arguments.length == 2) {
			var func = arguments[1];
			$(container + " .loading-error .layui-btn").on("click", function() {
				func();
			});
		}
	},

	changeMoneyToChinese: function(n) {
		if(!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
			return "数据非法";
		var unit = "千百拾亿千百拾万千百拾元角分",
			str = "";
		n += "00";
		var p = n.indexOf('.');
		if(p >= 0)
			n = n.substring(0, p) + n.substr(p + 1, 2);
		unit = unit.substr(unit.length - n.length);
		for(var i = 0; i < n.length; i++)
			str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
		return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
	},
	exportExcel: function() {
		//导出本页数据
		$(".export-page-data").on("click", function() {
			// <td style="mso-number-format:'\@';"> 数值 </td>  
			$("table tr td").attr('style', "mso-number-format:'\@';");
			// .tableexcel是需要导出table的class  
			$(".export-page-data").table2excel({
				// 需要导出的列  
				// columns:"1,2,3"
				// 不被导出的表格行的CSS class类  
				exclude: ".noExl",
				// 导出的Excel文档的名称  
				name: "Excel",
				// Excel文件的名称  
				fileName: "Excel",
				// 是否导出图片  
				exclude_img: true,
				// 是否导出超链接  
				exclude_links: true,
				// 是否导出输入框中的内容  
				exclude_inputs: true
			});
		});
	},
	JSONToExcelConvertor: function($this, JSONData, fileName, ShowLabel) {
		//先转化json
		var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
		var excel = '<table>';
		//设置表头
		var row = "<tr>";
		for(var i = 0, l = ShowLabel.length; i < l; i++) {
			row += "<td>" + ShowLabel[i].value + '</td>';
		}
		//换行
		excel += row + "</tr>";
		//设置数据
		for(var i = 0; i < arrData.length; i++) {
			var row = "<tr>";
			for(var index in arrData[i]) {
				var value = arrData[i][index].value === "." ? "" : arrData[i][index].value;
				row += '<td>' + value + '</td>';
			}

			excel += row + "</tr>";
		}
		excel += "</table>";
		var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>" +
			'<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
			"<head>" +
			"<!--[if gte mso 9]>" +
			"<xml>" +
			"<x:ExcelWorkbook>" +
			"<x:ExcelWorksheets>" +
			"<x:ExcelWorksheet><x:Name>{worksheet}</x:Name>" +
			"<x:WorksheetOptions>" +
			"<x:DisplayGridlines/>" +
			"</x:WorksheetOptions>" +
			"</x:ExcelWorksheet>" +
			"</x:ExcelWorksheets>" +
			"</x:ExcelWorkbook>" +
			"</xml>" +
			"<![endif]-->" +
			"</head>" +
			"<body>" + excel + "</body>" +
			"</html>";
		var uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile);

		//		$.ajax({
		//			url: 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile),
		//			type: 'post',
		//		})

		if(window.navigator.msSaveOrOpenBlob) {
			// if browser is IE
			var blob = new Blob([decodeURIComponent(uri)], {
				type: "text/csv;charset=utf-8;"
			});
			navigator.msSaveBlob(blob, fileName + ".xls"); //fileName文件名包括扩展名，下载路径为浏览器默认路径
		} else {
			var link = document.createElement("a");
			link.href = uri;

			link.style = "visibility:hidden";
			link.download = fileName + ".xls";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

	}
}

//一页展示全部数据
function checkAllData(num) {
	if(num > 10) {
		if($("#tab_box_content>.layui-show .filter-form .check-all-data").length === 0) {
			$("#tab_box_content>.layui-show .filter-form .reset-btn").after('<button type="button" class="layui-btn layui-btn-sm check-all-data">展示全部数据</button>');
		}
	} else {
		$("#tab_box_content>.layui-show .filter-form .check-all-data").remove();
	}
}

function sortByProperty(property) {
	return function(a, b) {
		var value1 = a[property];
		var value2 = b[property];
		return value1 - value2;
	}
}

function getFilterCondition() {
	layui.use('form', function() {
		form = layui.form;
		var cont = ($("#tab_box_content").length === 0) ? ".filter-form" : "#tab_box_content>.layui-show .filter-form";
		$(cont + " .search-filter-condition").each(function() {
			var $this = $(this);
			$.ajax({
				url: $this.attr("url"),
				type: 'post',
				data: '{}',
				contentType: 'application/json;charset=utf-8',
				success: function(result) {
					//					if(($this[0].tagName === "INPUT") && ($this.hasClass("search-filter-inputlist"))) {
					//						$this.after("<datalist id='" + $this.attr("list") + "'></datalist");
					//						var conditionStr = "";
					//						for(var i = 0, len = result.obj.length; i < len; i++) {
					//							conditionStr += '<option value="' + result.obj[i][$this.attr("altername")] + '">' + result.obj[i][$this.attr("show")] + '</option>';
					//						}
					//
					//						$this.next("datalist").html(conditionStr);
					//						$this.on("change", function() {
					//							if($this.next("datalist").find("option[value='" + $this.val() + "']").length === 0) {
					//								$this.prev("input").val("");
					//								return false;
					//							}
					//							$this.prev("input").val($this.val());
					//							$this.val($this.next("datalist").find("option[value='" + $this.val() + "']").text());
					//							$(cont + " .filter-btn").click();
					//						});
					//					} else
					if($this[0].tagName === "UL") {
						var conditionStr = "<li class='active'>不限</li>";
						for(var i = 0, len = result.obj.length; i < len; i++) {
							conditionStr += '<li value="' + result.obj[i][$this.attr("value")] + '">' + result.obj[i][$this.attr("show")] + '</li>';
						}
						$this.html(conditionStr);
					} else if($this[0].tagName === "SELECT") {
						if(!$this.attr("lay-filter")) $this.attr("lay-filter", $this.attr('value'));
						var conditionStr = "<option value=''>不限</option>";

						for(var i = 0, len = result.obj.length; i < len; i++) {
							conditionStr += '<option value="' + result.obj[i][$this.attr("values")] + '">' + result.obj[i][$this.attr("show")] + '</option>';
						}
						$this.html(conditionStr);
						form.render('select');
						form.on('select(' + $this.attr("lay-filter") + ')', function(data) {
							form.render('select');
						});
					}
				},
				error: function() {
					layer.msg("网络异常，加载查询条件失败，请刷新重试或联系系统管理员");
				}
			});
		});

		form.render('select');

		$(cont + " .filter-list ul li.active").removeClass("active");
		$(cont + " .filter-list ul li:first-child").addClass("active");

		$(cont + ".filter-list ul").on("click", "li", function() {
			$(this).addClass("active").siblings(".active").removeClass("active");
			$(cont + " input[name=" + $(this).parent().attr("name") + "]").val($(this).attr("value"));
			$(cont + " .filter-btn").click();
		});
		form.on('select', function(data) {
			$(cont + " .filter-btn").click();
		});
		$(cont + " .reset-btn").on("click", function(e) {
			resetFilterForm();
			$(cont + " .filter-btn").click();
		});

		//重置项目
		function resetFilterForm() {
			$(cont + " input," + cont + " select").val("");
			form.render('select');
			$(cont + " .filter-list ul li.active").removeClass("active");
			$(cont + " .filter-list ul li:first-child").addClass("active");
		}
	});
}

//getLastYearMonthArray(); //["201805", "201804", "201803", "201802", "201801", "201712"]
// 获取当前月份的前6个月的月份数组
function getLastYearMonthArray() {
	var d = new Date();
	var result = [];
	// d.setMonth(d.getMonth() + 1);
	for(var i = 0; i < 6; i++) {
		var dd = d.getMonth() // 当前月份
		var m;
		if(dd == 2) { // 当获取的当前月份值为2时，直接给定m的值为“02”，然后月份减2，跳过2月份的获取。
			d.setMonth(d.getMonth() - 2);
			m = "02"
		} else if(dd == 0) { // 当获取月份值为0时，先判断已存数组中是否有1月份，若有则先减1再获取月份
			if(i != 0) {
				if($.inArray(d.getFullYear() + "01", result) != -1) { // 判断是否已存在1月份
					d.setMonth(d.getMonth() - 1);
					m = d.getMonth() + 1;
					m = m < 10 ? "0" + m : m;
				} else { // 若数组中没有1月份，则直接给定m的值为“01”，保存1月份。
					m = "01"
				}
			} else { // 若一月份为第一个，则不显示。
				d.setMonth(d.getMonth() - 1);
				m = d.getMonth() + 1;
				m = m < 10 ? "0" + m : m;
			}
		} else {
			d.setMonth(d.getMonth() - 1);
			m = d.getMonth() + 1;
			m = m < 10 ? "0" + m : m;
		}
		if(i == 0) {
			lastMonth = "" + d.getFullYear() + m; // 获取当月月份
		} else if(i == 11) {
			lastYearLastMonth = "" + d.getFullYear() + m; // 获取去年当月时间
		}
		// 在这里可以自定义输出的日期格式
		result.push(d.getFullYear() + "" + m);
		//					 result.push(d.getFullYear() + "年" + m + '月');
	}
	result = result.reverse();
	return result; // 返回反向排列的数组
}
// 获取当前月份的前12个月的月份数组
function getLastYearMonthArray12() {
	var d = new Date();
	var result = [];
	// d.setMonth(d.getMonth() + 1);
	for(var i = 0; i < 12; i++) {
		var dd = d.getMonth() // 当前月份
		var m;
		if(dd == 2) { // 当获取的当前月份值为2时，直接给定m的值为“02”，然后月份减2，跳过2月份的获取。
			d.setMonth(d.getMonth() - 2);
			m = "02"
		} else if(dd == 0) { // 当获取月份值为0时，先判断已存数组中是否有1月份，若有则先减1再获取月份
			if(i != 0) {
				if($.inArray(d.getFullYear() + "01", result) != -1) { // 判断是否已存在1月份
					d.setMonth(d.getMonth() - 1);
					m = d.getMonth() + 1;
					m = m < 10 ? "0" + m : m;
				} else { // 若数组中没有1月份，则直接给定m的值为“01”，保存1月份。
					m = "01"
				}
			} else { // 若一月份为第一个，则不显示。
				d.setMonth(d.getMonth() - 1);
				m = d.getMonth() + 1;
				m = m < 10 ? "0" + m : m;
			}
		} else {
			d.setMonth(d.getMonth() - 1);
			m = d.getMonth() + 1;
			m = m < 10 ? "0" + m : m;
		}
		if(i == 0) {
			lastMonth = "" + d.getFullYear() + m; // 获取当月月份
		} else if(i == 11) {
			lastYearLastMonth = "" + d.getFullYear() + m; // 获取去年当月时间
		}
		// 在这里可以自定义输出的日期格式
		result.push(d.getFullYear() + "" + m);
		//					 result.push(d.getFullYear() + "年" + m + '月');
	}
	result = result.reverse();
	return result; // 返回反向排列的数组
}
//给数据加逗号
function numAddCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while(rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

!!function() {
	if(document.getElementsByClassName("filter-form").length !== 0) {
		var filterForm = document.getElementsByClassName("filter-form")[0];
//		filterForm.
	}
}();
