function create_table(headData, bodyData, tableType) {
  var htmlBuffer = [];
  htmlBuffer.push("<p>当前上传vcf提取出的样品如下: (TC id系统自动生成)</p>");
  htmlBuffer.push(
    "<table class='table table-strip table-bordered region_table'>"
  );
  htmlBuffer.push("<thead>\n<tr>");
  for (var i = 0; i < headData.length; i++) {
    htmlBuffer.push("<th>" + headData[i] + "</th>");
  }
  htmlBuffer.push("</tr>\n</thead>");
  htmlBuffer.push("<tbody>");
  for (var i = 0; i < bodyData.length; i++) {
    htmlBuffer.push("<tr>");
    for (var j = 0; j < bodyData[i].length; j++) {
      if (j == 0 && tableType == "expr") {
        href_str = createHref(bodyData[i][j]);
        htmlBuffer.push("<td>" + href_str + "</td>");
      } else if (j == 5 && tableType == "snp") {
        href_str = createHref(bodyData[i][j]);
        htmlBuffer.push("<td>" + href_str + "</td>");
      } else {
        htmlBuffer.push("<td>" + bodyData[i][j] + "</td>");
      }
    }
    htmlBuffer.push("</tr>");
  }
  htmlBuffer.push("</tbody>");
  htmlBuffer.push("</table>");
  tableStr = htmlBuffer.join("\n");
  return tableStr;
}

function add_sample_href() {
  var sampleTd = $("#pr-sample");
  if (sampleTd.text() != "0") {
    $("#pr-sample-href").attr("href", "/auth/samples/");
  }
}

$(document).ready(function() {
  add_sample_href();

  $("#vcf-sub").click(function() {
    var index = layer.load(1);
    var formData = new FormData();
    var vcf_type = $("#vcf-type")
      .find("option:selected")
      .text();
    formData.append("vcf_type", vcf_type);
    formData.append("vcf_file", document.getElementById("vcf-file").files[0]);
    $.ajax({
      url: "/auth/upload/",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      xhr: function() {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(e) {
          var progressRate = (e.loaded / e.total) * 100 + "%";
          $(".progress-bar").css("width", progressRate);
        });
        return xhr;
      },
      success: function(data) {
        layer.close(index);
        if (data.msg == "ok") {
          $(".progress-bar").css("width", "0%");
          $("#vcf-result").empty();
          var headData = ["TC Id", "Sample"];
          var tableStr = create_table(headData, data.table);
          $("#vcf-result").html(tableStr);
          var vcfTd = $("#pr-vcf");
          var sampleTd = $("#pr-sample");
          $(vcfTd).text(Number(vcfTd.text()) + 1);
          $(sampleTd).text(Number(sampleTd.text()) + data.table.length);
          add_sample_href();
          //alert('success.')
        } else if (data.msg == "async") {
          window.location.href = "/task/result/" + data.task_id + "/";
          return;
        } else {
          layer.close(index);
          layer.alert(data.msg);
          return;
        }
      }
    });
  });

  // variety bootstrap table
  $("#table-variety").bootstrapTable({
    sortable: false, //排序
    search: true, //启用搜索
    pagination: true, //是否显示分页条
    pageSize: 10, //一页显示的行数
    paginationLoop: false, //是否开启分页条无限循环，最后一页时点击下一页是否转到第一页
    pageList: [5, 10, 20], //选择每页显示多少行，数据过少时可能会没有效果
    columns: [
        [
          {
            width: 120
          },
          {
            width: 110
          },
          {
            width: 80
          },
          {
            width: 100
          },
          {
            width: 100
          },
          {
            width: 100
          },
          {
            width: 200
          },
          {
            width: 100
          },
          {
            width: 180
          }
        ]
      ]
  });

  $("#table-variety").bootstrapTable("hideLoading");

  // delete confirm
  $(".delete-va").each(function() {
    const that = $(this);
    const vaName = that.attr("va-name");
    $(this).on("click", function() {
      $.confirm({
        title: "Confirm!",
        content: `Delete Variety ${vaName}?`,
        buttons: {
          confirm: function() {
            window.location.href = that.attr("id");
          },
          cancel: function() {
            $.alert("Canceled!");
          }
        }
      });
    });
  });
});
