export interface MedicalRecord {
  id: number;
  patientId: string;
  月统筹金额: number;
  月药品金额: number;
  本次审批金额: number;
  月就诊次数: number;
  起付标准以上自负比例金额: number;
  非账户支付金额: number;
  个人账户金额: number;
  可用账户报销金额: number;
  统筹支付金额: number;
  顺序号: number;
  药品费发生金额: number;
  result: number;
}

export interface PredictionResultItem {
  id: number;
  prediction: number;
  probability: number;
}

export interface PredictionResult {
  success: boolean;
  model: string;
  accuracy: number;
  error_count: number;
  total_records: number;
  error?: string;
  results?: PredictionResultItem[];
}

export interface SinglePredictionResult {
  success: boolean;
  model: string;
  prediction: number;
  probability: number;
  feature_importance?: Record<string, number>;
  error?: string;
} 