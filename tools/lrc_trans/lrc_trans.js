const fs = require('fs').promises; // 使用 promises API
const axios = require('axios');
const path = require('path');
const { encode } = require('gpt-3-encoder'); // 引入 GPT-3 Encoder

// 读取 API 密钥
const readApiKey = async () => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../../apiKey.json'), 'utf-8');
        const json = JSON.parse(data);
        if (!json.apiKey) {
            throw new Error('API 密钥为空，请在 apiKey.json 中设置 apiKey');
        }
        return json.apiKey;
    } catch (error) {
        console.error('读取 API 密钥失败:', error.message);
        process.exit(1);
    }
};

// 设置OpenAI API密钥和端点
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// 定义费用标准
const COST_PER_MIL_INPUT = 2.50; // 每百万输入token的费用
const COST_PER_MIL_OUTPUT = 10.00; // 每百万输出token的费用

// 重试次数
const MAX_RETRIES = 3;

// 根据模式设置最大token数
const setMaxTokens = (mode) => {
    switch (mode) {
        case 'sensitive':
            return 100; // 敏感内容
        case 'normal':
        default:
            return 1200; // 常规内容
    }
};

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
    return encode(text).length; // 使用gpt-3-encoder来准确计算tokens数
};

// 翻译字幕
const translateSubtitles = async (subtitles, previousTranslation = '', maxTokens, apiKey) => {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
        try {
            const inputTokens = countTokens(subtitles);
            const response = await axios.post(ENDPOINT, {
                model: 'gpt-4o', // 使用gpt-4o模型
                messages: [{
                    role: 'user',
                    content: `将以下字幕内容翻译为中日双语，每行日语后面紧跟着对应的中文，保持连贯性，格式如下:\n` +
                             `[00:00.05]おねだりにしてみてほしいの\n` +
                             `[00:00.05]想让我撒娇试试看\n` +
                             `前面的翻译内容是:\n${previousTranslation}\n` +
                             `请处理以下内容:\n\n${subtitles}`
                }],
                max_tokens: 3500, // 这里不用改
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
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
            console.log("🚀 ~ translateSubtitles ~ error:", error);
            attempts++;
            console.error(`翻译请求失败，尝试 ${attempts}/${MAX_RETRIES} 次:`, error.message);
            if (attempts >= MAX_RETRIES) {
                console.warn('所有尝试均失败，跳过该部分翻译。');
                return null; // 返回null以指示失败
            }
        }
    }
};

// 根据最大token数分割字幕内容
const splitSubtitles = (subtitles, maxTokens) => {
    const parts = [];
    let currentPart = '';

    const lines = subtitles.split('\n');
    for (const line of lines) {
        const tokens = countTokens(line);
        if ((countTokens(currentPart) + tokens) > maxTokens) {
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

// 保存未成功翻译部分到文件
const saveFailedTranslations = async (failedContent, outputPath) => {
    try {
        await fs.writeFile(outputPath, failedContent, 'utf-8');
        console.log(`未成功翻译的部分已保存到 ${outputPath}`);
    } catch (error) {
        console.error('保存未成功翻译部分失败:', error);
    }
};

// 主函数
const main = async () => {
    const inputFilePath = process.argv[2]; // 从命令行参数获取输入文件路径
    const mode = process.argv[3] || 'normal'; // 获取模式参数，默认为 'normal'

    if (!inputFilePath) {
        console.error('请提供输入文件路径。');
        process.exit(1);
    }

    const apiKey = await readApiKey(); // 读取 API 密钥
    const maxTokens = setMaxTokens(mode); // 设置最大token数
    const startTime = Date.now(); // 开始计时

    try {
        const subtitles = await readSubtitles(inputFilePath);
        const subtitleParts = splitSubtitles(subtitles, maxTokens);
        const totalParts = subtitleParts.length;

        const translatedParts = [];
        const failedParts = []; // 存储失败的部分
        let previousTranslation = ''; // 保存上一部分翻译的最后一小段

        for (let i = 0; i < totalParts; i++) {
            const part = subtitleParts[i];
            console.log(`正在翻译部分 ${i + 1} / ${totalParts}，输入 Tokens: ${countTokens(part)}`);
            const translatedPart = await translateSubtitles(part, previousTranslation, maxTokens, apiKey);
            if (translatedPart) {
                translatedParts.push(translatedPart); // 只有在成功时添加
                // 更新上下文，仅保留最后一小段
                const lastLines = translatedPart.split('\n').slice(-2).join('\n'); // 仅保留最后两行
                previousTranslation = lastLines; // 更新上下文
            } else {
                failedParts.push(part); // 记录失败的部分
            }
        }

        // 合并翻译内容，并去除可能的开头和结尾的反引号和类型词
        let finalTranslation = translatedParts.join('\n');
        finalTranslation = finalTranslation
            .replace(/^\s*```(lrc|plaintext)?\s*/g, '')
            .replace(/^\s*```/g, '')
            .replace(/```$/g, '')
            .trim();

        // 删除不是以 [ 开头的行
        finalTranslation = finalTranslation
            .split('\n')
            .filter(line => line.startsWith('['))
            .join('\n');

        // 生成输出文件路径
        const outputFilePath = path.join(
            path.dirname(inputFilePath),
            `${path.basename(inputFilePath, path.extname(inputFilePath))}_translated${path.extname(inputFilePath)}`
        );

        await saveTranslatedSubtitles(finalTranslation, outputFilePath);

        // 如果有失败的部分，保存到另一个文件
        if (failedParts.length > 0) {
            const failedOutputFilePath = path.join(
                path.dirname(inputFilePath),
                `${path.basename(inputFilePath, path.extname(inputFilePath))}_failed${path.extname(inputFilePath)}`
            );
            await saveFailedTranslations(failedParts.join('\n'), failedOutputFilePath);
        }

        const endTime = Date.now(); // 结束计时
        const duration = ((endTime - startTime) / 1000).toFixed(2); // 转换为秒
        console.log(`翻译完成，结果已保存到 ${outputFilePath}，用时: ${duration}秒`);
    } catch (error) {
        console.error('主函数执行失败:', error);
    }
};

main();
