import React, { useState } from 'react';
import { Layout, Typography, Card, Select, Button, Spin, Divider, Result, Space, notification } from 'antd';
import { ExperimentOutlined, RobotOutlined, FileTextOutlined, BulbOutlined, DownloadOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ReportPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<any>(null);

  const generateReport = async () => {
    if (!selectedModel) {
      notification.warning({
        message: '请选择模型',
        description: '请先选择一个模型以生成分析报告',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await api.getAnalysisReport(selectedModel);
      // 处理可能的混合语言标题问题
      let processedReport = response.report;
      if (processedReport) {
        // 替换混合语言标题为完全中文标题
        processedReport = processedReport.replace(
          /医疗ical Fraud Detection Model Analysis Report/g, 
          '医疗欺诈检测模型分析报告'
        );
      }
      setReport(processedReport);
      setModelData({
        model: response.model,
        accuracy: response.accuracy,
        errorCount: response.error_count,
        totalRecords: response.total_records,
        fraudPercent: response.fraud_percent,
      });
    } catch (err: any) {
      console.error('获取分析报告失败:', err);
      setError(err.message || '获取分析报告失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    // 清理报告内容，移除思考过程和处理小标题标记
    let cleanReport = report
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      // 转换小标题为正确的Markdown格式
      .replace(/小标题 1:(.*?)(?:\n|$)/g, '### $1\n')
      .replace(/小标题 2:(.*?)(?:\n|$)/g, '#### $1\n');
    
    const blob = new Blob([cleanReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModel?.toUpperCase()}_异常原因分析报告.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    
    // 先处理混合语言标题问题
    let formatted = markdown
      .replace(/医疗ical Fraud Detection Model Analysis Report/g, '医疗欺诈检测模型分析报告')
      // 将HTML实体转换回HTML标签
      .replace(/&lt;br\/?&gt;/g, '\n')
      .replace(/&lt;h1&gt;/g, '# ')
      .replace(/&lt;\/h1&gt;/g, '\n\n')
      .replace(/&lt;h2&gt;/g, '## ')
      .replace(/&lt;\/h2&gt;/g, '\n\n')
      .replace(/&lt;h3&gt;/g, '### ')
      .replace(/&lt;\/h3&gt;/g, '\n\n')
      .replace(/&lt;strong&gt;/g, '**')
      .replace(/&lt;\/strong&gt;/g, '**')
      .replace(/&lt;em&gt;/g, '_')
      .replace(/&lt;\/em&gt;/g, '_')
      // 处理实际的HTML标签，如果已经是HTML格式
      .replace(/<br\/?>/g, '\n')
      // 处理"小标题"文本标记
      .replace(/小标题 1:(.*?)(?:\n|$)/g, '<h3>$1</h3>')
      .replace(/小标题 2:(.*?)(?:\n|$)/g, '<h4>$1</h4>')
      // 移除其他可能出现的think标签
      .replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // 第二步：将Markdown格式转换为HTML
    formatted = formatted
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      // 段落处理
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    
    // 确保完整的HTML结构
    formatted = '<p>' + formatted + '</p>';
    // 修复可能出现的连续<p>或</p>标签
    formatted = formatted.replace(/<\/p><p><\/p><p>/g, '</p><p>');
    formatted = formatted.replace(/<p><\/p>/g, '');
    
    return formatted;
  };

  return (
    <Content className="tech-container" style={{ padding: '24px' }}>
      {/* 头部区域 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ 
          color: '#fff', 
          marginBottom: 16,
          position: 'relative',
          display: 'inline-block'
        }}>
          智鉴医诈 - 异常原因分析报告
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #36CBCB, transparent)',
            bottom: '-10px',
            left: 0,
          }} />
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 700, margin: '0 auto' }}>
          使用 DeepSeek 大模型深入分析医疗欺诈检测结果，解释异常记录的原因和特征，生成专业的欺诈行为分析报告
        </Paragraph>
      </div>

      {/* 选择模型和生成报告 */}
      <Card 
        style={{ 
          background: 'rgba(20,30,40,0.85)', 
          borderRadius: 16,
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          border: '1px solid rgba(54, 203, 203, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExperimentOutlined style={{ fontSize: 24, color: '#36CBCB', marginRight: 12 }} />
            <Title level={4} style={{ margin: 0, color: '#fff' }}>选择模型</Title>
          </div>
          
          <Space size={16}>
            <Select
              placeholder="选择要分析的模型"
              style={{ width: 200 }}
              onChange={(value) => setSelectedModel(value)}
              value={selectedModel}
            >
              <Option value="dnn">DNN 深度神经网络</Option>
              <Option value="cnn">CNN 卷积神经网络</Option>
              <Option value="rnn">RNN 循环神经网络</Option>
              <Option value="xgb">XGBoost 模型</Option>
              <Option value="rf">随机森林</Option>
            </Select>
            
            <Button 
              type="primary" 
              icon={<RobotOutlined />} 
              onClick={generateReport}
              loading={loading}
              disabled={!selectedModel}
              style={{
                background: '#36CBCB',
                borderColor: '#36CBCB',
              }}
            >
              生成异常原因分析
            </Button>
          </Space>
        </div>
      </Card>

      {/* 报告内容 */}
      <Card 
        style={{ 
          background: 'rgba(20,30,40,0.85)', 
          borderRadius: 16,
          minHeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          border: '1px solid rgba(54, 203, 203, 0.2)',
        }}
        actions={
          report ? [
            <Button 
              key="download" 
              icon={<DownloadOutlined />} 
              onClick={downloadReport}
              type="primary"
              ghost
            >
              下载异常分析报告
            </Button>
          ] : []
        }
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16 }}>正在生成异常原因分析报告，请稍候...</Text>
          </div>
        ) : error ? (
          <Result
            status="error"
            title="生成报告失败"
            subTitle={error}
            extra={
              <Button type="primary" onClick={generateReport}>重试</Button>
            }
          />
        ) : report ? (
          <>
            <div className="report-header" style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20,
              padding: '16px',
              background: 'rgba(54, 203, 203, 0.1)',
              borderRadius: 8,
            }}>
              <div>
                <Text style={{ color: '#36CBCB', fontWeight: 'bold' }}>模型: </Text>
                <Text style={{ color: '#fff' }}>{modelData?.model}</Text>
              </div>
              <div>
                <Text style={{ color: '#36CBCB', fontWeight: 'bold' }}>准确率: </Text>
                <Text style={{ color: '#fff' }}>{(modelData?.accuracy * 100).toFixed(1)}%</Text>
              </div>
              <div>
                <Text style={{ color: '#36CBCB', fontWeight: 'bold' }}>异常记录: </Text>
                <Text style={{ color: '#fff' }}>{modelData?.errorCount} / {modelData?.totalRecords}</Text>
              </div>
              <div>
                <Text style={{ color: '#36CBCB', fontWeight: 'bold' }}>异常比例: </Text>
                <Text style={{ color: '#fff' }}>{modelData?.fraudPercent?.toFixed(1)}%</Text>
              </div>
            </div>
            
            <Divider orientation="left">
              <Space>
                <FileTextOutlined style={{ color: '#36CBCB' }} />
                <span style={{ color: '#fff' }}>分析报告内容</span>
              </Space>
            </Divider>

            <div className="markdown-content" style={{ 
              padding: '20px', 
              color: '#fff',
              lineHeight: 1.8,
              fontSize: '16px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              whiteSpace: 'pre-wrap',
            }}>
              <div 
                dangerouslySetInnerHTML={{ __html: formatMarkdown(report) }} 
                style={{ fontFamily: 'inherit', margin: 0, padding: 0, color: 'inherit' }}
              />
            </div>
            
            <div style={{ 
              marginTop: 16, 
              padding: 16,
              background: 'rgba(67, 119, 254, 0.1)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center'
            }}>
              <BulbOutlined style={{ color: '#4377FE', fontSize: 20, marginRight: 12 }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                此报告由 DeepSeek 大模型生成，用于医疗保险欺诈识别分析，仅供参考。具体医疗决策请咨询专业医疗人员。
              </Text>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '100px 0' 
          }}>
            <RobotOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 24, fontSize: 16 }}>
              请选择一个模型并点击"生成分析报告"按钮
            </Text>
          </div>
        )}
      </Card>

      {/* 添加动态粒子背景 */}
      <div id="particles-js" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* 添加样式 */}
      <style>
        {`
          .markdown-content h1, .markdown-content h2, .markdown-content h3, 
          .markdown-content div h1, .markdown-content div h2, .markdown-content div h3 {
            color: #36CBCB;
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 500;
          }
          
          .markdown-content h1, .markdown-content div h1 {
            font-size: 28px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 8px;
          }
          
          .markdown-content h2, .markdown-content div h2 {
            font-size: 24px;
          }
          
          .markdown-content h3, .markdown-content div h3 {
            font-size: 20px;
          }
          
          .markdown-content p, .markdown-content div p {
            margin-bottom: 16px;
          }
          
          .markdown-content ul, .markdown-content ol,
          .markdown-content div ul, .markdown-content div ol {
            padding-left: 24px;
            margin-bottom: 16px;
          }
          
          .markdown-content li, .markdown-content div li {
            margin-bottom: 8px;
          }
          
          .markdown-content strong, .markdown-content div strong {
            color: #4377FE;
            font-weight: 500;
          }
          
          .markdown-content em, .markdown-content div em {
            color: #FB7293;
            font-style: italic;
          }
          
          .markdown-content blockquote, .markdown-content div blockquote {
            border-left: 4px solid #36CBCB;
            padding-left: 16px;
            margin-left: 0;
            color: rgba(255,255,255,0.7);
          }
        `}
      </style>
    </Content>
  );
};

export default ReportPage; 