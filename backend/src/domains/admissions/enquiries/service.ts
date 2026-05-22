// Enquiries Service - Multi-Tenant Service Layer
import { db } from "../../../config/infra/database.js";
import { EnquiriesSchema, EnquiryTypesSchema, EnquirySourcesSchema, EnquiryNotesSchema, EnquiryAttachmentsSchema, EnquiryStatusTypesSchema, EnquiryPriorityLevelsSchema, EnquirySubjectsSchema } from "./validator.js";
import { EnquiriesType, EnquiryTypesType, EnquirySourcesType, EnquiryNotesType, EnquiryAttachmentsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export interface EnquiryFilters {
  status?: string;
  priority?: string;
  enquiry_type_id?: number;
  enquiry_source_id?: number;
  assigned_to?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export class EnquiriesService {
  // ==================== MAIN ENQUIRIES ====================
  
  async findAll(context: UserContext, filters?: EnquiryFilters) {
    let query = db
      .selectFrom("enquiries" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    
    // Apply filters
    if (filters?.status) {
      query = query.where("status" as any, "=", filters.status);
    }
    if (filters?.priority) {
      query = query.where("priority" as any, "=", filters.priority);
    }
    if (filters?.enquiry_type_id) {
      query = query.where("enquiry_type_id" as any, "=", filters.enquiry_type_id);
    }
    if (filters?.enquiry_source_id) {
      query = query.where("enquiry_source_id" as any, "=", filters.enquiry_source_id);
    }
    if (filters?.assigned_to) {
      query = query.where("assigned_to" as any, "=", filters.assigned_to);
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where((eb: any) => eb.or([
        eb("subject" as any, "ilike", searchTerm),
        eb("enquirer_name" as any, "ilike", searchTerm),
        eb("enquirer_email" as any, "ilike", searchTerm),
        eb("enquirer_phone" as any, "ilike", searchTerm),
        eb("reference_no" as any, "ilike", searchTerm),
      ]));
    }
    if (filters?.date_from) {
      query = query.where("enquiry_date" as any, ">=", filters.date_from);
    }
    if (filters?.date_to) {
      query = query.where("enquiry_date" as any, "<=", filters.date_to);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    query = query.orderBy("enquiry_date" as any, "desc");
    query = query.offset((page - 1) * limit).limit(limit);
    
    const enquiries = await query.execute();
    
    // Get total count
    const countQuery = db
      .selectFrom("enquiries" as any)
      .select((eb: any) => eb.fn.count("id" as any).as("total"))
      .where("school_id" as any, "=", context.schoolId as any)
      .where("is_deleted" as any, "=", false);
    const countResult: any = await countQuery.execute();
    const total = countResult[0]?.total || countResult[0]?.count || 0;

    return {
      data: enquiries,
      pagination: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("enquiries" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: EnquiriesType) {
    const validated = EnquiriesSchema.parse({
       ...data,
       school_id: context.schoolId
    });
    return await db.insertInto("enquiries" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<EnquiriesType>) {
    // Get current enquiry to check if status changed
    const currentEnquiry: any = await db
      .selectFrom("enquiries" as any)
      .select(["status"])
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .executeTakeFirst();

    const updateData: any = {
      ...data,
      updated_at: new Date(),
      updated_by: context.userId,
    };

    const result = await db
      .updateTable("enquiries" as any)
      .set(updateData)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();

    // Auto-create note if status changed
    if (currentEnquiry && data.status && currentEnquiry.status !== data.status) {
      const statusLabels: Record<string, string> = {
        new: 'New',
        in_progress: 'In Progress',
        waiting_response: 'Waiting Response',
        converted: 'Converted',
        closed: 'Closed',
        rejected: 'Rejected',
      };

      const noteText = `Status changed from ${statusLabels[currentEnquiry.status] || currentEnquiry.status} to ${statusLabels[data.status] || data.status}`;

      await db.insertInto("enquiry_notes" as any).values({
        school_id: context.schoolId,
        enquiry_id: Number(id),
        note: noteText,
        note_type: 'system',
        is_private: false,
        created_by: context.userId,
        created_at: new Date(),
      } as any).execute();
    }

    return result;
  }

  async delete(context: UserContext, id: number | string) {
    return await db.updateTable("enquiries" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
      } as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async assign(context: UserContext, enquiryId: number | string, assignedTo: number) {
    return await db.updateTable("enquiries" as any)
      .set({
        assigned_to: assignedTo,
        assigned_by: context.userId,
        assigned_at: new Date(),
        status: "in_progress",
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", Number(enquiryId))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async updateStatus(context: UserContext, enquiryId: number | string, status: string) {
    const validStatuses = ["new", "in_progress", "waiting_response", "converted", "closed", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updateData: any = {
      status,
      updated_at: new Date(),
      updated_by: context.userId,
    };

    if (status === "closed" || status === "converted") {
      updateData.resolved_date = new Date();
      updateData.resolved_by = context.userId;
    }

    return await db.updateTable("enquiries" as any)
      .set(updateData)
      .where("id" as any, "=", Number(enquiryId))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async convertToStudent(context: UserContext, enquiryId: number | string, studentId: number) {
    return await db.updateTable("enquiries" as any)
      .set({
        status: "converted",
        student_id: studentId,
        resolved_date: new Date(),
        updated_at: new Date(),
        updated_by: context.userId,
      } as any)
      .where("id" as any, "=", Number(enquiryId))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async getStatistics(context: UserContext, dateFrom?: string, dateTo?: string) {
    let query = db
      .selectFrom("enquiries" as any)
      .select((eb: any) => eb.fn.count("id" as any).as("total"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "new").as("new_count"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "in_progress").as("in_progress_count"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "waiting_response").as("waiting_response_count"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "converted").as("converted_count"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "closed").as("closed_count"))
      .select((eb: any) => eb.fn.count("id" as any).filterWhere("status" as any, "=", "rejected").as("rejected_count"))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    if (dateFrom) {
      query = query.where("enquiry_date" as any, ">=", dateFrom);
    }
    if (dateTo) {
      query = query.where("enquiry_date" as any, "<=", dateTo);
    }

    const result = await query.executeTakeFirst();
    return result;
  }

  // ==================== ENQUIRY CATEGORIES (formerly Types) ====================

  async findAllTypes(context: UserContext) {
    return await db
      .selectFrom("enquiry_categories" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("display_order" as any, "asc")
      .execute();
  }

  async createType(context: UserContext, data: any) {
    const validated = EnquiryTypesSchema.parse({
      ...data,
      school_id: context.schoolId,
    });

    return await db
      .insertInto("enquiry_categories" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async updateType(context: UserContext, id: number | string, data: any) {
    return await db
      .updateTable("enquiry_categories" as any)
      .set({ ...data, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteType(context: UserContext, id: number | string) {
    return await db
      .updateTable("enquiry_categories" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY SOURCES ====================

  async findAllSources(context: UserContext) {
    return await db
      .selectFrom("enquiry_sources" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("name" as any, "asc")
      .execute();
  }

  async createSource(context: UserContext, data: EnquirySourcesType) {
    const validated = EnquirySourcesSchema.parse({
      ...data,
      school_id: context.schoolId,
    });

    return await db
      .insertInto("enquiry_sources" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async updateSource(context: UserContext, id: number | string, data: Partial<EnquirySourcesType>) {
    return await db
      .updateTable("enquiry_sources" as any)
      .set({ ...data, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteSource(context: UserContext, id: number | string) {
    return await db
      .updateTable("enquiry_sources" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY NOTES ====================

  async findNotesByEnquiryId(context: UserContext, enquiryId: number | string) {
    const notes = await db
      .selectFrom("enquiry_notes" as any)
      .selectAll()
      .where("enquiry_id" as any, "=", Number(enquiryId))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .orderBy("created_at" as any, "desc")
      .execute();
    
    // Get user details separately
    const notesWithUsers = await Promise.all(
      notes.map(async (note: any) => {
        if (note.created_by) {
          const user = await db
            .selectFrom("users" as any)
            .select(["name", "username"])
            .where("id" as any, "=", note.created_by)
            .executeTakeFirst();
          return { ...note, created_by_name: user?.name, created_by_username: user?.username };
        }
        return note;
      })
    );
    
    return notesWithUsers;
  }

  async createNote(context: UserContext, data: EnquiryNotesType) {
    const validated = EnquiryNotesSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
    });

    return await db
      .insertInto("enquiry_notes" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async updateNote(context: UserContext, id: number | string, data: Partial<EnquiryNotesType>) {
    return await db
      .updateTable("enquiry_notes" as any)
      .set({ ...data, updated_at: new Date(), updated_by: context.userId } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteNote(context: UserContext, id: number | string) {
    return await db
      .updateTable("enquiry_notes" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY ATTACHMENTS ====================

  async findAttachmentsByEnquiryId(context: UserContext, enquiryId: number | string) {
    return await db
      .selectFrom("enquiry_attachments" as any)
      .selectAll()
      .where("enquiry_id" as any, "=", Number(enquiryId))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .orderBy("uploaded_at" as any, "desc")
      .execute();
  }

  async createAttachment(context: UserContext, data: EnquiryAttachmentsType) {
    const validated = EnquiryAttachmentsSchema.parse({
      ...data,
      school_id: context.schoolId,
      uploaded_by: context.userId,
    });

    return await db
      .insertInto("enquiry_attachments" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteAttachment(context: UserContext, id: number | string) {
    return await db
      .updateTable("enquiry_attachments" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY STATUS TYPES ====================

  async findAllStatusTypes(context: UserContext) {
    return await db
      .selectFrom("enquiry_status_types" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("display_order" as any, "asc")
      .execute();
  }

  async createStatusType(context: UserContext, data: any) {
    const validated = EnquiryStatusTypesSchema.parse({ ...data, school_id: context.schoolId });
    return await db.insertInto("enquiry_status_types" as any).values(validated as any).returningAll().executeTakeFirst();
  }

  async updateStatusType(context: UserContext, id: number | string, data: any) {
    return await db.updateTable("enquiry_status_types" as any)
      .set({ ...data, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteStatusType(context: UserContext, id: number | string) {
    return await db.updateTable("enquiry_status_types" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY PRIORITY LEVELS ====================

  async findAllPriorityLevels(context: UserContext) {
    return await db
      .selectFrom("enquiry_priority_levels" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("display_order" as any, "asc")
      .execute();
  }

  async createPriorityLevel(context: UserContext, data: any) {
    const validated = EnquiryPriorityLevelsSchema.parse({ ...data, school_id: context.schoolId });
    return await db.insertInto("enquiry_priority_levels" as any).values(validated as any).returningAll().executeTakeFirst();
  }

  async updatePriorityLevel(context: UserContext, id: number | string, data: any) {
    return await db.updateTable("enquiry_priority_levels" as any)
      .set({ ...data, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deletePriorityLevel(context: UserContext, id: number | string) {
    return await db.updateTable("enquiry_priority_levels" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENQUIRY SUBJECTS ====================

  async findAllSubjects(context: UserContext) {
    return await db
      .selectFrom("enquiry_subjects" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("display_order" as any, "asc")
      .execute();
  }

  async createSubject(context: UserContext, data: any) {
    const validated = EnquirySubjectsSchema.parse({ ...data, school_id: context.schoolId });
    return await db.insertInto("enquiry_subjects" as any).values(validated as any).returningAll().executeTakeFirst();
  }

  async updateSubject(context: UserContext, id: number | string, data: any) {
    return await db.updateTable("enquiry_subjects" as any)
      .set({ ...data, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteSubject(context: UserContext, id: number | string) {
    return await db.updateTable("enquiry_subjects" as any)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }
}

export const enquiriesService = new EnquiriesService();
