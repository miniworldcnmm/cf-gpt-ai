<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>CF AI Chat - Responsive</title>
    <style>
        /* Reset & base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans","Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#111827; }

        /* Layout container */
        .app { width: 100%; height: 100vh; display: flex; flex-direction: column; background: white; border-radius: 8px; overflow: hidden; }
        .header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; }
        .header-left { display:flex; align-items:center; gap:12px; }
        .logo { font-size:18px; font-weight:700; }
        .subtitle { font-size:12px; opacity:0.9; }

        /* Sidebar & main */
        .main-wrap { flex:1; display:flex; min-height:0; /* allow children to scroll */ }

        .sidebar { width:320px; min-width:240px; background:#f8fafc; border-right:1px solid #e2e8f0; padding:16px; overflow-y:auto; flex-shrink:0; transition: transform .28s ease, box-shadow .28s ease; }
        .sidebar.hidden-mobile { display:block; }

        .chat { flex:1; display:flex; flex-direction:column; min-width:0; }
        .messages { flex:1; overflow-y:auto; padding:16px; background:#fafafa; min-height:0; }
        .message { margin-bottom:16px; max-width:80%; }
        .message.user { margin-left:auto; }
        .message-content { padding:12px 14px; border-radius:12px; line-height:1.6; }
        .message.user .message-content{ background:#4f46e5; color:#fff; }
        .message.assistant .message-content{ background:#fff; border:1px solid #e2e8f0; }

        .input-area { padding:12px; border-top:1px solid #e2e8f0; background:white; }
        .input-row { display:flex; gap:8px; align-items:flex-end; }
        .message-input { flex:1; min-height:48px; max-height:180px; padding:12px; border:1px solid #d1d5db; border-radius:12px; resize:vertical; font-size:14px; }
        .btn { background:#4f46e5; color:#fff; border:none; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:600; }
        .btn.secondary { background:#6b7280; }
        .send-btn { background:#10b981; }
        .loading { display:none; text-align:center; padding:12px; color:#6b7280; }

        /* Model & auth blocks */
        .auth-section, .model-section { margin-bottom:16px; }
        .auth-section { padding:12px; border-radius:12px; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); border:2px solid #ff6b9d; }
        .auth-section.authenticated { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-color:#4facfe; }
        .model-select, .input-group input { width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; }
        .model-info { background:#f1f5f9; padding:10px; border-radius:8px; font-size:13px; line-height:1.4; margin-top:8px; }

        /* Code block styles */
        .code-block { margin:12px 0; border-radius:8px; overflow:hidden; border:1px solid #d1d5db; background:#fff; }
        .code-header { background:#f9fafb; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e7eb; font-size:12px; }
        pre { padding:12px; margin:0; overflow:auto; font-family: 'Fira Code', 'Consolas', monospace; font-size:13px; }
        .inline-code { background:#f3f4f6; padding:2px 6px; border-radius:4px; border:1px solid #e5e7eb; }

        /* Markdown styles (kept lightweight) */
        .md-h1 { font-size:20px; font-weight:700; color:#1f2937; margin:10px 0; }
        .md-h2 { font-size:18px; font-weight:700; color:#374151; margin:8px 0; }
        .md-ul, .md-ol { margin:8px 0 12px 20px; }
        .md-blockquote { background:#f3f4f6; border-left:4px solid #6b7280; padding:10px; margin:8px 0; font-style:italic; }

        /* Header mobile controls */
        .header .controls { display:flex; gap:8px; align-items:center; }
        .hamburger { display:none; width:40px; height:40px; border-radius:8px; background:rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; }

        /* Sidebar overlay for mobile */
        .sidebar.overlay { position:fixed; left:0; top:64px; bottom:0; transform:translateX(-110%); width:78%; max-width:380px; box-shadow: 12px 0 30px rgba(15,23,42,0.12); z-index:60; }
        .sidebar.overlay.open { transform:translateX(0); }
        .backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.35); display:none; z-index:55; }
        .backdrop.show { display:block; }

        /* Responsiveness */
        @media (max-width: 900px) {
            .sidebar { display:none; }
            .hamburger { display:flex; }
            .logo { font-size:16px; }
            .subtitle { display:none; }
            .header { padding:10px 12px; }
            .messages { padding:12px; }
            .message-content { font-size:15px; }
            .input-area { padding:8px; }
            .message-input { min-height:52px; }
        }

        @media (max-width: 520px) {
            .header { padding:8px 10px; }
            .message-content { font-size:14px; }
            .btn { padding:10px; font-size:14px; }
            .sidebar.overlay { top:56px; }
        }

        /* Accessibility focus */
        button:focus, select:focus, input:focus, textarea:focus { outline: 3px solid rgba(79,70,229,0.18); outline-offset:2px; }
    </style>
</head>
<body>
    <div class="app" id="app">
        <header class="header">
            <div class="header-left">
                <div class="hamburger" id="hamburger" role="button" aria-label="打开菜单" title="打开菜单">☰</div>
                <div>
                    <div class="logo">🤖 CF AI Chat</div>
                    <div class="subtitle">支持多模型切换的智能聊天助手</div>
                </div>
            </div>
            <div class="controls">
                <div class="author-info" id="authorBtn" style="cursor:pointer;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:13px;color:#fff">📺 作者：<strong>YouTube：康康的订阅天地</strong></p>
                </div>
            </div>
        </header>

        <div class="main-wrap">
            <!-- Sidebar for desktop -->
            <aside class="sidebar" id="sidebar">
                <div class="auth-section" id="authSection">
                    <div class="input-group">
                        <label style="font-size:13px;display:block;margin-bottom:8px">访问密码</label>
                        <input type="password" id="passwordInput" placeholder="请输入访问密码" onkeydown="handlePasswordKeyDown(event)">
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;">
                        <button class="btn" onclick="authenticate()">验证</button>
                        <button class="btn secondary" onclick="testCopyFunction()">测试剪贴板</button>
                    </div>
                </div>

                <div class="model-section" id="modelSection" style="display:none;">
                    <h3 style="margin-bottom:8px">🎯 选择AI模型</h3>
                    <select class="model-select" id="modelSelect" onchange="updateModelInfo()">
                        <option value="">请选择模型...</option>
                    </select>
                    <div class="model-info" id="modelInfo">请先选择一个AI模型</div>
                </div>

                <div class="history-section" id="historySection" style="display:none;">
                    <h3 style="margin-bottom:8px">📚 聊天历史</h3>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn secondary" onclick="loadHistory()">加载历史</button>
                        <button class="btn secondary" onclick="clearHistory()">清空历史</button>
                    </div>
                </div>

                <div style="font-size:13px;color:#6b7280;margin-top:8px;">
                    <p>提示：所有模型已配置为中文回复。</p>
                </div>
            </aside>

            <!-- Overlay sidebar for mobile -->
            <aside class="sidebar overlay" id="mobileSidebar" aria-hidden="true"></aside>
            <div class="backdrop" id="backdrop" tabindex="-1" aria-hidden="true"></div>

            <!-- Chat area -->
            <main class="chat" id="chatArea">
                <div class="messages" id="messages" role="log" aria-live="polite">
                    <div class="message assistant">
                        <div class="message-content">👋 欢迎使用CF AI Chat！请先输入密码验证身份，然后选择一个AI模型开始聊天。<br><br>🇨🇳 所有AI模型都已配置为使用中文回复，无论您使用什么语言提问，AI都会用中文回答您的问题。</div>
                    </div>
                </div>
                <div class="loading" id="loading">🤔 AI正在思考中...</div>
                <div class="input-area">
                    <div class="input-row">
                        <textarea class="message-input" id="messageInput" placeholder="输入您的问题..." aria-label="输入消息" disabled onkeydown="handleKeyDown(event)"></textarea>
                        <button class="btn send-btn" id="sendBtn" onclick="sendMessage()" disabled>发送</button>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        // === 变量和初始状态 ===
        let isAuthenticated = false, currentPassword = '', models = {}, chatHistory = [], currentModel = '';
        const sidebar = document.getElementById('sidebar');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const backdrop = document.getElementById('backdrop');
        const hamburger = document.getElementById('hamburger');

        // 点击作者信息跳转（保留原跳转地址）
        document.getElementById('authorBtn').addEventListener('click', () => {
            window.open('https://www.youtube.com/@%E5%BA%B7%E5%BA%B7%E7%9A%84V2Ray%E4%B8%8EClash', '_blank');
        });

        // 手机侧边栏切换
        function openMobileSidebar() {
            mobileSidebar.classList.add('open');
            backdrop.classList.add('show');
            mobileSidebar.setAttribute('aria-hidden', 'false');
        }
        function closeMobileSidebar() {
            mobileSidebar.classList.remove('open');
            backdrop.classList.remove('show');
            mobileSidebar.setAttribute('aria-hidden', 'true');
        }
        hamburger.addEventListener('click', () => {
            // 如果在桌面尺寸则不做操作
            if (window.innerWidth > 900) return;
            // 填充移动sidebar内容（与桌面一致）
            renderSidebarIntoMobile();
            openMobileSidebar();
        });
        backdrop.addEventListener('click', closeMobileSidebar);

        // 在移动端把侧边栏内容渲染到 overlay aside 中
        function renderSidebarIntoMobile() {
            mobileSidebar.innerHTML = sidebar.innerHTML;
            // 重新绑定按钮（简单方式）
            const authBtn = mobileSidebar.querySelector('.btn');
            if (authBtn) authBtn.onclick = authenticate;
        }

        // 作者信息保护 - 保持原逻辑但更容错（不阻塞移动体验）
        function verifyAuthorDisplay() {
            try {
                const authorElements = document.querySelectorAll('.author-info strong');
                if (authorElements.length === 0) return true;
                for (let element of authorElements) {
                    if (!element.textContent.includes('YouTube：康康的订阅天地')) {
                        alert('作者信息已被篡改，服务将停止运行！');
                        document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h1>❌ 服务已停止</h1><p>作者信息被篡改，请保持原始作者信息：YouTube：康康的订阅天地</p></div>';
                        return false;
                    }
                }
                return true;
            } catch (e) { console.error('verifyAuthorDisplay error', e); return true; }
        }

        // 定期检查（节省资源，手机端降低频率）
        setInterval(verifyAuthorDisplay, 4000);

        // 保护侧边栏显示（改为仅在桌面使用）
        function protectSidebar() {
            const sb = document.querySelector('.sidebar');
            if (!sb) return;
            if (window.innerWidth > 900) {
                sb.style.display = 'block'; sb.style.visibility = 'visible';
            } else {
                sb.style.display = 'none';
            }
        }
        window.addEventListener('resize', protectSidebar);
        protectSidebar();

        // 页面加载初始化
        window.addEventListener('load', async () => {
            if (!verifyAuthorDisplay()) return;
            try {
                const res = await fetch('/api/models');
                models = await res.json();
                populateModelSelect();
                // 将 sidebar 内容 also to mobileSidebar initial
                mobileSidebar.innerHTML = sidebar.innerHTML;
            } catch (e) { console.error('加载模型失败', e); }
        });

        function populateModelSelect() {
            const select = document.getElementById('modelSelect');
            select.innerHTML = '<option value="">请选择模型...</option>';
            for (const [key, model] of Object.entries(models)) {
                const opt = document.createElement('option'); opt.value = key; opt.textContent = model.name;
                select.appendChild(opt);
            }
        }

        function updateModelInfo() {
            try {
                const select = document.getElementById('modelSelect');
                const infoDiv = document.getElementById('modelInfo');
                const selectedModel = select.value;
                if (!selectedModel) { infoDiv.innerHTML = '请先选择一个AI模型'; return; }

                if (currentModel && currentModel !== selectedModel) {
                    chatHistory = [];
                    document.getElementById('messages').innerHTML = '<div class="message assistant"><div class="message-content">🔄 已切换模型，正在加载历史记录...<br><br>🇨🇳 新模型已配置为中文回复模式。</div></div>';
                }

                currentModel = selectedModel;
                const model = models[selectedModel];
                if (!model) { infoDiv.innerHTML = '模型信息加载失败'; return; }
                const features = model.features ? model.features.join(' • ') : '';
                infoDiv.innerHTML = `<strong>${model.name}</strong><br>📝 ${model.description}<br><br>🎯 <strong>特色功能:</strong><br>${features}<br><br>💰 <strong>价格:</strong><br>• 输入: $${model.input_price}/百万tokens<br>• 输出: $${model.output_price}/百万tokens<br><br>📏 <strong>限制:</strong><br>• 上下文: ${model.context.toLocaleString()} tokens<br>• 最大输出: ${model.max_output.toLocaleString()} tokens`;
                if (isAuthenticated) {
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                    loadHistory();
                }
            } catch (error) { console.error('更新模型信息错误', error); }
        }

        // Authenticate
        async function authenticate() {
            const password = document.getElementById('passwordInput').value;
            if (!password) { showError('请输入密码'); return; }
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST', headers: { 'Content-Type':'application/json' },
                    body: JSON.stringify({ message:'test', model:'deepseek-r1', password })
                });
                if (response.status === 401) { showError('密码错误，请重试'); return; }
                isAuthenticated = true; currentPassword = password;
                const auth = document.getElementById('authSection');
                auth.classList.add('authenticated');
                auth.innerHTML = '<p>✅ 身份验证成功！</p>';
                document.getElementById('modelSection').style.display = 'block';
                document.getElementById('historySection').style.display = 'block';
                showSuccess('验证成功！请选择AI模型开始聊天。');
            } catch (e) { showError('验证失败: ' + e.message); }
        }

        // Send message
        async function sendMessage() {
            try {
                if (!verifyAuthorDisplay()) return;
                if (!isAuthenticated || !currentModel) { showError('请先验证身份并选择模型'); return; }
                const input = document.getElementById('messageInput');
                const message = input.value.trim(); if (!message) return;
                addMessage('user', message); input.value = '';
                chatHistory.push({ role:'user', content: message, timestamp: new Date() });
                document.getElementById('loading').style.display = 'block';
                document.getElementById('sendBtn').disabled = true;
                try {
                    const res = await fetch('/api/chat', {
                        method:'POST', headers:{ 'Content-Type':'application/json' },
                        body: JSON.stringify({ message, model: currentModel, password: currentPassword, history: chatHistory.slice(-10) })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        addMessage('assistant', data.reply, data.model, data.usage);
                        chatHistory.push({ role:'assistant', content: data.reply, timestamp: new Date(), model: data.model });
                        await saveHistory();
                    } else { showError(data.error || '发送消息失败'); }
                } catch (e) { showError('网络错误: ' + e.message); }
                finally { document.getElementById('loading').style.display = 'none'; document.getElementById('sendBtn').disabled = false; }
            } catch (e) { console.error('sendMessage error', e); showError('发送消息时发生意外错误: ' + e.message); }
        }

        function addMessage(role, content, modelName = '', usage = null) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div'); messageDiv.className = `message ${role}`;
            let metaInfo = new Date().toLocaleTimeString();
            if (modelName) metaInfo = `${modelName} • ${metaInfo}`;
            if (usage && usage.total_tokens) metaInfo += ` • ${usage.total_tokens} tokens`;
            const wrapper = document.createElement('div'); wrapper.className = 'message-content'; wrapper.innerHTML = content;
            messageDiv.appendChild(wrapper);
            const meta = document.createElement('div'); meta.style.fontSize='12px'; meta.style.color='#6b7280'; meta.style.marginTop='6px'; meta.textContent = metaInfo;
            messageDiv.appendChild(meta);
            messagesDiv.appendChild(messageDiv); messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // History API
        async function loadHistory() {
            if (!isAuthenticated || !currentModel) return;
            try {
                const sessionId = `${currentModel}_history`;
                const res = await fetch(`/api/history?password=${encodeURIComponent(currentPassword)}&sessionId=${sessionId}`);
                const data = await res.json();
                if (res.ok) {
                    chatHistory = data.history || [];
                    const messagesDiv = document.getElementById('messages');
                    const modelName = models[currentModel]?.name || currentModel;
                    messagesDiv.innerHTML = `<div class="message assistant"><div class="message-content">📚 已加载 ${modelName} 的历史记录</div></div>`;
                    chatHistory.forEach(msg => addMessage(msg.role, msg.content, msg.model || ''));
                    if (chatHistory.length === 0) showSuccess(`${modelName} 暂无历史记录`); else showSuccess(`已加载 ${modelName} 的 ${chatHistory.length} 条历史记录`);
                } else { showError(data.error || '加载历史记录失败'); }
            } catch (e) { showError('加载历史记录失败: ' + e.message); }
        }
        async function saveHistory() {
            if (!isAuthenticated || !currentModel) return;
            try { const sessionId = `${currentModel}_history`; await fetch('/api/history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: currentPassword, sessionId, history: chatHistory }) }); } catch (e) { console.error('saveHistory failed', e); }
        }
        async function clearHistory() { if (!currentModel) { showError('请先选择模型'); return; } if (!confirm('确定要清空所有聊天记录吗？')) return; chatHistory = []; await saveHistory(); document.getElementById('messages').innerHTML = `<div class="message assistant"><div class="message-content">✨ 聊天记录已清空</div></div>`; showSuccess('聊天记录已清空'); }

        function handleKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
        function handlePasswordKeyDown(e) { if (e.key === 'Enter') { e.preventDefault(); authenticate(); } }

        function showError(msg) { const bar = document.createElement('div'); bar.className='error'; bar.style.background='#fef2f2'; bar.style.color='#dc2626'; bar.style.padding='8px'; bar.style.borderRadius='8px'; bar.style.marginTop='8px'; bar.textContent = msg; document.querySelector('.sidebar').appendChild(bar); setTimeout(()=>bar.remove(),5000); }
        function showSuccess(msg) { const bar = document.createElement('div'); bar.className='success'; bar.style.background='#f0f9ff'; bar.style.color='#0369a1'; bar.style.padding='8px'; bar.style.borderRadius='8px'; bar.style.marginTop='8px'; bar.textContent = msg; document.querySelector('.sidebar').appendChild(bar); setTimeout(()=>bar.remove(),3000); }

        // 复制功能（保持原逻辑）
        function copyCodeBlock(button) {
            try {
                const encodedCode = button.getAttribute('data-code');
                if (!encodedCode) throw new Error('未找到代码数据');
                const code = decodeURIComponent(escape(atob(encodedCode)));
                navigator.clipboard.writeText(code).then(() => {
                    const original = button.textContent; button.textContent='✓ 已复制'; button.style.background='#10b981';
                    setTimeout(()=>{ button.textContent = original; button.style.background = '#374151'; },2000);
                }).catch(clipboardErr => {
                    try {
                        const codeElement = button.closest('.code-block').querySelector('pre code');
                        const range = document.createRange(); range.selectNodeContents(codeElement);
                        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
                        button.textContent='已选中，请 Ctrl+C'; button.style.background='#f59e0b';
                        setTimeout(()=>{ button.textContent='复制'; button.style.background='#374151'; sel.removeAllRanges(); },3000);
                    } catch (selectErr) { button.textContent='复制失败'; button.style.background='#ef4444'; setTimeout(()=>{ button.textContent='复制'; button.style.background='#374151'; },3000); }
                });
            } catch (error) { console.error('代码解码失败:', error); button.textContent='解码失败'; button.style.background='#ef4444'; setTimeout(()=>{ button.textContent='复制'; button.style.background='#374151'; },3000); }
        }

        function testCopyFunction() {
            const testCode = 'def hello_world():\n    print("Hello, World!")\n    return True';
            navigator.clipboard.writeText(testCode).then(()=>console.log('剪贴板正常')).catch(err=>console.log('剪贴板异常', err));
        }

        // 安全与辅助：当移动端打开侧边栏时，按 ESC 关闭
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileSidebar(); });

    </script>
</body>
</html>
