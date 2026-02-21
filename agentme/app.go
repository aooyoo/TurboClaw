package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	picoclaw    *PicoclawManager
	chatManager *ChatManager
	config      *Config
}

// PicoclawManager manages the picoclaw binary execution
type PicoclawManager struct {
	binaryPath string
	cmd        *exec.Cmd
	running    bool
	mu         sync.Mutex
}

// NewPicoclawManager creates a new PicoclawManager
func NewPicoclawManager() *PicoclawManager {
	return &PicoclawManager{}
}

// FindBinary finds the picoclaw binary in common locations
func (p *PicoclawManager) FindBinary() (string, error) {
	// 1. Check same directory as the executable (Contents/MacOS/ in .app bundle)
	execPath, _ := os.Executable()
	execDir := filepath.Dir(execPath)
	bundledPath := filepath.Join(execDir, "picoclaw")
	if _, err := os.Stat(bundledPath); err == nil {
		return bundledPath, nil
	}

	// 2. Check Contents/Resources/ in .app bundle (macOS)
	resourcesPath := filepath.Join(execDir, "..", "Resources", "picoclaw")
	if _, err := os.Stat(resourcesPath); err == nil {
		return resourcesPath, nil
	}

	// 3. Check ~/.turboclaw/bin/
	homeDir, _ := os.UserHomeDir()
	homeBinPath := filepath.Join(homeDir, ".turboclaw", "bin", "picoclaw")
	if _, err := os.Stat(homeBinPath); err == nil {
		return homeBinPath, nil
	}

	// 4. Fallback to other common paths
	possiblePaths := []string{
		"./picoclaw",
		"/usr/local/bin/picoclaw",
		"/opt/picoclaw/bin/picoclaw",
		filepath.Join(filepath.Dir(os.Args[0]), "picoclaw"),
	}

	for _, path := range possiblePaths {
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
	}
	return "", fmt.Errorf("picoclaw binary not found")
}

// Execute executes a picoclaw command
func (p *PicoclawManager) Execute(args ...string) (string, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	binaryPath, err := p.FindBinary()
	if err != nil {
		return "", err
	}

	cmd := exec.Command(binaryPath, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return string(output), err
	}
	return string(output), nil
}

// StartGateway starts the picoclaw gateway
func (p *PicoclawManager) StartGateway() error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.running {
		return fmt.Errorf("gateway already running")
	}

	binaryPath, err := p.FindBinary()
	if err != nil {
		return err
	}

	p.cmd = exec.Command(binaryPath, "gateway")
	p.cmd.Dir = p.GetConfigDir()
	p.cmd.Stdout = os.Stdout
	p.cmd.Stderr = os.Stderr

	if err := p.cmd.Start(); err != nil {
		return err
	}

	p.running = true
	return nil
}

// StopGateway stops the picoclaw gateway
func (p *PicoclawManager) StopGateway() error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if !p.running || p.cmd == nil {
		return nil
	}

	if err := p.cmd.Process.Kill(); err != nil {
		return err
	}

	p.running = false
	p.cmd = nil
	return nil
}

// GetConfigDir returns the picoclaw config directory
func (p *PicoclawManager) GetConfigDir() string {
	homeDir, _ := os.UserHomeDir()
	configDir := filepath.Join(homeDir, ".picoclaw")
	return configDir
}

// GetWorkspaceDir returns the picoclaw workspace directory
func (p *PicoclawManager) GetWorkspaceDir() string {
	homeDir, _ := os.UserHomeDir()
	workspaceDir := filepath.Join(homeDir, ".picoclaw", "workspace")
	return workspaceDir
}

// IsRunning checks if the gateway is running
func (p *PicoclawManager) IsRunning() bool {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.running
}

// ChatManager manages chat sessions
type ChatManager struct {
	sessions    map[string]*ChatSession
	currentSessionID string
	mu          sync.RWMutex
	sessionsDir string
}

// ChatSession represents a chat session
type ChatSession struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Messages  []Message `json:"messages"`
}

