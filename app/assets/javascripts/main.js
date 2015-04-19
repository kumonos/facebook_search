window.fbAsyncInit = function() {
  // init the FB JS SDK
  FB.init({
    appId      : '489296474470878', // App ID from the App Dashboard
    channelUrl : 'http://kumonos/facebook_search/channel.php', // Channel File for x-domain communication
    status     : true, // check the login status upon init?
    cookie     : true, // set sessions cookies to allow your server to access the session?
    xfbml      : true  // parse XFBML tags on this page?
  });
};

var FBSearch = {
  friends: [],
  filter: {},
  init: function(){
    $("#friends").text("読み込み中...");
    var fql = 'SELECT friend_count FROM user WHERE uid = me()';
    FB.api('/fql', {q:fql, locale:"ja_JP"}, function(response) {
      if(response.error){
        $("#friends").text("読み込みに失敗しました。ページをリロードして下さい。");
        FBSearch.errorLog(1, response);
      }
      FBSearch.friend_count = response.data[0].friend_count;
      var limit = 100;
      var loop_num = Math.ceil(FBSearch.friend_count / limit);
      var current_response = 0;

      FBSearch.friends = new Array();
      for(loop = 0; loop < loop_num; loop ++){
        fql = 'SELECT uid, name, pic, profile_url, sex, education, work, birthday_date, relationship_status, current_location FROM user';
        fql += ' WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() LIMIT ' + limit + ' OFFSET ' + limit * loop + ')';
        FB.api('/fql', {q:fql, locale:"ja_JP"}, function(response) {
          if(response.error){
            $("#friends").text("読み込みに失敗しました。ページをリロードして下さい。");
            FBSearch.errorLog(2, response);
            return;
          }
          current_response ++;
          FBSearch.friends = FBSearch.friends.concat(response.data);
          if(current_response == loop_num){
            $("#friends").text("");
            var ul = $("#friends");
            for(var i = 0; i < FBSearch.friends.length; i ++){
              var friend = FBSearch.friends[i];
              // set each data
              friend.latestEmployer = FBSearch.getLatestEmployer(i);
              friend.latestEducation = FBSearch.getLatestEducation(i);
              friend.age = FBSearch.getAge(i);
              friend.currentLocation = FBSearch.getCurrentLocation(i);

              // make view html
              var html = "<li id='friend" + friend.uid + "' class='friends_li'>";
              html += "<div class='clearfix'>";
              html += "<div class='friend_img'><img src=" + friend.pic + " /></div>";
              html += "<div class='friend_info'>";
              html += "<input type='checkbox' name='check' id='list' class='list_func' value='list_add' checked /> ";
              html += "<a href='" + friend.profile_url + "' target='_blank'>" + friend.name + "</a>";
              html += " work at " + friend.latestEmployer + "<br />";
              html += "education: " + friend.latestEducation + "<br />";
              html += friend.sex + ", " + friend.relationship_status + "<br />";
              html += "age: " + friend.age + "<br />";
              html += "location: " + friend.currentLocation + "<br />";
              html += "<span id='showphoto_" + friend.uid + "' class='showphoto'>写真を表示</span>";
              html += "</div>";
              html += "</div>";
              html += "</li>";
              ul.append(html);
              
              // show photo event
              $("#showphoto_" + friend.uid).click(function(){
                var uid = $(this).attr("id").split("_")[1];
                var fql_photo = 'SELECT src, src_big FROM photo WHERE pid IN '
                      + '(SELECT pid FROM photo_tag WHERE subject = ' + uid + ')';
                var fql_uid = 'SELECT uid FROM user WHERE uid = ' + uid;
                FB.api({
                  method: 'fql.multiquery',
                  queries: {
                    'photos': fql_photo,
                    'uid': fql_uid
                  }
                }, function(response) {
                  if(response.error){
                    FBSearch.errorLog(3, response);
                    return;
                  }
                  var html = "<div class='friend_photo'>";
                  var photos = response[0].fql_result_set;

                  html += "<p>タグ付けされた写真：" + photos.length + "枚</p>";
                  for(var i = 0; i < photos.length; i ++){
                    html += "<a href='" + photos[i].src_big + "' target='_blank'>";
                    html += "<img class='friend_each_photo' src='" + photos[i].src + "' />";
                    html += "</a>";
                  }
                  html += "</div>";

                  var uid = response[1].fql_result_set[0].uid;
                  $("#friend" + uid).append(html);
                  $("#showphoto_" + uid).remove();
                });
              });
            }
            FBSearch.showResultNum(FBSearch.friends.length);
            $("#search_boxes").css("display", "block");
          }
        });
      }
    });
  },
  getLatestEmployer: function(friendIndex){
    var employer = "";
    var friend = this.friends[friendIndex];
    if(friend.work.length > 0){
      employer = friend.work[0].employer.name;
    }
    return employer;
  },
  getLatestEducation: function(friendIndex){
    var school = "";
    var friend = this.friends[friendIndex];
    if(friend.education.length > 0){
      school = friend.education[friend.education.length - 1].school.name;
    }
    return school;
  },
  getAge: function(friendIndex){
    var age = "";
    var friend = this.friends[friendIndex];
    var birthday_date = friend.birthday_date;
    if(!birthday_date){
      return age;
    }
    var birthdayYear = birthday_date.substr(6, 4);
    var birthdayMonth = birthday_date.substr(0, 2);
    var birthdayDay = birthday_date.substr(3, 2);
    if(!birthdayYear || !birthdayMonth || !birthdayDay){
      return age;
    }
    
    var birthday = String(birthdayYear) + String(birthdayMonth)+ String(birthdayDay);
    var today = new Date();
    today = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    age = Math.floor((today - birthday) / 10000);
    return age;
  },
  getCurrentLocation: function(friendIndex){
    var location = "";
    var friend = this.friends[friendIndex];
    var locationObject = friend.current_location;
    if(locationObject){
      location = locationObject.name;
    }
    return location;
  },
  filterResults: function(param){
    // set default param
    if(typeof param === "undefined"){
      param = {};
    }

    // set filter query
    if(typeof param.target !== "undefined"){
      if(typeof param.query !== "undefined" && param.query.length == 0){
        delete this.filter[param.target];
      }
      else{
        this.filter[param.target] = param.query;
      }
    }

    // filter results
    var resultNum = 0;
    for(var i = 0; i < this.friends.length; i ++){
      var friend = this.friends[i];
      var show = true;
      for(var key in this.filter){
        var query = this.filter[key];
        if(typeof query !== "undefined"){
          var targetData = this.getTargetData(key, i);
          if(key.indexOf("sex_") === 0){
            if(!query){
              if((key == "sex_male" && targetData === "男性")
                 || (key == "sex_female" && targetData === "女性")
                 || (key === "sex_empty" && !targetData)){
                show = false;
              }
            }
          }
          else if(key.indexOf("relationship_status_") === 0){
            if(!query){
              if((key == "relationship_status_Single" && targetData === "独身")
                 || (key == "relationship_status_In a Relationship" && targetData === "交際中")
                 || (key == "relationship_status_In an Open Relationship" && targetData === "オープンな関係")
                 || (key == "relationship_status_Married" && targetData === "既婚")
                 || (key == "relationship_status_empty" && !targetData)){
                show = false;
              }
            }
          }
          else if(!targetData){
            var id = key + "_show_empty";
            if(key == "age_min" || key == "age_max"){
              id = "age_show_empty";
            }
            if(!$("#" + id).is(":checked")){
              show = false;
            }
          }
          else{
            if(key == "latestEmployer" || key == "latestEducation" || key == "currentLocation" || key == "name"){
              // 部分一致
              targetData = targetData.toLowerCase();
              query = query.toLowerCase();
              if(targetData.indexOf(query) == -1){
                show = false;
              }
            }
            else if(key == "age_min"){
              // 最小値
              if(targetData < query){
                show = false;
              }
            }
            else if(key == "age_max"){
              // 最大値
              if(targetData > query){
                show = false;
              }
            }
            else{
              // 完全一致
              if(targetData != query){
                show = false;
              }
            }
          }
        }
      }
      if(show){
        $("#friend" + friend.uid).css("display", "block");
        resultNum ++;
      }
      else{
        $("#friend" + friend.uid).css("display", "none");
      }
    }
    this.showResultNum(resultNum);
  },
  showResultNum: function(num){
    $("#result_num").text("検索結果： " + num + "件");
  },
  getTargetData: function(target, friendIndex){
    if(target == "age_min" || target == "age_max"){
      return this.friends[friendIndex].age;
    }
    else if(target.indexOf("sex_") === 0){
      return this.friends[friendIndex].sex;
    }
    else if(target.indexOf("relationship_status_") === 0){
      return this.friends[friendIndex].relationship_status;
    }
    else{
      data = this.friends[friendIndex][target];
      if(data == null || data == undefined){
        data = "";
      }
      return data;
    }
  },
  errorLog: function(appErrorCode, response){
    var error = response.error;
    if(error){
      $.get(
        "/facebook_search",
        {
          action: "errorLog",
          appCode: appErrorCode,
          message: encodeURI(error.message),
          type: error.type,
          code: error.code,
          subcode: error.error_subcode
        }
      );
    }
  }
};


