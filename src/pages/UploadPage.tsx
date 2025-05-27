import React from 'react';
import { Layout, Typography } from 'antd';
import FileUploader from '../components/FileUploader';
import { api } from '../services/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const UploadPage: React.FC = () => {
  const handleUpload = async (file: File, model: string) => {
    try {
      return await api.uploadFileForPrediction(file, model);
    } catch (error) {
      console.error('文件上传预测失败:', error);
      throw error;
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '16px' }}>文件上传预测</Title>
      
      <Paragraph style={{ marginBottom: '24px' }}>
        通过上传CSV或Excel文件进行批量预测。系统将分析文件中的数据并给出预测结果。
      </Paragraph>
      
      <FileUploader onUpload={handleUpload} />
      
      <div style={{ marginTop: '24px' }}>
        <Title level={4}>使用说明</Title>
        <Paragraph>
          1. 支持的文件格式: CSV (.csv) 和 Excel (.xls, .xlsx)
        </Paragraph>
        <Paragraph>
          2. 文件大小限制: 50MB
        </Paragraph>
        <Paragraph>
          3. 文件必须包含以下列: 月统筹金额, 月药品金额, 本次审批金额, 月就诊次数, 起付标准以上自负比例金额, 非账户支付金额, 个人账户金额, 可用账户报销金额, 统筹支付金额, 顺序号, 药品费发生金额
        </Paragraph>
        <Paragraph>
          4. 可以选择不同的模型进行预测
        </Paragraph>
        <Paragraph>
          5. 预测完成后，系统将给出每条记录的预测结果
        </Paragraph>
      </div>
    </Content>
  );
};

export default UploadPage; 