// ================================
// Map 初期設定と Globe Spin
// ================================

// 公開用アクセストークンを設定
mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

// マップの初期化
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap',
  projection: 'globe', // 地球儀表示
  minzoom: 3,
  maxzoom: 8,
  center: [-20.0873, 9.58738]
});

// ナビゲーションコントロール追加（ズーム・回転操作など）
map.addControl(new mapboxgl.NavigationControl());
// ※スクロールズームは有効
map.scrollZoom.enable();

// スタイルロード後に Fog（大気効果）を設定
map.on('style.load', () => {
  map.setFog({
    // 大気の基本色（やや薄いブルー）
    color: 'rgba(202, 209, 255, 0.5)',
    // 空間の色（宇宙側の色）
    'space-color': 'rgba(11, 11, 25, 1)',
    // 地平線のブレンド度合い（0～1）
    'horizon-blend': 0.01,
    // 星の輝きの強度（通常は0）
    'star-intensity': 1
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
  if (!spinPaused) return;
  spinPaused = false;
  spinGlobe();
}

// ユーザー操作開始時に自動回転を停止
map.on('mousedown', pauseSpin);
map.on('dragstart', pauseSpin);
map.on('zoomstart', pauseSpin);

// 操作終了後、3秒後に自動回転再開
map.on('dragend', () => { setTimeout(resumeSpin, 3000); });
map.on('zoomend', () => { setTimeout(resumeSpin, 3000); });

// 初回の自動回転開始
spinGlobe();


// ================================
// 検索機能（クレーター名検索）
// ================================

// ※スタイル内のソースは "composite"、対象ソースレイヤーは "moon_craters_newfixed-bk5j1l" となっています。
// ※また、HTML内に <input id="searchBox"> と <ul id="searchResults"> がある前提です。

// 検索ボックスと検索結果リストの取得
const searchBox = document.getElementById('searchBox');
const resultsContainer = document.getElementById('searchResults');

// 結果リストをクリアする関数
function clearResults() {
  resultsContainer.innerHTML = '';
}

// 検索イベントの設定
if (searchBox) {
  searchBox.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    console.log("検索クエリ:", query);
    clearResults();
    if (!query) return; // 入力が空なら何もしない

    // 現在のビューポート内にあるフィーチャーを取得
    // ※ "composite" ソースから、対象のソースレイヤー "moon_craters_newfixed-bk5j1l" を指定
    const features = map.querySourceFeatures('composite', {
      sourceLayer: 'moon_craters_newfixed-bk5j1l'
    });
    console.log("取得したフィーチャー数:", features.length);

    // フィーチャーのプロパティ "name" に対して検索
    const matching = features.filter(f => {
      return f.properties &&
             f.properties.name &&
             f.properties.name.toLowerCase().includes(query);
    });
    console.log("一致したフィーチャー:", matching);

    // 検索結果があれば、候補リストを表示
    matching.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature.properties.name;
      li.addEventListener('click', () => {
        // 候補クリック時に、そのフィーチャーの座標へ flyTo で移動
        const coords = feature.geometry.coordinates;
        console.log("飛ばす先の座標:", coords);
        // ズームレベルが低い場合は、最低 zoom:10 に設定
        let targetZoom = map.getZoom();
        if (targetZoom < 10) {
          targetZoom = 10;
        }
        map.flyTo({
          center: coords,
          zoom: targetZoom,
          speed: 1.2,
          curve: 1,
          easing: t => t
        });
        // 検索ボックスに候補名を反映し、結果リストをクリア
        searchBox.value = feature.properties.name;
        clearResults();
      });
      resultsContainer.appendChild(li);
    });
  });
} else {
  console.error("検索ボックスが見つかりません！");
}