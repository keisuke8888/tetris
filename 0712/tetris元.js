//------------------
// 初期値
//------------------

//ピクセル指定
const CELL = 20;	//正方形セル１つの一辺の長さ

//行・列指定
let   row,col;		//行・列ループ用変数
let   tY,tX;		//マス目上のテトリミノ位置

//色配列
const tetriColor =
[	//未使用（target=0）
	"",
	//テトリミノ色（要素1～7に割り当てる）
	"aqua","yellow","lime","red","blue","#FF6600","purple"
];

//テトリミノ落下・回転用の２次元配列（4行×4列）に使う変数を宣言
let tetrimino;

//テトリミノのパターン３次元配列（7種類×4行×4列）
const pattern = [
	//未使用（target=0）
	[				],
	//I型
	[	[0,0,0,0],
		[1,1,1,1],
		[0,0,0,0],
		[0,0,0,0]	],
	//O型
	[	[0,0,0,0],
		[0,1,1,0],
		[0,1,1,0],
		[0,0,0,0]	],
	//S型
	[	[0,0,0,0],
		[0,1,1,0],
		[1,1,0,0],
		[0,0,0,0]	],
	//Z型
	[	[0,0,0,0],
		[0,1,1,0],
		[0,0,1,1],
		[0,0,0,0]	],
	//J型
	[	[0,0,0,0],
		[1,0,0,0],
		[1,1,1,0],
		[0,0,0,0]	],
	//L型
	[	[0,0,0,0],
		[0,0,0,1],
		[0,1,1,1],
		[0,0,0,0]	],
	//T型
	[	[0,0,0,0],
		[0,1,0,0],
		[1,1,1,0],
		[0,0,0,0]	]
];

const square = 4;	//テトリミノの行と列数
let   target;		//移動対象テトリミノ番号
let   next;			//NEXTテトリミノ番号

//キャンバスの２次元配列（26行×12列）
let   canvas = [];				//まず１次元配列を定義
for(row=0;row<26;row++)
{
	canvas[row] = [];			//１次元配列の要素を配列にする

	//描画禁止セルに「9」をセット
	for(col=0;col<12;col++)
	{
		canvas[row][col] = 0;	//デフォルトで「0」セット
		if( (row > 0 && row < 4 ) && (col==3 || col== 8)	||
			(row== 4			) && (col< 4 || col > 7)	||
			(row > 4 && row <25 ) && (col==0 || col==11)	||
			(row==25			)
		  )
		{	canvas[row][col] = 9;		}
	}
}

const startY = 1;		//テトリミノ落下開始セル位置
const startX = 4;

let   inPlay = false;	//ゲーム中フラグ
let   game;				//テトリミノ自動落下変数

let   total = 0;						//得点合計
const delScore = [0,50,100,300,1000];	//行削除時の得点

//------------------
// キャンバス関連
//------------------

const can = document.getElementById('Canvas');
const ctx = can.getContext('2d');

//DOMツリーのスコア表示elementのアドレス取得
const score = document.getElementById('score');

//キャンバスoutline表示
can.setAttribute( "width" , CELL*12 );
can.setAttribute( "height", CELL*26 );
can.setAttribute( "style" , "outline:1px solid #000;" );

//文字列表示（NEXT）
ctx.fillStyle = "black";
ctx.font = "20px 'ＭＳ ゴシック'";
ctx.textAlign = "center";
ctx.fillText("NEXT", CELL*6, CELL*1.5, CELL*4);