// Load the SDK's source Asynchronously
// Note that the debug version is being actively developed and might 
// contain some type checks that are overly strict. 
// Please report such bugs using the bugs tool.
(function(d, debug){
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "//connect.facebook.net/ja_JP/all" + (debug ? "/debug" : "") + ".js";
  ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));


// events
$(function(){
  // start to use
  $("#use_button").click(function(){
    $("#search_main").css("display", "block");
    $(this).css("display", "none");
    FB.login(function(response) {
      if (response.authResponse) {
        FBSearch.init();
      } else {
        $("#friends").text("友達リストの読み込みに失敗しました。ページをリロードして下さい。");
      }
    }, {scope:'friends_work_history,friends_relationships,friends_birthday,friends_education_history,friends_hometown,friends_location,friends_photos'});
  });
  
  // search event
  $("#name").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "name", query: query});
  });

  $("#employer").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "latestEmployer", query: query});
  });

  $("#education").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "latestEducation", query: query});
  });

  $("#currentLocation").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "currentLocation", query: query});
  });

  $("#age_min").keyup(function(){
    var query = $(this).val();
    FBSearch.filterResults({target: "age_min", query: query});
  });

  $("#age_max").keyup(function(){
    var query = $(this).val();
    FBSearch.filterResults({target: "age_max", query: query});
  });

  $(".gender").click(function(){
    var query = $(this).is(":checked");
    FBSearch.filterResults({target: "sex_" + $(this).val(), query: query});
  });

  $(".relationship_status").click(function(){
    var query = $(this).is(":checked");
    FBSearch.filterResults({target: "relationship_status_" + $(this).val(), query: query});
  });

  $(".trigger_filter").click(function(){
    FBSearch.filterResults();
  });

  // bookmark event
  $("#add_bookmark").click(function(){
    var toURL = location.href;
    var toStr = "who's who? | facebook友だち検索";

    if(navigator.userAgent.indexOf("MSIE") > -1){
      //Internet Explorer
      window.external.AddFavorite(toURL,toStr);
    }else if(navigator.userAgent.indexOf("Lunascape") > -1){
      //Lunascape
      alert("[Ctrl]と[G}ボタンを同時に押してください。");
    }else if(navigator.userAgent.indexOf("Flock") > -1){
      //Flock
      window.sidebar.addPanel(toStr,toURL,'');
    }else if(navigator.userAgent.indexOf("Firefox") > -1){
      //Firefox
      window.sidebar.addPanel(toStr,toURL,'');
    }else if(navigator.userAgent.indexOf("Opera") > -1){
      //Opera
      window.open(toURL,'sidebar','title='+toStr);
    }else if(navigator.userAgent.indexOf("Chrome") > -1){
      //Chrome,Safari
      alert("ブラウザ付属のブックマーク機能をご利用ください。[Ctrl]と[D]ボタン（Macの場合は[Command]と[D]ボタン）を同時に押すと簡単にブックマークできます");
    }else{
      //その他
      alert("ブラウザ付属のブックマーク機能をご利用ください。");
    }
  });


  //all check box
  $('#all_check_button').on('change',function(){
    $('input[name=check]').prop('checked',this.checked);
  });

  //list function
  $("#list_button").click(function(){
    var html ="";
    var l = 0;
    memberlist = new Array();

    //definition list name
    var listname = document.listname_form.listname_text.value;
    if(listname==""){
      alert("リスト・グループ名が空です");
      return false;
    };

    for(var i = 0; i < FBSearch.friends.length; i ++){
      var id='friend' + FBSearch.friends[i].uid;
      var childs = document.getElementById(id).childNodes[0].childNodes[1].childNodes[0].checked;
      var disp = document.getElementById(id).style.display;

      if((childs)&(disp!="none")){
        html +=  FBSearch.friends[i].name+":"+FBSearch.friends[i].uid+"<br />";
        memberlist[l] = FBSearch.friends[i].uid;
        l = l + 1;
      };
    }

    //no check
    if(l == 0){
      alert("友達が一人もチェックされていません。");
      return false;
    };

    alert("友達リストが作成されるまで少々お待ちください");

    FB.login(function(response) {
      if (response.authResponse) {
        //make list
        FB.api(
          "/me/friendlists",
          "POST",
          {
            "name": listname
          },
          function(list) {
            if(list && !list.error){
              // update mamber list

              FB.api(
                "/"+list.id+"/members",
                "POST",
                {
                  "members":memberlist
                },
                function (memberresponse) {
                  if (memberresponse && !memberresponse.error) {
                    //* handle the result
                    alert(listname+"という名前で友人リストを作成しました");
                  }
                }
              );
            } else {
              if(list.error.code ==100)alert("同じ名前のリストが存在します。");
            }
          }
        );
      } else {
        alert("友達リストへのアクセスを許可してください。");
      }
    },
             {scope: 'user_friends,manage_friendlists,read_friendlists'}
            );
  });
});
