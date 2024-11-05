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

// 示例用法：
// const subtitleText = `
// 2
// 00:00:00,300 --> 00:00:15,300  
// 作詞・作曲・編曲 初音ミク  
// 作词·作曲·编曲 初音未来

// 4
// 00:00:15,300 --> 00:01:24,830  
// 立ち止まって 振り返って  
// 停下脚步 回头看去  

// 00:01:24,830 --> 00:01:27,830  
// 止めどない今日を嘆き合った  
// 为无尽的今天互相叹息  

// 00:01:27,830 --> 00:01:34,220  
// 記憶も意識って  
// 记忆也是意识地  

// 3
// 00:01:34,220 --> 00:01:37,220  
// 僕はずっと ガキ虫って  
// 我一直是个小孩子  

// 00:01:37,220 --> 00:01:39,220  
// 心の隅っこで泣いた  
// 在心底的角落哭泣  

// 00:01:39,220 --> 00:01:42,220  
// そこで泣いた そしてどうか  
// 在那里哭泣 然后请  

// 00:01:42,220 --> 00:01:45,220  
// 失くさないでよって降下した  
// 请求不要失去 我降下了  

// 00:01:45,220 --> 00:01:50,220  
// 過ぎる日々を後悔してんだよって  
// 说对于逝去的日子感到后悔  

// 00:01:50,220 --> 00:01:54,220  
// そう言い逃したあの日  
// 在那天没能这样说出口  

// 00:02:05,220 --> 00:02:08,220  
// 繋ぎ合った 時もあった  
// 也曾有过相连的时光  

// 00:02:08,220 --> 00:02:11,540  
// ほどけない感情を持ち寄って  
// 带着无法解开的感情
// `;

// console.log(fixSrtSubtitles(subtitleText));
