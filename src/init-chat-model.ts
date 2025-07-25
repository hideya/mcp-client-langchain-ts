import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel, BindToolsInput } from '@langchain/core/language_models/chat_models';

// FIXME: no typescript version of init_chat_model()?
// Ref: https://python.langchain.com/api_reference/langchain/chat_models/langchain.chat_models.base.init_chat_model.html

interface ChatModelConfig {
  modelProvider: string;
  model: string;
  temperature?: number;
  maxTokens?: number,
  tools?: BindToolsInput[];
}

export function initChatModel(config: ChatModelConfig): BaseChatModel {
  let model: BaseChatModel;

  const { modelProvider, tools, ...llmConfig } = config;

  try {
    switch (modelProvider.toLowerCase()) {
      case 'openai':
        model = new ChatOpenAI(llmConfig);
        break;

      case 'anthropic':
        model = new ChatAnthropic(llmConfig);
        break;

      case 'google_genai':
        model = new ChatGoogleGenerativeAI(llmConfig);
        break;

      default:
        throw new Error(
          `Unsupported model_provider: ${modelProvider}`,
        );
    }

    if (typeof model?.bindTools === 'function') {
      if (tools && tools.length > 0) {
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        model = (model as { bindTools: Function }).bindTools(tools);
      }
    } else {
      throw new Error(
        `Tool calling unsupported by model_provider: ${modelProvider}`,
      );
    }

    return model;
  } catch (error) {
    throw new Error(`Failed to initialize chat model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
