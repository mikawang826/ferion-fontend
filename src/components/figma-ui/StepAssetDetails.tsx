import { ChangeEvent } from 'react';
import { FileText, Upload } from 'lucide-react';
import { AssetDetailsInput } from '@/lib/validators';
import { Doc } from '@/types/project';

type AssetErrors = Partial<Record<keyof AssetDetailsInput, string | undefined>>;

interface StepProps {
  values: AssetDetailsInput;
  errors?: AssetErrors;
  documents: Doc[];
  onChange: <K extends keyof AssetDetailsInput>(
    key: K,
    value: AssetDetailsInput[K] | undefined
  ) => void;
  onUpload: (files: FileList | null) => void;
}

export function StepAssetDetails({ values, errors, documents, onChange, onUpload }: StepProps) {
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-orange-50 rounded-lg">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-slate-900">Asset Details</h2>
          <p className="text-slate-600 mt-1">
            Provide detailed information about the underlying real-world asset
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Asset Location/Jurisdiction */}
        <div>
          <label className="block text-slate-700 mb-2">
            Asset Location / Jurisdiction <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.assetLocation}
            onChange={(e) => onChange('assetLocation', e.target.value)}
            placeholder="e.g., Delaware, USA or Singapore"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
              errors?.assetLocation ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors?.assetLocation && (
            <div className="mt-1 text-sm text-red-600">{errors.assetLocation}</div>
          )}
          <div className="mt-2 text-slate-500">
            Specify the legal jurisdiction or physical location of the asset
          </div>
        </div>

        {/* Asset Description */}
        <div>
          <label className="block text-slate-700 mb-2">
            Asset Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={values.assetDescription}
            onChange={(e) => onChange('assetDescription', e.target.value)}
            placeholder="Provide detailed characteristics, features, and relevant information about the asset..."
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none ${
              errors?.assetDescription ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors?.assetDescription && (
            <div className="mt-1 text-sm text-red-600">{errors.assetDescription}</div>
          )}
        </div>

        {/* Asset Value */}
        <div>
          <label className="block text-slate-700 mb-2">
            Asset Value <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={values.assetValue ?? ''}
              onChange={(e) =>
                onChange(
                  'assetValue',
                  e.target.value === '' ? undefined : Number(e.target.value)
                )
              }
              placeholder="1000000"
              min="0.01"
              step="0.01"
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                errors?.assetValue ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            <div className="w-32 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
              USD
            </div>
          </div>
          {errors?.assetValue && (
            <div className="mt-1 text-sm text-red-600">{errors.assetValue}</div>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-slate-700 mb-2">
            Related Documents <span className="text-slate-400">(Optional)</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="p-3 bg-slate-100 rounded-full mb-3">
                <Upload className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-slate-900">Click to upload files</div>
              <div className="text-slate-500 mt-1">
                PDF or DOC files, max 10MB each
              </div>
            </label>
          </div>

          {/* Uploaded Files List */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 truncate">{file.fileName}</div>
                      <div className="text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{file.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
