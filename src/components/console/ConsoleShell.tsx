"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  FileText,
  Filter,
  Home,
  LayoutGrid,
  Layers,
  Monitor,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wallet,
  X,
  Trash2,
} from "lucide-react";
import type { Project } from "@/types/project";

type SectionKey =
  | "overview"
  | "home"
  | "digital-asset"
  | "offerings"
  | "offering-form"
  | "whitelist"
  | "transfers"
  | "investors"
  | "documents"
  | "investment-portal"
  | "edit-portal";

type PortalState =
  | "NOT_PUBLISHED"
  | "PUBLISHING_TO_TEST"
  | "TEST_READY"
  | "PROMOTING_TO_PROD"
  | "PROD_LIVE"
  | "DEPLOY_FAILED";

type SecondaryItem = {
  id: SectionKey;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type SecondaryGroup = {
  title: string;
  items: SecondaryItem[];
};

const overviewItems: SecondaryItem[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "digital-asset", label: "Digital assets", icon: LayoutGrid },
  { id: "offerings", label: "Digital asset offerings", icon: Layers },
  {
    id: "edit-portal",
    label: "Multi-assets portal editor",
    icon: Settings,
    disabled: true,
  },
];

const fullSecondaryGroups: SecondaryGroup[] = [
  {
    title: "General",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "digital-asset", label: "My digital asset", icon: LayoutGrid },
      { id: "offerings", label: "My offerings", icon: Layers },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "whitelist", label: "Whitelist requests", icon: ShieldCheck },
      { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
      { id: "investors", label: "Investors", icon: Users },
      { id: "documents", label: "Documents", icon: FileText },
    ],
  },
  {
    title: "Portal",
    items: [
      { id: "investment-portal", label: "My investment portal", icon: Monitor },
      { id: "edit-portal", label: "Edit investment portal", icon: Settings },
    ],
  },
];

const fullSecondaryItems = fullSecondaryGroups.flatMap(
  (group) => group.items,
);

const sectionMeta: Record<SectionKey, { title: string; subtitle?: string }> = {
  overview: {
    title: "Overview",
  },
  home: {
    title: "Welcome to Your Digital Asset's dashboard!",
    subtitle:
      "Hello Your Digital Asset, here we show you everything that is happening with your digital asset",
  },
  "digital-asset": {
    title: "My company digital asset",
    subtitle: "All the details about your digital asset.",
  },
  offerings: {
    title: "My offerings",
    subtitle: "Manage and track your digital asset offerings.",
  },
  "offering-form": {
    title: "Digital Asset Offering Information",
    subtitle: "Please review the information carefully before proceeding.",
  },
  whitelist: {
    title: "Whitelist requests",
    subtitle: "Latest KYC requests from potential investors.",
  },
  transfers: {
    title: "Transfers",
    subtitle: "Bank and crypto transfers from your store will appear here.",
  },
  investors: {
    title: "Investors",
    subtitle: "Investor activity and verification.",
  },
  documents: {
    title: "Documents management",
    subtitle: "Configure required documents for whitelist requests.",
  },
  "investment-portal": {
    title: "My investment portal",
    subtitle: "Set up and publish your investment portal.",
  },
  "edit-portal": {
    title: "Multi-assets portal editor",
    subtitle: "Coming soon.",
  },
};

const overviewMetaOverrides: Partial<
  Record<SectionKey, { title: string; subtitle?: string }>
> = {
  "digital-asset": {
    title: "Digital assets",
    subtitle: "Track your digital assets performance.",
  },
  offerings: {
    title: "Digital asset offerings",
    subtitle: "Manage and track your offerings.",
  },
};


// Asset type value to display label mapping
const ASSET_TYPE_MAP: Record<string, string> = {
  'private_equity': 'Private Equity',
  'debt': 'Debt',
  'real_estate': 'Real Estate',
  'art': 'Art',
  'carbon_credits': 'Carbon Credits',
  'commodities': 'Commodities',
  'infrastructure': 'Infrastructure',
  'other': 'Other',
};

function getAssetTypeLabel(assetType: string | null | undefined): string {
  if (!assetType) return 'Equity'; // Default fallback
  return ASSET_TYPE_MAP[assetType] || assetType;
}

const STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  DRAFT: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
  REVIEWING: {
    label: "Reviewing",
    color: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  DEVELOPING: {
    label: "Developing",
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
  TESTING: {
    label: "Testing",
    color: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
  },
  READY: {
    label: "Ready",
    color: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  LIVE: {
    label: "Live",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  ARCHIVED: {
    label: "Archived",
    color: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

function getStatusMeta(status?: string | null) {
  if (!status) {
    return { label: "Draft", color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };
  }
  const key = status.toUpperCase();
  return STATUS_META[key] ?? {
    label: status,
    color: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  };
}

function StatusPill({ status }: { status?: string | null }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// Default project info (used when no projectId is provided)
const defaultProjectInfo = {
  name: "ASSET",
  displayName: "Brickken Asset",
  type: "Equity",
  address: "0xb2AEf5aB0721689F9470eE3e9361Bcd16183dD",
  chain: "Ethereum",
  status: "Draft",
};

type ButtonVariant = "primary" | "outline" | "ghost";

type ConsoleButtonProps = {
  label: string;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  onClick?: () => void;
  className?: string;
};

function ConsoleButton({
  label,
  icon: Icon,
  variant = "primary",
  onClick,
  className = "",
}: ConsoleButtonProps) {
  const variantClass =
    variant === "primary"
      ? "console-btn-primary"
      : variant === "outline"
        ? "console-btn-outline"
        : "console-btn-ghost";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`console-btn ${variantClass} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

function ConsoleIconButton({
  icon: Icon,
  label,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <button type="button" className={`console-icon-btn ${className}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`console-card ${className}`}>{children}</div>;
}

function PanelStrong({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`console-card console-card-strong ${className}`}>
      {children}
    </div>
  );
}

function Stagger({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={`console-stagger ${className}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {children}
    </div>
  );
}

function StatTile({
  label,
  value,
  helper,
  tone = "strong",
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "soft" | "strong";
}) {
  const toneClass =
    tone === "strong" ? "console-card console-card-strong" : "console-card";
  return (
    <div className={`${toneClass} p-4`}>
      <p className="text-xs uppercase text-[color:var(--console-muted)]">
        {label}
      </p>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--console-text)]">
        {value}
      </div>
      {helper ? (
        <p className="mt-1 text-xs text-[color:var(--console-muted)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-[color:var(--console-text)]" />
      <h2 className="text-sm font-semibold text-[color:var(--console-text)]">
        {title}
      </h2>
    </div>
  );
}

function FilterInput({
  label,
  placeholder,
  icon: Icon,
  iconPosition = "left",
  inputClassName = "w-28",
}: {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  iconPosition?: "left" | "right";
  inputClassName?: string;
}) {
  const iconLeft = iconPosition === "left";
  return (
    <div className="flex flex-col gap-1 text-[10px] text-[color:var(--console-muted)]">
      <div className="relative">
        <Icon
          className={`absolute ${
            iconLeft ? "left-3" : "right-3"
          } top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]`}
        />
        <input
          className={`console-input ${inputClassName} ${
            iconLeft ? "pl-9" : "pr-8"
          }`}
          placeholder={placeholder}
          readOnly
        />
      </div>
      <span>{label}</span>
    </div>
  );
}

function ChartFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterInput
        label="Start date"
        placeholder="YYYY/MM/DD"
        icon={Calendar}
      />
      <FilterInput
        label="End date"
        placeholder="YYYY/MM/DD"
        icon={Calendar}
      />
      <FilterInput
        label="Time interval"
        placeholder="Monthly"
        icon={ChevronDown}
        iconPosition="right"
        inputClassName="w-24"
      />
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-4">
      <div className="relative h-40 w-full">
        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/70" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--console-accent)]" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-[color:var(--console-muted)]">
          2025-12-20
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[color:var(--console-muted)]">
        <span className="text-rose-500">0%</span>
        <span>/ previous period</span>
      </div>
    </div>
  );
}

type BreakdownItem = {
  label: string;
  colorClass: string;
};

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: BreakdownItem[];
}) {
  return (
    <PanelStrong className="flex h-full flex-col p-4">
      <p className="text-sm font-semibold text-[color:var(--console-text)]">
        {title}
      </p>
      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/70 bg-white/70" />
          <div className="absolute inset-6 rounded-full bg-white/90" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[color:var(--console-muted)]">
          {items.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.colorClass}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </PanelStrong>
  );
}

function FormField({
  label,
  placeholder,
  value,
  helper,
  className = "",
}: {
  label: string;
  placeholder?: string;
  value?: string;
  helper?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs font-semibold text-[color:var(--console-muted)]">
        {label}
      </span>
      <input
        className="console-input"
        placeholder={placeholder}
        defaultValue={value}
        readOnly
      />
      {helper ? (
        <span className="text-[11px] text-[color:var(--console-muted)]">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function ToggleRow({
  label,
  enabled,
}: {
  label: string;
  enabled?: boolean;
}) {
  const isOn = Boolean(enabled);
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
      <span className="text-sm font-medium text-[color:var(--console-text)]">
        {label}
      </span>
      <div
        className={`flex h-5 w-10 items-center rounded-full p-0.5 transition ${
          isOn
            ? "bg-[var(--console-accent)]"
            : "bg-[color:var(--console-border)]"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition ${
            isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative h-28 w-32">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200 shadow-lg" />
        <div className="absolute bottom-3 left-3 h-12 w-20 rounded-2xl bg-white/80 shadow-md" />
        <div className="absolute right-3 top-3 h-6 w-10 rounded-full bg-[var(--console-accent)]/80" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[color:var(--console-text)]">
          {title}
        </h3>
        <p className="text-sm text-[color:var(--console-muted)]">
          {description}
        </p>
      </div>
      {actionLabel ? (
        <ConsoleButton
          label={actionLabel}
          icon={Plus}
          variant="primary"
          onClick={onAction}
        />
      ) : null}
    </div>
  );
}

function OverviewSection() {
  const digitalAssetStats = [
    { label: "Total digital assets created", value: "0" },
    { label: "Tokens with live Token Store", value: "0" },
    { label: "Tokens with live Token Offering", value: "0" },
    { label: "Total value locked (TVL)", value: "0.0 $" },
  ];
  const offeringStats = [
    { label: "Total offerings created", value: "0" },
    { label: "Live offerings", value: "0" },
    { label: "Offerings closed (last 30 days)", value: "0" },
    { label: "Successful offerings", value: "0" },
  ];
  const investorStatsPrimary = [
    { label: "Total investor accounts created", value: "0" },
    { label: "Investor accounts verified (KYC)", value: "0" },
    { label: "Investor accounts rejected (KYC)", value: "0" },
    { label: "Investor accounts pending (KYC)", value: "0" },
  ];
  const investorStatsSecondary = [
    { label: "New investors (last 30 days)", value: "0" },
    { label: "Average investment per investor", value: "0.0 $" },
    { label: "Total investments (month-to-date)", value: "0.0 $" },
  ];

  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <SectionHeader icon={LayoutGrid} title="Digital assets" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {digitalAssetStats.map((stat) => (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                tone="soft"
              />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <PanelStrong className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--console-text)]">
                  New digital assets
                </p>
                <ChartFilters />
              </div>
              <ChartPlaceholder />
            </PanelStrong>
            <BreakdownCard
              title="% TVL/Chains"
              items={[
                { label: "Verified", colorClass: "bg-emerald-400" },
                { label: "Inactive", colorClass: "bg-slate-300" },
              ]}
            />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={1}>
        <Panel className="p-6">
          <SectionHeader icon={Layers} title="Digital asset offerings" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {offeringStats.map((stat) => (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                tone="soft"
              />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <PanelStrong className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--console-text)]">
                  Capital raised (TCR) - Successful offerings
                </p>
                <ChartFilters />
              </div>
              <ChartPlaceholder />
            </PanelStrong>
            <BreakdownCard
              title="% TCR/Chains"
              items={[
                { label: "Successful", colorClass: "bg-emerald-400" },
                { label: "Failed", colorClass: "bg-rose-400" },
              ]}
            />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={2}>
        <Panel className="p-6">
          <SectionHeader icon={Users} title="Investors" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {investorStatsPrimary.map((stat) => (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                tone="soft"
              />
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {investorStatsSecondary.map((stat) => (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                tone="soft"
              />
            ))}
          </div>
          <div className="mt-4">
            <PanelStrong className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--console-text)]">
                  Total investments
                </p>
                <ChartFilters />
              </div>
              <ChartPlaceholder />
            </PanelStrong>
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function OverviewDigitalAssetsSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="overflow-hidden p-0">
          <div className="px-6 py-4">
            <p className="text-sm font-semibold text-[color:var(--console-text)]">
              Digital assets list
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-36 pl-9"
                placeholder="YYYY/MM/DD"
                readOnly
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-40 pl-9"
                placeholder="All chains"
                readOnly
              />
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-32 pr-8"
                placeholder="Newest"
                readOnly
              />
            </div>
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-full pl-9"
                placeholder="Search"
                readOnly
              />
            </div>
          </div>
          <div className="overflow-x-auto border-t border-white/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/70 text-xs text-[color:var(--console-muted)]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Creation Date</th>
                  <th className="px-6 py-3 font-semibold">Token Ticker</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Market Cap</th>
                  <th className="px-6 py-3 font-semibold">Current Price</th>
                  <th className="px-6 py-3 font-semibold">Nb. of Offerings</th>
                  <th className="px-6 py-3 font-semibold">
                    Circulating Supply
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 text-[color:var(--console-text)]">
                <tr>
                  <td
                    className="px-6 py-6 text-center text-sm text-[color:var(--console-muted)]"
                    colSpan={7}
                  >
                    No digital assets yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function ProjectHomeSection({ projectInfo }: { projectInfo: typeof defaultProjectInfo }) {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                    BK
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold uppercase text-[color:var(--console-text)]">
                      {projectInfo.name}
                    </span>
                    <span className="console-pill">{projectInfo.type}</span>
                  </div>
                  <p className="text-xs text-[color:var(--console-muted)]">
                    Digital asset contract address
                  </p>
                  <p className="text-xs text-[color:var(--console-muted)]">
                    {projectInfo.address}
                  </p>
                </div>
              </div>
              <StatusPill status={projectInfo.status} />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-[color:var(--console-muted)]">
                  Asset balance
                </p>
                <p className="text-2xl font-semibold text-[color:var(--console-text)]">
                  0.0 USDT
                </p>
              </div>
              <ConsoleButton label="View details" variant="outline" />
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Notifications
              </p>
              <ConsoleIconButton icon={Bell} label="Notifications" />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <p className="font-semibold text-[color:var(--console-text)]">
                  Create your first digital asset
                </p>
                <p className="mt-1 text-xs text-[color:var(--console-muted)]">
                  Get started by activating your license.
                </p>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-[color:var(--console-accent)]"
                >
                  Get started now
                </button>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <p className="text-xs text-[color:var(--console-muted)]">
                  Need a license yet? View plans
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </Stagger>

      <Stagger index={1}>
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Financial summary
              </p>
              <p className="text-xs text-[color:var(--console-muted)]">
                Snapshot of your offering performance.
              </p>
            </div>
            <span className="console-pill">Monthly</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StatTile
              label="Total amount raised (USDT)"
              value="0.0"
              helper="0% / previous period"
            />
            <StatTile label="Total investors" value="0" />
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function DigitalAssetSection({ projectInfo }: { projectInfo: typeof defaultProjectInfo }) {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <PanelStrong className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  BK
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[color:var(--console-text)]">
                    {projectInfo.name}
                  </p>
                  <span className="console-pill">{projectInfo.type}</span>
                </div>
                <p className="text-xs text-[color:var(--console-muted)]">
                  Digital asset contract address
                </p>
                <p className="text-xs text-[color:var(--console-muted)]">
                  {projectInfo.address}
                </p>
              </div>
            </div>
            <div className="text-2xl font-semibold text-[color:var(--console-text)]">
              0.0 USDT
            </div>
          </div>
        </PanelStrong>
      </Stagger>

      <Stagger index={1}>
        <Panel className="p-6">
          <p className="text-sm font-semibold text-[color:var(--console-text)]">
            Digital asset information
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StatTile label="Market cap" value="0.0 USDT" />
            <StatTile label="Fully diluted market cap" value="0.0 USDT" />
            <StatTile label="Maximum supply" value="0.0 ASSET" />
            <StatTile label="Circulating supply" value="0.0 ASSET" />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={2}>
        <Panel className="p-6">
          <p className="text-sm font-semibold text-[color:var(--console-text)]">
            Documents stored inside the digital asset contract
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[color:var(--console-text)]">
                Legal Tokenization Document (2)
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[color:var(--console-accent)]"
              >
                View document
              </button>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[color:var(--console-text)]">
                Legal Tokenization Document (1)
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[color:var(--console-accent)]"
              >
                View document
              </button>
            </div>
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function OfferingsSection({ onCreate }: { onCreate?: () => void }) {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-10">
          <EmptyState
            title="No offerings found yet"
            description="Your investment portal is awaiting its first digital asset offering."
            actionLabel={
              onCreate ? "Create Digital Asset Offering" : undefined
            }
            onAction={onCreate}
          />
        </Panel>
      </Stagger>
    </section>
  );
}

function OfferingFormSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <p className="text-sm font-semibold text-[color:var(--console-text)]">
            Digital Asset Offering Information
          </p>
          <p className="text-xs text-[color:var(--console-muted)]">
            Please review the information carefully before proceeding.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormField
              label="Name of the Digital Asset Offering"
              placeholder="e.g. BKN round A"
            />
            <FormField
              label="Amount of Digital Assets to Offer"
              placeholder="e.g. 10,000"
            />
            <FormField
              label="Start Date of the Offering"
              placeholder="2025/12/10 17:16"
            />
            <FormField
              label="End Date of the Offering"
              placeholder="2026/06/10 17:16"
            />
            <FormField
              label="Min. Amount to Raise in USDT"
              placeholder="e.g. 40,000"
            />
            <FormField
              label="Max. Amount to Raise in USDT"
              placeholder="e.g. 1,000,000"
            />
            <FormField
              label="Accepted ERC-20 Digital Assets"
              value="USDT"
              className="md:col-span-2"
            />
            <FormField
              label="Price of the Digital Asset in USDT"
              placeholder="e.g. 0.45"
            />
            <FormField
              label="Min. Investment Amount in USDT"
              placeholder="e.g. 300"
            />
            <FormField
              label="Max. Investment Amount in USDT"
              placeholder="e.g. 50,000"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <ConsoleButton label="Connect wallet" icon={Wallet} />
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function InvestorsSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total raised" value="0.0 USDT" />
            <StatTile label="Assets held by the company" value="0.0 ASSET" />
            <StatTile label="Digital assets distributed" value="0.0 ASSET" />
            <StatTile label="Number of digital asset holders" value="0" />
          </div>
        </Panel>
      </Stagger>
      <Stagger index={1}>
        <Panel className="p-10">
          <EmptyState
            title="No activity from your investment portal yet"
            description="Encourage your community to invest in your offering."
          />
        </Panel>
      </Stagger>
    </section>
  );
}

function TransfersSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Current offering
              </p>
              <p className="text-xs text-[color:var(--console-muted)]">
                Price: 0.0 USDT
              </p>
            </div>
            <ConsoleButton label="View" variant="outline" />
          </div>
          <div className="mt-4 grid gap-4 text-xs text-[color:var(--console-muted)] md:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="console-dot" />
              Softcap: 0.0 USDT
            </div>
            <div className="flex items-center gap-2">
              <span className="console-dot" />
              Hardcap: 0.0 USDT
            </div>
            <div className="flex items-center gap-2">
              <span className="console-dot" />
              Raised: 0.0 / 0.0 USDT (0%)
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/60">
            <div className="h-full w-[8%] rounded-full bg-[var(--console-accent)]" />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={1}>
        <Panel className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-36 pl-9"
                placeholder="2025/12/01"
                readOnly
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-48 pl-9"
                placeholder="Search by email"
                readOnly
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-32 pl-9"
                placeholder="Filter"
                readOnly
              />
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-32 pr-8"
                placeholder="Oldest"
                readOnly
              />
            </div>
            <ConsoleButton
              label="Review requests (0)"
              variant="outline"
              className="ml-auto"
            />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-4 text-[11px] font-semibold uppercase text-[color:var(--console-muted)]">
            <span>Wallet Address</span>
            <span>Full Name</span>
            <span>Date</span>
            <span>Transfer Method</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Offchain Tx</span>
          </div>
          <div className="mt-3 rounded-2xl border border-dashed border-white/70 bg-white/70 p-8 text-center text-sm text-[color:var(--console-muted)]">
            No data available
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function WhitelistSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-36 pl-9"
                placeholder="2025/12/07"
                readOnly
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-48 pl-9"
                placeholder="Search by email"
                readOnly
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-32 pl-9"
                placeholder="Filter"
                readOnly
              />
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--console-muted)]" />
              <input
                className="console-input w-32 pr-8"
                placeholder="Newest"
                readOnly
              />
            </div>
          </div>
          <div className="mt-8">
            <EmptyState
              title="No requests found"
              description="No requests to be added to the authorized list at the moment."
            />
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function DocumentsSection() {
  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <p className="text-sm font-semibold text-[color:var(--console-text)]">
            Documents required
          </p>
          <p className="text-xs text-[color:var(--console-muted)]">
            Define which documents investors must upload when requesting
            whitelist approval.
          </p>
          <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">
              Document information guidelines
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Title should be clear and descriptive of the purpose.</li>
              <li>Description should provide context for investors.</li>
              <li>Information will be visible in the investment portal.</li>
            </ul>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--console-accent)]"
          >
            <Plus className="h-4 w-4" />
            Add document
          </button>
          <p className="mt-6 text-xs text-[color:var(--console-muted)]">
            Changes will be applied when you publish the configuration.
          </p>
        </Panel>
      </Stagger>
    </section>
  );
}

type PortalInfo = {
  link: string;
  prodLink: string;
  testLink: string;
  prodVersion: string;
  testVersion: string;
  publishedBy: string;
  publishedAt: string;
  state: PortalState;
};

function InvestmentPortalSection({
  onEdit,
  portalInfo,
}: {
  onEdit: () => void;
  portalInfo: PortalInfo;
}) {
  const stateMeta: Record<
    PortalState,
    { label: string; color: string; dot: string; desc: string }
  > = {
    NOT_PUBLISHED: {
      label: "Not published",
      color: "bg-slate-100 text-slate-700",
      dot: "bg-slate-400",
      desc: "Your portal has not been published yet. Publish a draft to start testing.",
    },
    PUBLISHING_TO_TEST: {
      label: "Publishing to Test",
      color: "bg-blue-100 text-blue-800",
      dot: "bg-blue-500",
      desc: "We received your publish request and are deploying to the test environment.",
    },
    TEST_READY: {
      label: "Test environment",
      color: "bg-blue-100 text-blue-800",
      dot: "bg-blue-500",
      desc: "Test environment is live. Review and confirm to deploy to production.",
    },
    PROMOTING_TO_PROD: {
      label: "Deploying to Production",
      color: "bg-amber-100 text-amber-800",
      dot: "bg-amber-500",
      desc: "Production deployment in progress.",
    },
    PROD_LIVE: {
      label: "Production live",
      color: "bg-emerald-100 text-emerald-800",
      dot: "bg-emerald-500",
      desc: "Production environment is live. New edits will go to Test first.",
    },
    DEPLOY_FAILED: {
      label: "Deployment failed",
      color: "bg-rose-100 text-rose-800",
      dot: "bg-rose-500",
      desc: "Deployment failed. Please resubmit or contact support.",
    },
  };

  const meta = stateMeta[portalInfo.state] ?? stateMeta.NOT_PUBLISHED;

  const renderActions = () => {
    switch (portalInfo.state) {
      case "NOT_PUBLISHED":
        return (
          <ConsoleButton
            label="Edit & publish draft"
            variant="primary"
            onClick={onEdit}
          />
        );
      case "PUBLISHING_TO_TEST":
        return (
          <ConsoleButton
            label="Publishing to Test..."
            variant="outline"
            onClick={undefined}
            className="opacity-80"
          />
        );
      case "TEST_READY":
        return (
          <>
            <ConsoleButton label="Go to test portal" variant="primary" />
            <ConsoleButton label="Edit portal" variant="outline" onClick={onEdit} />
            <ConsoleButton
              label="Confirm & deploy to Production"
              variant="primary"
              className="bg-emerald-500 hover:bg-emerald-600"
            />
          </>
        );
      case "PROMOTING_TO_PROD":
        return (
          <>
            <ConsoleButton label="Go to test portal" variant="outline" />
            <ConsoleButton
              label="Deploying to Production..."
              variant="primary"
              className="opacity-80"
            />
          </>
        );
      case "PROD_LIVE":
        return (
          <>
            <ConsoleButton label="Go to production portal" variant="primary" />
            <ConsoleButton label="Edit portal" variant="outline" onClick={onEdit} />
          </>
        );
      case "DEPLOY_FAILED":
        return (
          <>
            <ConsoleButton label="Edit portal" variant="outline" onClick={onEdit} />
            <ConsoleButton
              label="Retry deploy"
              variant="primary"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Published investment portal
              </p>
              <p className="text-xs text-[color:var(--console-muted)]">
                Latest status and environment workflow
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="console-card console-card-strong flex flex-col gap-3 p-4">
              <p className="text-xs font-semibold uppercase text-[color:var(--console-muted)]">
                Production link
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="console-input flex-1 min-w-[240px]"
                  readOnly
                  value={
                    portalInfo.prodLink ||
                    "Production link pending (deploying or not published)"
                  }
                />
                <ConsoleButton label="Open" variant="outline" />
              </div>
              <p className="text-[11px] text-[color:var(--console-muted)]">
                Share this link with investors when Production is live.
              </p>
            </div>

            <div className="console-card console-card-strong p-4">
              <p className="text-xs font-semibold uppercase text-[color:var(--console-muted)]">
                Production version
              </p>
              <p className="text-lg font-semibold text-[color:var(--console-text)]">
                {portalInfo.prodVersion || "—"}
              </p>
              <div className="mt-3 space-y-1 text-xs text-[color:var(--console-muted)]">
                <p>
                  Published by{" "}
                  <span className="font-semibold text-[color:var(--console-text)]">
                    {portalInfo.publishedBy}
                  </span>
                </p>
                <p>On {portalInfo.publishedAt}</p>
                <p className="text-[11px]">
                  Workflow: edits publish to Test; after you confirm, we deploy to Production.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="console-card console-card-strong flex flex-col gap-3 p-4">
              <p className="text-xs font-semibold uppercase text-[color:var(--console-muted)]">
                Test link
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="console-input flex-1 min-w-[240px]"
                  readOnly
                  value={
                    portalInfo.testLink ||
                    "Test link not available until first publish"
                  }
                />
                <ConsoleButton label="Open" variant="outline" />
              </div>
              <p className="text-[11px] text-[color:var(--console-muted)]">
                New edits are deployed to Test first. Confirm before promoting to Production.
              </p>
            </div>

            <div className="console-card console-card-strong p-4">
              <p className="text-xs font-semibold uppercase text-[color:var(--console-muted)]">
                Test version
              </p>
              <p className="text-lg font-semibold text-[color:var(--console-text)]">
                {portalInfo.testVersion || "—"}
              </p>
              <p className="mt-2 text-[11px] text-[color:var(--console-muted)]">
                Use this to verify before confirming production deployment.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {renderActions()}
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function EditPortalSection() {
  const tabs = [
    "Media",
    "Sections",
    "Team",
    "Colors",
    "Contact",
    "Reports",
    "SEO",
    "Transfer",
    "FAQs",
    "Highlights",
    "Press",
    "Offerings",
  ];

  return (
    <section className="space-y-6">
      <Stagger index={0}>
        <Panel className="p-4">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase text-[color:var(--console-muted)]">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`console-tab ${
                  tab === "Sections" ? "console-tab-active" : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Panel>
      </Stagger>

      <Stagger index={1}>
        <Panel className="p-6">
          <div>
            <p className="text-sm font-semibold text-[color:var(--console-text)]">
              Sections display
            </p>
            <p className="text-xs text-[color:var(--console-muted)]">
              Sections visibility
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ToggleRow label="Partners" enabled />
            <ToggleRow label="Digital asset rights" />
            <ToggleRow label="Reasons to invest" enabled />
            <ToggleRow label="Road map" enabled />
            <ToggleRow label="Press section" />
            <ToggleRow label="FAQs" />
            <ToggleRow label="Offering" enabled />
            <ToggleRow label="Image carousel" />
            <ToggleRow label="Whitepaper" enabled />
            <ToggleRow label="Highlights" enabled />
            <ToggleRow label="Team" enabled />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={2}>
        <Panel className="p-6">
          <div className="mt-4 grid gap-4">
            <FormField label="Hero section heading" />
            <FormField label="Hero section description" />
            <FormField label="Whitepaper custom title" />
            <FormField label="Whitepaper summary" />
            <FormField label="Whitepaper download button text" />
            <FormField label="Project video (YouTube URL)" />
          </div>
        </Panel>
      </Stagger>

      <Stagger index={3}>
        <Panel className="p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="console-card console-card-strong p-4">
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Reasons to invest
              </p>
              <FormField label="Custom section title" />
              {["Reason 1", "Reason 2"].map((reason) => (
                <div key={reason} className="mt-3">
                  <p className="text-xs font-semibold text-[color:var(--console-muted)]">
                    {reason}
                  </p>
                  <div className="mt-2 grid gap-2">
                    <FormField label="Title" />
                    <FormField label="Content" />
                  </div>
                </div>
              ))}
            </div>
            <div className="console-card console-card-strong p-4">
              <p className="text-sm font-semibold text-[color:var(--console-text)]">
                Road map
              </p>
              <FormField label="Custom section title" />
              {["Milestone 1", "Milestone 2"].map((milestone) => (
                <div key={milestone} className="mt-3">
                  <p className="text-xs font-semibold text-[color:var(--console-muted)]">
                    {milestone}
                  </p>
                  <div className="mt-2 grid gap-2">
                    <FormField label="Title" />
                    <FormField label="Content" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Stagger>
    </section>
  );
}

function DeleteProjectDialog({
  onClose,
  onConfirm,
  projectName,
}: {
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
}) {
  const [countdown, setCountdown] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleConfirm = async () => {
    if (countdown > 0) return;
    setIsDeleting(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--console-text)]">
            Delete project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[color:var(--console-muted)] hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-[color:var(--console-text)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{projectName || "this project"}</span>
            ?
          </p>
          <p className="mt-2 text-sm text-red-600">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-[color:var(--console-text)] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={countdown > 0 || isDeleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? "Deleting..."
              : countdown > 0
                ? `Confirm delete (${countdown}s)`
                : "Confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsoleShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const isOverviewMode = !projectId;
  const [activeSection, setActiveSection] = useState<SectionKey>(
    isOverviewMode ? "overview" : "home",
  );
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const resolvedSection = isOverviewMode
    ? overviewItems.some((item) => item.id === activeSection)
      ? activeSection
      : "overview"
    : activeSection === "overview"
      ? "home"
      : activeSection;

  const baseMeta = sectionMeta[resolvedSection];
  const meta =
    isOverviewMode && overviewMetaOverrides[resolvedSection]
      ? overviewMetaOverrides[resolvedSection]
      : baseMeta;
  const menuItems = isOverviewMode ? overviewItems : fullSecondaryItems;
  const selectItems = menuItems.some((item) => item.id === resolvedSection)
    ? menuItems
    : [
        ...menuItems,
        {
          id: resolvedSection,
          label:
            resolvedSection === "offering-form"
              ? "Offering information"
              : sectionMeta[resolvedSection]?.title ?? resolvedSection,
          icon: FileText,
        },
      ];
  // Key to force remount when project changes (for animations)
  const contentKey = projectId || "overview";

  // Fetch project data separately
  useEffect(() => {
    if (!projectId) {
      // Reset section when leaving project mode
      setActiveSection("overview");
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProjectData(data.project);
        } else {
          console.error("Failed to fetch project");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  // Compute projectInfo from projectData or use default
  const projectInfo = projectId && projectData
    ? {
        name: projectData.name || "ASSET",
        displayName: projectData.name || "Brickken Asset",
        type: getAssetTypeLabel(projectData.assetType),
        address: projectData.walletAddress || "0xb2AEf5aB0721689F9470eE3e9361Bcd16183dD",
        chain: projectData.network || "Ethereum",
        status: projectData.status || "Draft",
      }
    : defaultProjectInfo;
  const portalInfo: PortalInfo = {
    prodLink:
      (projectData as any)?.portalProdUrl ||
      (projectId ? `https://portal.example.com/${projectId}` : ""),
    testLink:
      (projectData as any)?.portalTestUrl ||
      (projectId ? `https://portal-test.example.com/${projectId}` : ""),
    prodVersion: (projectData as any)?.portalProdVersion || "",
    testVersion: (projectData as any)?.portalTestVersion || "",
    publishedBy: (projectData as any)?.portalPublishedBy || "Demo User",
    publishedAt:
      (projectData as any)?.portalPublishedAt ||
      new Date().toLocaleDateString(),
    state: ((projectData as any)?.portalState?.toUpperCase() ||
      "NOT_PUBLISHED") as PortalState,
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to overview page after successful deletion
        setShowDeleteDialog(false);
        setActiveSection("overview");
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete project.");
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An error occurred while deleting the project.");
      setShowDeleteDialog(false);
    }
  };

  const renderHeaderActions = () => {
    if (resolvedSection === "overview") {
      return null;
    }
    if (resolvedSection === "offerings") {
      return (
        <>
          <ConsoleButton
            label="Create new offering"
            icon={Plus}
            onClick={() => setActiveSection("offering-form")}
          />
          <ConsoleButton label="Connect wallet" icon={Wallet} variant="outline" />
        </>
      );
    }
    if (resolvedSection === "offering-form") {
      return (
        <ConsoleButton
          label="Back to offerings"
          variant="ghost"
          onClick={() => setActiveSection("offerings")}
        />
      );
    }
    if (resolvedSection === "investment-portal") {
      return (
        <>
          <ConsoleButton label="Go to investment portal" variant="primary" />
          <ConsoleButton
            label="Edit investment portal"
            variant="outline"
            onClick={() => setActiveSection("edit-portal")}
          />
        </>
      );
    }
    if (resolvedSection === "edit-portal") {
      return (
        <>
          <ConsoleButton label="Preview" variant="ghost" />
          <ConsoleButton label="Publish" icon={CheckCircle} />
        </>
      );
    }
    if (resolvedSection === "documents") {
      return <ConsoleButton label="Publish" icon={CheckCircle} />;
    }
    return <ConsoleButton label="Connect wallet" icon={Wallet} variant="outline" />;
  };

  const renderSection = () => {
    switch (resolvedSection) {
      case "overview":
        return <OverviewSection />;
      case "home":
        return <ProjectHomeSection projectInfo={projectInfo} />;
      case "digital-asset":
        return isOverviewMode ? (
          <OverviewDigitalAssetsSection />
        ) : (
          <DigitalAssetSection projectInfo={projectInfo} />
        );
      case "offerings":
        return (
          <OfferingsSection onCreate={() => setActiveSection("offering-form")} />
        );
      case "offering-form":
        return <OfferingFormSection />;
      case "investors":
        return <InvestorsSection />;
      case "transfers":
        return <TransfersSection />;
      case "whitelist":
        return <WhitelistSection />;
      case "documents":
        return <DocumentsSection />;
      case "investment-portal":
        return (
          <InvestmentPortalSection
            onEdit={() => setActiveSection("edit-portal")}
            portalInfo={portalInfo}
          />
        );
      case "edit-portal":
        return <EditPortalSection />;
      default:
        return null;
    }
  };

  return (
    <div className="console-shell flex min-h-full flex-col">
      <div className="console-topbar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] uppercase tracking-wide text-[color:var(--console-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="console-pill">You&apos;re in demo mode</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete your KYC information
            </span>
            <button
              type="button"
              className="font-semibold text-[color:var(--console-accent)]"
            >
              Review KYC
            </button>
          </div>
          <button
            type="button"
            className="font-semibold text-[color:var(--console-accent)]"
          >
            Go to live mode
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="console-sidebar hidden lg:flex w-72 flex-col gap-6 px-6 py-6">
          <nav className="flex flex-col gap-4">
            {isOverviewMode ? (
              <div className="flex flex-col gap-1">
                {overviewItems.map((item) => {
                  const isDisabled = Boolean(item.disabled);
                  const active = !isDisabled && resolvedSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={
                        isDisabled ? undefined : () => setActiveSection(item.id)
                      }
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isDisabled
                          ? "text-slate-300"
                          : active
                            ? "bg-white/80 text-[color:var(--console-accent)] shadow-md"
                            : "text-[color:var(--console-muted)] hover:bg-white/60"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              fullSecondaryGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-xs uppercase text-[color:var(--console-muted)]">
                    {group.title}
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {group.items.map((item) => {
                      const active = resolvedSection === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-white/80 text-[color:var(--console-accent)] shadow-md"
                              : "text-[color:var(--console-muted)] hover:bg-white/60"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </nav>

          {!isOverviewMode && (
            <div className="mt-auto space-y-2 text-xs text-[color:var(--console-muted)]">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--console-text)]">
                    Status
                  </span>
                  <StatusPill status={projectInfo.status} />
                </div>
                {projectData?.updatedAt ? (
                  <p className="mt-2 text-[11px]">
                    Updated {new Date(projectData.updatedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-left text-red-600 hover:bg-red-100"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete project
                </span>
              </button>
            </div>
          )}
        </aside>

        <main key={contentKey} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {meta.subtitle ? (
                <p className="text-sm text-[color:var(--console-muted)]">
                  {meta.subtitle}
                </p>
              ) : null}
              <h1 className="text-2xl font-semibold text-[color:var(--console-text)]">
                {meta.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {renderHeaderActions()}
              <ConsoleIconButton icon={Bell} label="Notifications" />
              <ConsoleIconButton icon={User} label="Account" />
            </div>
          </header>

          <div className="mt-4 lg:hidden">
            <label className="text-xs font-semibold uppercase text-[color:var(--console-muted)]">
              Section
            </label>
            <div className="mt-2">
              <select
                className="console-input w-full"
                value={resolvedSection}
                onChange={(event) =>
                  setActiveSection(event.target.value as SectionKey)
                }
              >
                {selectItems.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">{renderSection()}</div>
        </main>
      </div>

      {showDeleteDialog && (
        <DeleteProjectDialog
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteProject}
          projectName={projectData?.name}
        />
      )}
    </div>
  );
}
