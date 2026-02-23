package main

import (
	"context"
	_ "embed"
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

//go:embed default_config.json
var defaultConfigJSON []byte

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
		ModelProvider:   "zhipu",
		ModelName:       "glm-4.7-flash",
		ExtraSettings:   make(map[string]string),
	}
}

// LoadConfig loads config from picoclaw config.json
func LoadConfig() (*Config, error) {
	homeDir, _ := os.UserHomeDir()
	configFile := filepath.Join(homeDir, ".picoclaw", "config.json")

	data, err := os.ReadFile(configFile)
	if err != nil {
		if os.IsNotExist(err) {
			return NewConfig(), nil
		}
		return nil, err
	}

	var fullConfig map[string]interface{}
	if err := json.Unmarshal(data, &fullConfig); err != nil {
		return nil, err
	}

	config := NewConfig()

	if agents, ok := fullConfig["agents"].(map[string]interface{}); ok {
		if defaults, ok := agents["defaults"].(map[string]interface{}); ok {
			if provider, ok := defaults["provider"].(string); ok {
				config.ModelProvider = provider
			}
			if model, ok := defaults["model"].(string); ok {
				config.ModelName = model
			}
		}
	}

	if providers, ok := fullConfig["providers"].(map[string]interface{}); ok {
		if providerCfg, ok := providers[config.ModelProvider].(map[string]interface{}); ok {
			if apiKey, ok := providerCfg["api_key"].(string); ok {
				config.ModelAPIKey = apiKey
			}
			if apiBase, ok := providerCfg["api_base"].(string); ok {
				config.BaseURL = apiBase
			}
		}
	}

	return config, nil
}

// SaveConfig saves config to picoclaw config.json
func SaveConfig(config *Config) error {
	homeDir, _ := os.UserHomeDir()
	configDir := filepath.Join(homeDir, ".picoclaw")
	configFile := filepath.Join(configDir, "config.json")

	os.MkdirAll(configDir, 0755)

	data, err := os.ReadFile(configFile)
	var fullConfig map[string]interface{}
	if err == nil {
		json.Unmarshal(data, &fullConfig)
	}
	if fullConfig == nil {
		fullConfig = make(map[string]interface{})
	}

	// Update agents.defaults
	agents, ok := fullConfig["agents"].(map[string]interface{})
	if !ok {
		agents = make(map[string]interface{})
		fullConfig["agents"] = agents
	}
	defaults, ok := agents["defaults"].(map[string]interface{})
	if !ok {
		defaults = make(map[string]interface{})
		agents["defaults"] = defaults
	}
	defaults["provider"] = config.ModelProvider
	defaults["model"] = config.ModelName

	// Update providers
	providers, ok := fullConfig["providers"].(map[string]interface{})
	if !ok {
		providers = make(map[string]interface{})
		fullConfig["providers"] = providers
	}
	providerCfg, ok := providers[config.ModelProvider].(map[string]interface{})
	if !ok {
		providerCfg = make(map[string]interface{})
		providers[config.ModelProvider] = providerCfg
	}
	
	// Only set if not empty, or overwrite if needed. Here we overwrite to match UI intent.
	providerCfg["api_key"] = config.ModelAPIKey
	if config.BaseURL != "" {
		providerCfg["api_base"] = config.BaseURL
	}

	newData, err := json.MarshalIndent(fullConfig, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configFile, newData, 0644)
}

// GetChannelConfig reads channel configs from picoclaw's config.json
func (a *App) GetChannelConfig() map[string]interface{} {
	configPath := filepath.Join(a.picoclaw.GetConfigDir(), "config.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return map[string]interface{}{}
	}

	var fullConfig map[string]interface{}
	if err := json.Unmarshal(data, &fullConfig); err != nil {
		return map[string]interface{}{}
	}

	channels, ok := fullConfig["channels"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{}
	}
	return channels
}

