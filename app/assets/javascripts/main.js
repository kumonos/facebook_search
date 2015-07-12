(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.3&appId=489296474470878";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var FBSearch = {
  friends: [],
  filter: {},

  buildHtml: function(){
    $("#friends").text("");
    var ul = $("#friends");
    for(var i = 0; i < FBSearch.friends.length; i ++){
      var friend = FBSearch.friends[i];

      // make view html
      var html = "<li id='friend" + friend.uid + "' class='friends_li'>";
      html += "<div class='friend_img'><img src=" + friend.pic + " /></div>";
      html += "<div class='friend_info'>";
      html += "<a href='" + friend.profile_url + "' target='_blank'>" + friend.name + "</a><br />";
      html += "職歴： " + FBSearch.getWork(i) + "<br />";
      html += "学歴： " + FBSearch.getEducation(i) + "<br />";
      html += "性別： " + FBSearch.getSex(i) + "<br />";
      html += "交際ステータス： " + FBSearch.getRelation(i) + "<br />";
      html += "年齢： " + FBSearch.getAge(i) + "<br />";
      html += "星座： " + FBSearch.getStarSign(i) + "<br />";
      html += "居住地： " + FBSearch.getLocation(i) + "<br />";
      html += "</div>";
      html += "</li>";
      ul.append(html);
      
      // show photo event
      /*
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
       */
    }
    FBSearch.showResultNum(FBSearch.friends.length);
    $("#search_boxes").css("display", "block");
  },

  getAge: function(friendIndex){
    var age = "非公開";
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

  getStarSign: function(friendIndex){
    var starSign = "非公開";
    var friend = this.friends[friendIndex];
    var birthday_date = friend.birthday_date;
    if(!birthday_date){
      return starSign;
    }
    var birthdayMonth = Number(birthday_date.substr(0, 2));
    var birthdayDay = Number(birthday_date.substr(3, 2));
    if(!birthdayMonth || !birthdayDay){
      return starSign;
    }

    //borderValue: month * 100 + day とした場合の境界値
    var starSigns = [
      { id: 1, name: 'やぎ座', borderValue: 119 },
      { id: 2, name: 'みずがめ座', borderValue: 218 },
      { id: 3, name: 'うお座', borderValue: 320 },
      { id: 4, name: 'おひつじ座', borderValue: 419 },
      { id: 5, name: 'おうし座', borderValue: 520 },
      { id: 6, name: 'ふたご座', borderValue: 621 },
      { id: 7, name: 'かに座', borderValue: 722 },
      { id: 8, name: 'しし座', borderValue: 822 },
      { id: 9, name: 'おとめ座', borderValue: 922 },
      { id: 10, name: 'てんびん座', borderValue: 1023 },
      { id: 11, name: 'さそり座', borderValue: 1122 },
      { id: 12, name: 'いて座', borderValue: 1221 }
    ];

    var targetValue = birthdayMonth * 100 + birthdayDay;
    var idx = 0;
    for(idx = 0; idx < starSigns.length; idx++){
      if( targetValue <= starSigns[idx].borderValue ){
        break;
      }
    }
    if(idx === 12){
      idx = 0;
    }
    starSign = starSigns[idx].name;
    return starSign;
  },

  getWork: function(friendIndex){
    var friend = this.friends[friendIndex];
    var work = friend.work;
    if(!work || work == ""){
      return "非公開";
    } else {
      return work;
    }
  },

  getEducation: function(friendIndex){
    var friend = this.friends[friendIndex];
    var education = friend.education;
    if(!education || education == ""){
      return "非公開";
    } else {
      return education;
    }
  },

  getSex: function(friendIndex){
    var friend = this.friends[friendIndex];
    var sex = friend.sex;
    if(!sex || sex == ""){
      return "非公開";
    } else {
      return sex;
    }
  },

  getRelation: function(friendIndex){
    var friend = this.friends[friendIndex];
    var relation = friend.relationship_status;
    if(!relation || relation == ""){
      return "非公開";
    } else {
      return relation;
    }
  },

  getLocation: function(friendIndex){
    var friend = this.friends[friendIndex];
    var location = friend.current_location;
    if(!location || location == ""){
      return "非公開";
    } else {
      return location;
    }
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
          else if(key.indexOf("star_sign_") === 0){
            if(!query){
              var starSigns = {yagi: 'やぎ座', mizugame: 'みずがめ座', uo: 'うお座', ohitsuji: 'おひつじ座',
                               oushi: 'おうし座', futago: 'ふたご座', kani: 'かに座', shishi: 'しし座',
                               otome: 'おとめ座', tenbin: 'てんびん座', sasori: 'さそり座', ite: 'いて座'};
              Object.keys(starSigns).forEach(function (k) {
                if(key == "star_sign_" + k && targetData == starSigns[k]){
                  show = false;
                }
              });
              if(key == 'star_sign_empty' && targetData == "非公開"){
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
            if(key == "work" || key == "education" || key == "current_location" || key == "name"){
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
        $("#friend" + friend.uid).css("display", "flex");
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
      return this.getAge(friendIndex);
    }
    else if(target.indexOf("sex_") === 0){
      return this.friends[friendIndex].sex;
    }
    else if(target.indexOf("relationship_status_") === 0){
      return this.friends[friendIndex].relationship_status;
    }
    else if(target.indexOf("star_sign_") === 0){
      return this.getStarSign(friendIndex);
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
  },

  // promises
  getFriends: function(){
    return new Promise(function(resolve, reject){
      $.ajax({
        url: "friends.json",
        dataType: 'json',
        success: function(data){
          resolve(data);
        },
        error: function(error){
          reject(error);
        }
      });
    });
  },

  getFBFriendsCount: function(){
    return new Promise(function(resolve, reject){
      $.ajax({
        url: "friends/fb_count.json",
        dataType: 'json',
        success: function(data){
          resolve(data.friend_count);
        },
        error: function(error){
          reject(error);
        }
      });
    });
  },

  getFBFriends: function(limit, offset){
    return new Promise(function(resolve, reject){
      $.ajax({
        url: "friends/fb.json?limit=" + limit + "&offset=" + offset,
        dataType: 'json',
        success: function(data){
          resolve(data);
        },
        error: function(error){
          reject(error);
        }
      });
    });
  }
};


// events
$(function(){
  // start point
  $("#search_main").css("display", "block");
  $(this).css("display", "none");
  $("#friends").text("読み込み中...");
  FBSearch.getFBFriendsCount().then(function(count){
    var limit = 100;
    var loop_num = Math.ceil(count / limit);
    var current_response = 0;

    var promises = [];
    for(var i = 0; i < loop_num; i ++){
      promises.push(FBSearch.getFBFriends(limit, limit * i));
    }

    return Promise.all(promises);
  }).then(function(){
    return FBSearch.getFriends();
  }).then(function(friends){
    FBSearch.friends = friends;
    FBSearch.buildHtml();
  });

  // search event
  $("#name").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "name", query: query});
  });

  $("#employer").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "work", query: query});
  });

  $("#education").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "education", query: query});
  });

  $("#currentLocation").keyup(function(e){
    var query = $(this).val();
    FBSearch.filterResults({target: "current_location", query: query});
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

  $(".star_sign").click(function(){
    var query = $(this).is(":checked");
    FBSearch.filterResults({target: "star_sign_" + $(this).val(), query: query});
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
