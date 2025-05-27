import React, { useState, useEffect, useRef } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Empty, Result, Badge, Tabs } from 'antd';
import * as echarts from 'echarts';
import DashboardStats from '../components/DashboardStats';
import { api } from '../services/api';
import type { MedicalRecord } from '../types';
import {
  BarChartOutlined,
  RadarChartOutlined,
  ExperimentOutlined,
  RiseOutlined,
  FallOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// 添加处理NaN值的辅助函数
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === undefined || value === null) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// 定义类型以修复linter错误
interface FeatureStats {
  [key: string]: {
    [statKey: string]: number | string;
  };
}

interface ModelResult {
  model: string;
  accuracy: number;
  fraud_percent: number;
  total_records: number;
  [key: string]: any;
}

// 定义Tabs项目类型
interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

const DataStatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    abnormalRecords: 0,
    normalRecords: 0,
    abnormalRate: 0,
  });
  const [activeTab, setActiveTab] = useState('1');
  const [modelComparison, setModelComparison] = useState<any[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [featureStats, setFeatureStats] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 新增ECharts图表引用
  const modelComparisonChartRef = useRef<HTMLDivElement>(null);
  const modelRadarChartRef = useRef<HTMLDivElement>(null);
  const modelMetricsChartRef = useRef<HTMLDivElement>(null);
  const modelEfficiencyChartRef = useRef<HTMLDivElement>(null);
  
  // 新增ECharts实例引用
  const modelComparisonChartInstance = useRef<echarts.ECharts | null>(null);
  const modelRadarChartInstance = useRef<echarts.ECharts | null>(null);
  const modelMetricsChartInstance = useRef<echarts.ECharts | null>(null);
  const modelEfficiencyChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 响应式调整图表宽度
    const updateWidth = () => {
      if (containerRef.current) {
        // 更新ECharts实例大小
        modelComparisonChartInstance.current?.resize();
        modelRadarChartInstance.current?.resize();
        modelMetricsChartInstance.current?.resize();
        modelEfficiencyChartInstance.current?.resize();
      }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 初始化ECharts模型对比柱状图
  useEffect(() => {
    if (!modelComparisonChartRef.current || modelLoading || modelComparison.length === 0) return;
    
    // 销毁之前的实例
    if (modelComparisonChartInstance.current) {
      modelComparisonChartInstance.current.dispose();
    }
    
    // 初始化ECharts实例
    modelComparisonChartInstance.current = echarts.init(modelComparisonChartRef.current);
    
    // 准备数据
    const models = modelComparison.map(model => model.model);
    const accuracyData = modelComparison.map(model => {
      const value = safeNumber(model.accuracy);
      return parseFloat(((value < 1 ? value * 100 : value)).toFixed(1)); // 转换为百分比并保留一位小数
    });
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const model = params[0].name;
          const modelData = modelComparison.find(m => m.model === model);
          
          if (!modelData) return '';
          
          return `
            <div style="padding: 8px; color: #fff; background: rgba(20,30,40,0.9); border-radius: 4px;">
              <div style="margin-bottom: 4px; font-weight: 500;">${model} 模型</div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>准确率:</span>
                <span style="margin-left: 12px; color: ${params[0].color}; font-weight: 500;">
                  ${(safeNumber(modelData.accuracy) * 100).toFixed(2)}%
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>异常记录:</span>
                <span style="margin-left: 12px;">${safeNumber(modelData.error_count)} (${safeNumber(modelData.fraud_percent).toFixed(2)}%)</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>正常记录:</span>
                <span style="margin-left: 12px;">${safeNumber(modelData.normal_count)} (${safeNumber(modelData.normal_percent).toFixed(2)}%)</span>
              </div>
            </div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '30px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: models,
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff'
        }
      },
      yAxis: {
        type: 'value',
        name: '准确率(%)',
        nameTextStyle: {
          color: '#ffffff'
        },
        min: 0,
        max: 100,
        interval: 10,
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff',
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.15)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '准确率',
          type: 'bar',
          data: accuracyData,
          itemStyle: {
            color: function(params: any) {
              const colors: Record<string, string> = {
                'DNN': '#4377FE',
                'CNN': '#36CBCB',
                'RNN': '#FB7293',
                'XGB': '#975FE4', 
                'RF': '#0BA5EC'
              };
              return colors[params.name] || '#36CBCB';
            }
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: '{c}%'
          },
          barWidth: '40%',
          animation: true
        }
      ]
    };
    
    // 设置选项并渲染图表
    modelComparisonChartInstance.current.setOption(option);
  }, [modelLoading, modelComparison, activeTab]);
  
  // 初始化ECharts雷达图
  useEffect(() => {
    if (!modelRadarChartRef.current || modelLoading || modelComparison.length === 0) return;
    
    // 销毁之前的实例
    if (modelRadarChartInstance.current) {
      modelRadarChartInstance.current.dispose();
    }
    
    // 初始化ECharts实例
    modelRadarChartInstance.current = echarts.init(modelRadarChartRef.current);
    
    // 准备数据
    const models = modelComparison.map(model => model.model);
    const indicators = [
      { name: '准确率', max: 1 },
      { name: '精确率', max: 1 },
      { name: '召回率', max: 1 },
      { name: '异常检出率', max: 1 },
      { name: '处理速度', max: 1 }
    ];
    
    const seriesData = modelComparison.map(model => {
      return {
        name: model.model,
        value: [
          safeNumber(model.accuracy),
          safeNumber(model.precision),
          safeNumber(model.recall),
          safeNumber(model.fraud_percent) / 100,
          1 - (safeNumber(model.prediction_time) / 3) // 归一化处理速度
        ]
      };
    });
    
    // 设置图表选项
    const option = {
      color: ['#4377FE', '#36CBCB', '#FB7293', '#975FE4', '#0BA5EC'],
      legend: {
        data: models,
        textStyle: {
          color: '#fff'
        },
        bottom: 0
      },
      radar: {
        indicator: indicators,
        splitNumber: 4,
        axisName: {
          color: '#fff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.2)'
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.2)'
          }
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          const { name, value } = params;
          return `
            <div style="padding: 8px; color: #fff; background: rgba(20,30,40,0.9); border-radius: 4px;">
              <div style="margin-bottom: 4px; font-weight: 500;">${name} 模型</div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>准确率:</span>
                <span style="margin-left: 12px; color: ${params.color}; font-weight: 500;">
                  ${(value[0] * 100).toFixed(2)}%
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>精确率:</span>
                <span style="margin-left: 12px; color: ${params.color}; font-weight: 500;">
                  ${(value[1] * 100).toFixed(2)}%
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>召回率:</span>
                <span style="margin-left: 12px; color: ${params.color}; font-weight: 500;">
                  ${(value[2] * 100).toFixed(2)}%
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>异常检出率:</span>
                <span style="margin-left: 12px; color: ${params.color}; font-weight: 500;">
                  ${(value[3] * 100).toFixed(2)}%
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>处理速度:</span>
                <span style="margin-left: 12px; color: ${params.color}; font-weight: 500;">
                  ${(value[4] * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          `;
        }
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          areaStyle: {
            opacity: 0.4
          },
          lineStyle: {
            width: 2
          }
        }
      ]
    };
    
    // 设置选项并渲染图表
    modelRadarChartInstance.current.setOption(option);
  }, [modelLoading, modelComparison, activeTab]);
  
  // 初始化ECharts模型性能指标对比图
  useEffect(() => {
    if (!modelMetricsChartRef.current || modelLoading || modelComparison.length === 0) return;
    
    // 销毁之前的实例
    if (modelMetricsChartInstance.current) {
      modelMetricsChartInstance.current.dispose();
    }
    
    // 初始化ECharts实例
    modelMetricsChartInstance.current = echarts.init(modelMetricsChartRef.current);
    
    // 准备数据
    const models = modelComparison.map(model => model.model);
    const f1Scores = modelComparison.map(model => parseFloat((safeNumber(model.f1_score) * 100).toFixed(1)));
    const precisionValues = modelComparison.map(model => parseFloat((safeNumber(model.precision) * 100).toFixed(1)));
    const recallValues = modelComparison.map(model => parseFloat((safeNumber(model.recall) * 100).toFixed(1)));
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          let result = `<div style="padding: 8px; color: #fff; background: rgba(20,30,40,0.9); border-radius: 4px;">`;
          result += `<div style="margin-bottom: 4px; font-weight: 500;">${params[0].name} 模型</div>`;
          
          params.forEach((param: any) => {
            result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span>${param.seriesName}:</span>
              <span style="margin-left: 12px; color: ${param.color}; font-weight: 500;">
                ${param.value.toFixed(2)}%
              </span>
            </div>`;
          });
          
          result += `</div>`;
          return result;
        }
      },
      legend: {
        data: ['F1分数', '精确率', '召回率'],
        textStyle: {
          color: '#fff'
        },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '50px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: models,
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff'
        }
      },
      yAxis: {
        type: 'value',
        name: '指标值(%)',
        nameTextStyle: {
          color: '#ffffff'
        },
        min: 0,
        max: 100,
        interval: 10,
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff',
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.15)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'F1分数',
          type: 'bar',
          data: f1Scores,
          itemStyle: {
            color: '#FAAD14'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: '{c}%'
          }
        },
        {
          name: '精确率',
          type: 'bar',
          data: precisionValues,
          itemStyle: {
            color: '#4377FE'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: '{c}%'
          }
        },
        {
          name: '召回率',
          type: 'bar',
          data: recallValues,
          itemStyle: {
            color: '#36CBCB'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: '{c}%'
          }
        }
      ]
    };
    
    // 设置选项并渲染图表
    modelMetricsChartInstance.current.setOption(option);
  }, [modelLoading, modelComparison, activeTab]);
  
  // 初始化ECharts模型效率对比图
  useEffect(() => {
    if (!modelEfficiencyChartRef.current || modelLoading || modelComparison.length === 0) return;
    
    // 销毁之前的实例
    if (modelEfficiencyChartInstance.current) {
      modelEfficiencyChartInstance.current.dispose();
    }
    
    // 初始化ECharts实例
    modelEfficiencyChartInstance.current = echarts.init(modelEfficiencyChartRef.current);
    
    // 准备数据
    const models = modelComparison.map(model => model.model);
    const trainingTimes = modelComparison.map(model => parseFloat(safeNumber(model.training_time).toFixed(1)));
    const predictionTimes = modelComparison.map(model => parseFloat(safeNumber(model.prediction_time).toFixed(1)));
    const modelSizes = modelComparison.map(model => parseFloat(safeNumber(model.model_size).toFixed(1)));
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          let result = `<div style="padding: 8px; color: #fff; background: rgba(20,30,40,0.9); border-radius: 4px;">`;
          result += `<div style="margin-bottom: 4px; font-weight: 500;">${params[0].name} 模型</div>`;
          
          params.forEach((param: any) => {
            let value = param.value;
            let unit = '';
            
            if (param.seriesName === '训练时间(秒)' || param.seriesName === '预测时间(秒)') {
              unit = 's';
            } else if (param.seriesName === '模型大小(MB)') {
              unit = 'MB';
            }
            
            result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span>${param.seriesName}:</span>
              <span style="margin-left: 12px; color: ${param.color}; font-weight: 500;">
                ${value.toFixed(2)}${unit}
              </span>
            </div>`;
          });
          
          result += `</div>`;
          return result;
        }
      },
      legend: {
        data: ['训练时间(秒)', '预测时间(秒)', '模型大小(MB)'],
        textStyle: {
          color: '#fff'
        },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '50px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: models,
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff'
        }
      },
      yAxis: {
        type: 'value',
        name: '数值',
        nameTextStyle: {
          color: '#ffffff'
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLabel: {
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.15)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '训练时间(秒)',
          type: 'bar',
          data: trainingTimes,
          itemStyle: {
            color: '#975FE4'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: function(params: any) {
              return params.value.toFixed(1) + 's';
            }
          }
        },
        {
          name: '预测时间(秒)',
          type: 'bar',
          data: predictionTimes,
          itemStyle: {
            color: '#0BA5EC'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: function(params: any) {
              return params.value.toFixed(1) + 's';
            }
          }
        },
        {
          name: '模型大小(MB)',
          type: 'bar',
          data: modelSizes,
          itemStyle: {
            color: '#FB7293'
          },
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: function(params: any) {
              return params.value.toFixed(1) + 'MB';
            }
          }
        }
      ]
    };
    
    // 设置选项并渲染图表
    modelEfficiencyChartInstance.current.setOption(option);
  }, [modelLoading, modelComparison, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setModelLoading(true);
        setError(null);
        
        // 使用新的API端点获取A08.csv文件数据
        const response = await api.getA08Data();
        
        if (!response.success || !response.data || response.data.length === 0) {
          setError('未获取到数据，请确保后端服务正常运行并包含有效数据');
          setData([]);
          setStats({
            totalRecords: 0,
            abnormalRecords: 0,
            normalRecords: 0,
            abnormalRate: 0,
          });
          return;
        }
        
        // 处理数据中可能的NaN值
        const cleanedData = response.data.map((item: MedicalRecord) => {
          const cleanItem = { ...item };
          // 处理所有数值字段
          Object.keys(cleanItem).forEach(key => {
            if (typeof cleanItem[key as keyof MedicalRecord] === 'number' && isNaN(cleanItem[key as keyof MedicalRecord] as number)) {
              (cleanItem as any)[key] = 0; // 将NaN替换为0
            }
          });
          return cleanItem;
        });
        
        // 设置处理后的数据
        setData(cleanedData);
        
        // 设置统计信息，确保没有NaN值
        setStats({
          totalRecords: safeNumber(response.stats.totalRecords),
          abnormalRecords: safeNumber(response.stats.abnormalRecords),
          normalRecords: safeNumber(response.stats.normalRecords),
          abnormalRate: safeNumber(response.stats.abnormalRate),
        });
        
        // 设置特征统计信息，处理可能的NaN值
        if (response.featureStats) {
          const cleanFeatureStats: FeatureStats = { ...response.featureStats };
          Object.keys(cleanFeatureStats).forEach(feature => {
            const featureStat = cleanFeatureStats[feature];
            if (featureStat && typeof featureStat === 'object') {
              Object.keys(featureStat).forEach(statKey => {
                if (typeof featureStat[statKey] === 'number' && isNaN(featureStat[statKey] as number)) {
                  featureStat[statKey] = 0;
                }
              });
            }
          });
          setFeatureStats(cleanFeatureStats);
        }
        
        try {
          // 获取模型比较数据
          console.log('正在获取模型比较数据...');
          const modelComparisonResponse = await api.getModelComparison();
          
          if (modelComparisonResponse.success && Array.isArray(modelComparisonResponse.comparison)) {
            // 检查是否有有效的模型数据，现在仅过滤掉undefined和null值
            const validModels = modelComparisonResponse.comparison.filter(
              (model: ModelResult) => model && typeof model.model === 'string'
            );
            
            if (validModels.length > 0) {
              // 处理可能的NaN值，但不再设置默认值
              const cleanModels = validModels.map((model: ModelResult) => {
                const cleanModel = { ...model };
                
                // 清理NaN值，转换字符串为数字
                Object.keys(cleanModel).forEach(key => {
                  if (key !== 'model') { // 保留model字段为字符串
                    if (typeof cleanModel[key] === 'string' && !isNaN(Number(cleanModel[key]))) {
                      // 如果是字符串但可以转为数字，则转换
                      cleanModel[key] = Number(cleanModel[key]);
                    } else if (typeof cleanModel[key] === 'number' && isNaN(cleanModel[key])) {
                      // 如果是NaN值，则设置为0
                      cleanModel[key] = 0;
                    }
                  }
                });
                
                // 确保所有必要的数值字段都存在
                const requiredFields = ['accuracy', 'precision', 'recall', 'f1_score', 
                                       'fraud_percent', 'normal_percent', 'total_records', 
                                       'error_count', 'normal_count', 'training_time',
                                       'prediction_time', 'model_size'];
                                       
                requiredFields.forEach(field => {
                  if (cleanModel[field] === undefined || cleanModel[field] === null) {
                    cleanModel[field] = 0;
                  }
                  
                  // 确保是数值类型
                  if (typeof cleanModel[field] !== 'number') {
                    cleanModel[field] = Number(cleanModel[field]) || 0;
                  }
                });
                
                return cleanModel;
              });
              
              console.log('模型比较数据获取成功:', cleanModels);
              setModelComparison(cleanModels);
            } else {
              console.warn('模型比较端点返回的数据中没有有效的模型');
              setModelComparison([]);
            }
          } else {
            console.error('模型比较数据获取失败或格式不正确:', modelComparisonResponse);
            setModelComparison([]);
          }
        } catch (modelError) {
          console.error('获取模型比较数据失败:', modelError);
          setModelComparison([]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        setError('数据加载失败，请检查网络连接或后端服务状态');
        setData([]);
        setStats({
          totalRecords: 0,
          abnormalRecords: 0,
          normalRecords: 0,
          abnormalRate: 0,
        });
        setModelComparison([]);
      } finally {
        setLoading(false);
        setModelLoading(false);
      }
    };

    fetchData();
  }, []);

  // 如果数据为空，提前返回
  const renderEmptyState = () => (
    <Result
      status="warning"
      title="无数据可显示"
      subTitle={error || "未获取到数据，请确保后端服务正常运行并包含有效数据"}
    />
  );

  // 只有当有数据时才计算图表数据
  if (data.length === 0 && !loading) {
    return (
      <Content className="tech-container" style={{ padding: '24px' }}>
        <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 32 }}>A08.csv数据可视化分析</Title>
        {renderEmptyState()}
      </Content>
    );
  }

  // 预测结果分析标签页内容
  const predictionResultsTabContent = (
    <div style={{ padding: 16 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ExperimentOutlined style={{ color: '#36CBCB', marginRight: 8 }} />
                <span>模型预测效果分析</span>
              </div>
            }
            variant="outlined" 
            className="chart-card"
            style={{ 
              background: 'rgba(20,30,40,0.6)', 
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid rgba(54, 203, 203, 0.2)'
            }} 
            styles={{ body: { padding: 16 } }}
          >
            <Typography.Paragraph style={{ color: '#fff', marginBottom: 24 }}>
              医疗欺诈预测系统通过多种机器学习模型对医疗记录进行分析，识别潜在的欺诈行为。
              以下是各模型的预测结果分析：
            </Typography.Paragraph>
            
            {modelComparison.length > 0 ? (
              <div>
                {modelComparison.map((model, index) => (
                  <div key={index} style={{ 
                    marginBottom: 24, 
                    padding: 16, 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 12
                    }}>
                      <Typography.Title level={4} style={{ 
                        color: '#fff', 
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%',
                          background: {
                            'DNN': '#4377FE',
                            'CNN': '#36CBCB',
                            'RNN': '#FB7293',
                            'XGB': '#975FE4', 
                            'RF': '#0BA5EC'
                          }[model.model as 'DNN' | 'CNN' | 'RNN' | 'XGB' | 'RF'] || '#36CBCB',
                          marginRight: 8
                        }} />
                        {model.model} 模型
                      </Typography.Title>
                      <Typography.Text style={{ 
                        color: '#fff', 
                        background: 'rgba(54, 203, 203, 0.2)',
                        padding: '4px 12px',
                        borderRadius: 16
                      }}>
                        准确率: {(model.accuracy * 100).toFixed(1)}%
                      </Typography.Text>
                    </div>
                    
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <div style={{ 
                          background: 'rgba(67, 119, 254, 0.1)', 
                          padding: 12, 
                          borderRadius: 8,
                          border: '1px solid rgba(67, 119, 254, 0.2)'
                        }}>
                          <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>正常记录</div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'baseline'
                          }}>
                            <Typography.Title level={3} style={{ color: '#4377FE', margin: 0 }}>
                              {model.normal_count || 0}
                            </Typography.Title>
                            <Typography.Text style={{ color: '#fff' }}>
                              {model.normal_percent || 0}%
                            </Typography.Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div style={{ 
                          background: 'rgba(251, 114, 147, 0.1)', 
                          padding: 12, 
                          borderRadius: 8,
                          border: '1px solid rgba(251, 114, 147, 0.2)'
                        }}>
                          <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>异常记录</div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'baseline'
                          }}>
                            <Typography.Title level={3} style={{ color: '#FB7293', margin: 0 }}>
                              {model.error_count || 0}
                            </Typography.Title>
                            <Typography.Text style={{ color: '#fff' }}>
                              {model.fraud_percent || 0}%
                            </Typography.Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div style={{ 
                          background: 'rgba(54, 203, 203, 0.1)', 
                          padding: 12, 
                          borderRadius: 8,
                          border: '1px solid rgba(54, 203, 203, 0.2)'
                        }}>
                          <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>总记录</div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'baseline'
                          }}>
                            <Typography.Title level={3} style={{ color: '#36CBCB', margin: 0 }}>
                              {model.total_records || 0}
                            </Typography.Title>
                            <Typography.Text style={{ color: '#fff' }}>
                              100%
                            </Typography.Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <div style={{ marginTop: 16 }}>
                      <div style={{ 
                        height: 8, 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: 4, 
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${model.normal_percent || 0}%`,
                          background: '#4377FE',
                          borderRadius: '4px 0 0 4px'
                        }} />
                        <div style={{ 
                          position: 'absolute',
                          left: `${model.normal_percent || 0}%`,
                          top: 0,
                          height: '100%',
                          width: `${model.fraud_percent || 0}%`,
                          background: '#FB7293',
                          borderRadius: model.normal_percent === 0 ? '4px 0 0 4px' : '0'
                        }} />
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: 8,
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 12
                      }}>
                        <span>正常记录: {model.normal_percent || 0}%</span>
                        <span>异常记录: {model.fraud_percent || 0}%</span>
                      </div>
                    </div>
                    
                    <Typography.Paragraph style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      marginTop: 16,
                      marginBottom: 0,
                      fontSize: 13
                    }}>
                      {model.model} 模型在医疗欺诈检测中表现
                      {model.accuracy > 0.8 ? '优秀' : model.accuracy > 0.7 ? '良好' : '一般'}，
                      准确率为 {(model.accuracy * 100).toFixed(1)}%。
                      在总共 {model.total_records || 0} 条记录中，
                      识别出 {model.error_count || 0} 条异常记录，
                      占比 {model.fraud_percent || 0}%。
                    </Typography.Paragraph>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无模型预测数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // 定义Tabs的items
  const tabItems: TabItem[] = [
    {
      key: '1',
      label: (
        <span>
          <BarChartOutlined />
          模型性能对比
        </span>
      ),
      children: (
        <div style={{ padding: 16 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <ExperimentOutlined style={{ color: '#36CBCB', marginRight: 8 }} />
                      <span>模型准确率对比</span>
                    </div>
                    <Badge 
                      count={modelComparison.length} 
                      style={{ 
                        backgroundColor: '#36CBCB',
                        marginRight: 8
                      }} 
                      overflowCount={10}
                    />
                  </div>
                }
                variant="outlined" 
                className="chart-card"
                style={{ 
                  background: 'rgba(20,30,40,0.6)', 
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(54, 203, 203, 0.2)'
                }} 
                styles={{ body: { padding: 16 } }}
              >
                {modelLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin />
                    <div style={{ marginTop: 12 }}>加载模型数据...</div>
                  </div>
                ) : modelComparison.length > 0 ? (
                  <div ref={modelComparisonChartRef} style={{ height: 280 }} />
                ) : (
                  <Empty description="暂无模型对比数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RadarChartOutlined style={{ color: '#4377FE', marginRight: 8 }} />
                    <span>模型性能雷达图</span>
                  </div>
                }
                variant="outlined" 
                className="chart-card"
                style={{ 
                  background: 'rgba(20,30,40,0.6)', 
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(67, 119, 254, 0.2)'
                }} 
                styles={{ body: { padding: 16 } }}
              >
                {modelLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin />
                    <div style={{ marginTop: 12 }}>加载模型数据...</div>
                  </div>
                ) : modelComparison.length > 0 ? (
                  <div ref={modelRadarChartRef} style={{ height: 280 }} />
                ) : (
                  <Empty description="暂无模型性能数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BarChartOutlined style={{ color: '#FB7293', marginRight: 8 }} />
                    <span>模型性能指标对比</span>
                  </div>
                }
                variant="outlined" 
                className="chart-card"
                style={{ 
                  background: 'rgba(20,30,40,0.6)', 
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(251, 114, 147, 0.2)'
                }} 
                styles={{ body: { padding: 16 } }}
              >
                {modelLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin />
                    <div style={{ marginTop: 12 }}>加载模型数据...</div>
                  </div>
                ) : modelComparison.length > 0 ? (
                  <div ref={modelMetricsChartRef} style={{ height: 280 }} />
                ) : (
                  <Empty description="暂无模型性能指标数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FallOutlined style={{ color: '#975FE4', marginRight: 8 }} />
                    <span>模型效率对比</span>
                  </div>
                }
                variant="outlined" 
                className="chart-card"
                style={{ 
                  background: 'rgba(20,30,40,0.6)', 
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(151, 95, 228, 0.2)'
                }} 
                styles={{ body: { padding: 16 } }}
              >
                {modelLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin />
                    <div style={{ marginTop: 12 }}>加载模型数据...</div>
                  </div>
                ) : modelComparison.length > 0 ? (
                  <div ref={modelEfficiencyChartRef} style={{ height: 280 }} />
                ) : (
                  <Empty description="暂无模型效率数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <BulbOutlined />
          预测结果分析
        </span>
      ),
      children: predictionResultsTabContent
    }
  ];

  return (
    <Content className="tech-container" style={{ padding: '24px' }} ref={containerRef}>
      <div className="tech-header" style={{ position: 'relative', zIndex: 2, marginBottom: 32 }}>
        <Title level={2} style={{ 
          color: '#fff', 
          textAlign: 'center', 
          margin: '0 0 8px 0',
          textShadow: '0 0 20px rgba(54, 203, 203, 0.5)'
        }}>
          数据可视化分析
        </Title>
        
        <div style={{ 
          width: '80px', 
          height: '4px', 
          background: 'linear-gradient(90deg, transparent, #36CBCB, transparent)', 
          margin: '0 auto 16px' 
        }} />
        
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.7)', 
          textAlign: 'center', 
          maxWidth: '700px', 
          margin: '0 auto'
        }}>
          文件数据的深度分析，展示不同模型训练后的性能对比和数据特征分布
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.85)' }}>数据加载中...</div>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <DashboardStats {...stats} />
          
          {/* 标签页切换不同图表 */}
          <Card 
            className="chart-tabs-card"
            style={{ 
              marginTop: 24, 
              background: 'rgba(20,30,40,0.85)', 
              borderRadius: 16,
              border: '1px solid rgba(67, 119, 254, 0.2)',
              overflow: 'hidden'
            }}
            styles={{ body: { padding: 0 } }}
            variant="outlined"
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              type="card"
              className="tech-tabs"
              tabBarStyle={{ 
                margin: 0, 
                padding: '12px 12px 0',
                background: 'rgba(16, 24, 32, 0.4)'
              }}
              items={tabItems}
            />
          </Card>
          
          {/* 数据洞察卡片 */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BulbOutlined style={{ color: '#0BA5EC', marginRight: 8 }} />
                <span>数据洞察</span>
              </div>
            }
            style={{ 
              marginTop: 24, 
              background: 'rgba(20,30,40,0.85)', 
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid rgba(11, 165, 236, 0.2)'
            }}
            variant="outlined"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="insight-card" style={{
                  padding: 16,
                  background: 'rgba(67, 119, 254, 0.1)',
                  borderRadius: 8,
                  height: '100%'
                }}>
                  <Title level={5} style={{ color: '#4377FE', display: 'flex', alignItems: 'center' }}>
                    <RiseOutlined style={{ marginRight: 8 }} />
                    异常记录特征
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)' }}>
                    异常记录平均费用支出明显高于正常记录，特别是在药品金额和统筹金额方面。
                    系统通过多种模型分析这些特征，提高异常检测准确率。
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="insight-card" style={{
                  padding: 16,
                  background: 'rgba(54, 203, 203, 0.1)',
                  borderRadius: 8,
                  height: '100%'
                }}>
                  <Title level={5} style={{ color: '#36CBCB', display: 'flex', alignItems: 'center' }}>
                    <ExperimentOutlined style={{ marginRight: 8 }} />
                    就诊频率影响
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)' }}>
                    就诊频率是影响医疗记录异常风险的重要因素。
                    高频次就诊记录需要进行更严格的审核，以确保医疗资源的合理利用。
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="insight-card" style={{
                  padding: 16,
                  background: 'rgba(251, 114, 147, 0.1)',
                  borderRadius: 8,
                  height: '100%'
                }}>
                  <Title level={5} style={{ color: '#FB7293', display: 'flex', alignItems: 'center' }}>
                    <FallOutlined style={{ marginRight: 8 }} />
                    费用异常检测
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)' }}>
                    当月统筹金额超过
                    <Text strong style={{ color: '#FB7293' }}> 4000元 </Text>
                    且就诊次数超过
                    <Text strong style={{ color: '#FB7293' }}> 3次 </Text>
                    时，异常风险显著增加，需重点关注此类记录的合规性。
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
      
      {/* 添加动态效果的CSS */}
      <style>
        {`
          .tech-tabs .ant-tabs-tab {
            background: rgba(16, 24, 32, 0.4) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-bottom: none !important;
            border-radius: 8px 8px 0 0 !important;
            padding: 8px 16px;
            margin-right: 4px;
            transition: all 0.3s;
          }
          
          .tech-tabs .ant-tabs-tab-active {
            background: rgba(54, 203, 203, 0.1) !important;
            border-color: rgba(54, 203, 203, 0.3) !important;
          }
          
          .tech-tabs .ant-tabs-tab:hover {
            background: rgba(54, 203, 203, 0.05) !important;
          }
          
          .tech-tabs .ant-tabs-nav::before {
            border-bottom: 1px solid rgba(54, 203, 203, 0.3) !important;
          }
          
          .tech-container {
            position: relative;
          }
          
          .tech-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 10% 10%, rgba(67, 119, 254, 0.1), transparent 400px),
              radial-gradient(circle at 90% 20%, rgba(54, 203, 203, 0.1), transparent 300px),
              radial-gradient(circle at 50% 80%, rgba(251, 114, 147, 0.1), transparent 400px);
            pointer-events: none;
            z-index: 0;
          }
          
          .chart-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .chart-card::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.5s ease;
            pointer-events: none;
            z-index: 0;
          }
          
          .chart-card:hover::before {
            opacity: 1;
          }
          
          .insight-card {
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.05);
          }
          
          .insight-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </Content>
  );
};

export default DataStatsPage; 