//Canvas描画
function drawCanvas( ){

	//フィールド壁面
	ctx.fillStyle = "gray";
	ctx.fillRect(CELL*3, CELL*2, CELL*6, CELL*2.5);
	ctx.fillRect(CELL*0.5, CELL*4.5, CELL*11, CELL*21);

	//NEXTテトリミノ表示エリア
	ctx.fillStyle = "white";
	ctx.fillRect(CELL*3.5, CELL*2 -1, CELL*5, CELL*3 +1);

	drawCell( 2, 4, 4, 7 );		//開始行、行MAX、開始列、列MAX

	//フィールド内部
	ctx.fillStyle = "#DDD";		//フィールド全体塗り潰し
	ctx.fillRect(CELL*1, CELL*5, CELL*10, CELL*20);

	drawCell( 5, 24, 1, 10 );	//開始行、行MAX、開始列、列MAX

//debug0();

};

//Cell描画
function drawCell( r, rMax, c, cMax)
{
	for(row=r;row<=rMax;row++)
	{
		for(col=c;col<=cMax;col++)
		{
			if( canvas[row][col] )
			{	//テトリミノならセルを描画
				ctx.fillStyle = tetriColor[ canvas[row][col] ];
				ctx.fillRect(CELL*col, CELL*row, CELL, CELL);
				ctx.strokeStyle = "#000";
				ctx.strokeRect(CELL*col, CELL*row, CELL, CELL);
			}
		}
	}
};

//------------------
// 主処理
//------------------

drawCanvas();	//ゲーム開始前キャンバス表示

//ゲーム初期化
function gameInit()
{
	//キャンバスクリア
	for(row=2;row<=4;row++)		//NEXT領域
	{	canvas[row] = [0,0,0,9,0,0,0,0,9,0,0,0];	}

	for(row=5;row<=24;row++)	//フィールド内
	{	canvas[row] = [9,0,0,0,0,0,0,0,0,0,0,9];	}

	drawCanvas();

	//落下テトリミノをランダムに選択
	target = Math.floor(Math.random() * (pattern.length -1))+1;
	tY = startY;
	tX = startX;
	aryCopy();	//3次元配列patternを2次元の落下用配列にコピー
	drawTetrimino();

	//NEXTテトリミノをランダムに選択（先読み）
	next = Math.floor(Math.random() * (pattern.length -1))+1;
}

//ゲーム制御
function play()
{
	if( collide( 1, 0 ) )
	{	//テトリミノ落下継続
		drawCanvas();
		tY++;					//１行落下させる
		drawTetrimino();

		//NEXTテトリミノをキャンバス配列にセット
		if( tY == 4 )
		{	decision( pattern[next], startY, startX, next );	}

	}
	else
	{	//テトリミノを落下できなかった場合
		var top = decision(tetrimino,tY,tX,target);	//キャンバスにテトリミノ固定
		total++;									//ゲームscore（１点加算）

		var cnt = deleteLine();						//行削除
		if( cnt )
		{
			total += delScore[cnt];					//ゲームscore（削除行数加算）
			setTimeout(drawCanvas,300);				//キャンバス再描画
		}
		else{	drawCanvas();			}

		score.innerHTML = total;					//score再表示（１点加算＋行加算）

		//テトリミノ停止位置+削除行数 >= 5
		if( ( top + cnt ) >= 5 )
		{
			//キャンバス配列のNEXT領域クリア
			canvas[2] = [0,0,0,9,0,0,0,0,9,0,0,0];
			canvas[3] = [0,0,0,9,0,0,0,0,9,0,0,0];

			//NEXTテトリミノを落下させる
			target = next;
			tY = startY;
			tX = startX;
			aryCopy();	//3次元配列patternを2次元の落下用配列にコピー
			drawTetrimino();

			//NEXTテトリミノをランダムに選択（先読み方式）
			next = Math.floor(Math.random() * (pattern.length -1))+1;
		}
		else
		{
			//ゲーム終了
			clearInterval(game);		//自動落下停止

			ctx.fillStyle = "white";		//メッセージ領域塗り潰し
			ctx.fillRect(CELL*2, CELL*10, CELL*8, CELL*3);

			ctx.fillStyle = "red";		//文字列表示（NEXT）
			ctx.font = "30px 'ＭＳ ゴシック'";
			ctx.textAlign = "center";
			ctx.fillText("GAME OVER", CELL*6, CELL*12);

			inPlay = false;				//ゲームフラグ（終了）
		}
	}
};

