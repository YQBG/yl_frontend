import React from 'react';
import { Card, Typography, Progress, Statistic, Row, Col, Space, Tooltip } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { PredictionResult } from '../types';
import { formatPercent, getStatusColor, getModelName } from '../utils/formatters';

const { Title, Text } = Typography;

interface ModelCardProps {
  model: string;
  result?: PredictionResult;
  loading?: boolean;
  onPredict: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, result, loading, onPredict }) => {
  const accuracy = result?.accuracy || 0;
  const errorCount = result?.error_count || 0;
  const totalRecords = result?.total_records || 0;
  const successCount = totalRecords - errorCount;
  const color = getStatusColor(accuracy);
  const modelDisplayName = getModelName(model);

  return (
    <Card 
      hoverable
      loading={loading}
      className="tech-card"
      style={{ height: '100%' }}
      title={
        <Space>
          <ExperimentOutlined style={{ color }} />
          <span className="tech-title">{modelDisplayName}</span>
        </Space>
      }
      extra={
        <a onClick={onPredict} style={{ color }}>运行预测</a>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {result ? (
          <>
            <Tooltip title={`准确率: ${formatPercent(accuracy)}`}>
              <Progress 
                percent={accuracy * 100} 
                status={accuracy >= 0.7 ? "success" : "exception"}
                strokeColor={color}
                trailColor="rgba(0,0,0,0.1)"
              />
            </Tooltip>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title={<Text className="tech-text">正确预测</Text>}
                  value={successCount}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={<Text className="tech-text">错误预测</Text>}
                  value={errorCount}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Title level={4} className="tech-text">总体准确率</Title>
              <Title level={2} style={{ color, margin: 0 }}>
                {formatPercent(accuracy)}
              </Title>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text className="tech-text">点击运行预测获取模型结果</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ModelCard; 