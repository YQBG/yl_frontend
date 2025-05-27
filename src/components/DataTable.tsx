import React, { useState } from 'react';
import { Table, Input, Space, Button, Typography, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { MedicalRecord } from '../types';
import { formatNumber } from '../utils/formatters';

const { Title } = Typography;

interface DataTableProps {
  data: MedicalRecord[];
  loading?: boolean;
  onReload?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, loading, onReload }) => {
  const [searchText, setSearchText] = useState('');
  
  const filteredData = data.filter(record => {
    if (!searchText) return true;
    
    const searchTextLower = searchText.toLowerCase();
    
    return Object.values(record).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTextLower);
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTextLower);
      }
      return false;
    });
  });
  
  const handleExportCSV = () => {
    const headers = [
      'ID', '患者ID', '月统筹金额', '月药品金额', '本次审批金额', 
      '月就诊次数', '起付标准以上自负比例金额', '非账户支付金额',
      '个人账户金额', '可用账户报销金额', '统筹支付金额', '顺序号',
      '药品费发生金额', '预测结果'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => [
        record.id,
        record.patientId,
        record.月统筹金额,
        record.月药品金额,
        record.本次审批金额,
        record.月就诊次数,
        record.起付标准以上自负比例金额,
        record.非账户支付金额,
        record.个人账户金额,
        record.可用账户报销金额,
        record.统筹支付金额,
        record.顺序号,
        record.药品费发生金额,
        record.result
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `医疗数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '患者ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: '月统筹金额',
      dataIndex: '月统筹金额',
      key: '月统筹金额',
      render: (value: number) => formatNumber(value),
      sorter: (a: MedicalRecord, b: MedicalRecord) => a.月统筹金额 - b.月统筹金额,
    },
    {
      title: '月药品金额',
      dataIndex: '月药品金额',
      key: '月药品金额',
      render: (value: number) => formatNumber(value),
      sorter: (a: MedicalRecord, b: MedicalRecord) => a.月药品金额 - b.月药品金额,
    },
    {
      title: '本次审批金额',
      dataIndex: '本次审批金额',
      key: '本次审批金额',
      render: (value: number) => formatNumber(value),
      sorter: (a: MedicalRecord, b: MedicalRecord) => a.本次审批金额 - b.本次审批金额,
    },
    {
      title: '月就诊次数',
      dataIndex: '月就诊次数',
      key: '月就诊次数',
    },
    {
      title: '预测结果',
      dataIndex: 'result',
      key: 'result',
      render: (value: number) => (
        <Tag color={value === 1 ? 'error' : 'success'}>
          {value === 1 ? '异常' : '正常'}
        </Tag>
      ),
      filters: [
        { text: '正常', value: 0 },
        { text: '异常', value: 1 },
      ],
      onFilter: (value: any, record: MedicalRecord) => record.result === Number(value),
    },
  ];
  
  return (
    <div className="data-card">
      <div style={{ padding: '20px 20px 0' }}>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>医疗记录数据</Title>
          
          <Space>
            <Input
              placeholder="搜索..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExportCSV}
            >
              导出数据
            </Button>
            
            {onReload && (
              <Button 
                icon={<ReloadOutlined />} 
                onClick={onReload}
              >
                刷新
              </Button>
            )}
          </Space>
        </Space>
      </div>
      
      <Table 
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true, 
          showTotal: (total) => `共 ${total} 条记录` 
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default DataTable; 