// SaveChannelConfig writes channel configs to picoclaw's config.json
func (a *App) SaveChannelConfig(channels map[string]interface{}) error {
	configPath := filepath.Join(a.picoclaw.GetConfigDir(), "config.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	var fullConfig map[string]interface{}
	if err := json.Unmarshal(data, &fullConfig); err != nil {
		return err
	}

	fullConfig["channels"] = channels

	newData, err := json.MarshalIndent(fullConfig, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath, newData, 0644)
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

	// Auto-onboard: run picoclaw onboard if workspace doesn't exist yet
	a.autoOnboard()

	// Ensure picoclaw can access files outside workspace
	a.ensurePicoclawUnrestricted()

	// Request file access permissions on first launch
	a.requestStartupPermissions()

	// Load config
	config, err := LoadConfig()
	if err != nil {
		config = NewConfig()
	}
	a.config = config

	// Load existing sessions
	a.chatManager.LoadSessions()
}

// autoOnboard runs 'picoclaw onboard' for first-time users
// Skip if ~/.picoclaw/workspace already exists
func (a *App) autoOnboard() {
	homeDir, _ := os.UserHomeDir()
	workspaceDir := filepath.Join(homeDir, ".picoclaw", "workspace")

	// If workspace exists, user has already onboarded
	if _, err := os.Stat(workspaceDir); err == nil {
		return
	}

	// Find picoclaw binary
	binaryPath, err := a.picoclaw.FindBinary()
	if err != nil || binaryPath == "" {
		return
	}

	// Run onboard (non-interactive, auto-creates config + workspace)
	cmd := exec.Command(binaryPath, "onboard")
	cmd.Dir = homeDir
	cmd.Stdin = strings.NewReader("y\n") // Auto-confirm if config exists
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Auto-onboard warning: %v\n%s\n", err, string(output))
	} else {
		fmt.Printf("Auto-onboard completed: %s\n", string(output))
	}

	// Replace config with our default config template
	configPath := filepath.Join(homeDir, ".picoclaw", "config.json")
	if err := os.WriteFile(configPath, defaultConfigJSON, 0644); err != nil {
		fmt.Printf("Failed to write default config: %v\n", err)
	} else {
		fmt.Println("Default config installed to ~/.picoclaw/config.json")
	}
}

// ensurePicoclawUnrestricted sets restrict_to_workspace=false in picoclaw config
// so the agent can access and operate on files outside ~/.picoclaw/workspace
func (a *App) ensurePicoclawUnrestricted() {
	configPath := filepath.Join(a.picoclaw.GetConfigDir(), "config.json")

	data, err := os.ReadFile(configPath)
	if err != nil {
		return // No config file yet
	}

	var configMap map[string]interface{}
	if err := json.Unmarshal(data, &configMap); err != nil {
		return
	}

	// Navigate to agents.defaults.restrict_to_workspace
	agents, ok := configMap["agents"].(map[string]interface{})
	if !ok {
		return
	}
	defaults, ok := agents["defaults"].(map[string]interface{})
	if !ok {
		return
	}

	// Check if already false
	if restrict, ok := defaults["restrict_to_workspace"].(bool); ok && !restrict {
		return // Already unrestricted
	}

	// Set to false
	defaults["restrict_to_workspace"] = false

	// Write back
	newData, err := json.MarshalIndent(configMap, "", "  ")
	if err != nil {
		return
	}
	os.WriteFile(configPath, newData, 0644)
	fmt.Println("Picoclaw workspace restriction disabled.")
}

// PermissionStatus represents the status of a single permission
type PermissionStatus struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"` // "granted", "denied", "unknown"
}

// requestStartupPermissions checks permissions and prompts the user on first launch
func (a *App) requestStartupPermissions() {
	homeDir, _ := os.UserHomeDir()
	flagFile := filepath.Join(homeDir, ".turboclaw", "permissions_requested")

	// Only run on first launch
	if _, err := os.Stat(flagFile); err == nil {
		return
	}

	// Test file access by trying to read ~/Desktop
	desktopDir := filepath.Join(homeDir, "Desktop")
	_, err := os.ReadDir(desktopDir)
	if err != nil && os.IsPermission(err) {
		// TCC is blocking — show dialog and open settings
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "TurboClaw 需要文件访问权限",
			Message: "为了让 Agent 能够读取和分析您的本地文件，TurboClaw 需要「文件和文件夹」访问权限。\n\n点击确定后将打开系统设置，请在「隐私与安全性 → 文件和文件夹」中授予 TurboClaw 访问权限。",
		})
		exec.Command("open", "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders").Run()
	}

	// Mark as requested (create flag file)
	os.MkdirAll(filepath.Dir(flagFile), 0755)
	os.WriteFile(flagFile, []byte("1"), 0644)
}

