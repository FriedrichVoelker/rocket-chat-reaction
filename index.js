const fs = require("fs");
const configData = fs.readFileSync("./config.json", "utf8");
const config = JSON.parse(configData);





let token = null;
let userId = null;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
async function login() {
	return new Promise(async (resolve, _) => {
	let res = await http("POST",  "login", `user=${config.username}&password=${config.password}`);
	if(res.status == "success"){
		token = res.data.authToken
		userId = res.data.userId
		return resolve(true);
	}
	}).catch((err) => {
		return JSON.stringify({ error: err });
	});
}

async function main(){
	let res = await http("GET", `chat.search?roomId=${config.roomId || "GENERAL"}&searchText=${config.searchText || "Duck"}&count=${config.count || "10"}`, ``);
	console.log("Messages:", res)
	res.messages.forEach(async element => {
		res = await http("POST", "chat.react", `{ "messageId" : "${element._id}" , "emoji" : "${config.emoji || "duck"}", "shouldReact" : true }`);
	});
}


async function http(method,endpoint, reqData) {
	return new Promise(async (resolve, _) => {
	  var url = config.url + "/api/v1/" + endpoint;
	  let returnval = null;
	  var xhr = new XMLHttpRequest();
	  xhr.open(method, url);
  
	  endpoint == "login" ? xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded") : xhr.setRequestHeader("Content-Type", "application/json");
	  token != "" && token != null ? xhr.setRequestHeader("X-Auth-Token", token) : "";
	  userId != "" && userId != null ? xhr.setRequestHeader("X-User-Id", userId) : "";
	  xhr.onreadystatechange = async function () {
		//   console.log(xhr)
		if (xhr.readyState === 4) {
		  if(xhr.status == 401){
			  let loggedin = await login();
			  if(loggedin){
				let res = await http(method,endpoint,reqData);
				returnval = res;
			  }
		  }else{
			returnval = xhr.responseText
		  }
		  console.log(returnval)
		  return resolve(JSON.parse(returnval));
		}
	  };
  
	  var data = reqData;
	  xhr.send(data);
  
	}).catch((err) => {
	  return JSON.stringify({ error: err });
	});
}
async function init(){
	await login()
	main()
}
init()

setInterval(function (){main()}, config.interval || 30000)
