import path from "path";

export const projectRoot = path.resolve(__dirname, '../../')
export const outDir = path.resolve(projectRoot, 'dist')
export const libTemplateRoot = path.resolve(projectRoot, 'packages/vue3-component-lib-template')
export const componentsRoot = path.resolve(projectRoot, 'packages/components')