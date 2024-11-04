const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

// 默认值
let lrcFilePath = null;
let srtFilePath = null;
let mode = 'dual'; // 默认为 'dual' 模式

// 解析命令行参数
args.forEach(arg => {
    if (arg.startsWith('--mode=')) {
        mode = arg.split('=')[1];
    } else if (!lrcFilePath) {
        lrcFilePath = arg;
    } else if (!srtFilePath) {
        srtFilePath = arg;
    }
});

if (!lrcFilePath) {
    console.error('请提供要转换的 LRC 文件路径。');
    console.error('用法：node convertLrcToSrt.js input.lrc [output.srt] [--mode=模式]');
    console.error('模式可选值：dual（中日双语，默认），chinese（仅中文字幕）');
    process.exit(1);
}

// 如果没有提供输出文件路径，默认使用输入文件同目录下的同名文件，扩展名为 .srt
if (!srtFilePath) {
    srtFilePath = path.join(
        path.dirname(lrcFilePath),
        path.basename(lrcFilePath, path.extname(lrcFilePath)) + '.srt'
    );
}

// 读取 LRC 文件
fs.readFile(lrcFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('读取 LRC 文件失败:', err.message);
        process.exit(1);
    }

    const lines = data.split('\n');
    let srtContent = '';
    let index = 1;

    // 存储时间戳和文本内容
    const entries = [];

    // 解析 LRC 文件
    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
        if (match) {
            let minutes = parseInt(match[1]);
            let seconds = parseFloat(match[2]);
            const text = match[3].trim();
            let hours = 0;

            // 如果分钟数超过59，进位到小时
            if (minutes >= 60) {
                hours = Math.floor(minutes / 60);
                minutes = minutes % 60;
            }

            const timestamp = { hours, minutes, seconds };
            entries.push({ timestamp, text });
        }
    });

    if (mode === 'chinese') {
        // 仅提取中文字幕
        const chineseEntries = [];
        for (let i = 1; i < entries.length; i += 2) {
            chineseEntries.push(entries[i]);
        }

        // 生成 SRT 内容
        for (let i = 0; i < chineseEntries.length; i++) {
            const startTimestamp = chineseEntries[i].timestamp;
            let endTimestamp;

            // 如果有下一条中文字幕，结束时间为下一条字幕的开始时间
            if (i + 1 < chineseEntries.length) {
                endTimestamp = chineseEntries[i + 1].timestamp;
            } else {
                // 对于最后一条字幕，假设延续2秒
                endTimestamp = addSecondsToTimestamp(startTimestamp, 2);
            }

            const startTime = formatTime(startTimestamp);
            const endTime = formatTime(endTimestamp);

            const subtitleText = chineseEntries[i].text;

            srtContent += `${index++}\n${startTime} --> ${endTime}\n${subtitleText}\n\n`;
        }
    } else if (mode === 'dual') {
        // 中日双语模式
        for (let i = 0; i < entries.length; i += 2) {
            const startTimestamp = entries[i].timestamp;
            let endTimestamp;

            // 如果有下一条字幕，设置当前字幕的结束时间为下一条字幕的开始时间
            if (i + 2 < entries.length) {
                endTimestamp = entries[i + 2].timestamp;
            } else {
                // 对于最后一对字幕，假设延续2秒
                endTimestamp = addSecondsToTimestamp(startTimestamp, 2);
            }

            const startTime = formatTime(startTimestamp);
            const endTime = formatTime(endTimestamp);

            // 确保有两行字幕可用
            if (entries[i + 1]) {
                const subtitleText = `${entries[i].text}\n${entries[i + 1].text}`;
                srtContent += `${index++}\n${startTime} --> ${endTime}\n${subtitleText}\n\n`;
            }
        }
    } else {
        console.error('无效的模式参数。可选值为 "dual" 或 "chinese"。');
        process.exit(1);
    }

    // 保存 SRT 文件
    fs.writeFile(srtFilePath, srtContent, 'utf-8', (err) => {
        if (err) {
            console.error('保存 SRT 文件失败:', err.message);
            process.exit(1);
        }
        console.log('SRT 文件已生成:', srtFilePath);
    });
});

// 辅助函数：格式化时间戳
function formatTime(timestamp) {
    const hours = String(timestamp.hours).padStart(2, '0');
    const minutes = String(timestamp.minutes).padStart(2, '0');
    const totalSeconds = timestamp.seconds.toFixed(2);
    const [secPart, msPart] = totalSeconds.split('.');
    const seconds = String(secPart).padStart(2, '0');
    const milliseconds = String(msPart).padEnd(3, '0');
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
}

// 辅助函数：为时间戳增加秒数
function addSecondsToTimestamp(timestamp, secondsToAdd) {
    let hours = timestamp.hours;
    let minutes = timestamp.minutes;
    let seconds = timestamp.seconds + secondsToAdd;

    while (seconds >= 60) {
        seconds -= 60;
        minutes += 1;
    }
    while (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    }

    return { hours, minutes, seconds };
}
