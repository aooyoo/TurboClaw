//go:build !windows

package main

import "os/exec"

// hideWindow does nothing on Unix-like systems, as background commands are inherently
// hidden unless explicitly attached to a terminal.
func hideWindow(cmd *exec.Cmd) {
	// No-op
}
