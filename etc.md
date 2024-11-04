生成带有字幕的视频可以使用 FFmpeg，这是一个强大的多媒体处理工具。以下是基本步骤：

### 1. 安装 FFmpeg

如果还没有安装 FFmpeg，可以通过以下方式安装：

- **Windows**: 下载 [FFmpeg](https://ffmpeg.org/download.html) 的可执行文件，并将其路径添加到环境变量。
- **macOS**: 使用 Homebrew 安装：
  ```bash
  brew install ffmpeg
  ```
- **Linux**: 使用包管理器，例如在 Ubuntu 上：
  ```bash
  sudo apt-get install ffmpeg
  ```

### 2. 准备视频和 LRC 字幕文件

确保你有一个视频文件（如 `video.mp4`）和相应的 LRC 字幕文件（如 `subtitles.lrc`）。

### 3. 将 LRC 转换为 SRT 格式

FFmpeg 通常支持 SRT 字幕格式，而 LRC 格式不直接兼容。你需要将 LRC 文件转换为 SRT 格式。可以使用以下脚本（Node.js 示例）：

```javascript
const fs = require('fs');

const lrcFilePath = 'subtitles.lrc';
const srtFilePath = 'subtitles.srt';

// 读取 LRC 文件
fs.readFile(lrcFilePath, 'utf-8', (err, data) => {
    if (err) throw err;

    const lines = data.split('\n');
    let srtContent = '';
    let index = 1;

    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
        if (match) {
            const minutes = match[1];
            const seconds = match[2].replace('.', ','); // SRT 使用,作为小数点
            const text = match[3].trim();
            const startTime = `${minutes}:${seconds}`;
            const endTime = `${minutes}:${(parseFloat(seconds.replace(',', '.')) + 2).toFixed(2).replace('.', ',')}`; // 假设每行持续2秒

            srtContent += `${index++}\n${startTime} --> ${endTime}\n${text}\n\n`;
        }
    });

    // 保存 SRT 文件
    fs.writeFile(srtFilePath, srtContent, 'utf-8', (err) => {
        if (err) throw err;
        console.log('SRT 文件已生成:', srtFilePath);
    });
});
```

### 4. 使用 FFmpeg 添加字幕

转换为 SRT 后，可以使用 FFmpeg 将字幕嵌入视频。运行以下命令：

```bash
ffmpeg -i video.mp4 -i subtitles.srt -c:v copy -c:a copy -c:s mov_text output_video.mp4
```

- `-i video.mp4`: 输入视频文件
- `-i subtitles.srt`: 输入字幕文件
- `-c:v copy`: 复制视频流
- `-c:a copy`: 复制音频流
- `-c:s mov_text`: 将字幕转换为适合 MP4 的格式
- `output_video.mp4`: 输出视频文件

### 5. 播放带字幕的视频

完成后，可以用任何支持字幕的视频播放器播放生成的 `output_video.mp4` 文件。
