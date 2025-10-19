// Global Variables
        let windows = [];
        let activeWindow = null;
        let windowIdCounter = 0;
        let isDragging = false;
        let currentWindow = null;
        let offset = { x: 0, y: 0 };
        let isLocked = false;
        
        // LocalStorage Keys
        const STORAGE_KEYS = {
            SETTINGS: 'monopsy_settings',
            TODO_ITEMS: 'monopsy_todo_items',
            TEXT_EDITOR_CONTENT: 'monopsy_text_editor_content',
            WINDOW_STATES: 'monopsy_window_states',
            UPLOADED_FILES: 'monopsy_uploaded_files',
            NOTES: 'monopsy_notes'
        };

        // App Definitions
        const apps = {
            calculator: {
                name: 'Calculator',
                icon: '<i class="fas fa-calculator"></i>',
                content: `
                    <div class="app-content">
                        <div class="calculator">
                            <div class="calc-display" id="calcDisplay">0</div>
                            <div class="calc-buttons">
                                <button class="calc-btn" onclick="clearCalc()">C</button>
                                <button class="calc-btn" onclick="appendToCalc('/')">/</button>
                                <button class="calc-btn" onclick="appendToCalc('*')">×</button>
                                <button class="calc-btn" onclick="deleteLastCalc()">←</button>
                                <button class="calc-btn" onclick="appendToCalc('7')">7</button>
                                <button class="calc-btn" onclick="appendToCalc('8')">8</button>
                                <button class="calc-btn" onclick="appendToCalc('9')">9</button>
                                <button class="calc-btn operator" onclick="appendToCalc('-')">-</button>
                                <button class="calc-btn" onclick="appendToCalc('4')">4</button>
                                <button class="calc-btn" onclick="appendToCalc('5')">5</button>
                                <button class="calc-btn" onclick="appendToCalc('6')">6</button>
                                <button class="calc-btn operator" onclick="appendToCalc('+')">+</button>
                                <button class="calc-btn" onclick="appendToCalc('1')">1</button>
                                <button class="calc-btn" onclick="appendToCalc('2')">2</button>
                                <button class="calc-btn" onclick="appendToCalc('3')">3</button>
                                <button class="calc-btn" onclick="appendToCalc('.')">.</button>
                                <button class="calc-btn" onclick="appendToCalc('0')">0</button>
                                <button class="calc-btn" onclick="appendToCalc('00')">00</button>
                                <button class="calc-btn equals" onclick="calculate()">=</button>
                            </div>
                        </div>
                    </div>
                `
            },
            textEditor: {
                name: 'Text Editor',
                icon: '<i class="fas fa-file-alt"></i>',
                content: `
                    <div class="app-content">
                        <div class="text-editor">
                            <div class="editor-toolbar">
                                <button class="editor-btn" onclick="formatText('bold')"><i class="fas fa-bold"></i> Bold</button>
                                <button class="editor-btn" onclick="formatText('italic')"><i class="fas fa-italic"></i> Italic</button>
                                <button class="editor-btn" onclick="formatText('underline')"><i class="fas fa-underline"></i> Underline</button>
                                <button class="editor-btn" onclick="formatText('strikeThrough')"><i class="fas fa-strikethrough"></i> Strike</button>
                                <button class="editor-btn" onclick="formatText('justifyLeft')"><i class="fas fa-align-left"></i> Left</button>
                                <button class="editor-btn" onclick="formatText('justifyCenter')"><i class="fas fa-align-center"></i> Center</button>
                                <button class="editor-btn" onclick="formatText('justifyRight')"><i class="fas fa-align-right"></i> Right</button>
                                <button class="editor-btn" onclick="changeFontSize()"><i class="fas fa-text-height"></i> Size</button>
                                <button class="editor-btn" onclick="changeTextColor()"><i class="fas fa-palette"></i> Color</button>
                                <button class="editor-btn" onclick="clearEditor()"><i class="fas fa-eraser"></i> Clear</button>
                                <button class="editor-btn" onclick="saveText()"><i class="fas fa-save"></i> Save</button>
                            </div>
                            <div class="editor-content" id="editorContent" contenteditable="true"></div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    // Load saved content from LocalStorage
                    const savedContent = localStorage.getItem(STORAGE_KEYS.TEXT_EDITOR_CONTENT);
                    if (savedContent) {
                        const editor = document.getElementById('editorContent');
                        if (editor) editor.innerHTML = savedContent;
                    }
                },
                onUnload: function() {
                    // Save content to LocalStorage
                    const editor = document.getElementById('editorContent');
                    if (editor) {
                        localStorage.setItem(STORAGE_KEYS.TEXT_EDITOR_CONTENT, editor.innerHTML);
                    }
                }
            },
            browser: {
                name: 'Browser',
                icon: '<i class="fas fa-globe"></i>',
                content: `
                    <div class="app-content">
                        <div class="browser">
                            <div class="browser-toolbar">
                                <button class="browser-nav-btn" onclick="navigateBrowser('back')"><i class="fas fa-arrow-left"></i></button>
                                <button class="browser-nav-btn" onclick="navigateBrowser('forward')"><i class="fas fa-arrow-right"></i></button>
                                <button class="browser-nav-btn" onclick="navigateBrowser('refresh')"><i class="fas fa-sync"></i></button>
                                <input type="text" class="browser-url" id="browserUrl" placeholder="Enter URL..." value="https://example.com">
                                <button class="browser-nav-btn" onclick="loadUrl()"><i class="fas fa-arrow-right"></i></button>
                            </div>
                            <div class="browser-content">
                                <div class="browser-loading" id="browserLoading">
                                    <i class="fas fa-spinner fa-spin"></i> Loading...
                                </div>
                                <div class="browser-error" id="browserError" style="display: none;">
                                    <h3>Unable to load page</h3>
                                    <p>The requested URL could not be loaded due to security restrictions.</p>
                                    <button onclick="loadUrl()">Try Again</button>
                                </div>
                                <iframe class="browser-iframe" id="browserIframe" src="https://najahcreates.netlify.app"></iframe>
                            </div>
                        </div>
                    </div>
                `
            },
            fileExplorer: {
                name: 'File Explorer',
                icon: '<i class="fas fa-folder"></i>',
                content: `
                    <div class="app-content">
                        <div class="file-explorer">
                            <div class="file-path">
                                <span id="currentPath">/home/user/Documents</span>
                                <input type="file" id="fileInput" style="display: none;" multiple onchange="handleFileUpload(event)">
                                <button class="file-upload-btn" onclick="document.getElementById('fileInput').click()"><i class="fas fa-upload"></i> Upload</button>
                            </div>
                            <div class="file-grid" id="fileGrid">
                                <!-- Files will be dynamically added here -->
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    loadUploadedFiles();
                }
            },
            settings: {
                name: 'Settings',
                icon: '<i class="fas fa-cog"></i>',
                content: `
                    <div class="app-content">
                        <div class="settings">
                            <div class="settings-section">
                                <h3>Appearance</h3>
                                <div class="setting-item">
                                    <span class="setting-label">Dark Mode</span>
                                    <div class="toggle-switch" id="darkModeToggle" onclick="toggleDarkMode()"></div>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Animations</span>
                                    <div class="toggle-switch active" onclick="toggleSetting(this)"></div>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Wallpaper</span>
                                    <select id="wallpaperSelect" onchange="changeWallpaper(this.value)">
                                        <option value="https://picsum.photos/seed/monopsy/1920/1080.jpg">Default</option>
                                        <option value="https://picsum.photos/seed/nature/1920/1080.jpg">Nature</option>
                                        <option value="https://picsum.photos/seed/city/1920/1080.jpg">City</option>
                                        <option value="https://picsum.photos/seed/abstract/1920/1080.jpg">Abstract</option>
                                    </select>
                                </div>
                            </div>
                            <div class="settings-section">
                                <h3>System</h3>
                                <div class="setting-item">
                                    <span class="setting-label">Notifications</span>
                                    <div class="toggle-switch active" onclick="toggleSetting(this)"></div>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Auto-save</span>
                                    <div class="toggle-switch active" onclick="toggleSetting(this)"></div>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Lock Screen</span>
                                    <div class="toggle-switch active" onclick="toggleLockScreenSetting(this)"></div>
                                </div>
                            </div>
                            <div class="settings-section">
                                <h3>Data Management</h3>
                                <div class="setting-item">
                                    <span class="setting-label">Clear All Data</span>
                                    <button class="editor-btn" onclick="clearAllData()"><i class="fas fa-trash"></i> Clear</button>
                                </div>
                            </div>
                            <div class="settings-section">
                                <h3>About</h3>
                                <p>MonOpSy Version 2.0.0</p>
                                <p>Minimalist Open Source Web Operating System developed by <a href="https://github.com/najahcreates/MonOpSy">NajahCreates</a></p>
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    // Load settings from LocalStorage
                    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
                    
                    // Set dark mode toggle state
                    const darkModeToggle = document.getElementById('darkModeToggle');
                    if (settings.darkMode) {
                        darkModeToggle.classList.add('active');
                        document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    
                    // Set wallpaper
                    if (settings.wallpaper) {
                        document.documentElement.style.setProperty('--wallpaper', `url('${settings.wallpaper}')`);
                        const wallpaperSelect = document.getElementById('wallpaperSelect');
                        if (wallpaperSelect) {
                            wallpaperSelect.value = settings.wallpaper;
                        }
                    }
                }
            },
            todo: {
                name: 'To-Do List',
                icon: '<i class="fas fa-check-square"></i>',
                content: `
                    <div class="app-content">
                        <div class="todo-app">
                            <div class="todo-header">
                                <input type="text" class="todo-input" id="todoInput" placeholder="Add a new task..." onkeypress="if(event.key==='Enter') addTodoItem()">
                                <button class="todo-add-btn" onclick="addTodoItem()"><i class="fas fa-plus"></i> Add</button>
                            </div>
                            <div class="todo-list" id="todoList"></div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    // Load todo items from LocalStorage
                    const todoItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODO_ITEMS) || '[]');
                    renderTodoList(todoItems);
                },
                onUnload: function() {
                    // Save todo items to LocalStorage
                    saveTodoItems();
                }
            },
            snake: {
                name: 'Snake Game',
                icon: '<i class="fas fa-gamepad"></i>',
                content: `
                    <div class="app-content">
                        <div class="snake-game">
                            <div class="game-header">
                                <div class="game-score">Score: <span id="snakeScore">0</span></div>
                                <div class="game-controls">
                                    <button class="game-btn" onclick="startSnakeGame()"><i class="fas fa-play"></i> Start</button>
                                    <button class="game-btn" onclick="pauseSnakeGame()"><i class="fas fa-pause"></i> Pause</button>
                                    <button class="game-btn" onclick="resetSnakeGame()"><i class="fas fa-redo"></i> Reset</button>
                                </div>
                            </div>
                            <div class="game-board" id="snakeBoard"></div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    initSnakeGame();
                }
            },
            music: {
                name: 'Music Player',
                icon: '<i class="fas fa-music"></i>',
                content: `
                    <div class="app-content">
                        <div class="music-player">
                            <div class="player-album"><i class="fas fa-music"></i></div>
                            <div class="player-info">
                                <div class="player-title">Kaayi</div>
                                <div class="player-artist">Baby Jean</div>
                            </div>
                            <div class="player-controls">
                                <button class="player-btn" onclick="previousTrack()"><i class="fas fa-step-backward"></i></button>
                                <button class="player-btn play-pause" onclick="togglePlayPause()" id="playPauseBtn"><i class="fas fa-play"></i></button>
                                <button class="player-btn" onclick="nextTrack()"><i class="fas fa-step-forward"></i></button>
                            </div>
                            <div class="player-progress">
                                <div class="player-progress-bar" id="playerProgress"></div>
                            </div>
                            <div class="player-time">
                                <span id="currentTime">0:00</span>
                                <span id="totalTime">3:45</span>
                            </div>
                        </div>
                    </div>
                `
            },
            terminal: {
                name: 'Terminal',
                icon: '<i class="fas fa-terminal"></i>',
                content: `
                    <div class="app-content">
                        <div class="terminal">
                            <div class="terminal-header">
                                <div class="terminal-button close"></div>
                                <div class="terminal-button minimize"></div>
                                <div class="terminal-button maximize"></div>
                                <div class="terminal-title">Terminal</div>
                            </div>
                            <div class="terminal-body" id="terminalBody">
                                <div class="terminal-line">
                                    <span class="terminal-prompt">user@monopsy:~$</span>
                                    <span class="terminal-command">welcome</span>
                                </div>
                                <div class="terminal-output">Welcome to MonOpSy Terminal v2.0.0</div>
                                <div class="terminal-output">Type 'help' for available commands.</div>
                                <div class="terminal-input-line">
                                    <span class="terminal-prompt">user@monopsy:~$</span>
                                    <input type="text" class="terminal-input" id="terminalInput" autofocus>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    const terminalInput = document.getElementById('terminalInput');
                    if (terminalInput) {
                        terminalInput.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                                executeTerminalCommand(this.value);
                                this.value = '';
                            }
                        });
                    }
                }
            },
            calendar: {
                name: 'Calendar',
                icon: '<i class="fas fa-calendar"></i>',
                content: `
                    <div class="app-content">
                        <div class="calendar">
                            <div class="calendar-header">
                                <div class="calendar-title" id="calendarTitle">January 2023</div>
                                <div class="calendar-nav">
                                    <div class="calendar-nav-btn" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></div>
                                    <div class="calendar-nav-btn" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></div>
                                </div>
                            </div>
                            <div class="calendar-grid" id="calendarGrid">
                                <!-- Calendar will be generated here -->
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    initCalendar();
                }
            },
            notes: {
                name: 'Notes',
                icon: '<i class="fas fa-sticky-note"></i>',
                content: `
                    <div class="app-content">
                        <div class="notes-app">
                            <div class="notes-header">
                                <div class="notes-title">My Notes</div>
                                <button class="notes-new-btn" onclick="createNewNote()"><i class="fas fa-plus"></i> New Note</button>
                            </div>
                            <div class="notes-list" id="notesList">
                                <!-- Notes will be dynamically added here -->
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    loadNotes();
                }
            },
            systemMonitor: {
                name: 'System Monitor',
                icon: '<i class="fas fa-chart-line"></i>',
                content: `
                    <div class="app-content">
                        <div class="system-monitor">
                            <div class="monitor-section">
                                <div class="monitor-title">
                                    CPU Usage
                                    <span class="monitor-value" id="cpuValue">45%</span>
                                </div>
                                <div class="monitor-bar">
                                    <div class="monitor-progress" id="cpuProgress" style="width: 45%"></div>
                                </div>
                                <div class="monitor-info">
                                    <span>Processes: 42</span>
                                    <span>Threads: 326</span>
                                </div>
                            </div>
                            <div class="monitor-section">
                                <div class="monitor-title">
                                    Memory Usage
                                    <span class="monitor-value" id="memoryValue">62%</span>
                                </div>
                                <div class="monitor-bar">
                                    <div class="monitor-progress" id="memoryProgress" style="width: 62%"></div>
                                </div>
                                <div class="monitor-info">
                                    <span>Used: 4.2 GB</span>
                                    <span>Total: 8 GB</span>
                                </div>
                            </div>
                            <div class="monitor-section">
                                <div class="monitor-title">
                                    Disk Usage
                                    <span class="monitor-value" id="diskValue">38%</span>
                                </div>
                                <div class="monitor-bar">
                                    <div class="monitor-progress" id="diskProgress" style="width: 38%"></div>
                                </div>
                                <div class="monitor-info">
                                    <span>Used: 114 GB</span>
                                    <span>Total: 300 GB</span>
                                </div>
                            </div>
                            <div class="monitor-section">
                                <div class="monitor-title">
                                    Network Activity
                                    <span class="monitor-value" id="networkValue">2.4 MB/s</span>
                                </div>
                                <div class="monitor-info">
                                    <span>Download: 1.8 MB/s</span>
                                    <span>Upload: 0.6 MB/s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    // Start system monitor simulation
                    setInterval(updateSystemMonitor, 2000);
                }
            },
            puzzle: {
                name: 'Puzzle Game',
                icon: '<i class="fas fa-puzzle-piece"></i>',
                content: `
                    <div class="app-content">
                        <div class="puzzle-game">
                            <div class="puzzle-header">
                                <div class="puzzle-score">Moves: <span id="puzzleMoves">0</span></div>
                                <div class="puzzle-controls">
                                    <button class="game-btn" onclick="shufflePuzzle()"><i class="fas fa-random"></i> Shuffle</button>
                                    <button class="game-btn" onclick="resetPuzzle()"><i class="fas fa-redo"></i> Reset</button>
                                </div>
                            </div>
                            <div class="puzzle-board" id="puzzleBoard">
                                <!-- Puzzle pieces will be generated here -->
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    initPuzzleGame();
                }
            },
            memory: {
                name: 'Memory Game',
                icon: '<i class="fas fa-brain"></i>',
                content: `
                    <div class="app-content">
                        <div class="memory-game">
                            <div class="memory-header">
                                <div class="memory-score">Score: <span id="memoryScore">0</span></div>
                                <div class="memory-controls">
                                    <button class="game-btn" onclick="resetMemoryGame()"><i class="fas fa-redo"></i> New Game</button>
                                </div>
                            </div>
                            <div class="memory-board" id="memoryBoard">
                                <!-- Memory cards will be generated here -->
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    initMemoryGame();
                }
            },
            imageViewer: {
                name: 'Image Viewer',
                icon: '<i class="fas fa-image"></i>',
                content: `
                    <div class="app-content">
                        <div class="image-viewer">
                            <div class="image-toolbar">
                                <button class="image-viewer-btn" onclick="zoomImage('in')"><i class="fas fa-search-plus"></i> Zoom In</button>
                                <button class="image-viewer-btn" onclick="zoomImage('out')"><i class="fas fa-search-minus"></i> Zoom Out</button>
                                <button class="image-viewer-btn" onclick="rotateImage()"><i class="fas fa-sync"></i> Rotate</button>
                                <button class="image-viewer-btn" onclick="resetImage()"><i class="fas fa-expand"></i> Reset</button>
                                <input type="file" id="imageFileInput" style="display: none;" accept="image/*" onchange="loadImageFile(event)">
                                <button class="image-viewer-btn" onclick="document.getElementById('imageFileInput').click()"><i class="fas fa-folder-open"></i> Open</button>
                            </div>
                            <div class="image-container">
                                <img class="image-display" id="imageDisplay" src="https://picsum.photos/seed/monopsy-image/800/600.jpg" alt="Image">
                                <div class="image-info">
                                    <span id="imageName">sample.jpg</span>
                                    <span id="imageSize">800 x 600</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            weather: {
                name: 'Weather',
                icon: '<i class="fas fa-cloud-sun"></i>',
                content: `
                    <div class="app-content">
                        <div class="weather-app">
                            <div class="weather-location" id="weatherLocation">New York, USA</div>
                            <div class="weather-date" id="weatherDate">Monday, January 1, 2023</div>
                            <div class="weather-current">
                                <div class="weather-icon"><i class="fas fa-sun"></i></div>
                                <div class="weather-temp" id="weatherTemp">72°F</div>
                            </div>
                            <div class="weather-desc" id="weatherDesc">Sunny</div>
                            <div class="weather-details">
                                <div class="weather-detail">
                                    <div class="weather-detail-label">Feels Like</div>
                                    <div class="weather-detail-value" id="feelsLike">75°F</div>
                                </div>
                                <div class="weather-detail">
                                    <div class="weather-detail-label">Humidity</div>
                                    <div class="weather-detail-value" id="humidity">45%</div>
                                </div>
                                <div class="weather-detail">
                                    <div class="weather-detail-label">Wind Speed</div>
                                    <div class="weather-detail-value" id="windSpeed">8 mph</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    updateWeather();
                }
            },
            clock: {
                name: 'Clock',
                icon: '<i class="fas fa-clock"></i>',
                content: `
                    <div class="app-content">
                        <div class="clock-app">
                            <div class="analog-clock" id="analogClock">
                                <div class="clock-center"></div>
                                <div class="clock-hand hour-hand" id="hourHand"></div>
                                <div class="clock-hand minute-hand" id="minuteHand"></div>
                                <div class="clock-hand second-hand" id="secondHand"></div>
                                <div class="clock-number" style="top: 5%; left: 46%;">12</div>
                                <div class="clock-number" style="top: 25%; right: 10%;">3</div>
                                <div class="clock-number" style="bottom: 5%; left: 48%;">6</div>
                                <div class="clock-number" style="top: 25%; left: 10%;">9</div>
                            </div>
                            <div class="digital-clock" id="digitalClock">12:00:00</div>
                            <div class="clock-date" id="clockDate">Monday, January 1, 2023</div>
                        </div>
                    </div>
                `,
                onLoad: function() {
                    updateClockApp();
                    setInterval(updateClockApp, 1000);
                }
            }
        };

        // Boot Screen
        function bootSystem() {
            const progressBar = document.getElementById('bootProgressBar');
            const bootScreen = document.getElementById('bootScreen');
            
            // Load settings from LocalStorage
            const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
            if (settings.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
            
            // Start progress animation immediately
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
            
            // Hide boot screen after 1.5 seconds
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                showNotification('Welcome to MonOpSy', 'System is ready');
                startClock();
                
                // Restore window states if available
                restoreWindowStates();
            }, 1500);
        }

        // Window Management
        function openApp(appName) {
            if (!apps[appName]) return;
            
            const windowId = `window-${windowIdCounter++}`;
            const app = apps[appName];
            
            const windowElement = document.createElement('div');
            windowElement.className = 'window';
            windowElement.id = windowId;
            windowElement.style.top = `${50 + (windowIdCounter * 30) % 300}px`;
            windowElement.style.left = `${100 + (windowIdCounter * 30) % 400}px`;
            windowElement.style.width = '600px';
            windowElement.style.height = '400px';
            
            windowElement.innerHTML = `
                <div class="window-header" onmousedown="startDrag(event, '${windowId}')">
                    <div class="window-title">
                        <span>${app.icon}</span>
                        <span>${app.name}</span>
                    </div>
                    <div class="window-controls">
                        <div class="window-control minimize" onclick="minimizeWindow('${windowId}')"></div>
                        <div class="window-control maximize" onclick="maximizeWindow('${windowId}')"></div>
                        <div class="window-control close" onclick="closeWindow('${windowId}')"></div>
                    </div>
                </div>
                <div class="window-content">
                    ${app.content}
                </div>
            `;
            
            document.getElementById('desktop').appendChild(windowElement);
            windows.push({ id: windowId, app: appName, minimized: false, maximized: false });
            
            setActiveWindow(windowId);
            updateTaskbar();
            
            // Call app's onLoad function if it exists
            if (app.onLoad) {
                setTimeout(() => app.onLoad(), 100);
            }
        }

        function closeWindow(windowId) {
            const windowElement = document.getElementById(windowId);
            const windowData = windows.find(w => w.id === windowId);
            
            if (windowElement && windowData) {
                // Call app's onUnload function if it exists
                const app = apps[windowData.app];
                if (app.onUnload) {
                    app.onUnload();
                }
                
                windowElement.style.animation = 'windowOpen 0.3s ease reverse';
                setTimeout(() => {
                    windowElement.remove();
                }, 300);
            }
            
            windows = windows.filter(w => w.id !== windowId);
            updateTaskbar();
            
            // Save window states
            saveWindowStates();
            
            if (activeWindow === windowId) {
                activeWindow = null;
                const remainingWindows = windows.filter(w => !w.minimized);
                if (remainingWindows.length > 0) {
                    setActiveWindow(remainingWindows[remainingWindows.length - 1].id);
                }
            }
        }

        function minimizeWindow(windowId) {
            const windowElement = document.getElementById(windowId);
            const windowData = windows.find(w => w.id === windowId);
            
            if (windowElement && windowData) {
                windowElement.classList.add('minimized');
                windowData.minimized = true;
                updateTaskbar();
                
                // Save window states
                saveWindowStates();
                
                if (activeWindow === windowId) {
                    const remainingWindows = windows.filter(w => !w.minimized);
                    if (remainingWindows.length > 0) {
                        setActiveWindow(remainingWindows[remainingWindows.length - 1].id);
                    }
                }
            }
        }

        function maximizeWindow(windowId) {
            const windowElement = document.getElementById(windowId);
            const windowData = windows.find(w => w.id === windowId);
            
            if (windowElement && windowData) {
                // Check if window is already maximized
                if (windowData.maximized) {
                    // Restore to normal size
                    windowElement.classList.remove('maximized');
                    windowData.maximized = false;
                } else {
                    // Maximize the window
                    windowElement.classList.add('maximized');
                    windowData.maximized = true;
                }
                
                // Save window states
                saveWindowStates();
            }
        }

        function setActiveWindow(windowId) {
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                windowElement.classList.add('active');
                activeWindow = windowId;
                
                // Bring to front
                const allWindows = document.querySelectorAll('.window');
                allWindows.forEach(w => w.style.zIndex = '1');
                windowElement.style.zIndex = '100';
            }
            updateTaskbar();
        }

        function closeAllWindows() {
            windows.forEach(w => closeWindow(w.id));
        }

        // Taskbar
        function updateTaskbar() {
            const taskbarApps = document.getElementById('taskbarApps');
            taskbarApps.innerHTML = '';
            
            windows.forEach(window => {
                const app = apps[window.app];
                const taskbarApp = document.createElement('div');
                taskbarApp.className = 'taskbar-app';
                if (window.id === activeWindow) taskbarApp.classList.add('active');
                taskbarApp.innerHTML = app.icon;
                taskbarApp.onclick = () => {
                    if (window.minimized) {
                        const windowElement = document.getElementById(window.id);
                        windowElement.classList.remove('minimized');
                        window.minimized = false;
                        setActiveWindow(window.id);
                        
                        // Save window states
                        saveWindowStates();
                    } else {
                        setActiveWindow(window.id);
                    }
                };
                taskbarApps.appendChild(taskbarApp);
            });
        }

        // Dragging
        function startDrag(e, windowId) {
            if (e.target.classList.contains('window-control')) return;
            
            const windowElement = document.getElementById(windowId);
            const windowData = windows.find(w => w.id === windowId);
            
            if (windowData && (windowData.maximized || windowElement.classList.contains('snapped-left') || windowElement.classList.contains('snapped-right'))) return;
            
            isDragging = true;
            currentWindow = windowId;
            
            const rect = windowElement.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            
            setActiveWindow(windowId);
        }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !currentWindow) return;
            
            const windowElement = document.getElementById(currentWindow);
            if (windowElement) {
                const x = e.clientX - offset.x;
                const y = e.clientY - offset.y;
                
                // Keep window within viewport
                const maxX = window.innerWidth - windowElement.offsetWidth;
                const maxY = window.innerHeight - windowElement.offsetHeight - 48; // Account for taskbar
                
                windowElement.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
                windowElement.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && currentWindow) {
                // Save window states
                saveWindowStates();
            }
            isDragging = false;
            currentWindow = null;
        });

        // Window snapping
        document.addEventListener('mouseup', (e) => {
            if (!isDragging || !currentWindow) return;
            
            const windowElement = document.getElementById(currentWindow);
            const windowData = windows.find(w => w.id === currentWindow);
            
            if (!windowElement || !windowData) return;
            
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight - 48; // Account for taskbar
            
            // Check if window is at the edges for snapping
            const rect = windowElement.getBoundingClientRect();
            
            // Snap to left
            if (rect.left <= 10) {
                windowElement.classList.add('snapped-left');
                windowElement.classList.remove('snapped-right', 'maximized');
                windowData.snappedLeft = true;
                windowData.snappedRight = false;
                windowData.maximized = false;
            }
            // Snap to right
            else if (rect.right >= screenWidth - 10) {
                windowElement.classList.add('snapped-right');
                windowElement.classList.remove('snapped-left', 'maximized');
                windowData.snappedRight = true;
                windowData.snappedLeft = false;
                windowData.maximized = false;
            }
            // Snap to top (maximize)
            else if (rect.top <= 10) {
                windowElement.classList.add('maximized');
                windowElement.classList.remove('snapped-left', 'snapped-right');
                windowData.maximized = true;
                windowData.snappedLeft = false;
                windowData.snappedRight = false;
            }
            // No snapping
            else {
                windowElement.classList.remove('snapped-left', 'snapped-right', 'maximized');
                windowData.snappedLeft = false;
                windowData.snappedRight = false;
                windowData.maximized = false;
            }
            
            // Save window states
            saveWindowStates();
        });

        // Start Menu
        function toggleStartMenu() {
            const startMenu = document.getElementById('startMenuPanel');
            startMenu.classList.toggle('show');
        }

        function searchApps(query) {
            // Simple search implementation
            const startApps = document.querySelectorAll('.start-app');
            startApps.forEach(app => {
                const label = app.querySelector('.start-app-label').textContent.toLowerCase();
                if (label.includes(query.toLowerCase())) {
                    app.style.display = 'flex';
                } else {
                    app.style.display = 'none';
                }
            });
        }

        // Clock
        function startClock() {
            function updateClock() {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                
                document.getElementById('clock').textContent = `${displayHours}:${minutes} ${ampm}`;
            }
            
            updateClock();
            setInterval(updateClock, 1000);
        }

        // Notifications
        function showNotification(title, message) {
            const notification = document.getElementById('notification');
            document.getElementById('notificationTitle').textContent = title;
            document.getElementById('notificationMessage').textContent = message;
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Lock Screen
        function toggleLockScreen() {
            const lockScreen = document.getElementById('lockScreen');
            lockScreen.classList.toggle('show');
            isLocked = lockScreen.classList.contains('show');
            
            if (isLocked) {
                updateLockScreenTime();
                setInterval(updateLockScreenTime, 1000);
            }
        }

        function updateLockScreenTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const date = now.getDate();
            const year = now.getFullYear();
            
            document.getElementById('lockTime').textContent = `${displayHours}:${minutes} ${ampm}`;
            document.getElementById('lockDate').textContent = `${dayName}, ${monthName} ${date}, ${year}`;
        }

        function unlockScreen() {
            const password = document.getElementById('lockPassword').value;
            
            // Simple password check (in a real OS, this would be more secure)
            if (password === 'password' || password === '') {
                document.getElementById('lockScreen').classList.remove('show');
                document.getElementById('lockPassword').value = '';
                isLocked = false;
                showNotification('Unlocked', 'System unlocked successfully');
            } else {
                showNotification('Incorrect Password', 'Please try again');
                document.getElementById('lockPassword').value = '';
            }
        }

        // Calculator Functions
        let calcDisplay = '0';
        let calcNewNumber = true;

        function updateCalcDisplay() {
            document.getElementById('calcDisplay').textContent = calcDisplay;
        }

        function appendToCalc(value) {
            if (calcNewNumber && !isNaN(value)) {
                calcDisplay = value;
                calcNewNumber = false;
            } else {
                if (calcDisplay === '0' && !isNaN(value)) {
                    calcDisplay = value;
                } else {
                    calcDisplay += value;
                }
            }
            updateCalcDisplay();
        }

        function clearCalc() {
            calcDisplay = '0';
            calcNewNumber = true;
            updateCalcDisplay();
        }

        function deleteLastCalc() {
            if (calcDisplay.length > 1) {
                calcDisplay = calcDisplay.slice(0, -1);
            } else {
                calcDisplay = '0';
            }
            updateCalcDisplay();
        }

        function calculate() {
            try {
                calcDisplay = eval(calcDisplay).toString();
                calcNewNumber = true;
            } catch (e) {
                calcDisplay = 'Error';
                calcNewNumber = true;
            }
            updateCalcDisplay();
        }

        // Text Editor Functions
        function formatText(command) {
            document.execCommand(command, false, null);
            document.getElementById('editorContent').focus();
        }

        function changeFontSize() {
            const size = prompt('Enter font size (1-7):', '3');
            if (size) {
                document.execCommand('fontSize', false, size);
                document.getElementById('editorContent').focus();
            }
        }

        function changeTextColor() {
            const color = prompt('Enter color (name or hex):', '#000000');
            if (color) {
                document.execCommand('foreColor', false, color);
                document.getElementById('editorContent').focus();
            }
        }

        function clearEditor() {
            if (confirm('Are you sure you want to clear all content?')) {
                document.getElementById('editorContent').innerHTML = '';
                showNotification('Editor Cleared', 'All content has been removed');
            }
        }

        function saveText() {
            const content = document.getElementById('editorContent').innerHTML;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.html';
            a.click();
            showNotification('Document Saved', 'File downloaded successfully');
        }

        // Browser Functions
        function loadUrl() {
            const urlInput = document.getElementById('browserUrl');
            const iframe = document.getElementById('browserIframe');
            const loading = document.getElementById('browserLoading');
            const errorDiv = document.getElementById('browserError');
            
            if (!urlInput || !iframe) return;
            
            let url = urlInput.value;
            
            // Add https:// if not present
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            // Show loading
            loading.classList.remove('hidden');
            errorDiv.style.display = 'none';
            
            // Set up error handling
            iframe.onload = function() {
                loading.classList.add('hidden');
            };
            
            iframe.onerror = function() {
                loading.classList.add('hidden');
                errorDiv.style.display = 'block';
            };
            
            // Load URL in iframe
            iframe.src = url;
            
            // Check for common blocked sites
            setTimeout(() => {
                try {
                    // Try to access iframe content - will fail for blocked sites
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) {
                        throw new Error('Blocked');
                    }
                } catch (e) {
                    loading.classList.add('hidden');
                    errorDiv.style.display = 'block';
                }
            }, 2000);
        }

        function navigateBrowser(action) {
            const iframe = document.getElementById('browserIframe');
            
            if (!iframe) return;
            
            switch(action) {
                case 'back':
                    iframe.contentWindow.history.back();
                    break;
                case 'forward':
                    iframe.contentWindow.history.forward();
                    break;
                case 'refresh':
                    iframe.src = iframe.src;
                    break;
            }
        }

        // Settings Functions
        function toggleDarkMode() {
            const toggle = document.getElementById('darkModeToggle');
            const isActive = toggle.classList.toggle('active');
            
            if (isActive) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            // Save setting to LocalStorage
            const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
            settings.darkMode = isActive;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            
            showNotification('Theme Changed', `Dark mode is now ${isActive ? 'enabled' : 'disabled'}`);
        }

        function toggleSetting(element) {
            element.classList.toggle('active');
            const isActive = element.classList.contains('active');
            const label = element.previousElementSibling.textContent;
            showNotification('Setting Changed', `${label} is now ${isActive ? 'enabled' : 'disabled'}`);
        }

        function toggleLockScreenSetting(element) {
            element.classList.toggle('active');
            const isActive = element.classList.contains('active');
            
            // Save setting to LocalStorage
            const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
            settingsScreen = isActive;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            
            showNotification('Setting Changed', `Lock screen is now ${isActive ? 'enabled' : 'disabled'}`);
        }

        function changeWallpaper(url) {
            document.documentElement.style.setProperty('--wallpaper', `url('${url}')`);
            
            // Save setting to LocalStorage
            const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
            settings.wallpaper = url;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            
            showNotification('Wallpaper Changed', 'Wallpaper has been updated');
        }

        function clearAllData() {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                localStorage.clear();
                showNotification('Data Cleared', 'All data has been removed');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        }

        // To-Do List Functions
        let todoItems = [];

        function addTodoItem() {
            const input = document.getElementById('todoInput');
            if (!input) return;
            
            const text = input.value.trim();
            if (text === '') return;
            
            const todo = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            todoItems.push(todo);
            input.value = '';
            
            renderTodoList(todoItems);
            saveTodoItems();
            showNotification('Task Added', 'New task has been added to your list');
        }

        function toggleTodoItem(id) {
            const todo = todoItems.find(item => item.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                renderTodoList(todoItems);
                saveTodoItems();
            }
        }

        function deleteTodoItem(id) {
            todoItems = todoItems.filter(item => item.id !== id);
            renderTodoList(todoItems);
            saveTodoItems();
            showNotification('Task Deleted', 'Task has been removed');
        }

        function renderTodoList(items) {
            const list = document.getElementById('todoList');
            if (!list) return;
            
            list.innerHTML = '';
            
            items.forEach(todo => {
                const item = document.createElement('div');
                item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                item.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodoItem(${todo.id})">
                    <span class="todo-text">${todo.text}</span>
                    <button class="todo-delete" onclick="deleteTodoItem(${todo.id})"><i class="fas fa-trash"></i></button>
                `;
                list.appendChild(item);
            });
        }

        function saveTodoItems() {
            localStorage.setItem(STORAGE_KEYS.TODO_ITEMS, JSON.stringify(todoItems));
        }

        // Snake Game Functions
        let snake = [];
        let food = {};
        let direction = 'right';
        let gameInterval = null;
        let score = 0;
        let gameRunning = false;

        function initSnakeGame() {
            const board = document.getElementById('snakeBoard');
            if (!board) return;
            
            // Create game board
            board.innerHTML = '';
            for (let i = 0; i < 400; i++) {
                const cell = document.createElement('div');
                cell.className = 'game-cell';
                cell.id = `cell-${i}`;
                board.appendChild(cell);
            }
            
            // Initialize snake
            snake = [200, 201, 202];
            direction = 'right';
            score = 0;
            updateScore();
            
            // Place initial food
            placeFood();
            
            // Draw initial state
            drawGame();
        }

        function startSnakeGame() {
            if (gameRunning) return;
            
            gameRunning = true;
            gameInterval = setInterval(moveSnake, 100);
            showNotification('Game Started', 'Use arrow keys to control the snake');
        }

        function pauseSnakeGame() {
            if (!gameRunning) return;
            
            gameRunning = false;
            clearInterval(gameInterval);
            showNotification('Game Paused', 'Press Start to resume');
        }

        function resetSnakeGame() {
            pauseSnakeGame();
            initSnakeGame();
            showNotification('Game Reset', 'Game has been reset');
        }

        function moveSnake() {
            const head = snake[snake.length - 1];
            let newHead;
            
            switch(direction) {
                case 'up':
                    newHead = head - 20;
                    if (newHead < 0) newHead = 380 + (newHead % 20);
                    break;
                case 'down':
                    newHead = head + 20;
                    if (newHead >= 400) newHead = newHead % 20;
                    break;
                case 'left':
                    newHead = head - 1;
                    if (head % 20 === 0) newHead = head + 19;
                    break;
                case 'right':
                    newHead = head + 1;
                    if ((head + 1) % 20 === 0) newHead = head - 19;
                    break;
            }
            
            // Check collision with self
            if (snake.includes(newHead)) {
                gameOver();
                return;
            }
            
            snake.push(newHead);
            
            // Check if food eaten
            if (newHead === food.position) {
                score += 10;
                updateScore();
                placeFood();
            } else {
                snake.shift();
            }
            
            drawGame();
        }

        function drawGame() {
            // Clear board
            document.querySelectorAll('.game-cell').forEach(cell => {
                cell.classList.remove('snake-cell', 'food-cell');
            });
            
            // Draw snake
            snake.forEach(segment => {
                const cell = document.getElementById(`cell-${segment}`);
                if (cell) cell.classList.add('snake-cell');
            });
            
            // Draw food
            const foodCell = document.getElementById(`cell-${food.position}`);
            if (foodCell) foodCell.classList.add('food-cell');
        }

        function placeFood() {
            do {
                food.position = Math.floor(Math.random() * 400);
            } while (snake.includes(food.position));
        }

        function updateScore() {
            const scoreElement = document.getElementById('snakeScore');
            if (scoreElement) scoreElement.textContent = score;
        }

        function gameOver() {
            pauseSnakeGame();
            showNotification('Game Over', `Final score: ${score}`);
        }

        // Keyboard controls for snake
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (direction !== 'down') direction = 'up';
                    break;
                case 'ArrowDown':
                    if (direction !== 'up') direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (direction !== 'right') direction = 'left';
                    break;
                case 'ArrowRight':
                    if (direction !== 'left') direction = 'right';
                    break;
            }
        });

        // Music Player Functions
        let isPlaying = false;
        let currentTrack = 0;
        let progress = 0;
        let progressInterval = null;

        function togglePlayPause() {
            const btn = document.getElementById('playPauseBtn');
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                btn.innerHTML = '<i class="fas fa-pause"></i>';
                startProgress();
                showNotification('Playing', 'Now playing: kaayi');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i>';
                stopProgress();
                showNotification('Paused', 'Playback paused');
            }
        }

        function previousTrack() {
            currentTrack = (currentTrack - 1 + 3) % 3;
            resetProgress();
            showNotification('Previous Track', `Track ${currentTrack + 1}`);
        }

        function nextTrack() {
            currentTrack = (currentTrack + 1) % 3;
            resetProgress();
            showNotification('Next Track', `Track ${currentTrack + 1}`);
        }

        function startProgress() {
            progressInterval = setInterval(() => {
                progress += 1;
                if (progress > 100) {
                    progress = 0;
                    nextTrack();
                }
                updateProgress();
            }, 225); // 3:45 song duration
        }

        function stopProgress() {
            clearInterval(progressInterval);
        }

        function resetProgress() {
            progress = 0;
            updateProgress();
        }

        function updateProgress() {
            const progressBar = document.getElementById('playerProgress');
            const currentTimeEl = document.getElementById('currentTime');
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (currentTimeEl) {
                const totalSeconds = Math.floor((progress / 100) * 225);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        // Terminal Functions
        function executeTerminalCommand(command) {
            const terminalBody = document.getElementById('terminalBody');
            const terminalInput = document.getElementById('terminalInput');
            
            if (!terminalBody || !terminalInput) return;
            
            // Add command to terminal
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `
                <span class="terminal-prompt">user@monopsy:~$</span>
                <span class="terminal-command">${command}</span>
            `;
            terminalBody.insertBefore(commandLine, terminalInput.parentElement);
            
            // Process command
            const output = document.createElement('div');
            output.className = 'terminal-output';
            
            switch(command.toLowerCase()) {
                case 'help':
                    output.innerHTML = `
                        Available commands:<br>
                        help - Show this help message<br>
                        clear - Clear terminal<br>
                        date - Show current date and time<br>
                        about - About MonOpSy<br>
                        apps - List all applications<br>
                        sysinfo - System information
                    `;
                    break;
                case 'clear':
                    terminalBody.innerHTML = '';
                    return;
                case 'date':
                    output.textContent = new Date().toString();
                    break;
                case 'about':
                    output.innerHTML = 'MonOpSy v2.0.0 - Minimalist Web Operating System<br>Created by NajahCreates';
                    break;
                case 'apps':
                    output.innerHTML = Object.keys(apps).join('<br>');
                    break;
                case 'sysinfo':
                    output.innerHTML = `
                        System: MonOpSy Web OS<br>
                        Browser: ${navigator.userAgent}<br>
                        Platform: ${navigator.platform}<br>
                        Language: ${navigator.language}<br>
                        Online: ${navigator.onLine ? 'Yes' : 'No'}
                    `;
                    break;
                default:
                    if (command.trim() === '') return;
                    output.textContent = `Command not found: ${command}. Type 'help' for available commands.`;
            }
            
            terminalBody.insertBefore(output, terminalInput.parentElement);
            
            // Scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        // Calendar Functions
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        function initCalendar() {
            renderCalendar();
        }

        function renderCalendar() {
            const calendarGrid = document.getElementById('calendarGrid');
            const calendarTitle = document.getElementById('calendarTitle');
            
            if (!calendarGrid || !calendarTitle) return;
            
            // Clear calendar
            calendarGrid.innerHTML = '';
            
            // Set title
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
            // Add day headers
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
            
            // Get first day of month and number of days
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
            
            // Add previous month's trailing days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = document.createElement('div');
                day.className = 'calendar-day other-month';
                day.textContent = daysInPrevMonth - i;
                calendarGrid.appendChild(day);
            }
            
            // Add current month's days
            const today = new Date();
            for (let i = 1; i <= daysInMonth; i++) {
                const day = document.createElement('div');
                day.className = 'calendar-day';
                
                // Check if today
                if (currentYear === today.getFullYear() && 
                    currentMonth === today.getMonth() && 
                    i === today.getDate()) {
                    day.classList.add('today');
                }
                
                day.textContent = i;
                calendarGrid.appendChild(day);
            }
            
            // Add next month's leading days
            const totalCells = calendarGrid.children.length - 7; // Subtract header row
            const remainingCells = 35 - totalCells; // 5 weeks * 7 days
            for (let i = 1; i <= remainingCells; i++) {
                const day = document.createElement('div');
                day.className = 'calendar-day other-month';
                day.textContent = i;
                calendarGrid.appendChild(day);
            }
        }

        function changeMonth(direction) {
            currentMonth += direction;
            
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            } else if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            renderCalendar();
        }

        // Notes Functions
        let notes = [];

        function loadNotes() {
            // Load notes from LocalStorage
            notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
            renderNotes();
        }

        function renderNotes() {
            const notesList = document.getElementById('notesList');
            if (!notesList) return;
            
            notesList.innerHTML = '';
            
            if (notes.length === 0) {
                notesList.innerHTML = '<div style="text-align: center; color: var(--gray-600); padding: 20px;">No notes yet. Click "New Note" to create one.</div>';
                return;
            }
            
            notes.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';
                noteItem.innerHTML = `
                    <div class="note-title">${note.title}</div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-date">${new Date(note.date).toLocaleDateString()}</div>
                    <button class="note-delete" onclick="deleteNote(${note.id})"><i class="fas fa-times"></i></button>
                `;
                
                noteItem.onclick = function(e) {
                    if (!e.target.classList.contains('note-delete') && !e.target.parentElement.classList.contains('note-delete')) {
                        openNote(note.id);
                    }
                };
                
                notesList.appendChild(noteItem);
            });
        }

        function createNewNote() {
            const title = prompt('Enter note title:');
            if (!title) return;
            
            const note = {
                id: Date.now(),
                title: title,
                content: '',
                date: new Date().toISOString()
            };
            
            notes.push(note);
            saveNotes();
            renderNotes();
            openNote(note.id);
        }

        function openNote(noteId) {
            const note = notes.find(n => n.id === noteId);
            if (!note) return;
            
            // Create a new window for the note
            const windowId = `window-${windowIdCounter++}`;
            
            const windowElement = document.createElement('div');
            windowElement.className = 'window';
            windowElement.id = windowId;
            windowElement.style.top = `${50 + (windowIdCounter * 30) % 300}px`;
            windowElement.style.left = `${100 + (windowIdCounter * 30) % 400}px`;
            windowElement.style.width = '600px';
            windowElement.style.height = '500px';
            
            windowElement.innerHTML = `
                <div class="window-header" onmousedown="startDrag(event, '${windowId}')">
                    <div class="window-title">
                        <span><i class="fas fa-sticky-note"></i></span>
                        <span>${note.title}</span>
                    </div>
                    <div class="window-controls">
                        <div class="window-control minimize" onclick="minimizeWindow('${windowId}')"></div>
                        <div class="window-control maximize" onclick="maximizeWindow('${windowId}')"></div>
                        <div class="window-control close" onclick="closeNoteWindow('${windowId}', ${noteId})"></div>
                    </div>
                </div>
                <div class="window-content">
                    <div class="text-editor">
                        <div class="editor-toolbar">
                            <button class="editor-btn" onclick="formatText('bold')"><i class="fas fa-bold"></i> Bold</button>
                            <button class="editor-btn" onclick="formatText('italic')"><i class="fas fa-italic"></i> Italic</button>
                            <button class="editor-btn" onclick="formatText('underline')"><i class="fas fa-underline"></i> Underline</button>
                            <button class="editor-btn" onclick="saveNote(${noteId})"><i class="fas fa-save"></i> Save</button>
                        </div>
                        <div class="editor-content" id="noteContent-${noteId}" contenteditable="true">${note.content}</div>
                    </div>
                </div>
            `;
            
            document.getElementById('desktop').appendChild(windowElement);
            windows.push({ id: windowId, app: 'note', minimized: false, maximized: false });
            
            setActiveWindow(windowId);
            updateTaskbar();
        }

        function saveNote(noteId) {
            const note = notes.find(n => n.id === noteId);
            const contentElement = document.getElementById(`noteContent-${noteId}`);
            
            if (note && contentElement) {
                note.content = contentElement.innerHTML;
                note.date = new Date().toISOString();
                saveNotes();
                showNotification('Note Saved', 'Your note has been saved');
            }
        }

        function deleteNote(noteId) {
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(n => n.id !== noteId);
                saveNotes();
                renderNotes();
                showNotification('Note Deleted', 'Note has been removed');
            }
        }

        function closeNoteWindow(windowId, noteId) {
            saveNote(noteId);
            closeWindow(windowId);
        }

        function saveNotes() {
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
        }

        // System Monitor Functions
        function updateSystemMonitor() {
            // Simulate CPU usage
            const cpuValue = Math.floor(Math.random() * 30) + 30; // 30-60%
            document.getElementById('cpuValue').textContent = `${cpuValue}%`;
            document.getElementById('cpuProgress').style.width = `${cpuValue}%`;
            
            // Simulate Memory usage
            const memoryValue = Math.floor(Math.random() * 20) + 50; // 50-70%
            document.getElementById('memoryValue').textContent = `${memoryValue}%`;
            document.getElementById('memoryProgress').style.width = `${memoryValue}%`;
            
            // Simulate Disk usage
            const diskValue = Math.floor(Math.random() * 10) + 35; // 35-45%
            document.getElementById('diskValue').textContent = `${diskValue}%`;
            document.getElementById('diskProgress').style.width = `${diskValue}%`;
            
            // Simulate Network activity
            const networkValue = (Math.random() * 3 + 0.5).toFixed(1); // 0.5-3.5 MB/s
            document.getElementById('networkValue').textContent = `${networkValue} MB/s`;
        }

        // Puzzle Game Functions
        let puzzleState = [];
        let emptyPosition = 15;
        let puzzleMoves = 0;

        function initPuzzleGame() {
            resetPuzzle();
        }

        function resetPuzzle() {
            puzzleState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
            emptyPosition = 15;
            puzzleMoves = 0;
            updatePuzzleMoves();
            renderPuzzle();
        }

        function shufflePuzzle() {
            // Perform random valid moves to shuffle
            for (let i = 0; i < 100; i++) {
                const validMoves = getValidPuzzleMoves();
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                movePuzzlePiece(randomMove, false);
            }
            puzzleMoves = 0;
            updatePuzzleMoves();
            renderPuzzle();
            showNotification('Puzzle Shuffled', 'Good luck!');
        }

        function getValidPuzzleMoves() {
            const validMoves = [];
            const row = Math.floor(emptyPosition / 4);
            const col = emptyPosition % 4;
            
            // Up
            if (row > 0) validMoves.push(emptyPosition - 4);
            // Down
            if (row < 3) validMoves.push(emptyPosition + 4);
            // Left
            if (col > 0) validMoves.push(emptyPosition - 1);
            // Right
            if (col < 3) validMoves.push(emptyPosition + 1);
            
            return validMoves;
        }

        function movePuzzlePiece(position, countMove = true) {
            if (countMove) puzzleMoves++;
            
            // Swap the piece with the empty position
            [puzzleState[position], puzzleState[emptyPosition]] = [puzzleState[emptyPosition], puzzleState[position]];
            emptyPosition = position;
            
            if (countMove) {
                updatePuzzleMoves();
                checkPuzzleWin();
            }
        }

        function renderPuzzle() {
            const puzzleBoard = document.getElementById('puzzleBoard');
            if (!puzzleBoard) return;
            
            puzzleBoard.innerHTML = '';
            
            puzzleState.forEach((value, index) => {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                
                if (value === 0) {
                    piece.classList.add('empty');
                } else {
                    piece.textContent = value;
                    piece.onclick = () => {
                        if (isAdjacentToEmpty(index)) {
                            movePuzzlePiece(index);
                            renderPuzzle();
                        }
                    };
                }
                
                puzzleBoard.appendChild(piece);
            });
        }

        function isAdjacentToEmpty(position) {
            const row = Math.floor(position / 4);
            const col = position % 4;
            const emptyRow = Math.floor(emptyPosition / 4);
            const emptyCol = emptyPosition % 4;
            
            // Check if positions are adjacent
            return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                   (Math.abs(col - emptyCol) === 1 && row === emptyRow);
        }

        function updatePuzzleMoves() {
            const movesElement = document.getElementById('puzzleMoves');
            if (movesElement) movesElement.textContent = puzzleMoves;
        }

        function checkPuzzleWin() {
            // Check if puzzle is solved
            for (let i = 0; i < 15; i++) {
                if (puzzleState[i] !== i + 1) return;
            }
            
            if (puzzleState[15] !== 0) return;
            
            // Puzzle is solved
            showNotification('Puzzle Solved!', `Congratulations! You solved the puzzle in ${puzzleMoves} moves.`);
        }

        // Memory Game Functions
        let memoryCards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let memoryScore = 0;
        let canFlip = true;

        function initMemoryGame() {
            resetMemoryGame();
        }

        function resetMemoryGame() {
            // Create pairs of cards
            const symbols = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍉', '🥝'];
            memoryCards = [...symbols, ...symbols];
            
            // Shuffle cards
            for (let i = memoryCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [memoryCards[i], memoryCards[j]] = [memoryCards[j], memoryCards[i]];
            }
            
            flippedCards = [];
            matchedPairs = 0;
            memoryScore = 0;
            canFlip = true;
            
            updateMemoryScore();
            renderMemoryGame();
        }

        function renderMemoryGame() {
            const memoryBoard = document.getElementById('memoryBoard');
            if (!memoryBoard) return;
            
            memoryBoard.innerHTML = '';
            
            memoryCards.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.index = index;
                card.dataset.symbol = symbol;
                
                card.innerHTML = `
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                `;
                
                card.onclick = () => flipMemoryCard(index);
                
                memoryBoard.appendChild(card);
            });
        }

        function flipMemoryCard(index) {
            if (!canFlip) return;
            
            const card = document.querySelector(`.memory-card[data-index="${index}"]`);
            if (!card || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            
            card.classList.add('flipped');
            flippedCards.push(index);
            
            if (flippedCards.length === 2) {
                canFlip = false;
                checkMemoryMatch();
            }
        }

        function checkMemoryMatch() {
            const [index1, index2] = flippedCards;
            const card1 = document.querySelector(`.memory-card[data-index="${index1}"]`);
            const card2 = document.querySelector(`.memory-card[data-index="${index2}"]`);
            
            if (card1.dataset.symbol === card2.dataset.symbol) {
                // Match found
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                memoryScore += 10;
                updateMemoryScore();
                
                if (matchedPairs === memoryCards.length / 2) {
                    showNotification('Memory Game Won!', `Congratulations! Your score: ${memoryScore}`);
                }
            } else {
                // No match
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                }, 1000);
            }
            
            flippedCards = [];
            canFlip = true;
        }

        function updateMemoryScore() {
            const scoreElement = document.getElementById('memoryScore');
            if (scoreElement) scoreElement.textContent = memoryScore;
        }

        // Image Viewer Functions
        let imageRotation = 0;
        let imageZoom = 1;

        function zoomImage(direction) {
            const imageDisplay = document.getElementById('imageDisplay');
            if (!imageDisplay) return;
            
            if (direction === 'in') {
                imageZoom = Math.min(imageZoom * 1.2, 3);
            } else {
                imageZoom = Math.max(imageZoom / 1.2, 0.5);
            }
            
            imageDisplay.style.transform = `scale(${imageZoom}) rotate(${imageRotation}deg)`;
        }

        function rotateImage() {
            const imageDisplay = document.getElementById('imageDisplay');
            if (!imageDisplay) return;
            
            imageRotation = (imageRotation + 90) % 360;
            imageDisplay.style.transform = `scale(${imageZoom}) rotate(${imageRotation}deg)`;
        }

        function resetImage() {
            const imageDisplay = document.getElementById('imageDisplay');
            if (!imageDisplay) return;
            
            imageRotation = 0;
            imageZoom = 1;
            imageDisplay.style.transform = `scale(${imageZoom}) rotate(${imageRotation}deg)`;
        }

        function loadImageFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDisplay = document.getElementById('imageDisplay');
                if (imageDisplay) {
                    imageDisplay.src = e.target.result;
                    document.getElementById('imageName').textContent = file.name;
                    
                    // Get image dimensions
                    imageDisplay.onload = function() {
                        document.getElementById('imageSize').textContent = `${this.naturalWidth} x ${this.naturalHeight}`;
                    };
                    
                    resetImage();
                }
            };
            reader.readAsDataURL(file);
        }

        // Weather Functions
        function updateWeather() {
            // Simulate weather data
            const weatherConditions = [
                { icon: 'fa-sun', desc: 'Sunny', temp: 72, feels: 75, humidity: 45, wind: 8 },
                { icon: 'fa-cloud-sun', desc: 'Partly Cloudy', temp: 68, feels: 70, humidity: 55, wind: 6 },
                { icon: 'fa-cloud', desc: 'Cloudy', temp: 65, feels: 66, humidity: 60, wind: 5 },
                { icon: 'fa-cloud-rain', desc: 'Rainy', temp: 60, feels: 58, humidity: 80, wind: 10 },
                { icon: 'fa-snowflake', desc: 'Snowy', temp: 32, feels: 28, humidity: 70, wind: 12 }
            ];
            
            const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
            
            document.getElementById('weatherLocation').textContent = 'New York, USA';
            
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const date = now.getDate();
            const year = now.getFullYear();
            
            document.getElementById('weatherDate').textContent = `${dayName}, ${monthName} ${date}, ${year}`;
            
            document.querySelector('.weather-icon').innerHTML = `<i class="fas ${randomWeather.icon}"></i>`;
            document.getElementById('weatherTemp').textContent = `${randomWeather.temp}°F`;
            document.getElementById('weatherDesc').textContent = randomWeather.desc;
            document.getElementById('feelsLike').textContent = `${randomWeather.feels}°F`;
            document.getElementById('humidity').textContent = `${randomWeather.humidity}%`;
            document.getElementById('windSpeed').textContent = `${randomWeather.wind} mph`;
        }

        // Clock App Functions
        function updateClockApp() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            // Update digital clock
            const displayHours = hours % 12 || 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            document.getElementById('digitalClock').textContent = 
                `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
            
            // Update date
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const date = now.getDate();
            const year = now.getFullYear();
            
            document.getElementById('clockDate').textContent = `${dayName}, ${monthName} ${date}, ${year}`;
            
            // Update analog clock
            const hourDeg = (hours % 12) * 30 + minutes * 0.5;
            const minuteDeg = minutes * 6 + seconds * 0.1;
            const secondDeg = seconds * 6;
            
            document.getElementById('hourHand').style.transform = `rotate(${hourDeg}deg)`;
            document.getElementById('minuteHand').style.transform = `rotate(${minuteDeg}deg)`;
            document.getElementById('secondHand').style.transform = `rotate(${secondDeg}deg)`;
        }

        // File Explorer Functions
        let uploadedFiles = [];

        function handleFileUpload(event) {
            const files = event.target.files;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const fileData = {
                        id: Date.now() + i,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    };
                    
                    uploadedFiles.push(fileData);
                    saveUploadedFiles();
                    renderFileGrid();
                    showNotification('File Uploaded', `${file.name} has been uploaded`);
                };
                
                reader.readAsDataURL(file);
            }
        }

        function renderFileGrid() {
            const fileGrid = document.getElementById('fileGrid');
            if (!fileGrid) return;
            
            fileGrid.innerHTML = '';
            
            if (uploadedFiles.length === 0) {
                fileGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gray-600);">No files uploaded yet. Click the Upload button to add files.</div>';
                return;
            }
            
            uploadedFiles.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                let icon = '<i class="fas fa-file"></i>';
                
                if (file.type.startsWith('image/')) {
                    icon = '<i class="fas fa-image"></i>';
                } else if (file.type.startsWith('video/')) {
                    icon = '<i class="fas fa-video"></i>';
                } else if (file.type.startsWith('audio/')) {
                    icon = '<i class="fas fa-music"></i>';
                } else if (file.type.includes('pdf')) {
                    icon = '<i class="fas fa-file-pdf"></i>';
                } else if (file.type.includes('word') || file.type.includes('document')) {
                    icon = '<i class="fas fa-file-word"></i>';
                } else if (file.type.includes('sheet') || file.type.includes('excel')) {
                    icon = '<i class="fas fa-file-excel"></i>';
                } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
                    icon = '<i class="fas fa-file-powerpoint"></i>';
                } else if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) {
                    icon = '<i class="fas fa-file-archive"></i>';
                } else if (file.type.includes('text')) {
                    icon = '<i class="fas fa-file-alt"></i>';
                }
                
                fileItem.innerHTML = `
                    <div class="file-icon">${icon}</div>
                    <div class="file-name">${file.name}</div>
                    <button class="file-delete" onclick="deleteFile(${file.id})"><i class="fas fa-times"></i></button>
                `;
                
                fileItem.onclick = function(e) {
                    if (!e.target.classList.contains('file-delete') && !e.target.parentElement.classList.contains('file-delete')) {
                        openFile(file);
                    }
                };
                
                fileGrid.appendChild(fileItem);
            });
        }

        function openFile(file) {
            if (file.type.startsWith('image/')) {
                // Open image in image viewer
                openApp('imageViewer');
                setTimeout(() => {
                    const imageDisplay = document.getElementById('imageDisplay');
                    if (imageDisplay) {
                        imageDisplay.src = file.data;
                        document.getElementById('imageName').textContent = file.name;
                        
                        // Get image dimensions
                        imageDisplay.onload = function() {
                            document.getElementById('imageSize').textContent = `${this.naturalWidth} x ${this.naturalHeight}`;
                        };
                        
                        resetImage();
                    }
                }, 500);
            } else if (file.type.startsWith('text/')) {
                // Open text file in text editor
                openApp('textEditor');
                setTimeout(() => {
                    const editor = document.getElementById('editorContent');
                    if (editor) {
                        // Decode base64 for text files
                        const text = atob(file.data.split(',')[1]);
                        editor.textContent = text;
                    }
                }, 500);
            } else {
                // Download other file types
                const a = document.createElement('a');
                a.href = file.data;
                a.download = file.name;
                a.click();
                showNotification('File Downloaded', `${file.name} has been downloaded`);
            }
        }

        function deleteFile(fileId) {
            uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
            saveUploadedFiles();
            renderFileGrid();
            showNotification('File Deleted', 'File has been removed');
        }

        function saveUploadedFiles() {
            // Save file metadata (not the actual data to save space)
            const fileMetadata = uploadedFiles.map(file => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size
            }));
            localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(fileMetadata));
        }

        function loadUploadedFiles() {
            // Load file metadata from LocalStorage
            const fileMetadata = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES) || '[]');
            
            // For demo purposes, we'll just show the metadata
            // In a real implementation, you'd need a server to store the actual files
            uploadedFiles = fileMetadata;
            renderFileGrid();
        }

        // LocalStorage Functions
        function saveWindowStates() {
            const states = windows.map(w => ({
                app: w.app,
                minimized: w.minimized,
                maximized: w.maximized,
                snappedLeft: w.snappedLeft || false,
                snappedRight: w.snappedRight || false,
                position: {
                    top: document.getElementById(w.id)?.style.top,
                    left: document.getElementById(w.id)?.style.left
                }
            }));
            localStorage.setItem(STORAGE_KEYS.WINDOW_STATES, JSON.stringify(states));
        }

        function restoreWindowStates() {
            const states = JSON.parse(localStorage.getItem(STORAGE_KEYS.WINDOW_STATES) || '[]');
            // For now, we won't auto-restore windows on boot to keep it clean
            // Users can manually open apps they need
        }

        // Event Listeners
        document.addEventListener('DOMContentLoaded', () => {
            bootSystem();
        });

        // Click outside to close start menu
        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('startMenuPanel');
            const startButton = document.querySelector('.start-menu');
            
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.classList.remove('show');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const startMenu = document.getElementById('startMenuPanel');
                startMenu.classList.remove('show');
            }
            
            // Alt + Tab to switch windows
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                const openWindows = windows.filter(w => !w.minimized);
                if (openWindows.length > 1) {
                    const currentIndex = openWindows.findIndex(w => w.id === activeWindow);
                    const nextIndex = (currentIndex + 1) % openWindows.length;
                    setActiveWindow(openWindows[nextIndex].id);
                }
            }
            
            // Win + L to lock screen
            if (e.metaKey && e.key === 'l') {
                e.preventDefault();
                toggleLockScreen();
            }
        });

        // Auto-save text editor content
        setInterval(() => {
            const editor = document.getElementById('editorContent');
            if (editor && editor.innerHTML) {
                localStorage.setItem(STORAGE_KEYS.TEXT_EDITOR_CONTENT, editor.innerHTML);
            }
        }, 5000);

        // Handle lock screen password input
        document.addEventListener('keydown', (e) => {
            if (isLocked && e.key === 'Enter' && document.activeElement.id === '12345') {
                unlockScreen();
            }
        });
