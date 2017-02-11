function getCredentials(callbackFunction) {
	getGifCredentials();
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };
  var url = 'https://api.clarifai.com/v1/token';

  return axios.post(url, data, {
    'transformRequest': [
      function() {
        return transformDataToParams(data);
      }
    ]
  }).then(function(r) {
    localStorage.setItem('accessToken', r.data.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    callbackFunction();
  }, function(err) {
    console.log(err);
  });
}

function getGifCredentials(){
	var data2 = {
    "grant_type":"client_credentials",
    "client_id": gif_client_id,
    "client_secret": gif_client_secret
  };
	var url2 = 'https://api.gfycat.com/v1/oauth/token';
	return axios.post(url2, data2, {
    
  }).then(function(r) {
    localStorage.setItem('gifaccessToken', r.data.access_token);
    
    //callbackFunction();
  }, function(err) {
    console.log(err);
  });
	
}

function transformDataToParams(data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && data[p]) {
      if (typeof data[p] === 'string'){
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
      }
      if (typeof data[p] === 'object'){
        for (var i in data[p]) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p][i]));
        }
      }
    }
  }
  return str.join('&');
}

function postImage(imgurl) {
	document.getElementById('originalImage').src = imgurl;
	if (localStorage.getItem('imgurl') === imgurl) {
		altParse();
		
		//return localStorage.getItem('data');
	}else{
		localStorage.setItem('imgurl', imgurl);
	
  var accessToken = localStorage.getItem('accessToken');
  var data = {
    'url': imgurl
  }; 
  var url = 'https://api.clarifai.com/v1/tag';
  return axios.post(url, data, {
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(r) {
    parseResponse(r.data);
  }, function(err) {
    console.log('Sorry, something is wrong: ' + err);
  });
}
}

function tagCloud(current){
	//console.log(localStorage.getItem('popularTags'));
	//console.log(localStorage.getItem('popularTags') === null);
		//console.log(localStorage.getItem('popularTags') === '');
	if (localStorage.getItem('popularTags') === 'empty' || localStorage.popularTags === undefined){
	
		
		var tags2 = [];
		var weights = [];
		for(i=0; i < current.length; i++){
			tags2[i] = current[i];
			weights[i] = 1;
		}
		
	}else{
		
		var tags2 = JSON.parse(localStorage.getItem('popularTags'));
	var weights = JSON.parse(localStorage.getItem('popularWeights'));
		//console.log(tags2.length)
		//console.log(current.length)
		//var i;
		for(i=0; i < current.length; i++){
			var notFound = true;
			//var n;
			for(n=0; n < tags2.length; n++){
				if(current[i] === tags2[n]){
					notFound = false;
					weights[n]++;
					break;
				}
			}
			if (notFound){
				tags2[tags2.length] = current[i];
				weights[weights.length] = 1;
			}
		}
	}
	localStorage.setItem('popularTags',JSON.stringify(tags2));
	localStorage.setItem('popularWeights',JSON.stringify(weights));
	if(document.getElementById('imgurl').value !== localStorage.getItem('imgurl') || document.getElementById('cloudSuggestion').hidden === true){
	generateCloud(tags2,weights);
	cloudGif(tags2,weights);
	}
}

function cloudGif(tags,weights){ 



	var tags = top(tags,weights);	



	var url = 'https://api.gfycat.com/v1test/gfycats/search?search_text=';

	axios.get(url + tags[0].toString() + ',' + tags[1].toString() + ',' + tags[2].toString() ).then(function(r) {

		//console.log(r.data.gfycats[Math.floor((Math.random() * 10))]);

		if (r.data.gfycats.length > 0){

		document.getElementById('cloudImage').src = r.data.gfycats[Math.floor((Math.random() * r.data.gfycats.length))].gifUrl;

	}else{

		document.getElementById('cloudImage').src = 'https://az853139.vo.msecnd.net/static/images/not-found.png';

	}
		document.getElementById('cloudImage').hidden = false;

		document.getElementById('cloudSuggestion').hidden = false;

	}, function(err) {

    console.log('Sorry, something is wrong: ' + err);

  });


	document.getElementById('popular').hidden = false;
	document.getElementById('cloudSuggestion').hidden = false;
	

} 



function top(tags,weights) {

	var output = [];
	var temp = weights;
	var check = 0;
	if (tags.length === 2){
		check = 1;
	}
	if (tags.length === 1){
		check = 2;
	}

	for (n = 0; n < 3 - check; n++){

		var position = highest(tags, temp);
		output[n] = tags[position];
		temp[n] = 0;

		

	}
	return output;

}



function highest(tags,weights) {

	var output = 0;

	for (i = 0; i < tags.length; i++){

		if (weights[i] > weights[output]){

			output = i;

		}

	}

	return output;

}

function altParse(){
	//document.getElementById('third').hidden = false;
	var tags = [];
	var resp = JSON.parse(localStorage.getItem('data'));
	 if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
		tagCloud(results[0].result.tag.classes);
  } else {
    console.log('Sorry, something is wrong.');
  }
	 document.getElementById('tags').innerHTML = tags.toString().replace(/,/g, ', ');
	var url = 'https://api.gfycat.com/v1test/gfycats/search?search_text=';
	axios.get(url + tags[0].toString() + ',' + tags[2].toString() + ',' + tags[3].toString()  + ',' + tags[Math.floor(3 + (Math.random()*6))].toString()).then(function(r) {
		//console.log(r.data.gfycats[Math.floor((Math.random() * 10))]);
		if (r.data.gfycats.length > 0){
		document.getElementById('suggested').src = r.data.gfycats[Math.floor((Math.random() * r.data.gfycats.length))].gifUrl;
	}else{
		document.getElementById('suggested').src = 'https://az853139.vo.msecnd.net/static/images/not-found.png';
	}
		document.getElementById('third').hidden = false;
	}, function(err) {
    console.log('Sorry, something is wrong: ' + err);
  });
  return tags;
}

