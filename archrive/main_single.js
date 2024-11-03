const fs = require('fs').promises; // 使用 promises API
const axios = require('axios');
const path = require('path');

// 设置OpenAI API密钥和端点
const API_KEY = ''; // 替换为你的API密钥
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_TOKENS = 3500; // 设置每次请求的最大token数

// 定义费用标准
const COST_PER_MIL_INPUT = 2.50; // 每百万输入token的费用
const COST_PER_MIL_OUTPUT = 10.00; // 每百万输出token的费用

// 读取字幕文件
const readSubtitles = async (filePath) => {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error('读取字幕文件失败:', error);
        throw error;
    }
};

// 统计tokens数
const countTokens = (text) => {
    return text.split(/\s+/).length; // 简单计算tokens数
};

// 翻译字幕
const translateSubtitles = async (subtitles) => {
    try {
        const inputTokens = countTokens(subtitles);
        const response = await axios.post(ENDPOINT, {
            model: 'gpt-4o', // 使用gpt-4o模型
            messages: [{
                role: 'user',
                content: `将以下字幕内容翻译为中日双语，每行日语后面紧跟着对应的中文，格式如下:\n` +
                         `[00:00.05]おねだりにしてみてほしいの\n` +
                         `[00:00.05]想让我撒娇试试看\n` +
                         `请处理以下内容:\n\n${subtitles}`
            }],
            max_tokens: MAX_TOKENS,
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const output = response.data.choices[0].message.content;
        const outputTokens = countTokens(output);

        // 计算费用
        const inputCost = (inputTokens / 1_000_000) * COST_PER_MIL_INPUT;
        const outputCost = (outputTokens / 1_000_000) * COST_PER_MIL_OUTPUT;
        const totalCost = inputCost + outputCost;

        console.log(`输入 Tokens: ${inputTokens}, 输出 Tokens: ${outputTokens}, 大致花费: $${totalCost.toFixed(2)}`);

        return output;
    } catch (error) {
        console.error('翻译失败:', error);
        throw error;
    }
};

// 根据最大token数分割字幕内容
const splitSubtitles = (subtitles) => {
    const parts = [];
    let currentPart = '';

    const lines = subtitles.split('\n');
    for (const line of lines) {
        const tokens = countTokens(line);
        if ((currentPart.split(/\s+/).length + tokens) > MAX_TOKENS) {
            parts.push(currentPart);
            currentPart = line; // 开始新的一部分
        } else {
            currentPart += (currentPart ? '\n' : '') + line; // 继续添加到当前部分
        }
    }

    if (currentPart) {
        parts.push(currentPart); // 添加最后一部分
    }

    return parts;
};

// 保存翻译结果到文件
const saveTranslatedSubtitles = async (translatedContent, outputPath) => {
    try {
        await fs.writeFile(outputPath, translatedContent, 'utf-8');
    } catch (error) {
        console.error('保存翻译结果失败:', error);
        throw error;
    }
};

// 主函数
const main = async () => {
    const inputFilePath = process.argv[2]; // 从命令行参数获取输入文件路径

    if (!inputFilePath) {
        console.error('请提供输入文件路径。');
        process.exit(1);
    }

    const startTime = Date.now(); // 开始计时

    try {
        const subtitles = await readSubtitles(inputFilePath);
        const subtitleParts = splitSubtitles(subtitles);
        const totalParts = subtitleParts.length;

        const translatedParts = [];
        for (let i = 0; i < totalParts; i++) {
            const part = subtitleParts[i];
            console.log(`正在翻译部分 ${i + 1} / ${totalParts}，输入 Tokens: ${countTokens(part)}`);
            const translatedPart = await translateSubtitles(part);
            translatedParts.push(translatedPart);
        }

        // 合并翻译内容，并去除可能的开头和结尾的反引号和类型词
        let finalTranslation = translatedParts.join('\n');
        finalTranslation = finalTranslation.replace(/^\s*```(lrc|plaintext)?\s*/g, '').replace(/^\s*```/g, '').replace(/```$/g, '').trim();

        // 生成输出文件路径
        const outputFilePath = path.join(
            path.dirname(inputFilePath),
            `${path.basename(inputFilePath, path.extname(inputFilePath))}_translated${path.extname(inputFilePath)}`
        );

        await saveTranslatedSubtitles(finalTranslation, outputFilePath);
        const endTime = Date.now(); // 结束计时
        const duration = ((endTime - startTime) / 1000).toFixed(2); // 转换为秒
        console.log(`翻译完成，结果已保存到 ${outputFilePath}，用时: ${duration}秒`);
    } catch (error) {
        console.error('主函数执行失败:', error);
    }
};

main();
