export type Tender = {
  _id: string;
  tenderNo: string;
  description: string;
  tenderDate: string;
  tenderType: string;
  status: string;
  position: string;
  tenderingDepartment: string;
  client: string;
  tenderValue: number;
  emdAmount: number;
  bgAmount: number;
  emdRefundDate?: string;
  emdRefundStatus?: string;
  bgRefundStatus?: string;
  owner?: string;
  remarks?: string;
};
