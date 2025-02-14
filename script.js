// ================================
// Map 初期設定と Globe Spin
// ================================

// 公開用アクセストークンを設定
mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

// マップの初期化（スタイルはご自身のスタイルを指定してください）
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap',
  projection: 'globe', // 地球儀表示
  minzoom: 3,
  maxzoom: 8,
  center: [-20.0873, 9.58738]
});

// ナビゲーションコントロール追加（ズーム、回転操作など）
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.enable();

// スタイルロード後に Fog（大気効果）を設定
map.on('style.load', () => {
  map.setFog({
    color: 'rgba(202, 209, 255, 0.5)',   // 大気の基本色
    'space-color': 'rgba(11, 11, 25, 1)',  // 宇宙側の色
    'horizon-blend': 0.01,                // 地平線のブレンド度合い
    'star-intensity': 1                   // 星の輝きの強度
  });
});

// 自動回転のパラメータ
const secondsPerRevolution = 240; // 240秒で1回転
const maxSpinZoom = 5;            // ズームレベル5以上では回転しない
const slowSpinZoom = 3;           // ズームレベル3～5で回転速度を低下

let spinPaused = false;
let spinAnimationId = null;

// 自動回転処理（requestAnimationFrame 使用）
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

// 自動回転停止
function pauseSpin() {
  spinPaused = true;
  if (spinAnimationId) {
    cancelAnimationFrame(spinAnimationId);
    spinAnimationId = null;
  }
}

// 自動回転再開
function resumeSpin() {
  if (!spinPaused) return;
  spinPaused = false;
  spinGlobe();
}

// ユーザー操作開始時に自動回転停止
map.on('mousedown', pauseSpin);
map.on('dragstart', pauseSpin);
map.on('zoomstart', pauseSpin);

// 操作終了後、3秒後に自動回転再開
map.on('dragend', () => { setTimeout(resumeSpin, 3000); });
map.on('zoomend', () => { setTimeout(resumeSpin, 3000); });

// 初回の自動回転開始
spinGlobe();


// ================================
// カスタム Geocoding（Local Geocoder）の設定
// ================================

// 今回は、先ほどエクスポートした GeoJSON ファイル（moon_craters.geojson）を使用します。
// このファイルは、index.html と同じディレクトリに配置してください。

let globalCraters = [];

// GeoJSON データを読み込む
fetch('moon_craters.geojson')
  .then(response => response.json())
  .then(data => {
    globalCraters = data.features;
    console.log("Global crater data loaded:", globalCraters.length, "features");

    // GeoJSON のロード完了後に、Geocoder を初期化
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: function(query) {
        // globalCraters から、name プロパティに query が含まれるフィーチャーを返す
        return globalCraters.filter(feature =>
          feature.properties.name.toLowerCase().includes(query.toLowerCase())
        );
      },
      placeholder: 'クレーター名で検索',
      mapboxgl: mapboxgl,
      marker: false,          // 自動マーカーは追加しない
      localGeocoderOnly: true // カスタムデータのみを検索対象にする
    });

    // Geocoder コントロールをマップに追加（左上に表示されます）
    map.addControl(geocoder);

    // 検索結果選択時の動作
    geocoder.on('result', function(e) {
      const coords = e.result.geometry.coordinates;
      console.log("Geocoder 選択結果の座標:", coords);
      map.flyTo({
        center: coords,
        zoom: 10, // 必要に応じてズームレベルを調整
        speed: 1.2,
        curve: 1,
        easing: t => t
      });
    });
  })
  .catch(error => console.error("Error loading crater data:", error));
