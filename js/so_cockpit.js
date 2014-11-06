/* Here's my table def - one big partition, maybe two if I augment this:
CREATE TABLE posts
(
tags set<text>,
ownerreputation int,
owneruserid int,
datastax_close boolean,
ownerdisplayname text,
owneracceptrate int,
ownerlink text,
isanswered boolean,
view_count int,
acceptedanswerid int,
answercount int,
score int,
createdate timestamp,
questionid int,
link text,
title text,
PRIMARY KEY (questionid)
)

create solr core in 4.6:
curl "http://localhost:8983/solr/admin/cores?action=CREATE&name=so_tracker.posts&generateResources=true"



*/

//var url = 'https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=http://stackexchange.com/feeds/tagsets/145895/datastax-enterprise?sort=noanswers&num=1000';


//auth token is embeded here, it will change occasionally
//if it breaks, manually open this url and accept the oauth:
//https://stackexchange.com/oauth/dialog?client_id=3563&scope=no_expiry&redirect_uri=https://stackexchange.com/oauth/login_success#
var authUrl = 'https://stackexchange.com/oauth/dialog?client_id=3563&scope=no_expiry&redirect_uri=https://stackexchange.com/oauth/login_success#';
var url = 'https://api.stackexchange.com/2.2/questions/unanswered/my-tags?key=PPycMF12WVS7CgZiO)YEsw((&site=stackoverflow&page=';
	var url2 = '&pagesize=100&order=desc&sort=activity&access_token=V*caFuU5KpJYD*vUoYwB9g))&filter=default';
var page = 1;
var result = [];




