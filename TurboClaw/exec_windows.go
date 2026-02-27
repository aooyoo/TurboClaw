//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

// hideWindow sets the HideWindow flag to true on Windows, preventing a command prompt
// window from popping up when executing background CLI tools.
func hideWindow(cmd *exec.Cmd) {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.HideWindow = true
}
