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
            const minutes = match[1];
            const seconds = match[2].replace('.', ','); // SRT 使用,作为小数点
            const text = match[3].trim();
            const timestamp = `${minutes}:${seconds}`;
            entries.push({ timestamp, text });
        }
    });

    // 生成 SRT 内容
    for (let i = 0; i < entries.length; i += 2) {
        const startTime = entries[i].timestamp;
        let endTime;

        // 如果有下一条字幕，设置当前字幕的结束时间为下一条字幕的开始时间
        if (i + 2 < entries.length) {
            endTime = entries[i + 2].timestamp; // 下一句的开始时间
        } else {
            // 对于最后一对字幕，假设延续2秒
            const secondsArray = startTime.split(':');
            const seconds = parseFloat(secondsArray[1].replace(',', '.')) + 2;
            endTime = `${secondsArray[0]}:${seconds.toFixed(2).replace('.', ',')}`; 
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
