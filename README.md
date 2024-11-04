# 字幕翻译工具

该工具使用 OpenAI 的 GPT-4o 模型将字幕文件翻译为中日双语，并以 LRC 格式输出。支持配置模式来决定最大 token 数。

## 特性

- 支持将字幕文件翻译为中日双语。
- 输出格式遵循 LRC 格式。
- 支持通过命令行参数选择不同的配置模式（常规或敏感）。
- 支持请求重试机制，确保翻译过程的稳定性。
- 能够记录翻译过程中的失败部分并将其保存到单独的文件中。
- 统计输入和输出的 token 数量，估算费用。

## 安装依赖

在开始之前，请确保你已安装 Node.js 和 npm。然后在项目目录中运行以下命令安装所需依赖：

```bash
npm install
```

## 使用说明

### 1. 获取 OpenAI API 密钥

请访问 [OpenAI 官网](https://openai.com/) 获取你的 API 密钥，并将其替换到`apiKey.json`中。

### 2. 运行脚本

可以通过命令行运行脚本，并传入输入文件路径和可选模式参数。

```bash
node main.js <输入文件路径> [模式]
```

- `<输入文件路径>`：需要翻译的字幕文件路径（支持 `.srt`、`.lrc` 等格式）。
- `[模式]`（可选）：指定翻译模式。可用值为 `normal`（默认）或 `sensitive`。

**示例：**

```bash
node main.js subtitles.srt normal
```

或

```bash
node main.js subtitles.srt sensitive
```

### 3. 输出结果

翻译结果将保存在输入文件同一目录下，文件名为 `<输入文件名>_translated<扩展名>`，未成功翻译的部分将保存在 `<输入文件名>_failed<扩展名>` 文件中。

### 4. 费用估算

脚本会在翻译过程中统计输入和输出的 token 数量，并根据以下标准估算费用：

- 输入 token：$2.50 / 1M
- 输出 token：$10.00 / 1M

## 注意事项

- 确保网络连接正常，以便与 OpenAI API 进行通信。
- 大文件翻译可能会消耗较长时间，具体取决于文件大小和网络状况。
- 频繁的请求可能会受到 API 限制，请合理安排翻译任务。

## TODO

- 翻译时间轴单调递增合法性检测
- 控制台打印美化
- 字幕按时间轴排序，用来自动合并多个字幕文件
- 支持直接转换 SRT 字幕格式
- 支持 LRC 转 SRT 字幕格式
- Bilibili SRT 字幕显示不支持双行并列显示，还得支持仅输出中文字幕
