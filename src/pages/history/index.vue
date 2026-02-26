<template>
  <view class="container">
    <view class="app-header">
      <text class="app-title">📝 历史记录</text>
      <text class="app-subtitle">计算历史记录</text>
    </view>

    <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <text style="color: #94a3b8; font-size: 0.85rem;">共 {{ historyList.length }} 条</text>
      <button class="btn btn-danger" @tap="clearAll" style="padding: 6px 14px; font-size: 0.82rem;">
        清空全部
      </button>
    </view>

    <!-- 列表 -->
    <view v-if="historyList.length > 0">
      <view
        v-for="item in historyList"
        :key="item.id"
        class="history-card"
      >
        <view class="history-card-header">
          <text class="history-title">
            {{ item.results?.isLong ? '📈 做多' : '📉 做空' }} ·
            {{ item.mode === 'stock' ? '股票' : '期货' }}
            {{ item.productName ? ' · ' + item.productName : '' }}
          </text>
          <view style="display: flex; align-items: center; gap: 10px;">
            <text class="history-time">{{ formatTime(item.timestamp) }}</text>
            <button class="btn btn-danger" @tap="deleteItem(item.id)" style="padding: 3px 10px; font-size: 0.78rem;">删除</button>
          </view>
        </view>
        <view class="history-details">
          <text class="history-detail">买入: <text style="color: #e2e8f0;">{{ fmt(item.inputs?.buyPrice) }}</text></text>
          <text class="history-detail">止损: <text style="color: #e2e8f0;">{{ fmt(item.inputs?.stopLoss) }}</text></text>
          <text class="history-detail">风险: <text style="color: #e2e8f0;">¥{{ fmt(item.inputs?.riskAmount) }}</text></text>
          <text class="history-detail">1:1: <text style="color: #e2e8f0;">{{ fmt(item.results?.target1) }}</text></text>
          <text class="history-detail">3:1: <text style="color: #6366f1; font-weight: 600;">{{ fmt(item.results?.target3) }}</text></text>
          <text class="history-detail">
            {{ item.mode === 'futures' ? '手数' : '股数' }}:
            <text style="color: #e2e8f0;">
              {{ item.mode === 'futures' ? item.results?.contracts : item.results?.shares }}
            </text>
          </text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无计算记录</text>
      <text style="display: block; text-align: center; color: #475569; font-size: 0.8rem; margin-top: 6px;">在计算器页面完成计算后点击"记录历史"</text>
    </view>
  </view>
</template>

<script>
import { storage, STORAGE_KEYS } from '@/utils/storage.js';
import { formatNumber, formatDateTime } from '@/utils/format.js';

export default {
  name: 'HistoryPage',
  data() {
    return {
      historyList: [],
    };
  },
  onShow() {
    this.loadHistory();
  },
  methods: {
    loadHistory() {
      this.historyList = storage.get(STORAGE_KEYS.HISTORY) || [];
    },
    fmt(v) { return formatNumber(v); },
    formatTime(ts) { return formatDateTime(ts); },
    deleteItem(id) {
      uni.showModal({
        title: '确认删除',
        content: '删除该条历史记录？',
        confirmColor: '#ef4444',
        success: (res) => {
          if (res.confirm) {
            this.historyList = this.historyList.filter(i => i.id !== id);
            storage.set(STORAGE_KEYS.HISTORY, this.historyList);
          }
        }
      });
    },
    clearAll() {
      if (this.historyList.length === 0) return;
      uni.showModal({
        title: '确认清空',
        content: '清空全部历史记录？',
        confirmText: '清空',
        confirmColor: '#ef4444',
        success: (res) => {
          if (res.confirm) {
            this.historyList = [];
            storage.set(STORAGE_KEYS.HISTORY, []);
            uni.showToast({ title: '已清空', icon: 'success' });
          }
        }
      });
    }
  }
};
</script>
