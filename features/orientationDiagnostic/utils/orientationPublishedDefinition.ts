import { MODULE_META } from '../data/orientationDiagnosticQuestions';
import type { DiagnosticAnswers, DiagnosticStep, ModuleId } from '../types/orientationDiagnosticPrototype';
import type { OrientationTestDefinition, OrientationTestModule } from '@/services/orientationDiagnosticSession';
import { isStepAnswered } from './orientationDiagnosticEngine';

const REQUIRED_CATALOG_IDS = ['car_secteurs', 'car_metiers', 'sch_types', 'sch_ecoles'] as const;

const MODULE_IDS = new Set<ModuleId>([
  'profile',
  'context',
  'riasec',
  'situations',
  'functioning',
  'ambitions',
  'readiness',
  'reality',
  'careers',
  'schools',
  'versus',
]);

export function isOrientationModuleId(value: string): value is ModuleId {
  return MODULE_IDS.has(value as ModuleId);
}

function isMandatoryCatalogStep(step: { id?: string; kind?: string }): boolean {
  return (
    REQUIRED_CATALOG_IDS.includes(step.id as (typeof REQUIRED_CATALOG_IDS)[number])
    || step.kind === 'dynamic_sectors'
    || step.kind === 'dynamic_metiers'
    || step.kind === 'dynamic_schools'
  );
}

/** Les écoles restent juste avant le Versus, pour enchaîner la coupe des écoles. */
export function placeSchoolsBeforeVersus(modules: OrientationTestModule[]): OrientationTestModule[] {
  const schools = modules.filter((item) => item.code === 'schools');
  const rest = modules.filter((item) => item.code !== 'schools');
  const versusIndex = rest.findIndex((item) => item.code === 'versus');
  if (versusIndex < 0 || schools.length === 0) return modules;
  rest.splice(versusIndex, 0, ...schools);
  return rest;
}

function readable(value?: string): string | undefined {
  return value ? value.replace(/\\\//g, '/') : value;
}

export function publishedTestSteps(definition: OrientationTestDefinition): DiagnosticStep[] {
  const moduleOrder = placeSchoolsBeforeVersus(
    (definition.modules ?? [])
      .filter((item) => item.code)
      .slice()
      .sort((a, b) => a.position - b.position),
  );
  const rank = new Map(moduleOrder.map((item, index) => [String(item.code), index]));
  const questions: DiagnosticStep[] = (definition.questions ?? [])
    .filter((step) => step.kind !== 'adaptive_versus' && (step.active !== false || isMandatoryCatalogStep(step)))
    .filter((step) => isOrientationModuleId(String(step.module)))
    .map((step) => ({
      ...step,
      module: step.module as ModuleId,
      active: isMandatoryCatalogStep(step) ? true : step.active,
      title: readable(step.title) || step.title,
      subtitle: readable(step.subtitle),
      titleAr: readable(step.titleAr),
      subtitleAr: readable(step.subtitleAr),
      leftLabel: readable(step.leftLabel),
      rightLabel: readable(step.rightLabel),
      leftLabelAr: readable(step.leftLabelAr),
      rightLabelAr: readable(step.rightLabelAr),
      options: step.options?.map((option) => ({
        ...option,
        label: readable(option.label) || option.label,
        labelAr: readable(option.labelAr),
      })),
    }));
  return questions.slice().sort(
    (a, b) =>
      (rank.get(String(a.module)) ?? 999) - (rank.get(String(b.module)) ?? 999) ||
      (a.position ?? 0) - (b.position ?? 0),
  );
}

export function publishedTestModules(
  definition: OrientationTestDefinition,
  steps: DiagnosticStep[],
): OrientationTestModule[] {
  const modules = (definition.modules ?? [])
    .filter((item) => item.code && (item.active !== false || item.code === 'careers' || item.code === 'schools'))
    .map((item) =>
      item.code === 'careers' || item.code === 'schools' ? { ...item, active: true } : item,
    );
  for (const code of ['careers', 'schools'] as const) {
    if (modules.some((item) => item.code === code)) continue;
    if (!steps.some((step) => step.module === code)) continue;
    const meta = MODULE_META[code];
    modules.push({
      code,
      position: code === 'careers' ? 9 : 11,
      active: true,
      label: meta.label,
      labelAr: '',
      short: meta.short,
      shortAr: '',
      duration: meta.duration,
      durationAr: '',
      objective: meta.objective,
      objectiveAr: '',
    });
  }
  return placeSchoolsBeforeVersus(modules.sort((a, b) => a.position - b.position));
}

export function publishedModuleOrder(modules: OrientationTestModule[]): ModuleId[] {
  const order = placeSchoolsBeforeVersus(modules)
    .map((item) => String(item.code))
    .filter(isOrientationModuleId);
  return order.length ? order : [];
}

/** Une étape est franchie seulement si chacune de ses questions a une réponse enregistrée. */
export function modulesFullyAnswered(
  order: readonly string[],
  steps: DiagnosticStep[],
  answers: DiagnosticAnswers,
): ModuleId[] {
  return order.filter((moduleId) => {
    const moduleSteps = steps.filter(
      (step) => step.module === moduleId && step.kind !== 'adaptive_versus' && step.active !== false,
    );
    if (moduleSteps.length === 0) return false;
    return moduleSteps.every((step) => isStepAnswered(step.id, answers, step));
  }) as ModuleId[];
}

export function lastContiguousModule(order: readonly string[], answered: readonly string[]): ModuleId | null {
  let last: ModuleId | null = null;
  for (const id of order) {
    if (!answered.includes(id)) break;
    last = id as ModuleId;
  }
  return last;
}
