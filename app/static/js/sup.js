$(document).ready(function() {
    const documentHeight = Math.max(
      document.body["scrollHeight"],
      document.documentElement["scrollHeight"]
    );
    const windowHeight = $(window).height();
  
    if (windowHeight === documentHeight) {
      $("#footer").show();
    } else {
      $("#footer").hide();
    }
  
    $(window).scroll(function() {
      if (scrollY + windowHeight === documentHeight) {
        $("#footer").fadeIn();
      } else {
        $("#footer").fadeOut();
      }
    });
  });