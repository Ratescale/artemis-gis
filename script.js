document.addEventListener("DOMContentLoaded", function () {
    console.log("🛠 DOM ロード完了");
  
    // Mapbox GL JS の読み込み確認
    if (typeof mapboxgl === 'undefined') {
      console.error("🚨 Mapbox GL JS がロードされていません！");
      return;
    } else {
      console.log("🛠 Mapbox GL JS ロード成功");
    }
  
    // ※注意: クライアントサイドでは公開用アクセストークン (pk.*) を使用してください
    mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';
  
    // マップの初期化
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap',
      center: [-20.0873, 9.58738],
      zoom: 8
    });
  
    // スタイルロード時のイベント
    map.on('style.load', () => {
      console.log("🛠 Mapbox スタイルがロードされました:", map.getStyle());
    });
  
    // マップ完全ロード時のイベント
    map.on('load', () => {
      console.log("✅ Mapbox の地図が完全にロードされました！");
    });
  
    // エラーハンドリング
    map.on('error', (e) => {
      console.error("🚨 Mapbox エラー発生:", e);
    });
  
    // 検索ボックスのイベントリスナー
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
      searchBox.addEventListener('input', async function () {
        const query = this.value.toLowerCase();
        try {
          // ※注意: 'rensan.bemrywfa' は、Mapbox Studio のスタイル内に定義されているソース名と一致している必要があります
          const features = map.querySourceFeatures('rensan.bemrywfa');
          if (!features || features.length === 0) {
            console.error("🚨 指定されたソースが見つからないか、データがありません。");
            return;
          }
          // 各フィーチャーからプロパティと座標を抽出
          const placeNames = features.map(f => ({
            name: f.properties.name,
            coordinates: f.geometry.coordinates
          }));
          // 検索クエリにマッチするフィーチャーを抽出
          const filtered = placeNames.filter(p => p.name.toLowerCase().includes(query));
          if (filtered.length > 0) {
            // 最初の一致項目へアニメーション移動
            map.flyTo({ center: filtered[0].coordinates, zoom: 15 });
          }
        } catch (err) {
          console.error("🚨 検索機能のエラー:", err);
        }
      });
    } else {
      console.error("🚨 検索ボックスが見つかりません！");
    }
  });
  