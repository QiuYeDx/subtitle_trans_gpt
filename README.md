# 字幕处理工具集

该项目提供了一系列用于处理字幕文件的 Node.js 脚本，帮助您在 LRC 和 SRT 格式之间转换字幕，提取中文字幕，以及使用 OpenAI API 翻译字幕内容。

## 特性

- **字幕格式转换**：在 LRC 和 SRT 字幕格式之间转换，支持双语和单语字幕。
- **字幕翻译**：使用 OpenAI API 将字幕文件翻译为中日双语字幕。
- **提取中文字幕**：从双语 LRC 文件中提取中文字幕，生成新的 LRC 文件。
- **灵活的命令行工具**：每个工具都提供了简单易用的命令行接口。

## 工具列表

所有工具脚本都位于 `tools` 文件夹中：

1. [`convertLrcToSrt.js`](#1-convertlrctosrtjs)：将双语 LRC 字幕文件转换为 SRT 格式，支持输出双语或仅中文字幕。
2. [`chineseLrcToSrt.js`](#2-chineselrctosrtjs)：将仅包含中文字幕的 LRC 文件转换为 SRT 格式。
3. [`convertToChineseLrc.js`](#3-converttochineselrcjs)：从双语 LRC 文件中提取中文字幕，生成新的 LRC 文件。
4. [`lrc_trans.js`](#4-lrc_transjs)：使用 OpenAI API 将 LRC 字幕文件翻译为中日双语字幕。
5. [`srt_trans.js`](#5-srt_transjs)：使用 OpenAI API 将 SRT 字幕文件翻译为中日双语字幕。

---

### 1. `convertLrcToSrt.js`

#### 功能

将**中日双语的** LRC 字幕文件转换为 SRT 格式的字幕文件。该脚本支持两种模式：

- **双语模式 (`dual`)**：输出双语字幕，将具有相同时间戳的两行（如日文和中文）合并。
- **仅中文模式 (`chinese`)**：从双语 LRC 文件中仅输出中文字幕。

#### 使用方法

```bash
node convertLrcToSrt.js <input.lrc> [output.srt] [--mode=模式]
```

- `<input.lrc>`：**（必需）** 要转换的 LRC 文件的路径。
- `[output.srt]`：**（可选）** 输出的 SRT 文件路径。若未指定，默认与输入文件同名，扩展名为 `.srt`。
- `[--mode=模式]`：**（可选）** 转换模式，可选值：
  - `dual`：输出中日双语字幕（默认）。
  - `chinese`：仅输出中文字幕。

#### 示例

1. **转换为双语 SRT 文件（默认模式）**

   ```bash
   node convertLrcToSrt.js subtitles.lrc
   ```

2. **转换为仅含中文字幕的 SRT 文件**

   ```bash
   node convertLrcToSrt.js subtitles.lrc --mode=chinese
   ```

3. **指定输出文件和模式**

   ```bash
   node convertLrcToSrt.js path/to/input.lrc path/to/output.srt --mode=chinese
   ```

---

### 2. `chineseLrcToSrt.js`

#### 功能

将仅包含中文字幕的 LRC 字幕文件转换为 SRT 格式。

#### 使用方法

```bash
node chineseLrcToSrt.js <input.lrc> [output.srt]
```

- `<input.lrc>`：**（必需）** 要转换的中文 LRC 文件的路径。
- `[output.srt]`：**（可选）** 输出的 SRT 文件路径。若未指定，默认与输入文件同名，扩展名为 `.srt`。

#### 示例

1. **转换为 SRT 文件（默认输出路径）**

   ```bash
   node chineseLrcToSrt.js subtitles.lrc
   ```

2. **指定输出文件**

   ```bash
   node chineseLrcToSrt.js path/to/input.lrc path/to/output.srt
   ```

---

### 3. `convertToChineseLrc.js`

#### 功能

从双语 LRC 文件中提取中文字幕，生成仅包含中文字幕的 LRC 文件。

#### 使用方法

```bash
node convertToChineseLrc.js <input.lrc> [output.lrc]
```

- `<input.lrc>`：**（必需）** 双语 LRC 文件的路径。
- `[output.lrc]`：**（可选）** 输出的 LRC 文件路径。若未指定，默认在输入文件名后加 `_cn.lrc`。

#### 示例

1. **提取中文字幕（默认输出路径）**

   ```bash
   node convertToChineseLrc.js subtitles.lrc
   ```

2. **指定输出文件**

   ```bash
   node convertToChineseLrc.js path/to/input.lrc path/to/output.lrc
   ```

---

### 4. `lrc_trans.js`

#### 功能

使用 OpenAI API 将字幕文件翻译为中日双语字幕。支持常规模式和敏感内容模式。

#### 前提条件

- **OpenAI API 密钥**：需要一个有效的 OpenAI API 密钥。
- **安装依赖**：运行 `npm install` 安装所需依赖。

#### 配置 API 密钥

在脚本目录下创建一个名为 `apiKey.json` 的文件，内容如下：

```json
{
  "apiKey": "your-openai-api-key"
}
```

将 `"your-openai-api-key"` 替换为您的实际 OpenAI API 密钥。

#### 使用方法

```bash
node lrc_trans.js <input_subtitle_file> [mode]
```

- `<input_subtitle_file>`：**（必需）** 要翻译的字幕文件路径（支持 `.srt`、`.lrc` 等格式）。
- `[mode]`：**（可选）** 翻译模式，可选值：
  - `normal`：常规模式，适用于一般内容（默认）。
  - `sensitive`：敏感内容模式，针对敏感内容使用较低的每次请求令牌限制。

#### 示例

1. **使用常规模式翻译**

   ```bash
   node lrc_trans.js subtitles.srt
   ```

2. **使用敏感模式翻译**

   ```bash
   node lrc_trans.js subtitles.srt sensitive
   ```

#### 注意事项

- **费用估算**：脚本会根据输入和输出的 token 数量估算费用，并在控制台显示。
- **错误处理**：如果翻译失败，未成功的部分将保存到 `<input_filename>_failed.<extension>` 文件中。
- **令牌限制**：大型文件将自动拆分，以符合 OpenAI API 的令牌限制。

---

### 5. `srt_trans.js`

#### 功能

使用 OpenAI API 将 SRT 字幕文件翻译为中日双语字幕。该脚本提供了常规模式和敏感内容模式的支持。

#### 前提条件

- **OpenAI API 密钥**：需要一个有效的 OpenAI API 密钥。
- **安装依赖**：运行 `npm install` 安装所需依赖。

#### 配置 API 密钥

在项目目录下创建一个名为 `apiKey.json` 的文件，内容如下：

```json
{
  "apiKey": "your-openai-api-key"
}
```

将 `"your-openai-api-key"` 替换为您的实际 OpenAI API 密钥。

#### 使用方法

```bash
node srt_trans.js <input_subtitle_file> [mode]
```

- `<input_subtitle_file>`：**（必需）** 要翻译的字幕文件路径（支持 `.srt` 格式）。
- `[mode]`：**（可选）** 翻译模式，可选值：
  - `normal`：常规模式，适用于一般内容（默认）。
  - `sensitive`：敏感内容模式，针对敏感内容使用较低的每次请求令牌限制。

#### 示例

1. **使用常规模式翻译**

   ```bash
   node srt_trans.js subtitles.srt
   ```

2. **使用敏感模式翻译**

   ```bash
   node srt_trans.js subtitles.srt sensitive
   ```

#### 注意事项

- **费用估算**：脚本会根据输入和输出的 token 数量估算费用，并在控制台显示。
- **错误处理**：如果翻译失败，未成功的部分将保存到 `<input_filename>_failed.srt` 文件中。
- **令牌限制**：大型文件将自动拆分，以符合 OpenAI API 的令牌限制。

---

## 安装依赖

在开始之前，请确保已安装 Node.js 和 npm。然后在项目目录中运行以下命令安装所需依赖：

```bash
npm install
```

## 常见问题

### Q1: 脚本支持哪些字幕格式？

大部分脚本支持 `.lrc` 格式，其中：

- `lrc_trans.js` 脚本支持 `.lrc` 字幕格式。
- `srt_trans.js` 脚本支持 `.srt` 字幕格式。

### Q2: 如何确保 LRC 文件格式正确？

确保 LRC 文件的每一行都有正确的时间戳格式 `[mm:ss.xx]`，并按照脚本要求的格式组织内容。

### Q3: 为什么需要 OpenAI API 密钥？

`lrc_trans.js` 和 `srt_trans.js` 脚本需要使用 OpenAI API 进行翻译，因此需要提供有效的 API 密钥。

### Q4: 翻译费用是多少？

费用基于使用的 token 数量，脚本会在翻译过程中估算并显示费用。请注意，使用 OpenAI API 会产生实际费用。
