import { tsModuleUrl } from '../tests/helpers/loadTs.mjs'
const data = await import(tsModuleUrl('../../src/data/education/registry.ts'))
const { validateEducation } = await import(tsModuleUrl('../../src/data/education/validate.ts'))
const { allCareers } = await import(tsModuleUrl('../../src/data/stories/catalog.ts'))
const errors = validateEducation(data.educationSources, data.educationProgrammes, data.educationPathways, data.careerPathwayRelationships, allCareers().map(c => c.id))
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
else console.log(`Education valid: ${data.educationPathways.length} pathway types, ${data.educationProgrammes.length} programme, ${data.educationSources.length} sources.`)
