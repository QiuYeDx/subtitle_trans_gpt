const fs = require('fs').promises; // 使用 promises API
const axios = require('axios');
const path = require('path');
const { encode } = require('gpt-3-encoder'); // 引入 GPT-3 Encoder

const { apiKey, apiEndPoint, apiModel } = require('../../config.js');

// 设置 API 端点
const ENDPOINT = apiEndPoint;
// 设置 API Model
const API_MODEL = apiModel;

// 定义费用标准
const COST_PER_MIL_INPUT = 2.50; // 每百万输入 token 的费用
const COST_PER_MIL_OUTPUT = 10.00; // 每百万输出 token 的费用

// 重试次数
const MAX_RETRIES = 3;

// 根据模式设置最大 token 数
const setMaxTokens = (mode) => {
  switch (mode) {
    case 'sensitive':
      return 300; // 敏感内容
    case 'normal':
    default:
      return 3000; // 常规内容
  }
};

// 读取 SRT 文件
const readSrtFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('读取 SRT 文件失败:', error);
    throw error;
  }
};

// 统计 tokens 数
const countTokens = (text) => {
  return encode(text).length; // 使用 gpt-3-encoder 来准确计算 tokens 数
};

// 翻译字幕
const translateSubtitles = async (subtitles, previousTranslation = '', maxTokens, apiKey) => {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const inputTokens = countTokens(subtitles);
      const response = await axios.post(ENDPOINT, {
        model: API_MODEL,
        messages: [{
          role: 'user',
          content: `将以下字幕内容翻译为中日双语，每行日语后面紧跟着对应的中文，保持连贯性，格式如下:\n` +
            `1\n` +
            `00:00:53,620 --> 00:00:55,620\n` +
            `ゴーって言ってます\n` +
            `说要开始了\n` +
            `前面的翻译内容是:\n${previousTranslation}\n` +
            `请处理以下内容:\n\n${subtitles}` + 
            `只回复我有效的字幕文件内容，不要添加额外的markdown格式或其他话语！`
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

      console.log(`输入 Tokens: ${inputTokens}, 输出 Tokens: ${outputTokens}, 本次花费: $${totalCost.toFixed(4)}`);

      return { output, totalCost }; // 返回翻译结果和本次花费
    } catch (error) {
      attempts++;
      console.error(`翻译请求失败，尝试 ${attempts}/${MAX_RETRIES} 次:`, error.message);
      if (attempts >= MAX_RETRIES) {
        console.warn('所有尝试均失败，跳过该部分翻译。');
        return null; // 返回 null 以指示失败
      }
    }
  }
};

// 根据最大 token 数分割字幕内容
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

// 清理 SRT 文件中的 Markdown 代码块
const removeMarkdownCodeBlocks = (srtContent) => {
  return srtContent.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '');
};

// 确保字幕序号从 1 开始递增
const renumberSrt = (srtContent) => {
  const lines = srtContent.split('\n');
  let index = 1;
  let newSrt = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\d+$/)) {
      newSrt += `${index}\n`; // 重新编号
      index++;
    } else {
      newSrt += lines[i] + '\n'; // 保留原内容
    }
  }

  return newSrt.trim();
};

// 最后的 SRT 格式修复
function fixSrtSubtitles(subtitleText) {
  // 按照空行（即字幕块之间的分隔）将字幕文本拆分成多个块
  const subtitles = subtitleText.trim().split('\n\n');

  // 用来存储修正后的字幕内容
  let correctedSubtitles = '';

  // 遍历每个字幕块，重新分配正确的编号
  subtitles.forEach((subtitle, index) => {
    // 将每个字幕块分割成时间戳和字幕文本
    let parts = subtitle.split('\n');

    if (parts.length === 3) {
      // 获取时间戳部分（即字幕的开始和结束时间）
      const timestamp = parts[0];

      // 剩余部分是字幕文本，将其合并成一块
      const subtitleText = parts.slice(1).join('\n');

      // 将修正后的字幕加入到最终结果中，编号从1开始递增
      correctedSubtitles += `${index + 1}\n${timestamp}\n${subtitleText}\n\n`;
    } else if (parts.length === 4) {
      parts = parts.slice(1);
      // 获取时间戳部分（即字幕的开始和结束时间）
      const timestamp = parts[0];

      // 剩余部分是字幕文本，将其合并成一块
      const subtitleText = parts.slice(1).join('\n');

      // 将修正后的字幕加入到最终结果中，编号从1开始递增
      correctedSubtitles += `${index + 1}\n${timestamp}\n${subtitleText}\n\n`;
    }

  });

  // 删除最后一个多余的换行符并返回修正后的字幕文本
  return correctedSubtitles.trim();
}

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
  const mode = process.argv[3] || 'normal'; // 获取模式参数，默认为 'normal'

  if (!inputFilePath) {
    console.error('请提供输入文件路径。');
    process.exit(1);
  }

  const maxTokens = setMaxTokens(mode); // 设置最大 token 数
  const startTime = Date.now(); // 开始计时

  try {
    let srtContent = await readSrtFile(inputFilePath);
    srtContent = removeMarkdownCodeBlocks(srtContent); // 清理 Markdown 代码块
    const subtitleParts = splitSubtitles(srtContent, maxTokens);
    const totalParts = subtitleParts.length;

    const translatedParts = [];
    let previousTranslation = ''; // 保存上一部分翻译的最后一小段
    let totalCost = 0; // 用于累计总花费

    for (let i = 0; i < totalParts; i++) {
      const part = subtitleParts[i];
      console.log(`正在翻译部分 ${i + 1} / ${totalParts}，输入 Tokens: ${countTokens(part)}`);
      const result = await translateSubtitles(part, previousTranslation, maxTokens, apiKey);
      result.output = removeMarkdownCodeBlocks(result.output); // 清理 Markdown 代码块
      if (result) {
        const { output, totalCost: partCost } = result;
        translatedParts.push(output); // 只有在成功时添加
        totalCost += partCost; // 累加本次翻译花费

        // 更新上下文，仅保留最后一小段
        const lastLines = output.split('\n').slice(-4).join('\n'); // 仅保留最后四行
        previousTranslation = lastLines; // 更新上下文
      }
    }

    // 合并翻译内容
    let finalTranslation = translatedParts.join('\n');
    finalTranslation = finalTranslation.trim();

    // 重新编号并确保序号从 1 开始递增
    finalTranslation = renumberSrt(finalTranslation);

    // 最后的 SRT 格式修正
    finalTranslation = fixSrtSubtitles(finalTranslation);

    // 生成输出文件路径
    const outputFilePath = path.join(
      path.dirname(inputFilePath),
      `${path.basename(inputFilePath, path.extname(inputFilePath))}_translated${path.extname(inputFilePath)}`
    );

    await saveTranslatedSubtitles(finalTranslation, outputFilePath);

    const endTime = Date.now(); // 结束计时
    const duration = ((endTime - startTime) / 1000).toFixed(2); // 转换为秒
    console.log(`翻译完成，结果已保存到 ${outputFilePath}，用时: ${duration}秒`);
    console.log(`总花费: $${totalCost.toFixed(4)}`); // 输出总花费，保留四位小数
  } catch (error) {
    console.error('主函数执行失败:', error);
  }
};

main();