// CheckPermissions returns the status of all permissions for the Settings UI
func (a *App) CheckPermissions() []PermissionStatus {
	homeDir, _ := os.UserHomeDir()

	permissions := []PermissionStatus{
		{ID: "files-folders", Name: "Files & Folders"},
		{ID: "desktop", Name: "Desktop"},
		{ID: "documents", Name: "Documents"},
		{ID: "downloads", Name: "Downloads"},
	}

	testDirs := map[string]string{
		"files-folders": filepath.Join(homeDir, "Desktop"), // General test
		"desktop":       filepath.Join(homeDir, "Desktop"),
		"documents":     filepath.Join(homeDir, "Documents"),
		"downloads":     filepath.Join(homeDir, "Downloads"),
	}

	for i, perm := range permissions {
		dir := testDirs[perm.ID]
		_, err := os.ReadDir(dir)
		if err == nil {
			permissions[i].Status = "granted"
		} else if os.IsPermission(err) {
			permissions[i].Status = "denied"
		} else {
			permissions[i].Status = "unknown"
		}
	}

	return permissions
}

// OpenPermissionSettings opens macOS System Settings to a specific privacy pane
func (a *App) OpenPermissionSettings(permID string) {
	urls := map[string]string{
		"files-folders": "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders",
		"desktop":       "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders",
		"documents":     "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders",
		"downloads":     "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders",
	}

	if url, ok := urls[permID]; ok {
		exec.Command("open", url).Run()
	}
}

