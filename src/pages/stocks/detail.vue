<template>
  <view class="container">
    <!-- 顶部股票信息 -->
    <view class="app-header" style="padding-bottom: 8px;">
      <view style="display:flex; align-items:center; gap:8px;">
        <text class="app-title" style="font-size:1.1rem;">{{ info.name }}</text>
        <text style="font-size:0.8rem; color:#64748b;">{{ code }}</text>
        <text v-if="info.sector" style="font-size:0.72rem; background:rgba(99,102,241,0.2); color:#a5b4fc; padding:2px 8px; border-radius:10px;">{{ info.sector }}</text>
      </view>
      <view style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
        <text v-if="info.price" style="font-size:1.2rem; font-weight:700; color:#f8fafc;">¥ {{ info.price }}</text>
        <text v-if="info.status === 'pending_long'" class="tag tag-pending-long">蓄势多 🔶</text>
        <text v-if="info.status === 'pending_short'" class="tag tag-pending-short">蓄势空 🔻</text>
      </view>
    </view>

    <!-- KDJ 最新值 -->
    <view v-if="info.kdj" class="card" style="margin-bottom:12px; padding:10px 14px;">
      <view style="display:flex; gap:20px;">
        <text style="font-size:0.8rem; color:#94a3b8;">KDJ（日线）</text>
        <text style="color:#f59e0b;">K {{ Number(info.kdj.K || 0).toFixed(1) }}</text>
        <text style="color:#22c55e;">D {{ Number(info.kdj.D || 0).toFixed(1) }}</text>
        <text style="color:#818cf8;">J {{ Number(info.kdj.J || 0).toFixed(1) }}</text>
        <text style="color:#94a3b8;">{{ info.kdj.pattern || '' }}</text>
      </view>
    </view>

    <!-- 季度高低标注 -->
    <view v-if="info.quarters && info.quarters.length" class="card" style="margin-bottom:12px; padding:10px 14px;">
      <text style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:6px;">季度高低点</text>
      <view style="display:flex; gap:16px;">
        <view v-for="q in info.quarters" :key="q.quarter" style="text-align:center;">
          <text style="font-size:0.72rem; color:#64748b; display:block;">{{ q.quarter }}</text>
          <text style="font-size:0.8rem; color:#22c55e; display:block;">高 {{ q.q_high }}</text>
          <text style="font-size:0.8rem; color:#ef4444; display:block;">低 {{ q.q_low }}</text>
        </view>
      </view>
    </view>

    <!-- K 线图（H5 使用 ECharts） -->
    <!-- #ifdef H5 -->
    <view class="card" style="margin-bottom:12px; padding:10px 14px;">
      <text style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">K 线图（近60交易日）</text>
      <div id="klineChart" style="width:100%; height:280px;"></div>
    </view>

    <view class="card" style="margin-bottom:12px; padding:10px 14px;">
      <text style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">KDJ 指标</text>
      <div id="kdjChart" style="width:100%; height:160px;"></div>
    </view>
    <!-- #endif -->

    <!-- 小程序：使用 uCharts -->
    <!-- #ifndef H5 -->
    <view class="card" style="margin-bottom:12px; padding:10px 14px;">
      <text style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">K 线图（近60交易日）</text>
      <qiun-data-charts
        type="candle"
        :opts="klineOpts"
        :chartData="klineChartData"
        style="width:100%; height:280px;"
      />
    </view>
    <view class="card" style="margin-bottom:12px; padding:10px 14px;">
      <text style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:8px;">KDJ 指标</text>
      <qiun-data-charts
        type="line"
        :opts="kdjOpts"
        :chartData="kdjChartData"
        style="width:100%; height:160px;"
      />
    </view>
    <!-- #endif -->

    <!-- 加载中 -->
    <view v-if="loading" style="text-align:center; padding:40px 0; color:#64748b;">
      <text>正在加载 K 线数据…</text>
    </view>

    <!-- 暂无数据 -->
    <view v-if="!loading && !klines.length" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无 K 线数据</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StockDetailPage',
  data() {
    return {
      code: '',
      info: {},
      klines: [],
      loading: true,
      klineChartData: {},
      kdjChartData: {},
      klineOpts: {
        color: ['#ef4444', '#22c55e'],
        padding: [5, 10, 5, 10],
        enableScroll: true,
        xAxis: { disableGrid: true, labelCount: 5, itemCount: 30 },
        yAxis: { gridType: 'dash', dashLength: 2 },
        legend: { show: false },
        extra: { candle: { } }
      },
      kdjOpts: {
        color: ['#f59e0b', '#22c55e', '#818cf8'],
        padding: [5, 10, 5, 10],
        enableScroll: true,
        xAxis: { disableGrid: true, labelCount: 5, itemCount: 30 },
        yAxis: { gridType: 'dash', dashLength: 2 },
        legend: { show: true }
      },
    };
  },
  onLoad(options) {
    this.code = options.code || '';
    this._loadKline();
  },
  methods: {
    async _loadKline() {
      if (!this.code) return;
      this.loading = true;
      try {
        await new Promise((resolve, reject) => {
          uni.request({
            url: `http://175.24.131.147:8000/api/stocks/kline/${this.code}`,
            method: 'GET',
            timeout: 8000,
            success: (res) => {
              if (res.statusCode === 200 && res.data?.code === 0) {
                const d = res.data.data;
                this.info   = d;
                this.klines = d.klines || [];
                this._buildChartData();
                resolve();
              } else {
                reject(new Error('API 异常'));
              }
            },
            fail: reject
          });
        });
      } catch (e) {
        uni.showToast({ title: 'K 线加载失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    _buildChartData() {
      const recent = this.klines.slice(-60); // 最近 60 根日线
      if (!recent.length) return;

      const categories = recent.map(k => k.date?.substring(5) || ''); // 截取 MM-DD

      // 蜡烛图数据 [open, close, low, high]
      const candleData = recent.map(k => [k.open, k.close, k.low, k.high]);

      this.klineChartData = {
        categories,
        series: [{ name: 'K线', data: candleData }]
      };

      // KDJ 折线数据
      const kArr = recent.map(k => Number((k.K || 0).toFixed(2)));
      const dArr = recent.map(k => Number((k.D || 0).toFixed(2)));
      const jArr = recent.map(k => Number((k.J || 0).toFixed(2)));

      this.kdjChartData = {
        categories,
        series: [
          { name: 'K', data: kArr },
          { name: 'D', data: dArr },
          { name: 'J', data: jArr },
        ]
      };

      // H5 下用 ECharts 渲染
      // #ifdef H5
      this.$nextTick(() => { this._renderH5(); });
      // #endif
    },

    // #ifdef H5
    _renderH5() {
      const recent = this.klines.slice(-60);
      if (typeof echarts === 'undefined' || !recent.length) return;

      const dates    = recent.map(k => k.date?.substring(5));
      const candles  = recent.map(k => [k.open, k.close, k.low, k.high]);
      const kArr     = recent.map(k => Number((k.K || 0).toFixed(2)));
      const dArr     = recent.map(k => Number((k.D || 0).toFixed(2)));
      const jArr     = recent.map(k => Number((k.J || 0).toFixed(2)));

      const bgColor = '#0f172a';
      const textColor = '#94a3b8';
      const baseOpts = {
        backgroundColor: bgColor,
        textStyle: { color: textColor, fontSize: 11 },
      };

      const klineEl = document.getElementById('klineChart');
      if (klineEl) {
        const chart = echarts.init(klineEl, 'dark');
        chart.setOption({
          ...baseOpts,
          grid: { left: 50, right: 10, top: 10, bottom: 30 },
          xAxis: { type: 'category', data: dates, axisLabel: { color: textColor } },
          yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { color: '#1e293b' } } },
          series: [{
            type: 'candlestick',
            data: candles,
            itemStyle: { color: '#ef4444', color0: '#22c55e', borderColor: '#ef4444', borderColor0: '#22c55e' }
          }]
        });
      }

      const kdjEl = document.getElementById('kdjChart');
      if (kdjEl) {
        const chart2 = echarts.init(kdjEl, 'dark');
        chart2.setOption({
          ...baseOpts,
          grid: { left: 50, right: 10, top: 10, bottom: 30 },
          legend: { textStyle: { color: textColor } },
          xAxis: { type: 'category', data: dates, axisLabel: { color: textColor } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b' } } },
          series: [
            { name: 'K', type: 'line', data: kArr, smooth: true, lineStyle: { color: '#f59e0b' }, showSymbol: false },
            { name: 'D', type: 'line', data: dArr, smooth: true, lineStyle: { color: '#22c55e' }, showSymbol: false },
            { name: 'J', type: 'line', data: jArr, smooth: true, lineStyle: { color: '#818cf8' }, showSymbol: false },
          ]
        });
      }
    },
    // #endif
  }
};
</script>
