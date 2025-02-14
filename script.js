// 公開用アクセストークンを設定
mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

// マップの初期化
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap',
  projection: 'globe', // 地球儀表示にする
  minzoom: 1,
  maxzoom: 8,
  center: [-20.0873, 9.58738]
});

// ナビゲーションコントロールを追加し、スクロールによるズームを無効化
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

// スタイルのロード完了後に大気（Fog）の設定を実施
map.on('style.load', () => {
  map.setFog({
  // 大気の基本色（例：やや薄いブルー）
  color: 'rgba(202, 209, 255, 0.5)',
  // 空間の色（宇宙側の色）
  'space-color': 'rgba(11, 11, 25, 1)',
  // 地平線のブレンド度合い（0～1）
  'horizon-blend': 0.01,
  // 星の輝きの強度（通常は0）
  'star-intensity': 1
  }); 
});

// 自動回転制御用フラグ
let userInteracting = false;
const spinEnabled = true;

// 自動回転の設定パラメータ
const secondsPerRevolution = 240; // 240秒で1回転
const maxSpinZoom = 5;            // ズームレベル5以上では回転しない
const slowSpinZoom = 3;           // ズームレベル3～5で回転速度を低下

// 自動回転処理（requestAnimationFrame を利用）
function spinGlobe() {
  // ユーザー操作中でなく、かつ自動回転が有効で、かつズームが低い場合のみ回転
  const zoom = map.getZoom();
  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution;
    if (zoom > slowSpinZoom) {
      const zoomDiff = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
      distancePerSecond *= zoomDiff;
    }
    // 60fps前提で1フレームあたりの角度を計算
    const increment = distancePerSecond / 60;
    const center = map.getCenter();
    center.lng -= increment;
    // 即時に中心座標を更新（easeTo ではなく jumpTo を使用）
    map.jumpTo({ center });
  }
  requestAnimationFrame(spinGlobe);
}

// ユーザー操作開始時：自動回転を停止
map.on('mousedown', () => { userInteracting = true; });
map.on('dragstart', () => { userInteracting = true; });

// ユーザー操作終了時：一定時間後に自動回転を再開
map.on('dragend', () => {
  // 3秒後に自動回転を再開（必要に応じて調整）
  setTimeout(() => { userInteracting = false; }, 3000);
});

// 初回の自動回転開始
spinGlobe();