// OpenLocalPath opens a local file or directory using the macOS 'open' command
func (a *App) OpenLocalPath(path string) error {
	// Clean the path
	cleanPath := filepath.Clean(path)
	
	// Ensure it exists
	if _, err := os.Stat(cleanPath); os.IsNotExist(err) {
		return fmt.Errorf("path does not exist: %s", cleanPath)
	}

	cmd := exec.Command("open", cleanPath)
	return cmd.Start()
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

// enrichMessageWithContext detects path/directory references in the message
// and pre-reads their content, since picoclaw may not have filesystem access.
func (a *App) enrichMessageWithContext(message string) string {
	homeDir, _ := os.UserHomeDir()

	// Map of keywords to directories
	dirKeywords := map[string]string{
		"桌面":         filepath.Join(homeDir, "Desktop"),
		"desktop":    filepath.Join(homeDir, "Desktop"),
		"文档":         filepath.Join(homeDir, "Documents"),
		"documents":  filepath.Join(homeDir, "Documents"),
		"下载":         filepath.Join(homeDir, "Downloads"),
		"downloads":  filepath.Join(homeDir, "Downloads"),
	}

	lowerMsg := strings.ToLower(message)
	var contextParts []string
	addedDirs := map[string]bool{}

	// Check for keyword matches
	for keyword, dirPath := range dirKeywords {
		if strings.Contains(lowerMsg, strings.ToLower(keyword)) {
			if addedDirs[dirPath] {
				continue
			}
			addedDirs[dirPath] = true

			entries, err := os.ReadDir(dirPath)
			if err != nil {
				contextParts = append(contextParts, fmt.Sprintf("[Directory: %s]\n(无法读取: %v)", dirPath, err))
				continue
			}

			var listing []string
			for _, entry := range entries {
				info, _ := entry.Info()
				if info != nil {
					sizeStr := fmt.Sprintf("%d bytes", info.Size())
					if info.IsDir() {
						sizeStr = "dir"
					}
					listing = append(listing, fmt.Sprintf("  %s  %s  %s", info.Mode(), sizeStr, entry.Name()))
				} else {
					listing = append(listing, "  "+entry.Name())
				}
			}
			contextParts = append(contextParts, fmt.Sprintf("[Directory: %s]\n%s", dirPath, strings.Join(listing, "\n")))
		}
	}

	// Also detect explicit absolute paths like /Users/xxx/... or ~/...
	pathRegex := regexp.MustCompile(`(?:^|\s)((?:/[\w.\-]+)+/?|~/[\w.\-/]+)`)
	matches := pathRegex.FindAllStringSubmatch(message, -1)
	for _, match := range matches {
		p := strings.TrimSpace(match[1])
		expanded := p
		if strings.HasPrefix(expanded, "~/") {
			expanded = filepath.Join(homeDir, expanded[2:])
		}

		if addedDirs[expanded] {
			continue
		}

		info, err := os.Stat(expanded)
		if err != nil {
			continue // Path doesn't exist, skip
		}

		addedDirs[expanded] = true

		if info.IsDir() {
			entries, err := os.ReadDir(expanded)
			if err != nil {
				contextParts = append(contextParts, fmt.Sprintf("[Directory: %s]\n(无法读取: %v)", expanded, err))
				continue
			}
			var listing []string
			for _, entry := range entries {
				eInfo, _ := entry.Info()
				if eInfo != nil {
					sizeStr := fmt.Sprintf("%d bytes", eInfo.Size())
					if eInfo.IsDir() {
						sizeStr = "dir"
					}
					listing = append(listing, fmt.Sprintf("  %s  %s  %s", eInfo.Mode(), sizeStr, entry.Name()))
				} else {
					listing = append(listing, "  "+entry.Name())
				}
			}
			contextParts = append(contextParts, fmt.Sprintf("[Directory: %s]\n%s", expanded, strings.Join(listing, "\n")))
		} else {
			// It's a file — read it if small enough
			if info.Size() <= 100*1024 {
				data, err := os.ReadFile(expanded)
				if err == nil {
					contextParts = append(contextParts, fmt.Sprintf("[File: %s]\n```\n%s\n```", expanded, string(data)))
				}
			}
		}
	}

	if len(contextParts) > 0 {
		return message + "\n\n--- 以下是系统预读取的本地文件/目录信息 ---\n\n" + strings.Join(contextParts, "\n\n")
	}
	return message
}

// GetAIResponse calls picoclaw to get AI response for the given content,
// then adds the response to the current session
func (a *App) GetAIResponse(content string, files []string) (*ChatSession, error) {
	var response string

	// Build the full message with file contents
	fullMessage := content
	if len(files) > 0 {
		for _, f := range files {
			data, err := os.ReadFile(f)
			if err != nil {
				fullMessage += fmt.Sprintf("\n\n[File: %s]\n(读取失败: %v)", f, err)
				continue
			}

			// Check if file is too large (>100KB) or binary
			if len(data) > 100*1024 {
				fullMessage += fmt.Sprintf("\n\n[File: %s]\n(文件过大，共 %d 字节，仅提供路径)", f, len(data))
				continue
			}

			// Simple binary detection: check for null bytes in first 512 bytes
			isBinary := false
			checkLen := len(data)
			if checkLen > 512 {
				checkLen = 512
			}
			for _, b := range data[:checkLen] {
				if b == 0 {
					isBinary = true
					break
				}
			}

			if isBinary {
				fullMessage += fmt.Sprintf("\n\n[File: %s]\n(二进制文件，共 %d 字节，仅提供路径)", f, len(data))
			} else {
				fullMessage += fmt.Sprintf("\n\n[File: %s]\n```\n%s\n```", f, string(data))
			}
		}
	}

	// Enrich message with local context: detect path references and pre-read them
	fullMessage = a.enrichMessageWithContext(fullMessage)

	// Check if picoclaw is available
	binaryPath, _ := a.picoclaw.FindBinary()
	if binaryPath == "" {
		response = "PicoClaw 未安装。"
	} else {
		cmd := exec.Command(binaryPath, "agent", "-m", fullMessage)
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

// CheckPathsInWorkspace checks which paths are outside the workspace
// Returns list of paths that are outside the workspace
func (a *App) CheckPathsInWorkspace(paths []string) []string {
	workspaceDir := a.picoclaw.GetWorkspaceDir()
	homeDir, _ := os.UserHomeDir()

	var outsidePaths []string
	for _, p := range paths {
		// Expand ~ prefix
		expanded := p
		if strings.HasPrefix(expanded, "~/") {
			expanded = filepath.Join(homeDir, expanded[2:])
		}

		// Clean and resolve the path
		absPath, err := filepath.Abs(expanded)
		if err != nil {
			continue
		}

		// Check if it's inside the workspace
		if !strings.HasPrefix(absPath, workspaceDir) {
			outsidePaths = append(outsidePaths, p)
		}
	}

	return outsidePaths
}

// RequestPathAuthorization checks if the app has actual file system access
// and prompts the user to grant permission if needed.
// Follows Clawdy's approach: test actual read, then open System Settings if blocked by TCC.
func (a *App) RequestPathAuthorization(paths []string) bool {
	if len(paths) == 0 {
		return true
	}

	// Step 1: Test actual file access for each path to detect TCC blocks
	var blockedPaths []string
	var accessiblePaths []string
	for _, p := range paths {
		expanded := p
		homeDir, _ := os.UserHomeDir()
		if strings.HasPrefix(expanded, "~/") {
			expanded = filepath.Join(homeDir, expanded[2:])
		}
		absPath, err := filepath.Abs(expanded)
		if err != nil {
			continue
		}

		// Try to stat the file/directory to see if TCC blocks us
		_, err = os.Stat(absPath)
		if err != nil {
			if os.IsPermission(err) {
				blockedPaths = append(blockedPaths, p)
			}
			// Other errors (file not found etc.) are fine — agent will handle
		} else {
			accessiblePaths = append(accessiblePaths, p)
		}
	}

	// Step 2: If TCC blocks any path, open System Settings
	if len(blockedPaths) > 0 {
		pathList := strings.Join(blockedPaths, "\n  • ")
		message := fmt.Sprintf(
			"macOS 阻止了以下路径的访问：\n\n  • %s\n\n"+
				"需要在「系统设置 → 隐私与安全性 → 文件和文件夹」中授予 TurboClaw 访问权限。\n\n"+
				"点击「打开设置」前往系统设置。",
			pathList,
		)

		result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:          runtime.WarningDialog,
			Title:         "需要文件访问权限",
			Message:       message,
			DefaultButton: "打开设置",
			Buttons:       []string{"打开设置", "取消"},
		})

		if err != nil || result != "打开设置" {
			return false
		}

		// Open macOS System Settings → Privacy → Files and Folders
		exec.Command("open", "x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders").Run()
		return false // User needs to grant permission and retry
	}

	// Step 3: All paths are accessible but outside workspace — confirm with user
	if len(accessiblePaths) > 0 {
		pathList := strings.Join(accessiblePaths, "\n  • ")
		message := fmt.Sprintf(
			"Agent 请求访问以下工作区外的路径：\n\n  • %s\n\n是否授权访问？",
			pathList,
		)

		result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:          runtime.QuestionDialog,
			Title:         "路径访问授权",
			Message:       message,
			DefaultButton: "No",
			Buttons:       []string{"Yes", "No"},
		})

		if err != nil {
			return false
		}
		return result == "Yes"
	}

	return true
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

