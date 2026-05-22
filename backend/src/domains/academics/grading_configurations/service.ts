import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { GradingConfigurationSchema, GradingConfigurationType } from "./validator.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class GradingConfigurationsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("grading_configurations as gc")
      .leftJoin("academic_years as ay", "ay.id", "gc.academic_year_id")
      .selectAll("gc")
      .select(["ay.name as academic_year_name"])
      .where("gc.school_id", "=", context.schoolId)
      .where("gc.is_deleted", "=", false)
      .orderBy("gc.is_default", "desc")
      .orderBy("gc.name", "asc");

    if (params?.is_active) {
      query = query.where("gc.is_active", "=", params.is_active === 'true');
    }

    const rows = await query.execute();
    
    // Parse grading_scale JSONB column if returned as string
    return rows.map((row: any) => ({
      ...row,
      grading_scale: typeof row.grading_scale === 'string' ? JSON.parse(row.grading_scale) : row.grading_scale,
    }));
  }

  async findById(context: UserContext, id: number | string) {
    const row = await db
      .selectFrom("grading_configurations as gc")
      .leftJoin("academic_years as ay", "ay.id", "gc.academic_year_id")
      .selectAll("gc")
      .select(["ay.name as academic_year_name"])
      .where("gc.id", "=", Number(id))
      .where("gc.school_id", "=", context.schoolId)
      .where("gc.is_deleted", "=", false)
      .executeTakeFirst();
    
    if (!row) return null;
    
    // Parse grading_scale JSONB column if returned as string
    return {
      ...(row as any),
      grading_scale: typeof (row as any).grading_scale === 'string' ? JSON.parse((row as any).grading_scale) : (row as any).grading_scale,
    };
  }

  async getDefaultConfig(context: UserContext, academicYearId?: number) {
    let query = db
      .selectFrom("grading_configurations")
      .selectAll()
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .where("is_active", "=", true)
      .where("is_default", "=", true);

    if (academicYearId) {
      query = query.where("academic_year_id", "=", academicYearId);
    }

    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: GradingConfigurationType) {
    const validated = GradingConfigurationSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
      updated_by: context.userId,
    });

    // If this is set as default, handle grading_scale serialization
    const gradingScale = JSON.parse(JSON.stringify(validated.grading_scale));

    const result = await db
      .insertInto("grading_configurations" as any)
      .values({
        ...validated,
        grading_scale: gradingScale,
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async update(context: UserContext, id: number | string, data: Partial<GradingConfigurationType>) {
    const validated = GradingConfigurationSchema.partial().parse(data);

    const updateData: any = {
      ...validated,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    // Serialize grading_scale if provided
    if (validated.grading_scale) {
      updateData.grading_scale = JSON.parse(JSON.stringify(validated.grading_scale));
    }

    return await db
      .updateTable("grading_configurations" as any)
      .set(updateData)
      .where("id", "=", Number(id))
      .where("school_id", "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("grading_configurations" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
        updated_at: new Date(),
      })
      .where("id", "=", Number(id))
      .where("school_id", "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Calculate final grade for a student using school's grading configuration
   */
  async calculateFinalGrade(
    context: UserContext,
    studentId: number,
    classId: number,
    termId: number,
    configId?: number
  ) {
    // Get grading configuration
    let config: any;
    if (configId) {
      config = await this.findById(context, configId);
    } else {
      config = await this.getDefaultConfig(context);
    }

    if (!config) {
      throw new Error("No grading configuration found for this school");
    }

    // Get all graded items for this student in this class/term
    const gradedItems = await this.getStudentGradedItems(context, studentId, classId, termId);

    // Calculate category averages
    const categoryAverages = this.calculateCategoryAverages(gradedItems, config);

    // Calculate final grade using category weights
    const finalGrade = this.calculateWeightedFinalGrade(categoryAverages, config);

    // Determine grade letter from grading scale
    const gradeLetter = this.getGradeLetter(finalGrade.percentage, config.grading_scale);

    return {
      ...finalGrade,
      grade_letter: gradeLetter.grade,
      grade_point: gradeLetter.grade_point,
      description: gradeLetter.description,
      category_averages: categoryAverages,
      configuration: {
        id: config.id,
        name: config.name,
        assessments_weight: config.assessments_weight,
        exams_weight: config.exams_weight,
        assignments_weight: config.assignments_weight,
      },
    };
  }

  /**
   * Get all graded items for a student
   */
  private async getStudentGradedItems(
    context: UserContext,
    studentId: number,
    classId: number,
    termId: number
  ) {
    const items: any[] = [];

    // Get assessments
    const assessments = await db
      .selectFrom("assessments as a")
      .innerJoin("assessment_results as ar", "ar.assessment_id", "a.id")
      .select([
        sql<string>`'assessment'`.as("item_type"),
        "a.id as item_id",
        "a.title",
        "a.max_score",
        "a.weight",
        "ar.score",
        "ar.grade_letter",
        "ar.grade_point",
      ])
      .where("a.class_id", "=", classId)
      .where("a.term_id", "=", termId)
      .where("ar.student_id", "=", studentId)
      .where("a.school_id", "=", context.schoolId)
      .where("a.is_deleted", "=", false)
      .where("ar.is_deleted", "=", false)
      .execute();

    items.push(...assessments);

    // Get exams
    const exams = await db
      .selectFrom("exams as e")
      .innerJoin("exam_results as er", "er.exam_id", "e.id")
      .select([
        sql<string>`'exam'`.as("item_type"),
        "e.id as item_id",
        "e.title",
        "e.max_score",
        "e.weight",
        "er.score",
        "er.grade_letter",
        "er.grade_point",
      ])
      .where("e.class_id", "=", classId)
      .where("e.term_id", "=", termId)
      .where("er.student_id", "=", studentId)
      .where("e.school_id", "=", context.schoolId)
      .where("e.is_deleted", "=", false)
      .where("er.is_deleted", "=", false)
      .execute();

    items.push(...exams);

    // Get assignments (if exists)
    try {
      const assignments = await db
        .selectFrom("assignments as asgn")
        .innerJoin("assignment_results as asgnr", "asgnr.assignment_id", "asgn.id")
        .select([
          sql<string>`'assignment'`.as("item_type"),
          "asgn.id as item_id",
          "asgn.title",
          "asgn.max_score",
          "asgn.weight",
          "asgnr.score",
          "asgnr.grade_letter",
          "asgnr.grade_point",
        ])
        .where("asgn.class_id", "=", classId)
        .where("asgn.term_id", "=", termId)
        .where("asgnr.student_id", "=", studentId)
        .where("asgn.school_id", "=", context.schoolId)
        .where("asgn.is_deleted", "=", false)
        .where("asgnr.is_deleted", "=", false)
        .execute();

      items.push(...assignments);
    } catch (err) {
      // Assignments might not exist yet, ignore
    }

    return items;
  }

  /**
   * Calculate average for each category
   */
  private calculateCategoryAverages(items: any[], config: any) {
    const categories = {
      assessments: { totalWeighted: 0, totalWeight: 0, count: 0 },
      exams: { totalWeighted: 0, totalWeight: 0, count: 0 },
      assignments: { totalWeighted: 0, totalWeight: 0, count: 0 },
    };

    for (const item of items) {
      const category = item.item_type === 'assessment' ? 'assessments' :
                       item.item_type === 'exam' ? 'exams' : 'assignments';
      
      if (item.score !== null && item.max_score > 0) {
        const percentage = (item.score / item.max_score) * 100;
        const weight = item.weight || 1.0;
        
        categories[category].totalWeighted += percentage * weight;
        categories[category].totalWeight += weight;
        categories[category].count++;
      }
    }

    return {
      assessments: categories.assessments.totalWeight > 0
        ? categories.assessments.totalWeighted / categories.assessments.totalWeight
        : null,
      exams: categories.exams.totalWeight > 0
        ? categories.exams.totalWeighted / categories.exams.totalWeight
        : null,
      assignments: categories.assignments.totalWeight > 0
        ? categories.assignments.totalWeighted / categories.assignments.totalWeight
        : null,
    };
  }

  /**
   * Calculate final grade using weighted average of categories
   */
  private calculateWeightedFinalGrade(categoryAverages: any, config: any) {
    let totalPercentage = 0;
    let totalWeight = 0;

    if (categoryAverages.assessments !== null) {
      totalPercentage += categoryAverages.assessments * (config.assessments_weight / 100);
      totalWeight += config.assessments_weight;
    }

    if (categoryAverages.exams !== null) {
      totalPercentage += categoryAverages.exams * (config.exams_weight / 100);
      totalWeight += config.exams_weight;
    }

    if (categoryAverages.assignments !== null) {
      totalPercentage += categoryAverages.assignments * (config.assignments_weight / 100);
      totalWeight += config.assignments_weight;
    }

    const finalPercentage = totalWeight > 0 ? totalPercentage : 0;
    const roundedPercentage = config.round_final_grade
      ? parseFloat(finalPercentage.toFixed(config.decimal_places))
      : finalPercentage;

    return {
      percentage: roundedPercentage,
      total_items_graded: categoryAverages.assessments !== null ? 1 : 0 +
                           categoryAverages.exams !== null ? 1 : 0 +
                           categoryAverages.assignments !== null ? 1 : 0,
    };
  }

  /**
   * Get grade letter from grading scale
   */
  private getGradeLetter(percentage: number, gradingScale: any[]) {
    // Sort by min_percentage descending to get best match first
    const sorted = [...gradingScale].sort((a, b) => b.min_percentage - a.min_percentage);
    
    for (const entry of sorted) {
      if (percentage >= entry.min_percentage && percentage <= entry.max_percentage) {
        return {
          grade: entry.grade,
          grade_point: entry.grade_point,
          description: entry.description,
        };
      }
    }

    // Fallback to lowest grade
    const lowest = sorted[sorted.length - 1];
    return {
      grade: lowest?.grade || 'F',
      grade_point: lowest?.grade_point || 0.0,
      description: lowest?.description || 'No grade',
    };
  }
}

export const gradingConfigurationsService = new GradingConfigurationsService();
