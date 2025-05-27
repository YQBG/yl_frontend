import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  FileTextOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons';

interface DashboardStatsProps {
  totalRecords: number;
  abnormalRecords: number;
  normalRecords: number;
  abnormalRate: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalRecords,
  abnormalRecords,
  normalRecords,
  abnormalRate
}) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card 
          className="stat-card"
          variant="outlined"
          styles={{ body: { padding: '20px' } }}
          style={{ 
            background: 'rgba(20,30,40,0.6)', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(67, 119, 254, 0.2)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>总记录数</span>}
            value={totalRecords}
            valueStyle={{ color: '#4377FE' }}
            prefix={<FileTextOutlined />}
            suffix="条"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          className="stat-card"
          variant="outlined"
          styles={{ body: { padding: '20px' } }}
          style={{ 
            background: 'rgba(20,30,40,0.6)', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(251, 114, 147, 0.2)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>异常记录数</span>}
            value={abnormalRecords}
            valueStyle={{ color: '#FB7293' }}
            prefix={<WarningOutlined />}
            suffix="条"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          className="stat-card"
          variant="outlined"
          styles={{ body: { padding: '20px' } }}
          style={{ 
            background: 'rgba(20,30,40,0.6)', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(54, 203, 203, 0.2)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>正常记录数</span>}
            value={normalRecords}
            valueStyle={{ color: '#36CBCB' }}
            prefix={<CheckCircleOutlined />}
            suffix="条"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          className="stat-card"
          variant="outlined"
          styles={{ body: { padding: '20px' } }}
          style={{ 
            background: 'rgba(20,30,40,0.6)', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(250, 173, 20, 0.2)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>异常率</span>}
            value={abnormalRate}
            precision={2}
            valueStyle={{ color: '#FAAD14' }}
            prefix={<PercentageOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats; 