// Skill represents a picoclaw skill
type Skill struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Source      string `json:"source"`
	Emoji       string `json:"emoji"`
	Enabled     bool   `json:"enabled"`
}

// GetSkills returns available skills by reading the workspace skills directory
func (a *App) GetSkills() ([]Skill, error) {
	homeDir, _ := os.UserHomeDir()
	skillsDir := filepath.Join(homeDir, ".picoclaw", "workspace", "skills")

	entries, err := os.ReadDir(skillsDir)
	if err != nil {
		return nil, fmt.Errorf("cannot read skills directory: %w", err)
	}

	var skills []Skill
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		skillName := entry.Name()
		skillMD := filepath.Join(skillsDir, skillName, "SKILL.md")
		data, err := os.ReadFile(skillMD)
		if err != nil {
			continue
		}

		content := string(data)
		skill := Skill{
			Name:    skillName,
			Source:  "workspace",
			Enabled: true,
			Emoji:   "🔧",
		}

		// Parse YAML frontmatter between --- markers
		if strings.HasPrefix(content, "---") {
			parts := strings.SplitN(content[3:], "---", 2)
			if len(parts) >= 1 {
				frontmatter := parts[0]
				for _, line := range strings.Split(frontmatter, "\n") {
					line = strings.TrimSpace(line)
					if strings.HasPrefix(line, "description:") {
						desc := strings.TrimPrefix(line, "description:")
						desc = strings.TrimSpace(desc)
						desc = strings.Trim(desc, "\"'")
						skill.Description = desc
					}
					if strings.HasPrefix(line, "metadata:") {
						meta := strings.TrimPrefix(line, "metadata:")
						meta = strings.TrimSpace(meta)
						emojiPattern := regexp.MustCompile(`"emoji"\s*:\s*"([^"]+)"`)
						if matches := emojiPattern.FindStringSubmatch(meta); len(matches) > 1 {
							skill.Emoji = matches[1]
						}
					}
				}
			}
		}

		skills = append(skills, skill)
	}

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
