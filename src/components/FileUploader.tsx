import React, { useState } from 'react';
import { Upload, Button, message, Select, Card, Typography, Space, Result, Progress, Steps, Table, Tag, Divider } from 'antd';
import { UploadOutlined, FileExcelOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import type { PredictionResult } from '../types';
import { formatPercent, getModelName, getStatusColor } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface FileUploaderProps {
  onUpload: (file: File, model: string) => Promise<PredictionResult>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [model, setModel] = useState('dnn');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 文件预览数据
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleUpload = async () => {
    const file = fileList[0];
    
    if (!file) {
      message.error('请先选择文件');
      return;
    }
    
    setUploading(true);
    setCurrentStep(1);
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 99) {
          clearInterval(progressInterval);
          return 99;
        }
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 200);
    
    try {
      const result = await onUpload(file as unknown as File, model);
      
      // 使用后端返回的真实预测结果数据
      setResult(result);
      // 使用后端返回的结果详情数据，如果没有则使用空数组
      setPreviewData(result.results || []);
      setCurrentStep(2);
      message.success('上传和预测成功');
    } catch (error) {
      message.error('上传或预测失败');
      setCurrentStep(0);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: _file => {
      setFileList([]);
      setResult(null);
      setCurrentStep(0);
      setUploadProgress(0);
      setPreviewData([]);
    },
    beforeUpload: file => {
      // 检查文件类型
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      const isExcel = 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xls') || 
        file.name.endsWith('.xlsx');
      
      if (!isCSV && !isExcel) {
        message.error('只能上传 CSV 或 Excel 文件!');
        return false;
      }
      
      // 文件大小限制 (50MB)
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB!');
        return false;
      }
      
      setFileList([file]);
      setResult(null);
      setCurrentStep(0);
      setUploadProgress(0);
      setPreviewData([]);
      
      return false;
    },
    fileList,
  };

  // 预览数据表格列
  const previewColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { 
      title: '预测结果', 
      dataIndex: 'prediction', 
      key: 'prediction',
      render: (value: number) => (
        <Tag color={value === 1 ? 'error' : 'success'}>
          {value === 1 ? '异常' : '正常'}
        </Tag>
      )
    },
    { 
      title: '概率', 
      dataIndex: 'probability', 
      key: 'probability',
      render: (value: number) => formatPercent(value)
    },
  ];

  return (
    <div className="tech-container interactive-form" style={{ borderRadius: '8px', padding: '24px', marginBottom: '24px', position: 'relative' }}>
      <Title level={3} className="tech-title" style={{ marginBottom: '24px' }}>
        <FileExcelOutlined /> 文件上传预测
      </Title>
      
      {/* 添加交互样式 */}
      <style>
        {`
          /* 增强交互性的CSS */
          .interactive-form {
            position: relative;
            z-index: 100 !important;
          }
          
          /* 确保上传组件可以正常工作 */
          .active-upload, 
          .active-upload .ant-upload,
          .active-upload .ant-upload-select,
          .active-upload .ant-upload-list {
            pointer-events: auto !important;
            position: relative;
            z-index: 1500 !important;
          }
          
          /* 确保按钮可点击 */
          .interactive-form button,
          .interactive-form .ant-btn,
          .interactive-form .ant-select,
          .interactive-form .ant-select-selector {
            pointer-events: auto !important;
            position: relative;
            z-index: 1500 !important;
            cursor: pointer !important;
          }
          
          /* 解决Select下拉菜单的问题 */
          .ant-select-dropdown {
            z-index: 2000 !important;
          }
          
          /* 禁用可能阻止交互的覆盖层 */
          .tech-container::before,
          .tech-container::after {
            pointer-events: none !important;
          }
          
          /* 提高上传组件的可见度 */
          .ant-upload-list-item-info {
            background: rgba(0, 0, 0, 0.6) !important;
            pointer-events: auto !important;
            z-index: 1500 !important;
            position: relative !important;
          }
          
          /* 确保上传按钮可点击 */
          .ant-upload.ant-upload-select {
            display: inline-block !important;
            pointer-events: auto !important;
          }
          
          /* 确保上传列表项目可点击 */
          .ant-upload-list-item {
            pointer-events: auto !important;
            position: relative !important;
            z-index: 1500 !important;
          }
          
          /* 禁用全局遮罩层，防止它阻止交互 */
          #root::before,
          #root::after,
          body::before,
          body::after,
          .ant-layout::before,
          .ant-layout::after {
            pointer-events: none !important;
          }
        `}
      </style>
      
      <Steps current={currentStep} style={{ marginBottom: '24px' }}>
        <Step title="选择文件" description="上传数据文件" />
        <Step title="处理中" description="数据分析处理" />
        <Step title="预测完成" description="查看预测结果" />
      </Steps>
      
      <Card className="tech-card" style={{ position: 'relative', zIndex: 5 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Paragraph className="tech-text">
            上传 CSV 或 Excel 文件进行批量预测。文件应包含与数据库相同的列结构。
          </Paragraph>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text className="tech-text" strong>选择模型:</Text>
            <Select 
              value={model}
              onChange={setModel}
              style={{ width: 240, position: 'relative', zIndex: 1500 }}
              styles={{ popup: { root: { background: '#1f1f1f', zIndex: 2000 } } }}
              dropdownStyle={{ zIndex: 2000 }}
            >
              <Option value="dnn">深度神经网络 (DNN)</Option>
              <Option value="cnn">卷积神经网络 (CNN)</Option>
              <Option value="rnn">循环神经网络 (RNN)</Option>
              <Option value="xgb">XGBoost</Option>
              <Option value="rf">随机森林 (RF)</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1000 }}>
            <Upload {...uploadProps} className="active-upload">
              <Button 
                icon={<UploadOutlined />} 
                size="large" 
                style={{ 
                  pointerEvents: 'auto', 
                  position: 'relative', 
                  zIndex: 1500,
                  cursor: 'pointer'
                }}
                className="clickable-button"
              >
                选择文件
              </Button>
            </Upload>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
              size="large"
              className="glow-effect clickable-button"
              style={{ 
                pointerEvents: 'auto', 
                position: 'relative', 
                zIndex: 1500,
                cursor: 'pointer'
              }}
            >
              开始上传并预测
            </Button>
          </div>
          
          {fileList.length > 0 && (
            <div>
              <Text className="tech-text" strong>选中文件:</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <FileTextOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
                <div>
                  <div className="tech-text">{fileList[0].name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                    {(fileList[0].size! / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {uploading && (
            <div>
              <Text className="tech-text">上传进度:</Text>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}
        </Space>
      </Card>
      
      {fileList.length > 0 && previewData.length > 0 && currentStep < 2 && (
        <Card className="tech-card" style={{ marginTop: '24px' }}>
          <Title level={4} className="tech-title">
            <FileTextOutlined /> 文件预览
          </Title>
          <Paragraph className="tech-text">
            以下是文件的前几行数据预览:
          </Paragraph>
          <Table 
            dataSource={previewData.slice(0, 5)}
            columns={previewColumns}
            size="small"
            pagination={false}
          />
        </Card>
      )}
      
      {result && currentStep === 2 && (
        <Card className="tech-card" style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ color: '#1677ff' }}>预测完成</Title>
            <Paragraph style={{ fontSize: '16px' }}>
              使用模型: {getModelName(result.model)}
            </Paragraph>
            
            <div style={{ margin: '32px 0' }}>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => message.success('开始下载预测结果')}
                size="large"
                className="glow-effect clickable-button"
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1500,
                  cursor: 'pointer'
                }}
              >
                下载预测结果
              </Button>
            </div>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4} className="tech-text">模型置信度</Title>
                <Title level={1} style={{ color: getStatusColor(result.accuracy), margin: 0 }}>
                  {formatPercent(result.accuracy)}
                </Title>
              </div>
              
              <div>
                <Space size="large">
                  <div>
                    <Text className="tech-text">正常记录</Text>
                    <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                      {result.total_records - result.error_count}
                    </Title>
                  </div>
                  
                  <div>
                    <Text className="tech-text">异常记录</Text>
                    <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                      {result.error_count}
                    </Title>
                  </div>
                  
                  <div>
                    <Text className="tech-text">总记录数</Text>
                    <Title level={3} style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>
                      {result.total_records}
                    </Title>
                  </div>
                </Space>
              </div>
            </Space>
          </div>
          
          <Divider />
          
          <Title level={4} className="tech-title" style={{ marginBottom: '16px' }}>
            预测结果详情
          </Title>
          <Table 
            dataSource={previewData}
            columns={previewColumns}
            size="small"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}
    </div>
  );
};

export default FileUploader; 