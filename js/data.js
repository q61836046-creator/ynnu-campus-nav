/* ============================================
   云师大校园导航 - 校园数据
   ============================================ */

// 校园中心点（云南师范大学呈贡校区）
const CAMPUS_CENTER = [102.85334, 24.86158];
const CAMPUS_ZOOM = 16;

// 校园边界（呈贡校区实际范围，南门朝南，东区在东，西区在西）
const CAMPUS_BOUNDARY = [
    [102.84500, 24.85550],
    [102.84700, 24.85520],
    [102.84950, 24.85530],
    [102.85200, 24.85500],
    [102.85500, 24.85520],
    [102.85800, 24.85540],
    [102.86050, 24.85580],
    [102.86200, 24.85650],
    [102.86280, 24.85780],
    [102.86320, 24.85950],
    [102.86350, 24.86150],
    [102.86320, 24.86350],
    [102.86250, 24.86500],
    [102.86100, 24.86620],
    [102.85900, 24.86700],
    [102.85650, 24.86730],
    [102.85400, 24.86750],
    [102.85100, 24.86740],
    [102.84850, 24.86700],
    [102.84650, 24.86630],
    [102.84520, 24.86520],
    [102.84430, 24.86380],
    [102.84380, 24.86200],
    [102.84380, 24.85950],
    [102.84420, 24.85750],
    [102.84500, 24.85550]
];

// 地点分类配置
const CATEGORIES = [
    { id: 'teaching', name: '教学楼', icon: 'fas fa-chalkboard-teacher', color: '#1a73e8' },
    { id: 'lab', name: '实验楼', icon: 'fas fa-flask', color: '#7b1fa2' },
    { id: 'library', name: '图书馆', icon: 'fas fa-book-open', color: '#0d47a1' },
    { id: 'admin', name: '行政楼', icon: 'fas fa-building', color: '#455a64' },
    { id: 'dormitory', name: '宿舍楼', icon: 'fas fa-bed', color: '#e65100' },
    { id: 'canteen', name: '食堂', icon: 'fas fa-utensils', color: '#c62828' },
    { id: 'sports', name: '体育场馆', icon: 'fas fa-running', color: '#2e7d32' },
    { id: 'shop', name: '商业服务', icon: 'fas fa-store', color: '#f57f17' },
    { id: 'medical', name: '医疗', icon: 'fas fa-hospital', color: '#c62828' },
    { id: 'gate', name: '校门', icon: 'fas fa-door-open', color: '#546e7a' },
    { id: 'parking', name: '停车场', icon: 'fas fa-parking', color: '#37474f' },
    { id: 'scenic', name: '景观', icon: 'fas fa-tree', color: '#1b5e20' }
];