//------------------
// 配列コピー
//------------------

function aryCopy()
{
	tetrimino = [];		//落下用配列を初期化
	for(row=0;row<square;row++)
	{
		tetrimino[row] = pattern[target][row].slice();	//列情報を値渡し
	}
};

//------------------
// キーイベント
//------------------

document.onkeydown = function(e)
{
	if( e.keyCode == 13 )
	{
		inPlay = true;
		gameInit();							//ゲーム画面初期化
		total = 0;							//得点初期化
		score.innerHTML = total;			//画面スコアのクリア
		game = setInterval( play, 500 );	//テトリミノ自動落下
	}
	else{
		if( inPlay )
		{
			switch(e.keyCode)
			{
				case 37:	//左
					if( collide(  0,-1 ) ){	tX--;	}	//collide( 行移動量,列移動量 )
					break;
				//case 38:	//上（デバッグ用）
				//	if( collide( -1, 0 ) ){	tY--;	}
				//	break;
				case 39:	//右
					if( collide(  0, 1 ) ){	tX++;	}
					break;
				case 40:	//下
					if( collide(  1, 0 ) )
					{
						tY++;
						//NEXTテトリミノをキャンバス配列にセット
						if( tY == 4 )
						{	decision( pattern[next], startY, startX, next );		}
					}
					break;
				case 32:	//スペース
					if( tY > 1 ){	rotate();	}	//テトリミノ回転
					break;
			}

			//座標変更後に再描画
			drawCanvas();
			drawTetrimino();
		}
//debug2();
	}
};

//------------------
// 行削除
//------------------
// jsの配列要素関数で2次元配列を操作すると誤動作を起こす場合あり
// 非効率だが配列要素を移動して行削除したように見せる
function deleteLine( )
{
	var cnt = 0;			//削除行数初期化
	var full;				//削除対象行判定フラグ

	//テトリミノの４行分の削除処理--------------------------
	var topY = tY;			//削除対象の上限行
	if( topY < 5 ){	topY = 5;	}
	var bottomY = 24;		//削除対象の下限行
	if( bottomY > tY+3 ){	bottomY = tY+3;		}

	for(row=bottomY;row>=topY;row--)	//削除は下から上に
	{
		//１行全てがテトリミノで埋まっているかチェック
		full = true;
		for(col=1;col<=10;col++)
		{	if( canvas[row][col] == 0 ){ full = false; }	}

//console.log(row,"行：",full);

		//行削除 or 行コピー（行移動）
		if( full )	//削除行数カウントup
		{
			cnt++;
			ctx.fillStyle = "rgba(255,255,255,0.5)";
			ctx.fillRect(CELL*1, CELL*row, CELL*10, CELL);
		}
		else		//行コピー
		{	canvas[row+cnt] = canvas[row].slice();	}
	}
//console.log("-------------");

	//削除した行がある場合、テトリミノより上にある行を移動------------
	if( cnt )
	{
		//【フィールド行の移動】
		for(row=topY-1;row>=5;row--)	//行移動は下から上へ
		{	canvas[row+cnt] = canvas[row].slice();	}

		//【フィールド上部のクリア】
		for(row=5;row<5+cnt;row++)		//クリアは上から下でOK
		{	canvas[row] = [9,0,0,0,0,0,0,0,0,0,0,9];	}

		//【NEXT領域の行移動およびクリア】
		if( tY < 5 )
		{
			for(row=4;row>=tY;row--)		//行移動は下から上へ
			{
				for(col=4;col<=7;col++)		//対象は4～7列のみ
				{
					canvas[row+cnt][col] = canvas[row][col];
					canvas[row][col] = 0;
				}
			}
		}
	}

	return cnt;
};

//------------------
// ゲーム画面描画
//------------------

