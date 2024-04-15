import { splitSections } from './sectionSplitter.js';
import { FilePipeline } from '@opensouls/engine';

const run = async () => {
  const pipeline = new FilePipeline("docs", "stores/docs", { replace: true })
  return pipeline.process(async ({ content, path }) => {
    const sections = splitSections(await content());
    console.log(`File: ${path} has been split into ${sections.length} sections.`);
   
    return sections
  })
}

export default run
