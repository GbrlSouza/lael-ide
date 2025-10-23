import { useState, useEffect, useRef } from "react";
import {
  FolderPlus,
  FilePlus,
  Play,
  Download,
  Save,
  Settings,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  X,
  Terminal,
} from "lucide-react";

export default function LaelIDE() {
  const [files, setFiles] = useState({
    "main.py": {
      content: '# Welcome to LAEL IDE\nprint("Hello, World!")',
      language: "python",
    },
    "index.html": {
      content:
        "<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>",
      language: "html",
    },
    "style.css": {
      content:
        "body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}",
      language: "css",
    },
  });
  const [activeFile, setActiveFile] = useState("main.py");
  const [terminalOutput, setTerminalOutput] = useState(
    "LAEL IDE Terminal v1.0\nReady for commands...\n",
  );
  const [terminalInput, setTerminalInput] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set(["root"]));
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const createNewFile = () => {
    const fileName = prompt("Nome do arquivo:");
    if (fileName && !files[fileName]) {
      setFiles((prev) => ({
        ...prev,
        [fileName]: {
          content: "",
          language: getLanguageFromExtension(fileName),
        },
      }));
      setActiveFile(fileName);
    }
  };

  const getLanguageFromExtension = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const langMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      html: "html",
      css: "css",
      java: "java",
      cpp: "cpp",
      c: "c",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      json: "json",
      xml: "xml",
      md: "markdown",
    };
    return langMap[ext] || "text";
  };

  const deleteFile = (fileName) => {
    if (confirm(`Deletar ${fileName}?`)) {
      const newFiles = { ...files };
      delete newFiles[fileName];
      setFiles(newFiles);

      if (activeFile === fileName) {
        const remainingFiles = Object.keys(newFiles);
        setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : "");
      }
    }
  };

  const updateFileContent = (content) => {
    if (activeFile) {
      setFiles((prev) => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content },
      }));
    }
  };

  const runCode = async () => {
    if (!activeFile) return;

    const file = files[activeFile];
    setTerminalOutput((prev) => prev + `\n> Running ${activeFile}...\n`);

    // Simulate code execution based on language
    setTimeout(() => {
      let output = "";
      switch (file.language) {
        case "python":
          if (file.content.includes("print(")) {
            const matches = file.content.match(/print\((.*?)\)/g);
            if (matches) {
              matches.forEach((match) => {
                const content = match.replace(/print\(["']?|["']?\)/g, "");
                output += content + "\n";
              });
            }
          } else {
            output = "Python script executed successfully.\n";
          }
          break;
        case "javascript":
          if (file.content.includes("console.log(")) {
            const matches = file.content.match(/console\.log\((.*?)\)/g);
            if (matches) {
              matches.forEach((match) => {
                const content = match.replace(
                  /console\.log\(["']?|["']?\)/g,
                  "",
                );
                output += content + "\n";
              });
            }
          } else {
            output = "JavaScript executed successfully.\n";
          }
          break;
        case "html":
          output = "HTML file ready for preview.\n";
          break;
        default:
          output = `${file.language} code executed successfully.\n`;
      }

      setTerminalOutput((prev) => prev + output);
    }, 1000);
  };

  const handleTerminalCommand = (e) => {
    if (e.key === "Enter") {
      const command = terminalInput.trim();
      setTerminalOutput((prev) => prev + `$ ${command}\n`);

      // Simple command simulation
      setTimeout(() => {
        let output = "";
        if (command === "ls" || command === "dir") {
          output = Object.keys(files).join("  ") + "\n";
        } else if (command === "clear") {
          setTerminalOutput("LAEL IDE Terminal v1.0\nReady for commands...\n");
          setTerminalInput("");
          return;
        } else if (command.startsWith("cat ") || command.startsWith("type ")) {
          const fileName = command.split(" ")[1];
          if (files[fileName]) {
            output = files[fileName].content + "\n";
          } else {
            output = `File not found: ${fileName}\n`;
          }
        } else if (command === "help") {
          output =
            "Available commands:\n  ls/dir - list files\n  cat/type <file> - show file content\n  clear - clear terminal\n  help - show this help\n";
        } else {
          output = `Command not found: ${command}\n`;
        }

        setTerminalOutput((prev) => prev + output);
      }, 500);

      setTerminalInput("");
    }
  };

  const exportProject = async () => {
    try {
      setTerminalOutput((prev) => prev + "Exporting project...\n");

      const response = await fetch("/api/export-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();

      // Create and download the file
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTerminalOutput(
        (prev) => prev + `Project exported successfully as ${data.filename}!\n`,
      );
      setTerminalOutput(
        (prev) => prev + `Total files: ${data.metadata.totalFiles}\n`,
      );
    } catch (error) {
      console.error("Export error:", error);
      setTerminalOutput((prev) => prev + "Export failed. Please try again.\n");
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-3">LAEL</span>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={createNewFile}
            >
              <FilePlus size={16} className="me-1" />
              New File
            </button>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() =>
                activeFile && updateFileContent(files[activeFile].content)
              }
            >
              <Save size={16} className="me-1" />
              Save
            </button>
            <button className="btn btn-success btn-sm" onClick={runCode}>
              <Play size={16} className="me-1" />
              Run
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportProject}>
              <Download size={16} className="me-1" />
              Export
            </button>
            <button className="btn btn-outline-light btn-sm">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className="container-fluid p-0"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <div className="row g-0 h-100">
          {/* File Explorer */}
          <div className="col-md-3 bg-light border-end">
            <div className="p-3 border-bottom bg-secondary text-white">
              <h6 className="mb-0 fw-bold">Explorer</h6>
            </div>
            <div className="p-2">
              <div className="d-flex align-items-center mb-2">
                <ChevronDown size={16} className="me-1" />
                <Folder size={16} className="me-2 text-warning" />
                <span className="fw-semibold">Project</span>
              </div>
              <div className="ms-3">
                {Object.entries(files).map(([fileName, file]) => (
                  <div
                    key={fileName}
                    className={`d-flex align-items-center justify-content-between p-2 rounded cursor-pointer ${
                      activeFile === fileName
                        ? "bg-primary text-white"
                        : "hover-bg-light"
                    }`}
                    onClick={() => setActiveFile(fileName)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <File size={14} className="me-2" />
                      <span className="small">{fileName}</span>
                    </div>
                    <button
                      className="btn btn-sm p-0 border-0 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(fileName);
                      }}
                    >
                      <X
                        size={12}
                        className={
                          activeFile === fileName ? "text-white" : "text-muted"
                        }
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="col-md-9 d-flex flex-column">
            {/* File Tabs */}
            {activeFile && (
              <div className="bg-light border-bottom p-2">
                <div className="d-flex align-items-center">
                  <File size={14} className="me-2" />
                  <span className="small fw-semibold">{activeFile}</span>
                  <span className="badge bg-secondary ms-2 small">
                    {files[activeFile]?.language}
                  </span>
                </div>
              </div>
            )}

            {/* Code Editor */}
            <div className="flex-grow-1 position-relative">
              {activeFile ? (
                <textarea
                  className="w-100 h-100 border-0 p-3"
                  style={{
                    fontFamily: "Courier New, monospace",
                    fontSize: "14px",
                    resize: "none",
                    outline: "none",
                  }}
                  value={files[activeFile]?.content || ""}
                  onChange={(e) => updateFileContent(e.target.value)}
                  placeholder="Start coding..."
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <File size={48} className="mb-3" />
                    <h5>Welcome to LAEL IDE</h5>
                    <p>Select a file to start editing or create a new one</p>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal */}
            {showTerminal && (
              <div className="border-top" style={{ height: "300px" }}>
                <div className="bg-dark text-white p-2 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Terminal size={16} className="me-2" />
                    <span className="small fw-bold">Terminal</span>
                  </div>
                  <button
                    className="btn btn-sm p-0 border-0 bg-transparent text-white"
                    onClick={() => setShowTerminal(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div
                  ref={terminalRef}
                  className="bg-dark text-white p-3 overflow-auto"
                  style={{
                    height: "calc(100% - 40px)",
                    fontFamily: "Courier New, monospace",
                    fontSize: "13px",
                  }}
                >
                  <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {terminalOutput}
                  </pre>
                  <div className="d-flex align-items-center mt-2">
                    <span className="text-success me-2">$</span>
                    <input
                      type="text"
                      className="bg-transparent border-0 text-white flex-grow-1"
                      style={{
                        outline: "none",
                        fontFamily: "Courier New, monospace",
                      }}
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalCommand}
                      placeholder="Type a command..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terminal Toggle Button */}
            {!showTerminal && (
              <div className="position-fixed bottom-0 end-0 m-3">
                <button
                  className="btn btn-dark"
                  onClick={() => setShowTerminal(true)}
                >
                  <Terminal size={16} className="me-2" />
                  Terminal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        
        /* Custom scrollbar for terminal */
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}
