export type ProjectStatus =
  | "DRAFT"
  | "REVIEW"
  | "REVIEWING"
  | "DEVELOPING"
  | "TESTING"
  | "READY"
  | "LIVE"
  | "ACTIVE"
  | "REJECTED"
  | "ARCHIVED";

export type Project = {
  id: string;
  enterpriseId: string;
  name: string;
  issuer?: string | null;
  legal?: string | null;
  ops?: string | null;
  auditor?: string | null;
  status: ProjectStatus;
  assetType: string;
  description?: string | null;
  acceptInstitutionalInvestors: boolean;
  walletAddress?: string | null;
  network?: string | null;
  assetLocation?: string | null;
  assetDescription?: string | null;
  assetValue?: number | null;
  tokenName?: string | null;
  tokenSymbol?: string | null;
  totalSupply?: number | null;
  tokenDecimals?: number | null;
  initialPrice?: number | null;
  revenueMode?: string | null;
  annualReturn?: number | null;
  payoutFrequency?: string | null;
  capitalProfile?: string | null;
  distributionPolicy?: string | null;
  distributionNotes?: string | null;
  currentStep: number;
};

export type ProjectFile = {
  id: string;
  fileName: string;
  url: string;
  size: number;
  status: string;
  origin: string;
  type: string;
  uploader?: string | null;
  uploadTime?: string | null;
};

export type Doc = ProjectFile;