//テトリミノ
function drawTetrimino( ){
	for(row=0;row<square;row++)
	{
		for(col=0;col<square;col++)
		{
			if( tetrimino[row][col] )
			{
				//セル描画
				ctx.fillStyle = tetriColor[target];
				ctx.fillRect(CELL*(tX+col), CELL*(tY+row), CELL, CELL);
				ctx.strokeStyle = "#000";
				ctx.strokeRect(CELL*(tX+col), CELL*(tY+row), CELL, CELL);
			}
			//デバッグ用（完成後にコメント化）
			//ctx.strokeStyle = "#000";
			//ctx.strokeRect(CELL*(tX+col), CELL*(tY+row), CELL, CELL);
		}
	}
};

//------------------
// Tetrimino回転
//------------------

//キャンバスに描画可能ならテトリミノ配列を回転させる
function rotate( ){

	var tmpAry=[];			//回転用配列初期化（まず１次元配列）
	for(row=0;row<square;row++)
	{
		tmpAry[row]=[];		//１次元配列の要素を配列に（２次元配列）
		for(col=0;col<square;col++)
		{
			//セルを回転させてコピー
			tmpAry[row][col] = tetrimino[col][square-1-row];
			//コピーしたセルが描画対象andキャンバス位置が描画禁止
			if( tmpAry[row][col] && canvas[tY+row][tX+col] )
			{
//console.log("tmpAr:",row,col,"canvas:",(tY+row),(tX+col));
				//移動NGの場合
				row = square;	//ループを強制修了
				col = square;
				tmpAry=[];		//回転用配列初期化
			}
		}
	}

	//回転が完了していたら回転済み配列をテトリミノにコピー
	if( tmpAry.length ){	tetrimino = tmpAry;		}
};

//------------------
// あたり判定
//------------------

//描画対象セルの全てがcanvas描画可能位置か確認する
function collide( y, x ){

	var judge = true;

	for(row=0;row<square;row++)
	{
		for(col=0;col<square;col++)
		{
			if( tetrimino[row][col] )		//テトリミノ描画セルか？
			{
				if( canvas[tY+y+row][tX+x+col] )	//canvas描画禁止セルか？
				{	judge = false;			}		//移動NGをセット
			}
		}
	}

	return judge;	//移動の判定結果を返す
}

//------------------------
// テトリミノ停止位置確定
//------------------------
function decision( ary, y, x, t )	//配列、行、列、種類番号
{
	var top = 5;	//フィールドの最上部行（ゲーム継続可能な描画上限）
	for(row=0;row<square;row++)
	{
		for(col=0;col<square;col++)
		{
			if( ary[row][col] )			//テトリミノ描画セルか？
			{
				canvas[y+row][x+col] = t;	//キャンバス配列にcopy
				if( y+row < top ){ top = y+row; }	//最上部行入替
			}
		}
	}
debug1();						//デバッグ用（完成時不要）
//console.log("-----------");	//デバッグ用（完成時不要）

	return top;
};

//------------------
// デバッグ用
//------------------

function debug0(){

	//マス目表示
	for(row=0;row<26;row++)
	{
		for(col=0;col<12;col++){
			ctx.strokeStyle = "red";
			ctx.setLineDash([1, 6]);
			ctx.strokeRect(CELL*col, CELL*row, CELL, CELL);
		}
	}
	ctx.setLineDash([]);	//点線指定クリア
}

function debug1(){

	for(row=0;row<26;row++)
	{
		var debug = "";
		for(col=0;col<12;col++)
		{	debug += canvas[row][col] + " ";	}
		console.log( debug );	//デバッグ用
	}
};



function debug2(){

	canvas[12][5]=9;
	ctx.fillStyle = "white";
	ctx.fillRect(CELL*5, CELL*12, CELL, CELL);
	ctx.strokeStyle = "#000";
	ctx.strokeRect(CELL*5, CELL*12, CELL, CELL);
};



