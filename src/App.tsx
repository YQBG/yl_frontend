import React from 'react';
import { 
  Routes, 
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 导入页面组件
import HomePage from './pages/HomePage';
import DataPage from './pages/DataPage';
import PredictionPage from './pages/PredictionPage';
import UploadPage from './pages/UploadPage';
import DataStatsPage from './pages/DataStatsPage';
import ReportPage from './pages/ReportPage';

// 导入布局组件
import Header from './components/Header';

// 导入样式
import './assets/styles/global.css';

// 创建根布局组件
const Root: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Outlet />
    </Layout>
  );
};

// 创建路由配置，添加future flag解决警告
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/data" element={<DataPage />} />
      <Route path="/prediction" element={<PredictionPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/stats" element={<DataStatsPage />} />
      <Route path="/report" element={<ReportPage />} />
    </Route>
  ),
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
