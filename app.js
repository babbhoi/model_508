var express=require('express');
var app= express();
var serv= require('http').Server(app);


app.get('/',function(reg, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname+ '/client'));

serv.listen(2000);
console.log("Server started");

var socket_list={};
var num=0;
var isavl=true;
var io=require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	if(isavl){
		socket.id=Math.floor(Math.random() * 1000);
		socket.x=Math.floor(Math.random() * 48)+1;
		//socket.ccard="";
		socket_list[socket.id]=socket;
		//assign id and send the id to the client 
		socket.emit('success',{
			uid:socket.id
		});



		num=num+1;
		//if required players are avaible then send the player list to all clients
		if (num==6) {
			var sock=[];
				   for ( i in socket_list) {
				   	
					   	sock.push({
					   		
							   id:socket_list[i].id,
							   n:socket_list[i].x
					   	});
				   }

				   var arr = [];
				   while(arr.length < 48){
					   var randomnumber = Math.floor(Math.random()*48) + 1;
					   if(arr.indexOf(randomnumber) > -1) continue;
					   arr[arr.length] = randomnumber;
				   }
				  

				for (i in socket_list) {
					//sending players details to the clients
					var ar=[];
					while(ar.length < 8){
						
						ar[ar.length] = arr.pop();
					}
					console.log(ar);
					socket_list[i].emit('plrdy',{
						players:sock,
						cards:ar
					});
			   }
		}
		if(num>=6)isavl=false;

		//console.log('socket connection'+socket.id);
		
	}
	else{
		socket.emit('e',{
			msg:'e'
		});
	}
		
		socket.on('played',function(data){
			console.log("layed");
			for (i in socket_list) {
				socket_list[i].emit('splayed',data);
				console.log(socket_list[i].id);
			}  

			
		});

		
		socket.on('dummy',function(data){
			console.log('dummy page deleted');                                       
			num++;
			 if (num>=6) {isavl=false;}
		});

		
		
		socket.on('disconnect', function () {

      	delete socket_list[socket.id];
     	num=num-1;
     	if (num<6) {isavl=true;}   

     	});                      

  		
		

	});