# 字幕翻译工具

一个使用 OpenAI API 将字幕文件翻译为日中双语字幕的 Node.js 脚本。该脚本读取输入的字幕文件，进行翻译，并输出一个包含翻译内容的新字幕文件。

## 特性

- **自动翻译**：将字幕文件翻译为日中双语字幕。
- **大文件支持**：支持大型字幕文件，自动拆分为可管理的部分进行翻译。
- **错误处理**：处理 API 速率限制，并在失败时进行重试。
- **费用估算**：计算并显示基于令牌使用量的翻译费用估算。
- **用户友好**：提供错误处理和用户友好的提示。

## 前提条件

- **Node.js**：确保已安装 Node.js（建议版本 16 或更高）。
- **OpenAI API 密钥**：您需要一个 OpenAI API 密钥来使用此脚本。

## 设置您的 OpenAI API 密钥

  在脚本目录中创建一个名为 `apiKey.json` 的文件，内容如下：

  ```json
  {
    "apiKey": "your-openai-api-key"
  }
  ```

  将 `"your-openai-api-key"` 替换为您的实际 OpenAI API 密钥。

## 使用方法

在命令行中使用 Node.js 运行脚本：

```bash
node translateSubtitles.js <input_subtitle_file> [mode]
```

- `<input_subtitle_file>`：**（必需）** 要翻译的字幕文件的路径。
- `[mode]`：**（可选）** 翻译模式。可用选项：
  - `normal`：常规模式，适用于一般内容（默认）。
  - `sensitive`：敏感内容模式，针对敏感内容使用较低的每次请求令牌限制。

### 模式说明

- `normal`：适用于普通内容，允许较大的文本块发送到 API。
- `sensitive`：如果您的内容包含敏感材料，请使用此模式。该模式降低了每次请求的最大令牌数。

### 示例

#### 1. 使用常规模式翻译字幕文件

```bash
node translateSubtitles.js subtitles.srt
```

- **输入**：`subtitles.srt`
- **输出**：`subtitles_translated.srt`（保存在相同目录下）

#### 2. 使用敏感模式翻译字幕文件

```bash
node translateSubtitles.js subtitles.srt sensitive
```

- **输入**：`subtitles.srt`
- **输出**：`subtitles_translated.srt`（保存在相同目录下）
- **模式**：敏感内容

## 注意事项

- **字幕文件格式**：脚本支持常见的字幕文件格式，如 `.srt` 或 `.lrc`。确保您的输入文件格式正确。
- **OpenAI API 密钥**：需要您的 API 密钥才能访问 OpenAI API。请确保其安全，不要公开分享。
- **令牌限制**：脚本根据最大令牌限制自动将输入文件拆分为较小的部分，以符合 API 的限制。
- **费用估算**：脚本根据令牌使用量估算每次翻译请求的费用，并在控制台中显示。

## 错误处理

- 如果脚本遇到错误（例如缺少输入文件、API 失败），它将输出错误消息，并在适用的情况下尝试重试。
- 未成功翻译的部分将保存到一个名为 `<input_filename>_failed.<extension>` 的单独文件中，以供进一步检查。