// 校园地点数据（坐标已修正至实际校区范围内）
const CAMPUS_PLACES = [
    // 教学楼 - 西区
    { id: 1, name: '明德楼', category: 'teaching', lng: 102.85000, lat: 24.86300, 
      address: '云南师范大学呈贡校区西区', phone: '', hours: '7:00-22:00',
      desc: '明德楼是学校主要教学楼之一，内设多个阶梯教室和多媒体教室，主要用于公共课程和大型讲座。' },
    { id: 2, name: '汇学楼', category: 'teaching', lng: 102.84920, lat: 24.86200,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '7:00-22:00',
      desc: '汇学楼为教学楼群，分为1-4栋，是本科教学的主要场所，配备先进多媒体教学设备。' },
    { id: 3, name: '汇文楼', category: 'teaching', lng: 102.84800, lat: 24.86150,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '7:00-22:00',
      desc: '汇文楼区位于西区，由四栋建筑联合组成，立面内凹弧形设计，架空两层利于通行。' },
    // 教学楼 - 东区
    { id: 4, name: '睿智楼', category: 'teaching', lng: 102.85700, lat: 24.86350,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '7:00-22:00',
      desc: '睿智楼区为理工科教学楼群，含睿智1-5号楼，分别归属物理、化学、生科、信息、地学等学院。' },
    { id: 5, name: '同析楼', category: 'teaching', lng: 102.85850, lat: 24.86250,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '7:00-22:00',
      desc: '同析楼区位于东区，含同析1-5号楼，包括华文学院、公共实验楼、数学学院等。' },
    { id: 6, name: '格物楼', category: 'teaching', lng: 102.85200, lat: 24.86250,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '7:00-22:00',
      desc: '格物楼主要用于理工科类教学，配备专业实验室和计算机机房。' },

    // 实验楼
    { id: 10, name: '化学实验楼', category: 'lab', lng: 102.85620, lat: 24.86420,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '8:00-18:00',
      desc: '化学实验楼配备标准化化学实验室，供化学与化工学院师生使用。' },
    { id: 11, name: '物理实验楼', category: 'lab', lng: 102.85750, lat: 24.86400,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '8:00-18:00',
      desc: '物理实验楼配备光学、力学、电磁学等实验室。' },
    { id: 12, name: '生物实验楼', category: 'lab', lng: 102.85880, lat: 24.86380,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '8:00-18:00',
      desc: '生物实验楼配备分子生物学、生态学等实验室及标本室。' },
    { id: 13, name: '信息技术实验楼', category: 'lab', lng: 102.85950, lat: 24.86300,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '8:00-22:00',
      desc: '信息技术实验楼配备高性能计算机房，供信息学院及地理信息科学专业使用。' },

    // 图书馆 - 南区
    { id: 20, name: '图书馆', category: 'library', lng: 102.85300, lat: 24.85980,
      address: '云南师范大学呈贡校区南区', phone: '0871-6591XXXX', hours: '8:00-22:00',
      desc: '云南师范大学图书馆呈贡馆是校园标志性建筑，馆藏纸本文献408万册、电子图书136万册，设有自习区、电子阅览室、研讨室等。' },

    // 行政楼 - 西区
    { id: 30, name: '行政楼', category: 'admin', lng: 102.84950, lat: 24.86480,
      address: '云南师范大学呈贡校区西区', phone: '0871-6591XXXX', hours: '8:30-17:30',
      desc: '学校行政办公中心，包含校长办公室、教务处、学生处、财务处等行政部门。新生报到、学籍注册等事务在此办理。' },
    { id: 31, name: '教务楼', category: 'admin', lng: 102.85050, lat: 24.86450,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '8:30-17:30',
      desc: '教务管理中心，负责课程安排、考试管理、成绩查询等事务。' },

    // 宿舍楼 - 东区
    { id: 40, name: '桃园宿舍区', category: 'dormitory', lng: 102.85900, lat: 24.86000,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '全天',
      desc: '桃园宿舍区为女生宿舍区，含桃1-桃6栋，四人间配备独立卫浴和阳台。' },
    { id: 41, name: '李苑宿舍区', category: 'dormitory', lng: 102.86050, lat: 24.85980,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '全天',
      desc: '李苑宿舍区含李1-李8栋，部分为男生宿舍，部分为女生宿舍。' },
    { id: 42, name: '梅园宿舍区', category: 'dormitory', lng: 102.86100, lat: 24.86080,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '全天',
      desc: '梅园宿舍区为男生宿舍区，含梅1-梅6栋。' },
    { id: 43, name: '竹苑宿舍区', category: 'dormitory', lng: 102.85800, lat: 24.85950,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '全天',
      desc: '竹苑宿舍区含竹1-竹4栋，部分为研究生宿舍。' },

    // 食堂
    { id: 50, name: '启园食堂（西区食堂）', category: 'canteen', lng: 102.84850, lat: 24.86280,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '6:30-21:00',
      desc: '西区主要食堂，设有各种特色小吃，环境整洁宽敞，价格实惠。' },
    { id: 51, name: '和园食堂（东区食堂）', category: 'canteen', lng: 102.85750, lat: 24.86120,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '6:30-21:00',
      desc: '东区主要食堂，提供菊花米线、酥壳洋芋、德宏风味等特色美食，包括清真窗口。' },
    { id: 52, name: '桃李餐厅', category: 'canteen', lng: 102.86000, lat: 24.86050,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '6:30-21:00',
      desc: '靠近宿舍区，方便学生就餐，特色小吃种类丰富。' },
    { id: 53, name: '教工餐厅', category: 'canteen', lng: 102.85050, lat: 24.86350,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '11:00-13:00, 17:00-19:00',
      desc: '教职工专用餐厅，学生也可在非高峰时段前往。菜品精致，环境优雅。' },

    // 体育场馆 - 西区
    { id: 60, name: '启园体育馆（飞碟体育馆）', category: 'sports', lng: 102.84750, lat: 24.86150,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '6:00-22:00',
      desc: '启园体育馆外形似飞碟，设有升降舞台，可进行篮球、羽毛球等运动，定期举办校际赛事和开学典礼。' },
    { id: 61, name: '田径场', category: 'sports', lng: 102.85600, lat: 24.86500,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '6:00-22:00',
      desc: '标准400米塑胶跑道田径场，含足球场，供体育课和课外锻炼使用。' },
    { id: 62, name: '游泳馆', category: 'sports', lng: 102.84850, lat: 24.86050,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '12:00-21:00',
      desc: '标准恒温游泳馆，需持校园卡购票入场，设有更衣室和淋浴间。' },
    { id: 63, name: '网球场', category: 'sports', lng: 102.84700, lat: 24.86250,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '6:00-22:00',
      desc: '室外网球场，共4块场地，需提前预约使用。' },
    { id: 64, name: '篮球场', category: 'sports', lng: 102.85650, lat: 24.86550,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '6:00-22:00',
      desc: '室外篮球场群，共8块场地，免费开放。' },

    // 商业服务
    { id: 70, name: '校园超市', category: 'shop', lng: 102.85350, lat: 24.86200,
      address: '云南师范大学呈贡校区中区', phone: '', hours: '7:00-22:00',
      desc: '校园内最大的综合超市，提供日用品、文具、零食等商品。' },
    { id: 71, name: '打印复印店', category: 'shop', lng: 102.85250, lat: 24.86220,
      address: '云南师范大学呈贡校区', phone: '', hours: '8:00-21:00',
      desc: '提供打印、复印、扫描、装订等服务，价格实惠。' },
    { id: 72, name: '快递服务中心', category: 'shop', lng: 102.85800, lat: 24.86100,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '9:00-20:00',
      desc: '集中收取各大快递公司包裹，凭取件码自助取件。' },
    { id: 73, name: '校园银行（建行ATM）', category: 'shop', lng: 102.85050, lat: 24.86300,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '全天（ATM）',
      desc: '建设银行自助服务区，提供存取款、转账等服务。' },
    { id: 74, name: '咖啡厅', category: 'shop', lng: 102.85150, lat: 24.86280,
      address: '云南师范大学呈贡校区', phone: '', hours: '8:00-22:00',
      desc: '校内咖啡厅，提供各类饮品和轻食，环境舒适，适合学习和聚会。' },
    { id: 75, name: '校园书店', category: 'shop', lng: 102.85100, lat: 24.86250,
      address: '云南师范大学呈贡校区', phone: '', hours: '9:00-21:00',
      desc: '校内书店，提供教材、参考书、文具等。' },

    // 医疗 - 西区
    { id: 80, name: '校医院', category: 'medical', lng: 102.84900, lat: 24.86400,
      address: '云南师范大学呈贡校区西区', phone: '0871-6591XXXX', hours: '8:00-22:00（急诊24小时）',
      desc: '校园医院，设有内科、外科、口腔科等科室，学生可凭医保卡就诊。急诊24小时开放。' },

    // 校门
    { id: 90, name: '正门（南门·和门）', category: 'gate', lng: 102.85300, lat: 24.85650,
      address: '云南师范大学呈贡校区南端', phone: '', hours: '全天',
      desc: '学校正门（和门），面对聚贤街，为校园主入口，校名石取材于大理苍山应乐峰，背面镌刻校训"刚毅坚卓"。' },
    { id: 91, name: '东门', category: 'gate', lng: 102.86150, lat: 24.86150,
      address: '云南师范大学呈贡校区东侧', phone: '', hours: '6:00-23:00',
      desc: '东门靠近宿舍区，方便学生出行，附近有商业街。' },
    { id: 92, name: '西门', category: 'gate', lng: 102.84550, lat: 24.86150,
      address: '云南师范大学呈贡校区西侧', phone: '', hours: '6:00-23:00',
      desc: '西门靠近体育场馆区，通往西侧道路。' },
    { id: 93, name: '北门', category: 'gate', lng: 102.85350, lat: 24.86600,
      address: '云南师范大学呈贡校区北侧', phone: '', hours: '6:00-23:00',
      desc: '北门通往后方道路，为后勤和教职工通行门。' },

    // 停车场
    { id: 100, name: '南门停车场', category: 'parking', lng: 102.85350, lat: 24.85680,
      address: '云南师范大学呈贡校区南门旁', phone: '', hours: '全天',
      desc: '南门外大型停车场，访客车辆可在此停放。' },
    { id: 101, name: '行政楼停车场', category: 'parking', lng: 102.84920, lat: 24.86520,
      address: '云南师范大学呈贡校区西区', phone: '', hours: '全天',
      desc: '行政楼旁停车场，主要为教职工使用。' },

    // 景观
    { id: 110, name: '南湖', category: 'scenic', lng: 102.85300, lat: 24.85880,
      address: '云南师范大学呈贡校区南区', phone: '', hours: '全天',
      desc: '南湖是校园南部景观湖，以南开大学命名，湖面开阔，四季景色各异，湖边设有休闲步道。' },
    { id: 111, name: '北潭', category: 'scenic', lng: 102.85350, lat: 24.86480,
      address: '云南师范大学呈贡校区', phone: '', hours: '全天',
      desc: '北潭以北京大学命名，环湖种植近千株红枫，秋季景色迷人，湖畔常有黑天鹅出没。' },
    { id: 112, name: '清溪', category: 'scenic', lng: 102.85320, lat: 24.86180,
      address: '云南师范大学呈贡校区', phone: '', hours: '全天',
      desc: '清溪以清华大学命名，连接南湖与北潭的水道，是校园内一道独特的风景线。' },
    { id: 113, name: '贝壳广场', category: 'scenic', lng: 102.85750, lat: 24.86180,
      address: '云南师范大学呈贡校区东区', phone: '', hours: '全天',
      desc: '贝壳广场位于东区，经常举办各类特色活动，是学生休闲聚会的热门场所。' }
];

