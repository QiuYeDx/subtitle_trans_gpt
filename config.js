const deepSeekApiKey = "";
const openaiApiKey = "";

const Model = Object.freeze({
  DeepSeek: "deepSeek",
  OpenAI: "openai",
});

// 获取 API Key
const getApiKeyByModel = (model) => {
  switch (model) {
    case Model.DeepSeek:
      return deepSeekApiKey;
    case Model.OpenAI:
      return openaiApiKey;
    default:
      return openaiApiKey;
  }
};

// 获取 API EndPoint
const getApiEndPoint = (model) => {
  switch (model) {
    case Model.DeepSeek:
      return "https://api.deepseek.com/v1/chat/completions";
    case Model.OpenAI:
      return "https://api.openai.com/v1/chat/completions";
    default:
      return "https://api.openai.com/v1/chat/completions";
  }
};

// 获取 API Model
const getApiModel = (model) => {
  switch (model) {
    case Model.DeepSeek:
      return "deepseek-chat";
    case Model.OpenAI:
      return "gpt-4o";
    default:
      return "gpt-4o";
  }
};

// 每百万输入/输出 tokens 的成本($)
const getCostPerMillionTokens = (model) => {
  switch (model) {
    case Model.DeepSeek:
      return {
        input: 0.27,
        output: 1.1,
      };
    case Model.OpenAI:
      return {
        input: 2.5,
        output: 10,
      };
    default:
      return {
        input: 2.5,
        output: 10,
      };
  }
}

// 切换当前使用的模型
const currModel = Model.DeepSeek;

const apiKey = getApiKeyByModel(currModel);

const apiEndPoint = getApiEndPoint(currModel);

const apiModel = getApiModel(currModel);

const apiCost = getCostPerMillionTokens(currModel);

module.exports = {
  apiKey,
  apiEndPoint,
  apiModel,
  apiCost,
}
