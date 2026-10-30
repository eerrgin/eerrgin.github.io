/* Ergin Kaplan Net · Ergin Sokak Yarışı
   Özgün pseudo-3B yarış oyunu, dış motor veya varlık kullanmaz. */
(function () {
  "use strict";
  const E=globalThis.EKN;
  if(!E)return;
  const K=E.keys,P=E.pressed,W=E.W,H=E.H;
  const hit=function(code){if(!P[code])return false;delete P[code];return true;};
  const clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
  E.starters.kervangp=function(){
    let player={lane:0,x:0,damage:0,steer:0};
    let traffic=[],spawn=0.8,elapsed=0,distance=0,speed=205,score=0,flash=0,boost=0,finished=false;
    let stripes=0,checkpoint=0;
    const sky=[];for(let i=0;i<48;i++)sky.push({x:(i*83+19)%640,y:(i*47)%155,r:i%8===0?2:1});
    function addTraffic(){
      const lanes=[-0.72,-0.24,0.24,0.72];
      const lane=lanes[E.irand(0,3)];
      traffic.push({lane:lane,z:0.02,type:E.irand(0,3),color:["#d85a46","#d5ac57","#4f8fa3","#a6a18b","#7f9a6a"][E.irand(0,4)],passed:false});
    }
    function project(lane,z){
      const center=320,spread=78+z*185;
      return {x:center+lane*spread,y:65+z*310,scale:0.22+z*0.82};
    }
    E.loop(function(dt){
      elapsed+=dt;flash=Math.max(0,flash-dt);boost=Math.max(0,boost-dt);
      const accel=K.ArrowUp||K.KeyW,brake=K.ArrowDown||K.KeyS;
      speed=clamp(speed+(accel?120:brake?-190:-20)*dt,110,390);
      const steering=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0);
      player.lane=clamp(player.lane+steering*dt*(0.92+speed/450),-0.88,0.88);
      player.steer=steering;
      distance+=speed*dt/12;score=Math.floor(distance);
      spawn-=dt;
      if(spawn<=0){addTraffic();spawn=Math.max(0.43,1.05-(speed-150)/550);}
      traffic.forEach(function(car){
        car.z+=dt*(0.22+speed/1450);
        if(car.z>0.79&&!car.passed){
          car.passed=true;
          if(Math.abs(car.lane-player.lane)<0.33&&car.z<0.97){
            player.damage++;flash=0.55;speed=Math.max(110,speed*0.55);E.sfx(95,0.18,"sawtooth",0.05);
            E.burst([] ,project(car.lane,car.z).x,335,0,"#e25b4a");
          }else{score+=25;E.sfx(520,0.035,"triangle",0.015);}
        }
      });
      traffic=traffic.filter(function(car){return car.z<1.2;});
      if(score>=checkpoint+500){checkpoint=score;boost=1.1;speed=Math.min(390,speed+35);E.sfx(780,0.13,"square",0.03);}
      E.setScore(score+" m · "+Math.round(speed)+" km/sa · hasar "+player.damage+"/3");
      if(player.damage>=3&&!finished){finished=true;E.remember("kervangp",score);E.showEnd("YARIŞ BİTTİ · ERGİN GP","Mesafe: "+score+" m · En yüksek hız: "+Math.round(speed)+" · Yarış puanın kaydedildi.");}
    },function(){
      E.clear("#101721");const c=E.ctx;
      const grad=c.createLinearGradient(0,0,0,210);grad.addColorStop(0,"#131d31");grad.addColorStop(1,"#59606a");
      c.fillStyle=grad;c.fillRect(0,0,W,215);
      sky.forEach(function(s){c.fillStyle="rgba(241,220,177,.75)";c.fillRect(s.x,s.y,s.r,s.r);});
      c.fillStyle="#d5a96e";c.beginPath();c.arc(504,85,25,0,Math.PI*2);c.fill();
      for(let i=0;i<13;i++){
        let x=(i*57+Math.floor(elapsed*18))%760-60,h=30+(i%4)*17;
        c.fillStyle=i%3?"#222b37":"#34414a";c.fillRect(x,205-h,34,h);
        c.fillStyle="#e7bd70";for(let w=0;w<3;w++)c.fillRect(x+6+w*9,205-h+8,4,5);
      }
      c.fillStyle="#26352e";c.fillRect(0,205,W,195);
      const roadLeft=function(z){return 320-(90+z*205);},roadRight=function(z){return 320+(90+z*205);};
      c.fillStyle="#77746b";c.beginPath();c.moveTo(230,65);c.lineTo(410,65);c.lineTo(615,400);c.lineTo(25,400);c.closePath();c.fill();
      c.fillStyle="#292d32";c.beginPath();c.moveTo(239,65);c.lineTo(401,65);c.lineTo(594,400);c.lineTo(46,400);c.closePath();c.fill();
      c.strokeStyle="#e5c985";c.lineWidth=3;c.beginPath();c.moveTo(230,65);c.lineTo(25,400);c.moveTo(410,65);c.lineTo(615,400);c.stroke();
      const offset=(elapsed*speed*0.24)%56;
      for(let lane of [-0.333,0.333]){
        for(let i=0;i<9;i++){
          const z=((i/9)+((offset/56)/9))%1;
          const y=65+z*335,spread=90+z*205,x=320+lane*spread,w=1+z*3,h=5+z*18;
          c.fillStyle="rgba(235,222,183,"+(0.28+z*0.48)+")";c.fillRect(x-w/2,y,w,h);
        }
      }
      traffic.slice().sort(function(a,b){return a.z-b.z;}).forEach(function(car){
        const p=project(car.lane,car.z),w=16+p.scale*39,h=10+p.scale*61,x=p.x-w/2,y=p.y-h/2;
        c.fillStyle="rgba(0,0,0,.3)";c.fillRect(x-4,y+h-2,w+8,8*p.scale);
        c.fillStyle=car.color;c.beginPath();c.moveTo(x+w*.16,y+h*.35);c.lineTo(x+w*.27,y);c.lineTo(x+w*.75,y);c.lineTo(x+w*.9,y+h*.35);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.closePath();c.fill();
        c.fillStyle="#a9c6c8";c.fillRect(x+w*.28,y+h*.16,w*.44,h*.22);
        c.fillStyle="#f4c46c";c.fillRect(x+3,y+h*.75,Math.max(2,w*.14),Math.max(2,h*.09));c.fillRect(x+w-5,y+h*.75,Math.max(2,w*.14),Math.max(2,h*.09));
        c.fillStyle="#14171a";c.fillRect(x-2,y+h*.65,4,h*.22);c.fillRect(x+w-2,y+h*.65,4,h*.22);
      });
      const px=320+player.lane*245,py=326,pw=58,ph=67;
      c.fillStyle="rgba(0,0,0,.45)";c.beginPath();c.ellipse(px,py+ph-2,42,13,0,0,Math.PI*2);c.fill();
      c.fillStyle=boost>0?"#f0b54d":"#287e9a";c.beginPath();c.moveTo(px-pw/2,py+ph);c.lineTo(px-pw*.39,py+ph*.38);c.lineTo(px-pw*.24,py+7);c.lineTo(px+pw*.24,py+7);c.lineTo(px+pw*.39,py+ph*.38);c.lineTo(px+pw/2,py+ph);c.closePath();c.fill();
      c.fillStyle="#8bb8be";c.beginPath();c.moveTo(px-14,py+28);c.lineTo(px-10,py+13);c.lineTo(px+10,py+13);c.lineTo(px+14,py+28);c.closePath();c.fill();
      c.fillStyle="#111a21";c.fillRect(px-23,py+ph-12,12,10);c.fillRect(px+11,py+ph-12,12,10);
      c.fillStyle="#f3cf7d";c.fillRect(px-24,py+ph-4,8,4);c.fillRect(px+16,py+ph-4,8,4);
      if(flash>0){c.fillStyle="rgba(226,74,65,"+(flash*.45)+")";c.fillRect(0,0,W,H);}
      E.text("ERGİN GP · KERVAN STREET CIRCUIT",320,12,12,"#f2d397","center");
      E.text("↑ GAZ  ↓ FREN  ← → DİREKSİYON",320,381,10,"#c9d4c2","center");
      E.panel();
    });
  };
})();