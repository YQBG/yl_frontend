import React from 'react';
import { Layout, Typography, Divider } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      background: '#f0f2f5',
      padding: '24px',
    }}>
      <Divider />
      <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
        医疗数据分析系统 &copy; {currentYear}
      </Text>
      <br />
      <Text style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
        使用 React, TypeScript, Ant Design 和 Charts 构建
      </Text>
      <div style={{ marginTop: '8px' }}>
        <Link href="#" target="_blank" style={{ fontSize: '12px' }}>隐私政策</Link>
        <Divider type="vertical" />
        <Link href="#" target="_blank" style={{ fontSize: '12px' }}>使用条款</Link>
        <Divider type="vertical" />
        <Link href="#" target="_blank" style={{ fontSize: '12px' }}>联系我们</Link>
      </div>
    </AntFooter>
  );
};

export default Footer; 