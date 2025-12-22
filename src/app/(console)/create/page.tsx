"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useWatch,
  type FieldPath,
  type FieldPathValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assetDetailsSchema,
  blockchainSchema,
  projectBasicsSchema,
  revenueModelSchema,
  tokenSettingsSchema,
  type AssetDetailsInput,
  type BlockchainInput,
  type ProjectBasicsInput,
  type RevenueModelInput,
  type TokenSettingsInput,
} from "@/lib/validators";
import { WizardLayout } from "@/components/figma-ui/WizardLayout";
import { StepContainer } from "@/components/figma-ui/StepContainer";
import { StepProjectBasics } from "@/components/figma-ui/StepProjectBasics";
import { StepBlockchainSettings } from "@/components/figma-ui/StepBlockchainSettings";
import { StepAssetDetails } from "@/components/figma-ui/StepAssetDetails";
import { StepTokenSettings } from "@/components/figma-ui/StepTokenSettings";
import { StepRevenueModel } from "@/components/figma-ui/StepRevenueModel";
import { StepReviewCreate } from "@/components/figma-ui/StepReviewCreate";
import { Project, Doc } from "@/types/project";

const assetTypes = [
  "Private equity stakes",
  "Venture capital investments",
  "Debt instruments",
  "Art & collectibles",
  "Commodities",
  "Intellectual property",
  "Revenue streams",
  "Infrastructure products",
  "Sports teams and clubs",
  "Carbon credits",
  "Music and film rights",
  "Luxury goods",
  "Precious metals",
  "Agricultural assets",
  "Gaming",
  "Healthcare",
  "Others",
];

const networks = [
  { label: "Ethereum (Mainnet)", value: "Ethereum" },
  { label: "Polygon (Mainnet)", value: "Polygon" },
  { label: "BNB Smart Chain", value: "BSC" },
  { label: "Arbitrum", value: "Arbitrum" },
  { label: "Avalanche", value: "Avalanche" },
  { label: "Sepolia (Testnet)", value: "Sepolia" },
  { label: "Mumbai (Testnet)", value: "Mumbai" },
];

const revenueModes = [
  "Fixed return",
  "Variable / performance-based return",
  "Hybrid / structured return",
  "Other",
];

const capitalProfiles = [
  "Bullet",
  "Amortizing",
  "Perpetual",
  "Open-ended",
];

const distributionPolicies = ["Distribute", "Reinvest", "Mixed"];
const payoutFrequencies = [
  "Monthly",
  "Quarterly",
  "Semi-annual",
  "Annual",
  "Event-based",
];

const wizardSteps = [
  { id: 1, title: "Project Basics" },
  { id: 2, title: "Blockchain Settings" },
  { id: 3, title: "Asset Details" },
  { id: 4, title: "Token Settings" },
  { id: 5, title: "Revenue Model" },
  { id: 6, title: "Review & Create" },
];

const revenueModeOptions = [
  {
    value: revenueModes[0],
    label: revenueModes[0],
    description: "Stable fixed return profile.",
  },
  {
    value: revenueModes[1],
    label: revenueModes[1],
    description: "Returns vary with project performance.",
  },
  {
    value: revenueModes[2],
    label: revenueModes[2],
    description: "Blend of fixed and performance-based returns.",
  },
  {
    value: revenueModes[3],
    label: revenueModes[3],
    description: "Custom return structure.",
  },
];

const capitalProfileOptions = [
  {
    value: capitalProfiles[0],
    label: capitalProfiles[0],
    description: "Single bullet payment at maturity.",
  },
  {
    value: capitalProfiles[1],
    label: capitalProfiles[1],
    description: "Amortizing payments over time.",
  },
  {
    value: capitalProfiles[2],
    label: capitalProfiles[2],
    description: "No fixed maturity date.",
  },
  {
    value: capitalProfiles[3],
    label: capitalProfiles[3],
    description: "Open-ended liquidity profile.",
  },
];

const distributionPolicyOptions = [
  {
    value: distributionPolicies[0],
    label: distributionPolicies[0],
    description: "Distribute cash flow regularly.",
  },
  {
    value: distributionPolicies[1],
    label: distributionPolicies[1],
    description: "Reinvest distributions into the asset.",
  },
  {
    value: distributionPolicies[2],
    label: distributionPolicies[2],
    description: "Mix of distribution and reinvestment.",
  },
];

const payoutFrequencyOptions = payoutFrequencies.map((freq) => ({
  value: freq,
  label: freq,
}));

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function SuccessBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      {message}
    </div>
  );
}

