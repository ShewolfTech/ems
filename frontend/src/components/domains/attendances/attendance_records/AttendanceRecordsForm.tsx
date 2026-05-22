import React from "react";
import { Button, Input, Select } from "@/components/domains/aacommon/index.js";
import { X } from "lucide-react";

export function AttendanceRecordsForm({ initialData, onClose, onSave }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.is_verified = formData.get("is_verified") === "on";
    
    // Include id from initialData for updates
    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-black text-2xl text-slate-900">AttendanceRecords Editor</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Select 
            label="Asset Id" 
            name="asset_id" 
            relation="assets"
            placeholder="Select Asset Id"
            defaultValue={initialData?.["asset_id"]}
          />
          <Input label="Biometric Match Confidence" name="biometric_match_confidence" defaultValue={initialData?.["biometric_match_confidence"]} />
          <Input label="Biometric Scan Quality" name="biometric_scan_quality" defaultValue={initialData?.["biometric_scan_quality"]} />
          <Input label="Biometric Template Hash" name="biometric_template_hash" defaultValue={initialData?.["biometric_template_hash"]} />
          <Input label="Device Code" name="device_code" defaultValue={initialData?.["device_code"]} />
          <Input label="Location Lat" name="location_lat" defaultValue={initialData?.["location_lat"]} />
          <Input label="Location Lng" name="location_lng" defaultValue={initialData?.["location_lng"]} />
          <Input label="Method" name="method" defaultValue={initialData?.["method"]} />
          <Input label="Recorded At" name="recorded_at" type="date" defaultValue={initialData?.["recorded_at"]?.split('T')[0]} />
          <Input label="Recorded By" name="recorded_by" defaultValue={initialData?.["recorded_by"]} />
          <Input label="Remark" name="remark" defaultValue={initialData?.["remark"]} />
          <Input label="Session Id" name="session_id" defaultValue={initialData?.["session_id"]} />
          <Input label="Sign Type" name="sign_type" defaultValue={initialData?.["sign_type"]} />
          <Input label="Status" name="status" defaultValue={initialData?.["status"]} />
          <Input label="Verified At" name="verified_at" type="date" defaultValue={initialData?.["verified_at"]?.split('T')[0]} />
          <Input label="Verified By" name="verified_by" defaultValue={initialData?.["verified_by"]} />
          
          <div className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50/30">
            <input type="checkbox" name="is_verified" defaultChecked={!!initialData?.["is_verified"]} className="w-5 h-5 accent-slate-900" />
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Is Verified (Yes/No)</label>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default AttendanceRecordsForm;