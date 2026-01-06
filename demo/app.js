// NudgeDO Demo App
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const taskInput = document.getElementById('taskInput');
  const nudgeBtn = document.getElementById('nudgeBtn');
  const submitBtn = document.getElementById('submitBtn');
  const nudgePanel = document.getElementById('nudgePanel');
  const tasksList = document.getElementById('tasksList');
  const taskCount = document.getElementById('taskCount');
  const currentTimeEl = document.getElementById('currentTime');

  // State
  let isNudgeMode = false;
  let currentPersona = 'buddy';
  let tasks = [];

  // Personas
  const personas = {
    coach: { name: 'Coach 教练', emoji: '🎯', style: '专业直接' },
    buddy: { name: 'Buddy 伙伴', emoji: '🤗', style: '温暖鼓励' },
    drill: { name: 'Drill 教官', emoji: '💪', style: '严格高压' },
    zen: { name: 'Zen 禅师', emoji: '🧘', style: '平和引导' }
  };

  // Sample questions by persona
  const questionsByPersona = {
    coach: [
      '这个任务的具体目标是什么？',
      '你打算什么时候开始？需要多长时间？',
      '有什么可能阻碍你的因素？'
    ],
    buddy: [
      '能跟我说说这个任务是关于什么的吗？',
      '你觉得什么时候做比较舒服？大概要多久呢？',
      '有什么我可以帮你提前准备的吗？'
    ],
    drill: [
      '任务目标，简洁明了地说。',
      '开始时间和截止时间，现在定下来。',
      '可能的障碍？提前想好对策。'
    ],
    zen: [
      '这个任务对你来说意味着什么？',
      '你内心觉得什么时候是合适的时机？',
      '在开始之前，有什么让你感到犹豫的吗？'
    ]
  };

  // Update greeting based on time
  function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '早上好';
    if (hour >= 12 && hour < 18) greeting = '下午好';
    else if (hour >= 18) greeting = '晚上好';
    currentTimeEl.textContent = greeting;
  }
  updateGreeting();

  // Toggle Nudge mode
  function toggleNudgeMode() {
    isNudgeMode = !isNudgeMode;
    nudgeBtn.classList.toggle('active', isNudgeMode);
    
    if (isNudgeMode && taskInput.value.trim()) {
      showNudgePanel(taskInput.value.trim());
    } else {
      hideNudgePanel();
    }
  }

  // Show Nudge panel with questions
  function showNudgePanel(taskText) {
    const questions = questionsByPersona[currentPersona];
    const persona = personas[currentPersona];
    
    nudgePanel.innerHTML = `
      <div class="nudge-content">
        <div class="persona-selector">
          ${Object.entries(personas).map(([key, p]) => `
            <button class="persona-btn ${key === currentPersona ? 'active' : ''}" data-persona="${key}">
              ${p.emoji} ${p.name}
            </button>
          `).join('')}
        </div>
        <div class="nudge-header">
          <div class="ai-avatar">${persona.emoji}</div>
          <span class="ai-name">${persona.name}</span>
          <span class="ai-persona">${persona.style}</span>
        </div>
        <div class="nudge-questions">
          <p style="margin-bottom: 12px; color: var(--text-secondary);">关于「${taskText}」这个任务：</p>
          ${questions.map((q, i) => `
            <div class="question-item">
              <span class="question-num">${i + 1}</span>
              <span class="question-text">${q}</span>
            </div>
          `).join('')}
        </div>
        <textarea class="nudge-input" placeholder="在这里回答以上问题..."></textarea>
        <div class="nudge-actions">
          <button class="btn-ghost" id="cancelNudge">取消</button>
          <button class="btn-primary" id="confirmNudge">确认并创建任务</button>
        </div>
      </div>
    `;
    
    nudgePanel.classList.add('active');
    
    // Bind persona buttons
    nudgePanel.querySelectorAll('.persona-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPersona = btn.dataset.persona;
        showNudgePanel(taskText);
      });
    });
    
    // Bind action buttons
    document.getElementById('cancelNudge').addEventListener('click', () => {
      hideNudgePanel();
      isNudgeMode = false;
      nudgeBtn.classList.remove('active');
    });
    
    document.getElementById('confirmNudge').addEventListener('click', () => {
      const response = nudgePanel.querySelector('.nudge-input').value;
      createTask(taskText, true, response);
      hideNudgePanel();
      taskInput.value = '';
      isNudgeMode = false;
      nudgeBtn.classList.remove('active');
    });
  }

  function hideNudgePanel() {
    nudgePanel.classList.remove('active');
    setTimeout(() => { nudgePanel.innerHTML = ''; }, 300);
  }

  // Create task
  function createTask(title, isNudged = false, nudgeResponse = '') {
    const task = {
      id: Date.now(),
      title,
      completed: false,
      isNudged,
      nudgeResponse,
      persona: isNudged ? currentPersona : null,
      time: '14:00',
      duration: '1h',
      chat: isNudged ? generateChatHistory(title, nudgeResponse) : []
    };
    
    tasks.unshift(task);
    renderTasks();
  }

  // Generate chat history for nudged tasks
  function generateChatHistory(title, response) {
    const persona = personas[currentPersona];
    const questions = questionsByPersona[currentPersona];
    
    return [
      { role: 'ai', content: `关于「${title}」，${questions[0]}` },
      { role: 'user', content: response || '（用户回复）' },
      { role: 'ai', content: '好的，我已经帮你整理好了这个任务。准备好开始的时候告诉我！' }
    ];
  }

  // Render tasks
  function renderTasks() {
    if (tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <p class="empty-text">还没有任务，写下你想完成的事情吧</p>
        </div>
      `;
    } else {
      tasksList.innerHTML = tasks.map(task => renderTaskCard(task)).join('');
      bindTaskEvents();
    }
    taskCount.textContent = `${tasks.filter(t => !t.completed).length} 个任务`;
  }

  function renderTaskCard(task) {
    const persona = task.persona ? personas[task.persona] : null;
    return `
      <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-main">
          <div class="task-checkbox ${task.completed ? 'checked' : ''}">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              <span class="task-tag">
                <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                ${task.time}
              </span>
              <span class="task-tag">
                <svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                ${task.duration}
              </span>
              ${task.isNudged ? `<span class="task-tag nudge-tag">${persona?.emoji || '🤗'} Nudge</span>` : ''}
            </div>
          </div>
          ${task.isNudged ? `
            <button class="task-expand">
              <svg viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
            </button>
          ` : ''}
        </div>
        ${task.isNudged ? `
          <div class="task-chat">
            <div class="chat-content">
              ${task.chat.map((msg, i) => `
                <div class="chat-message ${msg.role}" style="animation-delay: ${i * 0.1}s">
                  <div class="chat-avatar ${msg.role}">${msg.role === 'ai' ? persona?.emoji || '🤗' : '👤'}</div>
                  <div class="chat-bubble">${msg.content}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function bindTaskEvents() {
    document.querySelectorAll('.task-card').forEach(card => {
      const id = parseInt(card.dataset.id);
      const checkbox = card.querySelector('.task-checkbox');
      const expandBtn = card.querySelector('.task-expand');
      
      checkbox?.addEventListener('click', (e) => {
        e.stopPropagation();
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.completed = !task.completed;
          renderTasks();
        }
      });
      
      expandBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('expanded');
      });
    });
  }

  // Event listeners
  nudgeBtn.addEventListener('click', toggleNudgeMode);
  
  submitBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) return;
    
    if (isNudgeMode) {
      showNudgePanel(text);
    } else {
      createTask(text);
      taskInput.value = '';
    }
  });

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
    if (e.key === 'n' && e.ctrlKey) {
      e.preventDefault();
      toggleNudgeMode();
    }
  });

  // Keyboard shortcut hint
  taskInput.addEventListener('focus', () => {
    nudgeBtn.title = '按 N 键或点击进入 Nudge 模式';
  });

  // Add demo tasks
  tasks = [
    {
      id: 1,
      title: '写一份新能源行业调研报告（投资人向）',
      completed: false,
      isNudged: true,
      persona: 'buddy',
      time: '14:00',
      duration: '3h',
      chat: [
        { role: 'ai', content: '关于「写一份新能源行业调研报告」，能跟我说说这个任务是关于什么的吗？' },
        { role: 'user', content: '新能源行业，给投资人看的。明天下午2点，预计3小时。可能会被临时会议打断。' },
        { role: 'ai', content: '好的！我帮你整理一下：新能源行业调研报告，面向投资人，明天14:00开始，预计3小时。我会在13:55提醒你，如果被会议打断，我们可以随时继续讨论哦～' }
      ]
    },
    {
      id: 2,
      title: '回复客户邮件',
      completed: false,
      isNudged: false,
      time: '10:00',
      duration: '30m',
      chat: []
    }
  ];
  
  renderTasks();
});
