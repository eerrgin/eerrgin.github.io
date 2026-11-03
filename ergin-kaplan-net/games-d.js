/* Kervan İnternet Kafe · özgün kafe-klasikleri
   Tamamı özgün Canvas çizimleri ve kod. Üçüncü taraf oyun varlığı kullanılmaz. */
(function () {
  "use strict";
  const E=globalThis.EKN;if(!E)return;
  const K=E.keys,P=E.pressed,M=E.pointer,W=E.W,H=E.H;
  const hit=(k)=>{if(!P[k])return false;delete P[k];return true;};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const finish=(id,score,title,msg)=>{E.remember(id,score);E.showEnd(title,msg);};

  /* LAN Operasyonu: üstten görünümlü, tek oyunculu bot çatışması */
  E.starters.lan=function(){
    let p={x:320,y:320,hp:100,shot:0},bots=[],bullets=[],enemy=[],score=0,spawn=0,flash=0;
    for(let i=0;i<5;i++)bots.push({x:70+i*120,y:70+(i%2)*65,hp:2,cd:1+Math.random()});
    E.loop(function(dt){
      let dx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),dy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);
      const m=Math.hypot(dx,dy)||1;p.x=clamp(p.x+dx/m*190*dt,22,618);p.y=clamp(p.y+dy/m*190*dt,55,378);
      p.shot-=dt;spawn-=dt;flash=Math.max(0,flash-dt);
      if(M.down&&p.shot<=0){let a=Math.atan2(M.y-p.y,M.x-p.x);bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420});p.shot=.18;E.sfx(260,.035,"square",.018);}
      if(spawn<=0&&bots.length<9){bots.push({x:25+Math.random()*590,y:55+Math.random()*240,hp:2,cd:1});spawn=.9;}
      bullets.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;});
      bullets=bullets.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
      bots.forEach(b=>{let a=Math.atan2(p.y-b.y,p.x-b.x);b.x+=Math.cos(a)*30*dt;b.y+=Math.sin(a)*30*dt;b.cd-=dt;if(b.cd<=0){enemy.push({x:b.x,y:b.y,vx:Math.cos(a)*145,vy:Math.sin(a)*145});b.cd=1.45;}});
      enemy.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;if(Math.hypot(b.x-p.x,b.y-p.y)<13){p.hp-=12;b.x=-30;flash=.15;}});
      enemy=enemy.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
      bullets.forEach(q=>bots.forEach(b=>{if(b.hp>0&&Math.hypot(q.x-b.x,q.y-b.y)<15){b.hp--;q.x=-50;if(!b.hp)score+=100;}}));
      bots=bots.filter(b=>b.hp>0);
      E.setScore(score+" · CAN "+Math.max(0,p.hp));
      if(p.hp<=0)finish("lan",score,"OPERASYON BİTTİ",score+" puan. Yeniden dene.");
    },function(){
      E.clear("#101a20");
      for(let x=0;x<W;x+=40){E.rect(x,48,1,340,"#1c3035");}for(let y=48;y<H;y+=40)E.rect(0,y,W,1,"#1c3035");
      E.rect(20,55,600,325,"#14242a");E.rect(25,60,590,315,"#182b30");
      for(let i=0;i<7;i++){E.rect(45+i*82,90+(i%3)*78,36,24,"#293b3b");E.rect(48+i*82,93+(i%3)*78,30,18,"#40504a");}
      bots.forEach(b=>{E.ctx.fillStyle="#d45c4b";E.ctx.beginPath();E.ctx.arc(b.x,b.y,11,0,Math.PI*2);E.ctx.fill();E.rect(b.x-8,b.y+8,16,8,"#793b39");});
      bullets.forEach(b=>{E.ctx.fillStyle="#f5d17a";E.ctx.beginPath();E.ctx.arc(b.x,b.y,3,0,Math.PI*2);E.ctx.fill();});
      enemy.forEach(b=>E.rect(b.x-2,b.y-2,4,4,"#ff8b6e"));
      E.ctx.fillStyle="#79c6cf";E.ctx.beginPath();E.ctx.arc(p.x,p.y,12,0,Math.PI*2);E.ctx.fill();E.rect(p.x-7,p.y+7,14,9,"#345c78");
      E.text("LAN OPERASYONU / BOT TAKIMI",320,15,13,"#e8c88d","center");E.panel();
    });
  };

  /* Kervan Efsaneleri: küçük keşif ve yaratık avı RPG'si */
  E.starters.efsane=function(){
    let p={x:320,y:200,hp:5},gems=0,monsters=[],cool=0,world=0;
    for(let i=0;i<7;i++)monsters.push({x:55+(i*79)%530,y:75+(i*47)%260,hp:2,phase:i});
    E.loop(function(dt){
      let dx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),dy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0),m=Math.hypot(dx,dy)||1;
      p.x=clamp(p.x+dx/m*150*dt,24,616);p.y=clamp(p.y+dy/m*150*dt,60,370);cool-=dt;world+=dt;
      if((hit("Space")||hit("KeyF"))&&cool<=0){monsters.forEach(q=>{if(Math.hypot(q.x-p.x,q.y-p.y)<55&&q.hp>0){q.hp--;if(q.hp===0)gems++;}});cool=.35;E.sfx(180,.07,"triangle",.035);}
      monsters.forEach(q=>{if(q.hp>0){let a=Math.atan2(p.y-q.y,p.x-q.x);q.x+=Math.cos(a)*13*dt;q.y+=Math.sin(a)*13*dt;if(Math.hypot(q.x-p.x,q.y-p.y)<17){p.hp-=dt*.45;}}});
      E.setScore("KRİSTAL "+gems+" · CAN "+Math.ceil(p.hp));
      if(p.hp<=0)finish("efsane",gems*100,"MACERA SONA ERDİ",gems+" kristal topladın.");
      if(gems===7)finish("efsane",gems*100,"EFSANE TAMAMLANDI","Yedi kristal de senin. Kervan seni konuşuyor.");
    },function(){
      E.clear("#111d1b");for(let i=0;i<18;i++){let x=(i*73)%W,y=55+(i*59)%330;E.rect(x,y,26,18,"#1b3429");E.rect(x+5,y+4,16,10,"#254b37");}
      E.rect(25,55,590,320,"none");E.ctx.strokeStyle="#a68b57";E.ctx.strokeRect(25,55,590,320);
      monsters.forEach(q=>{if(q.hp<=0)return;E.ctx.fillStyle="#9d6651";E.ctx.beginPath();E.ctx.arc(q.x,q.y,12,0,Math.PI*2);E.ctx.fill();E.rect(q.x-8,q.y+7,16,9,"#563f3b");});
      E.ctx.fillStyle="#e3c37d";E.ctx.beginPath();E.ctx.arc(p.x,p.y,11,0,Math.PI*2);E.ctx.fill();E.rect(p.x-7,p.y+7,14,12,"#426f8b");
      E.text("KERVAN EFSANELERİ / KRİSTAL AVCISI",320,15,12,"#e8c88d","center");E.text("WASD · BOŞLUK: SALDIRI",320,382,10,"#a8c4aa","center");E.panel();
    });
  };

  /* Saha 2003: arcade futbol */
  E.starters.saha=function(){
    let p={x:320,y:320,v:0},ball={x:320,y:185,vx:80,vy:110},keeper=320,score=0,shots=0,cd=0;
    E.loop(function(dt){
      p.x=clamp(p.x+((K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0))*210*dt,45,595);
      keeper+=Math.sin(performance.now()/430)*85*dt;keeper=clamp(keeper,245,395);cd-=dt;
      ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.99,dt*60);ball.vy*=Math.pow(.99,dt*60);
      if(ball.y>350&&Math.abs(ball.x-p.x)<28){ball.vy=-Math.abs(ball.vy)-35;ball.vx+=(ball.x-p.x)*3;}
      if((hit("Space")||hit("KeyW"))&&cd<=0&&Math.hypot(ball.x-p.x,ball.y-310)<65){ball.vy=-360;ball.vx+=(ball.x-p.x)*2;cd=.5;shots++;}
      if(ball.y<92&&ball.x>keeper-38&&ball.x<keeper+38){ball.vy=Math.abs(ball.vy)+70;ball.vx+=(ball.x-keeper)*2;}
      if(ball.y<42){if(ball.x>250&&ball.x<390)score++;ball={x:320,y:185,vx:(Math.random()-.5)*100,vy:110};}
      if(ball.y>410||ball.x<0||ball.x>640)ball={x:320,y:185,vx:(Math.random()-.5)*100,vy:110};
      E.setScore("GOL "+score+" · ŞUT "+shots);if(score>=5)finish("saha",score*100,"ŞAMPİYON!",score+" golle maçı aldın.");
    },function(){
      E.clear("#123b2b");E.rect(22,35,596,340,"#28764a");for(let y=45;y<375;y+=36)E.rect(22,y,596,1,"rgba(255,255,255,.13)");
      E.ctx.strokeStyle="#dce7d0";E.lineWidth=2;E.strokeRect(35,45,570,320);E.ctx.beginPath();E.arc(320,205,55,0,Math.PI*2);E.stroke();E.strokeRect(235,45,170,65);
      E.rect(keeper-28,58,56,12,"#d9b36e");E.rect(p.x-13,320,26,29,"#4f9bd0");E.ctx.fillStyle="#f5edcf";E.ctx.beginPath();E.ctx.arc(ball.x,ball.y,7,0,Math.PI*2);E.ctx.fill();
      E.text("SAHA 2003 / BEŞ GOLLÜK MAÇ",320,12,12,"#f2dfb0","center");E.panel();
    });
  };

  /* Son Komuta: üs kur, birlik gönder, rakip üssü düşür */
  E.starters.komuta=function(){
    let gold=100,units=[],enemy=5,base=100,enemyBase=100,spawn=0,selected=null,won=false;
    E.loop(function(dt){
      spawn-=dt;if(spawn<=0&&units.length<18){units.push({x:95,y:205,hp:3,side:0,cd:Math.random()});units.push({x:545,y:205,hp:3,side:1,cd:Math.random()});spawn=2.5;}
      if(M.click){M.click=false;let x=M.x,y=M.y;
        if(x<180&&y>120&&y<290&&gold>=25){units.push({x:100,y:205+(Math.random()-.5)*65,hp:3,side:0,cd:0});gold-=25;}
        else {let u=units.find(q=>Math.hypot(q.x-x,q.y-y)<18);if(u)selected=u;else selected=null;}
      }
      units.forEach(u=>{let target=units.find(q=>q.side!==u.side&&Math.abs(q.x-u.x)<125);if(target){u.cd-=dt;if(u.cd<=0){target.hp--;u.cd=.55;}}else u.x+= (u.side===0?1:-1)*27*dt;});
      units=units.filter(u=>u.hp>0&&u.x>35&&u.x<605);
      if(units.some(u=>u.side===0&&u.x>505)){enemyBase-=dt*5;}
      if(units.some(u=>u.side===1&&u.x<135)){base-=dt*5;}
      gold+=dt*5;E.setScore("ALTIN "+Math.floor(gold)+" · ÜS "+Math.ceil(base)+" / "+Math.ceil(enemyBase));
      if(enemyBase<=0)finish("komuta",1000,"ZAFER!","Rakip üssü ele geçirdin.");
      if(base<=0)finish("komuta",0,"ÜS DÜŞTÜ","Birliklerini daha iyi yönet.");
    },function(){
      E.clear("#17252a");E.rect(35,75,570,255,"#344238");for(let x=55;x<600;x+=35)E.rect(x,195,20,4,"#69715b");
      E.rect(55,150,65,110,"#b17b45");E.rect(520,150,65,110,"#9b4d42");
      units.forEach(u=>{E.ctx.fillStyle=u.side?"#e36b58":"#76b7d2";E.ctx.beginPath();E.ctx.arc(u.x,u.y,10,0,Math.PI*2);E.ctx.fill();if(u===selected){E.ctx.strokeStyle="#f3d27d";E.ctx.beginPath();E.ctx.arc(u.x,u.y,15,0,Math.PI*2);E.ctx.stroke();}});
      E.text("SON KOMUTA / ÜS SAVAŞI",320,15,13,"#e8c88d","center");E.text("ÜSÜNE TIKLA: 25 ALTINA BİRLİK ÜRET · BİRLİKLER OTOMATİK İLERLER",320,365,9,"#d1d7c4","center");E.panel();
    });
  };
})();
