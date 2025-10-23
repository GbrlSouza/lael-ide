export async function POST(request) {
  try {
    const { files } = await request.json();
    
    if (!files || typeof files !== 'object') {
      return Response.json({ error: 'Invalid files data' }, { status: 400 });
    }

    // Create a simple ZIP-like structure as a text file
    // In a real implementation, you would use a proper ZIP library
    let zipContent = '';
    
    // Add each file to the ZIP content
    Object.entries(files).forEach(([fileName, fileData]) => {
      zipContent += `=== FILE: ${fileName} ===\n`;
      zipContent += `Language: ${fileData.language}\n`;
      zipContent += `Content-Length: ${fileData.content.length}\n`;
      zipContent += `--- CONTENT START ---\n`;
      zipContent += fileData.content;
      zipContent += `\n--- CONTENT END ---\n\n`;
    });

    // Add project metadata
    const projectInfo = {
      name: 'LAEL Project',
      created: new Date().toISOString(),
      files: Object.keys(files),
      totalFiles: Object.keys(files).length
    };

    zipContent = `=== LAEL IDE PROJECT EXPORT ===\n` +
                `Export Date: ${new Date().toISOString()}\n` +
                `Project Name: ${projectInfo.name}\n` +
                `Total Files: ${projectInfo.totalFiles}\n` +
                `Files: ${projectInfo.files.join(', ')}\n\n` +
                zipContent;

    return Response.json({
      success: true,
      content: zipContent,
      filename: `lael-project-${Date.now()}.txt`,
      metadata: projectInfo
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Failed to export project' }, { status: 500 });
  }
}