# PySpur - 基于图形的 LLM 工作流编辑器

<p align="center">
  <a href="./README.md"><img alt="英文版README" src="https://img.shields.io/badge/English-blue"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-blue"></a>
  <a href="./README_JA.md"><img alt="日本语版README" src="https://img.shields.io/badge/日本語-blue"></a>
  <a href="./README_KR.md"><img alt="韩语版README" src="https://img.shields.io/badge/한국어-blue"></a>
  <a href="./README_DE.md"><img alt="德语版README" src="https://img.shields.io/badge/Deutsch-blue"></a>
<a href="./README_FR.md"><img alt="法语版README" src="https://img.shields.io/badge/Français-blue"></a>
<a href="./README_ES.md"><img alt="西班牙语版README" src="https://img.shields.io/badge/Español-blue"></a>
</p>

https://github.com/user-attachments/assets/9128885b-47ba-4fc6-ab6b-d567f52e332c

#

# ✨ 核心优势

## 模块化构建单元

https://github.com/user-attachments/assets/6442f0ad-86d8-43d9-aa70-e5c01e55e876

## 在节点级别进行调试：

https://github.com/user-attachments/assets/6e82ad25-2a46-4c50-b030-415ea9994690

## 评估最终性能

https://github.com/user-attachments/assets/4dc2abc3-c6e6-4d6d-a5c3-787d518de7ae

## 即将推出：自我改进

https://github.com/user-attachments/assets/5bef7a16-ef9f-4650-b385-4ea70fa54c8a

# 🕸️ 为什么选择 PySpur？

* **易于扩展**：例如，只需创建一个 Python 文件就能添加新的工作流节点。
* 使用 **JSON 配置** 进行工作流图管理，轻松共享和版本控制。
* **轻量级**：通过最少的依赖，避免臃肿的 LLM 框架。

# ⚡ 快速开始

通过以下三步快速启动并运行 PySpur。

1. **克隆代码仓库：**
    ```sh
    git clone https://github.com/PySpur-com/PySpur.git
    cd pyspur
    ```

2. **启动 docker 服务：**
    ```sh
    sudo docker compose up --build -d
    ```
    这将启动本地的 PySpur 实例，并在本地的 SQLite 文件中保存 spurs 以及运行记录。

3. **访问界面：**
    在浏览器中打开 `http://localhost:6080/`。

    输入 `pyspur`/`canaryhattan` 作为用户名和密码。

4. **添加你的 LLM 提供商密钥：**

   在界面右上角找到设置菜单

   <img width="1913" alt="image" src="https://github.com/user-attachments/assets/32fe79f1-f518-4df5-859c-1d1c0fc0570e" />

   选择 API keys 选项卡

   <img width="441" alt="image" src="https://github.com/user-attachments/assets/cccc7e27-c10b-4f3a-b818-3b65c55f4170" />

   输入你的提供商密钥，然后点击保存（当你添加或修改密钥后，保存按钮将会出现）

   <img width="451" alt="image" src="https://github.com/user-attachments/assets/e35ba2bb-4c60-4b13-9a8d-cc47cac45375" />

设置完成。点击 "New Spur" 来创建一个新的工作流，或者从现有的模板开始。

# 🗺️ 路线图

- [X] 画布
- [X] 异步/批量执行
- [X] 评估 (Evals)
- [X] Spur API
- [ ] 新节点
    - [X] LLM 节点
    - [X] 条件分支 (If-Else)
    - [X] 分支合并 (Merge Branches)
    - [ ] 工具 (Tools)
    - [ ] 循环 (Loops)
- [ ] 使用 DSPy 等方法对管道进行优化
- [ ] 模板
- [ ] 将 Spurs 编译为代码
- [ ] 多模态支持
- [ ] 对代码验证器进行容器化
- [ ] 排行榜 (Leaderboard)
- [ ] 使用 AI 自动生成 Spurs

我们非常期待你的反馈。  
请[告诉我们](mailto:founders@pyspur.dev?subject=Feature%20Request&body=I%20want%20this%20feature%3Ai) 你希望接下来看到哪些特性，或是提出全新的想法。
