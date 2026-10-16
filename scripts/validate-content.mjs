import { tsModuleUrl } from '../tests/helpers/loadTs.mjs'
const { allCareers, publishedStories, storyCatalog } = await import(tsModuleUrl('../../src/data/stories/catalog.ts'))
const { validateContent } = await import(tsModuleUrl('../../src/data/stories/validate.ts'))
const errors = validateContent(allCareers(), Object.values(storyCatalog))
const versions = publishedStories.map(s => `${s.id}@${s.version}`)
if (new Set(versions).size !== versions.length) errors.push('Duplicate published story/version')
for (const story of publishedStories) errors.push(...validateContent(allCareers(), [...Object.values(storyCatalog).filter(s => s.id !== story.id), story]))
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1 }
else console.log(`Content valid: ${Object.keys(storyCatalog).length} stories, ${publishedStories.length} published versions.`)
