/* Gestão Rural · página inicial: voo entre os grãos, prévia das páginas e cotação */

(function(){
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rnd(a){ var x=Math.sin(a*9301+49297)*233280; return x-Math.floor(x); }

  /* ---------- pé de café com torrão (desenhado uma vez em canvas, com luz e sombra) ---------- */
  var semente = 20251028;
  function R(){ semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }
  function hsl(h,s,l,a){ return 'hsla('+h+','+s+'%,'+Math.max(0,Math.min(100,l))+'%,'+(a==null?1:a)+')'; }

  var BEAN = new Path2D('M2 -62C33 -61 49 -32 47 3C45 38 27 63 -2 62C-31 61 -48 33 -46 -2C-44 -35 -26 -63 2 -62Z');
  var CREASE = new Path2D('M0 -58C-22 -32 20 -10 -2 16C-16 36 10 48 3 60');
  function graoCanvas(c, x, y, escala, ang, tom){
    c.save(); c.translate(x,y); c.rotate(ang); c.scale(escala,escala);
    c.save(); c.translate(9,10); c.fillStyle='rgba(0,0,0,.35)'; c.fill(BEAN); c.restore();
    var g=c.createRadialGradient(-16,-22,4,0,0,70);
    g.addColorStop(0,tom[0]); g.addColorStop(.4,tom[1]); g.addColorStop(1,tom[2]);
    c.fillStyle=g; c.fill(BEAN);
    c.lineCap='round';
    c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=13; c.stroke(CREASE);
    c.strokeStyle='#0a0402'; c.lineWidth=5; c.stroke(CREASE);
    c.save(); c.translate(4,0); c.strokeStyle='rgba(200,140,95,.5)'; c.lineWidth=1.6; c.stroke(CREASE); c.restore();
    var h=c.createRadialGradient(-22,-32,0,-22,-32,22); h.addColorStop(0,'rgba(255,255,255,.5)'); h.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=h; c.beginPath(); c.ellipse(-22,-32,12,21,.5,0,6.29); c.fill();
    c.restore();
  }
  var TOM_TORRADO=['#a06c48','#5e3823','#1c0c05'];

  /* ---------- voo entre os grãos: grãos reais num espaço 3D, a câmera avança com a rolagem ---------- */
  var cvV=document.getElementById('voo'), cv=cvV.getContext('2d'), VW=1, VH=1, dprV=1;
  var reais=["assets/grao-1.webp","assets/grao-2.webp","assets/grao-3.webp"].map(function(u){ var im=new Image(); im.src=u; return im; });
  var spr=document.createElement('canvas'); spr.width=120; spr.height=150;
  (function(){ var s=spr.getContext('2d'); s.translate(60,72); graoCanvas(s,0,0,.95,0,['#a8744e','#64402a','#1e0e06']); })();
  var NIVEIS=[0,1.5,4,9], sprites=[];
  function prepararSprites(){
    var fontes=reais.filter(function(im){ return im.complete && im.naturalWidth; }); fontes.push(spr);
    sprites=fontes.map(function(im){
      var w=im.naturalWidth||im.width, h=im.naturalHeight||im.height, esc=96/Math.max(w,h);
      return NIVEIS.map(function(b){
        var m=Math.ceil(b*2.5)+2, c=document.createElement('canvas'); c.width=Math.round(w*esc)+m*2; c.height=Math.round(h*esc)+m*2;
        var x=c.getContext('2d'); x.filter=(b?'blur('+b+'px) ':'')+'saturate(.85) brightness(.92)'; x.drawImage(im,m,m,w*esc,h*esc); return c;
      });
    });
  }
  prepararSprites();
  Promise.all(reais.map(function(im){ return im.decode?im.decode().catch(function(){}):null; })).then(prepararSprites);

  var PROF=15, graosV=[];
  semente=9091;
  for(var iv=0;iv<300;iv++){
    graosV.push({x:(R()*2-1)*2.6, y:(R()*2-1)*1.6, z:.6+R()*PROF, k:Math.floor(R()*16), rot:R()*6.28, vr:(R()-.5)*.9,
      fl:R()*6.28, vf:.6+R()*1.6, tam:.8+R()*.5, ox:0, oy:0, vx:0, vy:0});
  }
  function medirVoo(){ dprV=Math.min(2,window.devicePixelRatio||1); VW=cvV.offsetWidth; VH=cvV.offsetHeight; cvV.width=VW*dprV; cvV.height=VH*dprV; }
  medirVoo(); addEventListener('resize',medirVoo);

  // cz: posição da câmera; abre: grãos se afastam do centro e abrem caminho para o painel
  function desenharVoo(t, cz, abre, camX, camY, mouseX, mouseY, ativo){
    cv.setTransform(dprV,0,0,dprV,0,0); cv.clearRect(0,0,VW,VH);
    if(!sprites.length) return;
    var f=Math.min(VW,VH)*1.05, cx=VW/2, cy=VH/2, lista=[];
    for(var i=0;i<graosV.length;i++){
      var g=graosV[i], d=g.z-cz; d=((d%PROF)+PROF)%PROF; if(d<.25) continue;
      var esp=1+abre*abre*7/Math.max(.6,d*.35);
      var sx=cx+(g.x*esp-camX/d*.9)*f/d, sy=cy+(g.y*esp-camY/d*.9)*f/d;
      lista.push([d,g,sx,sy]);
    }
    lista.sort(function(a,b){ return b[0]-a[0]; });
    for(var j=0;j<lista.length;j++){
      var d=lista[j][0], g=lista[j][1], sx=lista[j][2], sy=lista[j][3];
      var s=.2*g.tam*f/d; if(s<3) continue;
      // grãos perto do mouse se afastam e voltam devagar
      var ex=sx+g.ox-mouseX, ey=sy+g.oy-mouseY, dist=Math.sqrt(ex*ex+ey*ey), raio=90+s*.8;
      if(ativo && dist<raio && dist>.1){ var fz=(1-dist/raio)*(1.2+s/60); g.vx+=ex/dist*fz; g.vy+=ey/dist*fz; g.vr+=(ex>0?1:-1)*fz*.01; }
      g.vx+=-g.ox*.04; g.vy+=-g.oy*.04; g.vx*=.86; g.vy*=.86; g.ox+=g.vx; g.oy+=g.vy; g.vr*=.995;
      var foco=Math.abs(d-4.5), nivel=d<1.3?3:d<2.4?2:foco<2.2?0:d<10?1:2;
      var alfa=Math.min(1,(PROF-d)/4)*Math.min(1,(d-.25)/.6)*(d>10?.8:1);
      var cor=sprites[g.k%sprites.length][nivel], virada=Math.cos(t*g.vf+g.fl);
      cv.globalAlpha=Math.max(0,alfa);
      cv.setTransform(dprV,0,0,dprV,0,0); cv.translate(sx+g.ox,sy+g.oy); cv.rotate(g.rot+t*g.vr*.6); cv.scale(.35+.65*Math.abs(virada),1);
      var w=s*cor.width/96, h=s*cor.height/96; cv.drawImage(cor,-w/2,-h/2,w,h);
    }
    cv.globalAlpha=1;
  }

  /* ---------- mouse ---------- */
  var hero=document.querySelector('.hero'), foto=document.getElementById('foto'), titulo=document.getElementById('titulo');
  var cena=document.getElementById('cena'), fixo=document.getElementById('fixo'), veu=document.getElementById('veu'), sis=document.getElementById('sistema'), app=sis.querySelector('.app');
  var brilho=document.getElementById('brilho'), frase=document.getElementById('frase');
  var cardsHero=[].slice.call(hero.querySelectorAll('.vidro,.rodape-hero'));
  var estatico=false;
  function decidirModo(){ estatico = reduz || innerWidth<760 || innerHeight<560; document.documentElement.classList.toggle('estatico',estatico); }
  decidirModo(); addEventListener('resize',decidirModo);
  var pAlvo=0, pSuave=0;
  function lerScroll(){ if(estatico){ pAlvo=0; return; } var r=cena.getBoundingClientRect(), faixa=cena.offsetHeight-innerHeight; pAlvo=Math.max(0,Math.min(1,-r.top/Math.max(1,faixa))); }
  addEventListener('scroll',lerScroll,{passive:true}); lerScroll();
  document.querySelectorAll('a[href="#sistema"]').forEach(function(a){ a.addEventListener('click',function(e){ if(estatico) return; e.preventDefault(); var faixa=cena.offsetHeight-innerHeight; scrollTo({top:cena.offsetTop+faixa*.82,behavior:'smooth'}); }); });
  function faixa(v,a,b){ return Math.max(0,Math.min(1,(v-a)/(b-a))); }
  function suave(x){ return x*x*(3-2*x); }
  var mx=0,my=0, tx=0,ty=0, px=-9999,py=-9999, W=1,H=1, dentro=false;
  function medir(){ var r=hero.getBoundingClientRect(); W=r.width; H=r.height; }
  medir(); addEventListener('resize',medir);
  fixo.addEventListener('pointermove',function(e){ var r=hero.getBoundingClientRect(); px=e.clientX-r.left; py=e.clientY-r.top; tx=px/W-.5; ty=py/H-.5; dentro=pSuave<.5; });
  fixo.addEventListener('pointerleave',function(){ dentro=false; tx=0; ty=0; px=py=-9999; });

  /* ---------- barras de exemplo ---------- */
  var bx=document.getElementById('barras'), dados=[[52,38],[64,41],[80,46],[58,50],[90,44],[72,40]], maior=90, b='';
  dados.forEach(function(d){ b+='<div class="mes"><span class="val">R$ 0 mil</span><div class="trio"><i data-h="'+(d[0]/maior*100)+'" style="background:linear-gradient(#c8a45c,#8a6a24)"></i><i data-h="'+(d[1]/maior*100)+'" style="background:#a39080"></i><i data-h="'+(Math.max(3,(d[0]-d[1])/maior*100))+'" style="background:#5a7a4a"></i></div></div>'; });
  bx.innerHTML=b;
  var subiu=false;
  function subirBarras(){
    if(subiu) return; subiu=true;
    bx.querySelectorAll('.mes').forEach(function(mes,i){
      setTimeout(function(){
        mes.querySelectorAll('i').forEach(function(h,k){ h.style.transition='height .9s cubic-bezier(.16,1,.3,1) '+(k*70)+'ms'; h.style.height=h.dataset.h+'%'; });
        var alvo=dados[i][0]-dados[i][1], val=mes.querySelector('.val'), ini=null;
        (function conta(tt){ if(!ini) ini=tt; var p=Math.min(1,(tt-ini)/900); val.textContent='R$ '+Math.round(alvo*(1-Math.pow(1-p,3)))+' mil'; if(p<1) requestAnimationFrame(conta); })(performance.now());
      }, reduz?0:i*110);
    });
  }
  if('IntersectionObserver' in window){ var ob=new IntersectionObserver(function(e){ if(e[0].isIntersecting && (estatico||pSuave>.7)){ subirBarras(); } },{threshold:.3}); ob.observe(bx); }

  document.addEventListener('pointermove',function(ev){ var el=ev.target.closest&&ev.target.closest('.btn'); if(!el) return; var r=el.getBoundingClientRect(); el.style.setProperty('--lx',(ev.clientX-r.left)+'px'); el.style.setProperty('--ly',(ev.clientY-r.top)+'px'); },{passive:true});
  var t0=performance.now();
  function quadro(agora){
    var t=(agora-t0)/1000;
    mx+=(tx-mx)*.06; my+=(ty-my)*.06;
    pSuave+=(pAlvo-pSuave)*.12;
    var voo=faixa(pSuave,0,.5), z=suave(voo), abre=suave(faixa(pSuave,.44,.62)), rev=suave(faixa(pSuave,.54,.84));
    if(!subiu && rev>.85) subirBarras();
    var cz=(reduz?0:t*.35)+Math.pow(voo,1.6)*34;
    foto.style.transform='scale('+(1.06+z*.5).toFixed(3)+') translate3d('+(-mx*18).toFixed(1)+'px,'+(-my*10).toFixed(1)+'px,0)';
    foto.style.filter='brightness('+(1-z*.35).toFixed(3)+')';
    brilho.style.opacity=(.45+z*.55*(1-abre)).toFixed(3);
    // a câmera atravessa o título
    titulo.style.transform='translate3d('+(-mx*10)+'px,'+(-my*6)+'px,0) scale('+(1+Math.pow(faixa(pSuave,0,.2),2)*5).toFixed(3)+')';
    titulo.style.opacity=(1-faixa(pSuave,.04,.14)).toFixed(3);
    // a frase vem do fundo, passa pela câmera e some
    var fr=faixa(pSuave,.16,.46);
    frase.style.opacity=(fr<=0||fr>=1?0:Math.min(1,fr*4)*(1-faixa(fr,.7,1))).toFixed(3);
    frase.style.transform='translate3d('+(-mx*16).toFixed(1)+'px,'+(-my*10).toFixed(1)+'px,0) translateY(-50%) scale('+(.2+Math.pow(fr,2.2)*4.5).toFixed(3)+')';
    cardsHero.forEach(function(el){ el.style.opacity=(1-faixa(pSuave,0,.12)).toFixed(3); el.style.pointerEvents=pSuave>.08?'none':''; });
    desenharVoo(t, cz, abre, mx*1.4, my*1, dentro?px:-9999, dentro?py:-9999, dentro);
    cvV.style.opacity=(1-rev*.85).toFixed(3);
    if(!estatico){
      veu.style.opacity=(rev*.9).toFixed(3);
      sis.style.opacity=rev.toFixed(3); sis.style.pointerEvents=rev>.6?'auto':'none';
      app.style.transform='translate3d('+(mx*-14).toFixed(1)+'px,'+((1-rev)*90).toFixed(1)+'px,0) scale('+(.84+rev*.16).toFixed(3)+') rotateX('+(-my*7).toFixed(2)+'deg) rotateY('+(mx*10).toFixed(2)+'deg)';
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* ---------- prévia de cada página do sistema ---------- */
  var abas=[].slice.call(document.querySelectorAll('.app aside .m')), telas=[].slice.call(document.querySelectorAll('.pv'));
  var pontos=document.getElementById('pontos'), atual=0, mexeu=false, tAuto=0;
  pontos.innerHTML=abas.map(function(){ return '<i></i>'; }).join('');
  var bolinhas=[].slice.call(pontos.children);
  function mostrar(i, foco){
    atual=(i+abas.length)%abas.length;
    abas.forEach(function(a,k){ var sel=k===atual; a.setAttribute('aria-selected',sel?'true':'false'); a.tabIndex=sel?0:-1; });
    telas.forEach(function(p){ p.classList.toggle('at', p.id==='pv-'+abas[atual].dataset.pv); });
    bolinhas.forEach(function(b,k){ b.classList.toggle('at',k===atual); });
    if(foco) abas[atual].focus();
    if(abas[atual].dataset.pv==='financeiro'){ subiu=false; bx.querySelectorAll('.trio i').forEach(function(h){ h.style.transition='none'; h.style.height='0'; }); requestAnimationFrame(function(){ requestAnimationFrame(subirBarras); }); }
    if(window.innerWidth<900) abas[atual].scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
  }
  abas.forEach(function(a,k){
    a.addEventListener('click',function(){ mexeu=true; mostrar(k); });
    a.addEventListener('keydown',function(e){
      var dir={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];
      if(dir){ e.preventDefault(); mexeu=true; mostrar(atual+dir,true); }
      if(e.key==='Home'){ e.preventDefault(); mexeu=true; mostrar(0,true); }
      if(e.key==='End'){ e.preventDefault(); mexeu=true; mostrar(abas.length-1,true); }
    });
  });
  app.addEventListener('pointerenter',function(){ tAuto=performance.now()+6000; });
  mostrar(0);
  // troca sozinha a cada 4 s enquanto o painel está na tela e ninguém clicou
  setInterval(function(){
    if(mexeu || reduz || document.hidden || performance.now()<tAuto) return;
    var r=app.getBoundingClientRect(), visivel=r.top<innerHeight*.8 && r.bottom>innerHeight*.2 && (estatico || pSuave>.8);
    if(visivel) mostrar(atual+1);
  },4000);

  /* ---------- cotação real da saca (mesma fonte do sistema) ---------- */
  function moeda(v){ return Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  fetch('/api/cotacao-cafe').then(function(r){ return r.ok?r.json():Promise.reject(); }).then(function(c){
    if(!c || !isFinite(c.brlPerSaca)) return Promise.reject();
    var partes=moeda(c.brlPerSaca).split(',');
    document.querySelectorAll('[data-cot]').forEach(function(el){ el.innerHTML='R$ '+partes[0]+'<small>,'+partes[1]+'</small>'; });
    document.querySelectorAll('[data-cot-txt]').forEach(function(el){ el.textContent='R$ '+partes.join(','); });
    var rot=document.getElementById('cotRot'); if(rot) rot.textContent='Saca de 60 kg · referência Coffee C convertida';
  }).catch(function(){
    var rot=document.getElementById('cotRot'); if(rot) rot.textContent='Cotação da saca ao vivo dentro do sistema';
    document.querySelectorAll('[data-cot]').forEach(function(el){ el.innerHTML='Café · <small>Coffee C</small>'; });
  });
})();
