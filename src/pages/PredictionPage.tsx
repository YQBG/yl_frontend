import React, { useState } from 'react';
import { Layout, Typography, Row, Col } from 'antd';
import ModelCard from '../components/ModelCard';
import PredictionForm from '../components/PredictionForm';
import { api } from '../services/api';
import type { PredictionResult, SinglePredictionResult } from '../types';

const { Content } = Layout;
const { Title } = Typography;

const PredictionPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, PredictionResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({
    dnn: false,
    cnn: false,
    rnn: false,
    xgb: false,
    rf: false,
  });

  const handlePredict = async (model: string) => {
    setLoading(prev => ({ ...prev, [model]: true }));
    
    try {
      let result;
      
      switch (model) {
        case 'dnn':
          result = await api.predictDNN();
          break;
        case 'cnn':
          result = await api.predictCNN();
          break;
        case 'rnn':
          result = await api.predictRNN();
          break;
        case 'xgb':
          result = await api.predictXGB();
          break;
        case 'rf':
          result = await api.predictRF();
          break;
        default:
          throw new Error('未知模型类型');
      }
      
      setResults(prev => ({ ...prev, [model]: result }));
    } catch (error) {
      console.error(`${model}模型预测失败:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [model]: false }));
    }
  };

  const handleSinglePredict = async (data: Record<string, number>, model: string): Promise<SinglePredictionResult> => {
    try {
      return await api.singlePrediction(data, model);
    } catch (error) {
      console.error('单条预测失败:', error);
      throw error;
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>模型预测</Title>
      
      <PredictionForm onPredict={handleSinglePredict} />
      
      <Title level={3} style={{ margin: '32px 0 24px' }}>批量预测</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <ModelCard 
            model="dnn" 
            result={results.dnn}
            loading={loading.dnn}
            onPredict={() => handlePredict('dnn')}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <ModelCard 
            model="cnn" 
            result={results.cnn}
            loading={loading.cnn}
            onPredict={() => handlePredict('cnn')}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <ModelCard 
            model="rnn" 
            result={results.rnn}
            loading={loading.rnn}
            onPredict={() => handlePredict('rnn')}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <ModelCard 
            model="xgb" 
            result={results.xgb}
            loading={loading.xgb}
            onPredict={() => handlePredict('xgb')}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <ModelCard 
            model="rf" 
            result={results.rf}
            loading={loading.rf}
            onPredict={() => handlePredict('rf')}
          />
        </Col>
      </Row>
    </Content>
  );
};

export default PredictionPage; 