function parseResponse(resp) {
	//document.getElementById('third').hidden = false;
	localStorage.setItem('data',JSON.stringify(resp));
  var tags = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
	 tagCloud(results[0].result.tag.classes);
  } else {
    console.log('Sorry, something is wrong.');
  }
	
	document.getElementById('second').hidden = false;
	document.getElementById('third').hidden = true;
	//document.getElementById('second').className += "animated zoomIn first";
    document.getElementById('tags').innerHTML = tags.toString().replace(/,/g, ', ');
	//console.log(tags[1].toString());
	var url = 'https://api.gfycat.com/v1test/gfycats/search?search_text=';
	axios.get(url + tags[0].toString() + ',' + tags[2].toString() + ',' + tags[3].toString()  + ',' + tags[Math.floor(3 + (Math.random()*(tags.length-3)))].toString()).then(function(r) {
		//console.log(r.data.gfycats[Math.floor((Math.random() * 10))]);
		if (r.data.gfycats.length > 0){
		document.getElementById('suggested').src = r.data.gfycats[Math.floor((Math.random() * r.data.gfycats.length))].gifUrl;
	}else{
		document.getElementById('suggested').src = 'https://az853139.vo.msecnd.net/static/images/not-found.png';
	}
		document.getElementById('third').hidden = false;
	}, function(err) {
    console.log('Sorry, something is wrong: ' + err);
  });
  return tags;
}




function generateCloud(tags3,weights){
	//console.log(tags3.length);
	var container = document.getElementById('popular');
	while (container.firstChild) {
    container.removeChild(container.firstChild);
	}
	for (i=0;i<tags3.length;i++){
		var item = document.createElement("H4");
		var text = document.createTextNode(tags3[i] + ', ');
		item.appendChild(text);
		item.style.fontSize = (8 + weights[i]) + "px";
		item.style.display = "inline";
		container.appendChild(item);
	}
}

function reset(){
	//console.log('reset');
	localStorage.setItem('popularTags','empty');
	localStorage.setItem('popularWeights','empty');
	var container = document.getElementById('popular');
	while (container.firstChild) {
    container.removeChild(container.firstChild);
	}
}

function run(imgurl) {
	if (imgurl !== localStorage.getItem('imgurl')){
		document.getElementById('output').hidden = false;
		document.getElementById('cloudSuggestion').hidden = true;
	//document.getElementById('output').className += "animated zoomIn first";
		document.getElementById('second').hidden = true;
	}else{
		document.getElementById('output').hidden = false;
	}
  if (Math.floor(Date.now() / 1000) - localStorage.getItem('tokenTimeStamp') > 86400 || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
  	postImage(imgurl);
});
  } else {
    postImage(imgurl);
  }
}