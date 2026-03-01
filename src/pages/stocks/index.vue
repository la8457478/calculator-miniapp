<template>
  <view class="container">
    <view class="app-header">
      <view>
        <text class="app-title">📊 股票季线</text>
        <text class="app-subtitle">季度高低点 & 蓄势信号</text>
      </view>
      <button class="refresh-btn" :disabled="refreshing" @tap="refreshData">
        {{ refreshing ? '拉取中...' : '🔄 刷新' }}
      </button>
    </view>

    <!-- 数据来源标识 -->
    <view v-if="dataSource === 'local'" class="snapshot-banner">
      <text>⚠️ 当前显示离线快照数据，云端服务不可用</text>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <button :class="['filter-btn', filter === 'all' ? 'active' : '']" @tap="filter='all'">全部</button>
      <button :class="['filter-btn', filter === 'pending' ? 'active' : '']" @tap="filter='pending'">蓄势中</button>
      <button :class="['filter-btn', filter === 'unbroken' ? 'active' : '']" @tap="filter='unbroken'">蓄势未突破</button>
      <button :class="['filter-btn', filter === 'near' ? 'active' : '']" @tap="filter='near'">接近突破</button>
    </view>

    <!-- 搜索框 -->
    <view class="card" style="padding: 10px 14px; margin-bottom: 12px;">
      <view class="search-input-box" style="border:none; padding: 0;">
        <text class="input-prefix">🔍</text>
        <input
          class="form-input"
          :value="searchText"
          placeholder="搜索股票代码/名称..."
          @input="onSearchTextInput"
        />
      </view>
    </view>

    <!-- 摘要 -->
    <view class="summary-bar" style="margin-bottom: 12px;">
      <view class="summary-item">
        <text class="summary-label">显示</text>
        <text class="summary-value">{{ displayList.length }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">蓄势中</text>
        <text class="summary-value bullish">{{ pendingCount }}</text>
      </view>
    </view>

    <!-- 列表 -->
    <view v-if="displayList.length > 0">
      <view
        v-for="stock in displayList"
        :key="stock.code"
        class="card"
        style="margin-bottom: 12px; cursor:pointer;"
        @tap="openDetail(stock)"
      >
        <view style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <view>
            <text style="font-size: 1rem; font-weight: 700; color: #e2e8f0;">{{ stock.name }}</text>
            <text style="font-size: 0.8rem; color: #64748b; margin-left: 8px;">{{ stock.code }}</text>
          </view>
          <view style="display:flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
            <text v-if="stock.pending_long" class="tag tag-pending-long">蓄势多</text>
            <text v-if="stock.pending_short" class="tag tag-pending-short">蓄势空</text>
            <text v-if="isNearBreakout(stock)" class="tag" style="background:rgba(99,102,241,0.2);color:#a5b4fc;border:1px solid #6366f1;">接近突破</text>
          </view>
        </view>

        <!-- 季度数据 -->
        <view v-if="stock.quarters && stock.quarters.length > 0">
          <view
            v-for="(q, idx) in stock.quarters.slice(-4)"
            :key="idx"
            style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size:0.82rem;"
          >
            <text style="color: #64748b; min-width: 70px;">{{ q.quarter }}</text>
            <text style="color: #22c55e;">高: {{ q.q_high }}</text>
            <text style="color: #ef4444;">低: {{ q.q_low }}</text>
            <text style="color: #94a3b8;">收: {{ q.close }}</text>
          </view>
        </view>

        <!-- 突破价 -->
        <view v-if="stock.pending_long || stock.pending_short" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); font-size: 0.82rem;">
          <view v-if="stock.pending_long" style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <text style="color: #94a3b8;">📈 突破买入:</text>
            <text style="color: #f59e0b; font-weight: 600;">{{ getBreakoutPrice(stock) }}</text>
          </view>
          <view v-if="stock.pending_short" style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <text style="color: #94a3b8;">📉 破位卖出:</text>
            <text style="color: #9ca3af; font-weight: 600;">{{ getShortBreakPrice(stock) }}</text>
          </view>
          <view style="display:flex; justify-content:space-between;">
            <text style="color: #94a3b8;">当前价格:</text>
            <text style="color: #e2e8f0; font-weight: 600;">{{ stock.current_price || '-' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">{{ searchText ? '未找到匹配结果' : '暂无数据' }}</text>
    </view>
  </view>
</template>
<script>
import { stocksData as localStocksData } from '@/data/stocks_data.js';

// 懒加载股票季度数据（体积较大，分包按需加载）
let _data = null;
function getData() {
  if (!_data) {
    try {
      _data = localStocksData || [];
    } catch (e) {
      _data = [];
    }
  }
  return _data;
}

export default {
  name: 'StocksQuarterlyPage',
  data() {
    return {
      allList: [],
      searchText: '',
      filter: 'all',
      dataSource: 'api', // 'api' | 'local'
      refreshing: false,
    };
  },
  computed: {
    pendingCount() {
      return this.allList.filter(s => s.pending_long || s.pending_short).length;
    },
    displayList() {
      let list = this.allList;
      // 搜索过滤
      if (this.searchText.trim()) {
        const q = this.searchText.trim().toUpperCase();
        list = list.filter(s =>
          (s.code || '').toUpperCase().includes(q) ||
          (s.name || '').includes(this.searchText.trim())
        );
      }
      // 状态过滤
      if (this.filter === 'pending') {
        list = list.filter(s => s.pending_long || s.pending_short);
      } else if (this.filter === 'unbroken') {
        list = list.filter(s => s.pending_long && s.current_price && s.current_price < this.getBreakoutPrice(s));
      } else if (this.filter === 'near') {
        list = list.filter(s => this.isNearBreakout(s));
      }
      return list.slice(0, 100); // 只显示前100条避免卡顿
    }
  },
  onShow() {
    this._loadFromApi();
  },
  methods: {
    async refreshData() {
      if (this.refreshing) return;
      this.refreshing = true;
      await this._loadFromApi();
      this.refreshing = false;
      uni.showToast({ title: this.dataSource === 'api' ? '数据已是最新' : '云端不可用，已加载快照', icon: 'none' });
    },

    async _loadFromApi() {
      try {
        await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://175.24.131.147:8000/api/stocks/quarterly',
            method: 'GET',
            timeout: 5000,
            success: (res) => {
              if (res.statusCode === 200 && res.data?.code === 0) {
                // 把 API 返回的格式，转化为页面使用的格式
                this.allList = res.data.data.map(s => ({
                  code: s.code,
                  name: s.name,
                  pending_long: s.signal === '蓄势多',
                  pending_short: s.signal === '蓄势空',
                  breakout_price: s.breakout_price,
                  current_price: null, // 实时价格后续可以再加
                  quarters: (s.quarters || []).map(q => ({
                    quarter: q.quarter,
                    q_high: q.q_high,
                    q_low: q.q_low,
                    close: q.close,
                  }))
                }));
                this.dataSource = 'api';
                resolve();
              } else {
                reject(new Error('API 返回异常'));
              }
            },
            fail: reject
          });
        });
      } catch (e) {
        console.warn('[stocks] API 获取失败，使用本地数据:', e.message);
        // 降级：读本地静态 JS
        const raw = getData();
        this.allList = raw.map(s => ({
          code: s.code,
          name: s.name,
          market: s.market || '',
          pending_long: false,
          pending_short: false,
          quarters: [],
          current_price: null,
        }));
        this.dataSource = 'local';
      }
    },
    onSearchTextInput(e) {
      this.searchText = e.detail.value;
    },

    getBreakoutPrice(stock) {
      if (!stock.quarters || stock.quarters.length < 2) return '-';
      const q2 = stock.quarters[stock.quarters.length - 2];
      return q2?.q_high || '-';
    },

    getShortBreakPrice(stock) {
      if (!stock.quarters || stock.quarters.length < 2) return '-';
      const q2 = stock.quarters[stock.quarters.length - 2];
      return q2?.q_low || '-';
    },

    openDetail(stock) {
      uni.navigateTo({ url: `/pages/stocks/detail?code=${stock.code}` });
    },

    isNearBreakout(stock) {
      if (!stock.pending_long || !stock.current_price) return false;
      const breakout = parseFloat(this.getBreakoutPrice(stock));
      if (isNaN(breakout)) return false;
      // 接近突破：当前价在突破价的 10% 以内
      const limitUp = stock.market === 'STAR' || stock.code?.startsWith('68') ? 0.2 : 0.1;
      return stock.current_price >= breakout * (1 - limitUp) && stock.current_price < breakout;
    }
  }
};
</script>

<style scoped>
.snapshot-banner {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.82rem;
  color: #f59e0b;
  text-align: center;
}

.refresh-btn {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 20px;
  font-size: 0.8rem;
  padding: 6px 14px;
  min-width: 80px;
  height: auto;
  line-height: 1.4;
}
.refresh-btn[disabled] {
  opacity: 0.5;
}
</style>
