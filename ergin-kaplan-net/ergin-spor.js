/* Ergin Kaplan Net · Ergin Spor Salonu
   Bowling, bilardo ve tenis. Özgün oyun kodu ve canvas çizimleri. */
(function () {
  "use strict";
  const E=globalThis.EKN;
  if(!E)return;
  const K=E.keys,P=E.pressed,M=E.pointer,W=E.W,H=E.H;
  const hit=function(code){if(!P[code])return false;delete P[code];return true;};
  const clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
  const moving=function(b){return Math.hypot(b.vx,b.vy)>8;};

  /* ERGİN BOWL 2003 */
  E.starters.bowling=function(){
    let frame=1,shotNo=0,total=0,grandTotal=0,throws=[],aim=0,ball=null,phase="ready",pause=0;
    let pins=[];
    function resetPins(){const coords=[[0,0],[-14,19],[14,19],[-28,38],[0,38],[28,38],[-42,57],[-14,57],[14,57],[42,57]];
      pins=coords.map(function(p){return{x:320+p[0],y:106+p[1],down:false,fall:0,vx:0,vy:0};});}
    function startRoll(){
      if(phase!=="ready")return;
      ball={x:320,y:340,vx:aim*205,vy:-430,r:12};
      phase="roll";E.sfx(190,0.12,"triangle",0.035);
    }
    resetPins();
    E.loop(function(dt){
      if(K.ArrowLeft||K.KeyA)aim=clamp(aim-dt*0.75,-0.68,0.68);
      if(K.ArrowRight||K.KeyD)aim=clamp(aim+dt*0.75,-0.68,0.68);
      if(hit("Space")||hit("Enter"))startRoll();
      if(phase==="roll"&&ball){
        ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.x=clamp(ball.x,98,542);
        pins.forEach(function(pin){
          if(!pin.down&&Math.hypot(pin.x-ball.x,pin.y-ball.y)<22){
            pin.down=true;pin.vx=ball.vx*0.12+(pin.x-ball.x)*4;pin.vy=150+Math.abs(ball.vy)*0.08;
            E.sfx(340,0.045,"square",0.02);
          }
        });
        pins.forEach(function(pin){
          if(!pin.down)return;
          pin.fall+=dt;pin.x+=pin.vx*dt;pin.y+=pin.vy*dt;pin.vx*=Math.pow(0.08,dt);pin.vy*=Math.pow(0.18,dt);
        });
        if(ball.y<62||ball.x<95||ball.x>545){const knocked=pins.filter(function(p){return p.down;}).length;const before=throws.reduce(function(s,n){return s+n;},0);throws.push(knocked-before);total=knocked;shotNo++;phase="pause";pause=0.85;}
      }else if(phase==="pause"){
        pause-=dt;
        if(pause<=0){
          if(total===10||shotNo>=2){
            grandTotal+=total;
            if(frame>=10){
              E.remember("bowling",grandTotal*10);
              E.showEnd("ERGİN BOWL · OYUN TAMAMLANDI","Devrilen kuka: "+grandTotal+"/100 · Tamamlanan tur: 10");
              phase="done";return;
            }
            frame++;shotNo=0;throws=[];total=0;resetPins();
          }
          ball=null;phase="ready";
        }
      }
      E.setScore("TUR "+Math.min(frame,10)+"/10 · DEVİR "+total+"/100 · ATış "+(shotNo+1));
    },function(){
      E.clear("#11120f");
      const c=E.ctx;
      c.fillStyle="#262820";c.fillRect(0,0,W,H);
      c.fillStyle="#59462e";c.beginPath();c.moveTo(205,70);c.lineTo(435,70);c.lineTo(580,390);c.lineTo(60,390);c.closePath();c.fill();
      c.fillStyle="#8f6a3d";c.beginPath();c.moveTo(224,83);c.lineTo(416,83);c.lineTo(548,390);c.lineTo(92,390);c.closePath();c.fill();
      c.strokeStyle="rgba(255,224,159,.22)";c.lineWidth=2;
      for(let i=0;i<13;i++){const y=105+i*22;const t=(y-83)/307;const left=224-132*t,right=416+132*t;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}
      c.strokeStyle="rgba(35,20,12,.45)";c.lineWidth=3;
      for(let i=1;i<7;i++){const t=i/7;c.beginPath();c.moveTo(224+192*t,84);c.lineTo(92+456*t,390);c.stroke();}
      c.fillStyle="#d8c28f";c.fillRect(195,62,250,5);
      pins.forEach(function(pin){
        if(pin.down){c.save();c.translate(pin.x,pin.y);c.rotate(pin.fall*2);c.fillStyle="#ded8c5";c.fillRect(-5,-14,10,27);c.fillStyle="#bd5344";c.fillRect(-5,-7,10,4);c.restore();}
        else{c.fillStyle="#f2ead5";c.beginPath();c.ellipse(pin.x,pin.y,7,11,0,0,Math.PI*2);c.fill();c.fillStyle="#c74f42";c.fillRect(pin.x-6,pin.y-3,12,3);c.fillStyle="#c9c0ad";c.fillRect(pin.x-2,pin.y-13,4,5);}
      });
      if(ball){c.fillStyle="#c88741";c.beginPath();c.arc(ball.x,ball.y,ball.r,0,Math.PI*2);c.fill();c.fillStyle="#f2c16b";c.beginPath();c.arc(ball.x-4,ball.y-4,3,0,Math.PI*2);c.fill();}
      else{c.fillStyle="#c88741";c.beginPath();c.arc(320,340,12,0,Math.PI*2);c.fill();}
      c.strokeStyle="#f0c46f";c.lineWidth=2;c.beginPath();c.moveTo(320,320);c.lineTo(320+aim*155,182);c.stroke();
      E.text("ERGİN BOWL 2003",320,15,15,"#f1dba2","center");
      E.text("← / → AÇI    SPACE AT",320,371,11,"#e1cda0","center");
      E.text("FRAME "+Math.min(frame,10)+"   ·   "+(shotNo===0?"İLK ATIŞ":"İKİNCİ ATIŞ"),320,45,11,"#9fbe9d","center");
      E.panel();
    });
  };

  /* ERGİN 8-BALL BİLARDO */
  E.starters.bilardo=function(){
    const table={x:66,y:48,w:508,h:304},r=8.5,holes=[
      [76,58],[320,54],[564,58],[76,342],[320,346],[564,342]
    ];
    let balls=[],score=0,shots=0,aim={x:1,y:0},scratch=0,shotClock=0;
    function rack(){
      balls=[{id:0,x:180,y:200,vx:0,vy:0,c:"#f1e6cb",active:true}];
      const palette=["#e7c84d","#3978b8","#c94e43","#8051a7","#dc8d35","#3e9a73","#b84c52","#302e32","#dfdfd5"];
      const rack=[[0,0],[-15,16],[15,16],[-30,32],[0,32],[30,32],[-15,48],[15,48],[0,64]];
      rack.forEach(function(p,id){balls.push({id:id+1,x:420+p[0],y:167+p[1],vx:0,vy:0,c:palette[id],active:true});});
    }
    rack();
    function anyMoving(){return balls.some(function(b){return b.active&&moving(b);});}
    function shoot(power){
      const cue=balls[0];if(anyMoving()||!cue.active)return;
      const mag=Math.hypot(aim.x,aim.y)||1;cue.vx=aim.x/mag*power;cue.vy=aim.y/mag*power;shots++;E.sfx(210,0.055,"square",0.028);
    }
    function pocketBall(b){
      if(b.id===0){scratch++;b.active=false;shotClock=0.4;}
      else{b.active=false;score+=10;E.sfx(490,0.045,"triangle",0.025);}
    }
    E.loop(function(dt){
      const cue=balls[0];
      if(M.x>table.x&&M.x<table.x+table.w&&M.y>table.y&&M.y<table.y+table.h){
        const dx=M.x-cue.x,dy=M.y-cue.y,mag=Math.hypot(dx,dy)||1;aim={x:dx/mag,y:dy/mag};
      }
      if((hit("Space")||M.click)&&!anyMoving()&&cue.active){
        const d=Math.hypot(M.x-cue.x,M.y-cue.y);shoot(M.click?clamp(190+d*0.62,190,470):350);M.click=false;
      }
      balls.forEach(function(b){
        if(!b.active)return;
        b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.pow(0.986,dt*60);b.vy*=Math.pow(0.986,dt*60);
        if(Math.hypot(b.vx,b.vy)<6){b.vx=0;b.vy=0;}
        for(const h of holes){if(Math.hypot(b.x-h[0],b.y-h[1])<18){pocketBall(b);break;}}
        if(!b.active)return;
        if(b.x<table.x+r){b.x=table.x+r;b.vx=Math.abs(b.vx)*0.88;}
        if(b.x>table.x+table.w-r){b.x=table.x+table.w-r;b.vx=-Math.abs(b.vx)*0.88;}
        if(b.y<table.y+r){b.y=table.y+r;b.vy=Math.abs(b.vy)*0.88;}
        if(b.y>table.y+table.h-r){b.y=table.y+table.h-r;b.vy=-Math.abs(b.vy)*0.88;}
      });
      for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){
        const a=balls[i],b=balls[j];if(!a.active||!b.active)continue;
        let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=r*2;
        if(d>0&&d<min){
          const nx=dx/d,ny=dy/d,overlap=min-d;
          a.x-=nx*overlap/2;a.y-=ny*overlap/2;b.x+=nx*overlap/2;b.y+=ny*overlap/2;
          const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
          if(rel>0){a.vx-=rel*nx;a.vy-=rel*ny;b.vx+=rel*nx;b.vy+=rel*ny;}
        }
      }
      if(!cue.active&&shotClock>0){shotClock-=dt;if(shotClock<=0){cue.active=true;cue.x=180;cue.y=200;cue.vx=cue.vy=0;}}
      if(balls.slice(1).every(function(b){return !b.active;})){
        E.remember("bilardo",score+Math.max(0,100-shots)*5);E.showEnd("MASA TEMİZLENDİ","Toplanan: 9 · Vuruş: "+shots+" · Puan: "+score);return;
      }
      E.setScore(score+" puan · "+shots+" vuruş · faul "+scratch);
    },function(){
      const cue=balls[0];
      E.clear("#101317");const c=E.ctx;
      c.fillStyle="#4a3020";c.fillRect(38,25,564,350);
      c.fillStyle="#155b43";c.fillRect(55,42,530,316);
      c.fillStyle="#1b7653";c.fillRect(66,53,508,294);
      c.strokeStyle="rgba(230,208,148,.2)";c.lineWidth=2;c.strokeRect(78,65,484,270);
      holes.forEach(function(h){c.fillStyle="#090a0a";c.beginPath();c.arc(h[0],h[1],17,0,Math.PI*2);c.fill();c.fillStyle="#765239";c.beginPath();c.arc(h[0],h[1],11,0,Math.PI*2);c.fill();});
      balls.forEach(function(b){if(!b.active)return;c.fillStyle="rgba(0,0,0,.24)";c.beginPath();c.arc(b.x+2,b.y+3,r,0,Math.PI*2);c.fill();c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,r,0,Math.PI*2);c.fill();c.fillStyle="rgba(255,255,255,.65)";c.beginPath();c.arc(b.x-3,b.y-3,2.5,0,Math.PI*2);c.fill();if(b.id>0){c.fillStyle="#101010";c.font="8px monospace";c.textAlign="center";c.fillText(b.id,b.x,b.y+3);}});
      if(cue.active&&!anyMoving()){c.strokeStyle="#e6c78c";c.lineWidth=3;c.beginPath();c.moveTo(cue.x-aim.x*85,cue.y-aim.y*85);c.lineTo(cue.x-aim.x*15,cue.y-aim.y*15);c.stroke();c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=1;c.beginPath();c.moveTo(cue.x,cue.y);c.lineTo(cue.x+aim.x*160,cue.y+aim.y*160);c.stroke();}
      E.text("ERGİN 9-BALL  /  BİLARDO MASASI",320,9,13,"#e6cd97","center");E.text("FAREYLE NİŞAN AL · TIKLA / SPACE İLE VUR",320,380,10,"#a8c4a7","center");E.panel();
    });
  };

  /* ERGİN TENİS KULÜBÜ */
  E.starters.tenispro=function(){
    let player={x:320,y:340,w:72},cpu={x:320,y:86,w:78};
    let ball={x:320,y:180,vx:145,vy:190},p=0,c=0,delay=0,serve=0,combo=0,bestRally=0;
    function point(who){
      if(who==="p")p++;else c++;
      bestRally=Math.max(bestRally,combo);combo=0;delay=0.7;serve=who;
      ball={x:320,y:200,vx:0,vy:0};
    }
    E.loop(function(dt){
      if(K.ArrowLeft||K.KeyA)player.x-=260*dt;
      if(K.ArrowRight||K.KeyD)player.x+=260*dt;
      player.x=clamp(player.x,120,520);
      cpu.x+=(clamp(ball.x,130,510)-cpu.x)*Math.min(1,dt*3.2);
      if(delay>0){delay-=dt;if(delay<=0){ball={x:320,y:200,vx:E.rand(-150,150),vy:serve==="p"?-200:200};}}
      else{
        ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
        if(ball.x<95||ball.x>545){ball.vx*=-1;ball.x=clamp(ball.x,95,545);}
        if(ball.vy>0&&ball.y>318&&ball.y<360){
          if(Math.abs(ball.x-player.x)<player.w/2+15){const off=(ball.x-player.x)/(player.w/2);ball.vy=-Math.abs(ball.vy)*1.035;ball.vx=off*260+(K.ArrowRight?45:K.ArrowLeft?-45:0);combo++;E.sfx(520,0.05,"square",0.025);}
          else point("c");
        }
        if(ball.vy<0&&ball.y<106&&ball.y>70){
          if(Math.abs(ball.x-cpu.x)<cpu.w/2+12){const off=(ball.x-cpu.x)/(cpu.w/2);ball.vy=Math.abs(ball.vy)*1.015;ball.vx=off*230+E.rand(-35,35);}
          else point("p");
        }
        if(ball.y<35)point("p");
        if(ball.y>390)point("c");
      }
      E.setScore("SEN "+p+"  :  "+c+" RAKİP · RALLİ "+combo);
      if(p>=5||c>=5) {E.remember("tenispro",p*100+bestRally*10);E.showEnd(p>c?"KORT SENİN!":"MAÇI RAKİP ALDI",p+" - "+c+" · En uzun ralli: "+bestRally);return;}
    },function(){
      E.clear("#101923");const ctx=E.ctx;
      ctx.fillStyle="#174a36";ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#d7c89b";ctx.beginPath();ctx.moveTo(180,45);ctx.lineTo(460,45);ctx.lineTo(590,390);ctx.lineTo(50,390);ctx.closePath();ctx.fill();
      ctx.fillStyle="#287d59";ctx.beginPath();ctx.moveTo(187,52);ctx.lineTo(453,52);ctx.lineTo(578,383);ctx.lineTo(62,383);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#e5e2cd";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(195,60);ctx.lineTo(445,60);ctx.lineTo(555,375);ctx.lineTo(85,375);ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.moveTo(320,60);ctx.lineTo(320,375);ctx.moveTo(174,218);ctx.lineTo(466,218);ctx.stroke();
      ctx.strokeStyle="#f2e9cf";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(174,202);ctx.lineTo(466,202);ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=1;for(let x=180;x<465;x+=12){ctx.beginPath();ctx.moveTo(x,198);ctx.lineTo(x,207);ctx.stroke();}
      ctx.fillStyle="#d5a36b";ctx.beginPath();ctx.arc(cpu.x,92,13,0,Math.PI*2);ctx.fill();ctx.fillStyle="#bd4e42";ctx.fillRect(cpu.x-15,105,30,30);
      ctx.strokeStyle="#e7c58a";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(cpu.x+cpu.w*0.34,125,12,19,-0.6,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#d5a36b";ctx.beginPath();ctx.arc(player.x,325,14,0,Math.PI*2);ctx.fill();ctx.fillStyle="#3f7fbe";ctx.fillRect(player.x-17,339,34,21);
      ctx.strokeStyle="#e7c58a";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(player.x+35,345,14,22,-0.4,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#f7edcf";ctx.beginPath();ctx.arc(ball.x,ball.y,6,0,Math.PI*2);ctx.fill();
      E.text("ERGİN TENİS KULÜBÜ",320,10,14,"#e8d5a6","center");E.text("A / D VEYA OKLAR · RAKETİ HAREKET ETTİR",320,380,10,"#c1d3b7","center");E.panel();
    });
  };
})();