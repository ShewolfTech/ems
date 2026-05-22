import React, { useState } from "react";
import { Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/utils/api.js";

export function GenerateDeliveriesButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // No dates provided → uses current active term
      const { data } = await api.post("/academics/lesson-deliveries/generate", {});

      if (data.success) {
        setMessage({
          text: `✅ Generated ${data.data.generated} lesson deliveries (today → end of term)`,
          type: 'success',
        });
      } else {
        setMessage({ text: data.message || "Generation failed", type: 'error' });
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || "Failed to generate deliveries",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Generate Lesson Deliveries
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Generates planned deliveries from today to end of current term
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Generate Now
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`mt-3 p-2 rounded text-xs flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

export default GenerateDeliveriesButton;
