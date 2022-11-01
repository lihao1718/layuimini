
let role = {
    baseUrl: "http://127.0.0.1:8022/role",
    entity: "role",
    tableId: "currentTableId",
    toolbarId: "toolbarDemo",
    unique: "id",
    order: "asc",
    currentItem: {},
    roleOptions: ''
};
role.columns = function () {
    return [
        {radio: true},
        {field: 'code', width: 80, title: '编号'},
        {field: 'name', width: 180, title: '名称'},
        {field: 'level', width: 80, title: '级别'},
        {field: 'type', width: 120, title: '类型',
            formatter: function (value, row, index) {
                return roleType(value);
            }
        },
        {field: 'enabled',width: 110, title: '是否启用',
            formatter: function (value, row, index) {
                return formatEnabledPass(value);
            }
        }];
};
role.queryParams = function (params) {
    if (!params)
    return params;
    var temp = { //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
        limit: params.limit, //页面大小
        page: params.offset / params.limit, //页码
    };
    return temp;
};
role.roleOptions = function () {
    let options;
    for(let key in acctTypeMap){
        let value = acctTypeMap[ key ]; //注意是 [ ]
        options += '<option value="' + key + '" >' + value + '</option>';
    }
    return options;
};
role.init = function () {

    role.table = $('#' + role.tableId).bootstrapTable({
        url: role.baseUrl + '/findAll', //请求后台的URL（*）
        method: 'get', //请求方式（*）
        toolbar: '#' + role.toolbarId, //工具按钮用哪个容器
        striped: true, //是否显示行间隔色
        cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true, //是否显示分页（*）
        sortable: false, //是否启用排序
        sortOrder: role.order, //排序方式
        queryParams: role.queryParams,//传递参数（*）
        sidePagination: "server", //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1, //初始化加载第一页，默认第一页
        pageSize: 10, //每页的记录行数（*）
        pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
        search: false, //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
        strictSearch: false,
        showColumns: false, //是否显示所有的列
        showRefresh: true, //是否显示刷新按钮
        minimumCountColumns: 2, //最少允许的列数
        clickToSelect: true, //是否启用点击选中行
        uniqueId: role.unique, //每一行的唯一标识，一般为主键列
        showToggle: true, //是否显示详细视图和列表视图的切换按钮
        cardView: false, //是否显示详细视图
        detailView: false, //是否显示父子表
        columns: role.columns(),
        responseHandler: function (res) {
            if (res.code === 200) {
                return {total:res.data.totalElements, rows: res.data.content};
            } else {
                layer.msg('查询失败');
                return false;
            }
        }
        ,onLoadError: function(status){
            layer.msg(status);
        }
    });
};
role.select = function (layerTips) {
    var rows = role.table.bootstrapTable('getSelections');
    if (rows.length == 1) {
        role.currentItem = rows[0];
        return true;
    } else {
        layerTips.msg("请选中一行");
        return false;
    }
};

layui.use(['form', 'layedit', 'laydate', 'upload'], function () {
    role.init();

    var editIndex;
    var layerTips = parent.layer === undefined ? layui.layer : parent.layer, //获取父窗口的layer对象
        layer = layui.layer, //获取当前窗口的layer对象;
        form = layui.form,
        layedit = layui.layedit;
    var addBoxIndex = -1;

    //初始化页面上面的按钮事件
    $('#btn_query').on('click', function () {
        var queryParams = role.queryParams();
        queryParams.pageNumber=1;
        role.table.bootstrapTable('refresh', queryParams);
    });

    $('#btn_add').on('click', function () {
        if (addBoxIndex !== -1)
            return;
        //本表单通过ajax加载 --以模板的形式，当然你也可以直接写在页面上读取
      $.get('edit.html', null, function (form) {
            addBoxIndex = layer.open({
                type: 1,
                title: '添加用户',
                content: form,
                btn: ['保存', '取消'],
                shade: false,
                offset: ['20px', '20%'],
                area: ['600px', '500px'],
                maxmin: true,
                yes: function (index) {
                    //开启loading
                    const loading = layer.load(2);
                    //获取表单内的所有值
                    const formData = layui.form.val("create_table_from");
                    //发送数据到接口
                    $.post(role.baseUrl+'/save', formData, (res)=>{
                        //关闭loading
                        layer.close(loading);
                        console.log(res);
                    });

                },
                full: function (elem) {
                    var win = window.top === window.self ? window : parent.window;
                    $(win).on('resize', function () {
                        var $this = $(this);
                        elem.width($this.width()).height($this.height()).css({
                            top: 0,
                            left: 0
                        });
                        elem.children('div.layui-layer-content').height($this.height() - 95);
                    });
                },
                success: function (layero, index) {
                    var form = layui.form;

                    layero.find('#type').append(role.roleOptions);
                    form.render('select');
                },
                end: function () {
                    addBoxIndex = -1;
                }
            });
        });
    });

    $('#btn_del').on('click', function () {
        if (role.select(layerTips)) {
            var id = role.currentItem.id;
            layer.confirm('确定删除数据吗？', null, function (index) {
                $.ajax({
                    url: role.baseUrl + "/delete?id=" + id,
                    type: "get",
                    success: function (data) {
                        if (data.code === 200) {
                            layerTips.msg("移除成功！");
                            var queryParams = role.queryParams();
                            queryParams.pageNumber=1;
                            role.table.bootstrapTable('refresh', queryParams);
                        } else {
                            layerTips.msg("移除失败！"+data.message)
                            var queryParams = role.queryParams();
                            queryParams.pageNumber=1;
                            role.table.bootstrapTable('refresh', queryParams);
                        }
                    }
                });
                layer.close(index);
            });
        }
    });
    $('#btn_enabled').on('click', function () {
        if (role.select(layerTips)) {
            var id = role.currentItem.id;
            layer.confirm('确定修改吗？', null, function (index) {
                $.ajax({
                    url: role.baseUrl + "/updateEnabled?id=" + id,
                    type: "get",
                    success: function (data) {
                        if (data.code === 200) {
                            layerTips.msg("修改成功！");
                            location.reload();
                        } else {
                            layerTips.msg("移除失败！"+data.message)
                            location.reload();
                        }
                    }
                });
                layer.close(index);
            });
        }
    });
});