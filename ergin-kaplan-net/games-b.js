/* Ergin Kaplan Net · 2003 oyun salonu
   Ergin Lab / özgün tarayıcı oyunları · © Ergin Kaplan */
(function () {
  "use strict";
  const E = globalThis.EKN;
  if (!E) return;
  const K = E.keys, P = E.pressed, M = E.pointer, W = E.W, H = E.H;
  const hit = function (code) {
    if (!P[code]) return false;
    delete P[code];
    return true;
  };
  const click = function () {
    if (!M.click) return false;
    M.click = false;
    return true;
  };
  const rightClick = function () { return !!M.right; };
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function finish(id, score, title, message) {
    E.remember(id, score);
    E.showEnd(title, message);
  }

  /* 10 · Nöbet Labirenti */
  E.starters.labirent = function () {
    const cols = 21, rows = 13, cell = 26, ox = 47, oy = 28;
    const maze = Array.from({length:rows}, function(){return Array(cols).fill(1);});
    const stack = [{x:1,y:1}], seen = new Set(["1,1"]);
    maze[1][1] = 0;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(function(){return Math.random()-0.5;});
      let moved = false;
      for (const d of dirs) {
        const nx=cur.x+d[0], ny=cur.y+d[1], key=nx+","+ny;
        if(nx>0&&nx<cols-1&&ny>0&&ny<rows-1&&!seen.has(key)){
          seen.add(key);maze[cur.y+d[1]/2][cur.x+d[0]/2]=0;maze[ny][nx]=0;stack.push({x:nx,y:ny});moved=true;break;
        }
      }
      if(!moved)stack.pop();
    }
    const player={x:1,y:1}, exit={x:19,y:11}, coins=[];
    while(coins.length<4){
      const x=E.irand(1,cols-2),y=E.irand(1,rows-2);
      if(maze[y][x]===0&&(x!==1||y!==1)&&!(x===exit.x&&y===exit.y)&&!coins.some(function(c){return c.x===x&&c.y===y;}))coins.push({x:x,y:y,got:false});
    }
    let score=0,moves=0,elapsed=0;
    E.loop(function(dt){
      elapsed+=dt;
      let dx=0,dy=0;
      if(hit("ArrowUp")||hit("KeyW"))dy=-1;
      else if(hit("ArrowDown")||hit("KeyS"))dy=1;
      else if(hit("ArrowLeft")||hit("KeyA"))dx=-1;
      else if(hit("ArrowRight")||hit("KeyD"))dx=1;
      if(dx||dy){const nx=player.x+dx,ny=player.y+dy;if(maze[ny]&&maze[ny][nx]===0){player.x=nx;player.y=ny;moves++;}}
      coins.forEach(function(c){if(!c.got&&c.x===player.x&&c.y===player.y){c.got=true;score+=50;E.sfx(620,0.07,"triangle",0.03);}});
      E.setScore(score+" fiş · "+coins.filter(function(c){return c.got;}).length+"/4");
      if(player.x===exit.x&&player.y===exit.y&&coins.every(function(c){return c.got;}))finish("labirent",score,"Çıkışı buldun",score+ " puan · "+moves+" adım · "+Math.round(elapsed)+" saniye");
    },function(){
      E.clear("#09140e");
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        E.rect(ox+x*cell,oy+y*cell,cell-1,cell-1,maze[y][x]?"#26382b":"#0e1e14");
        if(maze[y][x])E.rect(ox+x*cell+4,oy+y*cell+4,cell-9,cell-9,"#1b2a20");
      }
      coins.forEach(function(c){if(!c.got){E.rect(ox+c.x*cell+9,oy+c.y*cell+9,8,8,"#e8b44d");E.rect(ox+c.x*cell+12,oy+c.y*cell+5,3,16,"#fff0a3");}});
      E.rect(ox+exit.x*cell+4,oy+exit.y*cell+4,18,18,coins.every(function(c){return c.got;})?"#4ebc79":"#8c4d3e");
      E.rect(ox+player.x*cell+5,oy+player.y*cell+5,16,16,"#7ee0d2");E.rect(ox+player.x*cell+10,oy+player.y*cell+8,6,5,"#123b3a");
      E.text("NÖBET / 4 FİŞİ TOPLA, ÇIKIŞI BUL",320,6,11,"#a9c59e","center");E.panel();
    });
  };

  /* 11 · Mayın Tarlası */
  E.starters.mayin = function () {
    const cols=10,rows=8,cell=34,ox=150,oy=56,mines=12;
    let board=Array.from({length:rows},function(){return Array.from({length:cols},function(){return {mine:false,n:0,open:false,flag:false};});});
    let ready=false,over=false,score=0,opened=0,flags=0;
    function build(sx,sy){
      let placed=0;
      while(placed<mines){const x=E.irand(0,cols-1),y=E.irand(0,rows-1);if(board[y][x].mine||(x===sx&&y===sy))continue;board[y][x].mine=true;placed++;}
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!board[y][x].mine){
        let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x+dx;if(board[yy]&&board[yy][xx]&&board[yy][xx].mine)n++;}
        board[y][x].n=n;
      }
      ready=true;
    }
    function reveal(x,y){
      const c=board[y]&&board[y][x];if(!c||c.open||c.flag||over)return;
      if(!ready)build(x,y);
      if(c.mine){c.open=true;over=true;finish("mayin",opened*5,"Mayına bastın","Açılan kare: "+opened+" · İşaret: "+flags+" · Mayın sayısı: "+mines);return;}
      const queue=[[x,y]];
      while(queue.length){const p=queue.pop(),q=board[p[1]][p[0]];if(!q||q.open||q.flag||q.mine)continue;q.open=true;opened++;if(q.n===0){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=p[0]+dx,ny=p[1]+dy;if(board[ny]&&board[ny][nx]&&!board[ny][nx].open)queue.push([nx,ny]);}}}
      score=opened*5;E.sfx(360,0.04,"triangle",0.02);
      if(opened===cols*rows-mines){over=true;finish("mayin",score,"Alan temizlendi","Bütün güvenli kareleri buldun. "+score+" puan.");}
    }
    E.loop(function(){
      if(click()||rightClick()){
        const x=Math.floor((M.x-ox)/cell),y=Math.floor((M.y-oy)/cell);
        if(x>=0&&x<cols&&y>=0&&y<rows&&!over){
          if(M.right){M.right=false;if(!board[y][x].open){board[y][x].flag=!board[y][x].flag;flags+=board[y][x].flag?1:-1;}}
          else reveal(x,y);
        }
      }
      E.setScore(opened+" açık · "+flags+" bayrak · "+mines+" mayın");
    },function(){
      E.clear("#101820");E.text("MAYIN TARLASI  /  İLK AÇILIŞ GÜVENLİ",320,12,12,"#d7c18a","center");
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const c=board[y][x],px=ox+x*cell,py=oy+y*cell;
        E.rect(px,py,cell-2,cell-2,c.open?"#253b3c":"#65746a");
        if(c.open&&c.mine){E.ctx.fillStyle="#e25b4a";E.ctx.beginPath();E.ctx.arc(px+16,py+16,8,0,Math.PI*2);E.ctx.fill();}
        else if(c.open&&c.n)E.text(c.n,px+16,py+7,17,["","#6ec2dc","#78d19b","#e8b44d","#d78b8b","#a68ad5","#7dd4cf","#f2c36d","#ffffff"][c.n],"center");
        else if(c.flag)E.text("⚑",px+16,py+5,18,"#e8a838","center");
        else if(c.open)E.rect(px+4,py+4,cell-10,cell-10,"#2e4742");
      }
      if(over)E.text("MAYIN PATLADI",320,360,15,"#ff9c81","center");
      E.panel();
    });
  };

  /* 12 · Renk Patlat */
  E.starters.renk = function () {
    const size=8,cell=39,ox=164,oy=42,colors=["#e25b4a","#e8a838","#5a9db1","#7eaa65","#9c7dbb","#d7d1b8"];
    let board=Array.from({length:size},function(){return Array.from({length:size},function(){return E.irand(0,5);});});
    let selected=null,score=0,moves=0,flash=0;
    function matches(){
      const mark=new Set();
      for(let y=0;y<size;y++){let x=0;while(x<size){let end=x+1;while(end<size&&board[y][end]===board[y][x])end++;if(end-x>=3)for(let i=x;i<end;i++)mark.add(y+","+i);x=end;}}
      for(let x=0;x<size;x++){let y=0;while(y<size){let end=y+1;while(end<size&&board[end][x]===board[y][x])end++;if(end-y>=3)for(let i=y;i<end;i++)mark.add(i+","+x);y=end;}}
      return Array.from(mark).map(function(k){return k.split(",").map(Number);});
    }
    function settle(){
      let found=matches(),guard=0;
      while(found.length&&guard++<12){
        score+=found.length*10;found.forEach(function(p){board[p[0]][p[1]]=-1;});
        for(let x=0;x<size;x++){let col=[];for(let y=size-1;y>=0;y--)if(board[y][x]>=0)col.push(board[y][x]);while(col.length<size)col.push(E.irand(0,5));for(let y=size-1;y>=0;y--)board[y][x]=col[size-1-y];}
        found=matches();
      }
    }
    E.loop(function(dt){
      flash=Math.max(0,flash-dt);
      if(click()){
        const x=Math.floor((M.x-ox)/cell),y=Math.floor((M.y-oy)/cell);
        if(x>=0&&x<size&&y>=0&&y<size){
          if(!selected)selected={x:x,y:y};
          else if(selected.x===x&&selected.y===y)selected=null;
          else if(Math.abs(selected.x-x)+Math.abs(selected.y-y)===1){
            const a=board[selected.y][selected.x];board[selected.y][selected.x]=board[y][x];board[y][x]=a;
            if(matches().length){moves++;settle();flash=0.2;E.sfx(520,0.06,"triangle",0.025);}
            else{const b=board[selected.y][selected.x];board[selected.y][selected.x]=board[y][x];board[y][x]=b;}
            selected=null;
          }else selected={x:x,y:y};
        }else selected=null;
      }
      E.setScore(score+" puan · "+moves+" hamle");
    },function(){
      E.clear("#11151d");E.text("RENK PATLAT  /  ÜÇLÜLERİ YAN YANA GETİR",320,8,12,"#d8c69a","center");
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const px=ox+x*cell,py=oy+y*cell,v=board[y][x];
        E.rect(px,py,cell-3,cell-3,"#202b32");
        E.rect(px+5,py+5,cell-13,cell-13,colors[v]);
        E.rect(px+10,py+9,7,5,"rgba(255,255,255,.34)");
        if(selected&&selected.x===x&&selected.y===y){E.ctx.strokeStyle="#ffffff";E.ctx.lineWidth=3;E.ctx.strokeRect(px+2,py+2,cell-7,cell-7);}
      }
      E.text("Takas için komşu iki taşı seç",320,365,11,"#91a69a","center");E.panel();
    });
  };

  /* 13 · Hafıza Kartları */
  E.starters.hafiza = function () {
    const symbols=["A","B","C","D","E","F","G","H"];
    const deck=symbols.concat(symbols).sort(function(){return Math.random()-0.5;});
    let cards=deck.map(function(v){return {v:v,open:false,done:false};});
    let first=-1,second=-1,wait=0,moves=0,pairs=0,score=0;
    E.loop(function(dt){
      wait=Math.max(0,wait-dt);
      if(wait===0&&second>=0){cards[first].open=false;cards[second].open=false;first=-1;second=-1;}
      if(click()&&wait===0){
        const x=Math.floor((M.x-122)/99),y=Math.floor((M.y-75)/103),idx=y*4+x;
        if(x>=0&&x<4&&y>=0&&y<4){
          const c=cards[idx];
          if(!c.done&&!c.open){
            c.open=true;
            if(first<0)first=idx;
            else{second=idx;moves++;if(cards[first].v===cards[second].v){cards[first].done=true;cards[second].done=true;pairs++;score+=100;first=-1;second=-1;E.sfx(600,0.08,"sine",0.03);}
              else wait=0.8;}
          }
        }
      }
      E.setScore(pairs+" / 8 çift · "+moves+" hamle");
      if(pairs===8)finish("hafiza",score,"Hepsi eşleşti","Sekiz çift "+moves+" hamlede bulundu. Puan: "+score);
    },function(){
      E.clear("#15131b");E.text("HAFIZA / MASANIN ÜSTÜNDEKİ KARTLAR",320,15,12,"#d4bf8d","center");
      cards.forEach(function(c,i){const x=122+(i%4)*99,y=75+Math.floor(i/4)*103;E.rect(x,y,82,87,c.done?"#31493b":"#3b3030");E.rect(x+4,y+4,74,79,c.done?"#192c24":c.open?"#292d34":"#1d222c");if(c.open||c.done){E.text(c.v,x+41,y+26,28,c.done?"#8de0a4":"#e8c889","center");E.rect(x+25,y+65,32,2,"#8c8062");}else{E.rect(x+18,y+20,46,46,"#563b32");E.text("EK",x+41,y+31,17,"#e8a838","center");}});
      E.text("ÇİFTLERİ BUL / SABIR KAZANDIRIR",320,390,11,"#91a69a","center");E.panel();
    });
  };

  /* 14 · Lira Yığ */
  E.starters.lira = function () {
    let board=Array.from({length:4},function(){return [0,0,0,0];}),score=0,turns=0,dead=false;
    function spawn(){const free=[];for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(!board[y][x])free.push([x,y]);if(free.length){const p=free[E.irand(0,free.length-1)];board[p[1]][p[0]]=Math.random()<0.88?2:4;}}
    function moveLine(line){
      const a=line.filter(Boolean);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;score+=a[i];a.splice(i+1,1);}
      while(a.length<4)a.push(0);return a;
    }
    function move(dir){
      const before=JSON.stringify(board);
      for(let i=0;i<4;i++){
        let line=[];
        for(let j=0;j<4;j++){let x=dir==="left"?j:dir==="right"?3-j:i;let y=dir==="up"?j:dir==="down"?3-j:i;line.push(board[y][x]);}
        const merged=moveLine(line);
        for(let j=0;j<4;j++){let x=dir==="left"?j:dir==="right"?3-j:i;let y=dir==="up"?j:dir==="down"?3-j:i;board[y][x]=merged[j];}
      }
      if(JSON.stringify(board)!==before){turns++;spawn();E.sfx(260,0.035,"square",0.02);}
    }
    function canMove(){for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(!board[y][x]||(x<3&&board[y][x]===board[y][x+1])||(y<3&&board[y][x]===board[y+1][x]))return true;return false;}
    spawn();spawn();
    E.loop(function(){
      if(hit("ArrowLeft")||hit("KeyA"))move("left");
      else if(hit("ArrowRight")||hit("KeyD"))move("right");
      else if(hit("ArrowUp")||hit("KeyW"))move("up");
      else if(hit("ArrowDown")||hit("KeyS"))move("down");
      E.setScore(score.toLocaleString("tr-TR")+" TL · "+turns+" hamle");
      if(!canMove())finish("lira",score,"Kasa doldu","Toplam birikim: "+score+" eski lira.");
    },function(){
      E.clear("#15120f");E.text("LİRA YIĞ  /  AYNI DEĞERLERİ BİRLEŞTİR",320,12,12,"#e5c78e","center");
      for(let y=0;y<4;y++)for(let x=0;x<4;x++){
        const v=board[y][x],px=158+x*82,py=54+y*82;E.rect(px,py,74,74,"#2a2723");
        if(v){const power=Math.min(5,Math.log2(v)/2);const cols=["#b58d55","#c9a36b","#d9b77c","#e5c98b","#e5a35f","#e27453"];E.rect(px+4,py+4,66,66,cols[power|0]);E.text(v.toLocaleString("tr-TR"),px+37,py+27,v>1000?15:19,"#2d2117","center");}
      }
      E.text("2 → 4 → 8 → 16 → ...",320,395,11,"#b8a27c","center");E.panel();
    });
  };
})();

