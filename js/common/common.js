//let baseUrl='http://127.0.0.1:8022/';

//是否启用
function formatEnabledPass(value) {
    if(value==true){
        return '启用';
    }else if(value == false){
        return '不启用';
    } else {
        return "";
    }
}
//角色类型
function roleType(value) {
    return acctTypeMap[value];
    /*if(value=='operation'){
        return '管理运营';
    }else if(value == 'admin'){
        return '系统管理员';
    }else if(value == 'stadium'){
        return '前厅';
    }else if(value == 'shop_owner'){
        return '服务人员';
    }else if(value == 'teacher'){
        return '老师';
    }else if(value == 'principal'){
        return '总校长';
    } else {
        return "";
    }*/
}


let acctTypeMap = {
    operation: '管理运营',
    admin: '系统管理员',
    stadium: '前厅',
    shop_owner: '服务人员',
    teacher: '老师',
    principal: '总校长'
};