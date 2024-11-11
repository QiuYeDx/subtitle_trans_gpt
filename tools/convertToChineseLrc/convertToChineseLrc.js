const fs = require('fs');
const path = require('path');

// 获取命令行参数中的输入和输出文件路径
const args = process.argv.slice(2);
const inputLrcFilePath = args[0]; // 输入的 LRC 文件路径

// 如果没有提供输出文件路径，默认使用输入文件同目录下的文件名加 '_cn.lrc'
const outputLrcFilePath = args[1] || path.join(
    path.dirname(inputLrcFilePath),
    path.basename(inputLrcFilePath, path.extname(inputLrcFilePath)) + '_cn.lrc'
);

if (!inputLrcFilePath) {
    console.error('请提供要转换的 LRC 文件路径。');
    console.error('用法：node convertToChineseLrc.js input.lrc [output.lrc]');
    process.exit(1);
}

// 读取 LRC 文件
fs.readFile(inputLrcFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('读取 LRC 文件失败:', err.message);
        process.exit(1);
    }

    const lines = data.split('\n');

    const outputLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // 匹配时间戳和文本，支持任意位数的分钟数和可选的毫秒数
        const match = line.match(/^\[(\d+:\d{2}(?:\.\d+)?)\](.*)/);
        if (match) {
            const timestamp = match[1];
            const text = match[2].trim();

            // 获取下一行，检查是否是同样的时间戳
            const nextLine = lines[i + 1] ? lines[i + 1].trim() : null;
            let nextMatch = null;
            if (nextLine) {
                nextMatch = nextLine.match(/^\[(\d+:\d{2}(?:\.\d+)?)\](.*)/);
            }

            const currentTime = parseTimestamp(timestamp);
            let nextTime = null;
            if (nextMatch) {
                nextTime = parseTimestamp(nextMatch[1]);
            }

            if (nextMatch && currentTime === nextTime) {
                // 存在下一行，且时间戳相同，假设第二行是中文
                const chineseText = nextMatch[2].trim();
                outputLines.push(`[${timestamp}]${chineseText}`);
                // 跳过下一行
                i++;
            } else {
                // 没有下一行或者时间戳不同，检查当前行是否是中文
                if (containsChinese(text)) {
                    outputLines.push(`[${timestamp}]${text}`);
                }
            }
        } else {
            // 非字幕行，直接跳过或处理
        }
    }

    // 保存输出的 LRC 文件
    fs.writeFile(outputLrcFilePath, outputLines.join('\n'), 'utf-8', (err) => {
        if (err) {
            console.error('保存 LRC 文件失败:', err.message);
            process.exit(1);
        }
        console.log('LRC 文件已生成:', outputLrcFilePath);
    });
});

// 辅助函数：判断字符串是否包含中文字符
function containsChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

// 辅助函数：将时间戳转换为毫秒数
function parseTimestamp(timestamp) {
    const match = timestamp.match(/^(\d+):(\d{2})(?:\.(\d+))?$/);
    if (!match) return null;
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    let milliseconds = 0;
    if (match[3]) {
        let ms = match[3];
        if (ms.length > 3) {
            ms = ms.slice(0, 3); // 取前三位，忽略多余的位数
        } else {
            ms = ms.padEnd(3, '0'); // 不足三位，补充为三位
        }
        milliseconds = parseInt(ms, 10);
    }
    return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
}
