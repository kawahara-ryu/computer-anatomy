const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(f,t,d,v=0.1){if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d);}
function playClick(){playTone(700,'triangle',0.04);}
function playCorrect(){playTone(392,'sine',0.1,0.1);setTimeout(()=>playTone(523,'sine',0.1,0.12),100);setTimeout(()=>playTone(659,'sine',0.2,0.15),200);}
function playWrong(){playTone(250,'sawtooth',0.3,0.15);setTimeout(()=>playTone(180,'sawtooth',0.4,0.2),120);}
function playClear(){[392,440,494,523,587,659,698,784].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.12,0.1),i*100));}

const screens={title:document.getElementById('screen-title'),stage1:document.getElementById('screen-stage1'),stage2:document.getElementById('screen-stage2'),stage3:document.getElementById('screen-stage3'),gameover:document.getElementById('screen-gameover'),clear:document.getElementById('screen-clear')};
function hideAllScreens(){Object.values(screens).forEach(s=>s.classList.remove('active'));}

// ===== STAGE 1 DATA =====
const parts = [
    {name:'キーボード',type:'入力',emoji:'⌨️'},
    {name:'マウス',type:'入力',emoji:'🖱️'},
    {name:'ディスプレイ',type:'出力',emoji:'🖥️'},
    {name:'プリンタ',type:'出力',emoji:'🖨️'},
    {name:'HDD/SSD',type:'記憶',emoji:'💾'},
    {name:'RAM(メモリ)',type:'記憶',emoji:'🧩'},
    {name:'CPU(演算部分)',type:'演算',emoji:'🧮'},
    {name:'CPU(制御部分)',type:'制御',emoji:'🎛️'}
];
let sortIndex=0;
let sortedList=[];

function startGame(){
    playClick();hideAllScreens();
    sortIndex=0;sortedList=[];
    document.getElementById('sorted-area').innerHTML='';
    document.getElementById('s1-progress').style.width='0%';
    document.getElementById('s1-label').textContent='0 / '+parts.length+' 分類完了';
    showNextPart();
    screens.stage1.classList.add('active');
}

function showNextPart(){
    if(sortIndex>=parts.length){
        playCorrect();
        alert('🎉 全パーツの分類完了！\n\n✅ コンピュータの五大装置:\n入力装置: キーボード、マウス\n出力装置: ディスプレイ、プリンタ\n記憶装置: HDD/SSD、RAM\n演算装置: CPU内の計算部分\n制御装置: CPU内の命令解読部分\n\n💡 CPU = 演算装置 + 制御装置');
        hideAllScreens();
        initStage2();
        screens.stage2.classList.add('active');
        return;
    }
    document.getElementById('sort-item-name').textContent=parts[sortIndex].emoji+' '+parts[sortIndex].name;
}

function sortAnswer(type){
    playClick();
    const correct=parts[sortIndex].type;
    const btns=document.querySelectorAll('.sort-btn');
    if(type===correct){
        // find the button and flash
        btns.forEach(b=>{if(b.textContent.includes(type)){b.classList.add('correct-flash');setTimeout(()=>b.classList.remove('correct-flash'),400);}});
        sortedList.push(parts[sortIndex]);
        const chip=document.createElement('span');
        chip.className='sorted-chip';
        chip.textContent=parts[sortIndex].emoji+parts[sortIndex].name+'→'+correct;
        document.getElementById('sorted-area').appendChild(chip);
        sortIndex++;
        document.getElementById('s1-progress').style.width=(sortIndex/parts.length*100)+'%';
        document.getElementById('s1-label').textContent=sortIndex+' / '+parts.length+' 分類完了';
        showNextPart();
    }else{
        btns.forEach(b=>{if(b.textContent.includes(type)){b.classList.add('wrong-flash');setTimeout(()=>b.classList.remove('wrong-flash'),400);}});
        playWrong();
        alert('❌ 「'+parts[sortIndex].name+'」は'+correct+'装置です！\n\nヒント: '+getHint(parts[sortIndex]));
    }
}

function getHint(p){
    const hints={
        '入力':'人間→コンピュータにデータを渡す装置',
        '出力':'コンピュータ→人間にデータを渡す装置',
        '記憶':'データを保存する装置',
        '演算':'計算を実行する装置',
        '制御':'命令を解読して各装置に指示を出す装置'
    };
    return hints[p.type]||'';
}

// ===== STAGE 2: データの流れ =====
const flowSteps=[
    {id:'f1',text:'キーボードで「1+2」を入力',order:1},
    {id:'f2',text:'制御装置が命令を解読',order:2},
    {id:'f3',text:'RAMからデータを取り出す',order:3},
    {id:'f4',text:'演算装置が1+2を計算',order:4},
    {id:'f5',text:'計算結果「3」をRAMに保存',order:5},
    {id:'f6',text:'ディスプレイに「3」を表示',order:6}
];
let selectedOrder=[];

