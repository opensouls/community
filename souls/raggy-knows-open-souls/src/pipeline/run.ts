#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import * as glob from 'glob';
import { splitSections } from './sectionSplitter.js';
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


async function processRagDirectory() {
  console.log("path: ", `${__dirname}/../../docs/**/*`)
  const files = glob.sync(`${__dirname}/../../docs/**/*`);

  const rootDir = join(__dirname, '..', '..', 'docs');

  const storeDirRoot = join(__dirname, '..', '..', 'stores', 'docs')

  await fs.mkdir(storeDirRoot, { recursive: true });

  for (const file of files) {
    console.log("file: ", file)
    try {
      const content = await fs.readFile(file, 'utf8');
      const sections = splitSections(content);
      console.log(`File: ${file} has been split into ${sections.length} sections.`);
      
    let sectionNumber = 0;
    for (const section of sections) {
      const sectionFileName = `${relative(rootDir, file).replace(/[\/\\]/, '_')}__${sectionNumber}`;
      const sectionFilePath = join(storeDirRoot, sectionFileName);
      await fs.writeFile(sectionFilePath, section, 'utf8');
      console.log(`Section ${sectionNumber} of file ${file} saved as ${sectionFileName}`);
      sectionNumber++;
    }

    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }
}

processRagDirectory();
