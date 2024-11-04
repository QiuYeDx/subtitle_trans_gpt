# LRC 转换为 SRT 的工具

一个用于将***中日双语的*** LRC 字幕文件转换为 SRT 格式的 Node.js 脚本。该脚本支持两种模式：

- **双语模式 (`dual`)**：输出双语字幕，将具有相同时间戳的两行（例如日文和中文）合并。
- **仅中文模式 (`chinese`)**：从双语 LRC 文件中仅输出中文字幕。

## 特性

- 将 LRC 文件转换为 SRT 格式。
- 支持双语字幕（例如日文和中文）。
- 能够仅输出中文字幕。
- 具有灵活参数顺序的命令行界面。
- 自动处理时间格式转换。
- 错误处理和用户友好的提示。

## 使用方法

在命令行中使用 Node.js 运行脚本：

```bash
node path/to/multiLrcToSrt.js <input.lrc> [output.srt] [--mode=模式]
```

- `<input.lrc>`：**（必需）** 要转换的 LRC 文件的路径。
- `[output.srt]`：**（可选）** 要保存转换后的 SRT 文件的路径。如果未指定，输出文件将保存在与输入文件相同的目录下，文件名相同但扩展名为 `.srt`。
- `[--mode=模式]`：**（可选）** 转换模式。可用选项：
  - `dual`：输出双语字幕（默认模式）。
  - `chinese`：仅输出中文字幕。

### 命令行选项

- `--mode=模式`：指定转换模式（`dual` 或 `chinese`）。

### 示例

#### 1. 将 LRC 文件转换为双语字幕的 SRT 文件（默认模式）

```bash
node multiLrcToSrt.js subtitles.lrc
```

- **输入**：`subtitles.lrc`
- **输出**：`subtitles.srt`（保存在相同目录下）

#### 2. 将 LRC 文件转换为仅含中文字幕的 SRT 文件

```bash
node multiLrcToSrt.js subtitles.lrc --mode=chinese
```

- **输入**：`subtitles.lrc`
- **输出**：`subtitles.srt`（保存在相同目录下）
- **模式**：仅中文

#### 3. 指定自定义输出文件和模式

```bash
node multiLrcToSrt.js path/to/input.lrc path/to/output.srt --mode=chinese
```

- **输入**：`path/to/input.lrc`
- **输出**：`path/to/output.srt`
- **模式**：仅中文

#### 4. 使用灵活的参数顺序

```bash
node multiLrcToSrt.js --mode=chinese subtitles.lrc
```

- 参数顺序可以灵活排列，只要指定了输入文件。

## 注意事项

- **LRC 文件格式**：脚本假设 LRC 文件的格式为每个字幕条目由两行组成：
  - **第一行**：原始语言（例如日文）和时间戳。
  - **第二行**：具有相同时间戳的中文翻译。

  示例：

  ```plaintext
  [00:00.00]こんにちは
  [00:00.00]你好
  ```

- **时间格式**：脚本处理时间格式转换，以确保兼容 SRT 标准，适当转换时间戳。

- **编码**：确保你的 LRC 文件使用 UTF-8 编码，以避免字符编码问题。

- **错误处理**：如果脚本遇到问题（例如缺少输入文件、无效的模式），将输出错误信息并退出。
