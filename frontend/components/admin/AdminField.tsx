type Props = {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
};

export default function AdminField({ label, help, required, children }: Props) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {help && <p className="text-xs text-gray-500 mb-2 leading-relaxed">{help}</p>}
      {children}
    </div>
  );
}

export const inputClass =
  "w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white";

export const selectClass = inputClass;

export const textareaClass =
  "w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white resize-none";
