import { create } from 'venom-bot';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const config = new Configuration({
  apiKey: process.env.OPENAI_KEY,
  organization: process.env.ORGANIZATION_ID,
});

const openai = new OpenAIApi(config);

const getDavinciResponse = async (clientText) => {
  const options = {
    model: 'text-davinci-003',
    prompt: clientText,
    max_tokens: 4000,
    temperature: 1,
  };

  try {
    const response = await openai.createCompletion(options);
    let botAnswer = '';
    response.data.choices.forEach(({ text }) => {
      botAnswer += text;
    });
    return `Chat GPT\n\n ${botAnswer.trim()}`;
  } catch (e) {
    return `Erro na resposta: ${e.response.data.error.message}`;
  }
};

const getDalleResponse = async (clientText) => {
  const options = {
    prompt: clientText,
    n: 1,
    size: '1024x1024',
  };

  try {
    const response = await openai.createImage(options);
    return response.data.data[0].url;
  } catch (e) {
    return `Erro na resposta: ${e.response.data.error.message}`;
  }
};

const commands = (client, message) => {
  try {
    const iaCommands = {
      davinci3: '/bot',
      dalle: '/img',
    };

    const firstWord = message.text?.substring(0, message.text.indexOf(' '));

    if (firstWord === iaCommands.davinci3) {
      const question = message.text.substring(message.text.indexOf(' '));
      getDavinciResponse(question).then((response) => {
        client.sendText(
          message.from === process.env.BOT_NUMBER ? message.to : message.from,
          response,
        );
      });
    }
    if (firstWord === iaCommands.dalle) {
      const imgDescription = message.text.substring(message.text.indexOf(' '));
      getDalleResponse(imgDescription, message).then((imgUrl) => {
        client.sendImage(
          message.from === process.env.BOT_NUMBER ? message.to : message.from,
          imgUrl,
          imgDescription,
          'IA DALLE',
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
};

async function start(client) {
  try {
    client.onAnyMessage((message) => commands(client, message));
  } catch (error) {
    console.log(error);
  }
}

create({
  session: 'Chat-GPT',
  multidevice: true,
})
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });
