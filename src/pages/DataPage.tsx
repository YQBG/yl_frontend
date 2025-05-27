import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, Alert } from 'antd';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import type { MedicalRecord } from '../types';

const { Content } = Layout;
const { Title } = Typography;

const DataPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAllPredictionResults();
      setData(response);
    } catch (err) {
      console.error('获取数据失败:', err);
      setError('获取数据失败，请稍后重试或联系管理员。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>医疗数据分析</Title>
      
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}
      
      {loading && data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <DataTable data={data} loading={loading} onReload={fetchData} />
      )}
    </Content>
  );
};

export default DataPage; 