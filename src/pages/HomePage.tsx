import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const bgUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80'; // 可替换为更合适的医疗/科技感图片

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Content style={{ minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', padding: 0 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url(${bgUrl}) center/cover no-repeat`,
          zIndex: 0,
          filter: 'blur(2px) brightness(0.7)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Title style={{ color: '#fff', fontSize: 56, fontWeight: 900, textShadow: '0 4px 32px #000' }}>
          医疗数据智能分析平台
        </Title>
        <Title level={2} style={{ color: '#fff', fontWeight: 500, marginBottom: 32, textShadow: '0 2px 16px #000' }}>
          数据可视化 · 智慧医疗 · 科技赋能
        </Title>
        <Paragraph style={{ color: '#fff', fontSize: 20, maxWidth: 600, textAlign: 'center', marginBottom: 40, textShadow: '0 2px 8px #000' }}>
          本平台致力于医疗数据的智能分析与可视化，帮助医疗机构和研究人员高效洞察数据价值，提升医疗服务质量与科研水平。
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ fontSize: 20, padding: '8px 40px', borderRadius: 24 }}
          onClick={() => navigate('/stats')}
        >
          各项数据
        </Button>
      </div>
    </Content>
  );
};

export default HomePage; 