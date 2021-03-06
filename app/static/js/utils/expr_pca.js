function check_input(info){
    var keys = Object.keys(info);
    for(var i = 0; i < keys.length; i++){
      if(info[keys[i]].length == 0){
        createAlert(keys[i] + ' is empty!');
        return false;
      }else if(info[keys[i]].length > 10){
        createAlert('samples number have to < 10');
        return false;
      }
    } 
    return true;
  }

function create_pca(input, group) {
        input.forEach(function (t) {
            t['label'] = {
                emphasis: {
                    show: true,
                    formatter: function (param) {
                        return param.data[2];
                    },
                    position: 'top'
                }
            }
        });
        option = {
            title: {
                text: 'PCA plot',
                subtext: 'Generated by PC1 and PC2'
            },
            legend: {
                right: '15%',
                data: group
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: true},
                    dataZoom: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            xAxis: [
                {
                    type: 'value',
                    scale: true,
                    name: 'PC1'
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    name: 'PC2'
                }
            ],
            series: input
        };
        return option;
    }

function exprPca(){
    $("#submit").click(function(){
        var group = [];
        $("#multi_d_to option").each(function(){
            group.push($(this).text());
        });
        var info = {'group': group};
        if(!check_input(info)){
            return;
        };
        info = JSON.stringify(info);
        var hint = $('<span><img src="/static/images/hint.gif" />' + 'loading data, please wait...</span>');
        hint.appendTo('#query_hint');
        var data = new FormData($('#expr')[0]);
        ajaxSend('/expression/pca/result/',{'info': info}, function(data){
            $("#query_hint").empty();
            if(data.msg == 'ok'){
                result = data.table;
                var plot_series = [];
                var unique_group = [];
                // get unique group info
                for(var i=0; i<result.length; i++) {
                    if (unique_group.indexOf(result[i][2]) < 0) {
                        unique_group.push(result[i][2]);
                        plot_series.push({
                       'name': result[i][2],
                       'type': 'scatter',
                       'data': []
                        });
                    }
                }
                // input each row data
                $.each(result, function (i, val) {
                   for(var j=0; j<plot_series.length; j++){
                       if(val[2] == plot_series[j]['name']){
                           plot_series[j]['data'].push([Number(val[0]), Number(val[1]), val[3]]);
                       }
                   }
                });
                var pca_plot = echarts.init(document.getElementById('result-plot'));
                option = create_pca(plot_series, unique_group);
                pca_plot.setOption(option);
            }else{
                createAlert(data.msg);
                return;
            }
        }, 'post');
      });
}

$(document).ready(function(){
    // multiselect plugin
    select_plugin()
    exprPca();
});
