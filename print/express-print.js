comm.getDataByCondition({
	loading: true,
	ajax: {
		url: '/api/OrderTransportOrder/Details',
		type: 'get',
		data: {
			modelId: id
		},
		success: function(data) {
			window.location.href = "./index.html";
		}
	}
});


Depotid	Guid？	仓库id
delivername	String	发件人姓名
delivermobile	String	发件人电话
deliveraddress	String	发件人地址
deliverpostcard	String	发件人邮编
deliveremail	String	发件人邮箱
receivername	String	收件人姓名
receivercompany	String	收件人公司
receivemobile	String	收件人手机
receiveaddress	String	收件人地址
receiverregion_national	String	收件人国家
receivertele	String	收件人座机
receiveremail	String	收件人邮箱
receiverregion_province	String	收件人省
receiverregion_city	String	收件人市
receiverpostcard	String	收件人邮编
receiveridcardtype	IDCardTypeEnum？	收件人证件类型1身份证2护照
receiveridcardnum	String	收货人证件号码
receiveridcard_zheng	String	收件人身份证正面
receiveridcard_fan	String	收件人身份证反面
Weight	Decimal？	重量
long	Decimal？	打包后的长度
width	Decimal？	打包后的宽度
height	Decimal？	打包后的高度
volumeweight	Decimal？	打包后的体积重量
number		
cnum		运单号
note		备注
enterdate		入库时间
freeservice		增值费用
freeservicenote		增值服务明细
detail		明细
moneynote		费用记录
createtime		创建时间
createby		创建人
updatetime		修改时间
updateby		修改人
username		用户名
depotname		仓库名
routename		线路名
details		详情列表
Restmoney	Decimal	余额
RegisterUserTransport	string	注册用户转运功能
RegisterUserDelivery	string	注册用户快递功能
ExchangeRateForRMB	string	对人民币汇率
InsuranceRatio	string	保险比例
TransportOrderListStyle	string	运单列表展示样式
SystemEmail	string	系统邮件
SystemEmailSMTP	string	系统邮件SMTP
SystemEmailPassword	string	系统邮件密码
BulletinIsShow	string	站内公告
RegisterReview	string	注册是否需要审核
BulletinContent	string	站内公告
RegisterProtocol	string	注册协议
WeightSign	string	重量单位
MoneySign	string	货币符号
Currency	string	币种