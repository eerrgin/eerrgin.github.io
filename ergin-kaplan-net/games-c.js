/* Ergin Kaplan Net · 2003 oyun salonu
   Ergin Lab / özgün tarayıcı oyunları · © Ergin Kaplan */
(function () {
  "use strict";
  const E=globalThis.EKN;
  if(!E)return;
  const K=E.keys,P=E.pressed,W=E.W,H=E.H;
  const hit=function(code){if(!P[code])return false;delete P[code];return true;};
  const clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};

  /* 19 · Disket Koşusu */
  E.starters.disket=function(){
    const ground=332;
    let player={x:112,y:ground-44,w:28,h:44,vy:0,duck:0};
    let obstacles=[],spawn=0.9,elapsed=0,score=0,lives=3,speed=230,dead=false,flash=0;
    const skyline=[];
    for(let i=0;i<16;i++)skyline.push({x:i*52,w:26+(i%4)*8,h:42+(i%5)*16});
    E.loop(function(dt){
      elapsed+=dt;speed=230+Math.min(130,elapsed*3.2);spawn-=dt;flash=Math.max(0,flash-dt);
      if((hit("Space")||hit("ArrowUp")||hit("KeyW"))&&player.y>=ground-player.h-1){player.vy=-440;player.duck=0;E.sfx(420,0.06,"square",0.02);}
      if(K.ArrowDown||K.KeyS)player.duck=0.4;else player.duck=Math.max(0,player.duck-dt);
      player.vy+=1020*dt;player.y+=player.vy*dt;
      const h=player.duck>0?23:44;
      if(player.y>ground-h){player.y=ground-h;player.vy=0;}
      if(spawn<=0){
        const kind=Math.random()<0.28?"wire":"crate";
        obstacles.push({x:W+30,y:kind==="wire"?ground-27:ground-35,w:kind==="wire"?48:28,h:kind==="wire"?8:35,kind:kind,passed:false});
        spawn=Math.max(0.64,E.rand(0.95,1.45)-elapsed*0.004);
      }
      obstacles.forEach(function(o){o.x-=speed*dt;if(!o.passed&&o.x+o.w<player.x){o.passed=true;score+=10;}});
      obstacles=obstacles.filter(function(o){return o.x>-70;});
      const py=player.duck>0?ground-23:player.y;
      const ph=player.duck>0?23:44;
      for(let i=obstacles.length-1;i>=0;i--){
        const o=obstacles[i];
        if(player.x+player.w-5>o.x+4&&player.x+5<o.x+o.w-4&&py+ph>o.y-3&&py<o.y+o.h){
          obstacles.splice(i,1);lives--;flash=0.3;E.sfx(110,0.12,"sawtooth",0.03);
          if(lives<=0){dead=true;E.remember("disket",score+Math.floor(elapsed*4));E.showEnd("Disketler dağıldı","Koşu süresi: "+Math.floor(elapsed)+" sn · Puan: "+score);return;}
          player.vy=-220;player.y=ground-ph-2;
        }
      }
      score+=Math.floor(dt*3);
      E.setScore(score+" puan · "+lives+" can · "+Math.floor(speed)+" hız");
    },function(){
      E.clear("#101625");
      for(let i=0;i<45;i++){const x=(i*97+Math.floor(elapsed*8))%W,y=(i*53)%215;E.rect(W-x,y,1,1,i%4?"#62748b":"#e8b86b");}
      E.ctx.fillStyle="#c9a45f";E.ctx.beginPath();E.ctx.arc(520,70,23,0,Math.PI*2);E.ctx.fill();
      skyline.forEach(function(b,i){const x=(b.x-(elapsed*20)%(W+60)+W+60)%(W+60)-30;E.rect(x,ground-b.h-10,b.w,b.h+10,"#202b40");E.rect(x+5,ground-b.h,4,5,"#b58d55");E.rect(x+14,ground-b.h+13,4,5,"#b58d55");});
      E.rect(0,ground,W,H-ground,"#29251e");E.rect(0,ground,W,3,"#d2ad66");
      for(let x=0;x<W;x+=34)E.rect((x-(elapsed*speed*0.35)%34),ground+20,16,2,"#6f5a3b");
      obstacles.forEach(function(o){if(o.kind==="wire"){E.rect(o.x,o.y,o.w,o.h,"#e25b4a");E.rect(o.x+5,o.y-8,3,8,"#e8a838");E.rect(o.x+o.w-8,o.y-8,3,8,"#e8a838");}else{E.rect(o.x,o.y,o.w,o.h,"#8f7044");E.rect(o.x+5,o.y+5,o.w-10,4,"#c9a66b");E.rect(o.x+8,o.y+16,4,4,"#392b20");}}
      );
      const py=player.duck>0?ground-23:player.y,ph=player.duck>0?23:44;
      E.rect(player.x,py,player.w,ph,flash>0?"#e25b4a":"#4e9a8d");E.rect(player.x+6,py-8,16,11,"#c78b68");E.rect(player.x+19,py-4,4,4,"#07110d");
      E.rect(player.x+3,py+ph-4,9,7,"#252c39");E.rect(player.x+17,py+ph-4,9,7,"#252c39");
      E.text("DİSKET KOŞUSU  /  GECE YOLU",16,13,12,"#d8c38e");E.panel();
    });
  };

  /* 20 · Kaset Ritmi */
  E.starters.kaset=function(){
    const lanes=[{key:"KeyA",label:"A",color:"#e25b4a",x:155},{key:"KeyS",label:"S",color:"#e8a838",x:265},{key:"KeyD",label:"D",color:"#5a9db1",x:375},{key:"KeyF",label:"F",color:"#7eaa65",x:485}];
    let notes=[],spawn=0.45,elapsed=0,score=0,hits=0,misses=0,created=0,flash=0,perfect=0;
    const target=304,total=28,speed=215;
    E.loop(function(dt){
      elapsed+=dt;spawn-=dt;flash=Math.max(0,flash-dt);
      if(spawn<=0&&created<total){
        const lane=(created*7+Math.floor(Math.random()*4))%4;
        notes.push({lane:lane,y:-20,hit:false});created++;spawn=0.62;
      }
      notes.forEach(function(n){n.y+=speed*dt;});
      lanes.forEach(function(l,idx){
        if(hit(l.key)){
          let choice=-1,best=9999;
          for(let i=0;i<notes.length;i++)if(notes[i].lane===idx){const d=Math.abs(notes[i].y-target);if(d<best){best=d;choice=i;}}
          if(choice>=0&&best<47){
            const n=notes.splice(choice,1)[0],points=best<14?120:best<28?90:60;
            score+=points;hits++;if(points===120)perfect++;flash=0.18;E.sfx([420,500,610,720][idx],0.09,"triangle",0.03);
          }else{misses++;score=Math.max(0,score-12);E.sfx(130,0.07,"square",0.02);}
        }
      });
      for(let i=notes.length-1;i>=0;i--)if(notes[i].y>target+58){notes.splice(i,1);misses++;score=Math.max(0,score-8);}
      E.setScore(score+" puan · "+hits+" isabet · "+misses+" kaçan");
      if(created===total&&notes.length===0){
        const rating=perfect>=18?"KASET USTASI":perfect>=10?"GÜZEL KARIŞIM":"BİR DAHA SAR";
        E.remember("kaset",score);E.showEnd(rating,"İsabet: "+hits+" · Mükemmel: "+perfect+" · Kaçan: "+misses+" · Toplam: "+score);
      }
    },function(){
      E.clear("#14121c");E.rect(35,24,570,342,"#302a27");E.rect(43,32,554,326,"#13181c");
      E.text("KASET RİTMİ  /  A · S · D · F",320,40,13,"#e8c88d","center");
      lanes.forEach(function(l,i){
        E.rect(l.x-32,76,64,255,"#222b2d");E.rect(l.x-27,80,54,245,"#101719");
        E.rect(l.x-31,target-3,62,6,"#c8b58b");E.text(l.label,l.x,338,17,l.color,"center");
        E.rect(l.x-17,352,34,3,l.color);
      });
      notes.forEach(function(n){const l=lanes[n.lane];E.ctx.fillStyle=l.color;E.ctx.beginPath();E.ctx.arc(l.x,n.y,13,0,Math.PI*2);E.ctx.fill();E.ctx.fillStyle="rgba(255,255,255,.35)";E.ctx.beginPath();E.ctx.arc(l.x-4,n.y-4,4,0,Math.PI*2);E.ctx.fill();});
      E.text("KASSETÇALAR  /  2003",320,384,10,"#a49b84","center");
      if(flash>0){E.text("TAM ZAMANINDA!",320,59,12,"#b7f5c8","center");}
      E.panel();
    });
  };
})();