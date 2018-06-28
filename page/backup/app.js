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
		socket.x=Math.floor(1+Math.random() * 48);
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
				   for (var i in socket_list) {
				   	var socket=socket_list[i];
					   	sock.push({
					   		
							   id:socket.id,
							   n:socket.x
					   	});
				   }

			   for (i in socket_list) {
			   	//sending players details to the clients
			   	socket_list[i].emit('plrdy',sock);
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
			   //socket.ccard=data.card_t;
			   console.log('outside'+socket.id);
			   console.log(num);
			   socket.x++;

			   var pack=[];
				   for (var i in socket_list) {
				   	var socket=socket_list[i];
					   	pack.push({
					   		//t:socket.ccard,
					   		//n:socket.x,
					   		idd:socket.id
					   	});
				   }

			   for (var i in socket_list) {
			   	socket.emit('splayed',pack);
			   }

			
		});

		socket.on('test',function(data){
			//console.log(socket.x);
				socket.x=data.myid;
					 var pack=[];
				   for (var i in socket_list) {
				   		var socket1=socket_list[i];
					   	pack.push({
					   		//t:socket1.ccard,
					   		n:socket1.x,
					   		idd:socket1.id
					   	});
				   }

			   for (var i in socket_list) {
			   	socket.emit('splayed',pack);
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