<template>
  <view class="container">
    <view class="app-header">
      <text class="app-title">📈 期货行情</text>
      <text class="app-subtitle">周线行情 & KDJ 指标（主力 + 次主力）</text>
    </view>

    <!-- 摘要栏 -->
    <view class="summary-bar">
      <view class="summary-item">
        <text class="summary-label">品种数</text>
        <text class="summary-value">{{ summary.total }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">主力多头</text>
        <text class="summary-value bullish">{{ summary.mainBullish }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">主力空头</text>
        <text class="summary-value bearish">{{ summary.mainBearish }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">次主力多头</text>
        <text class="summary-value bullish">{{ summary.subBullish }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">次主力空头</text>
        <text class="summary-value bearish">{{ summary.subBearish }}</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <button
        :class="['filter-btn', currentFilter === 'all' ? 'active' : '']"
        @tap="setFilter('all')"
      >全部</button>
      <button
        :class="['filter-btn', currentFilter === 'pending' ? 'active' : '']"
        @tap="setFilter('pending')"
      >🔶 S2: 蓄势</button>
      <button
        :class="['filter-btn', currentFilter === 'bullish' ? 'active' : '']"
        @tap="setFilter('bullish')"
      >📈 多头</button>
      <button
        :class="['filter-btn', currentFilter === 'bearish' ? 'active' : '']"
        @tap="setFilter('bearish')"
      >📉 空头</button>
    </view>

    <!-- 品种卡片列表 -->
    <view v-if="displayList.length > 0">
      <view
        v-for="future in displayList"
        :key="future.code"
        class="futures-card"
        @tap="openChart(future)"
      >
        <view class="futures-card-header">
          <text class="futures-name">{{ future.name }}</text>
          <text class="futures-code">{{ future.code }}</text>
        </view>
        <view class="contracts-container">
          <!-- 主力合约 -->
          <view :class="['contract-box', 'main', getIsPending(future.main) ? 'pending-highlight' : '']">
            <view class="contract-label">
              <text>主力合约</text>
              <text class="contract-symbol">{{ future.main?.symbol || '' }}</text>
            </view>
            <template v-if="future.main">
              <text class="contract-price">{{ getLatestClose(future.main) }}</text>
              <view class="kdj-mini">
                <text class="kdj-k">K: {{ future.main.latestKDJ?.K?.toFixed(1) }}</text>
                <text class="kdj-d">D: {{ future.main.latestKDJ?.D?.toFixed(1) }}</text>
                <text class="kdj-j">J: {{ future.main.latestKDJ?.J?.toFixed(1) }}</text>
              </view>
              <text :class="['kdj-pattern-badge', getPatternClass(future.main.latestKDJ?.pattern)]">
                {{ future.main.latestKDJ?.pattern }}
              </text>
              <view style="margin-top: 4px;">
                <text v-for="tag in getRuleTags(future.main)" :key="tag.key" :class="['tag', tag.cls]" style="margin-right: 4px;">{{ tag.label }}</text>
              </view>
              <!-- 蓄势内联计算 -->
              <view v-if="getIsPending(future.main)" class="pending-calc" @tap.stop>
                <view class="pending-row">
                  <text class="pending-label">{{ getPendingLabel(future.main) }}:</text>
                  <text class="pending-value">{{ getBreakoutPrice(future.main) }}</text>
                </view>
                <view class="pending-row">
                  <text class="pending-label">止损价格:</text>
                  <text class="pending-value">{{ getStopPrice(future.main) }}</text>
                </view>
                <view class="pending-calc-row">
                  <text style="color: #94a3b8; font-size: 0.75rem;">风险(¥):</text>
                  <input
                    class="pending-risk-input"
                    type="digit"
                    :value="pendingRisk[future.code + '_main'] || ''"
                    :data-key="future.code + '_main'"
                    @input="onPendingRiskInput"
                    placeholder="3000"
                    @tap.stop
                  />
                  <button
                    class="pending-calc-btn"
                    @tap.stop="calcPending(future, 'main')"
                  >计算</button>
                </view>
                <view v-if="pendingResult[future.code + '_main']" class="pending-result">
                  {{ pendingResult[future.code + '_main'] }}
                </view>
              </view>
            </template>
            <template v-else>
              <text style="color: #475569; font-size: 0.82rem;">暂无数据</text>
            </template>
          </view>

          <!-- 次主力合约 -->
          <view :class="['contract-box', 'sub', getIsPending(future.sub) ? 'pending-highlight' : '']">
            <view class="contract-label">
              <text>次主力合约</text>
              <text class="contract-symbol">{{ future.sub?.symbol || '' }}</text>
            </view>
            <template v-if="future.sub">
              <text class="contract-price">{{ getLatestClose(future.sub) }}</text>
              <view class="kdj-mini">
                <text class="kdj-k">K: {{ future.sub.latestKDJ?.K?.toFixed(1) }}</text>
                <text class="kdj-d">D: {{ future.sub.latestKDJ?.D?.toFixed(1) }}</text>
                <text class="kdj-j">J: {{ future.sub.latestKDJ?.J?.toFixed(1) }}</text>
              </view>
              <text :class="['kdj-pattern-badge', getPatternClass(future.sub.latestKDJ?.pattern)]">
                {{ future.sub.latestKDJ?.pattern }}
              </text>
              <view style="margin-top: 4px;">
                <text v-for="tag in getRuleTags(future.sub)" :key="tag.key" :class="['tag', tag.cls]" style="margin-right: 4px;">{{ tag.label }}</text>
              </view>
              <view v-if="getIsPending(future.sub)" class="pending-calc" @tap.stop>
                <view class="pending-row">
                  <text class="pending-label">{{ getPendingLabel(future.sub) }}:</text>
                  <text class="pending-value">{{ getBreakoutPrice(future.sub) }}</text>
                </view>
                <view class="pending-row">
                  <text class="pending-label">止损价格:</text>
                  <text class="pending-value">{{ getStopPrice(future.sub) }}</text>
                </view>
                <view class="pending-calc-row">
                  <text style="color: #94a3b8; font-size: 0.75rem;">风险(¥):</text>
                  <input
                    class="pending-risk-input"
                    type="digit"
                    :value="pendingRisk[future.code + '_sub'] || ''"
                    :data-key="future.code + '_sub'"
                    @input="onPendingRiskInput"
                    placeholder="3000"
                    @tap.stop
                  />
                  <button
                    class="pending-calc-btn"
                    @tap.stop="calcPending(future, 'sub')"
                  >计算</button>
                </view>
                <view v-if="pendingResult[future.code + '_sub']" class="pending-result">
                  {{ pendingResult[future.code + '_sub'] }}
                </view>
              </view>
            </template>
            <template v-else>
              <text style="color: #475569; font-size: 0.82rem;">暂无数据</text>
            </template>
          </view>
        </view>
        <view class="update-time">
          更新: {{ future.main?.lastUpdate || future.sub?.lastUpdate || '-' }}
          <text style="color: #6366f1; margin-left: 8px;">📉 点击查看周线图</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无数据</text>
      <text style="color: #475569; font-size: 0.8rem; margin-top: 6px;">运行 fetch_futures.py 获取行情数据</text>
    </view>

    <!-- K 线图弹窗（H5 端使用，小程序端在新页面显示） -->
    <!-- #ifdef H5 -->
    <view v-if="showChartModal" class="chart-modal-overlay" @tap.self="showChartModal = false">
      <view class="chart-modal-box">
        <view class="chart-modal-header">
          <text class="chart-modal-title">{{ chartTitle }}</text>
          <view style="display:flex; gap:8px;">
            <button :class="['filter-btn', chartType === 'main' ? 'active' : '']" style="padding:4px 10px; font-size:0.82rem;" @tap="switchChart('main')">主力</button>
            <button :class="['filter-btn', chartType === 'sub' ? 'active' : '']" style="padding:4px 10px; font-size:0.82rem;" @tap="switchChart('sub')">次主力</button>
            <text @tap="showChartModal = false" style="color: #94a3b8; font-size: 1.5rem; cursor: pointer; line-height:1;">×</text>
          </view>
        </view>
        <!-- ECharts 容器（H5） -->
        <view id="h5ChartContainer" style="width:100%; height:500px;"></view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import { futuresData } from '@/data/futures_specs.js';
import { calcPendingPosition } from '@/utils/calculator.js';

// 动态加载期货行情数据（约 386KB，已追加 ES export）
let _FUTURES_DATA = null;
function getFuturesData() {
  if (!_FUTURES_DATA) {
    try {
      _FUTURES_DATA = require('@/data/futures_data.js').FUTURES_DATA || {};
    } catch (e) {
      console.warn('[futures] 数据加载失败:', e);
      _FUTURES_DATA = {};
    }
  }
  return _FUTURES_DATA;
}

export default {
  name: 'FuturesPage',
  data() {
    return {
      futuresList: [],
      currentFilter: 'all',
      summary: { total: 0, mainBullish: 0, mainBearish: 0, subBullish: 0, subBearish: 0 },
      // 蓄势内联计算器状态
      pendingRisk: {},
      pendingResult: {},
      // 图表
      showChartModal: false,
      chartTitle: '',
      chartType: 'main',
      currentFuture: null,
    };
  },
  computed: {
    displayList() {
      let list = this.futuresList;
      if (this.currentFilter === 'pending') {
        list = list.filter(f => this.getIsPending(f.main) || this.getIsPending(f.sub));
      } else if (this.currentFilter === 'bullish') {
        list = list.filter(f => f.main?.latestKDJ?.pattern?.includes('多头'));
      } else if (this.currentFilter === 'bearish') {
        list = list.filter(f => f.main?.latestKDJ?.pattern?.includes('空头'));
      }
      // 蓄势优先排序
      return list.sort((a, b) => {
        const pa = this.getIsPending(a.main) || this.getIsPending(a.sub);
        const pb = this.getIsPending(b.main) || this.getIsPending(b.sub);
        return pa === pb ? 0 : pa ? -1 : 1;
      });
    }
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    loadData() {
      const data = getFuturesData();
      this.futuresList = Object.values(data);
      this.calcSummary(data);
    },

    calcSummary(data) {
      let total = 0, mainBullish = 0, mainBearish = 0, subBullish = 0, subBearish = 0;
      Object.values(data).forEach(f => {
        total++;
        const mp = f.main?.latestKDJ?.pattern || '';
        if (mp.includes('多头')) mainBullish++;
        if (mp.includes('空头')) mainBearish++;
        const sp = f.sub?.latestKDJ?.pattern || '';
        if (sp.includes('多头')) subBullish++;
        if (sp.includes('空头')) subBearish++;
      });
      this.summary = { total, mainBullish, mainBearish, subBullish, subBearish };
    },

    setFilter(f) { this.currentFilter = f; },

    getPatternClass(pattern) {
      if (!pattern) return 'neutral';
      if (pattern.includes('多头')) return 'bullish';
      if (pattern.includes('空头')) return 'bearish';
      if (pattern.includes('超买')) return 'overbought';
      if (pattern.includes('超卖')) return 'oversold';
      return 'neutral';
    },

    getLatestClose(contract) {
      if (!contract?.data?.length) return '-';
      const last = contract.data[contract.data.length - 1];
      return last.close?.toFixed(1) || '-';
    },

    getIsPending(contract) {
      if (!contract?.latestKDJ?.custom_rule_2) return false;
      const rule = contract.latestKDJ.custom_rule_2;
      if (!rule.includes('pending')) return false;
      const k = contract.latestKDJ.K;
      const d = contract.latestKDJ.D;
      if (rule === 'pending_long') return k > d;
      if (rule === 'pending_short') return k < d;
      return false;
    },

    getRuleTags(contract) {
      if (!contract?.latestKDJ) return [];
      const tags = [];
      const kdj = contract.latestKDJ;
      if (kdj.custom_rule_1) {
        const map = { long: 'S1: 复苏', short: 'S1: 转弱' };
        const clsMap = { long: 'tag-long', short: 'tag-short' };
        tags.push({ key: 'r1', label: map[kdj.custom_rule_1] || kdj.custom_rule_1, cls: clsMap[kdj.custom_rule_1] || '' });
      }
      if (kdj.custom_rule_2) {
        const r2Map = { long: 'S2: 突破', short: 'S2: 破位', pending_long: 'S2: 蓄势', pending_short: 'S2: 蓄势' };
        const r2Cls = { long: 'tag-long', short: 'tag-short', pending_long: 'tag-pending-long', pending_short: 'tag-pending-short' };
        if (kdj.custom_rule_2.includes('pending')) {
          if (this.getIsPending(contract)) {
            tags.push({ key: 'r2', label: r2Map[kdj.custom_rule_2], cls: r2Cls[kdj.custom_rule_2] || '' });
          }
        } else {
          tags.push({ key: 'r2', label: r2Map[kdj.custom_rule_2] || kdj.custom_rule_2, cls: r2Cls[kdj.custom_rule_2] || '' });
        }
      }
      return tags;
    },

    getPendingLabel(contract) {
      return contract?.latestKDJ?.custom_rule_2 === 'pending_long' ? '突破买入' : '破位卖出';
    },

    getBreakoutPrice(contract) {
      if (!contract?.data?.length) return '-';
      const w2 = contract.data[contract.data.length - 2];
      if (!w2) return '-';
      const isLong = contract.latestKDJ?.custom_rule_2 === 'pending_long';
      return isLong ? w2.high?.toFixed(1) : w2.low?.toFixed(1);
    },

    onPendingRiskInput(e) {
      const key = e.currentTarget.dataset.key;
      this.pendingRisk[key] = e.detail.value;
    },

    getStopPrice(contract) {
      if (!contract?.data?.length) return '-';
      const w3 = contract.data[contract.data.length - 1];
      if (!w3) return '-';
      const isLong = contract.latestKDJ?.custom_rule_2 === 'pending_long';
      return isLong ? w3.low?.toFixed(1) : w3.high?.toFixed(1);
    },

    setPendingRisk(key, e) {
      this.pendingRisk[key] = e.detail?.value || '';
    },

    calcPending(future, contractType) {
      const contract = future[contractType];
      if (!contract) return;
      const key = `${future.code}_${contractType}`;
      const risk = parseFloat(this.pendingRisk[key]) || 3000;
      const spec = futuresData[future.code];
      if (!spec) { this.pendingResult[key] = '无品种规格'; return; }

      const breakout = parseFloat(this.getBreakoutPrice(contract));
      const stop = parseFloat(this.getStopPrice(contract));
      if (isNaN(breakout) || isNaN(stop)) return;

      const r = calcPendingPosition(breakout, stop, risk, spec);
      if (!r) { this.pendingResult[key] = '差价为0'; return; }

      this.pendingResult[key] = `建议 ${r.contracts} 手 | 风险 ¥${r.actualRisk.toFixed(0)} | 保证金 ¥${r.margin.toFixed(0)}`;
      // 触发响应式更新
      this.pendingResult = { ...this.pendingResult };
    },

    // ===== K 线图 =====
    openChart(future) {
      this.currentFuture = future;
      this.chartTitle = future.name;
      this.chartType = 'main';

      // #ifdef H5
      this.showChartModal = true;
      this.$nextTick(() => { this.renderH5Chart(); });
      // #endif

      // #ifndef H5
      // 小程序：跳转到图表页
      uni.navigateTo({ url: `/pages/futures/chart?code=${future.code}` });
      // #endif
    },

    switchChart(type) {
      this.chartType = type;
      // #ifdef H5
      this.renderH5Chart();
      // #endif
    },

    // #ifdef H5
    renderH5Chart() {
      if (typeof echarts === 'undefined') return;
      const contract = this.currentFuture?.[this.chartType];
      if (!contract?.data) return;

      const container = document.getElementById('h5ChartContainer');
      if (!container) return;

      let chart = echarts.getInstanceByDom(container);
      if (!chart) chart = echarts.init(container, 'dark');

      const data = contract.data;
      const dates = data.map(d => d.date);
      const kData = data.map(d => [d.open, d.close, d.low, d.high]);
      const kdjK = data.map(d => d.K?.toFixed(2));
      const kdjD = data.map(d => d.D?.toFixed(2));
      const kdjJ = data.map(d => d.J?.toFixed(2));

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['K线', 'K', 'D', 'J'], textStyle: { color: '#94a3b8' } },
        grid: [
          { left: '8%', right: '4%', bottom: '35%' },
          { left: '8%', right: '4%', height: '20%', bottom: '5%' }
        ],
        xAxis: [
          { type: 'category', data: dates, scale: true, boundaryGap: false, axisLine: { lineStyle: { color: '#334' } }, axisLabel: { color: '#64748b' } },
          { type: 'category', gridIndex: 1, data: dates, scale: true, boundaryGap: false, axisLabel: { show: false } }
        ],
        yAxis: [
          { scale: true, splitLine: { lineStyle: { color: '#1e2740' } }, axisLabel: { color: '#64748b' } },
          { scale: true, gridIndex: 1, splitLine: { lineStyle: { color: '#1e2740' } }, axisLabel: { color: '#64748b' } }
        ],
        series: [
          {
            name: 'K线',
            type: 'candlestick',
            data: kData,
            itemStyle: {
              color: '#22c55e',
              color0: '#ef4444',
              borderColor: '#22c55e',
              borderColor0: '#ef4444'
            }
          },
          { name: 'K', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: kdjK, lineStyle: { color: '#f59e0b', width: 1.5 }, showSymbol: false },
          { name: 'D', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: kdjD, lineStyle: { color: '#3b82f6', width: 1.5 }, showSymbol: false },
          { name: 'J', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: kdjJ, lineStyle: { color: '#a855f7', width: 1.5 }, showSymbol: false },
        ],
        dataZoom: [
          { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
          { type: 'slider', xAxisIndex: [0, 1], bottom: '0%', height: 20, start: 50, end: 100, borderColor: '#334', textStyle: { color: '#64748b' } }
        ]
      });
    }
    // #endif
  }
};
</script>

<style scoped>
/* H5 专属：图表弹窗 */
/* #ifdef H5 */
.chart-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.chart-modal-box {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 0;
  width: 95%;
  max-width: 1000px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}
.chart-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.chart-modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
}
/* #endif */
</style>
