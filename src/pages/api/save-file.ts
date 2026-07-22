import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { filename, content } = body;

    if (!filename || !content) {
      return new Response(JSON.stringify({ error: 'Filename and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure the filename ends with .md
    const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
    
    // Construct the path to src/content/setups
    const contentDir = path.join(process.cwd(), 'src', 'content', 'setups');
    const filePath = path.join(contentDir, safeFilename);

    // Write the file
    fs.writeFileSync(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `File ${safeFilename} saved successfully!` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
