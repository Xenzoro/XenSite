const SUPABASE_URL = 'https://slapzjzdpjdjjnqtqeiy.supabase.co';
const ANON_KEY = 'sb_publishable_yR4ZWH5CvNlmNlZBXuEAjA_VF8M_ZbF';

document.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const root = document.getElementById('detail-root');

    if (!id) {
        root.innerHTML = `<p class="detail-error">No project specified.</p>`;
        return;
    }

    fetch(`${SUPABASE_URL}/rest/v1/project-cards?id=eq.${encodeURIComponent(id)}&select=*`, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `bearer ${ANON_KEY}`
        }
    })
        .then(res => res.json())
        .then(rows => {
            if (!Array.isArray(rows) || !rows.length) {
                root.innerHTML = `<p class="detail-error">Project not found.</p>`;
                return;
            }
            renderDetail(rows[0]);
        })
        .catch(err => {
            console.log('ya fucked up: ', err);
            root.innerHTML = `<p class="detail-error">Something went wrong loading this project.</p>`;
        });
});

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

function renderDetail(project) {
    document.title = `${project.title} — Jacob Martinez's Portfolio`;

    const root = document.getElementById('detail-root');
    const tagsHTML = (project.tools_used || [])
        .map(tag => `<span class="tag">${escapeHTML(tag)}</span>`)
        .join('');

    const demoBtnHTML = project.demo_url
        ? `<a href="${escapeHTML(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="demo-btn">View Live Demo</a>`
        : '';

    const snippets = Array.isArray(project.code_snippets) ? project.code_snippets : [];
    const snippetsHTML = snippets.map((snip, i) => {
        const lang = snip.language || 'clike';
        const label = snip.label || snip.title || `Snippet ${i + 1}`;
        return `
            <div class="code-snippet">
                <div class="code-snippet-label">${escapeHTML(label)}</div>
                <pre><code class="language-${escapeHTML(lang)}">${escapeHTML(snip.code)}</code></pre>
            </div>
        `;
    }).join('');

    const terminalSession = Array.isArray(project.terminal_session) ? project.terminal_session : [];

    root.innerHTML = `
        <a href="index.html#projects" class="detail-back-link">&larr; Back to Projects</a>
        <div class="detail-tags">${tagsHTML}</div>
        <h1 class="detail-title">${escapeHTML(project.title)}</h1>
        ${project.long_description ? `<p class="detail-long-desc">${escapeHTML(project.long_description)}</p>` : ''}
        ${demoBtnHTML}
        ${snippetsHTML ? `<h2 class="detail-subheading">Code</h2><div class="code-snippets">${snippetsHTML}</div>` : ''}
        ${terminalSession.length ? renderTerminalHTML() : ''}
    `;

    if (window.Prism) {
        Prism.highlightAllUnder(root);
    }

    if (terminalSession.length) {
        initTerminal(terminalSession);
    }
}

function renderTerminalHTML() {
    return `
        <h2 class="detail-subheading">Terminal</h2>
        <p class="terminal-disclaimer"><span class="terminal-disclaimer-icon" aria-hidden="true">&#9432;</span> This is not a live terminal. It is real captured output from actually running my code, replayed here for demonstration.</p>
        <div class="terminal-window">
            <div class="terminal-header">
                <span class="terminal-dot red"></span>
                <span class="terminal-dot yellow"></span>
                <span class="terminal-dot green"></span>
                <span class="terminal-title">session</span>
            </div>
            <div class="terminal-body" id="terminal-body"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">$</span>
                <input type="text" id="terminal-input" class="terminal-input" autocomplete="off" spellcheck="false" placeholder="Type a command and press Enter...">
            </div>
            <div class="terminal-hints" id="terminal-hints"></div>
        </div>
    `;
}

function initTerminal(session) {
    const body = document.getElementById('terminal-body');
    const input = document.getElementById('terminal-input');
    const hints = document.getElementById('terminal-hints');

    hints.innerHTML = session
        .map(pair => `<button type="button" class="terminal-hint-chip">${escapeHTML(pair.input)}</button>`)
        .join('');

    function appendLine(text, cls) {
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = text;
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
    }

    function runCommand(value) {
        const trimmed = value.trim();
        if (!trimmed) return;
        appendLine(`$ ${trimmed}`, 'terminal-line-cmd');
        const match = session.find(pair => pair.input === trimmed);
        appendLine(match ? match.output : `command not found: ${trimmed}`, match ? 'terminal-line-output' : 'terminal-line-error');
        input.value = '';
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            runCommand(input.value);
        }
    });

    hints.addEventListener('click', (e) => {
        if (e.target.classList.contains('terminal-hint-chip')) {
            input.value = e.target.textContent;
            input.focus();
        }
    });
}
