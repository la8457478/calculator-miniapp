<template>
  <view class="container">
    <!-- 头部标题 + 合约切换 -->
    <view class="app-header" style="padding-bottom: 0;">
      <text class="app-title">{{ name }} 周K线</text>
    </view>

    <!-- 合约切换 Tabs -->
    <view class="mode-selector" style="margin: 12px 0;">
      <button
        :class="['mode-btn', contractType === 'main' ? 'active' : '']"
        @tap="switchContract('main')"
      >主力合约 {{ mainSymbol }}</button>
      <button
        v-if="hasSubData"
        :class="['mode-btn', contractType === 'sub' ? 'active' : '']"
        @tap="switchContract('sub')"
      >次主力 {{ subSymbol }}</button>
    </view>

    <!-- KDJ 信息栏 -->
    <view v-if="currentKDJ" class="card" style="padding: 10px 14px; margin-bottom: 12px;">
      <view style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <text class="kdj-k">K: {{ currentKDJ.K?.toFixed(1) }}</text>
        <text class="kdj-d">D: {{ currentKDJ.D?.toFixed(1) }}</text>
        <text class="kdj-j">J: {{ currentKDJ.J?.toFixed(1) }}</text>
        <text :class="['kdj-pattern-badge', patternClass]">{{ currentKDJ.pattern }}</text>
      </view>
    </view>

    <!-- K 线图 -->
    <view v-if="chartReady" class="card" style="padding: 8px;">
      <qiun-data-charts
        type="candle"
        :chartData="candleChartData"
        :opts="candleOpts"
        canvasId="futuresCandle"
        style="height: 280px; width: 100%;"
      />
    </view>

    <!-- KDJ 线图 -->
    <view v-if="chartReady" class="card" style="padding: 8px; margin-top: 8px;">
      <text style="color: #64748b; font-size: 0.78rem; margin-bottom: 4px; display: block;">KDJ 指标</text>
      <qiun-data-charts
        type="line"
        :chartData="kdjChartData"
        :opts="kdjOpts"
        canvasId="futuresKDJ"
        style="height: 160px; width: 100%;"
      />
    </view>

    <!-- 空状态 -->
    <view v-if="!chartReady" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无 K 线数据</text>
    </view>

    <!-- 数据更新时间 -->
    <view v-if="lastUpdate" class="update-time" style="padding: 8px 0;">
      更新时间: {{ lastUpdate }}
    </view>
  </view>
</template>

<script>
import { FUTURES_DATA as localData } from '@/data/futures_data.js';

// reuse across page lifecycle
let cachedFuturesData = null;
function getFuturesData() {
  if (!cachedFuturesData) {
    cachedFuturesData = localData || {};
  }
  return cachedFuturesData;
}

export default {
  name: 'FuturesChartPage',
  data() {
    return {
      code: '',
      name: '',
      contractType: 'main',
      mainSymbol: '',
      subSymbol: '',
      hasSubData: false,
      currentKDJ: null,
      patternClass: 'neutral',
      chartReady: false,
      lastUpdate: '',
      // uCharts 数据
      candleChartData: { categories: [], series: [] },
      kdjChartData: { categories: [], series: [] },
      // uCharts 配置
      candleOpts: {
        color: ['#22c55e', '#ef4444'],
        padding: [15, 10, 0, 0],
        enableScroll: true,
        xAxis: {
          disableGrid: false,
          labelCount: 5,
          fontSize: 10,
          fontColor: '#64748b',
          scrollPosition: 'right',
        },
        yAxis: {
          fontSize: 10,
          fontColor: '#64748b',
          format: (val) => val.toFixed(1),
        },
        legend: { show: false },
        extra: {
          candle: {
            color: {
              upLine: '#22c55e',
              upFill: '#22c55e',
              downLine: '#ef4444',
              downFill: '#ef4444'
            },
            average: { show: false },
          }
        }
      },
      kdjOpts: {
        color: ['#f59e0b', '#3b82f6', '#a855f7'],
        padding: [15, 15, 10, 5],
        enableScroll: false,
        dataPointShape: false,
        xAxis: {
          disableGrid: false,
          labelCount: 4,
          fontSize: 10,
          fontColor: '#64748b',
        },
        yAxis: {
          fontSize: 10,
          fontColor: '#64748b',
          gridType: 'dash',
        },
        legend: {
          show: true,
          position: 'top',
          lineHeight: 20,
          fontSize: 11,
          fontColor: '#94a3b8',
        },
        extra: {
          line: {
            type: 'straight',
            width: 2,
          }
        }
      }
    };
  },
  onLoad(options) {
    this.code = options.code || '';
    this.buildChart();
  },
  methods: {
    buildChart() {
      const all = getFuturesData();
      const entry = all[this.code];
      if (!entry) return;

      this.name = entry.name || this.code;
      this.hasSubData = !!entry.sub?.data?.length;
      this.mainSymbol = entry.main?.symbol || '';
      this.subSymbol = entry.sub?.symbol || '';

      this.renderContract(entry, this.contractType);
    },

    switchContract(type) {
      this.contractType = type;
      const all = getFuturesData();
      const entry = all[this.code];
      if (entry) this.renderContract(entry, type);
    },

    renderContract(entry, type) {
      const contract = entry[type];
      if (!contract?.data?.length) {
        this.chartReady = false;
        return;
      }

      const rawData = contract.data;
      this.lastUpdate = contract.lastUpdate || '';
      this.currentKDJ = contract.latestKDJ || null;
      this.patternClass = this.getPatternClass(this.currentKDJ?.pattern);

      // 构建 K 线数据
      const categories = rawData.map(d => d.date.slice(5)); // 取 MM-DD
      const klineData = rawData.map(d => [d.open, d.close, d.low, d.high]);

      this.candleChartData = {
        categories,
        series: [{ data: klineData }]
      };

      // 构建 KDJ 数据（J 值通常会超过 0~100，钳位到合理范围以免 Y 轴过度拉伸）
      const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
      const kArr = rawData.map(d => parseFloat((d.K || 0).toFixed(1)));
      const dArr = rawData.map(d => parseFloat((d.D || 0).toFixed(1)));
      const jArr = rawData.map(d => parseFloat(clamp(d.J || 0, -10, 110).toFixed(1)));

      this.kdjChartData = {
        categories,
        series: [
          { name: 'K', data: kArr },
          { name: 'D', data: dArr },
          { name: 'J', data: jArr },
        ]
      };

      this.chartReady = true;
    },

    getPatternClass(pattern) {
      if (!pattern) return 'neutral';
      if (pattern.includes('多头')) return 'bullish';
      if (pattern.includes('空头')) return 'bearish';
      if (pattern.includes('超买')) return 'overbought';
      if (pattern.includes('超卖')) return 'oversold';
      return 'neutral';
    }
  }
};
</script>

<style scoped>
</style>