export default function CreateWizardPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [finalizing, setFinalizing] = useState(false);

  const basicsForm = useForm<ProjectBasicsInput>({
    resolver: zodResolver(projectBasicsSchema),
    defaultValues: {
      projectName: "",
      assetType: "",
      projectDescription: "",
      acceptInstitutionalInvestors: false,
    },
  });

  const chainForm = useForm<BlockchainInput>({
    resolver: zodResolver(blockchainSchema),
    defaultValues: {
      walletAddress: "",
      network: "",
    },
  });

  const assetForm = useForm<AssetDetailsInput>({
    resolver: zodResolver(assetDetailsSchema),
    defaultValues: {
      assetLocation: "",
      assetDescription: "",
      assetValue: undefined,
    },
  });

  const tokenForm = useForm<TokenSettingsInput>({
    resolver: zodResolver(tokenSettingsSchema),
    defaultValues: {
      tokenName: "",
      tokenSymbol: "",
      totalSupply: undefined,
      tokenDecimals: 18,
      initialPrice: undefined,
    },
  });

  const revenueForm = useForm<RevenueModelInput>({
    resolver: zodResolver(revenueModelSchema),
    defaultValues: {
      revenueMode: "",
      capitalProfile: "",
      distributionPolicy: "",
      payoutFrequency: "",
      annualReturn: 0,
      distributionNotes: "",
    },
  });

  useEffect(() => {
    if (!project) return;
    basicsForm.reset({
      projectName: project.name ?? "",
      assetType: project.assetType ?? "",
      projectDescription: project.description ?? "",
      acceptInstitutionalInvestors: project.acceptInstitutionalInvestors,
    });
    chainForm.reset({
      walletAddress: project.walletAddress ?? "",
      network: project.network ?? "",
    });
    assetForm.reset({
      assetLocation: project.assetLocation ?? "",
      assetDescription: project.assetDescription ?? "",
      assetValue: project.assetValue ?? undefined,
    });
    tokenForm.reset({
      tokenName: project.tokenName ?? "",
      tokenSymbol: project.tokenSymbol ?? "",
      totalSupply: project.totalSupply ?? undefined,
      tokenDecimals: 18,
      initialPrice: project.initialPrice ?? undefined,
    });
    revenueForm.reset({
      revenueMode: project.revenueMode ?? "",
      capitalProfile: project.capitalProfile ?? "",
      distributionPolicy: project.distributionPolicy ?? "",
      payoutFrequency: project.payoutFrequency ?? "",
      annualReturn: project.annualReturn ?? 0,
      distributionNotes: project.distributionNotes ?? "",
    });
  }, [project, basicsForm, chainForm, assetForm, tokenForm, revenueForm]);

  useEffect(() => {
    if (!projectId) return;
    const loadDocs = async () => {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents ?? []);
      }
    };
    loadDocs();
  }, [projectId]);

  useEffect(() => {
    const handleBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));
    window.addEventListener("wizardBack", handleBack);
    return () => window.removeEventListener("wizardBack", handleBack);
  }, []);

    const handleStep1 = async (values: ProjectBasicsInput) => {
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/projects/step1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, projectId }),
    });
    if (!res.ok) {
      setError("Failed to save project basics. Please review the form.");
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setProjectId(data.project.id);
    setCurrentStep(2);
    setSuccess("Project basics saved.");
  };

  const handleStep2 = async (values: BlockchainInput) => {
    if (!projectId) {
      setError("Please complete step 1 before continuing.");
      return;
    }
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/projects/${projectId}/step2`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Failed to save blockchain settings. Please try again.");
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setCurrentStep(3);
    setSuccess("Blockchain settings saved.");
  };

  const handleStep3 = async (values: AssetDetailsInput) => {
    if (!projectId) {
      setError("Please complete step 1 before continuing.");
      return;
    }
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/projects/${projectId}/step3`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Failed to save asset details. Please try again.");
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setCurrentStep(4);
    setSuccess("Asset details saved.");
  };

  const handleStep4 = async (values: TokenSettingsInput) => {
    if (!projectId) {
      setError("Please complete step 1 before continuing.");
      return;
    }
    const assetValueForTokens =
      project?.assetValue ?? assetForm.getValues("assetValue");
    if (!assetValueForTokens) {
      setError("Please provide Asset Value in Asset Details.");
      return;
    }
    if (!values.initialPrice) {
      setError("Please provide Initial Token Price.");
      return;
    }
    const computedSupply = Math.floor(
      Number(assetValueForTokens) / Number(values.initialPrice),
    );
    if (!Number.isFinite(computedSupply) || computedSupply <= 0) {
      setError("Asset Value and Initial Price result in an invalid total supply.");
      return;
    }

    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/projects/${projectId}/step4`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        totalSupply: computedSupply,
        tokenDecimals: 18,
      }),
    });
    if (!res.ok) {
      setError("Failed to save token settings. Please try again.");
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setCurrentStep(5);
    setSuccess("Token settings saved.");
  };

  const handleStep5 = async (values: RevenueModelInput) => {
    if (!projectId) {
      setError("Please complete step 1 before continuing.");
      return;
    }
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/projects/${projectId}/step5`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Failed to save revenue model. Please try again.");
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setCurrentStep(6);
    setSuccess("Revenue model saved.");
  };

  const uploadDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0 || !projectId) return;
    setError(null);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setError(`Failed to upload document ${file.name}. Please verify file type and size.`);
        return;
      }
    }
    const refreshed = await fetch(`/api/projects/${projectId}/documents`);
    if (refreshed.ok) {
      const data = await refreshed.json();
      setDocuments(data.documents ?? []);
      setSuccess("Documents uploaded.");
    }
  };

  const handleFinalize = async () => {
    if (!projectId) {
      setError("Please complete all required steps.");
      return;
    }
    try {
      setFinalizing(true);
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/projects/${projectId}/finalize`, {
        method: "POST",
      });
      const data = await res.json();
      setFinalizing(false);
      if (!res.ok) {
        const missing = data?.missing?.join(", ");
        setError(
          missing
            ? `Missing required fields: ${missing}`
            : "Project creation failed.",
        );
        return;
      }
      setProject(data.project);
      setSuccess("Project created. Redirecting to dashboard...");
      const createdId = data?.project?.id ?? projectId;
      router.push(`/dashboard?projectId=${createdId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setFinalizing(false);
      setError("Project creation failed. Please try again.");
    }
  };

  const basicsValues = useWatch({
    control: basicsForm.control,
    defaultValue: basicsForm.getValues(),
  }) as ProjectBasicsInput;
  const chainValues = useWatch({
    control: chainForm.control,
    defaultValue: chainForm.getValues(),
  }) as BlockchainInput;
  const assetValues = useWatch({
    control: assetForm.control,
    defaultValue: assetForm.getValues(),
  }) as AssetDetailsInput;
  const tokenValues = useWatch({
    control: tokenForm.control,
    defaultValue: tokenForm.getValues(),
  }) as TokenSettingsInput;
  const revenueValues = useWatch({
    control: revenueForm.control,
    defaultValue: revenueForm.getValues(),
  }) as RevenueModelInput;

  const basicsErrors = {
    projectName: basicsForm.formState.errors.projectName?.message,
    assetType: basicsForm.formState.errors.assetType?.message,
    projectDescription: basicsForm.formState.errors.projectDescription?.message,
    acceptInstitutionalInvestors:
      basicsForm.formState.errors.acceptInstitutionalInvestors?.message,
  };
  const chainErrors = {
    walletAddress: chainForm.formState.errors.walletAddress?.message,
    network: chainForm.formState.errors.network?.message,
  };
  const assetErrors = {
    assetLocation: assetForm.formState.errors.assetLocation?.message,
    assetDescription: assetForm.formState.errors.assetDescription?.message,
    assetValue: assetForm.formState.errors.assetValue?.message,
  };
  const tokenErrors = {
    tokenName: tokenForm.formState.errors.tokenName?.message,
    tokenSymbol: tokenForm.formState.errors.tokenSymbol?.message,
    initialPrice: tokenForm.formState.errors.initialPrice?.message,
  };
  const revenueErrors = {
    revenueMode: revenueForm.formState.errors.revenueMode?.message,
    capitalProfile: revenueForm.formState.errors.capitalProfile?.message,
    distributionPolicy: revenueForm.formState.errors.distributionPolicy?.message,
    payoutFrequency: revenueForm.formState.errors.payoutFrequency?.message,
    annualReturn: revenueForm.formState.errors.annualReturn?.message,
    distributionNotes: revenueForm.formState.errors.distributionNotes?.message,
  };

  const updateBasics = <K extends FieldPath<ProjectBasicsInput>>(
    key: K,
    value: FieldPathValue<ProjectBasicsInput, K>
  ) => {
    basicsForm.setValue(key, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateChain = <K extends FieldPath<BlockchainInput>>(
    key: K,
    value: FieldPathValue<BlockchainInput, K>
  ) => {
    chainForm.setValue(key, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateAsset = <K extends FieldPath<AssetDetailsInput>>(
    key: K,
    value: FieldPathValue<AssetDetailsInput, K> | undefined
  ) => {
    assetForm.setValue(key, value as FieldPathValue<AssetDetailsInput, K>, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateToken = <K extends FieldPath<TokenSettingsInput>>(
    key: K,
    value: FieldPathValue<TokenSettingsInput, K> | undefined
  ) => {
    tokenForm.setValue(key, value as FieldPathValue<TokenSettingsInput, K>, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateRevenue = <K extends FieldPath<RevenueModelInput>>(
    key: K,
    value: FieldPathValue<RevenueModelInput, K> | undefined
  ) => {
    revenueForm.setValue(key, value as FieldPathValue<RevenueModelInput, K>, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const submitStep1 = () => {
    basicsForm.handleSubmit(handleStep1)();
    return false;
  };

  const submitStep2 = () => {
    chainForm.handleSubmit(handleStep2)();
    return false;
  };

  const submitStep3 = () => {
    assetForm.handleSubmit(handleStep3)();
    return false;
  };

  const submitStep4 = () => {
    tokenForm.handleSubmit(handleStep4)();
    return false;
  };

  const submitStep5 = () => {
    revenueForm.handleSubmit(handleStep5)();
    return false;
  };

  const submitFinalize = () => {
    if (finalizing) return false;
    void handleFinalize();
    return false;
  };

  const tokenPreviewAssetValue = project?.assetValue ?? assetValues.assetValue ?? null;
  const autoTotalSupply =
    tokenPreviewAssetValue &&
    tokenValues.initialPrice &&
    Number(tokenValues.initialPrice) > 0
      ? Math.floor(
          Number(tokenPreviewAssetValue) / Number(tokenValues.initialPrice),
        )
      : null;
  const revenueProjectPreview = {
    assetType: project?.assetType ?? basicsValues.assetType,
    tokenSymbol: project?.tokenSymbol ?? tokenValues.tokenSymbol,
    totalSupply: project?.totalSupply ?? autoTotalSupply ?? null,
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      totalSteps={wizardSteps.length}
      steps={wizardSteps}
      onNext={() => {}}
      onBack={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
    >
      <div className="space-y-6">
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        {currentStep === 1 && (
          <StepContainer
            title="Project Basics"
            description="Define the fundamental information about your RWA project"
            onValidate={submitStep1}
          >
            <StepProjectBasics
              values={basicsValues}
              errors={basicsErrors}
              assetTypes={assetTypes}
              onChange={updateBasics}
            />
          </StepContainer>
        )}

        {currentStep === 2 && (
          <StepContainer
            title="Blockchain Settings"
            description="Configure wallet address and network"
            onValidate={submitStep2}
          >
            <StepBlockchainSettings
              values={chainValues}
              errors={chainErrors}
              networks={networks}
              onChange={updateChain}
            />
          </StepContainer>
        )}

        {currentStep === 3 && (
          <StepContainer
            title="Asset Details"
            description="Provide details and upload supporting documents"
            onValidate={submitStep3}
          >
            <StepAssetDetails
              values={assetValues}
              errors={assetErrors}
              documents={documents}
              onChange={updateAsset}
              onUpload={uploadDocuments}
            />
          </StepContainer>
        )}

        {currentStep === 4 && (
          <StepContainer
            title="Token Settings"
            description="Configure token parameters"
            onValidate={submitStep4}
          >
            <StepTokenSettings
              values={tokenValues}
              errors={tokenErrors}
              assetValue={tokenPreviewAssetValue}
              onChange={updateToken}
            />
          </StepContainer>
        )}

        {currentStep === 5 && (
          <StepContainer
            title="Revenue Model"
            description="Define the revenue structure and distribution strategy"
            onValidate={submitStep5}
          >
            <StepRevenueModel
              values={revenueValues}
              errors={revenueErrors}
              revenueModes={revenueModeOptions}
              capitalProfiles={capitalProfileOptions}
              distributionPolicies={distributionPolicyOptions}
              distributionFrequencies={payoutFrequencyOptions}
              projectPreview={revenueProjectPreview}
              onChange={updateRevenue}
            />
          </StepContainer>
        )}

        {currentStep === 6 && (
          <StepContainer
            title="Review & Create"
            description="Review all details before creating your project."
            onValidate={submitFinalize}
            isLastStep
          >
            <StepReviewCreate project={project} documents={documents} />
            {finalizing && (
              <div className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-800">
                Finalizing your project. Please wait...
              </div>
            )}
          </StepContainer>
        )}
      </div>
    </WizardLayout>
  );
}
