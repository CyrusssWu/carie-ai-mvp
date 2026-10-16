import { readFileSync } from 'node:fs'
import ts from 'typescript'

const urls = new Map()
export function tsModuleUrl(path) {
  const file = new URL(path, import.meta.url)
  if (urls.has(file.href)) return urls.get(file.href)
  let source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  source = source.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, dependency) => 'from ' + JSON.stringify(tsModuleUrl(new URL(dependency.endsWith('.ts') ? dependency : dependency + '.ts', file))))
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  urls.set(file.href, url)
  return url
}
