mapboxgl.accessToken = 'pk.eyJ1IjoicmVuc2FuIiwiYSI6ImNsbmU5M2VmbjA0MTcya21lZzA3ZWoxNmkifQ.xPW2Ai8yWpUcKkJYrTOYqw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rensan/cm695riwn00fr01stf1ef0tap',
    center: [-20.0873, 9.58738], // コペルニクスを初期位置
    minzoom: 0,
    maxzoom: 8
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
