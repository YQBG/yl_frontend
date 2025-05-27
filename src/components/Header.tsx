import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Space, theme, Badge, Dropdown, Button, Avatar } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  FileOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  UserOutlined,
  BellOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

// 定义菜单项接口
interface MenuItem {
  key: string;
  icon: JSX.Element;
  label: JSX.Element;
  children?: MenuItem[];
}

const Header: React.FC = () => {
  const location = useLocation();
  const [status, setStatus] = useState<string>('检查中...');
  const [current, setCurrent] = useState(location.pathname);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { token } = theme.useToken();

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const result = await api.getStatus();
        setStatus(result.status);
      } catch (error) {
        setStatus('离线');
      }
    };

    checkApiStatus();
    const intervalId = setInterval(checkApiStatus, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 菜单项数据
  const menuItems: MenuItem[] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/data',
      icon: <AppstoreOutlined />,
      label: <Link to="/data">数据汇总</Link>,
    },
    {
      key: '/prediction',
      icon: <ExperimentOutlined />,
      label: <Link to="/prediction">模型预测</Link>,
    },
    {
      key: '/upload',
      icon: <FileOutlined />,
      label: <Link to="/upload">文件上传</Link>,
    },
    {
      key: '/stats',
      icon: <LineChartOutlined />,
      label: <Link to="/stats">数据可视化</Link>,
    },
    {
      key: '/report',
      icon: <RobotOutlined />,
      label: <Link to="/report">AI分析报告</Link>,
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: '1',
      label: '个人设置',
    },
    {
      key: '2',
      label: '系统设置',
    },
    {
      key: '3',
      label: '退出登录',
    },
  ];

  // 通知下拉菜单
  const notificationMenuItems = [
    {
      key: '1',
      label: '模型预测已完成',
    },
    {
      key: '2',
      label: '新数据上传成功',
    },
    {
      key: '3',
      label: '系统更新可用',
    },
  ];

  return (
    <AntHeader style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 10, 
      width: '100%', 
      background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
    }}>
      {/* 动态背景元素 */}
      <div className="header-glow" style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67, 119, 254, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        top: '-250px',
        left: '-250px',
        pointerEvents: 'none',
      }} />
      
      <div className="header-glow" style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(54, 203, 203, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
        bottom: '-150px',
        right: '30%',
        pointerEvents: 'none',
      }} />

      {/* 标志和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <Space>
          <div className="logo-container" style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div className="logo-pulse" style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(22, 119, 255, 0.1)',
              animation: 'pulse 2s infinite',
            }} />
            <LineChartOutlined style={{ 
              fontSize: '28px', 
              color: token.colorPrimary,
              position: 'relative',
              zIndex: 1,
            }} />
          </div>
          <Title level={3} style={{ 
            margin: 0, 
            color: '#fff',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #fff, #36CBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            医疗数据分析系统
          </Title>
        </Space>
      </div>

      {/* 导航菜单 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <ul className="dynamic-menu" style={{
          display: 'flex',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          {menuItems.map((item, index) => (
            <li 
              key={item.key}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{
                padding: '0 20px',
                position: 'relative',
              }}
            >
              <Link 
                to={item.key} 
                style={{
                  color: current === item.key ? '#36CBCB' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  height: '64px',
                  transition: 'all 0.3s',
                }}
              >
                <span style={{ 
                  marginRight: '8px',
                  fontSize: '18px',
                  transition: 'transform 0.3s',
                  transform: hoverIndex === index ? 'scale(1.2)' : 'scale(1)',
                }}>
                  {item.icon}
                </span>
                {item.label.props.children}
              </Link>
              {current === item.key && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: '30px',
                  height: '3px',
                  background: '#36CBCB',
                  transform: 'translateX(-50%)',
                  borderRadius: '3px 3px 0 0',
                }} />
              )}
              {hoverIndex === index && current !== item.key && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: '20px',
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  transform: 'translateX(-50%)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'all 0.3s',
                }} />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧工具栏 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        zIndex: 1,
      }}>
        <Space size={16}>
          <div style={{ color: '#fff', fontSize: '14px' }}>
            API状态: <span style={{ 
              color: status === '运行中' ? '#52c41a' : '#f5222d',
              fontWeight: 'bold',
            }}>{status}</span>
          </div>

          <Dropdown menu={{ items: notificationMenuItems }} placement="bottomRight">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ color: '#fff', fontSize: '18px' }} />} />
            </Badge>
          </Dropdown>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
            } />
          </Dropdown>
        </Space>
      </div>

      {/* 添加CSS动画 */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.3;
            }
            100% {
              transform: scale(1);
              opacity: 0.6;
            }
          }
          
          .dynamic-menu li:hover {
            background: rgba(255, 255, 255, 0.05);
          }
        `}
      </style>
    </AntHeader>
  );
};

export default Header; 