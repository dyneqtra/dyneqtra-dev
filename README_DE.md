# PySpur - Graphbasierter Editor für LLM-Workflows

<p align="center">
  <a href="./README.md"><img alt="README auf Englisch" src="https://img.shields.io/badge/English-blue"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-blue"></a>
  <a href="./README_JA.md"><img alt="日本語のREADME" src="https://img.shields.io/badge/日本語-blue"></a>
  <a href="./README_KR.md"><img alt="README auf Koreanisch" src="https://img.shields.io/badge/한국어-blue"></a>
  <a href="./README_DE.md"><img alt="Deutsche Version der README" src="https://img.shields.io/badge/Deutsch-blue"></a>
  <a href="./README_FR.md"><img alt="Französische Version der README" src="https://img.shields.io/badge/Français-blue"></a>
  <a href="./README_ES.md"><img alt="Spanische Version der README" src="https://img.shields.io/badge/Español-blue"></a>
</p>

https://github.com/user-attachments/assets/9128885b-47ba-4fc6-ab6b-d567f52e332c

# ✨ Vorteile

## Modulare Bausteine

https://github.com/user-attachments/assets/6442f0ad-86d8-43d9-aa70-e5c01e55e876

## Debugging auf Knoten--ebene

https://github.com/user-attachments/assets/6e82ad25-2a46-4c50-b030-415ea9994690

## Evaluierung der Endleistung

https://github.com/user-attachments/assets/4dc2abc3-c6e6-4d6d-a5c3-787d518de7ae

## Demnächst: Selbstverbesserung

https://github.com/user-attachments/assets/5bef7a16-ef9f-4650-b385-4ea70fa54c8a


# 🕸️ Warum PySpur?

* **Leicht erweiterbar**: Zum Beispiel kann man neue Workflow-Knoten einfach durch das Hinzufügen einer einzigen Python-Datei erstellen.
* **JSON-Konfigurationen** für Workflow-Grafen, was das einfache Teilen und die Versionskontrolle ermöglicht.
* **Leichtgewichtig** dank minimaler Abhängigkeiten, um aufgeblähte LLM-Frameworks zu vermeiden.

# ⚡ Schnellstart

Mit drei einfachen Schritten können Sie PySpur zum Laufen bringen.

1. **Repository klonen:**
    ```sh
    git clone https://github.com/PySpur-com/PySpur.git
    cd pyspur
    ```

2. **Docker-Services starten:**

    ```sh
    sudo docker compose up --build -d
    ```

    Dies startet eine lokale Instanz von PySpur, die Spuren (Spurs) und ihre Ausführungen in einer lokalen SQLite-Datei speichert.

3. **Auf das Portal zugreifen:**

    Öffnen Sie in Ihrem Browser `http://localhost:6080/`.

    Geben Sie als Benutzername/Passwort `pyspur`/`canaryhattan` ein.

4. **Ihre LLM-Provider-Keys hinzufügen:**

   Gehen Sie zum Einstellungsmenü oben rechts im Portal.

   <img width="1913" alt="image" src="https://github.com/user-attachments/assets/32fe79f1-f518-4df5-859c-1d1c0fc0570e" />

   Wählen Sie den Reiter "API keys" aus.

   <img width="441" alt="image" src="https://github.com/user-attachments/assets/cccc7e27-c10b-4f3a-b818-3b65c55f4170" />

   Geben Sie den Key Ihres Anbieters ein und klicken Sie auf "Save" (Speichern). (Die Schaltfläche zum Speichern erscheint, nachdem Sie einen Key hinzugefügt oder bearbeitet haben.)

   <img width="451" alt="image" src="https://github.com/user-attachments/assets/e35ba2bb-4c60-4b13-9a8d-cc47cac45375" />

Die Einrichtung ist abgeschlossen. Klicken Sie auf "New Spur", um einen neuen Workflow zu erstellen, oder beginnen Sie mit einer der vorgegebenen Vorlagen.

# 🗺️ Roadmap

- [X] Canvas
- [X] Asynchrone/Batch-Ausführung
- [X] Evaluierungen
- [X] Spur-API
- [ ] Neue Knoten
    - [X] LLM-Knoten
    - [X] If-Else
    - [X] Zusammenführen von Zweigen
    - [ ] Tools
    - [ ] Schleifen
- [ ] Pipeline-Optimierung mit DSPy und verwandten Methoden
- [ ] Vorlagen (Templates)
- [ ] Kompilieren von Spurs in Code
- [ ] Multimodale Unterstützung
- [ ] Containerisierung von Code-Verifizierern
- [ ] Bestenliste (Leaderboard)
- [ ] Erstellen von Spurs mittels KI

Ihr Feedback ist uns sehr wichtig.  
Bitte [teilen Sie es uns mit](mailto:founders@pyspur.dev?subject=Feature%20Request&body=I%20want%20this%20feature%3Ai), welche Funktionen Sie als Nächstes sehen möchten oder schlagen Sie völlig neue Features vor.