function initStage2(){
    selectedOrder=[];
    const container=document.getElementById('flow-container');
    container.innerHTML='';
    const shuffled=[...flowSteps].sort(()=>Math.random()-0.5);
    shuffled.forEach(step=>{
        const div=document.createElement('div');
        div.className='flow-item';
        div.id=step.id;
        div.innerHTML=`<span class="flow-num" id="num-${step.id}">?</span><span>${step.text}</span>`;
        div.onclick=()=>selectFlow(step);
        container.appendChild(div);
    });
    updateFlowDisplay();
}

function selectFlow(step){
    playClick();
    const el=document.getElementById(step.id);
    if(el.classList.contains('selected')){
        // deselect
        el.classList.remove('selected');
        selectedOrder=selectedOrder.filter(s=>s.id!==step.id);
    }else{
        el.classList.add('selected');
        selectedOrder.push(step);
    }
    // update numbers
    document.querySelectorAll('.flow-item').forEach(el=>{
        const num=el.querySelector('.flow-num');
        const idx=selectedOrder.findIndex(s=>s.id===el.id);
        if(idx>=0){num.textContent=idx+1;el.classList.add('selected');}
        else{num.textContent='?';el.classList.remove('selected');}
    });
    updateFlowDisplay();
}

function updateFlowDisplay(){
    const display=document.getElementById('flow-display');
    if(selectedOrder.length===0){display.textContent='（タップして順番を選んでください）';return;}
    display.innerHTML=selectedOrder.map((s,i)=>`${i+1}. ${s.text}`).join('<br>');
}

function checkStage2(){
    if(selectedOrder.length!==flowSteps.length){
        alert('すべてのステップを順番に選んでください！（'+selectedOrder.length+'/'+flowSteps.length+'）');return;
    }
    const correct=selectedOrder.every((s,i)=>s.order===i+1);
    if(correct){
        playCorrect();
        alert('🎉 完璧なデータフロー！\n\n✅ 入力→制御(解読)→記憶(取出)→演算(計算)→記憶(保存)→出力(表示)\n\n制御装置が全体を指揮しているのがポイント！');
        hideAllScreens();
        memChecked=new Set();
        document.getElementById('mem-level').value=0;
        document.getElementById('s3-next').disabled=true;
        updateMemory();
        screens.stage3.classList.add('active');
    }else{
        playWrong();
        alert('❌ 順番が違います！\n\nヒント: まず「入力」から始まって、最後は「出力(表示)」で終わるはず。\n制御装置が先に命令を解読してから、演算が始まる！');
        // reset
        selectedOrder=[];
        document.querySelectorAll('.flow-item').forEach(el=>{
            el.classList.remove('selected');
            el.querySelector('.flow-num').textContent='?';
        });
        updateFlowDisplay();
    }
}

// ===== STAGE 3: メモリ階層 =====
const memData=[
    {name:'レジスタ',speed:'★★★★★',cap:'数十バイト',vol:'揮発性',loc:'CPU内部',speedPct:100,label:'超高速！CPU内部で瞬時にアクセス'},
    {name:'キャッシュメモリ',speed:'★★★★☆',cap:'数MB',vol:'揮発性',loc:'CPU近く',speedPct:75,label:'高速！よく使うデータを一時保存'},
    {name:'主記憶(RAM)',speed:'★★★☆☆',cap:'数GB〜数十GB',vol:'揮発性(電源OFFで消える)',loc:'マザーボード',speedPct:40,label:'中速。プログラム実行時に使う'},
    {name:'補助記憶(HDD/SSD)',speed:'★☆☆☆☆',cap:'数百GB〜数TB',vol:'不揮発性(消えない)',loc:'本体内/外付け',speedPct:8,label:'低速だが大容量。長期保存用'}
];
let memChecked=new Set();

function updateMemory(){
    const level=parseInt(document.getElementById('mem-level').value);
    const m=memData[level];
    document.getElementById('mem-name').textContent=m.name;
    document.getElementById('mem-speed').textContent=m.speed;
    document.getElementById('mem-cap').textContent=m.cap;
    document.getElementById('mem-vol').textContent=m.vol;
    document.getElementById('mem-loc').textContent=m.loc;
    document.getElementById('speed-fill').style.width=m.speedPct+'%';
    document.getElementById('speed-label').textContent=m.label;
    memChecked.add(level);
    if(memChecked.size>=4)document.getElementById('s3-next').disabled=false;
}

function checkStage3(){
    if(memChecked.size<4){alert('4種類すべてのメモリを確認してください！');return;}
    playCorrect();
    setTimeout(()=>{playClear();hideAllScreens();screens.clear.classList.add('active');},500);
}
