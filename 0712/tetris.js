//------------------
// 初期値
//------------------

//ピクセル指定
const CELL = 20;  //テトリミノの１つのブロック一辺の長さ

//行・列指定
let  row,col;     //行・列ループ用変数
let tY,tX;        //マス目上のテトリミノ位置

//テトリミノの色配列
const tetriColor = [    //未使用　(targe=0)
    //フィールド色
    "",
    //テトリミノ色（要素１～７に割り当てる ※８：スペシャルテトリミノはgray）
    "aqua", "yellow", "lime", "red", "blue", "#F60", "purple", "gray"];

    //テトリミノ落下・回転率の二次元配列（４行×４列）に使う変数を宣言
    let tetrimino;

//テトリミノのパターン３次元配列（8 種類×4 行×4 列）
const pattern = [
    //未使用 (terget=0)
    [],
    //I 型
    [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    //O 型
    [
        [0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    //S 型
    [
        [0,0,0,0],
        [0,0,1,1],
        [0,1,1,0],
        [0,0,0,0],
    ],
    //Z 型
    [
        [0,0,0,0],
        [1,1,0,0],
        [0,1,1,0],
        [0,0,0,0],
    ],
    //J 型
    [
        [0,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [0,0,0,0],
    ],
    //L 型
    [
        [0,0,0,0],
        [0,0,0,1],
        [0,1,1,1],
        [0,0,0,0],
    ],
    //T 型
    [
        [0,0,0,0],
        [0,1,0,0],
        [1,1,1,0],
        [0,0,0,0],
    ],
    //sp型
    [
        [0,0,0,0],
        [0,1,1,0],
        [0,1,0,0],
        [0,0,0,0],
    ]
];

const square = 4; //テトリミノの行と列数
let target; //移動対象テトリミノ番号
let next;   //NEXT テトリミノ番号


//キャンバスの２次元配列（26 行×12 列）
let canvas = []; //まず１次元配列を定義
for( row=0; row<26; row++ )
{
    canvas[row] = []; //１次元配列の要素を配列にする
    //描画禁止セルに「9」をセット
    for( col=0; col<12; col++ )
    {
        canvas[row][col] = 0; //デフォルトで「0」セット
        if( ( row>0 && row<4  ) && ( col== 3 || col== 8 ) ||
            ( row==4          ) && ( col < 4 || col > 7 ) ||
            ( row>4 && row<25 ) && ( col==0 || col==11 ) ||
            ( row==25 )
          )
        { canvas[row][col] = 9; }
    }
}

const startY = 1; //テトリミノ落下開始セル位置
const startX = 4;

let inPlay = false;  //ゲーム中フラグ
let game;            //テトリミノ自動落下変数

let total = 0;         //得点合計
let level_up = 1;      //レベル
let i_343_9 =500;            //テトリスの初期スピード
const delScore = [0,50,100,300,1000]; //行削除時の得点
let bonus; //得点倍数（１:ボーナスセル無 2：ボーナスセル有）
let cntg_343_9 = 0;  //削除行合計カウント
let HighS_343_9 =0;        //highスコア

const BGM = new Audio('./tetris.mp3');	//音声オブジェクトの新規作成
BGM.playbackRate = 1.0;	//再生speed 1未満(遅い),1(標準),1超(速い)
BGM.loop = true;			//繰返し再生指定

//------------------
// キャンバス定義
//------------------
const can = document.getElementById('Canvas');
const ctx = can.getContext('2d');

const score = document.getElementById('score');     //DOM ツリーのスコア表示 element のアドレス取得
const level = document.getElementById('level');     //DOM ツリーのスコア表示 element のアドレス取得
const Hscore = document.getElementById('Hscore');   //DOM ツリーのスコア表示 element のアドレス取得


//キャンバス outline 表示
can.setAttribute( "width", CELL*12 );
can.setAttribute( "height", CELL*26 );
can.setAttribute( "style", "outline:1px solid #000;" );

//フィールド外側
ctx.fillStyle = "#0FF";
ctx.fillRect( CELL*0, CELL*0, CELL*21, CELL*26);

//文字列表示（NEXT）
ctx.fillStyle = "black";
ctx.font = "20px 'ＭＳ ゴシック'";
ctx.textAlign = "center";
ctx.fillText("NEXT", CELL*6, CELL*1.5, CELL*4 );

//Canvas 描画
function drawCanvas( ){

    //フィールド壁面
    ctx.fillStyle = "gray";
    ctx.fillRect( CELL*3, CELL*2, CELL*6, CELL*2.5 );
    ctx.fillRect( CELL*0.5, CELL*4.5, CELL*11, CELL*21 );

    //NEXT テトリミノ表示エリア
    ctx.fillStyle = "white";
    ctx.fillRect( CELL*3.5, CELL*2-1, CELL*5, CELL*3 + 1 );
    drawCell(2, 4, 4, 7);

    //フィールド内部
    ctx.fillStyle = "#DDD";
    ctx.fillRect( CELL*1, CELL*5, CELL*10, CELL*20 );
    drawCell(5, 24, 1, 10);    //開始行　行 MAX 開始列　列 MAX

    //debug0();

};

//Cell描画
function drawCell(r, rMax, c, cMax) {
    for (row = r; row <= rMax; row++) {
        for (col = c; col <= cMax; col++) {
            if (canvas[row][col]) 
            { //テトリミノなら枠線描画
                ctx.fillStyle = tetriColor[ canvas[row][col] % 10 ];    //11～17 を 1～7 に
                ctx.fillStyle = tetriColor[canvas[row][col]];
                ctx.fillRect(CELL * col, CELL * row, CELL, CELL);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(CELL * col, CELL * row, CELL, CELL);

                if( canvas[row][col] > 10 ) //ボーナスマーク表示
                { drawBonus( CELL*col , CELL*row ); }

            }
        }
    }
};


//------------------
// 主処理
//------------------

drawCanvas(); //ゲーム開始前キャンバス表示

//ゲーム初期化
function gameInit()
{
    //キャンバスクリア
    for( row = 2; row <= 4; row++ ) //NEXT 領域
    { canvas[row] = [0,0,0,9,0,0,0,0,9,0,0,0]; }
    for( row = 5; row <= 24; row++ ) //フィールド内
    { canvas[row] = [9,0,0,0,0,0,0,0,0,0,0,9]; }
    drawCanvas();   //キャンバス描画

    i_343_9 = 500;          //テトリミノ落下スピード初期化
    console.log(i_343_9);  
    level_up_343_9 = 1;     //レベル初期化
    BGM.playbackRate = 1.0;	//再生speed 1未満(遅い),1(標準),1超(速い)

    //debug1();
    //debug2();

    //落下テトリミノをランダムに選択
    target = Math.floor(Math.random() * (pattern.length - 1 )) + 1;
    tY = startY;
    tX = startX;
    aryCopy();  //3次元配列　pattern を２次元の落下用配列にコピー
    drawTetrimino();

    //NEXT テトリミノをランダムに選択(先読み)
    next = Math.floor(Math.random() * (pattern.length - 1)) + 1;
}

//ゲーム制御
function play(){
    if( collide(  1, 0 ) ){ //テトリミノ落下継続
        drawCanvas();
        tY++;               //１行落下させる
        drawCanvas();
        drawTetrimino();
        
        //NEXT テトリミノをキャンバス配列にセット
        if (tY == 4) 
        { decision(pattern[next % 10], startY, startX, next) }     //11～17 を 1～7 に
    } else {
        //テトリミノを落下できなかった場合
            var top = decision(tetrimino, tY, tX, target);  //キャンバスにテトリミノ固定
            total++;                                        //ゲーム score（１点加算）
        
            var cnt = deleteLine();                     //行削除
            if( cnt )
            {
                total += delScore[cnt] * bonus * level_up_343_9;                 //ゲーム score（削除行数加算）×倍数 xステージレベル
                setTimeout(drawCanvas, 300);            //キャンバス再描画
            }else{
                drawCanvas();
            }
            score.innerHTML = total; //score 再表示

        //テトリミノ停止位置＋削除行数　>= 5
        //if ( (  decision(tetrimino,tY,tX,target)+ deleteLine() ) >= 5) 
        //テトリミノ停止位置確定
        if( (top + cnt) >= 5)
        {
            //キャンバス配列の NEXT 領域クリア
            canvas[2] = [0,0,0,9,0,0,0,0,9,0,0,0];
            canvas[3] = [0,0,0,9,0,0,0,0,9,0,0,0];
            //drawCanvas(); //キャンバス再描画

            //NEXT テトリミノ描画
            target = next;      //NEXTテトリミノを落下させる
            tY = startY;
            tX = startX;
            aryCopy(); //3 次元配列 pattern を 2 次元の落下用配列にコピー
            drawTetrimino();

            //NEXT テトリミノをランダムに選択（先読み方式）
            next = Math.floor(Math.random() * (pattern.length - 1)) + 1;

            //5%の確率で Bonus テトリミノにする（11～17）
            next += 10 * parseInt( (Math.random() + 0.05 ) );
        } else {
            //ゲーム終了
            clearInterval(game); //自動落下停止
            ctx.fillStyle = "white"; //メッセージ領域塗り潰し
            ctx.fillRect(CELL * 2, CELL * 10, CELL * 8, CELL * 3); //文字列表示（NEXT）
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", CELL * 6, CELL * 12);
            inPlay = false;             //ゲームフラグ終了
            BGM.pause();				//一時停止
        }
    }
};

 //High スコア
 if( total > HighS_343_9 ){
    HighS_343_9 = total;
    var ymd = new Date();
    Hscore.innerHTML = HighS_343_9 + "点 " +
    ymd.getFullYear()+"年" + (ymd.getMonth()+1)+"月"+ ymd.getDate()+"日" +
    ymd.getHours()+"時" + ymd.getMinutes()+"分" + ymd.getSeconds()+"秒<br>" +
    Hscore.innerHTML;
};

//レベルアップ
function Levelup_343_9(){
    if ( i_343_9 <= 500 ) {
        i_343_9 = i_343_9 - 40;             //テトリス落下スピードを-40ずつ早める
        console.log(i_343_9);
 
        setInterval(play, i_343_9); //テトリミノ自動落下
        BGM.playbackRate = BGM.playbackRate + 0.2;	//再生speed UP        
    }
};


//------------------
// 配列コピー
//------------------
function aryCopy() {
    //Bonus テトリミノは 11～17 がセットされてるので[target%10] 
    tetrimino = []; //落下用配列を初期化
    for (row = 0; row < square; row++) 
    {
        tetrimino[row] = pattern[target % 10][row].slice();  //列情報を「値渡し」でコピー
    }

}

//------------------
// キーイベント
//------------------
document.onkeydown = function(e)
{
    if( e.keyCode == 13 )   //Enterキー
    {
        //リプレイ時は起動済みインターバル処理を停止する
        if( game )
        {
            level_up_343_9 = 1;         //開始時レベルを１にする 
            BGM.currentTime = 0;		//再生位置を先頭に戻す
            clearInterval(game);        //自動落下停止
        }

        BGM.play();               //音声の再生
        inPlay = true;            //ゲーム開始 or リプレイ
        gameInit();               //ゲーム画面初期化
        total = 0;                //得点初期化
        score.innerHTML = total;  //画面スコアのクリア
        level.innerHTML = level_up_343_9;  //画面レベルのクリア
        game = setInterval(play, i_343_9); //テトリミノ自動落下
        //console.log(i_343_9);
    }else{
        if( inPlay )
        {
            switch(e.keyCode)
            {
                case 37:    //左
                    if( collide( 0, -1 ) ) { tX--; }  //colide(行移動量, 列移動量)
                    break;
                //case  38:   //上（デバッグ用）
                //if( collide( -1, 0 ) ) { tY--; }
                //break;
                case 39:    //右
                    if( collide( 0, 1 ) ) { tX++; }
                    break;
                case 40:    //下
                    if( collide( 1, 0 ) ) { 
                        tY++;
                        //NEXT テトリミノをキャンバス配列にセット
                        if (tY == 4){
                            decision(pattern[next % 10], startY, startX, next);
                        }
                    }
                    break;
                case 32:    //スペース
                    if (tY > 1) { rotate(); }   //テトリミノ回転
                    break;
            }

        //座標変更後に再描画
                drawCanvas();
                drawTetrimino();
        }
    }
//debug2();
};

//------------------
// 行削除
//------------------
// js の配列要素関数で 2 次元配列を操作すると誤動作を起こす場合あり
// 非効率だが配列要素を移動して行削除したように見せる
function deleteLine() {
    var cnt = 0; //削除行数初期化
    var full; //削除対象行判定フラグ

    //テトリミノの４行分の削除処理------------------------
    var topY = tY;
    if (topY < 5) {
        topY = 5
    }
    var bottomY = tY + 3;
    if (bottomY > 24) {
        bottomY = 24
    }
    bonus = 1; //得点倍数
    for (row = bottomY; row >= topY; row--) //行削除は下から上に
    {
        var hit = false; //Bonus セル有無判定
        //１行全てがテトリミノで埋まっているかチェック
        full = true;
        for (col = 1; col <= 10; col++) {
            if( canvas[row][col] == 0 ) { full = false; }   //空きセルあり
            if( canvas[row][col] > 10 ) { hit = true; }     //bonus セル有り
        }
        //行削除 or 行コピー（行移動）
        if (full) //削除行数カウント up
        { 
            cnt++;
            cntg_343_9 = cntg_343_9 + cnt;

            if (cntg_343_9 >= 0) { 
                level_up_343_9++
                level.innerHTML = level_up_343_9; //level再表示
                Levelup_343_9();
            }

            if( hit ){ bonus = 2; } //bonus セル有りなら得点倍数を変更
            //削除行マーキング（白色透過矩形）
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillRect( CELL*1, CELL*row, CELL*10, CELL);
            /*
            //デバッグ用
            ctx.fillStyle = "red";
            ctx.fillRect(CELL*1, CELL*2, CELL*10, CELL);
            */ 
        } else //行コピー
        { canvas[row + cnt] = canvas[row].slice(); }

        //console.log(row, "行：", full);
    }
    //console.log("-------------");

    //削除した行がある場合、テトリミノより上にある行を移動------------
    if (cnt) {
        //【フィールド行の移動】
        for (row = topY - 1; row >= 5; row--) //行移動は下から上へ
        { canvas[row + cnt] = canvas[row].slice(); }
        //【フィールド上部のクリア】
        for (row = 5; row < 5 + cnt; row++) //クリアは上から下で OK
        { canvas[row] = [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9]; }
        //【NEXT 領域の行移動およびクリア】
        if (tY < 5) {
            for (row = 4; row >= tY; row--) //行移動は下から上へ
            {
                for (col = 4; col <= 7; col++) //対象は 4～7 列のみ
                {
                    canvas[row + cnt][col] = canvas[row][col]; //セルコピー
                    canvas[row][col] = 0; //セルクリア
                }
            }
        }
    }



    /*
    //drawCanvas(); //キャンバス再描画
    setTimeout(drawCanvas,5000);
    */
    return cnt;
};



//------------------
// ゲーム画面描画
//------------------

//テトリミノ
function drawTetrimino( ){
    for( row=0; row < square; row++ )
    {
        for( col=0; col < square; col++ )
        {
            if( tetrimino[row][col] )
            {
                //セル描画
                ctx.fillStyle = tetriColor[target % 10] ;
                ctx.fillRect( CELL*(tX+col), CELL*(tY+row), CELL, CELL );
                ctx.strokeStyle = "#000";
                ctx.strokeRect( CELL*(tX+col), CELL*(tY+row), CELL, CELL );

                if( target > 10 ) //ボーナスマーク表示
                { drawBonus( CELL*(tX+col) , CELL*(tY+row)); }

            }
        //デバッグ用（完成後にコメント化）
        //ctx.strokeStyle = "#000";
        //ctx.strokeRect( CELL*(tX+col), CELL*(tY+row), CELL, CELL );
        }
    }
};

//Bonus マーク表示
function drawBonus( x, y ){
    ctx.fillStyle = "black";
    ctx.font = "14px 'ＭＳ ゴシック'";
    ctx.textAlign = "center";
    ctx.fillText("★", x+CELL/2 , y+CELL*0.75 );
}

//------------------
// Tetrimino回転
//------------------
//キャンバスに描画可能ならテトリミノ配列を回転させる
function rotate( ){
    var tmpAry=[]; //回転用配列初期化（まず１次元配列）
    for( row=0; row < square; row++ )
    {
        tmpAry[row]=[]; //１次元配列の要素を配列に（２次元配列）
        for( col=0; col < square; col++ )
        {
            //セルを回転させてコピー
            tmpAry[ row ][ col ] = tetrimino[ col ][ square - 1 - row ] ;
            //コピーしたセルが描画対象 and キャンバス位置が描画禁止
            if( tmpAry[ row ][ col ] && canvas[ tY + row ][ tX + col ] )
            {
                //console.log("tmpAr:", row, col, "canvas:", ( tY + row ),( tX + col )); //デバッグ用
                //移動 NG の場合
                row = square ; //ループを強制修了
                col = square ;
                tmpAry=[]; //回転用配列初期化
            }
        }
    }
    //回転が完了していたら回転済み配列をテトリミノにコピー
    if( tmpAry.length ){ tetrimino = tmpAry; }
};

//------------------
// あたり判定
//------------------
//描画対象セルの全てが canvas 描画可能位置か確認する
function collide( y, x ){
    var judge = true;
    for( row = 0; row < square; row++ )
    {
        for( col = 0; col < square; col++ )
        {
            if( tetrimino[row][col] ) //テトリミノ描画セルか？
            {
                if( canvas[ tY + y + row ][ tX + x + col ] ) //canvas 描画禁止セルか？
                { judge = false; } //移動 NG をセット
            }
        }
    }
    return judge; //移動の判定結果を返す
}
        

//------------------------
// テトリミノ停止位置確定
//------------------------
function decision(ary, y, x, t)
{
    var top = 5;
    for( row = 0; row < square; row++ )
    {
        for( col = 0; col < square; col++ )
        {
            if( ary[ row ][ col ] ) //テトリミノ描画セルか？
            {
                 canvas[ y + row ][ x + col ] = t;
                 if (y + row < top ){ top = y + row; }  //最上部行入替
            }
        }
    }
    //debug1(); //デバッグ用（完成時不要）
    //console.log("-----------"); //デバッグ用（完成時不要)

    return top;
};
    

//------------------
// デバッグ
//------------------
//キャンバス配列の内容表示
/*
//マス目表示
function debug0(){
    //マス目表示
    for( row = 0; row < 26; row++ )
    {
        for( col = 0; col < 12; col++ ){
            //マス目表示（完成後はコメント化する）
            ctx.strokeStyle = "red";
            ctx.setLineDash([1, 6]);
            ctx.strokeRect( CELL*col, CELL*row, CELL, CELL );
        }
    }
    ctx.setLineDash([]); //点線指定クリア
}

function debug1(){
    for( row = 0; row < 26; row++ )
    {
        var debug = "";
        for( col = 0; col < 12; col++)
        { debug += canvas[row][col] + " "; }
        console.log( debug ); //デバッグ用
    }
};

function debug2(){
    canvas[12][5]=9;
    ctx.fillStyle = "white";
    ctx.fillRect(CELL*5, CELL*12, CELL, CELL);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(CELL*5, CELL*12, CELL, CELL);
    };
*/
