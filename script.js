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
  map.setFog(null); // デフォルトの大気表現を適用
});

/* -------------------------------
   Globe（地球儀）の自動回転設定
   ・低ズーム時は自動回転させる
   ・ズームレベルが上がると回転を停止
--------------------------------- */

// 回転にかかる時間や回転停止の閾値
const secondsPerRevolution = 240; // 低ズーム時は240秒で1回転
const maxSpinZoom = 5;            // ズームレベル5以上では回転しない
const slowSpinZoom = 3;           // ズームレベル3～5で徐々に回転速度を低下

let userInteracting = false;      // ユーザー操作中は自動回転を停止
const spinEnabled = true;         // 自動回転の有効/無効

function spinGlobe() {
  const zoom = map.getZoom();
  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    // 1秒間に回転する角度（度数）
    let distancePerSecond = 360 / secondsPerRevolution;
    if (zoom > slowSpinZoom) {
      // ズームレベルが上がると回転速度を低下
      const zoomDiff = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
      distancePerSecond *= zoomDiff;
    }
    // 現在の中心座標を取得し、経度を減少させることで回転を表現
    const center = map.getCenter();
    center.lng -= distancePerSecond;
    // 1秒かけてスムーズに移動
    map.easeTo({ center, duration: 1000, easing: (n) => n });
  }
}

// ユーザー操作（マウスダウンやドラッグ開始）時は自動回転を停止
map.on('mousedown', () => { userInteracting = true; });
map.on('dragstart', () => { userInteracting = true; });

// アニメーション終了後に、ユーザー操作がなければ再び回転を開始
map.on('moveend', () => {
  userInteracting = false;
  spinGlobe();
});

// 初回の自動回転開始
spinGlobe();
