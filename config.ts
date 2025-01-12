const deepSeekApiKey = "";
const openaiApiKey = "";

enum Model {
  DeepSeek = "deepSeek",
  OpenAI = "openai",
}

// 获取 API Key
const getApiKeyByModel = (model: Model) => {
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
const getApiEndPoint = (model: Model) => {
  switch (model) {
    case Model.DeepSeek:
      return "https://api.deepseek.com";
    case Model.OpenAI:
      return "https://api.openai.com/v1/chat/completions";
    default:
      return "https://api.openai.com/v1/chat/completions";
  }
};

// 获取 API Model
const getApiModel = (model: Model) => {
  switch (model) {
    case Model.DeepSeek:
      return "deepseek-chat";
    case Model.OpenAI:
      return "gpt-4o";
    default:
      return "gpt-4o";
  }
};

// 切换当前使用的模型
const currModel = Model.DeepSeek;

export const apiKey = getApiKeyByModel(currModel);

export const apiEndPoint = getApiEndPoint(currModel);

export const apiModel = getApiModel(currModel);
