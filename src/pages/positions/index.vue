<template>
  <view class="container">
    <view class="app-header">
      <text class="app-title">📊 持仓管理</text>
      <text class="app-subtitle">实盘持仓记录与盈亏统计</text>
    </view>

    <!-- 用户筛选 -->
    <view class="mode-selector" style="margin-bottom: 16px;">
      <button :class="['mode-btn', filterUser === 'all' ? 'active' : '']" @tap="filterUser = 'all'">全部</button>
      <button :class="['mode-btn', filterUser === 'liuan' ? 'active' : '']" @tap="filterUser = 'liuan'">刘安</button>
      <button :class="['mode-btn', filterUser === 'kangge' ? 'active' : '']" @tap="filterUser = 'kangge'">康哥</button>
    </view>

    <!-- 统计摘要 -->
    <view v-if="filteredList.length > 0" class="summary-bar" style="margin-bottom:16px;">
      <view class="summary-item">
        <text class="summary-label">持仓中</text>
        <text class="summary-value bullish">{{ openCount }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">已平仓</text>
        <text class="summary-value" style="color: #64748b">{{ closedCount }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">总盈亏</text>
        <text :class="['summary-value', totalProfit >= 0 ? 'bullish' : 'bearish']">
          {{ totalProfit >= 0 ? '+' : '' }}{{ fmt(totalProfit) }}
        </text>
      </view>
    </view>

    <!-- 持仓列表 -->
    <view v-if="filteredList.length > 0">
      <view
        v-for="pos in filteredList"
        :key="pos.id"
        :class="['position-card', pos.status === 'closed' ? 'closed' : '']"
      >
        <view class="position-header">
          <text class="position-name">{{ pos.productName }}</text>
          <view style="display: flex; gap: 6px; align-items: center;">
            <text :class="['tag', pos.status === 'open' ? 'tag-open' : 'tag-closed']">
              {{ pos.status === 'open' ? '持仓中' : '已平仓' }}
            </text>
            <text style="font-size: 0.75rem; color: #64748b;">{{ pos.user === 'liuan' ? '刘安' : '康哥' }}</text>
          </view>
        </view>
        <view class="position-detail-row">
          <text class="position-detail-label">买入价</text>
          <text class="position-detail-value">{{ fmt(pos.buyPrice) }}</text>
        </view>
        <view class="position-detail-row">
          <text class="position-detail-label">止损价</text>
          <text class="position-detail-value">{{ fmt(pos.stopLoss) }}</text>
        </view>
        <view class="position-detail-row">
          <text class="position-detail-label">3:1 止盈</text>
          <text class="position-detail-value" style="color: #6366f1;">{{ fmt(pos.profitTarget) }}</text>
        </view>
        <view class="position-detail-row">
          <text class="position-detail-label">1:1 平衡</text>
          <text class="position-detail-value">{{ fmt(pos.target1) }}</text>
        </view>
        <view class="position-detail-row">
          <text class="position-detail-label">持仓</text>
          <text class="position-detail-value">{{ pos.quantity }} {{ pos.mode === 'stock' ? '股' : '手' }}</text>
        </view>
        <view v-if="pos.status === 'closed'" class="position-detail-row">
          <text class="position-detail-label">平仓价</text>
          <text class="position-detail-value">{{ fmt(pos.closePrice) }}</text>
        </view>
        <!-- 盈亏显示 -->
        <view v-if="pos.status === 'closed' && pos.profit !== undefined">
          <text :class="['position-profit', pos.profit >= 0 ? 'positive' : 'negative']">
            {{ pos.profit >= 0 ? '+' : '' }}¥{{ fmt(pos.profit) }}
          </text>
        </view>
        <!-- 操作按钮 -->
        <view class="position-actions">
          <button v-if="pos.status === 'open'" class="btn btn-secondary" @tap="closePos(pos)" style="font-size:0.82rem;">平仓</button>
          <button v-if="pos.status === 'open'" class="btn" style="background:#ef4444;color:white;font-size:0.82rem;" @tap="editPos(pos)">编辑</button>
          <button class="btn btn-danger" @tap="deletePos(pos.id)" style="font-size:0.82rem;">删除</button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📈</text>
      <text class="empty-text">暂无持仓记录</text>
      <text style="color: #475569; font-size: 0.8rem; margin-top: 6px;">在计算器页面保存计算结果为持仓</text>
    </view>

    <!-- 平仓弹窗 -->
    <view v-if="showCloseModal" class="modal-overlay" @tap.self="showCloseModal = false">
      <view class="modal-box">
        <text class="modal-title">📉 平仓确认</text>
        <text class="modal-subtitle">{{ closeTarget?.productName }}</text>
        <view class="form-group" style="margin-top: 16px;">
          <text class="form-label">平仓价格</text>
          <input
            class="modal-input"
            type="digit"
            :value="closePrice"
            placeholder="请输入平仓价格"
            style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:10px 14px; color:#e2e8f0; width:100%; font-size:1rem;"
            @input="onClosePriceInput"
          />
        </view>
        <view class="btn-row">
          <button class="btn btn-secondary" @tap="showCloseModal = false">取消</button>
          <button class="btn btn-primary" @tap="confirmClose">确认平仓</button>
        </view>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @tap.self="showEditModal = false">
      <view class="modal-box">
        <text class="modal-title">✏️ 编辑持仓</text>
        <text class="modal-subtitle">{{ editTarget?.productName }}</text>
        <view class="form-group" style="margin-top: 16px;">
          <text class="form-label">买入价格</text>
          <input
            class="modal-input"
            type="digit"
            :value="editBuyPrice"
            style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:10px 14px; color:#e2e8f0; width:100%; font-size:1rem;"
            @input="onEditBuyPriceInput"
          />
        </view>
        <view class="form-group">
          <text class="form-label">持仓数量</text>
          <input
            class="modal-input"
            type="number"
            :value="editQty"
            style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:10px 14px; color:#e2e8f0; width:100%; font-size:1rem;"
            @input="onEditQtyInput"
          />
        </view>
        <view class="btn-row">
          <button class="btn btn-secondary" @tap="showEditModal = false">取消</button>
          <button class="btn btn-primary" @tap="confirmEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { storage, STORAGE_KEYS } from '@/utils/storage.js';
import { formatNumber } from '@/utils/format.js';
import { futuresData } from '@/data/futures_specs.js';
import { calcFuturesProfit, calcStockProfit } from '@/utils/calculator.js';

export default {
  name: 'PositionsPage',
  data() {
    return {
      allList: [],
      filterUser: 'all',
      // 平仓
      showCloseModal: false,
      closeTarget: null,
      closePrice: '',
      // 编辑
      showEditModal: false,
      editTarget: null,
      editBuyPrice: '',
      editQty: '',
    };
  },
  computed: {
    filteredList() {
      if (this.filterUser === 'all') return this.allList;
      return this.allList.filter(p => p.user === this.filterUser);
    },
    openCount() { return this.filteredList.filter(p => p.status === 'open').length; },
    closedCount() { return this.filteredList.filter(p => p.status === 'closed').length; },
    totalProfit() {
      return this.filteredList
        .filter(p => p.status === 'closed' && p.profit !== undefined)
        .reduce((sum, p) => sum + (p.profit || 0), 0);
    },
  },
  onShow() {
    this.allList = storage.get(STORAGE_KEYS.POSITIONS) || [];
  },
  methods: {
    fmt(v) { return formatNumber(v); },

    save() {
      storage.set(STORAGE_KEYS.POSITIONS, this.allList);
    },

    deletePos(id) {
      uni.showModal({
        title: '确认删除', content: '删除该持仓记录？', confirmColor: '#ef4444',
        success: (res) => {
          if (res.confirm) {
            this.allList = this.allList.filter(p => p.id !== id);
            this.save();
          }
        }
      });
    },

    closePos(pos) {
      this.closeTarget = pos;
      this.closePrice = '';
      this.showCloseModal = true;
    },

    confirmClose() {
      const price = parseFloat(this.closePrice);
      if (isNaN(price) || price <= 0) {
        uni.showToast({ title: '请输入有效价格', icon: 'none' }); return;
      }
      let profit = 0;
      if (this.closeTarget.mode === 'stock') {
        profit = calcStockProfit(this.closeTarget, price);
      } else {
        const spec = futuresData[this.closeTarget.futuresProduct];
        if (spec) profit = calcFuturesProfit(this.closeTarget, price, spec);
      }
      const idx = this.allList.findIndex(p => p.id === this.closeTarget.id);
      if (idx !== -1) {
        // Use splice to replace element so Vue 2 reactivity is triggered
        this.allList.splice(idx, 1, {
          ...this.allList[idx],
          status: 'closed',
          closePrice: price,
          closeTime: new Date().toISOString(),
          profit,
        });
        this.save();
      }
      this.showCloseModal = false;
      uni.showToast({ title: `已平仓，盈亏 ${profit >= 0 ? '+' : ''}${profit.toFixed(0)}`, icon: profit >= 0 ? 'success' : 'none' });
    },

    editPos(pos) {
      this.editTarget = pos;
      this.editBuyPrice = String(pos.buyPrice);
      this.editQty = String(pos.quantity);
      this.showEditModal = true;
    },

    onClosePriceInput(e) {
      this.closePrice = e.detail.value;
    },
    onEditBuyPriceInput(e) {
      this.editBuyPrice = e.detail.value;
    },
    onEditQtyInput(e) {
      this.editQty = e.detail.value;
    },

    confirmEdit() {
      const price = parseFloat(this.editBuyPrice);
      const qty = parseInt(this.editQty);
      if (isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
        uni.showToast({ title: '请输入有效数据', icon: 'none' }); return;
      }
      const idx = this.allList.findIndex(p => p.id === this.editTarget.id);
      if (idx !== -1) {
        // Use splice to replace element so Vue 2 reactivity is triggered
        this.allList.splice(idx, 1, {
          ...this.allList[idx],
          buyPrice: price,
          quantity: qty,
        });
        this.save();
      }
      this.showEditModal = false;
      uni.showToast({ title: '已更新', icon: 'success' });
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #1e1e3a;
  border-radius: 16px;
  padding: 24px;
  width: 85%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.1);
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 4px;
  display: block;
}
.modal-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}
</style>
