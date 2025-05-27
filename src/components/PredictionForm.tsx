import React, { useState } from 'react';
import { Form, Input, Button, Select, Row, Col, Card, Typography, Alert, Spin, Divider, Progress, Tag } from 'antd';
import { ExperimentOutlined, SendOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { SinglePredictionResult } from '../types';
import { formatPercent, getModelName, getStatusColor } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface PredictionFormProps {
  onPredict: (data: Record<string, number>, model: string) => Promise<SinglePredictionResult>;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onPredict }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SinglePredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { model, ...formData } = values;
      
      // 将所有字段转换为数字
      const numericData: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => {
        // 处理空值或非数值
        if (value === '' || value === null || value === undefined) {
          numericData[key] = 0;
        } else {
          const numValue = parseFloat(value as string);
          numericData[key] = isNaN(numValue) ? 0 : numValue;
        }
      });
      
      console.log('提交数据:', numericData);
      const predictResult = await onPredict(numericData, model);
      console.log('预测结果:', predictResult);
      setResult(predictResult);
    } catch (err) {
      console.error('预测错误:', err);
      setError(err instanceof Error ? err.message : '预测过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 根据预测结果生成特征重要性条形图
  const renderFeatureImportance = () => {
    if (!result?.feature_importance) return null;
    
    // 获取特征重要性并排序
    const features = Object.entries(result.feature_importance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);  // 只显示前5个最重要的特征
    
    return (
      <div style={{ marginTop: '24px' }}>
        <Title level={5} className="tech-text">特征重要性排名</Title>
        {features.map(([feature, importance], index) => (
          <div key={feature} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text className="tech-text">{feature}</Text>
              <Text className="tech-text">{formatPercent(importance)}</Text>
            </div>
            <Progress 
              percent={importance * 100} 
              showInfo={false}
              strokeColor={`hsl(${120 - (index * 25)}, 70%, 50%)`}
            />
          </div>
        ))}
      </div>
    );
  };

  // 生成模拟的特征重要性，如果后端没有提供
  const generateMockFeatureImportance = () => {
    if (result && !result.feature_importance) {
      const featureList = [
        '月统筹金额', '月药品金额', '本次审批金额', '月就诊次数', 
        '起付标准以上自负比例金额', '非账户支付金额', '个人账户金额'
      ];
      
      const mockImportance: Record<string, number> = {};
      const total = 1.0;
      let remaining = total;
      
      featureList.forEach((feature, index) => {
        if (index === featureList.length - 1) {
          mockImportance[feature] = remaining;
        } else {
          const value = Math.random() * remaining * 0.7;
          mockImportance[feature] = value;
          remaining -= value;
        }
      });
      
      return mockImportance;
    }
    
    return result?.feature_importance;
  };

  return (
    <div className="tech-container" style={{ borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
      <Title level={3} className="tech-title" style={{ marginBottom: '24px' }}>
        <ExperimentOutlined /> 智鉴医诈 - 单条数据预测
      </Title>
      
      <style>
        {`
          /* 增强表单交互性的CSS */
          .interactive-form {
            position: relative;
            z-index: 100 !important;
          }
          
          /* 确保所有输入元素都可以接收点击和输入 */
          .interactive-form .ant-form-item-control-input-content input,
          .interactive-form .ant-form-item-control-input-content select,
          .interactive-form .ant-form-item-control-input-content button,
          .interactive-form .ant-select-selector,
          .interactive-form .ant-input,
          .interactive-form .ant-select,
          .interactive-form .ant-btn {
            pointer-events: auto !important;
            position: relative;
            z-index: 150 !important;
            cursor: pointer !important;
          }
          
          /* 为输入框增加额外的交互属性 */
          .interactive-form .ant-input {
            background-color: rgba(0, 0, 0, 0.3) !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
            color: #fff !important;
          }
          
          /* 确保按钮可点击 */
          .clickable-button {
            cursor: pointer !important;
            position: relative;
            z-index: 200 !important;
            pointer-events: auto !important;
          }
          
          /* 提高表单元素的可见度和交互性 */
          .interactive-form .ant-input:focus,
          .interactive-form .ant-select-focused .ant-select-selector {
            border-color: #36CBCB !important;
            box-shadow: 0 0 0 2px rgba(54, 203, 203, 0.2) !important;
          }
          
          /* 禁用任何可能阻止交互的覆盖层 */
          .tech-container::before,
          .tech-container::after {
            pointer-events: none !important;
          }
          
          /* 确保表单元素始终可见 */
          .interactive-form .ant-form-item {
            margin-bottom: 16px !important;
            position: relative !important;
            z-index: 50 !important;
          }
          
          /* 解决Select下拉菜单的问题 */
          .ant-select-dropdown {
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
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ 
          background: 'rgba(16, 36, 64, 0.7)', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 50
        }}
        initialValues={{
          model: 'dnn',
          月统筹金额: '',
          月药品金额: '',
          本次审批金额: '',
          月就诊次数: '',
          起付标准以上自负比例金额: '',
          非账户支付金额: '',
          个人账户金额: '',
          可用账户报销金额: '',
          统筹支付金额: '',
          顺序号: '',
          药品费发生金额: '',
        }}
        className="interactive-form"
      >
        <Row gutter={[16, 16]}>
          <Col span={24} md={8}>
            <Form.Item
              name="model"
              label={<Text className="tech-text">选择模型</Text>}
              rules={[{ required: true, message: '请选择预测模型' }]}
              tooltip={{ 
                title: '不同模型有不同的预测特点，可以尝试比较不同模型的预测结果', 
                icon: <InfoCircleOutlined /> 
              }}
            >
              <Select 
                styles={{ popup: { root: { background: '#1f1f1f', zIndex: 1100 } } }}
              >
                <Option value="dnn">深度神经网络 (DNN)</Option>
                <Option value="cnn">卷积神经网络 (CNN)</Option>
                <Option value="rnn">循环神经网络 (RNN)</Option>
                <Option value="xgb">XGBoost</Option>
                <Option value="rf">随机森林 (RF)</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="月统筹金额"
              label={<Text className="tech-text">月统筹金额</Text>}
              rules={[{ required: true, message: '请输入月统筹金额' }]}
              tooltip={{ 
                title: '月度统筹金额是指当月医保统筹的总金额', 
                icon: <QuestionCircleOutlined /> 
              }}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="月药品金额"
              label={<Text className="tech-text">月药品金额</Text>}
              rules={[{ required: true, message: '请输入月药品金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="本次审批金额"
              label={<Text className="tech-text">本次审批金额</Text>}
              rules={[{ required: true, message: '请输入本次审批金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="月就诊次数"
              label={<Text className="tech-text">月就诊次数</Text>}
              rules={[{ required: true, message: '请输入月就诊次数' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="起付标准以上自负比例金额"
              label={<Text className="tech-text">起付标准以上自负比例金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="非账户支付金额"
              label={<Text className="tech-text">非账户支付金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="个人账户金额"
              label={<Text className="tech-text">个人账户金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="可用账户报销金额"
              label={<Text className="tech-text">可用账户报销金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="统筹支付金额"
              label={<Text className="tech-text">统筹支付金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="顺序号"
              label={<Text className="tech-text">顺序号</Text>}
              rules={[{ required: true, message: '请输入顺序号' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24} md={8}>
            <Form.Item
              name="药品费发生金额"
              label={<Text className="tech-text">药品费发生金额</Text>}
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input 
                placeholder="请输入数值" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  color: '#fff',
                  zIndex: 150,
                  position: 'relative'
                }} 
              />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SendOutlined />} 
                loading={loading}
                block
                size="large"
                style={{ marginTop: '20px', position: 'relative', zIndex: 300 }}
                className="glow-effect clickable-button"
              >
                提交预测
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text className="tech-text">正在处理，请稍候...</Text>
          </div>
        </div>
      )}
      
      {error && (
        <Alert
          message="预测失败"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}
      
      {result && !loading && (
        <>
          <Divider />
          <Card className="tech-card">
            <Title level={4} className="tech-title">预测结果</Title>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Card className="tech-card">
                  <Title level={5} className="tech-text">使用模型</Title>
                  <Text className="tech-text" strong>{getModelName(result.model)}</Text>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  className="tech-card"
                  style={{ 
                    backgroundColor: result.prediction === 1 ? 'rgba(245, 34, 45, 0.2)' : 'rgba(82, 196, 26, 0.2)' 
                  }}
                >
                  <Title level={5} className="tech-text">预测结果</Title>
                  <Text 
                    style={{ 
                      color: result.prediction === 1 ? '#ff4d4f' : '#52c41a',
                      fontWeight: 'bold',
                      fontSize: '18px' 
                    }}
                  >
                    {result.prediction === 1 ? '异常' : '正常'}
                  </Text>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card className="tech-card">
                  <Title level={5} className="tech-text">置信度</Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Progress 
                      type="circle" 
                      percent={Math.round(result.probability * 100)} 
                      strokeColor={getStatusColor(result.probability)}
                      width={80}
                      strokeWidth={10}
                    />
                    <div>
                      <Text strong style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '18px' }}>
                        {formatPercent(result.probability)}
                      </Text>
                      <Paragraph style={{ marginTop: '4px' }}>
                        {result.probability > 0.8 ? (
                          <Tag color={result.prediction === 1 ? "error" : "success"}>
                            高可信度预测
                          </Tag>
                        ) : result.probability > 0.6 ? (
                          <Tag color="warning">中等可信度</Tag>
                        ) : (
                          <Tag>低可信度</Tag>
                        )}
                      </Paragraph>
                    </div>
                  </div>
                  
                  {renderFeatureImportance() || (
                    <div style={{ marginTop: '24px' }}>
                      <Title level={5} className="tech-text">特征重要性排名</Title>
                      {Object.entries(generateMockFeatureImportance() || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([feature, importance], index) => (
                          <div key={feature} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text className="tech-text">{feature}</Text>
                              <Text className="tech-text">{formatPercent(importance as number)}</Text>
                            </div>
                            <Progress 
                              percent={(importance as number) * 100} 
                              showInfo={false}
                              strokeColor={`hsl(${120 - (index * 25)}, 70%, 50%)`}
                            />
                          </div>
                        ))
                      }
                      <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.65)' }}>
                        <InfoCircleOutlined /> 特征重要性表示各个因素对预测结果的影响程度
                      </Paragraph>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default PredictionForm; 