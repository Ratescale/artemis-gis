mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap', 
    center: [-20.0873, 9.58738], 
    zoom: 8
});

// ✅ スタイルロードイベント
map.on('style.load', () => {
    console.log("🛠  Mapbox スタイルがロードされました:", map.getStyle());
});

// ✅ 完全ロード確認
map.on('load', () => {
    console.log("✅ Mapbox の地図が完全にロードされました！");
});

// ✅ エラーハンドリング
map.on('error', (e) => {
    console.error("🚨 Mapbox エラー発生:", e);
});

// 🔹 検索ボックスのイベントリスナー
document.getElementById('searchBox').addEventListener('input', async function () {
    const query = this.value.toLowerCase();
    
    // 🔹 ベクタータイルセットのデータ取得
    const features = await map.querySourceFeatures('rensan.bemrywfa');
    const placeNames = features.map(f => ({ 
        name: f.properties.name, 
        coordinates: f.geometry.coordinates 
    }));

    const filtered = placeNames.filter(p => p.name.toLowerCase().includes(query));
    if (filtered.length > 0) {
        map.flyTo({ center: filtered[0].coordinates, zoom: 15 });
    }
});
