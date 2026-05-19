/* ============================================
   云师大校园导航 - 主应用逻辑（V3 全面修复版）
   ============================================ */

(function() {
    'use strict';

    // ========== 全局变量 ==========
    let map = null;
    let markers = [];
    let markerGroup = null;
    let boundaryPolygon = null;
    let currentPlace = null;
    let currentNavMode = 'walking';
    let navStartPoint = null;
    let navEndPoint = null;
    let navPlanner = null;
    let navOverlays = [];
    let measureMode = null;
    let measurePoints = [];
    let measureOverlays = [];
    let bookmarkedPlaces = [];
    try { bookmarkedPlaces = JSON.parse(localStorage.getItem('ynnu_bookmarks') || '[]'); } catch(e) { bookmarkedPlaces = []; }
    let currentCategory = null;
    let nearbyMarkers = [];
    let infoWindow = null;
    let placeSearchService = null;
    let geolocation = null;
    let autoCompleter = null;
    let isSidebarOpen = true;
    let satelliteLayer = null;
    let roadNetLayer = null;
    let markersVisible = true;
    let pluginsReady = false;

    // ========== 初始化入口 ==========
    function init() {
        try {
            // 第一步：创建地图（不需要插件）
            createMap();
            // 第二步：加载插件，回调中初始化依赖插件的功能
            loadPlugins();
            // 第三步：初始化不依赖地图插件的UI
            initSidebar();
            initSearch();
            initPanels();
            initMapTools();
            loadBookmarks();
        } catch(e) {
            console.error('初始化失败:', e);
            showToast('应用初始化出错: ' + e.message, 'error');
        }
    }

    // ========== 创建地图（仅基础功能） ==========
    function createMap() {
        map = new AMap.Map('mapContainer', {
            zoom: CAMPUS_ZOOM,
            center: CAMPUS_CENTER,
            mapStyle: 'amap://styles/whitesmoke',
            animateEnable: true,
            rotateEnable: false,
            pitchEnable: false,
            showIndoorMap: false
        });

        // 绘制校园边界（Polygon是基础类，不需要插件）
        drawBoundary();

        // 不再添加自定义标注，使用底图自带的位置信息

        // 地图点击事件
        map.on('click', function(e) {
            if (infoWindow) infoWindow.close();
            onMapClickForMeasure(e);
        });

        // 地图加载完成
        map.on('complete', function() {
            console.log('地图加载完成');
            // 保持校园中心和缩放级别，不自动调整视野
        });
    }

    // ========== 加载高德地图插件 ==========
    function loadPlugins() {
        AMap.plugin([
            'AMap.Scale',
            'AMap.Geolocation',
            'AMap.PlaceSearch',
            'AMap.AutoComplete',
            'AMap.Walking',
            'AMap.Driving',
            'AMap.Transfer',
            'AMap.Riding',
            'AMap.InfoWindow'
        ], function() {
            try {
                // 比例尺
                map.addControl(new AMap.Scale({ position: 'LB' }));

                // 信息窗口
                infoWindow = new AMap.InfoWindow({
                    isCustom: true,
                    offset: new AMap.Pixel(0, -42),
                    autoMove: true
                });

                // 地理定位
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    zoomToAccuracy: true
                });

                // 周边搜索
                placeSearchService = new AMap.PlaceSearch({
                    pageSize: 15,
                    pageIndex: 1,
                    city: '昆明',
                    citylimit: true,
                    autoFitView: false
                });

                // 自动补全
                autoCompleter = new AMap.AutoComplete({
                    city: '昆明',
                    citylimit: true
                });

                // 卫星图层
                satelliteLayer = new AMap.TileLayer.Satellite();
                roadNetLayer = new AMap.TileLayer.RoadNet();

                pluginsReady = true;
                console.log('高德地图插件加载完成');
                showToast('地图功能已就绪', 'success');
            } catch(e) {
                console.error('插件初始化失败:', e);
                showToast('部分功能加载失败，请刷新重试', 'error');
            }
        });
    }

    // ========== 绘制校园边界 ==========
    function drawBoundary() {
        boundaryPolygon = new AMap.Polygon({
            path: CAMPUS_BOUNDARY,
            strokeColor: '#1a73e8',
            strokeWeight: 3,
            strokeStyle: 'dashed',
            strokeOpacity: 0.7,
            fillColor: '#1a73e8',
            fillOpacity: 0.04
        });
        map.add(boundaryPolygon);
    }

    // ========== 导航面板 ==========


    // ========== 侧边栏初始化 ==========
    function initSidebar() {
        document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
        renderCategories();
        renderHotSpots();

        document.querySelectorAll('.quick-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                handleQuickAction(this.dataset.action);
            });
        });

        document.querySelectorAll('.guide-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                showGuide(this.dataset.guide);
            });
        });
    }

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        isSidebarOpen = !isSidebarOpen;
        if (isSidebarOpen) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }
        setTimeout(function() { map.resize(); }, 350);
    }

    function renderCategories() {
        const container = document.getElementById('categoryList');
        let html = '<span class="category-tag active" data-cat="all">' +
            '<i class="fas fa-th"></i> 全部' +
            '<span class="cat-count">' + CAMPUS_PLACES.length + '</span>' +
        '</span>';

        CATEGORIES.forEach(function(cat) {
            const count = CAMPUS_PLACES.filter(function(p) { return p.category === cat.id; }).length;
            if (count > 0) {
                html += '<span class="category-tag" data-cat="' + cat.id + '">' +
                    '<i class="' + cat.icon + '"></i> ' + cat.name +
                    '<span class="cat-count">' + count + '</span>' +
                '</span>';
            }
        });

        container.innerHTML = html;

        container.querySelectorAll('.category-tag').forEach(function(tag) {
            tag.addEventListener('click', function() {
                filterByCategory(this.dataset.cat);
                container.querySelectorAll('.category-tag').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
            });
        });
    }

    function renderHotSpots() {
        const container = document.getElementById('hotSpots');
        let html = '';
        HOT_PLACE_IDS.forEach(function(id, index) {
            const place = CAMPUS_PLACES.find(function(p) { return p.id === id; });
            if (place) {
                const cat = CATEGORIES.find(function(c) { return c.id === place.category; });
                html += '<div class="hot-spot-item" data-place-id="' + place.id + '">' +
                    '<div class="hot-rank">' + (index + 1) + '</div>' +
                    '<div class="hot-info">' +
                        '<div class="hot-name">' + place.name + '</div>' +
                        '<div class="hot-cat">' + (cat ? cat.name : '') + '</div>' +
                    '</div>' +
                '</div>';
            }
        });
        container.innerHTML = html;

        container.querySelectorAll('.hot-spot-item').forEach(function(item) {
            item.addEventListener('click', function() {
                const placeId = parseInt(this.dataset.placeId);
                const place = CAMPUS_PLACES.find(function(p) { return p.id === placeId; });
                if (place) {
                    flyToPlace(place);
                    showPlaceDetail(place);
                }
            });
        });
    }

    function filterByCategory(catId) {
        currentCategory = catId === 'all' ? null : catId;
        // 不再有自定义标注，筛选仅影响侧边栏显示
    }

    // ========== 搜索功能 ==========
    function initSearch() {
        const input = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        const suggestions = document.getElementById('searchSuggestions');
        let debounceTimer = null;

        input.addEventListener('input', function() {
            const val = this.value.trim();
            clearBtn.classList.toggle('hidden', !val);
            if (debounceTimer) clearTimeout(debounceTimer);
            if (!val) {
                suggestions.classList.add('hidden');
                return;
            }
            debounceTimer = setTimeout(function() {
                performSearch(val);
            }, 300);
        });

        input.addEventListener('focus', function() {
            if (this.value.trim() && suggestions.innerHTML.trim()) {
                suggestions.classList.remove('hidden');
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const val = this.value.trim();
                if (val) {
                    performSearch(val);
                    suggestions.classList.add('hidden');
                }
            }
        });

        clearBtn.addEventListener('click', function() {
            input.value = '';
            clearBtn.classList.add('hidden');
            suggestions.classList.add('hidden');
            filterByCategory('all');
            document.querySelectorAll('.category-tag').forEach(function(t) { t.classList.remove('active'); });
            document.querySelector('.category-tag[data-cat="all"]').classList.add('active');
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) {
                suggestions.classList.add('hidden');
            }
        });
    }

    function performSearch(keyword) {
        const suggestions = document.getElementById('searchSuggestions');
        let results = [];

        // 先搜索校园内数据
        const campusResults = CAMPUS_PLACES.filter(function(p) {
            return p.name.includes(keyword) || p.desc.includes(keyword);
        });

        campusResults.forEach(function(place) {
            const cat = CATEGORIES.find(function(c) { return c.id === place.category; });
            results.push({
                name: place.name,
                category: cat ? cat.name : '',
                icon: cat ? cat.icon : 'fas fa-map-marker-alt',
                type: 'campus',
                placeId: place.id
            });
        });

        // 再通过AutoComplete搜索周边
        if (autoCompleter) {
            autoCompleter.search(keyword, function(status, data) {
                if (status === 'complete' && data.tips) {
                    data.tips.forEach(function(tip) {
                        if (tip.location) {
                            results.push({
                                name: tip.name,
                                category: tip.district || '',
                                icon: 'fas fa-location-dot',
                                type: 'amap',
                                location: tip.location,
                                address: tip.address || ''
                            });
                        }
                    });
                }
                renderSearchResults(results, suggestions);
            });
        } else {
            renderSearchResults(results, suggestions);
        }
    }

    function renderSearchResults(results, suggestions) {
        if (results.length === 0) {
            suggestions.innerHTML = '<div class="empty-hint" style="padding:20px"><p>未找到相关结果</p></div>';
        } else {
            suggestions.innerHTML = results.slice(0, 10).map(function(r, i) {
                return '<div class="suggestion-item" data-index="' + i + '">' +
                    '<i class="' + r.icon + '"></i>' +
                    '<div class="sug-text">' +
                        '<div>' + r.name + '</div>' +
                        (r.category ? '<div class="sug-cat">' + r.category + '</div>' : '') +
                    '</div>' +
                '</div>';
            }).join('');
        }

        suggestions._results = results;
        suggestions.classList.remove('hidden');

        suggestions.querySelectorAll('.suggestion-item').forEach(function(item, i) {
            item.addEventListener('click', function() {
                const result = results[i];
                if (result.type === 'campus') {
                    const place = CAMPUS_PLACES.find(function(p) { return p.id === result.placeId; });
                    if (place) {
                        flyToPlace(place);
                        showPlaceDetail(place);
                    }
                } else if (result.type === 'amap' && result.location) {
                    map.setZoomAndCenter(17, [result.location.lng, result.location.lat]);
                    if (infoWindow) infoWindow.close();
                }
                suggestions.classList.add('hidden');
                document.getElementById('searchInput').value = result.name;
            });
        });
    }

    // ========== 面板初始化 ==========
    function initPanels() {
        document.querySelectorAll('.panel-close').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.closest('.float-panel').classList.add('hidden');
            });
        });

        initLayerPanel();
        initNavPanel();
        initNearbyPanel();
        initMeasurePanel();
        initPlaceDetail();
    }

    // ========== 图层面板 ==========
    function initLayerPanel() {
        document.getElementById('layerToggle').addEventListener('click', function() {
            togglePanel('layerPanel');
        });

        document.querySelectorAll('.layer-option').forEach(function(opt) {
            opt.addEventListener('click', function() {
                const layer = this.dataset.layer;
                document.querySelectorAll('.layer-option').forEach(function(o) { o.classList.remove('selected'); });
                this.classList.add('selected');
                switchMapLayer(layer);
            });
        });

        document.getElementById('toggleMarkers').addEventListener('change', function() {
            // 已移除自定义标注，此开关不再有效
        });

        document.getElementById('toggleBoundary').addEventListener('change', function() {
            if (this.checked) {
                if (boundaryPolygon) boundaryPolygon.show();
            } else {
                if (boundaryPolygon) boundaryPolygon.hide();
            }
        });

        document.getElementById('toggleRoadNet').addEventListener('change', function() {
            if (!roadNetLayer) return;
            if (this.checked) {
                map.add(roadNetLayer);
            } else {
                try { map.remove(roadNetLayer); } catch(e) {}
            }
        });
    }

    function switchMapLayer(type) {
        if (satelliteLayer) { try { map.remove(satelliteLayer); } catch(e) {} }
        if (roadNetLayer) { try { map.remove(roadNetLayer); } catch(e) {} }

        switch(type) {
            case 'satellite':
                if (satelliteLayer) {
                    map.add(satelliteLayer);
                    map.setMapStyle('amap://styles/satellite');
                }
                break;
            case 'hybrid':
                if (satelliteLayer) map.add(satelliteLayer);
                if (roadNetLayer) map.add(roadNetLayer);
                map.setMapStyle('amap://styles/satellite');
                break;
            default:
                map.setMapStyle('amap://styles/whitesmoke');
                break;
        }
    }

    // ========== 导航面板 ==========
    function initNavPanel() {
        document.getElementById('swapPoints').addEventListener('click', function() {
            const startInput = document.getElementById('navStart');
            const endInput = document.getElementById('navEnd');
            const tempVal = startInput.value;
            const tempPoint = navStartPoint;
            startInput.value = endInput.value;
            navStartPoint = navEndPoint;
            endInput.value = tempVal;
            navEndPoint = tempPoint;
        });

        document.querySelectorAll('.nav-mode').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.nav-mode').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                currentNavMode = this.dataset.mode;
            });
        });

        document.querySelectorAll('.nav-clear-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const target = document.getElementById(this.dataset.target);
                target.value = '';
                if (this.dataset.target === 'navStart') navStartPoint = null;
                else { navEndPoint = null; document.getElementById('navEndSuggestions').classList.add('hidden'); }
            });
        });

        document.getElementById('startNavBtn').addEventListener('click', function() {
            startNavigation();
        });

        // 终点输入框 - AutoComplete 搜索
        initNavEndSearch();
    }

    function initNavEndSearch() {
        var endInput = document.getElementById('navEnd');
        var suggestions = document.getElementById('navEndSuggestions');
        var debounceTimer = null;

        endInput.addEventListener('input', function() {
            var val = this.value.trim();
            if (debounceTimer) clearTimeout(debounceTimer);
            if (!val) {
                suggestions.classList.add('hidden');
                navEndPoint = null;
                return;
            }
            debounceTimer = setTimeout(function() {
                searchNavEnd(val, suggestions);
            }, 300);
        });

        endInput.addEventListener('focus', function() {
            if (this.value.trim() && suggestions.innerHTML.trim()) {
                suggestions.classList.remove('hidden');
            }
        });

        endInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                suggestions.classList.add('hidden');
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('#navEnd') && !e.target.closest('#navEndSuggestions')) {
                suggestions.classList.add('hidden');
            }
        });
    }

    function searchNavEnd(keyword, suggestions) {
        if (!autoCompleter) {
            showToast('搜索服务尚未就绪，请稍候', 'error');
            return;
        }

        autoCompleter.search(keyword, function(status, data) {
            if (status === 'complete' && data.tips) {
                var results = data.tips.filter(function(tip) { return tip.location; });
                if (results.length === 0) {
                    suggestions.innerHTML = '<div class="empty-hint" style="padding:12px"><p>未找到相关地点</p></div>';
                } else {
                    suggestions.innerHTML = results.slice(0, 8).map(function(tip, i) {
                        return '<div class="suggestion-item" data-index="' + i + '">' +
                            '<i class="fas fa-location-dot"></i>' +
                            '<div class="sug-text">' +
                                '<div>' + tip.name + '</div>' +
                                '<div class="sug-cat">' + (tip.district || '') + (tip.address ? ' ' + tip.address : '') + '</div>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                }

                suggestions._results = results;
                suggestions.classList.remove('hidden');

                suggestions.querySelectorAll('.suggestion-item').forEach(function(item, i) {
                    item.addEventListener('click', function() {
                        var tip = results[i];
                        navEndPoint = [tip.location.lng, tip.location.lat];
                        document.getElementById('navEnd').value = tip.name;
                        suggestions.classList.add('hidden');
                    });
                });
            } else {
                suggestions.innerHTML = '<div class="empty-hint" style="padding:12px"><p>未找到相关地点</p></div>';
                suggestions.classList.remove('hidden');
            }
        });
    }

    function startNavigation() {
        if (!pluginsReady) {
            showToast('地图功能正在加载，请稍候', 'info');
            return;
        }

        if (!navEndPoint) {
            showToast('请先选择终点', 'error');
            return;
        }

        if (!navStartPoint) {
            if (geolocation) {
                showToast('正在获取您的位置...', 'info');
                geolocation.getCurrentPosition(function(status, result) {
                    if (status === 'complete') {
                        navStartPoint = [result.position.lng, result.position.lat];
                        document.getElementById('navStart').value = '当前位置';
                        doNavigation();
                    } else {
                        navStartPoint = CAMPUS_CENTER;
                        document.getElementById('navStart').value = '校园中心（默认）';
                        doNavigation();
                    }
                });
            } else {
                navStartPoint = CAMPUS_CENTER;
                document.getElementById('navStart').value = '校园中心（默认）';
                doNavigation();
            }
        } else {
            doNavigation();
        }
    }

    function clearNavOverlays() {
        navOverlays.forEach(function(o) {
            try { map.remove(o); } catch(e) {}
        });
        navOverlays = [];
    }

    function doNavigation() {
        // 清除旧路线
        clearNavOverlays();
        if (navPlanner) {
            try { navPlanner.clear(); } catch(e) {}
            navPlanner = null;
        }

        const navResult = document.getElementById('navResult');
        const navSummary = document.getElementById('navSummary');
        const navSteps = document.getElementById('navSteps');

        showToast('正在规划路线...', 'info');

        function onNavComplete(status, result) {
            if (status === 'error') {
                showToast('路线规划失败，请检查起终点', 'error');
                return;
            }

            try {
                let distance = 0, time = 0;
                const modeNames = { walking: '步行', riding: '骑行', transit: '公交', driving: '驾车' };

                if (currentNavMode === 'transit') {
                    if (result.transits && result.transits.length > 0) {
                        const transit = result.transits[0];
                        time = transit.time || 0;
                        navSummary.innerHTML =
                            '<div class="ns-distance">公交方案</div>' +
                            '<div class="ns-time">预计约' + formatTime(time) + '</div>';

                        let stepsHtml = '';
                        if (transit.segments) {
                            transit.segments.forEach(function(seg) {
                                if (seg.bus && seg.bus.buslines && seg.bus.buslines.length > 0) {
                                    const busline = seg.bus.buslines[0];
                                    stepsHtml += '<div class="nav-step">' +
                                        '<div class="step-icon"><i class="fas fa-bus"></i></div>' +
                                        '<div class="step-text">乘坐' + busline.name +
                                            (busline.departure_stop ? '，从' + busline.departure_stop.name + '上车' : '') +
                                            (busline.arrival_stop ? '，到' + busline.arrival_stop.name + '下车' : '') +
                                        '</div>' +
                                        '<div class="step-dist">' + (busline.via_num ? busline.via_num + '站' : '') + '</div>' +
                                    '</div>';
                                } else if (seg.walking && seg.walking.steps) {
                                    seg.walking.steps.forEach(function(step) {
                                        stepsHtml += '<div class="nav-step">' +
                                            '<div class="step-icon"><i class="fas fa-walking"></i></div>' +
                                            '<div class="step-text">' + (step.instruction || '步行') + '</div>' +
                                            '<div class="step-dist">' + (step.distance ? formatDistance(step.distance) : '') + '</div>' +
                                        '</div>';
                                    });
                                }
                            });
                        }
                        navSteps.innerHTML = stepsHtml;
                        navResult.style.display = 'block';
                        showToast('路线规划成功', 'success');
                    } else {
                        showToast('未找到公交路线', 'error');
                    }
                    return;
                }

                // 步行/骑行/驾车
                if (result.routes && result.routes.length > 0) {
                    const route = result.routes[0];
                    distance = route.distance || 0;
                    time = route.time || 0;

                    navSummary.innerHTML =
                        '<div class="ns-distance">' + formatDistance(distance) + '</div>' +
                        '<div class="ns-time">' + modeNames[currentNavMode] + '约' + formatTime(time) + '</div>';

                    let stepsHtml = '';
                    if (route.steps) {
                        route.steps.forEach(function(step) {
                            const icon = getStepIcon(step.action);
                            stepsHtml += '<div class="nav-step">' +
                                '<div class="step-icon"><i class="' + icon + '"></i></div>' +
                                '<div class="step-text">' + (step.instruction || step.action || '继续前行') + '</div>' +
                                '<div class="step-dist">' + (step.distance ? formatDistance(step.distance) : '') + '</div>' +
                            '</div>';
                        });
                    }
                    navSteps.innerHTML = stepsHtml;
                    navResult.style.display = 'block';
                    showToast('路线规划成功', 'success');
                } else {
                    showToast('未找到可用路线', 'error');
                }
            } catch(e) {
                console.error('解析导航结果出错:', e);
                showToast('路线解析出错', 'error');
            }
        }

        var startLngLat = new AMap.LngLat(navStartPoint[0], navStartPoint[1]);
        var endLngLat = new AMap.LngLat(navEndPoint[0], navEndPoint[1]);

        try {
            switch(currentNavMode) {
                case 'walking':
                    navPlanner = new AMap.Walking({ map: map, autoFitView: true });
                    navPlanner.search(startLngLat, endLngLat, onNavComplete);
                    break;
                case 'riding':
                    navPlanner = new AMap.Riding({ map: map, autoFitView: true });
                    navPlanner.search(startLngLat, endLngLat, onNavComplete);
                    break;
                case 'transit':
                    navPlanner = new AMap.Transfer({ map: map, city: '昆明', autoFitView: true });
                    navPlanner.search(startLngLat, endLngLat, onNavComplete);
                    break;
                case 'driving':
                    navPlanner = new AMap.Driving({ map: map, autoFitView: true });
                    navPlanner.search(startLngLat, endLngLat, onNavComplete);
                    break;
            }
        } catch(e) {
            console.error('创建导航实例失败:', e);
            showToast('导航功能出错: ' + e.message, 'error');
        }
    }

    function getStepIcon(action) {
        if (!action) return 'fas fa-arrow-right';
        var a = action.toLowerCase();
        if (a.includes('左') || a.includes('left')) return 'fas fa-arrow-left';
        if (a.includes('右') || a.includes('right')) return 'fas fa-arrow-right';
        if (a.includes('直') || a.includes('straight')) return 'fas fa-arrow-up';
        if (a.includes('到') || a.includes('arrive')) return 'fas fa-flag-checkered';
        return 'fas fa-arrow-up';
    }

    // ========== 周边查询 ==========
    function initNearbyPanel() {
        document.getElementById('nearbySearchBtn').addEventListener('click', function() {
            var keyword = document.getElementById('nearbyInput').value.trim();
            if (keyword) searchNearby(keyword);
        });

        document.getElementById('nearbyInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var keyword = this.value.trim();
                if (keyword) searchNearby(keyword);
            }
        });

        document.querySelectorAll('.nearby-tag').forEach(function(tag) {
            tag.addEventListener('click', function() {
                document.querySelectorAll('.nearby-tag').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                searchNearby(this.dataset.keyword);
            });
        });
    }

    function searchNearby(keyword) {
        if (!placeSearchService) {
            showToast('搜索服务尚未就绪，请稍候再试', 'error');
            return;
        }

        var center = currentPlace ? [currentPlace.lng, currentPlace.lat] : CAMPUS_CENTER;
        showToast('正在搜索...', 'info');

        placeSearchService.searchNearBy(keyword, center, 2000, function(status, result) {
            clearNearbyMarkers();

            if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
                var pois = result.poiList.pois;
                var container = document.getElementById('nearbyResults');
                container.innerHTML = pois.map(function(poi, i) {
                    return '<div class="nearby-result-item" data-index="' + i + '">' +
                        '<div class="nr-icon"><i class="fas fa-map-marker-alt"></i></div>' +
                        '<div class="nr-info">' +
                            '<div class="nr-name">' + poi.name + '</div>' +
                            '<div class="nr-addr">' + (poi.address || (poi.pname || '') + (poi.cityname || '') + (poi.adname || '')) + '</div>' +
                        '</div>' +
                        '<div class="nr-dist">' + (poi.distance ? formatDistance(poi.distance) : '') + '</div>' +
                    '</div>';
                }).join('');

                pois.forEach(function(poi) {
                    if (poi.location) {
                        var m = new AMap.Marker({
                            position: [poi.location.lng, poi.location.lat],
                            offset: new AMap.Pixel(-14, -28),
                            title: poi.name,
                            content: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#ea4335;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:bold">P</span></div>'
                        });
                        nearbyMarkers.push(m);
                        map.add(m);
                    }
                });

                container.querySelectorAll('.nearby-result-item').forEach(function(item, i) {
                    item.addEventListener('click', function() {
                        var poi = pois[i];
                        if (poi.location) {
                            map.setZoomAndCenter(17, [poi.location.lng, poi.location.lat]);
                        }
                    });
                });

                showToast('找到' + pois.length + '个结果', 'success');
            } else {
                document.getElementById('nearbyResults').innerHTML =
                    '<div class="empty-hint"><i class="fas fa-search"></i><p>未找到相关结果</p></div>';
            }
        });
    }

    function clearNearbyMarkers() {
        nearbyMarkers.forEach(function(m) { try { map.remove(m); } catch(e) {} });
        nearbyMarkers = [];
    }

    // ========== 测量工具 ==========
    function initMeasurePanel() {
        document.querySelectorAll('.measure-mode').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.measure-mode').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                measureMode = this.dataset.measure;
                clearMeasure();
            });
        });

        document.getElementById('measureClear').addEventListener('click', clearMeasure);
        measureMode = 'distance';
    }

    function onMapClickForMeasure(e) {
        var measurePanel = document.getElementById('measurePanel');
        if (measurePanel.classList.contains('hidden')) return;

        var lnglat = [e.lnglat.lng, e.lnglat.lat];
        measurePoints.push(lnglat);

        var dot = new AMap.CircleMarker({
            center: lnglat,
            radius: 4,
            fillColor: '#1a73e8',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2
        });
        map.add(dot);
        measureOverlays.push(dot);

        if (measurePoints.length > 1) {
            var line = new AMap.Polyline({
                path: measurePoints,
                strokeColor: '#1a73e8',
                strokeWeight: 3,
                strokeStyle: 'solid'
            });
            map.add(line);
            measureOverlays.push(line);

            if (measureMode === 'distance') {
                var totalDist = 0;
                for (var i = 1; i < measurePoints.length; i++) {
                    var p1 = new AMap.LngLat(measurePoints[i-1][0], measurePoints[i-1][1]);
                    var p2 = new AMap.LngLat(measurePoints[i][0], measurePoints[i][1]);
                    totalDist += p1.distance(p2);
                }
                document.getElementById('measureResult').textContent = '总距离：' + formatDistance(totalDist);
            } else if (measureMode === 'area' && measurePoints.length >= 3) {
                // 用Polygon近似计算面积
                var areaPoly = new AMap.Polygon({ path: measurePoints });
                var area = areaPoly.getArea ? areaPoly.getArea() : 0;
                if (area > 0) {
                    document.getElementById('measureResult').textContent = '面积：' + formatArea(area);
                } else {
                    document.getElementById('measureResult').textContent = '面积：计算中...';
                }
                map.remove(areaPoly);
            }
        }
    }

    function clearMeasure() {
        measurePoints = [];
        measureOverlays.forEach(function(o) { try { map.remove(o); } catch(e) {} });
        measureOverlays = [];
        document.getElementById('measureResult').textContent = '';
    }

    // ========== 地点详情 ==========
    function initPlaceDetail() {
        document.getElementById('placeDetailClose').addEventListener('click', hidePlaceDetail);
        document.getElementById('navigateToPlace').addEventListener('click', function() {
            if (currentPlace) {
                openNavPanel(null, currentPlace);
                hidePlaceDetail();
            }
        });
        document.getElementById('startFromPlace').addEventListener('click', function() {
            if (currentPlace) {
                openNavPanel(currentPlace, null);
                hidePlaceDetail();
            }
        });
        document.getElementById('bookmarkPlace').addEventListener('click', function() {
            if (currentPlace) toggleBookmark(currentPlace);
        });
        document.getElementById('sharePlace').addEventListener('click', function() {
            if (currentPlace) sharePlace(currentPlace);
        });

        document.querySelectorAll('.place-nearby-tags .nearby-tag').forEach(function(tag) {
            tag.addEventListener('click', function() {
                var keyword = this.dataset.keyword;
                closeAllPanels();
                document.getElementById('nearbyPanel').classList.remove('hidden');
                searchNearby(keyword);
            });
        });
    }

    function showPlaceDetail(place) {
        currentPlace = place;
        var cat = CATEGORIES.find(function(c) { return c.id === place.category; });

        document.getElementById('placeName').textContent = place.name;
        document.getElementById('placeImages').innerHTML = '<i class="' + (cat ? cat.icon : 'fas fa-map-marker-alt') + ' placeholder-img"></i>';
        document.getElementById('placeCategory').querySelector('span').textContent = cat ? cat.name : '';
        document.getElementById('placeAddress').querySelector('span').textContent = place.address || '暂无';
        document.getElementById('placePhone').querySelector('span').textContent = place.phone || '暂无';
        document.getElementById('placeHours').querySelector('span').textContent = place.hours || '暂无';
        document.getElementById('placeCoords').querySelector('span').textContent = place.lng.toFixed(6) + ', ' + place.lat.toFixed(6);
        document.getElementById('placeDesc').textContent = place.desc;

        var bookmarkBtn = document.getElementById('bookmarkPlace');
        var isBookmarked = bookmarkedPlaces.indexOf(place.id) !== -1;
        bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
        bookmarkBtn.innerHTML = isBookmarked ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';

        document.getElementById('placeDetail').classList.remove('hidden');
    }

    function hidePlaceDetail() {
        document.getElementById('placeDetail').classList.add('hidden');
        if (infoWindow) infoWindow.close();
    }

    // ========== 收藏功能 ==========
    function toggleBookmark(place) {
        var idx = bookmarkedPlaces.indexOf(place.id);
        var bookmarkBtn = document.getElementById('bookmarkPlace');

        if (idx === -1) {
            bookmarkedPlaces.push(place.id);
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            showToast('已收藏：' + place.name, 'success');
        } else {
            bookmarkedPlaces.splice(idx, 1);
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
            showToast('已取消收藏', 'info');
        }

        try {
            localStorage.setItem('ynnu_bookmarks', JSON.stringify(bookmarkedPlaces));
        } catch(e) {}
        renderBookmarks();
    }

    function loadBookmarks() {
        renderBookmarks();
    }

    function renderBookmarks() {
        var container = document.getElementById('bookmarkList');
        if (bookmarkedPlaces.length === 0) {
            container.innerHTML = '<div class="empty-hint"><i class="fas fa-bookmark"></i><p>暂无收藏，点击地点详情中的收藏按钮添加</p></div>';
            return;
        }

        container.innerHTML = bookmarkedPlaces.map(function(id) {
            var place = CAMPUS_PLACES.find(function(p) { return p.id === id; });
            if (!place) return '';
            var cat = CATEGORIES.find(function(c) { return c.id === place.category; });
            return '<div class="bookmark-item" data-place-id="' + place.id + '">' +
                '<div class="bm-icon" style="background:' + (cat ? cat.color : '#666') + '">' +
                    '<i class="' + (cat ? cat.icon : 'fas fa-map-marker-alt') + '"></i>' +
                '</div>' +
                '<div class="bm-info">' +
                    '<div class="bm-name">' + place.name + '</div>' +
                    '<div class="bm-cat">' + (cat ? cat.name : '') + '</div>' +
                '</div>' +
                '<button class="bm-del" data-id="' + place.id + '"><i class="fas fa-trash-alt"></i></button>' +
            '</div>';
        }).join('');

        container.querySelectorAll('.bookmark-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.bm-del')) return;
                var placeId = parseInt(this.dataset.placeId);
                var place = CAMPUS_PLACES.find(function(p) { return p.id === placeId; });
                if (place) {
                    flyToPlace(place);
                    showPlaceDetail(place);
                }
            });
        });

        container.querySelectorAll('.bm-del').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                bookmarkedPlaces = bookmarkedPlaces.filter(function(bid) { return bid !== id; });
                try { localStorage.setItem('ynnu_bookmarks', JSON.stringify(bookmarkedPlaces)); } catch(e) {}
                renderBookmarks();
                showToast('已取消收藏', 'info');
            });
        });
    }

    // ========== 分享功能 ==========
    function sharePlace(place) {
        var url = 'https://uri.amap.com/marker?position=' + place.lng + ',' + place.lat + '&name=' + encodeURIComponent(place.name) + '&callnative=0';
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(function() {
                showToast('链接已复制，可分享给好友', 'success');
            }).catch(function() {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    }

    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('链接已复制，可分享给好友', 'success');
        } catch(e) {
            showToast('复制失败，请手动复制链接', 'error');
        }
        document.body.removeChild(textarea);
    }

    // ========== 新生指南 ==========
    function showGuide(guideKey) {
        var guide = GUIDE_DATA[guideKey];
        if (!guide) return;

        document.getElementById('guideTitle').textContent = guide.title;
        var html = guide.content;

        if (guide.places && guide.places.length > 0) {
            html += '<div class="guide-place-list">';
            guide.places.forEach(function(id) {
                var place = CAMPUS_PLACES.find(function(p) { return p.id === id; });
                if (place) {
                    var cat = CATEGORIES.find(function(c) { return c.id === place.category; });
                    html += '<div class="guide-place-item" data-place-id="' + place.id + '">' +
                        '<i class="' + (cat ? cat.icon : 'fas fa-map-marker-alt') + '"></i>' +
                        '<span>' + place.name + '</span>' +
                        '<i class="fas fa-chevron-right guide-arrow"></i>' +
                    '</div>';
                }
            });
            html += '</div>';
        }

        document.getElementById('guideContent').innerHTML = html;

        document.querySelectorAll('.guide-place-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var placeId = parseInt(this.dataset.placeId);
                var place = CAMPUS_PLACES.find(function(p) { return p.id === placeId; });
                if (place) {
                    flyToPlace(place);
                    showPlaceDetail(place);
                }
            });
        });

        closeAllPanels();
        document.getElementById('guidePanel').classList.remove('hidden');
    }

    // ========== 快捷功能处理 ==========
    function handleQuickAction(action) {
        switch(action) {
            case 'navigate':
                togglePanel('navPanel');
                break;
            case 'nearby':
                togglePanel('nearbyPanel');
                break;
            case 'panorama':
                var center = currentPlace ? [currentPlace.lng, currentPlace.lat] : CAMPUS_CENTER;
                window.open('https://uri.amap.com/marker?position=' + center[0] + ',' + center[1] + '&callnative=1', '_blank');
                showToast('正在打开高德地图查看全景', 'info');
                break;
            case 'measure':
                measureMode = 'distance';
                togglePanel('measurePanel');
                break;
            case 'bookmark':
                togglePanel('bookmarkPanel');
                break;
            case 'share':
                if (currentPlace) {
                    sharePlace(currentPlace);
                } else {
                    var url = 'https://uri.amap.com/marker?position=' + CAMPUS_CENTER[0] + ',' + CAMPUS_CENTER[1] + '&name=' + encodeURIComponent('云南师范大学呈贡校区') + '&callnative=0';
                    fallbackCopy(url);
                    showToast('校园位置链接已复制', 'success');
                }
                break;
        }
    }

    // ========== 地图工具栏 ==========
    function initMapTools() {
        document.getElementById('zoomIn').addEventListener('click', function() { map.zoomIn(); });
        document.getElementById('zoomOut').addEventListener('click', function() { map.zoomOut(); });

        document.getElementById('resetView').addEventListener('click', function() {
            map.setZoomAndCenter(CAMPUS_ZOOM, CAMPUS_CENTER);
            showToast('已复位到校园中心', 'info');
        });

        document.getElementById('myLocation').addEventListener('click', function() {
            if (!geolocation) {
                showToast('定位服务尚未就绪，请稍候', 'error');
                return;
            }
            geolocation.getCurrentPosition(function(status, result) {
                if (status === 'complete') {
                    map.setZoomAndCenter(17, [result.position.lng, result.position.lat]);
                    showToast('已定位到当前位置', 'success');
                } else {
                    showToast('定位失败，请检查定位权限', 'error');
                }
            });
        });

        document.getElementById('locateBtn').addEventListener('click', function() {
            map.setZoomAndCenter(CAMPUS_ZOOM, CAMPUS_CENTER);
        });

        document.getElementById('fullscreenBtn').addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(function(){});
            } else {
                document.exitFullscreen();
            }
        });
    }

    // ========== 辅助函数 ==========
    function flyToPlace(place) {
        map.setZoomAndCenter(18, [place.lng, place.lat], false, 500);
    }

    function openNavPanel(fromPlace, toPlace) {
        closeAllPanels();

        if (fromPlace) {
            navStartPoint = [fromPlace.lng, fromPlace.lat];
            document.getElementById('navStart').value = fromPlace.name;
        } else {
            navStartPoint = null;
            document.getElementById('navStart').value = '';
        }

        // 终点由用户手动输入搜索，不再自动填充
        navEndPoint = null;
        document.getElementById('navEnd').value = '';

        document.getElementById('navResult').style.display = 'none';
        document.getElementById('navPanel').classList.remove('hidden');

        // 自动聚焦终点输入框，方便用户输入
        setTimeout(function() {
            document.getElementById('navEnd').focus();
        }, 300);
    }

    function togglePanel(panelId) {
        var panel = document.getElementById(panelId);
        var wasHidden = panel.classList.contains('hidden');
        closeAllPanels();
        if (wasHidden) {
            panel.classList.remove('hidden');
        }
    }

    function closeAllPanels() {
        document.querySelectorAll('.float-panel').forEach(function(p) { p.classList.add('hidden'); });
    }

    function formatDistance(meters) {
        if (meters >= 1000) {
            return (meters / 1000).toFixed(1) + '公里';
        }
        return Math.round(meters) + '米';
    }

    function formatArea(sqMeters) {
        if (sqMeters >= 1000000) {
            return (sqMeters / 1000000).toFixed(2) + '平方公里';
        }
        return Math.round(sqMeters) + '平方米';
    }

    function formatTime(seconds) {
        if (seconds >= 3600) {
            var hours = Math.floor(seconds / 3600);
            var mins = Math.ceil((seconds % 3600) / 60);
            return hours + '小时' + (mins > 0 ? mins + '分钟' : '');
        }
        return Math.max(1, Math.ceil(seconds / 60)) + '分钟';
    }

    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;

        var icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = '<i class="' + (icons[type] || icons.info) + '"></i> ' + message;
        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('toast-exit');
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ========== 暴露全局函数 ==========
    window._appNavTo = function(placeId) {
        // 打开导航面板，让用户手动输入终点（使用底图准确位置）
        openNavPanel(null, null);
        // 将地点名称预填到终点输入框，触发搜索
        var place = CAMPUS_PLACES.find(function(p) { return p.id === placeId; });
        if (place) {
            document.getElementById('navEnd').value = place.name;
            searchNavEnd(place.name, document.getElementById('navEndSuggestions'));
        }
        hidePlaceDetail();
    };

    window._appShowDetail = function(placeId) {
        var place = CAMPUS_PLACES.find(function(p) { return p.id === placeId; });
        if (place) {
            showPlaceDetail(place);
        }
    };

    // ========== 启动 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
