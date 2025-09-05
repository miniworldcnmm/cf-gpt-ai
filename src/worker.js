// src/worker.js
// 完整 Worker：已将前端 HTML 放入 getHTML()，避免构建器把 HTML 当作 JS 解析。

// 作者信息保护 - 不可篡改
const AUTHOR_INFO = {
  name: "康康的订阅天地",
  platform: "YouTube",
  verified: true
};

// 模型参数配置函数
function getModelOptimalParams(modelKey, modelId) {
  const baseParams = { stream: false };
  switch (modelKey) {
    case 'deepseek-r1':
      return { ...baseParams, max_tokens: 8192, temperature: 0.8, top_p: 0.9, top_k: 50, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'gpt-oss-120b':
    case 'gpt-oss-20b':
      return {};
    case 'llama-4-scout':
      return { ...baseParams, max_tokens: 4096, temperature: 0.75, top_p: 0.95, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'qwen-coder':
      return { ...baseParams, max_tokens: 8192, temperature: 0.3, top_p: 0.8, top_k: 30, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'gemma-3':
      return { ...baseParams, max_tokens: 4096, temperature: 0.8, top_p: 0.9, top_k: 40, repetition_penalty: 1.0, frequency_penalty: 0.1, presence_penalty: 0.1 };
    default:
      return { ...baseParams, max_tokens: 2048 };
  }
}

// 模型配置（保持原始信息）
const MODEL_CONFIG = {
  "deepseek-r1": {
    "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    "name": "DeepSeek-R1-Distill-Qwen-32B",
    "description": "思维链推理模型，支持复杂逻辑推理和数学计算",
    "context": 80000,
    "max_output": 8192,
    "input_price": 0.50,
    "output_price": 4.88,
    "use_messages": true,
    "features": ["思维链推理", "数学计算", "代码生成"]
  },
  "gpt-oss-120b": {
    "id": "@cf/openai/gpt-oss-120b",
    "name": "OpenAI GPT-OSS-120B",
    "description": "生产级通用模型，高质量文本生成和推理",
    "context": 128000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.75,
    "use_input": true,
    "features": ["通用对话", "文本分析", "创意写作"]
  },
  "gpt-oss-20b": {
    "id": "@cf/openai/gpt-oss-20b",
    "name": "OpenAI GPT-OSS-20B",
    "description": "低延迟快速响应模型，适合实时对话",
    "context": 128000,
    "max_output": 2048,
    "input_price": 0.20,
    "output_price": 0.30,
    "use_input": true,
    "features": ["快速响应", "实时对话", "简单任务"]
  },
  "llama-4-scout": {
    "id": "@cf/meta/llama-4-scout-17b-16e-instruct",
    "name": "Meta Llama 4 Scout",
    "description": "多模态模型，支持文本和图像理解分析",
    "context": 131000,
    "max_output": 4096,
    "input_price": 0.27,
    "output_price": 0.85,
    "use_messages": true,
    "features": ["多模态", "图像理解", "长文档分析"]
  },
  "qwen-coder": {
    "id": "@cf/qwen/qwen2.5-coder-32b-instruct",
    "name": "Qwen2.5-Coder-32B",
    "description": "代码专家模型，擅长编程和技术问题",
    "context": 32768,
    "max_output": 8192,
    "input_price": 0.66,
    "output_price": 1.00,
    "use_messages": true,
    "features": ["代码生成", "调试分析", "技术文档"]
  },
  "gemma-3": {
    "id": "@cf/google/gemma-3-12b-it",
    "name": "Gemma 3 12B",
    "description": "多语言模型，支持140+种语言和文化理解",
    "context": 80000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.56,
    "use_prompt": true,
    "features": ["多语言", "文化理解", "翻译"]
  }
};

// Helper: 验证作者信息完整性
function verifyAuthorInfo() {
  if (AUTHOR_INFO.name !== "康康的订阅天地" ||
      AUTHOR_INFO.platform !== "YouTube" ||
      !AUTHOR_INFO.verified) {
    throw new Error("作者信息已被篡改，服务拒绝运行！请保持原始作者信息：YouTube：康康的订阅天地");
  }
}

// export default fetch handler
export default {
  async fetch(request, env, ctx) {
    try {
      // 本地验证作者信息
      verifyAuthorInfo();
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        status: "服务已停止运行"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/') {
        return new Response(getHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/models') {
        return new Response(JSON.stringify(MODEL_CONFIG), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'GET') {
        return await getHistory(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'POST') {
        return await saveHistory(request, env, corsHeaders);
      }

      if (url.pathname === '/api/debug-gpt' && request.method === 'POST') {
        return await debugGPT(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: '服务器内部错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// ------------------ 路由处理函数与工具函数 ------------------

async function handleChat(request, env, corsHeaders) {
  try {
    const { message, model, password, history = [] } = await request.json();

    // 验证密码
    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 测试消息
    if (message === 'test') {
      return new Response(JSON.stringify({ reply: 'test', model: 'test' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!MODEL_CONFIG[model]) {
      return new Response(JSON.stringify({ error: '无效的模型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = MODEL_CONFIG[model];

    const maxHistoryLength = Math.floor(selectedModel.context / 1000);
    const recentHistory = history.slice(-maxHistoryLength);

    let response;
    let reply;

    try {
      if (selectedModel.use_input) {
        let userInput;
        if (message === 'test') {
          userInput = "What is the origin of the phrase Hello, World?";
        } else {
          userInput = `请用中文回答以下问题：${message}`;
        }

        response = await env.AI.run(selectedModel.id, { input: userInput });
        reply = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_prompt) {
        const promptText = recentHistory.length > 0
          ? `你是一个智能AI助手，请务必用中文回答所有问题。\n\n历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}\n\n请用中文回答:`
          : `你是一个智能AI助手，请务必用中文回答所有问题。\n\n问题: ${message}\n\n请用中文回答:`;

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const promptParams = { prompt: promptText, ...optimalParams };

        response = await env.AI.run(selectedModel.id, promptParams);
        reply = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_messages) {
        const messages = [
          { role: "system", content: "你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。请确保你的回答完全使用中文，包括专业术语和代码注释。" },
          ...recentHistory.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: `${message}\n\n请用中文回答:` }
        ];

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const messagesParams = { messages, ...optimalParams };

        response = await env.AI.run(selectedModel.id, messagesParams);
        reply = extractTextFromResponse(response, selectedModel);
      }
    } catch (error) {
      console.error('AI模型调用失败:', error);
      throw new Error(`${selectedModel.name} 调用失败: ${error.message}`);
    }

    // 处理 deepseek 的思考标签
    if (selectedModel.id.includes('deepseek') && reply && reply.includes('<think>')) {
      const thinkEndIndex = reply.lastIndexOf('</think>');
      if (thinkEndIndex !== -1) {
        reply = reply.substring(thinkEndIndex + 8).trim();
      }
    }

    if (reply && typeof reply === 'string') {
      reply = formatMarkdown(reply);
    } else {
      reply = reply || '抱歉，AI模型没有返回有效的回复内容。';
    }

    return new Response(JSON.stringify({
      reply: reply,
      model: selectedModel.name,
      usage: response ? response.usage : null
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({
      error: '调用AI模型时发生错误: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getHistory(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const sessionId = url.searchParams.get('sessionId') || 'default';

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const historyData = await env.CHAT_HISTORY.get(`history:${sessionId}`);
    const history = historyData ? JSON.parse(historyData) : [];

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return new Response(JSON.stringify({ error: '获取历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function saveHistory(request, env, corsHeaders) {
  try {
    const { password, sessionId = 'default', history } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const maxHistoryItems = 100;
    const trimmedHistory = history.slice(-maxHistoryItems);

    await env.CHAT_HISTORY.put(`history:${sessionId}`, JSON.stringify(trimmedHistory));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Save history error:', error);
    return new Response(JSON.stringify({ error: '保存历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function debugGPT(request, env, corsHeaders) {
  try {
    const { message, password } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const response = await env.AI.run('@cf/openai/gpt-oss-20b', {
      input: message || 'Hello, World!'
    });

    return new Response(JSON.stringify({
      debug: true,
      response: response,
      extractedText: extractTextFromResponse(response, null)
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Debug GPT error:', error);
    return new Response(JSON.stringify({
      error: '调试GPT时发生错误: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 提取 AI 响应文本的健壮函数
function extractTextFromResponse(response, modelConfig) {
  if (typeof response === 'string') {
    return response.trim() || '模型返回了空响应';
  }

  if (!response || typeof response !== 'object') {
    return 'AI模型返回了无效的响应格式';
  }

  if (response.output && Array.isArray(response.output)) {
    for (const outputItem of response.output) {
      if (outputItem.type === 'message' && outputItem.content && Array.isArray(outputItem.content)) {
        for (const contentItem of outputItem.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            return contentItem.text.trim();
          }
        }
      }
    }
  }

  const gptFields = [
    'reply', 'response', 'result', 'content', 'text', 'output', 'answer', 'message',
    'completion', 'generated_text', 'prediction'
  ];

  for (const field of gptFields) {
    if (response[field] && typeof response[field] === 'string') {
      const text = response[field].trim();
      if (text) return text;
    }
  }

  if (response.result && typeof response.result === 'object') {
    for (const field of gptFields) {
      if (response.result[field] && typeof response.result[field] === 'string') {
        const text = response.result[field].trim();
        if (text) return text;
      }
    }
  }

  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content.trim() || '模型返回了空内容';
  }

  if (response.choices?.[0]?.text) {
    return response.choices[0].text.trim() || '模型返回了空内容';
  }

  let longestText = '';
  for (const [key, value] of Object.entries(response)) {
    if (typeof value === 'string' && value.trim() && value.length > longestText.length) {
      if (!['usage', 'model', 'id', 'created', 'object'].includes(key)) {
        longestText = value.trim();
      }
    }
  }

  if (longestText) return longestText;

  console.log('无法提取文本，完整响应:', JSON.stringify(response, null, 2));
  return `无法从响应中提取文本内容。响应结构: ${Object.keys(response).join(', ')}`;
}

// 代码检测与格式化辅助
function autoDetectAndFormatCode(text) {
  const codePatterns = [
    { pattern: /^(import\s+\w+|from\s+\w+\s+import|def\s+\w+|class\s+\w+|if\s+__name__|for\s+\w+\s+in|while\s+.+:|try:|except:)/m, lang: 'python' },
    { pattern: /^(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|=>\s*{|console\.log|document\.|window\.)/m, lang: 'javascript' },
    { pattern: /^<[^>]+>.*<\/[^>]+>$/m, lang: 'html' },
    { pattern: /^[^{}]*{[^{}]*}$/m, lang: 'css' },
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/mi, lang: 'sql' },
    { pattern: /^{\s*"[^"]+"\s*:\s*.+}$/m, lang: 'json' },
    { pattern: /^(#!\/bin\/|curl\s+|wget\s+|sudo\s+|apt\s+|npm\s+|pip\s+|git\s+)/m, lang: 'bash' }
  ];

  for (const { pattern, lang } of codePatterns) {
    if (pattern.test(text) && !text.includes('```')) {
      const lines = text.split('\n');
      if (lines.length > 3 && lines.some(line => line.startsWith('  ') || line.startsWith('\t'))) {
        return '```' + lang + '\n' + text + '\n```';
      }
    }
  }

  return text;
}

function detectLanguage(code) {
  const langPatterns = [
    { pattern: /^(import\s|from\s.*import|def\s|class\s|if\s+__name__|print\()/m, lang: 'python' },
    { pattern: /^(function\s|const\s|let\s|var\s|console\.log|document\.|window\.)/m, lang: 'javascript' },
    { pattern: /^(<\?php|namespace\s|use\s|\$\w+\s*=)/m, lang: 'php' },
    { pattern: /^(#include|int\s+main|printf\(|cout\s*<<)/m, lang: 'cpp' },
    { pattern: /^(public\s+(class|static)|import\s+java|System\.out)/m, lang: 'java' },
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/mi, lang: 'sql' },
    { pattern: /^<[^>]+>.*<\/[^>]+>/m, lang: 'html' },
    { pattern: /^[^{}]*\{[^{}]*\}/m, lang: 'css' },
    { pattern: /^(#!\/bin\/|curl\s|wget\s|sudo\s|apt\s|npm\s|pip\s|git\s)/m, lang: 'bash' },
    { pattern: /^{\s*"[^"]+"\s*:/m, lang: 'json' }
  ];

  for (const { pattern, lang } of langPatterns) {
    if (pattern.test(code)) return lang;
  }
  return 'text';
}

function formatMarkdown(text) {
  if (!text || typeof text !== 'string') return text || '';

  text = autoDetectAndFormatCode(text);

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const detectedLang = lang || detectLanguage(code);
    const encodedCode = (typeof btoa === 'function') ? btoa(unescape(encodeURIComponent(code))) : Buffer.from(code, 'utf8').toString('base64');
    return '<div class="code-block"><div class="code-header"><span class="language">' + (detectedLang || '').toUpperCase() + '</span><button class="copy-btn" onclick="copyCodeBlock(this)" data-code="' + encodedCode + '">复制</button></div><pre><code class="language-' + detectedLang + '">' + escapeHtml(code) + '</code></pre></div>';
  });

  text = text.replace(/`([^`]+)`/g, (m, code) => '<code class="inline-code">' + escapeHtml(code) + '</code>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="md-bold">$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>');
  text = text.replace(/_(.*?)_/g, '<em class="md-italic">$1</em>');
  text = text.replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^- (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^\d+\. (.*$)/gim, '<li class="md-li-ordered">$1</li>');
  text = text.replace(/(<li class="md-li">.*<\/li>)/s, '<ul class="md-ul">$1</ul>');
  text = text.replace(/(<li class="md-li-ordered">.*<\/li>)/s, '<ol class="md-ol">$1</ol>');
  text = text.replace(/^> (.*$)/gim, '<blockquote class="md-blockquote">$1</blockquote>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>');

  const codeBlocks = [];
  text = text.replace(/<div class="code-block">[\s\S]*?<\/div>/g, (match) => {
    codeBlocks.push(match);
    return '__CODE_BLOCK_' + (codeBlocks.length - 1) + '__';
  });

  text = text.replace(/\n/g, '<br>');

  codeBlocks.forEach((block, index) => {
    text = text.replace('__CODE_BLOCK_' + index + '__', block);
  });

  return text;
}

// getHTML(): 返回前端 HTML（已包含移动端优化）
function getHTML() {
  return '<!DOCTYPE html>' +
    '<html lang="zh-CN">' +
    '<head>' +
    '  <meta charset="UTF-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">' +
    '  <title>CF AI Chat</title>' +
    '  <style>' +
    '    * { margin:0; padding:0; box-sizing:border-box; }' +
    '    html,body { height:100%; }' +
    '    body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Microsoft YaHei\", sans-serif; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#111827; }' +
    '    .container { width:100vw; height:100vh; background:white; display:flex; flex-direction:column; overflow:hidden; }' +
    '    .header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); color:#fff; }' +
    '    .header-left { display:flex; align-items:center; gap:12px; }' +
    '    .logo { font-size:18px; font-weight:700; }' +
    '    .subtitle { font-size:12px; opacity:0.9; }' +
    '    .main-content { flex:1; display:flex; min-height:0; }' +
    '    .sidebar { width:300px; min-width:240px; background:#f8fafc; border-right:1px solid #e2e8f0; padding:16px; overflow-y:auto; flex-shrink:0; }' +
    '    .chat-area { flex:1; display:flex; flex-direction:column; min-width:0; }' +
    '    .messages { flex:1; overflow-y:auto; padding:16px; background:#fafafa; min-height:0; }' +
    '    .message { margin-bottom:16px; max-width:80%; }' +
    '    .message.user { margin-left:auto; }' +
    '    .message-content { padding:12px 14px; border-radius:12px; line-height:1.6; }' +
    '    .message.user .message-content { background:#4f46e5; color:#fff; }' +
    '    .message.assistant .message-content { background:#fff; border:1px solid #e2e8f0; }' +
    '    .input-area { padding:12px; border-top:1px solid #e2e8f0; background:white; }' +
    '    .input-container { display:flex; gap:8px; align-items:flex-end; }' +
    '    .message-input { flex:1; min-height:48px; max-height:180px; padding:12px; border:1px solid #d1d5db; border-radius:12px; resize:vertical; font-size:14px; }' +
    '    .btn { background:#4f46e5; color:#fff; border:none; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:600; }' +
    '    .btn.secondary { background:#6b7280; }' +
    '    .send-btn { background:#10b981; }' +
    '    .loading { display:none; text-align:center; padding:12px; color:#6b7280; }' +
    '    .code-block { margin:12px 0; border-radius:8px; overflow:hidden; border:1px solid #d1d5db; background:#fff; }' +
    '    .code-header { background:#f9fafb; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e7eb; font-size:12px; }' +
    '    pre { padding:12px; margin:0; overflow:auto; font-family: Fira Code, Consolas, monospace; font-size:13px; }' +
    '    .md-h1 { font-size:20px; font-weight:700; color:#1f2937; margin:10px 0; }' +
    '    .md-h2 { font-size:18px; font-weight:700; color:#374151; margin:8px 0; }' +
    '    .hamburger { display:none; width:40px; height:40px; border-radius:8px; background:rgba(255,255,255,0.06); align-items:center; justify-content:center; cursor:pointer; }' +
    '    .backdrop { display:none; }' +
    '    @media (max-width:900px) {' +
    '      .sidebar { position:fixed; left:0; top:64px; bottom:0; width:78%; max-width:380px; transform:translateX(-110%); transition: transform .28s ease, box-shadow .28s ease; z-index:60; background:#f8fafc; overflow-y:auto; -webkit-overflow-scrolling:touch; }' +
    '      .sidebar.open { transform:translateX(0); box-shadow:12px 0 30px rgba(15,23,42,0.12); }' +
    '      .backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:55; display:none; }' +
    '      .backdrop.show { display:block; }' +
    '      .hamburger { display:flex; }' +
    '      .messages { padding-bottom:120px; }' +
    '      .input-area { position:fixed; left:0; right:0; bottom:0; padding:10px; background:white; border-top:1px solid #e2e8f0; z-index:70; }' +
    '      .message-input { min-height:48px; max-height:160px; font-size:15px; }' +
    '      .btn { padding:10px 12px; border-radius:10px; }' +
    '      .container { height:100vh; }' +
    '    }' +
    '    @media (max-width:520px) {' +
    '      .message-content { font-size:14px; }' +
    '      .messages { padding-left:12px; padding-right:12px; }' +
    '    }' +
    '    button:focus, select:focus, input:focus, textarea:focus { outline:3px solid rgba(79,70,229,0.18); outline-offset:2px; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <div class="container">' +
    '    <div class="header">' +
    '      <div class="header-left">' +
    '        <div class="hamburger" id="hamburger" aria-label="打开菜单" title="打开菜单">☰</div>' +
    '        <div>' +
    '          <div class="logo">🤖 CF AI Chat</div>' +
    '          <div class="subtitle">支持多模型切换的智能聊天助手</div>' +
    '        </div>' +
    '      </div>' +
    '      <div class="author-info" id="authorInfo" style="cursor:pointer;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,0.05);">' +
    '        <p style="margin:0;font-size:13px;color:#fff">📺 作者：<strong>YouTube：康康的订阅天地</strong></p>' +
    '      </div>' +
    '    </div>' +
    '    <div class="main-content">' +
    '      <aside class="sidebar" id="sidebar">' +
    '        <div class="auth-section" id="authSection" style="padding:12px;border-radius:12px;background:linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%);border:2px solid #ff6b9d;">' +
    '          <div class="input-group">' +
    '            <label style="font-size:13px;display:block;margin-bottom:8px">访问密码</label>' +
    '            <input type="password" id="passwordInput" placeholder="请输入访问密码" onkeydown="handlePasswordKeyDown(event)" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">' +
    '          </div>' +
    '          <div style="margin-top:10px;display:flex;gap:8px;">' +
    '            <button class="btn" onclick="authenticate()">验证</button>' +
    '            <button class="btn secondary" onclick="testCopyFunction()">测试剪贴板</button>' +
    '          </div>' +
    '        </div>' +
    '        <div class="model-section" id="modelSection" style="display:none;margin-top:16px;">' +
    '          <h3 style="margin-bottom:8px">🎯 选择AI模型</h3>' +
    '          <select class="model-select" id="modelSelect" onchange="updateModelInfo()" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">' +
    '            <option value="">请选择模型...</option>' +
    '          </select>' +
    '          <div class="model-info" id="modelInfo" style="background:#f1f5f9;padding:10px;border-radius:8px;font-size:13px;line-height:1.4;margin-top:8px;">请先选择一个AI模型</div>' +
    '        </div>' +
    '        <div class="history-section" id="historySection" style="display:none;margin-top:16px;">' +
    '          <h3 style="margin-bottom:8px">📚 聊天历史</h3>' +
    '          <div style="display:flex;gap:8px;flex-wrap:wrap;">' +
    '            <button class="btn secondary" onclick="loadHistory()">加载历史</button>' +
    '            <button class="btn secondary" onclick="clearHistory()">清空历史</button>' +
    '          </div>' +
    '        </div>' +
    '      </aside>' +
    '      <main class="chat-area">' +
    '        <div class="messages" id="messages" role="log" aria-live="polite">' +
    '          <div class="message assistant">' +
    '            <div class="message-content">👋 欢迎使用CF AI Chat！请先输入密码验证身份，然后选择一个AI模型开始聊天。<br><br>🇨🇳 所有AI模型都已配置为使用中文回复，无论您使用什么语言提问，AI都会用中文回答您的问题。</div>' +
    '          </div>' +
    '        </div>' +
    '        <div class="loading" id="loading">🤔 AI正在思考中...</div>' +
    '        <div class="input-area" id="inputArea">' +
    '          <div class="input-container">' +
    '            <textarea class="message-input" id="messageInput" placeholder="输入您的问题..." aria-label="输入消息" disabled onkeydown="handleKeyDown(event)"></textarea>' +
    '            <button class="btn send-btn" id="sendBtn" onclick="sendMessage()" disabled>发送</button>' +
    '          </div>' +
    '        </div>' +
    '      </main>' +
    '    </div>' +
    '  </div>' +
    '  <div class="backdrop" id="backdrop" tabindex="-1" aria-hidden="true"></div>' +
    '  <script>' +
    '    var isAuthenticated = false, currentPassword = "", models = {}, chatHistory = [], currentModel = "";' +
    '    function handlePasswordKeyDown(e) { if (e.key === "Enter") { e.preventDefault(); authenticate(); } }' +
    '    function handleKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }' +
    '    document.getElementById("authorInfo").addEventListener("click", function(){ window.open("https://www.youtube.com/@%E5%BA%B7%E5%BA%B7%E7%9A%84V2Ray%E4%B8%8EClash", "_blank"); });' +
    '    (function(){ try {' +
    '      var hamburger = document.getElementById("hamburger");' +
    '      var sidebar = document.getElementById("sidebar");' +
    '      var backdrop = document.getElementById("backdrop");' +
    '      function openSidebar(){ if (sidebar) sidebar.classList.add("open"); if (backdrop) backdrop.classList.add("show"); document.body.style.overflow = "hidden"; }' +
    '      function closeSidebar(){ if (sidebar) sidebar.classList.remove("open"); if (backdrop) backdrop.classList.remove("show"); document.body.style.overflow = ""; }' +
    '      if (hamburger){ hamburger.addEventListener("click", function(){ if (window.innerWidth <= 900){ if (sidebar && sidebar.classList.contains("open")) closeSidebar(); else openSidebar(); } }); }' +
    '      if (backdrop) backdrop.addEventListener("click", closeSidebar);' +
    '      document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeSidebar(); });' +
    '      window.addEventListener("resize", function(){ if (window.innerWidth > 900) closeSidebar(); });' +
    '    } catch (err){ console.error("mobile sidebar script error", err); } })();' +
    '    window.addEventListener("load", function(){ fetch("/api/models").then(function(res){ return res.json(); }).then(function(data){ models = data || {}; populateModelSelect(); }).catch(function(e){ console.error("load models error", e); }); });' +
    '    function populateModelSelect(){ var sel = document.getElementById("modelSelect"); if (!sel) return; sel.innerHTML = "<option value=\\"\\">请选择模型...</option>"; for (var k in models){ if (models.hasOwnProperty(k)){ var opt = document.createElement("option"); opt.value = k; opt.textContent = models[k].name || k; sel.appendChild(opt); } } }' +
    '    function updateModelInfo(){ try { var sel = document.getElementById("modelSelect"); var infoDiv = document.getElementById("modelInfo"); var selected = sel.value; if (!selected){ infoDiv.innerHTML = "请先选择一个AI模型"; return; } if (currentModel && currentModel !== selected){ chatHistory = []; document.getElementById("messages").innerHTML = "<div class=\\"message assistant\\"><div class=\\"message-content\\">🔄 已切换模型，正在加载历史记录...<br><br>🇨🇳 新模型已配置为中文回复模式。</div></div>"; } currentModel = selected; var model = models[selected]; if (!model){ infoDiv.innerHTML = "模型信息加载失败"; return; } var features = (model.features || []).join(" • "); var html = "<strong>" + (model.name || selected) + "</strong><br>📝 " + (model.description || "") + "<br><br>🎯 <strong>特色功能:</strong><br>" + features + "<br><br>💰 <strong>价格:</strong><br>• 输入: $" + (model.input_price || "-") + "/百万tokens<br>• 输出: $" + (model.output_price || "-") + "/百万tokens<br><br>📏 <strong>限制:</strong><br>• 上下文: " + (model.context ? model.context.toLocaleString() : "-") + " tokens<br>• 最大输出: " + (model.max_output ? model.max_output.toLocaleString() : "-") + " tokens"; infoDiv.innerHTML = html; if (isAuthenticated){ document.getElementById("messageInput").disabled = false; document.getElementById("sendBtn").disabled = false; loadHistory(); } } catch (e){ console.error("updateModelInfo error", e); } }' +
    '    function authenticate(){ var password = document.getElementById("passwordInput").value; if (!password){ showError("请输入密码"); return; } fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "test", model: "deepseek-r1", password: password }) }).then(function(res){ if (res.status === 401){ showError("密码错误，请重试"); return; } return res.json(); }).then(function(data){ isAuthenticated = true; currentPassword = password; var auth = document.getElementById("authSection"); if (auth) { auth.classList.add("authenticated"); auth.innerHTML = "<p>✅ 身份验证成功！</p>"; } var ms = document.getElementById("modelSection"); if (ms) ms.style.display = "block"; var hs = document.getElementById("historySection"); if (hs) hs.style.display = "block"; showSuccess("验证成功！请选择AI模型开始聊天。"); }).catch(function(e){ showError("验证失败: " + e.message); }); }' +
    '    function sendMessage(){ try { if (!isAuthenticated || !currentModel){ showError("请先验证身份并选择模型"); return; } var input = document.getElementById("messageInput"); var message = input.value.trim(); if (!message) return; addMessage("user", message); input.value = ""; chatHistory.push({ role: "user", content: message, timestamp: new Date() }); document.getElementById("loading").style.display = "block"; document.getElementById("sendBtn").disabled = true; fetch("/api/chat", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ message: message, model: currentModel, password: currentPassword, history: chatHistory.slice(-10) }) }).then(function(res){ return res.json().then(function(data){ if (!res.ok){ showError(data.error || "发送消息失败"); return; } addMessage("assistant", data.reply || "", data.model || "", data.usage || null); chatHistory.push({ role: "assistant", content: data.reply || "", timestamp: new Date(), model: data.model }); saveHistory(); }); }).catch(function(e){ showError("网络错误: " + e.message); }).finally(function(){ document.getElementById("loading").style.display = "none"; document.getElementById("sendBtn").disabled = false; }); } catch (e){ console.error("sendMessage error", e); showError("发送消息时发生意外错误: " + e.message); document.getElementById("loading").style.display = "none"; document.getElementById("sendBtn").disabled = false; } }' +
    '    function addMessage(role, content, modelName, usage){ var messagesDiv = document.getElementById("messages"); var messageDiv = document.createElement("div"); messageDiv.className = "message " + role; var wrapper = document.createElement("div"); wrapper.className = "message-content"; wrapper.innerHTML = content; messageDiv.appendChild(wrapper); var meta = document.createElement("div"); meta.style.fontSize = "12px"; meta.style.color = "#6b7280"; meta.style.marginTop = "6px"; var metaInfo = new Date().toLocaleTimeString(); if (modelName) metaInfo = (modelName + " • " + metaInfo); if (usage && usage.total_tokens) metaInfo += (" • " + usage.total_tokens + " tokens"); meta.textContent = metaInfo; messageDiv.appendChild(meta); messagesDiv.appendChild(messageDiv); messagesDiv.scrollTop = messagesDiv.scrollHeight; }' +
    '    function loadHistory(){ if (!isAuthenticated || !currentModel) return; try { var sessionId = currentModel + "_history"; fetch("/api/history?password=" + encodeURIComponent(currentPassword) + "&sessionId=" + encodeURIComponent(sessionId)).then(function(res){ return res.json(); }).then(function(data){ chatHistory = data.history || []; var messagesDiv = document.getElementById("messages"); messagesDiv.innerHTML = "<div class=\\"message assistant\\"><div class=\\"message-content\\">📚 已加载 " + (models[currentModel] ? models[currentModel].name : currentModel) + " 的历史记录</div></div>"; chatHistory.forEach(function(msg){ addMessage(msg.role, msg.content, msg.model || ""); }); if (chatHistory.length === 0) showSuccess((models[currentModel] ? models[currentModel].name : currentModel) + " 暂无历史记录"); else showSuccess("已加载 " + (models[currentModel] ? models[currentModel].name : currentModel) + " 的 " + chatHistory.length + " 条历史记录"); }).catch(function(e){ showError("加载历史记录失败: " + e.message); }); } catch (e){ console.error("loadHistory error", e); } }' +
    '    function saveHistory(){ if (!isAuthenticated || !currentModel) return; try { var sessionId = currentModel + "_history"; fetch("/api/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: currentPassword, sessionId: sessionId, history: chatHistory }) }); } catch (e){ console.error("saveHistory failed", e); } }' +
    '    function clearHistory(){ if (!currentModel){ showError("请先选择模型"); return; } if (!confirm("确定要清空所有聊天记录吗？")) return; chatHistory = []; saveHistory(); document.getElementById("messages").innerHTML = "<div class=\\"message assistant\\"><div class=\\"message-content\\">✨ 聊天记录已清空</div></div>"; showSuccess("聊天记录已清空"); }' +
    '    function showError(msg){ var sb = document.querySelector(".sidebar"); if (!sb) return; var div = document.createElement("div"); div.className = "error"; div.style.background = "#fef2f2"; div.style.color = "#dc2626"; div.style.padding = "8px"; div.style.borderRadius = "8px"; div.style.marginTop = "8px"; div.textContent = msg; sb.appendChild(div); setTimeout(function(){ div.remove(); }, 5000); }' +
    '    function showSuccess(msg){ var sb = document.querySelector(".sidebar"); if (!sb) return; var div = document.createElement("div"); div.className = "success"; div.style.background = "#f0f9ff"; div.style.color = "#0369a1"; div.style.padding = "8px"; div.style.borderRadius = "8px"; div.style.marginTop = "8px"; div.textContent = msg; sb.appendChild(div); setTimeout(function(){ div.remove(); }, 3000); }' +
    '    function copyCodeBlock(button){ try { var encoded = button.getAttribute("data-code"); if (!encoded) throw new Error("未找到代码数据"); var code = decodeURIComponent(escape(atob(encoded))); navigator.clipboard.writeText(code).then(function(){ var original = button.textContent; button.textContent = "✓ 已复制"; button.style.background = "#10b981"; setTimeout(function(){ button.textContent = original; button.style.background = "#374151"; }, 2000); }).catch(function(clipboardErr){ try { var codeElement = button.closest(".code-block").querySelector("pre code"); var range = document.createRange(); range.selectNodeContents(codeElement); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); button.textContent = "已选中，请 Ctrl+C"; button.style.background = "#f59e0b"; setTimeout(function(){ button.textContent = "复制"; button.style.background = "#374151"; sel.removeAllRanges(); }, 3000); } catch (selectErr){ button.textContent = "复制失败"; button.style.background = "#ef4444"; setTimeout(function(){ button.textContent = "复制"; button.style.background = "#374151"; }, 3000); } }); } catch (error){ console.error("代码解码失败:", error); button.textContent = "解码失败"; button.style.background = "#ef4444"; setTimeout(function(){ button.textContent = "复制"; button.style.background = "#374151"; }, 3000); } }' +
    '    function testCopyFunction(){ var testCode = "def hello_world():\\n    print(\\"Hello, World!\\")\\n    return True"; navigator.clipboard.writeText(testCode).then(function(){ console.log("剪贴板正常"); }).catch(function(err){ console.log("剪贴板异常", err); }); }' +
    '  </script>' +
    '</body>' +
    '</html>';
}
