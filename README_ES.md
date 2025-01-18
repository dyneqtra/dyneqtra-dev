# PySpur - Editor Basado en Grafos para Flujos de Trabajo con LLM

<p align="center">
  <a href="./README.md"><img alt="README en inglés" src="https://img.shields.io/badge/English-blue"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-blue"></a>
  <a href="./README_JA.md"><img alt="日本語のREADME" src="https://img.shields.io/badge/日本語-blue"></a>
  <a href="./README_KR.md"><img alt="README en coreano" src="https://img.shields.io/badge/한국어-blue"></a>
  <a href="./README_DE.md"><img alt="Deutsche Version der README" src="https://img.shields.io/badge/Deutsch-blue"></a>
<a href="./README_FR.md"><img alt="Version française du README" src="https://img.shields.io/badge/Français-blue"></a>
<a href="./README_ES.md"><img alt="Versión en español del README" src="https://img.shields.io/badge/Español-blue"></a>
</p>

https://github.com/user-attachments/assets/9128885b-47ba-4fc6-ab6b-d567f52e332c

# ✨ Beneficios Clave

## Bloques de Construcción Modulares

https://github.com/user-attachments/assets/6442f0ad-86d8-43d9-aa70-e5c01e55e876

## Depuración a Nivel de Nodo

https://github.com/user-attachments/assets/6e82ad25-2a46-4c50-b030-415ea9994690

## Evaluación del Desempeño Final

https://github.com/user-attachments/assets/4dc2abc3-c6e6-4d6d-a5c3-787d518de7ae

## Próximamente: Auto-Mejora

https://github.com/user-attachments/assets/5bef7a16-ef9f-4650-b385-4ea70fa54c8a


# 🕸️ ¿Por Qué PySpur?

* **Fácil de modificar**, por ejemplo, puedes agregar nuevos nodos de flujo de trabajo simplemente creando un solo archivo en Python.
* **Configuraciones JSON** para gráficos de flujo de trabajo, lo que facilita su compartición y control de versiones.
* **Ligero** gracias a dependencias mínimas, evitando la sobrecarga de marcos (frameworks) LLM pesados.

# ⚡ Inicio Rápido

Puedes poner en marcha PySpur en tres pasos rápidos.

1. **Clona el repositorio:**
    ```sh
    git clone https://github.com/PySpur-com/PySpur.git
    cd pyspur
    ```

2. **Inicia los servicios con Docker:**

    ```sudo docker compose up --build -d```

    Esto iniciará una instancia local de PySpur que almacenará los “spurs” y sus ejecuciones en un archivo SQLite local.

3. **Accede al portal:**

    Ve a `http://localhost:6080/` en tu navegador.

    Ingresa `pyspur`/`canaryhattan` como usuario/contraseña.

4. **Agrega las claves de tu proveedor LLM:**

   Ve al menú de configuración en la esquina superior derecha del portal

   <img width="1913" alt="image" src="https://github.com/user-attachments/assets/32fe79f1-f518-4df5-859c-1d1c0fc0570e" />

   Selecciona la pestaña "API keys"

   <img width="441" alt="image" src="https://github.com/user-attachments/assets/cccc7e27-c10b-4f3a-b818-3b65c55f4170" />

   Ingresa la clave de tu proveedor y haz clic en guardar (el botón de guardar aparecerá después de que agregues o modifiques una clave)

   <img width="451" alt="image" src="https://github.com/user-attachments/assets/e35ba2bb-4c60-4b13-9a8d-cc47cac45375" />

La configuración está completa. Haz clic en "New Spur" para crear un flujo de trabajo, o comienza con una de las plantillas predeterminadas.

# 🗺️ Hoja de Ruta

- [X] Lienzo
- [X] Ejecución Asíncrona/por Lotes
- [X] Evaluaciones
- [X] API de Spur
- [ ] Nuevos Nodos
    - [X] Nodos LLM
    - [X] If-Else
    - [X] Unir Ramas
    - [ ] Herramientas
    - [ ] Bucles
- [ ] Optimización de flujos a través de DSPy y métodos relacionados
- [ ] Plantillas
- [ ] Compilar Spurs a Código
- [ ] Soporte Multimodal
- [ ] Contenerización de Verificadores de Código
- [ ] Tablero de Clasificaciones (Leaderboard)
- [ ] Generar Spurs mediante IA

Tu retroalimentación será enormemente apreciada. Por favor, [dinos](mailto:founders@pyspur.dev?subject=Feature%20Request&body=I%20want%20this%20feature%3Ai) qué características de la lista te gustaría ver a continuación o solicita nuevas funciones.