// 新生指南内容
const GUIDE_DATA = {
    report: {
        title: '报到路线',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-train"></i> 从昆明站出发</h4>
                <p>1. 乘坐地铁1号线（环城南路-大学城南）到"大学城站"</p>
                <p>2. 出站后换乘Z56路公交到"云南师范大学站"</p>
                <p>3. 或乘坐出租车约15分钟到达学校正门</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-plane"></i> 从昆明长水机场出发</h4>
                <p>1. 乘坐机场大巴6号线到"呈贡新区"</p>
                <p>2. 换乘出租车约10分钟到达学校</p>
                <p>3. 或乘坐地铁6号线转1号线到"大学城站"</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-train"></i> 从昆明南站出发</h4>
                <p>1. 乘坐地铁1号线到"大学城站"（仅2站）</p>
                <p>2. 出站后步行约15分钟或乘公交到校</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-flag-checkered"></i> 到校后报到</h4>
                <p>报到点设置在学校正门广场，各学院设有接待处。请携带录取通知书、身份证、高考准考证等材料。志愿者将在校门口引导。</p>
            </div>
        `,
        places: [90]  // 南门
    },
    dorm: {
        title: '宿舍分布',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-bed"></i> 宿舍区概况</h4>
                <p>学校宿舍区主要分布在校园东侧，分为桃园、李苑、梅园、竹苑四个区域。宿舍一般为四人间，配有独立卫浴、热水器和网络接口。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-female"></i> 女生宿舍</h4>
                <p>桃园宿舍区（桃1-桃6栋）和李苑部分楼栋为女生宿舍。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-male"></i> 男生宿舍</h4>
                <p>梅园宿舍区（梅1-梅6栋）和李苑部分楼栋为男生宿舍。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-info-circle"></i> 注意事项</h4>
                <p>1. 入住时请检查房间设施，如有损坏及时报修</p>
                <p>2. 宿舍门禁时间为23:00</p>
                <p>3. 严禁使用大功率电器</p>
                <p>4. 水电费通过校园卡充值缴纳</p>
            </div>
        `,
        places: [40, 41, 42, 43]
    },
    dining: {
        title: '食堂指南',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-utensils"></i> 食堂概况</h4>
                <p>学校共有4个食堂，提供多种风味的餐饮选择。校园卡可在所有食堂使用，部分食堂支持微信/支付宝支付。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-star"></i> 推荐菜品</h4>
                <p>一食堂：过桥米线、汽锅鸡窗口（二楼特色）</p>
                <p>二食堂：云南小锅米线、烤鱼窗口</p>
                <p>三食堂：各类小吃、砂锅饭</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-clock"></i> 就餐时间</h4>
                <p>早餐：6:30-9:00</p>
                <p>午餐：11:00-13:00</p>
                <p>晚餐：17:00-19:00</p>
                <p>夜宵：19:00-21:00（部分窗口）</p>
            </div>
        `,
        places: [50, 51, 52, 53]
    },
    study: {
        title: '学习场所',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-book-open"></i> 图书馆</h4>
                <p>图书馆是最佳学习场所，设有自习区、电子阅览室等。期末考试期间开放时间延长。需刷校园卡入馆。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-chalkboard-teacher"></i> 空闲教室</h4>
                <p>非上课时间的教学楼教室可自由使用，格物楼和汇学楼通常有较多空闲教室。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-coffee"></i> 其他学习空间</h4>
                <p>校内咖啡厅、各学院自习室也是不错的自习选择。</p>
            </div>
        `,
        places: [20, 1, 2, 3, 74]
    },
    sport: {
        title: '运动健身',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-running"></i> 运动设施</h4>
                <p>学校提供丰富的运动场地，包括田径场、体育馆、游泳馆、网球场、篮球场等，基本满足各类运动需求。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-swimmer"></i> 游泳馆</h4>
                <p>需购票入场，学生票价优惠。开放时间：12:00-21:00。请自带泳衣泳帽。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-calendar-alt"></i> 体育课选课</h4>
                <p>大一需修体育必修课，可选篮球、足球、羽毛球、游泳、瑜伽等项目。每学期初在教务系统选课。</p>
            </div>
        `,
        places: [60, 61, 62, 63, 64]
    },
    life: {
        title: '生活服务',
        content: `
            <div class="guide-section">
                <h4><i class="fas fa-shopping-cart"></i> 购物</h4>
                <p>校内设有校园超市，日用品一应俱全。东门外商业街有更多选择。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-box"></i> 快递</h4>
                <p>快递服务中心集中收取包裹，凭取件码自助取件。地址填写：云南省昆明市呈贡区云南师范大学XX宿舍XX号。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-hospital"></i> 医疗</h4>
                <p>校医院提供基本医疗服务，急诊24小时开放。建议办理城镇居民医疗保险。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-print"></i> 打印复印</h4>
                <p>校内打印店价格实惠，也可在图书馆自助打印。</p>
            </div>
            <div class="guide-section">
                <h4><i class="fas fa-university"></i> 银行</h4>
                <p>校内设有建设银行ATM，正门附近有建设银行网点。校园卡充值可通过线上完成。</p>
            </div>
        `,
        places: [70, 72, 80, 71, 73]
    }
};

// 热门地点ID列表
const HOT_PLACE_IDS = [20, 50, 90, 110, 1, 2, 40, 70, 60, 80];
