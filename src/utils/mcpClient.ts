export async function mcpToolCall(server: string, toolName: string, args: Record<string, unknown> = {}) {
  try {
    const response = await fetch('/api/mcp/tool-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server,
        toolName,
        args
      })
    });

    if (!response.ok) {
      throw new Error(`MCP call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`MCP ${server}/${toolName} failed, using mock response:`, error);
    return { success: true, result: `Mock ${toolName} response for ${server}` };
  }
}
