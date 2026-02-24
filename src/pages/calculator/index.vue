<template>
  <view class="container">
    <!-- 头部 -->
    <view class="app-header">
      <text class="app-title">🖥️ 交易计算器</text>
      <text class="app-subtitle">专业仓位管理与止损计算</text>
    </view>

    <view class="card">
      <!-- 模式切换 -->
      <view class="mode-selector">
        <button
          :class="['mode-btn', mode === 'stock' ? 'active' : '']"
          @tap="switchMode('stock')"
        >股票模式</button>
        <button
          :class="['mode-btn', mode === 'futures' ? 'active' : '']"
          @tap="switchMode('futures')"
        >期货模式</button>
      </view>

      <!-- 期货品种选择 -->
      <view v-if="mode === 'futures'" class="form-group">
        <text class="form-label">📦 期货品种</text>
        <view class="search-dropdown">
          <view :class="['search-input-box', futuresSearchFocused ? 'focused' : '']">
            <text class="input-prefix">🔍</text>
            <input
              class="form-input"
              v-model="futuresSearchText"
              placeholder="搜索品种名称/代码..."
              @focus="onFuturesSearchFocus"
              @blur="onFuturesSearchBlur"
              @input="onFuturesSearchInput"
            />
          </view>
          <!-- 下拉列表 -->
          <scroll-view
            v-if="showFuturesDropdown && filteredFutures.length > 0"
            class="dropdown-list"
            scroll-y
            style="max-height: 220px;"
          >
            <view
              v-for="item in filteredFutures"
              :key="item.code"
              :class="['dropdown-item', selectedFutures && selectedFutures.code === item.code ? 'selected' : '']"
              @tap="selectFutures(item)"
            >
              <text>{{ item.name }}</text>
              <text style="color: #64748b; font-size: 0.8em; margin-left: 8px;">{{ item.code }}</text>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 股票代码搜索 -->
      <view v-if="mode === 'stock'" class="form-group">
        <text class="form-label">🏢 股票代码</text>
        <view class="search-dropdown">
          <view :class="['search-input-box', stockSearchFocused ? 'focused' : '']">
            <text class="input-prefix">🔍</text>
            <input
              class="form-input"
              v-model="stockSearchText"
              placeholder="搜索代码/名称/拼音..."
              @focus="onStockSearchFocus"
              @blur="onStockSearchBlur"
              @input="onStockSearchInput"
            />
          </view>
          <scroll-view
            v-if="showStockDropdown && filteredStocks.length > 0"
            class="dropdown-list"
            scroll-y
            style="max-height: 220px;"
          >
            <view
              v-for="item in filteredStocks"
              :key="item.code"
              :class="['dropdown-item', selectedStock && selectedStock.code === item.code ? 'selected' : '']"
              @tap="selectStock(item)"
            >
              <text>{{ item.name }}</text>
              <text style="color: #64748b; font-size: 0.8em; margin-left: 8px;">{{ item.code }}</text>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 买入价格 -->
      <view class="form-group">
        <text class="form-label">买入价格</text>
        <view class="input-wrapper">
          <text class="input-prefix">¥</text>
          <input
            class="form-input"
            type="digit"
            v-model="buyPrice"
            placeholder="请输入买入价格"
            @input="calculate"
          />
        </view>
      </view>

      <!-- 止损价格 -->
      <view class="form-group">
        <text class="form-label">止损价格</text>
        <view class="input-wrapper">
          <text class="input-prefix">¥</text>
          <input
            class="form-input"
            type="digit"
            v-model="stopLoss"
            placeholder="请输入止损价格"
            @input="calculate"
          />
        </view>
      </view>

      <!-- 风险金额 -->
      <view class="form-group">
        <text class="form-label">最大风险金额</text>
        <view class="input-wrapper">
          <text class="input-prefix">¥</text>
          <input
            class="form-input"
            type="digit"
            v-model="riskAmount"
            placeholder="请输入最大风险金额"
            @input="calculate"
          />
        </view>
      </view>

      <!-- 错误提示 -->
      <view v-if="errorMsg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px;">
        ⚠️ {{ errorMsg }}
      </view>

      <!-- 计算结果 -->
      <view v-if="result" class="result-section">
        <view class="result-item">
          <text class="result-label">方向</text>
          <text :class="['result-value', result.isLong ? 'profit' : 'loss']">
            {{ result.isLong ? '📈 做多' : '📉 做空' }}
          </text>
        </view>
        <view class="result-item">
          <text class="result-label">建议仓位</text>
          <text class="result-value highlight">
            {{ mode === 'futures' ? result.contracts + ' 手' : result.shares + ' 股' }}
          </text>
        </view>
        <view class="result-item">
          <text class="result-label">实际风险</text>
          <text class="result-value">¥{{ fmt(result.actualRisk) }}</text>
        </view>
        <view class="divider" />
        <view class="result-item">
          <text class="result-label">1:1 平衡点</text>
          <text class="result-value">{{ fmt(result.target1) }}</text>
        </view>
        <view class="result-item">
          <text class="result-label">3:1 止盈点</text>
          <text class="result-value highlight">{{ fmt(result.target3) }}</text>
        </view>
        <view class="result-item">
          <text class="result-label">{{ mode === 'futures' ? '预估保证金' : '总投入' }}</text>
          <text class="result-value">¥{{ fmt(mode === 'futures' ? result.totalMargin : result.totalInvestment) }}</text>
        </view>
        <!-- 操作按钮 -->
        <view class="btn-row">
          <button class="btn btn-secondary" @tap="saveHistory">📝 记录历史</button>
          <button class="btn btn-primary" @tap="savePosition">💾 保存持仓</button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">输入价格数据以计算仓位</text>
      </view>
    </view>

    <!-- 重置按钮 -->
    <button class="btn btn-danger btn-full" @tap="globalReset" style="margin-top: 8px;">
      ⚠️ 清空数据并重置
    </button>

    <!-- 保存持仓弹窗 -->
    <view v-if="showSaveModal" class="modal-overlay" @tap.self="showSaveModal = false">
      <view class="modal-box">
        <view class="modal-title">💾 保存持仓</view>
        <view class="modal-subtitle">{{ selectedProductName }} @ {{ buyPrice }}</view>
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">持仓数量</text>
            <input
              class="form-input modal-input"
              type="number"
              v-model="saveQty"
              :placeholder="mode === 'futures' ? '手数' : '股数'"
            />
          </view>
          <view class="form-group">
            <text class="form-label">交易账户</text>
            <view class="mode-selector" style="margin-bottom:0">
              <button :class="['mode-btn', saveUser === 'liuan' ? 'active' : '']" @tap="saveUser = 'liuan'">刘安</button>
              <button :class="['mode-btn', saveUser === 'kangge' ? 'active' : '']" @tap="saveUser = 'kangge'">康哥</button>
            </view>
          </view>
        </view>
        <view class="btn-row">
          <button class="btn btn-secondary" @tap="showSaveModal = false">取消</button>
          <button class="btn btn-primary" @tap="confirmSavePosition">确认保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { storage, STORAGE_KEYS, MAX_HISTORY } from '@/utils/storage.js';
