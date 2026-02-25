<script>
export default {
  onLaunch() {
    console.log('App launched');
  },
  onShow() {},
  onHide() {}
}
</script>

<style>
/* ========== 全局设计系统（从 style.css 迁移，移除 Google Fonts） ========== */
page {
  background-color: #0f0f23;
  color: #e2e8f0;
  font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* CSS 变量 */
view, text, input, button {
  box-sizing: border-box;
}

/* 容器 */
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

/* 头部 */
.app-header {
  text-align: center;
  padding: 20px 0 10px;
}
.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}
.app-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

/* 卡片 */
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

/* 表单 */
.form-group {
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}
.form-label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 6px;
  font-weight: 500;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 0 12px;
  position: relative;
  z-index: 5;
  pointer-events: auto;
}
.input-prefix {
  color: #64748b;
  margin-right: 8px;
  font-size: 0.9rem;
}
.form-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 1rem;
  padding: 12px 0;
  width: 100%;
  position: relative;
  z-index: 6;
  pointer-events: auto;
}
.form-input::placeholder {
  color: #475569;
}

/* 模式切换按钮组 */
.mode-selector {
  display: flex;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
  gap: 4px;
}
.mode-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-btn.active {
  background: #6366f1;
  color: white;
}

/* 结果区域 */
.result-section {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 14px;
  margin-top: 12px;
}
.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.result-item:last-child {
  border-bottom: none;
}
.result-label {
  font-size: 0.875rem;
  color: #94a3b8;
}
.result-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
}
.result-value.highlight {
  color: #6366f1;
  font-size: 1.1rem;
}
.result-value.profit {
  color: #22c55e;
}
.result-value.loss {
  color: #ef4444;
}
.divider {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 8px 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #475569;
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 0.95rem;
}

/* 按钮 */
.btn {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #6366f1;
  color: white;
}
.btn-primary:active {
  background: #4f46e5;
}
.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.2);
}
.btn-danger {
  background: rgba(239,68,68,0.2);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3);
}
.btn-full {
  width: 100%;
  display: block;
  text-align: center;
}
.btn-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.btn-row .btn {
  flex: 1;
}

/* 标签/徽章 */
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.tag-long {
  background: rgba(34,197,94,0.2);
  color: #22c55e;
  border: 1px solid #22c55e;
}
.tag-short {
  background: rgba(239,68,68,0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}
.tag-pending-long {
  background: rgba(251,191,36,0.2);
  color: #f59e0b;
  border: 1px solid #f59e0b;
}
.tag-pending-short {
  background: rgba(156,163,175,0.2);
  color: #9ca3af;
  border: 1px solid #9ca3af;
}
.tag-open {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}
.tag-closed {
  background: rgba(100,116,139,0.2);
  color: #64748b;
}

/* KDJ 颜色 */
.kdj-k { color: #f59e0b; }
.kdj-d { color: #3b82f6; }
.kdj-j { color: #a855f7; }
.kdj-bullish { color: #22c55e; }
.kdj-bearish { color: #ef4444; }
.kdj-overbought { color: #fca5a5; }
.kdj-oversold { color: #86efac; }
.kdj-neutral { color: #9ca3af; }

/* 历史记录卡片 */
.history-card {
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border-left: 3px solid #6366f1;
}
.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.history-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #c4b5fd;
}
.history-time {
  font-size: 0.75rem;
  color: #475569;
}
.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.history-detail {
  font-size: 0.8rem;
  color: #94a3b8;
}
.history-detail strong {
  color: #e2e8f0;
}

/* 持仓卡片 */
.position-card {
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.1);
}
.position-card.closed {
  opacity: 0.6;
  border-color: rgba(255,255,255,0.05);
}
.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.position-name {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
}
.position-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.position-detail-label {
  font-size: 0.82rem;
  color: #64748b;
}
.position-detail-value {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 500;
}
.position-profit {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: right;
  padding-top: 8px;
}
.position-profit.positive { color: #22c55e; }
.position-profit.negative { color: #ef4444; }
.position-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.position-actions .btn {
  flex: 1;
  text-align: center;
  font-size: 0.82rem;
}

/* 筛选按钮 */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
}
.filter-btn.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* 摘要栏 */
.summary-bar {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.summary-item {
  display: flex;
  flex-direction: column;
}
.summary-label {
  font-size: 0.75rem;
  color: #64748b;
}
.summary-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
}
.summary-value.bullish { color: #22c55e; }
.summary-value.bearish { color: #ef4444; }

/* 期货品种卡片 */
.futures-card {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 16px;
}
.futures-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.futures-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
}
.futures-code {
  font-size: 0.8rem;
  color: #64748b;
  background: rgba(255,255,255,0.08);
  padding: 2px 8px;
  border-radius: 4px;
}
.contracts-container {
  display: flex;
  gap: 10px;
}
.contract-box {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 10px;
}
.contract-box.main {
  border-left: 3px solid #6366f1;
}
.contract-box.sub {
  border-left: 3px solid #8b5cf6;
}
.contract-box.pending-highlight {
  border: 2px solid #ef4444 !important;
  background: rgba(239,68,68,0.05);
  box-shadow: 0 0 10px rgba(239,68,68,0.2);
}
.contract-label {
  font-size: 0.72rem;
  color: #64748b;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.contract-symbol {
  font-size: 0.68rem;
  background: rgba(255,255,255,0.08);
  padding: 1px 4px;
  border-radius: 3px;
}
.contract-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 6px;
}
.kdj-mini {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 0.78rem;
}
.kdj-pattern-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 500;
}
.kdj-pattern-badge.bullish {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}
.kdj-pattern-badge.bearish {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
}
.kdj-pattern-badge.neutral {
  background: rgba(156,163,175,0.15);
  color: #9ca3af;
}
.kdj-pattern-badge.overbought {
  background: rgba(239,68,68,0.2);
  color: #fca5a5;
}
.kdj-pattern-badge.oversold {
  background: rgba(34,197,94,0.2);
  color: #86efac;
}
.update-time {
  font-size: 0.7rem;
  color: #475569;
  text-align: right;
  margin-top: 10px;
}

/* 搜索下拉 */
.search-dropdown {
  position: relative;
  z-index: 10;
}
.search-input-box {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 0 12px;
}
.search-input-box.focused {
  border-color: #6366f1;
}
.dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1e1e3a;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.dropdown-item {
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
}
.dropdown-item:active,
.dropdown-item.selected {
  background: rgba(99,102,241,0.2);
  color: #a5b4fc;
}
.dropdown-item:last-child {
  border-bottom: none;
}

/* 内联计算器（蓄势品种） */
.pending-calc {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255,255,255,0.15);
  font-size: 0.78rem;
}
.pending-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pending-label { color: #94a3b8; }
.pending-value { color: #fff; font-weight: 600; }
.pending-calc-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.pending-risk-input {
  width: 70px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 0.75rem;
}
.pending-calc-btn {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.75rem;
}
.pending-result {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #22c55e;
}
</style>
