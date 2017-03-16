/**
 * 进行差异处理
 * version:1.0
 * date:2016-10-11
 * author:czz
 * modify:
 */
constant.import("eac/js/eac.js");

Ext.applyIf(eac, {
    check:{}
});

eac.check.ActCheckDetail = function(grid,data) {
    //查询差异详细信息
    var info = constant.ajax.sync("eacActCheck.queryActCheckInfo", constant.ajax.failure)(data.orderno);
    if (!info) return;
    var form = new Ext.form.Panel({
        margin:5,
        border:false,
        fieldDefaults:{
            labelAlign:"left",
            flex:1,
            msgTarget:"side",
            margin:5
        },
        items:[ {
            xtype:"fieldset",
            title:"处理方式",
            width:780,
            items:[ {
                xtype:"container",
                layout:"hbox",
                defaults:{
                    height:35
                },
                items:[{
                    xtype:"tbtext",
                    id:"tds_realName",
                    text:"用户：" + eac.fun.getVal(info.realName),
                    labelWidth:80,
                    width:200
                }, {
                    xtype:"tbtext",
                    id:"tds_certId",
                    text:"证件号码：" + eac.fun.getVal(info.certId),
                    labelWidth:80,
                    width:300
                }, {
                    xtype:"tbtext",
                    text:"交易类型：<span class=red>" + DICT.getText(info.transType, "brh_transtype") + "</span>",
                    labelWidth:80,
                    width:200
                } ]
            }, {
                xtype:"container",
                layout:"hbox",
                defaults:{
                    height:30
                },
                items:[ {
                    xtype:"tbtext",
                    id:"tds_usableBalance",
                    text:"调账前余额：" + getAmtShow(info.usableBalance),
                    labelWidth:80,
                    width:200
                }, {
                    xtype:"tbtext",
                    id:"tds_transAmt",
                    text:"交易金额：<span class=red>" + getAmtShow(info.transAmt) + "</span>",
                    labelWidth:80,
                    width:300
                }, {
                    xtype:"tbtext",
                    id:"tds_lastUsableBalance",
                    text:"调账后余额：" + getAmtShow(info.lastUsableBalance),
                    labelWidth:80,
                    width:200
                } ]
            } ]
        }, {
            xtype:"container",
            layout:"hbox",
            items:[ {
                title:"邦融汇交易记录",
                xtype:"fieldset",
                bodyPadding:5,
                defaults:{
                    labelWidth:100,
                    width:360,
                    height:35
                },
                items:[ {
                    xtype:"tbtext",
                    text:"订单号：" + eac.fun.getVal(info.brhOrderNo)
                }, {
                    xtype:"tbtext",
                    text:"交易金额：" + getAmtShow(info.brhTransAmt)
                }, {
                    xtype:"tbtext",
                    text:"交易类型：" + DICT.getText(info.brhTransType, "brh_transtype")
                }, {
                    xtype:"tbtext",
                    text:"交易时间：" + eac.fun.getVal(info.brhTransDate) + " " + eac.fun.getVal(info.brhTransTime)
                }, {
                    xtype:"tbtext",
                    text:"状态：" + DICT.getText(info.brhStatus, "brh_transcode")
                } ]
            }, {
                title:"邦付宝交易记录",
                xtype:"fieldset",
                bodyPadding:5,
                defaults:{
                    labelWidth:100,
                    width:360,
                    height:35
                },
                defaultType:"textfield",
                items:[ {
                    xtype:"tbtext",
                    text:"订单号：" + eac.fun.getVal(info.bfbOrderNo)
                }, {
                    xtype:"tbtext",
                    text:"交易金额：" + getAmtShow(info.bfbTransAmt)
                }, {
                    xtype:"tbtext",
                    text:"交易类型：" + DICT.getText(info.bfbTransType, "eac_bfbtranstype")
                }, {
                    xtype:"tbtext",
                    text:"交易时间：" + eac.fun.getVal(info.bfbTransDate) + " " + eac.fun.getVal(info.bfbTransTime)
                }, {
                    xtype:"tbtext",
                    text:""
                } ]
            } ]
        } ]
    });
    var win = new Ext.Window({
        title:"差异处理详情",
        modal:true,
        width:800,
        height:470,
        border:false,
        plain:true,
        buttonAlign:"center",
        layout:"fit",
        items:form,
        buttons:[ {
            text:"同意",
            handler:function() {
                this.disable();
                var params={};
                params.id = data.id;
            	params.sysUserCode = constant.user.code;
            	params.sysUserName = constant.user.name;
            	params.serviceType = info.serviceType;
            	params.transType = info.transType;
   			 
   			    constant.ajax.async("eacCheck.agree", function() {
            	    Ext.Msg.alert("", "操作成功！");
                    grid.store.load();
                    win.close();
            	},function(r){
            		util.ajax.failure(r);
            		win.close();
            	})(params);
            }
        },{
            text:"驳回",
            handler:function() {
            	reject();
            }
        },{
            text:"关闭",
            handler:function() {
               win.close();
          }
        } ]
    });
    win.show();
    
    //拒绝
    function reject(){
    	  var rejectWin = new Ext.Window({
    	        title:"拒绝",
    	        modal:true,
    	        width:400,
    	        height:150,
    	        border:false,
    	        plain:true,
    	        buttonAlign:"center",
    	        layout:"fit",
    	        items:form = new Ext.form.Panel({
    	            	margin:5,
    	                border:false,
    	                items:[reason=Ext.create({
    	                	xtype:'textfield',
    	                	fieldLabel: '拒绝原因',
    	                	labelWidth:60,
    	                    width:380,
    	                    height:35,
    	                    allowBlank:false,
    	                    maxLength:60,
    	                    margin:5
    	                })]
    	            }),
    	        	
    	        buttons:[ {
    	            text:"确定",
    	            handler:function() {
    	            	 if(!form.isValid()){
    	                     return;
    	                 }
	    	             var params={};
	    	   			 params.id = data.id;
	    	   			 params.serviceType = info.serviceType;
	                	 params.transType = info.transType;
	    	   			 params.sysUserCode = constant.user.code;
	    	             params.sysUserName = constant.user.name;
	    	             params.reason = reason.getValue();
	    	   			 constant.ajax.async("eacCheck.reject", function() {
	    	            	    Ext.Msg.alert("", "操作成功！");
	    	                    grid.store.load();
	    	            	})(params);
	    	   			 rejectWin.close();
	        	         win.close();
    	            }
    	        }, {
    	            text:"关闭",
    	            handler:function() {
    	            	rejectWin.close();
    	            }
    	        } ]
    	    });
    	  rejectWin.show();
    }
    //获取金额显示值
    function getAmtShow(val) {
        val = eac.fun.getVal(val) + "";
        if (val == "") {
            return "";
        } else {
            return val + " 元";
        }
    }
};