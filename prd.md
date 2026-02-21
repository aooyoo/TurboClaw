这是一个openclaw本地客户端套壳，名叫AgentMe，旨在让普通小白用户也能通过安装客户端，直接启动本地bot服务，只需要填入telegram的bot token即可使用，默认自带免费ai模型，可以自己配置自己的模型。后续直接使用agentme提供的安卓客户端也可与自己的私人助手随时交流。

本目录下的picoclaw就是一个命令行可执行文件，基本使用方法：
Usage: picoclaw <command>

Commands:
  onboard     Initialize picoclaw configuration and workspace
  agent       Interact with the agent directly
  auth        Manage authentication (login, logout, status)
  gateway     Start picoclaw gateway
  status      Show picoclaw status
  cron        Manage scheduled tasks
  migrate     Migrate from OpenClaw to PicoClaw
  skills      Manage skills (install, list, remove)
  version     Show version information
  
本地config文件路径：/Users/jerry/.picoclaw/config.json
本地Workspace路径：/Users/jerry/.picoclaw/workspace
  
客户端功能：
对话：支持通过标签页新建对话session，支持上传文件，或者拖入文件
设置：Telegram bot配置，需要把本地config的配置项都做进来

拥有自带skill


官网：（后续版本再迭代）
注册、订阅（后续版本再迭代）
拥有案例集页面（后续版本再迭代）


技术栈：
用go和wails实现服务端
用nextjs实现前端