/* 15–18 · Dört Sıra, Üç Taş, Dart Ustası ve Penaltı Nöbeti */
(function () {
  "use strict";
  const E=globalThis.EKN;
  if(!E)return;
  const K=E.keys,P=E.pressed,M=E.pointer,W=E.W,H=E.H;
  const hit=function(code){if(!P[code])return false;delete P[code];return true;};
  const click=function(){if(!M.click)return false;M.click=false;return true;};
  function finish(id,score,title,message){E.remember(id,score);E.showEnd(title,message);}

  /* 15 · Dört Sıra */
  E.starters.dort=function(){
    let board=Array.from({length:6},function(){return Array(7).fill(0);});
    let turn=1,score=0,wait=0,ended=false,moves=0;
    function drop(col,who){
      if(col<0||col>6)return false;
      for(let y=5;y>=0;y--)if(!board[y][col]){board[y][col]=who;return true;}
      return false;
    }
    function win(who){
      const dirs=[[1,0],[0,1],[1,1],[1,-1]];
      for(let y=0;y<6;y++)for(let x=0;x<7;x++)if(board[y][x]===who){
        for(const d of dirs){let n=1;for(let k=1;k<4;k++){let xx=x+d[0]*k,yy=y+d[1]*k;if(board[yy]&&board[yy][xx]===who)n++;else break;}if(n===4)return true;}
      }
      return false;
    }
    function pickCpu(){
      for(let c=0;c<7;c++){const cp=board.map(function(r){return r.slice();});for(let y=5;y>=0;y--)if(!cp[y][c]){cp[y][c]=2;break;}const old=board;board=cp;const ok=win(2);board=old;if(ok)return c;}
      for(let c=0;c<7;c++){const cp=board.map(function(r){return r.slice();});for(let y=5;y>=0;y--)if(!cp[y][c]){cp[y][c]=1;break;}const old=board;board=cp;const ok=win(1);board=old;if(ok)return c;}
      return [3,2,4,1,5,0,6].find(function(c){return !board[0][c];});
    }
    E.loop(function(dt){
      wait=Math.max(0,wait-dt);
      if(turn===1&&click()&&!ended){
        const col=Math.floor((M.x-145)/50);
        if(drop(col,1)){moves++;if(win(1)){ended=true;score=1000-moves*5;finish("dort",score,"Dört Sıra","Dört taşı yan yana getirdin. Hamle: "+moves);}else if(board[0].every(Boolean)){ended=true;finish("dort",0,"Berabere","Tahta doldu.");}else{turn=2;wait=0.45;}}
      }
      if(turn===2&&wait===0&&!ended){
        const col=pickCpu();if(col!=null)drop(col,2);moves++;
        if(win(2)){ended=true;finish("dort",0,"Rıza kazandı","Bir sonraki oyunda orta sütunu kontrol et.");}
        else if(board[0].every(Boolean)){ended=true;finish("dort",0,"Berabere","Tahta doldu.");}
        else turn=1;
      }
      E.setScore("SEN "+board.flat().filter(function(v){return v===1;}).length+"  ·  RIZA "+board.flat().filter(function(v){return v===2;}).length);
    },function(){
      E.clear("#101927");E.text("DÖRT SIRA / KIRMIZI SENİN",320,10,13,"#e8c88d","center");
      E.rect(145,42,350,310,"#23618a");
      for(let y=0;y<6;y++)for(let x=0;x<7;x++){
        const px=170+x*50,py=67+y*47;E.ctx.fillStyle=board[y][x]===1?"#e8a838":board[y][x]===2?"#e25b4a":"#101c2a";
        E.ctx.beginPath();E.ctx.arc(px,py,17,0,Math.PI*2);E.ctx.fill();
        E.ctx.strokeStyle="#5e8fb2";E.ctx.lineWidth=1;E.ctx.stroke();
      }
      E.text(turn===1?"SÜTUN SEÇ":"RAKİP DÜŞÜNÜYOR",320,370,12,"#a7c5d6","center");E.panel();
    });
  };

  /* 16 · Üç Taş */
  E.starters.uctas=function(){
    let board=Array(9).fill(0),turn=1,wait=0,done=false,moves=0;
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function winner(who){return lines.some(function(line){return line.every(function(i){return board[i]===who;});});}
    function choose(){
      for(let i=0;i<9;i++)if(!board[i]){board[i]=2;const w=winner(2);board[i]=0;if(w)return i;}
      for(let i=0;i<9;i++)if(!board[i]){board[i]=1;const w=winner(1);board[i]=0;if(w)return i;}
      if(!board[4])return 4;
      const corners=[0,2,6,8].filter(function(i){return !board[i];});
      if(corners.length)return corners[E.irand(0,corners.length-1)];
      return board.findIndex(function(v){return !v;});
    }
    E.loop(function(dt){
      wait=Math.max(0,wait-dt);
      if(turn===1&&click()&&!done){
        const x=Math.floor((M.x-190)/87),y=Math.floor((M.y-65)/87),i=y*3+x;
        if(x>=0&&x<3&&y>=0&&y<3&&!board[i]){board[i]=1;moves++;if(winner(1)){done=true;finish("uctas",1000-moves*30,"Üç Taş","Üç çizgiyi tamamladın.");}else if(board.every(Boolean)){done=true;finish("uctas",300,"Berabere","İki taraf da iyi oynadı.");}else{turn=2;wait=0.35;}}
      }
      if(turn===2&&wait===0&&!done){const i=choose();if(i>=0)board[i]=2;moves++;if(winner(2)){done=true;finish("uctas",0,"Rıza kazandı","Rövanş için yeniden başlat.");}else if(board.every(Boolean)){done=true;finish("uctas",300,"Berabere","İyi mücadele.");}else turn=1;}
      E.setScore("HAMLE "+moves+" · "+(turn===1?"SIRA SENDE":"RAKİP"));
    },function(){
      E.clear("#17131a");E.text("ÜÇ TAŞ  /  X SEN · O RIZA",320,14,13,"#dfc58f","center");
      for(let i=0;i<9;i++){const x=190+(i%3)*87,y=65+Math.floor(i/3)*87;E.rect(x,y,78,78,"#2d3034");E.rect(x+3,y+3,72,72,"#171f26");if(board[i])E.text(board[i]===1?"X":"O",x+39,y+18,38,board[i]===1?"#e8a838":"#7ec6c5","center");}
      E.text(turn===1?"KUTU SEÇ":"RAKİP DÜŞÜNÜYOR",320,345,12,"#93a99c","center");E.panel();
    });
  };

  /* 17 · Dart Ustası */
  E.starters.dart=function(){
    let throws=[],score=0,shots=0,last=0;
    function scoreAt(x,y){
      const r=Math.hypot(x-320,y-205);
      if(r<9)return 50;if(r<22)return 25;if(r<43)return 15;if(r<68)return 10;if(r<98)return 5;return 0;
    }
    E.loop(function(){
      if((click()||hit("Space"))&&shots<5){
        const x=M.x,y=M.y,points=scoreAt(x,y);
        throws.push({x:x,y:y,points:points});score+=points;shots++;last=points;E.sfx(points?580:160,0.07,points?"triangle":"square",0.03);
        if(shots===5)finish("dart",score,"Atış tamamlandı","Beş atışta "+score+" puan. Son atış: "+last);
      }
      E.setScore(score+" puan · "+shots+"/5 atış");
    },function(){
      E.clear("#101719");E.text("DART USTASI  /  BEŞ ATIŞ HAKKIN VAR",320,14,12,"#d7c28c","center");
      E.ctx.fillStyle="#263f3e";E.ctx.beginPath();E.ctx.arc(320,205,112,0,Math.PI*2);E.ctx.fill();
      [[98,"#b34d42"],[68,"#e8a838"],[43,"#b34d42"],[22,"#e8a838"],[9,"#f5e2a9"]].forEach(function(r){E.ctx.beginPath();E.ctx.arc(320,205,r[0],0,Math.PI*2);E.ctx.fillStyle=r[1];E.ctx.fill();});
      E.ctx.strokeStyle="#e7d9bd";E.ctx.lineWidth=1;E.ctx.beginPath();E.ctx.moveTo(205,205);E.ctx.lineTo(435,205);E.ctx.moveTo(320,90);E.ctx.lineTo(320,320);E.ctx.stroke();
      throws.forEach(function(t,i){E.ctx.fillStyle="#101010";E.ctx.beginPath();E.ctx.arc(t.x,t.y,4,0,Math.PI*2);E.ctx.fill();E.text(String(i+1),t.x+7,t.y-10,10,"#fff0b6");});
      E.text("MERKEZ 50  /  İÇ HALKA 25  /  DIŞ HALKA 5",320,350,10,"#9aab9e","center");E.panel();
    });
  };

  /* 18 · Penaltı Nöbeti */
  E.starters.penalti=function(){
    let goals=0,saves=0,kick=0,shots=0,phase=0,shotTimer=0,ball=null,keeper=320,keeperAim=320,result="";
    function take(x,y){
      if(shots>=5||phase>0)return;
      const tx=Math.max(170,Math.min(470,x)),ty=Math.max(96,Math.min(235,y));
      keeperAim=E.rand(205,435);keeper=320;ball={x:320,y:330,tx:tx,ty:ty};
      const blocked=Math.hypot(tx-keeperAim,ty-160)<48;
      result=blocked?"KALECİ ÇIKARDI":"GOOOL!";
      if(blocked)saves++;else goals++;
      kick++;shots++;phase=0.65;
      E.sfx(blocked?190:680,0.12,blocked?"sawtooth":"triangle",0.04);
    }
    E.loop(function(dt){
      if(phase>0){phase-=dt;const f=1-Math.max(0,phase)/0.65;keeper=320+(keeperAim-320)*Math.min(1,f*2);if(ball){ball.x=320+(ball.tx-320)*f;ball.y=330+(ball.ty-330)*f;}}
      else if(M.click){const x=M.x,y=M.y;M.click=false;take(x,y);}else if(hit("Space"))take(M.x||320,M.y||155);
      E.setScore("GOL "+goals+" · KURTARIŞ "+saves+" · "+shots+"/5");
      if(shots===5&&phase<=0)finish("penalti",goals*200+saves*20,"Penaltı tamamlandı",goals+" gol · "+saves+" kurtarış · 5 vuruş");
    },function(){
      E.clear("#10251b");E.rect(0,0,W,H,"#17452b");for(let y=0;y<H;y+=38)E.rect(0,y,W,1,"rgba(255,255,255,.08)");
      E.rect(145,65,350,190,"#e8dfc2");E.rect(154,74,332,172,"#4c9b62");E.rect(164,84,312,152,"#327b4b");
      for(let i=1;i<8;i++)E.rect(164+i*39,84,1,152,"rgba(255,255,255,.16)");
      E.rect(230,98,180,92,"none");E.ctx.strokeStyle="#e8e2c9";E.ctx.lineWidth=3;E.ctx.strokeRect(230,98,180,92);
      E.rect(keeper-23,145,46,17,"#e8a838");E.rect(keeper-19,127,38,20,"#b98562");E.rect(keeper-28,159,15,25,"#f0e7d5");E.rect(keeper+13,159,15,25,"#f0e7d5");
      if(ball){E.ctx.fillStyle="#fff2d2";E.ctx.beginPath();E.ctx.arc(ball.x,ball.y,7,0,Math.PI*2);E.ctx.fill();}
      else{E.ctx.fillStyle="#fff2d2";E.ctx.beginPath();E.ctx.arc(320,330,7,0,Math.PI*2);E.ctx.fill();}
      E.text("PENALTI NÖBETİ  /  HEDEFİ SEÇ",320,15,13,"#d7dfae","center");
      if(result&&phase>0)E.text(result,320,280,18,result==="GOOOL!"?"#f2d47d":"#ff9d84","center");
      if(phase<=0)E.text(shots<5?"KALEDE BOŞLUK BUL VE TIKLA":"SONUÇ HAZIR",320,380,11,"#c7d8ae","center");
      E.panel();
    });
  };
})();