// Message represents a chat message
type Message struct {
	ID        string `json:"id"`
	Role      string `json:"role"` // "user" or "assistant"
	Content   string `json:"content"`
	Files     []string `json:"files,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// NewChatManager creates a new ChatManager
func NewChatManager() *ChatManager {
	homeDir, _ := os.UserHomeDir()
	sessionsDir := filepath.Join(homeDir, ".turboclaw", "sessions")
	os.MkdirAll(sessionsDir, 0755)

	return &ChatManager{
		sessions:    make(map[string]*ChatSession),
		sessionsDir: sessionsDir,
	}
}

// CreateSession creates a new chat session
func (c *ChatManager) CreateSession(name string) (*ChatSession, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	sessionID := fmt.Sprintf("session_%d", time.Now().UnixNano())
	session := &ChatSession{
		ID:        sessionID,
		Name:      name,
		CreatedAt: time.Now(),
		Messages:  []Message{},
	}

	c.sessions[sessionID] = session
	c.currentSessionID = sessionID

	c.saveSession(session)
	return session, nil
}

// GetSession returns a session by ID
func (c *ChatManager) GetSession(id string) (*ChatSession, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if session, ok := c.sessions[id]; ok {
		return session, nil
	}
	return nil, fmt.Errorf("session not found")
}

// GetAllSessions returns all sessions sorted by creation time (newest first)
func (c *ChatManager) GetAllSessions() []*ChatSession {
	c.mu.RLock()
	defer c.mu.RUnlock()

	sessions := make([]*ChatSession, 0, len(c.sessions))
	for _, session := range c.sessions {
		sessions = append(sessions, session)
	}

	// Sort by creation time, newest first
	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].CreatedAt.After(sessions[j].CreatedAt)
	})

	return sessions
}

// DeleteSession deletes a session
func (c *ChatManager) DeleteSession(id string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.sessions[id]; !ok {
		return fmt.Errorf("session not found")
	}

	delete(c.sessions, id)
	if c.currentSessionID == id {
		c.currentSessionID = ""
	}

	// Delete file
	sessionFile := filepath.Join(c.sessionsDir, id+".json")
	os.Remove(sessionFile)

	return nil
}

// SetCurrentSession sets the current session
func (c *ChatManager) SetCurrentSession(id string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.sessions[id]; !ok {
		return fmt.Errorf("session not found")
	}

	c.currentSessionID = id
	return nil
}

// GetCurrentSession returns the current session
func (c *ChatManager) GetCurrentSession() (*ChatSession, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if c.currentSessionID == "" {
		return nil, fmt.Errorf("no current session")
	}

	if session, ok := c.sessions[c.currentSessionID]; ok {
		return session, nil
	}
	return nil, fmt.Errorf("current session not found")
}

// AddMessage adds a message to the current session
func (c *ChatManager) AddMessage(role, content string, files []string) (*Message, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.currentSessionID == "" {
		return nil, fmt.Errorf("no current session")
	}

	session, ok := c.sessions[c.currentSessionID]
	if !ok {
		return nil, fmt.Errorf("current session not found")
	}

	message := Message{
		ID:        fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		Role:      role,
		Content:   content,
		Files:     files,
		Timestamp: time.Now().Unix(),
	}

	session.Messages = append(session.Messages, message)

	// Auto-generate session title from first user message
	if role == "user" && (session.Name == "" || strings.HasPrefix(session.Name, "对话 ")) {
		title := content
		// Remove newlines
		title = strings.ReplaceAll(title, "\n", " ")
		title = strings.TrimSpace(title)
		if len([]rune(title)) > 20 {
			title = string([]rune(title)[:20]) + "..."
		}
		if title != "" {
			session.Name = title
		}
	}

	c.saveSession(session)

	return &message, nil
}

// saveSession saves a session to disk
func (c *ChatManager) saveSession(session *ChatSession) error {
	sessionFile := filepath.Join(c.sessionsDir, session.ID+".json")
	data, err := json.MarshalIndent(session, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(sessionFile, data, 0644)
}

// LoadSessions loads all sessions from disk
func (c *ChatManager) LoadSessions() error {
	entries, err := os.ReadDir(c.sessionsDir)
	if err != nil {
		if os.IsNotExist(err) {
			os.MkdirAll(c.sessionsDir, 0755)
			return nil
		}
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		sessionFile := filepath.Join(c.sessionsDir, entry.Name())
		data, err := os.ReadFile(sessionFile)
		if err != nil {
			continue
		}

		var session ChatSession
		if err := json.Unmarshal(data, &session); err != nil {
			continue
		}

		c.sessions[session.ID] = &session
	}

	return nil
}

// Config represents the application configuration
type Config struct {
	TelegramBotToken string            `json:"telegram_bot_token"`
	ModelProvider   string            `json:"model_provider"`
	ModelAPIKey      string            `json:"model_api_key"`
	ModelName        string            `json:"model_name"`
	BaseURL          string            `json:"base_url"`
	ExtraSettings    map[string]string `json:"extra_settings"`
}

// NewConfig creates a new default config
func NewConfig() *Config {
	return &Config{
		ModelProvider:   "openclaw",
		ModelName:       "gpt-4o-mini",
		ExtraSettings:   make(map[string]string),
	}
}

// LoadConfig loads config from file
func LoadConfig() (*Config, error) {
	homeDir, _ := os.UserHomeDir()
	configDir := filepath.Join(homeDir, ".turboclaw")
	configFile := filepath.Join(configDir, "config.json")

	data, err := os.ReadFile(configFile)
	if err != nil {
		if os.IsNotExist(err) {
			os.MkdirAll(configDir, 0755)
			config := NewConfig()
			SaveConfig(config)
			return config, nil
		}
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	if config.ExtraSettings == nil {
		config.ExtraSettings = make(map[string]string)
	}

	return &config, nil
}

// SaveConfig saves config to file
func SaveConfig(config *Config) error {
	homeDir, _ := os.UserHomeDir()
	configDir := filepath.Join(homeDir, ".turboclaw")
	configFile := filepath.Join(configDir, "config.json")

	os.MkdirAll(configDir, 0755)

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configFile, data, 0644)
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.picoclaw = NewPicoclawManager()
	a.chatManager = NewChatManager()

	// Load config
	config, err := LoadConfig()
	if err != nil {
		config = NewConfig()
	}
	a.config = config

	// Load existing sessions
	a.chatManager.LoadSessions()
}

// GetConfig returns the current configuration
func (a *App) GetConfig() *Config {
	return a.config
}

// SaveConfig saves the configuration
func (a *App) SaveConfig(config *Config) error {
	a.config = config
	return SaveConfig(config)
}

// GetSessions returns all chat sessions
func (a *App) GetSessions() []*ChatSession {
	return a.chatManager.GetAllSessions()
}

// CreateSession creates a new chat session
func (a *App) CreateSession(name string) (*ChatSession, error) {
	return a.chatManager.CreateSession(name)
}

// GetSession returns a session by ID
func (a *App) GetSession(id string) (*ChatSession, error) {
	return a.chatManager.GetSession(id)
}

// DeleteSession deletes a session
func (a *App) DeleteSession(id string) error {
	return a.chatManager.DeleteSession(id)
}

// SetCurrentSession sets the current session
func (a *App) SetCurrentSession(id string) error {
	return a.chatManager.SetCurrentSession(id)
}

// GetCurrentSession returns the current session
func (a *App) GetCurrentSession() (*ChatSession, error) {
	return a.chatManager.GetCurrentSession()
}

// SendMessage adds a user message to the current session and returns immediately
func (a *App) SendMessage(content string, files []string) (*ChatSession, error) {
	// Add user message only
	_, err := a.chatManager.AddMessage("user", content, files)
	if err != nil {
		return nil, err
	}

	return a.chatManager.GetCurrentSession()
}

// extractCleanResponse extracts the actual AI response from picoclaw output,
// filtering out log lines, thinking/iteration metadata, and duplicate content.
// Picoclaw output typically contains:
//   1. Log lines (timestamped or prefixed with [INFO]/[DEBUG] etc.)
//   2. Thinking/intermediate output with metadata like {iterations=5, final_length=150, session_key=cli:default}
//   3. The final clean response
// This function returns only the final clean response.
func extractCleanResponse(output string) string {
	lines := strings.Split(output, "\n")

	// Pattern to match log lines
	logPattern := regexp.MustCompile(`^\d{4}[/-]\d{2}[/-]\d{2}|^\[INFO\]|^\[DEBUG\]|^\[WARN\]|^\[ERROR\]`)
	// Pattern to match metadata blocks like {iterations=5, final_length=150, session_key=cli:default}
	metadataPattern := regexp.MustCompile(`\{[a-z_]+=\S+.*\}`)
	// Pattern to match "... {session_key=..., iterations=...}" at end of line
	metadataInlinePattern := regexp.MustCompile(`\s*\{[^{}]*(?:iterations|final_length|session_key)[^{}]*\}\s*$`)

	// Step 1: Filter out log lines, collect non-log lines
	var nonLogLines []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if logPattern.MatchString(trimmed) {
			continue
		}
		nonLogLines = append(nonLogLines, trimmed)
	}

	if len(nonLogLines) == 0 {
		return "未收到响应，请检查配置。"
	}

	// Step 2: Find the last line containing metadata marker — everything after it is the final response
	lastMetadataIdx := -1
	for i, line := range nonLogLines {
		if metadataPattern.MatchString(line) {
			lastMetadataIdx = i
		}
	}

	var resultLines []string
	if lastMetadataIdx >= 0 && lastMetadataIdx < len(nonLogLines)-1 {
		// Take only lines after the last metadata line
		resultLines = nonLogLines[lastMetadataIdx+1:]
	} else if lastMetadataIdx == len(nonLogLines)-1 {
		// Metadata is on the very last line — strip metadata from that line and use preceding lines
		// But also try to clean the metadata from the last line
		cleanedLast := metadataInlinePattern.ReplaceAllString(nonLogLines[lastMetadataIdx], "")
		cleanedLast = strings.TrimSpace(cleanedLast)
		if lastMetadataIdx > 0 {
			// Use preceding lines (they are the response before the metadata summary)
			resultLines = nonLogLines[:lastMetadataIdx]
			if cleanedLast != "" {
				// Check if cleaned last line duplicates content already in resultLines
				joined := strings.Join(resultLines, "\n")
				if !strings.Contains(joined, cleanedLast) {
					resultLines = append(resultLines, cleanedLast)
				}
			}
		} else if cleanedLast != "" {
			resultLines = []string{cleanedLast}
		}
	} else {
		// No metadata found — use all non-log lines
		resultLines = nonLogLines
	}

	// Step 3: Clean any remaining inline metadata from result lines
	var finalLines []string
	for _, line := range resultLines {
		cleaned := metadataInlinePattern.ReplaceAllString(line, "")
		cleaned = strings.TrimSpace(cleaned)
		if cleaned != "" {
			finalLines = append(finalLines, cleaned)
		}
	}

	if len(finalLines) > 0 {
		return strings.Join(finalLines, "\n")
	}

	return "未收到响应，请检查配置。"
}

// GetAIResponse calls picoclaw to get AI response for the given content,
// then adds the response to the current session
func (a *App) GetAIResponse(content string) (*ChatSession, error) {
	var response string

	// Check if picoclaw is available
	binaryPath, _ := a.picoclaw.FindBinary()
	if binaryPath == "" {
		response = "PicoClaw 未安装。"
	} else {
		cmd := exec.Command(binaryPath, "agent", "-m", content)
		cmd.Dir = a.picoclaw.GetConfigDir()
		outputBytes, err := cmd.CombinedOutput()
		if err != nil {
			response = fmt.Sprintf("PicoClaw 执行失败: %v\n\n%s", err, string(outputBytes))
		} else if len(outputBytes) == 0 {
			response = "未收到响应，请检查配置。"
		} else {
			// Filter out log lines and extract clean response
			response = extractCleanResponse(string(outputBytes))
		}
	}

	a.chatManager.AddMessage("assistant", response, nil)

	return a.chatManager.GetCurrentSession()
}

// GetPicoclawStatus returns the status of picoclaw
func (a *App) GetPicoclawStatus() map[string]interface{} {
	binaryPath, _ := a.picoclaw.FindBinary()
	return map[string]interface{}{
		"installed": binaryPath != "",
		"running":   a.picoclaw.IsRunning(),
		"configDir":  a.picoclaw.GetConfigDir(),
		"workspace":  a.picoclaw.GetWorkspaceDir(),
	}
}

// ExecutePicoclawCommand executes a picoclaw command
func (a *App) ExecutePicoclawCommand(command string, args ...string) (string, error) {
	fullArgs := append([]string{command}, args...)
	return a.picoclaw.Execute(fullArgs...)
}

// Onboard initializes picoclaw configuration
func (a *App) Onboard(telegramToken string) (string, error) {
	return a.picoclaw.Execute("onboard", telegramToken)
}

// GetSkills returns available skills
func (a *App) GetSkills() ([]map[string]interface{}, error) {
	output, err := a.picoclaw.Execute("skills", "list")
	if err != nil {
		return nil, err
	}

	// Parse output (simplified)
	var skills []map[string]interface{}
	json.Unmarshal([]byte(output), &skills)

	return skills, nil
}

// InstallSkill installs a skill
func (a *App) InstallSkill(skillName string) (string, error) {
	return a.picoclaw.Execute("skills", "install", skillName)
}

// SelectFile opens a file picker
func (a *App) SelectFile() (string, error) {
	result, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
	})
	return result, err
}

// SelectFiles opens a multi-file picker
func (a *App) SelectFiles() ([]string, error) {
	result, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
	})
	return result, err
}

// CopyToClipboard copies text to clipboard
func (a *App) CopyToClipboard(text string) error {
	return runtime.ClipboardSetText(a.ctx, text)
}

// GetPlatformInfo returns platform information
func (a *App) GetPlatformInfo() map[string]string {
	return map[string]string{
		"os":      runtime.Environment(a.ctx).Platform,
		"arch":    runtime.Environment(a.ctx).Arch,
		"version": "1.0.0",
	}
}

// OpenURL opens a URL in the default browser
func (a *App) OpenURL(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// MinimizeWindow minimizes the window
func (a *App) MinimizeWindow() {
	runtime.WindowMinimise(a.ctx)
}

// MaximizeWindow maximizes the window
func (a *App) MaximizeWindow() {
	if runtime.WindowIsMaximised(a.ctx) {
		runtime.WindowUnmaximise(a.ctx)
	} else {
		runtime.WindowMaximise(a.ctx)
	}
}

// CloseWindow closes the window
func (a *App) CloseWindow() {
	runtime.Quit(a.ctx)
}
