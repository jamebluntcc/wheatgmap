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

function PCA() {
  $("#sub_vcf").click(function(){
    event.preventDefault();
    var hint = $('<span><img src="/static/images/hint.gif" />' + 'loading data, please wait...</span>');
    hint.appendTo('#query_hint');
    var data = new FormData($('#vcf')[0]);
    $.ajax({
            type: 'POST',
            url: '/tools/upload/vcf2pca/',
            data: data,
            contentType: false,
            processData: false,
            dataType: 'json'
        }).done(function(data){
      $("#query_hint").empty();
      if(data.msg != 'ok'){
        createAlert(data.msg);
        return;
      }
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
    });
  });

  $("#sub_expr").click(function(){
    event.preventDefault();
    var hint = $('<span><img src="/static/images/hint.gif" />' + 'loading data, please wait...</span>');
    hint.appendTo('#query_hint');
    var data = new FormData($('#expr')[0]);
    $.ajax({
            type: 'POST',
            url: '/tools/upload/expression/',
            data: data,
            contentType: false,
            processData: false,
            dataType: 'json'
        }).done(function(data){
      $("#query_hint").empty();
      if(data.msg != 'ok'){
        createAlert(data.msg);
        return;
      }
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
    });
  });
}

$(document).ready(function () {
  PCA();
})
