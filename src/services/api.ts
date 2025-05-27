import type { PredictionResult, SinglePredictionResult } from '../types';

// 直接连接到后端服务
// 使用固定IP地址，确保其他设备可以访问
// 如果需要本地开发，可以使用localhost
// const API_HOST = window.location.hostname; // 自动获取当前主机名
const API_HOST = '127.0.0.1'; // 使用固定IP地址
const API_BASE_URL = `http://${API_HOST}:5000/api`; // 使用端口号8000

export const api = {
  /**
   * 获取API服务状态
   */
  getStatus: async (): Promise<{ status: string; version: string }> => {
    const response = await fetch(`${API_BASE_URL}/status`);
    return response.json();
  },

  /**
   * 使用DNN模型预测
   */
  predictDNN: async (): Promise<PredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/dnn`);
    return response.json();
  },

  /**
   * 使用CNN模型预测
   */
  predictCNN: async (): Promise<PredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/cnn`);
    return response.json();
  },

  /**
   * 使用RNN模型预测
   */
  predictRNN: async (): Promise<PredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/rnn`);
    return response.json();
  },

  /**
   * 使用XGB模型预测
   */
  predictXGB: async (): Promise<PredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/xgb`);
    return response.json();
  },

  /**
   * 使用随机森林模型预测
   */
  predictRF: async (): Promise<PredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/rf`);
    return response.json();
  },

  /**
   * 上传文件进行批量预测
   */
  uploadFileForPrediction: async (file: File, model: string): Promise<PredictionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/predict-file/${model}`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  },

  /**
   * 单条数据预测
   */
  singlePrediction: async (data: Record<string, number>, model: string): Promise<SinglePredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/predict-single/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'same-origin',
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '服务器错误' }));
      throw new Error(errorData.error || `服务器返回错误: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * 获取所有预测结果
   */
  getAllPredictionResults: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/results`);
    return response.json();
  },
  
  /**
   * 获取模型比较数据
   */
  getModelComparison: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/model-comparison`);
    return response.json();
  },
  
  /**
   * 获取AI分析报告
   */
  getAnalysisReport: async (model: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analysis-report/${model}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '服务器错误' }));
      throw new Error(errorData.error || `获取分析报告失败: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * 获取A08.csv文件数据和模型训练结果
   */
  getA08Data: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/a08-data`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '服务器错误' }));
      throw new Error(errorData.error || `获取A08数据失败: ${response.status}`);
    }
    
    return response.json();
  }
}; 