import { formatNumber } from '@/utils/format.js';
import { calcFutures, calcStock } from '@/utils/calculator.js';
import { futuresData, futuresList } from '@/data/futures_specs.js';

// 懒加载股票数据（避免影响首屏）
let _stocksData = null;
function getStocksData() {
  if (!_stocksData) {
    try {
      // 动态引入（分包场景下也能工作）
      _stocksData = require('@/data/stocks_data.js').stocksData || [];
    } catch (e) {
      _stocksData = [];
    }
  }
  return _stocksData;
}

export default {
  name: 'CalculatorPage',
  data() {
    return {
      mode: 'stock',
      // 期货搜索
      futuresSearchText: '',
      futuresSearchFocused: false,
      showFuturesDropdown: false,
      filteredFutures: [],
      selectedFutures: null,
      // 股票搜索
      stockSearchText: '',
      stockSearchFocused: false,
      showStockDropdown: false,
      filteredStocks: [],
      selectedStock: null,
      // 输入
      buyPrice: '',
      stopLoss: '',
      riskAmount: '',
      // 结果
      result: null,
      errorMsg: '',
      lastCalc: null,
      // 保存弹窗
      showSaveModal: false,
      saveQty: '',
      saveUser: 'liuan',
    };
  },
  computed: {
    selectedProductName() {
      if (this.mode === 'futures' && this.selectedFutures) return this.selectedFutures.name;
      if (this.mode === 'stock' && this.selectedStock) return `${this.selectedStock.name}(${this.selectedStock.code})`;
      return '';
    }
  },
  methods: {
    fmt(v) { return formatNumber(v); },

    switchMode(m) {
      this.mode = m;
      this.result = null;
      this.errorMsg = '';
      this.lastCalc = null;
    },

    // ===== 期货搜索 =====
    onFuturesSearchFocus() {
      this.futuresSearchFocused = true;
      this.showFuturesDropdown = true;
      this.filteredFutures = futuresList.slice(0, 20);
    },
    onFuturesSearchBlur() {
      this.futuresSearchFocused = false;
      setTimeout(() => { this.showFuturesDropdown = false; }, 200);
    },
    onFuturesSearchInput(e) {
      const q = (e.detail?.value || this.futuresSearchText || '').trim().toUpperCase();
      if (!q) {
        this.filteredFutures = futuresList.slice(0, 20);
      } else {
        this.filteredFutures = futuresList.filter(f =>
          f.name.includes(q) || f.code.includes(q) || f.category.includes(q)
        ).slice(0, 20);
      }
      this.showFuturesDropdown = true;
    },
    selectFutures(item) {
      this.selectedFutures = item;
      this.futuresSearchText = `${item.name} (${item.code})`;
      this.showFuturesDropdown = false;
      this.calculate();
    },

    // ===== 股票搜索 =====
    onStockSearchFocus() {
      this.stockSearchFocused = true;
      this.showStockDropdown = true;
      this.filteredStocks = getStocksData().slice(0, 15);
    },
    onStockSearchBlur() {
      this.stockSearchFocused = false;
      setTimeout(() => { this.showStockDropdown = false; }, 200);
    },
    onStockSearchInput(e) {
      const q = (e.detail?.value || this.stockSearchText || '').trim().toUpperCase();
      if (!q) {
        this.filteredStocks = getStocksData().slice(0, 15);
        this.showStockDropdown = true;
        return;
      }
      this.filteredStocks = getStocksData().filter(s => {
        if (!s) return false;
        const code = (s.code || '').toUpperCase();
        const name = s.name || '';
        const pinyin = (s.pinyin || '').toUpperCase();
        return code.includes(q) || name.includes(q) || pinyin.includes(q);
      }).slice(0, 15);
      this.showStockDropdown = true;
    },
    selectStock(item) {
      this.selectedStock = item;
      this.stockSearchText = `${item.name} (${item.code})`;
      this.showStockDropdown = false;
    },

    // ===== 核心计算 =====
    calculate() {
      this.errorMsg = '';
      this.result = null;
      this.lastCalc = null;

      const buy = parseFloat(this.buyPrice);
      const stop = parseFloat(this.stopLoss);
      const risk = parseFloat(this.riskAmount);

      if (!buy || !stop || !risk) return;
      if (buy === stop) { this.errorMsg = '开仓价格不能等于止损价格'; return; }

      if (this.mode === 'futures') {
        if (!this.selectedFutures) { this.errorMsg = '请选择期货品种'; return; }
        const r = calcFutures(buy, stop, risk, this.selectedFutures);
        this.result = r;
        this.lastCalc = {
          mode: 'futures',
          futuresCode: this.selectedFutures.code,
          productName: this.selectedFutures.name,
          inputs: { buyPrice: buy, stopLoss: stop, riskAmount: risk },
          results: r,
        };
        this.saveQty = String(r.contracts);
      } else {
        const r = calcStock(buy, stop, risk);
        this.result = r;
        this.lastCalc = {
          mode: 'stock',
          stockCode: this.selectedStock?.code || '',
          productName: this.selectedProductName || '股票',
          inputs: { buyPrice: buy, stopLoss: stop, riskAmount: risk },
          results: r,
        };
        this.saveQty = String(r.shares);
      }
    },

    // ===== 历史记录 =====
    saveHistory() {
      if (!this.lastCalc) return;
      const list = storage.get(STORAGE_KEYS.HISTORY) || [];
      list.unshift({ id: Date.now(), ...this.lastCalc, timestamp: Date.now() });
      if (list.length > MAX_HISTORY) list.splice(MAX_HISTORY);
      storage.set(STORAGE_KEYS.HISTORY, list);
      uni.showToast({ title: '已记录到历史', icon: 'success' });
    },

    // ===== 保存持仓 =====
    savePosition() {
      if (!this.lastCalc) return;
      this.showSaveModal = true;
    },
    confirmSavePosition() {
      const qty = parseInt(this.saveQty);
      if (isNaN(qty) || qty <= 0) {
        uni.showToast({ title: '请输入有效数量', icon: 'none' });
        return;
      }
      const list = storage.get(STORAGE_KEYS.POSITIONS) || [];
      list.unshift({
        id: Date.now(),
        mode: this.lastCalc.mode,
        futuresProduct: this.lastCalc.futuresCode || '',
        stockCode: this.lastCalc.stockCode || '',
        productName: this.lastCalc.productName,
        buyPrice: this.lastCalc.inputs.buyPrice,
        stopLoss: this.lastCalc.inputs.stopLoss,
        quantity: qty,
        profitTarget: this.lastCalc.results.target3,
        target1: this.lastCalc.results.target1,
        user: this.saveUser,
        status: 'open',
        createTime: new Date().toISOString(),
      });
      storage.set(STORAGE_KEYS.POSITIONS, list);
      this.showSaveModal = false;
      uni.showToast({ title: '持仓已保存', icon: 'success' });
    },

    // ===== 全局重置 =====
    globalReset() {
      uni.showModal({
        title: '⚠️ 确认重置',
        content: '将清除所有历史记录和持仓数据，不可恢复！',
        confirmText: '确认清空',
        confirmColor: '#ef4444',
        success: (res) => {
          if (res.confirm) {
            storage.clear();
            this.result = null;
            this.lastCalc = null;
            this.buyPrice = '';
            this.stopLoss = '';
            this.riskAmount = '';
            this.selectedFutures = null;
            this.selectedStock = null;
            this.futuresSearchText = '';
            this.stockSearchText = '';
            uni.showToast({ title: '已重置', icon: 'success' });
          }
        }
      });
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
}
.modal-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 20px;
}
.modal-input {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 10px 14px;
  color: #e2e8f0;
  width: 100%;
  font-size: 1rem;
}
</style>
