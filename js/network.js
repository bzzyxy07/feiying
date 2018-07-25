function initNetwork(contId, address) {
	nemo.initPartialLoad("#" + contId);
	$.ajax({
		url: address,
		success: function(result) {
			nemo.closePartialLoad("#" + contId);
			var gfData = result.obj['gfglgx'],
				xfData = result.obj['xfglgx'],
				yjgfData = gfData.yjgfList,
				yjxfData = xfData.yjxfList,
				nodeArr = [],
				linkArr = [],
				nodeIdTemp = [gfData.djxh],
				linkIdTemp = [],
				nodeNumIndex = 0,
				nodeVal1 = gfData.xsje + xfData.rzje;

			nodeArr.push({
				name: gfData.nsrmc,
				number: 0,
				value: nodeVal1,
				category: 0,
				symbolSize: symbolSize(nodeVal1),
				itemStyle: {
					color: "red"
				}
			});
			getGfNodeAndLink(gfData, 1);
			getXfNodeAndLink(xfData, 1);

			yjgfData.map(function(v) {
				getGfNodeAndLink(v, 2);
			});
			yjxfData.map(function(v) {
				getXfNodeAndLink(v, 2);
			});

			function getGfNodeAndLink(dataArrs, grade) {
				var gradeName, numName, colors, parentNum;
				if(grade === 1) {
					nodeName = 'nsrmc_yjgf';
					gradeName = 'yjgfList';
					numName = 'djxh_yjgf';
					valueName = 'xsje_1';
					colors = "#ff5500";
					parentNum = 0;
				} else {
					nodeName = 'nsrmc_ejgf';
					gradeName = 'ejgfList';
					numName = 'djxh_ejgf';
					valueName = 'xsje_2';
					colors = '#fd9d5e';
					parentName = 'djxh_yjgf';
					parentNum = nodeIdTemp.indexOf(dataArrs['djxh_yjgf']);
				}
				dataArr = dataArrs[gradeName];
				if(!dataArr) return false;

				dataArr.map(function(v, index, arr) {
					if(nodeIdTemp.indexOf(v[numName]) === -1) {
						var values = v[valueName];
						nodeArr.push({
							name: v[nodeName],
							number: ++nodeNumIndex, //number 与节点的索引对应一致
							value: values,
							symbolSize: symbolSize(values),
							category: grade,
							itemStyle: {
								color: colors
							},
						});
						nodeIdTemp.push(v[numName]);
					} else {
						var index1 = nodeIdTemp.indexOf(v[numName]);
						nodeArr[index1].value += values;
						nodeArr[index1].symbolSize = symbolSize(v[nodeArr[index1].value]);
						if((index1 != 0) && (parentNum == 0)) {
							nodeArr[index1].itemStyle.color = '#f762de';
						}
					}

					linkArr.push({
						source: nodeIdTemp.indexOf(v[numName]),
						target: parentNum,
						value: "进项：￥" + values
					});
				});
			}

			function getXfNodeAndLink(dataArrs, grade) {
				var gradeName, numName, colors, parentNum;
				if(grade === 1) {
					nodeName = 'nsrmc_yjxf';
					gradeName = 'yjxfList';
					numName = 'djxh_yjxf';
					valueName = 'rzje_1';
					colors = '#0b6dd0';
					parentNum = 0;
				} else {
					nodeName = 'nsrmc_ejxf';
					gradeName = 'ejxfList';
					numName = 'djxh_ejxf';
					valueName = 'rzje_2';
					colors = '#2ab9e8';
					parentNum = nodeIdTemp.indexOf(dataArrs['djxh_yjxf']);
				}
				dataArr = dataArrs[gradeName];
				if(!dataArr) return false;

				dataArr.map(function(v, index, arr) {
					var values = v[valueName];
					if(nodeIdTemp.indexOf(v[numName]) === -1) {
						nodeArr.push({
							name: v[nodeName],
							number: ++nodeNumIndex,
							value: values,
							symbolSize: symbolSize(values),
							category: grade,
							itemStyle: {
								color: colors
							},
						});
						nodeIdTemp.push(v[numName]);
					} else {
						var index1 = nodeIdTemp.indexOf(v[numName]);
						nodeArr[index1].value += values;
						nodeArr[index1].symbolSize = symbolSize(v[nodeArr[index1].value]);
						if((index1 != 0) && (parentNum == 0)) {
							nodeArr[index1].itemStyle.color = '#f762de';
						}
					}
					linkArr.push({
						source: parentNum,
						target: nodeIdTemp.indexOf(v[numName]),
						value: "销项：￥" + values
					});
				});
			}
			creatEachart(nodeArr, linkArr);
		},
		error: function() {
			nemo.initPartialLoadError("#" + contId, function() {
				initNetwork(contId, address);
			});
		}
	});

	function creatEachart(res1, res2) {
		console.info(res1);
		console.info(res2);

		echarts.init(document.getElementById(contId)).setOption({
			title: {
				text: ''
			},
			legend: {
				top: 10,
				data: [{
					name: '系列1',
					// 强制设置图形为圆。
					icon: 'circle',
					// 设置文本为红色
					textStyle: {
						color: 'red'
					}
				}]
			},
			tooltip: {},
			animationDurationUpdate: 0,
			animationEasingUpdate: 'quinticInOut',
			series: [{
				type: 'graph',
				layout: 'force',
				symbolSize: 50, //圆圈大小
				edgeSymbol: ['circle', 'arrow'],
				focusNodeAdjacency: true, //划过只显示有相应关系部分
				roam: true, //滚轮缩放
				itemStyle: {
					normal: {
						borderColor: '#fff',
						borderWidth: 1
					}
				},
				categories: [{ //显示种类的颜色
						name: '一级',
						itemStyle: {
							normal: {
								color: "#32C5E9",
							}
						}
					}, {
						name: '二级',
						itemStyle: {
							normal: {
								color: "#FF7DA1",
							}
						}
					},
					{
						name: '三级',
						itemStyle: {
							normal: {
								color: "#2bd9cf",
							}
						}
					}
				],
				label: {
					normal: {
						show: true, //鼠标划过显示字
						textStyle: {
							fontSize: 12, //字体大小
						},

					}
				},
				force: {
					initLayout: 'circular',
					gravity: 0, //引力
					edgeLength: [170, 250], //默认距离
					repulsion: 80 //斥力

				},
				edgeSymbolSize: [0, 7],
				edgeLabel: {
					normal: {
						show: true,
						textStyle: {
							fontSize: 12 //线上面字的字体大小
						},
						formatter: "{c}"
					}
				},
				data: res1,
				links: res2,
				lineStyle: {
					color: 'source',
					curveness: 0.3,
					width: 1
				}
			}]
		});
	}

	function symbolSize(value) {
		if(value > 90000000) {
			return 120;
		} else if(value > 60000000) {
			return 100;
		} else if(value > 20000000) {
			return 80;
		} else if(value > 10000000) {
			return 70;
		} else if(value > 1000000) {
			return 60;
		} else {
			return 40;
		}
	}
}

initNetwork("network_container", './qynbgfxfglgx?djxh=10113702000071574578');
//initNetwork("network_container", 'http://192.168.100.104:8080/jtqy/qynbgfxfglgx?djxh=10113702000071574578');

$("#network_container_tab1").one("click", function(e) {
	initNetwork("network_container1", './gfxfglgx?djxh=10113702000071563397');
});