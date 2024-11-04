const fs = require('fs');

const lrcFilePath = 'subtitles.lrc';
const srtFilePath = 'subtitles.srt';

// 读取 LRC 文件
fs.readFile(lrcFilePath, 'utf-8', (err, data) => {
    if (err) throw err;

    const lines = data.split('\n');
    let srtContent = '';
    let index = 1;

    // 存储时间戳和文本内容
    const entries = [];

    // 解析 LRC 文件
    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = match[2];
            const text = match[3].trim();
            const timestamp = { hours: 0, minutes, seconds }; // 初始化时间戳

            // 如果分钟数超过59，进位到小时
            if (minutes >= 60) {
                timestamp.hours = Math.floor(minutes / 60);
                timestamp.minutes = minutes % 60;
            }

            entries.push({ timestamp, text });
        }
    });

    // 生成 SRT 内容
    for (let i = 0; i < entries.length; i += 2) {
        const startTime = `${String(entries[i].timestamp.hours).padStart(2, '0')}:${String(entries[i].timestamp.minutes).padStart(2, '0')}:${entries[i].timestamp.seconds.replace('.', ',')}`;
        let endTime;

        // 如果有下一条字幕，设置当前字幕的结束时间为下一条字幕的开始时间
        if (i + 2 < entries.length) {
            endTime = `${String(entries[i + 2].timestamp.hours).padStart(2, '0')}:${String(entries[i + 2].timestamp.minutes).padStart(2, '0')}:${entries[i + 2].timestamp.seconds.replace('.', ',')}`;
        } else {
            // 对于最后一对字幕，假设延续2秒
            const secondsArray = startTime.split(':');
            const totalSeconds = parseFloat(secondsArray[2].replace(',', '.')) + 2; // 转换回浮点数加2
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = (totalSeconds % 60).toFixed(2); // 保留两位小数
            const milliseconds = Math.round((seconds % 1) * 100); // 计算毫秒部分
            const formattedSeconds = Math.floor(seconds).toString().padStart(2, '0'); // 确保秒数两位
            endTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${formattedSeconds.replace('.', ',')}`; // 格式化为 hh:mm:ss,ms
        }

        // 确保有两行字幕可用
        if (entries[i + 1]) {
            srtContent += `${index++}\n${startTime} --> ${endTime}\n${entries[i].text}\n${entries[i + 1].text}\n\n`;
        }
    }

    // 保存 SRT 文件
    fs.writeFile(srtFilePath, srtContent, 'utf-8', (err) => {
        if (err) throw err;
        console.log('SRT 文件已生成:', srtFilePath);
    });
});
