var express=require('express')
var app= express()
var port=process.env.PORT || 2000//local remove
var serv= require('http').Server(app);


app.get('/',function(reg, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname+ '/client'));

serv.listen(port);
//console.log("Server started");

var socket_list={};
var score={};
var rscore={};
var num=0;
var isavl=true;
var ps=0;
var wc=0;
var wid=0;
var ss=0;
var tcount=0;
var bid=300;
var bidder=0;
var suitO=false;
var bidgu=0;
var mbr1=0;
var mbr2=0;
var mbrid1=0;
var mbrid2=0;
var arr = [];
var rp=0;
var req=false;
var name="";
var bd2=0;
var secondbid=false;


var io=require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){

	//validating user 73884pass54499
	socket.on('wantaccess',function(data){
		
		if(data.code=="73884pass54499")
			req=true;
		else
			{
				socket.emit('e',{
					msg:'e'
				});
			}
	
	
	if(isavl && req){
		req=false;
		socket.id=Math.floor(Math.random() * 1000);
		socket.n=data.name;
		//socket.ccard="";
		socket_list[socket.id]=socket;
		rscore[socket.id]=0;
		score[socket.id]=0;
		//assign id and send the id to the client 
		socket.emit('success',{
			uid:socket.id,
			uname:socket.n
		});



		num=num+1;
		//if required players are avaible then send the player list to all clients
		if (num==6) {
			var sock=[];
				   for ( i in socket_list) {
				   	
					   	sock.push({
					   		
							   id:socket_list[i].id,
							   n:socket_list[i].n
					   	});
				   }
				   for ( i in socket_list) {
						socket_list[i].emit('p_list',sock);
					} 
					 startplay();			   
		}
		if(num>=6)isavl=false;

		////console.log('socket connection'+socket.id);
		
		}

	});
		//emit e
		
		socket.on('played',function(data){
			tcount++;
			rp+=get_point(data.card_n);
			if(tcount%6==1){
				wc=data.card_n;
				wid=data.pid;
				ps=gets(data.card_n);

			}
			if(gets(data.card_n)==gets(wc) && data.card_n>wc){
				wc=data.card_n;
				wid=data.pid;
			}
			
			if(suitO && gets(data.card_n)==ss && gets(wc)!=ss){

				wc=data.card_n;
				wid=data.pid;
			}
			if(tcount%6==0){
				// emit winner
				//score update
				for (i in socket_list) {
					socket_list[i].emit('splayed',{
						pid:data.pid,	
						nxt:0,
						card_n:data.card_n,
						psuit:ps
					});//data need to change
				}
				for (i in socket_list) {
					socket_list[i].emit('won',wid);
				}
				socket_list[wid].emit('canplay',ps);
				rscore[wid]+=rp;
				//console.log(socket_list[wid].n+":"+rp);
				rp=0;
			}
			
			if(tcount%6!=0){
				for (i in socket_list) {
					socket_list[i].emit('splayed',{
						pid:data.pid,	
						nxt:data.nxt,
						card_n:data.card_n,
						psuit:ps
					});//data need to change
				}
			}
			//if(member found send all client info)
			if(data.card_n==mbr1 || data.card_n==mbr2){
				mbrid1=mbrid2;
				mbrid2=socket.id;
				for (i in socket_list) {
					socket_list[i].emit('revealm',data.pid);
				}
			}
			if(tcount==48)	{
				//console.log(rscore);
				//console.log(rscore[bidder]+rscore[mbrid1]+rscore[mbrid2]);
				if(mbrid1!=mbrid2 && (rscore[bidder]+rscore[mbrid1]+rscore[mbrid2])>=bid){
					for (i in score) {
						if(i==mbrid1 || i==mbrid2 || i==bidder){
							if(bid>=400)
								score[i]+=bid;
							score[i]+=bid;
						}
							
					}
				}
				else if((rscore[bidder]+rscore[mbrid2])>=bid){
					for (i in score) {
						if(i==mbrid2 || i==bidder){
							if(bid>=400)
								score[i]+=bid;
							score[i]+=bid;
						}
					}
				}
				else{
					for (i in score) {
						if(i!=mbrid1 && i!=mbrid2 && i!=bidder)
							score[i]+=bid;
					}
				}
				//reset round value
				for (i in rscore) {
					rscore[i]=0;
				}
				for (i in socket_list) {
					socket_list[i].emit('updatescore',score);
				}
				setTimeout(function() {
					startplay();
				}, 5000);
			}		
		});

		
		socket.on('dummy',function(data){
			//console.log('dummy page deleted');                                       
			num++;
			 if (num>=6) {isavl=false;}
		});

		
		
		socket.on('disconnect', function () {
			for(i in socket_list){
				if(socket.id==socket_list[i].id){
					delete socket_list[socket.id];
					num=num-1;
				}
			}
      	
		 if (num<6) {isavl=true;} 
		 if(num==0) cleanvar();  

		 });
		 
		socket.on('suitpicked',function(data){
			ss=data;
			if(!secondbid){
				secondbid=true;
				for (i in socket_list) {
					//sending players details to the clients
					var ar=[];
					while(ar.length < 3){
						
						ar[ar.length] = arr.pop();
					}
					
					socket_list[i].emit('remcard',ar);
			   }
			}
			
		   if(bid!=508){
			   for(i in socket_list){
				   socket_list[i].emit('ask2t');
			   }
		   }
		   else
			socket.emit('askcards');
		   
		}); 
		socket.on('making508',function(data){
			socket_list[bidder].emit('cleansuit');
			bidder=socket.id;
			bid=508;
			for (i in socket_list) {
				socket_list[i].emit('bid_5082',bidder);
			}
			

			
		});
		socket.on('no508',function(data){
			bd2++;
			if(bd2==6){
				socket_list[bidder].emit('askcards');
				bd2=0;
			}
				
		});

		socket.on('bidup',function(data){
			bid+=10;
			bidder=socket.id;//if error found get id from client
			if(bid>508){
				bid=508;
				//emit close bid
				for (i in socket_list) {
					socket_list[i].emit('bid_508',bidder);
				}
				bidgu=0;
					
			}
			else{
				for (i in socket_list) {
					socket_list[i].emit('bid_v',{
						bdr:bidder,
						bidv:bid
					});
				}
			}
		});

		socket.on('giveup',function(data){
			bidgu++;
			if(bidgu>=5){
				
				for (i in socket_list) {
					socket_list[i].emit('bid_end',{
						bdr:bidder,
						bidv:bid
					});
				}

				bidgu=0;
				
			}
		});

		socket.on('teamup',function(data){
			mbr1=data.m1;
			mbr2=data.m2;
			for (i in socket_list) {
				socket_list[i].emit('updtmember',data);
			}
			socket.emit('canplay',{});
		});

		socket.on('getsuit',function(data){
			for (i in socket_list) {
				socket_list[i].emit('suitno',ss);
			}
			suitO=true;
		});
  		
		

	});

	var gets=function (n){
		return Math.floor(((n-1)/12)+1);
	}

	function cleanvar(){
		 socket_list={};
		 score={};
		 rscore={};
		 req=false;
		 name="";
		 clean4nxt();
		 
	
		 
	}

	function clean4nxt(){
		isavl=true;
		ps=0;
		wc=0;
		wid=0;
		ss=0;
		tcount=0;
		bid=300;
		bidder=0;
		suitO=false;
		bidgu=0;
		mbr1=0;
		mbr2=0;
		mbrid1=0;
		mbrid2=0;
		rp=0;
		arr = [];
		secondbid=false;
   }
	var get_point=function(c_n){
		var p=0;
		switch(c_n%12){
			case 0: p=1;
				break;
			case 10: p=50;
				break;
			default: p=(c_n%12)+2;
		}
		return p;
	}

	function startplay(){
		clean4nxt();
		while(arr.length < 48){
			var randomnumber = Math.floor(Math.random()*48) + 1;
			if(arr.indexOf(randomnumber) > -1) continue;
			arr[arr.length] = randomnumber;
		}
	   

		for (i in socket_list) {
			//sending players details to the clients
			var ar=[];
			while(ar.length < 5){
				
				ar[ar.length] = arr.pop();
			}
			
			socket_list[i].emit('plrdy',ar);
		}
	}

	