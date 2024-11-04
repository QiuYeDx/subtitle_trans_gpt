const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

let lrcFilePath = args[0];
let srtFilePath = args[1];

if (!lrcFilePath) {
    console.error('请提供要转换的 LRC 文件路径。');
    console.error('用法：node chineseLrcToSrt.js input.lrc [output.srt]');
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

    // 解析 LRC 文件并生成 SRT 内容
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);

        if (match) {
            let hours = 0;
            let minutes = parseInt(match[1]);
            let seconds = parseFloat(match[2]);
            const text = match[3].trim();

            // 如果分钟数超过59，进位到小时
            if (minutes >= 60) {
                hours = Math.floor(minutes / 60);
                minutes = minutes % 60;
            }

            // 计算结束时间，默认为当前字幕持续2秒，或者直到下一个字幕的开始时间
            let endHours = hours;
            let endMinutes = minutes;
            let endSeconds = seconds + 2; // 默认持续2秒

            // 如果有下一条字幕，用下一条字幕的开始时间作为当前字幕的结束时间
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                const nextMatch = nextLine.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
                if (nextMatch) {
                    endHours = 0;
                    endMinutes = parseInt(nextMatch[1]);
                    endSeconds = parseFloat(nextMatch[2]);

                    // 如果分钟数超过59，进位到小时
                    if (endMinutes >= 60) {
                        endHours = Math.floor(endMinutes / 60);
                        endMinutes = endMinutes % 60;
                    }
                    break;
                }
            }

            // 处理秒和分钟的进位
            while (endSeconds >= 60) {
                endSeconds -= 60;
                endMinutes += 1;
            }
            while (endMinutes >= 60) {
                endMinutes -= 60;
                endHours += 1;
            }

            const startTime = formatTime({ hours, minutes, seconds });
            const endTime = formatTime({ hours: endHours, minutes: endMinutes, seconds: endSeconds });

            srtContent += `${index}\n${startTime} --> ${endTime}\n${text}\n\n`;
            index++;
        }
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
    const milliseconds = String(Math.round(parseFloat('0.' + msPart) * 1000)).padStart(3, '0');

    return `${hours}:${minutes}:${seconds},${milliseconds}`;
}