var pullData = function(){

	geturl = url+page+url2;

	$.ajax({
		type: 'GET',
		url: geturl,
		async: true,
		jsonpCallback: 'jsonCallback',
		contentType: "application/json",
		dataType: 'jsonp',
		success: function(data) {
			result = result.concat(data.items);
			if (data.has_more == true){
				pullData();
			}
			else{
				//Paste length
				$("#myfooter").html("Currently there are "+result.length+" questions in SO");
				

				//create the table -- populate later
               // drawTable(result);
				
				for (i=0;i<result.length;i++){

					//query solr has it been internally closed?
					var checkQuery = $.ajax({
						type:'GET',
						url:"http://www.sestevez.com:3001/192.168.1.7:8983/solr/so_tracker.posts/select?q=questionid:"+result[i].question_id+"&wt=json",
						async:true,
						contentType: 'application/json',
						success:function(resp){
							
							if (resp.response.docs[0] != undefined){
								var j = $.map(result, function (x, index){ 
									if (x.question_id == resp.response.docs[0].questionid) { 
										return index;
									}
								})[0];
								
								result[j].datastax_close = resp.response.docs[0].datastax_close;
							} else
							{
								var j = $.map(result, function (x, index){
									if (x.question_id == resp.responseHeader.params.q.split(":")[1]){
										return index;
									}
								})[0];
								result[j].datastax_close = false;
							}

                            //Insert all posts into c*
                            var d = new Date(0);
                            d.setSeconds(result[j].creation_date);
                            d =d.getFullYear() +'-'+ (d.getMonth()+1) +'-'+ d.getDate()+"T"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"Z";
                            myData = '{"add":{ "doc":{"isanswered":'+result[j].is_answered+
                            ', "createdate": '+'"'+d+'"'+
                            ', "datastax_close": '+result[j].datastax_close+
                            ', "answercount":'+result[j].answer_count+
                            ',"questionid":'+result[j].question_id+
                            ', "ownerreputation":'+result[j].owner.reputation+
                            ', "owneruserid":'+result[j].owner.user_id+
                            ', "ownerdisplayname":"'+result[j].owner.display_name+
                            '", "ownerlink":"'+result[j].owner.link+
                            '", "view_count":'+result[j].view_count+
                            ',"score":'+result[j].score+
                            ', "link":"'+result[j].link+'"'+
                            ', "title":"'+result[j].title+'"'+
                            ', "tags":'+''+JSON.stringify(result[j].tags)+''+
                            ' }}}';
                            myAjaxCall = $.ajax({
                            	url: "http://www.sestevez.com:3001/192.168.1.7:8983/solr/so_tracker.posts/update?wt=json",
                            	type: "POST",
                            	contentType: "application/json",
                            	data: myData
                            }).done(function(data) {
                                            drawRow(result[j]);
                            });
                        }
                    });
				}

				function drawTable(data) {

					$(".ui-content").append("Sort by"+
                				"<a href='#sort' class='sort-column' data-index='0'>Title</a> |"+
                				"<a href='#sort' class='sort-column' data-index='1'>Owner</a> |"+
                				"<a href='#sort' class='sort-column' data-index='2'>Tags</a> |"+
                				"<a href='#sort' class='sort-column' data-index='3'>Close</a> |"+
						"<table class='table demo default footable-loaded footable' id='soTable' ><thead><tr></tr></thead></table>");
					$("#soTable thead tr").append("<th class='footable-first-column footable-sortable footable-sorted' data-sort-initial='true'>Title<span class='footable-sort-indicator'></span></th>")
					$("#soTable thead tr").append("<th class='footable-sortable'>Owner</th>")
					$("#soTable thead tr").append("<th class='footable-sortable'>Tags</th>")
					$("#soTable thead tr").append("<th class='footable-sortable'>Close</th>")

				}

				function drawRow(rowData) {
					// drop in html
					var row = $("<tr />")
					$("#soTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
					row.append($("<td><a href='"+rowData.link+"'target='_blank'  >" + rowData.title + "</a></td>"));
					row.append($("<td>" + rowData.owner.display_name + "</td>"));
					row.append($("<td>" + rowData.tags + "</td>"));
					if (rowData.datastax_close == undefined || rowData.datastax_close == false){
						row.append($("<td id='row"+rowData.question_id+"' onclick='closePost("+rowData.isanswered+","+rowData.answer_count+","+rowData.question_id+","+rowData.creation_date+")'>Mark Closed</td>"));
					}else{ 
						row.append($("<td id='row"+rowData.question_id+"' onclick='closePost("+rowData.isanswered+","+rowData.answer_count+","+rowData.question_id+","+rowData.creation_date+")'>Closed</td>"));
					}

				}

			}
		},
		error: function(e) {
			console.log(e.message);
		}

	});

	page = page+1;

}

function closePost(isanswered, answercount, questionid, createdate){
	//Here's where we write to c* to internally close a post
	var d = new Date(0);
	d.setSeconds(createdate);
	d =d.getFullYear() +'-'+ (d.getMonth()+1) +'-'+ d.getDate()+"T"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"Z";


	if ($("#row"+questionid).html()=="Closed"){
		datastax_close = false;
	}else{
		datastax_close = true;
	}

	myData = '{"add":{ "doc":{"datastax_close":'+datastax_close+
	',"isanswered":false'+    
	',"answercount":'+answercount+    
	',"questionid":'+questionid+    
	',"createdate":"'+d+'"'+    
	' }}}';

	myAjaxCall = $.ajax({
		url: "http://www.sestevez.com:3001/192.168.1.7:8983/solr/so_tracker.posts/update?wt=json",
		type: "POST", 
		contentType: "application/json",
		data: myData
	}).done(function(data) { 
		if (!datastax_close){
			$("#row"+questionid).html("Mark Closed");

		}else{
			$("#row"+questionid).html("Closed");
		}
	}
	);

}

pullData();

    (function($) {
      $(function() {
        $('table').footable();
            $('.sort-column').click(function (e) {
                e.preventDefault();

                //get the footable sort object
                var footableSort = $('table').data('footable-sort');

                //get the index we are wanting to sort by
                var index = $(this).data('index');

                footableSort.doSort(index, 'toggle');
            });
      })
    })(jQuery);
