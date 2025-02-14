// 公開用アクセストークンを設定
mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

// マップの初期化
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  projection: 'globe', // 地球儀表示
  zoom: 1,
  center: [30, 15]
});

// ナビゲーションコントロールを追加し、スクロールによるズームを無効化
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

// スタイルロード後に Fog（大気効果）を設定（必要に応じて調整可能）
map.on('style.load', () => {
  map.setFog({}); // デフォルトの大気表現
});

/* ====================================
   自動回転（Globe Spin）の設定
   ------------------------------------
   ・ユーザーが操作中の場合は自動回転を一時停止
   ・操作終了後、3秒後に自動回転を再開
======================================= */

// 自動回転のパラメータ
const secondsPerRevolution = 240; // 240秒で1回転
const maxSpinZoom = 5;            // ズームレベル5以上では回転しない
const slowSpinZoom = 3;           // ズームレベル3～5で回転速度を低下

// 自動回転の制御用フラグとアニメーションID
let spinPaused = false;
let spinAnimationId = null;

// 自動回転処理（requestAnimationFrameを使用）
function spinGlobe() {
  const zoom = map.getZoom();
  if (!spinPaused && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution;
    if (zoom > slowSpinZoom) {
      const zoomDiff = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
      distancePerSecond *= zoomDiff;
    }
    // 1秒間を60フレームとして、1フレームあたりの回転角度（度数）
    const increment = distancePerSecond / 60;
    const center = map.getCenter();
    center.lng -= increment;
    map.jumpTo({ center });
  }
  spinAnimationId = requestAnimationFrame(spinGlobe);
}

// 自動回転を停止する関数
function pauseSpin() {
  spinPaused = true;
  if (spinAnimationId) {
    cancelAnimationFrame(spinAnimationId);
    spinAnimationId = null;
  }
}

// 自動回転を再開する関数
function resumeSpin() {
  if (!spinPaused) return; // すでに再開中なら何もしない
  spinPaused = false;
  spinGlobe();
}

// ユーザー操作開始時に自動回転を停止
map.on('mousedown', () => { 
  pauseSpin();
});
map.on('dragstart', () => { 
  pauseSpin();
});

// ユーザー操作終了時に、3秒後に自動回転を再開
map.on('dragend', () => {
  setTimeout(() => {
    resumeSpin();
  }, 3000);
});

// もしズーム操作があれば、同様に一時停止する（必要に応じて）
// 例：map.on('zoomstart', pauseSpin);
//      map.on('zoomend', () => { setTimeout(resumeSpin, 3000); });

// 初回の自動回転開始
spinGlobe();
