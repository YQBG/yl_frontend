/**
 * 将数字格式化为百分比
 * @param value 数值
 * @param decimals 小数位数
 */
export const formatPercent = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 将数字格式化为千分位
 * @param value 数值
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('zh-CN').format(value);
};

/**
 * 将时间戳格式化为可读时间
 * @param timestamp 时间戳
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 获取适当的状态颜色
 * @param value 数值 (通常是准确率或其它指标)
 */
export const getStatusColor = (value: number): string => {
  if (value >= 0.9) return '#52c41a'; // 绿色 - 优秀
  if (value >= 0.8) return '#1677ff'; // 蓝色 - 良好
  if (value >= 0.7) return '#faad14'; // 黄色 - 普通
  return '#f5222d'; // 红色 - 较差
};

/**
 * 获取模型类型的中文名称
 * @param model 模型类型
 */
export const getModelName = (model: string): string => {
  const modelMap: Record<string, string> = {
    'dnn': '深度神经网络',
    'cnn': '卷积神经网络',
    'rnn': '循环神经网络',
    'xgb': 'XGBoost',
    'rf': '随机森林',
    'svm': '支持向量机',
  };
  
  return modelMap[model.toLowerCase()] || model;
};

/**
 * 生成随机ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
}; 