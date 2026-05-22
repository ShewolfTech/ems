import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { AttendanceErrors } from "./errors.js";
import type { CreateStaffAttendanceInput, StaffAttendanceType, UpdateStaffAttendanceInput } from "./types.js";

const StaffAttendanceModel = Model.StaffAttendance || Model.addModel("staff_attendance", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  date: { type: "date" },
  clock_in_time: { type: "datetime" },
  clock_out_time: { type: "datetime" },
  late_minutes: { type: "int", default: 0 },
  early_leave_minutes: { type: "int", default: 0 },
  total_hours: { type: "decimal" },
  status: { type: "enum", values: ["present", "absent", "late", "excused", "on-leave"], default: "present" },
  notes: { type: "text" },
  device_id: { type: "varchar", length: 100 },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

const EXPECTED_START_TIME = "08:00:00";

async function getAll(filters?: Partial<StaffAttendanceType>): Promise<StaffAttendanceType[]> {
  return StaffAttendanceModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<StaffAttendanceType> {
  const attendance = await StaffAttendanceModel.findByPk(id);
  if (!attendance) throw new HttpError(404, AttendanceErrors.NOT_FOUND);
  return attendance;
}

async function create(data: CreateStaffAttendanceInput): Promise<StaffAttendanceType> {
  const today = new Date().toISOString().split("T")[0];
  return StaffAttendanceModel.create({ ...data, date: data.date || today } as StaffAttendanceType);
}

async function update(id: number, data: UpdateStaffAttendanceInput): Promise<StaffAttendanceType> {
  await getById(id);
  await StaffAttendanceModel.update(data, { where: { id } });
  return getById(id);
}

async function clockIn(staffId: number, deviceId?: string): Promise<StaffAttendanceType> {
  const today = new Date().toISOString().split("T")[0];
  const existing = await StaffAttendanceModel.findOne({ 
    where: { staff_id: staffId, date: today, is_deleted: false } 
  });
  
  if (existing && existing.clock_in_time) {
    throw new HttpError(400, AttendanceErrors.ALREADY_CLOCKED_IN);
  }

  const now = new Date();
  const expectedTime = new Date(`${today}T${EXPECTED_START_TIME}`);
  const lateMinutes = now > expectedTime ? Math.floor((now.getTime() - expectedTime.getTime()) / 60000) : 0;

  if (existing) {
    await StaffAttendanceModel.update({
      clock_in_time: now,
      late_minutes: lateMinutes,
      status: lateMinutes > 15 ? "late" : "present"
    }, { where: { id: existing.id } });
    return getById(existing.id);
  }

  return StaffAttendanceModel.create({
    staff_id: staffId,
    date: today,
    clock_in_time: now,
    late_minutes: lateMinutes,
    status: lateMinutes > 15 ? "late" : "present",
    device_id: deviceId
  } as StaffAttendanceType);
}

async function clockOut(staffId: number, deviceId?: string): Promise<StaffAttendanceType> {
  const today = new Date().toISOString().split("T")[0];
  const existing = await StaffAttendanceModel.findOne({ 
    where: { staff_id: staffId, date: today, is_deleted: false } 
  });

  if (!existing || !existing.clock_in_time) {
    throw new HttpError(400, AttendanceErrors.NOT_CLOCKED_IN);
  }

  if (existing.clock_out_time) {
    throw new HttpError(400, AttendanceErrors.ALREADY_CLOCKED_OUT);
  }

  const now = new Date();
  const clockOutTime = new Date(`${today}T${now.toTimeString().split(" ")[0]}`);
  const totalHours = (clockOutTime.getTime() - new Date(existing.clock_in_time!).getTime()) / 3600000;

  const expectedEndTime = new Date(`${today}T17:00:00`);
  const earlyLeaveMinutes = now < expectedEndTime ? Math.floor((expectedEndTime.getTime() - now.getTime()) / 60000) : 0;

  await StaffAttendanceModel.update({
    clock_out_time: clockOutTime,
    total_hours: totalHours,
    early_leave_minutes: earlyLeaveMinutes
  }, { where: { id: existing.id } });

  return getById(existing.id);
}

async function todaySummary(schoolId: number): Promise<{ present: number; absent: number; late: number }> {
  const today = new Date().toISOString().split("T")[0];
  const records = await StaffAttendanceModel.findAll({ where: { date: today, is_deleted: false } });
  
  return {
    present: records.filter(r => r.status === "present").length,
    absent: records.filter(r => r.status === "absent").length,
    late: records.filter(r => r.status === "late").length,
  };
}

async function deleteAttendance(id: number): Promise<void> {
  await getById(id);
  await StaffAttendanceModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, clockIn, clockOut, todaySummary, delete: deleteAttendance };