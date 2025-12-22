import { useEffect, useMemo } from 'react';
import { Coins, AlertTriangle } from 'lucide-react';
import { TokenSettingsInput } from '@/lib/validators';

type TokenErrors = Partial<Record<keyof TokenSettingsInput, string | undefined>>;

interface StepProps {
  values: TokenSettingsInput;
  errors?: TokenErrors;
  assetValue?: number | null;
  onChange: <K extends keyof TokenSettingsInput>(
    key: K,
    value: TokenSettingsInput[K] | undefined
  ) => void;
}

export function StepTokenSettings({ values, errors, assetValue, onChange }: StepProps) {
  const isValidSymbol = /^[A-Z0-9]{2,8}$/.test(values.tokenSymbol ?? '');
  const showSymbolError = (values.tokenSymbol?.length ?? 0) > 0 && !isValidSymbol;

  const computedSupply = useMemo(() => {
    if (
      assetValue === null ||
      assetValue === undefined ||
      assetValue <= 0 ||
      !values.initialPrice
    ) {
      return undefined;
    }
    const supply = Math.floor(Number(assetValue) / Number(values.initialPrice));
    return Number.isFinite(supply) && supply > 0 ? supply : undefined;
  }, [assetValue, values.initialPrice]);

  useEffect(() => {
    if (values.tokenDecimals !== 18) {
      onChange('tokenDecimals', 18);
    }
  }, [values.tokenDecimals, onChange]);

  useEffect(() => {
    if (computedSupply && values.totalSupply !== computedSupply) {
      onChange('totalSupply', computedSupply);
    }
  }, [computedSupply, values.totalSupply, onChange]);

  const tokenValue =
    assetValue && computedSupply
      ? (Number(assetValue) / Number(computedSupply)).toFixed(2)
      : null;
  const showHighValueWarning = tokenValue && Number(tokenValue) > 1000000;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Coins className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-slate-900">Token Settings</h2>
          <p className="text-slate-600 mt-1">
            Configure the digital asset token parameters
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {!assetValue && (
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
            Complete Asset Details and provide an Asset Value to calculate supply.
          </div>
        )}

        {/* Token Name */}
        <div>
          <label className="block text-slate-700 mb-2">
            Token Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.tokenName}
            onChange={(e) => onChange('tokenName', e.target.value)}
            placeholder="e.g., Real Estate Token"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
              errors?.tokenName ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors?.tokenName && (
            <div className="mt-1 text-sm text-red-600">{errors.tokenName}</div>
          )}
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-slate-700 mb-2">
            Token Symbol <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.tokenSymbol}
            onChange={(e) => onChange('tokenSymbol', e.target.value.toUpperCase())}
            placeholder="RET"
            maxLength={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all uppercase ${
              showSymbolError
                ? 'border-red-300 focus:border-red-500'
                : 'border-slate-300 focus:border-orange-500'
            }`}
          />
          {showSymbolError && (
            <div className="mt-2 text-red-600">
              Symbol must be 2-8 uppercase letters or numbers
            </div>
          )}
          {errors?.tokenSymbol && (
            <div className="mt-1 text-sm text-red-600">{errors.tokenSymbol}</div>
          )}
          <div className="mt-2 text-slate-500">
            2-8 characters, uppercase letters and numbers only
          </div>
        </div>

        {/* Initial Token Price */}
        <div>
          <label className="block text-slate-700 mb-2">
            Initial Token Price (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={values.initialPrice ?? ''}
            onChange={(e) => {
              const nextValue = e.target.value === '' ? undefined : Number(e.target.value);
              onChange('initialPrice', nextValue);
              if (assetValue && nextValue && Number(nextValue) > 0) {
                const supply = Math.floor(Number(assetValue) / Number(nextValue));
                if (Number.isFinite(supply) && supply > 0) {
                  onChange('totalSupply', supply);
                }
              }
            }}
            placeholder="1.00"
            min="0.01"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
              errors?.initialPrice ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors?.initialPrice && (
            <div className="mt-1 text-sm text-red-600">{errors.initialPrice}</div>
          )}
          <div className="mt-2 text-slate-500">
            Total supply is calculated from Asset Value and Initial Token Price.
            Token decimals are fixed at 18 and cannot be changed.
          </div>
        </div>

        {/* Token Value Preview */}
        {tokenValue && (
          <div className={`p-4 rounded-lg border ${
            showHighValueWarning ? 'bg-amber-50 border-amber-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-start gap-3">
              {showHighValueWarning && (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={showHighValueWarning ? 'text-amber-900' : 'text-orange-900'}>
                  Token Value Preview
                </div>
                <div className={`mt-1 ${showHighValueWarning ? 'text-amber-700' : 'text-orange-700'}`}>
                  Based on your asset value of USD {assetValue ? Number(assetValue).toLocaleString() : 0}
                  {' '}and total supply of {computedSupply ? Number(computedSupply).toLocaleString() : 0},
                  each token represents approximately USD {Number(tokenValue).toLocaleString()} of the underlying asset.
                </div>
                {showHighValueWarning && (
                  <div className="text-amber-700 mt-2">
                    Warning: Single token value exceeds $1M. Consider increasing total supply.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
