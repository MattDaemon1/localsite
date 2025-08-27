import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ProjectFile {
  name: string;
  content: string;
}

/**
 * Downloads HTML content as a complete website project in ZIP format
 * @param html - The HTML content to extract files from
 * @param projectName - Name for the project (used as folder and file names)
 */
export async function downloadProjectAsZip(html: string, projectName: string = 'localsite-project') {
  const zip = new JSZip();
  const projectFolder = zip.folder(projectName);
  
  if (!projectFolder) {
    throw new Error('Failed to create project folder');
  }

  // Parse HTML to extract CSS and JS
  const files = extractFilesFromHtml(html, projectName);
  
  // Add all files to the ZIP
  files.forEach(file => {
    projectFolder.file(file.name, file.content);
  });
  
  // Add a README with project info
  const readme = generateReadme(projectName);
  projectFolder.file('README.md', readme);
  
  // Generate ZIP and download
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  saveAs(zipBlob, `${projectName}.zip`);
}

/**
 * Extracts CSS, JS and creates separate files from HTML
 */
function extractFilesFromHtml(html: string, projectName: string): ProjectFile[] {
  const files: ProjectFile[] = [];
  
  // Extract inline CSS
  const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  let extractedCSS = '';
  
  if (cssMatches) {
    cssMatches.forEach((match) => {
      const cssContent = match.replace(/<\/?style[^>]*>/gi, '');
      extractedCSS += cssContent + '\n\n';
    });
  }
  
  // Extract inline JavaScript (only scripts WITHOUT src attribute)
  const jsMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  let extractedJS = '';
  
  if (jsMatches) {
    jsMatches.forEach((match) => {
      // Only extract scripts that don't have src attribute AND have actual content
      if (!match.includes('src=') && match.replace(/<\/?script[^>]*>/gi, '').trim()) {
        const jsContent = match.replace(/<\/?script[^>]*>/gi, '');
        extractedJS += jsContent + '\n\n';
      }
    });
  }
  
  // Create cleaned HTML (without inline styles and scripts)
  let cleanHtml = html;
  
  // Replace inline styles with link to external CSS
  if (extractedCSS) {
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanHtml = cleanHtml.replace(
      '</head>',
      '  <link rel="stylesheet" href="styles.css">\n</head>'
    );
    files.push({ name: 'styles.css', content: extractedCSS.trim() });
  }
  
  // Replace inline scripts with link to external JS (only non-empty inline scripts)
  if (extractedJS) {
    // Remove only inline scripts that have content (not external scripts with src)
    cleanHtml = cleanHtml.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi, (match, content) => {
      // Only remove if there's actual content inside the script tags
      return content.trim() ? '' : match;
    });
    cleanHtml = cleanHtml.replace(
      '</body>',
      '  <script src="script.js"></script>\n</body>'
    );
    files.push({ name: 'script.js', content: extractedJS.trim() });
  }
  
  // Add the main HTML file
  files.push({ name: 'index.html', content: cleanHtml });
  
  return files;
}

/**
 * Generates a README file for the project
 */
function generateReadme(projectName: string): string {
  return `# ${projectName}

This project was generated using LocalSite - a 100% local web development tool powered by Ollama.

## Files Structure

- \`index.html\` - Main HTML file
- \`styles.css\` - Extracted CSS styles (if any)
- \`script.js\` - Extracted JavaScript code (if any)

## How to Use

1. Open \`index.html\` in your web browser
2. Or serve the folder using a local web server:
   \`\`\`bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have live-server installed)
   npx live-server
   \`\`\`

## About LocalSite

LocalSite is based on DeepSite by [@enzostvs](https://huggingface.co/enzostvs).
- Original project: [DeepSite on HuggingFace](https://huggingface.co/spaces/enzostvs/deepsite)

Generated on: ${new Date().toLocaleString()}
`;
}

/**
 * Downloads only the HTML file
 */
export function downloadHtmlFile(html: string, filename: string = 'website.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
}