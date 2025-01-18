# dyneqtra-dev - Graph-Based Editor for LLM Workflows

<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-blue"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-blue"></a>
  <a href="./README_JA.md"><img alt="日本語のREADME" src="https://img.shields.io/badge/日本語-blue"></a>
  <a href="./README_KR.md"><img alt="README in Korean" src="https://img.shields.io/badge/한국어-blue"></a>
  <a href="./README_DE.md"><img alt="Deutsche Version der README" src="https://img.shields.io/badge/Deutsch-blue"></a>
<a href="./README_FR.md"><img alt="Version française du README" src="https://img.shields.io/badge/Français-blue"></a>
<a href="./README_ES.md"><img alt="Versión en español del README" src="https://img.shields.io/badge/Español-blue"></a>
</p>

<p align="center">
  <a href="https://discord.gg/7Spn7C8A5F">
    <img alt="Join Our Discord" src="https://img.shields.io/badge/Discord-7289DA.svg?style=for-the-badge&logo=discord&logoColor=white">
  </a>
</p>

https://github.com/user-attachments/assets/9128885b-47ba-4fc6-ab6b-d567f52e332c


# 🕸️ Why dyneqtra-dev?

- 🖐️ **Drag-and-drop**: Visually build and test workflows in seconds.
- 🧪 **Evals**: Quickly test and refine agent steps interactively.
- 🧰 **Tools**: Connect to Slack, Google Sheets, GitHub, and more.
- 🗃️ **RAG**: Parse, chunk, embed, and upsert data into a vector DB in a few clicks.
- 🚀 **1-Click Deploy**: Publish as an API and integrate wherever you want.
- 🤖 **Multi-agent**: Orchestrate and manage conversations across multiple agents.
- 🐍 **Python-based**: Add new nodes by creating a single Python file.
- 🎛️ **Flexible**: Agnostic to LLMs, embedders, and vector databases.

# ✨ Core Benefits

## Debug at Node Level:

https://github.com/user-attachments/assets/6e82ad25-2a46-4c50-b030-415ea9994690

## Modular Building Blocks

https://github.com/user-attachments/assets/6442f0ad-86d8-43d9-aa70-e5c01e55e876

## Evaluate Final Performance

https://github.com/user-attachments/assets/4dc2abc3-c6e6-4d6d-a5c3-787d518de7ae

## Coming soon: Self-improvement

https://github.com/user-attachments/assets/5bef7a16-ef9f-4650-b385-4ea70fa54c8a

# ⚡ Quick start

You can launch dyneqtra-dev using pre-built docker images in the following steps:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/dyneqtra/dyneqtra-dev
    cd dyneqtra-dev
    ```

2. **Create a .env file:**

    Create a `.env` file at the root of the project. You may use `.env.example` as a starting point.
    ```sh
    cp .env.example .env
    ```
    **Please go through the .env file and change configs wherver necessary**
    **If you plan to use third party model providers, please add their API keys in the .env file in this step**.

3. **Start the docker services:**

    ```sh
    docker compose -f ./docker-compose.prod.yml up --build -d
    ```

    This will start a local instance of dyneqtra-dev that will store spurs and other state information in a postgres database. A local postgres service is used by default. Override `POSTGRES_*` variables in the `.env` file to use an external postgres database.

4. **Access the portal:**

    Go to `http://localhost:6080/` in your browser.


Set up is completed. Click on "New Spur" to create a workflow, or start with one of the stock templates.


5. **[Optional] Manage your LLM provider keys from the app:**

   Once dyneqtra-dev app is running you can manage your LLM provider keys through the portal:

   <img width="1913" alt="image" src="https://github.com/user-attachments/assets/32fe79f1-f518-4df5-859c-1d1c0fc0570e" />

   Select API keys tab

   <img width="441" alt="image" src="https://github.com/user-attachments/assets/cccc7e27-c10b-4f3a-b818-3b65c55f4170" />

   Enter your provider's key and click save (save button will appear after you add/modify a key)

   <img width="451" alt="image" src="https://github.com/user-attachments/assets/e35ba2bb-4c60-4b13-9a8d-cc47cac45375" />


# 🛠️ dyneqtra-dev Development Setup
#### [ Instructions for development on Unix-like systems. Development on Windows/PC not tested ]

The steps for dev setup are same as above, except for step 3: we launch the app in the dev mode instead

3. **Start the docker services:**

    ```sh
    docker compose up --build -d
    ```

    This will start a local instance of dyneqtra-dev that will store spurs and other state information in a postgres database. A local postgres service is used by default. Override `POSTGRES_*` variables in the `.env` file to use an external postgres database.


# 🦙 Using dyneqtra-dev with Ollama (Local Models)

dyneqtra-dev can work with local models served using Ollama.

Steps to configure dyneqtra-dev to work with Ollama running on the same host.

### 1. Configure Ollama
To ensure Ollama API is reachable from dyneqtra-dev, we need to start the Ollama service with environment variable `OLLAMA_HOST=0.0.0.0` . This allows requests coming from dyneqtra-dev docker's bridge network to get through to Ollama.
An easy way to do this is to launch the ollama service with the following command:
```sh
OLLAMA_HOST="0.0.0.0" ollama serve
```

### 2. Update the dyneqtra-dev .env file
Next up we need to update the `OLLAMA_BASE_URL` environment value in the `.env` file.
If your Ollama port is 11434 (the default port), then the entry in `.env` file should look like this:
```sh
OLLAMA_BASE_URL=http://host.docker.internal:11434
```
(Please make sure that there is no trailing slash in the end!)

In dyneqtra-dev's set up, `host.docker.internal` refers to the host machine where both dyneqtra-dev and Ollama are running.

### 3. Launch the dyneqtra-dev app
Follow the usual steps to launch the dyneqtra-dev app, starting with the command:
```sh
docker compose -f docker-compose.prod.yml up --build -d
```

If you wish to do dyneqtra-dev development with ollama please run the following command instead of above:
```sh
docker compose -f docker-compose.yml up --build -d
```


### 4. Using Ollama models in the app
You will be able to select Ollama models [`ollama/llama3.2`, `ollama/llama3`, ...] from the sidebar for LLM nodes.
Please make sure the model you select is explicitly downloaded in ollama. That is, you will need to manually manage these models via ollama. To download a model you can simply run `ollama pull <model-name>`.

## Note on supported models
dyneqtra-dev only works with models that support structured-output and json mode. Most newer models should be good, but it would still be good to confirm this from Ollama documentation for the model you wish to use.

# ⭐ Support us

You can support us in our work by leaving a star! Thank you!

# 🗺️ Roadmap

- [X] Canvas
- [X] Async/Batch Execution
- [X] Evals
- [X] Spur API
- [x] Support Ollama
- [ ] New Nodes
    - [X] LLM Nodes
    - [X] If-Else
    - [X] Merge Branches
    - [X] Tools
    - [ ] Loops
- [X] RAG
- [ ] Pipeline optimization via DSPy and related methods
- [ ] Templates
- [ ] Compile Spurs to Code
- [ ] Multimodal support
- [ ] Containerization of Code Verifiers
- [ ] Leaderboard
- [ ] Generate Spurs via AI