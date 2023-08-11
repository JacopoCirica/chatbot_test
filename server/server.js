import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import axios from 'axios';

dotenv.config()

const auth_token = 'A8PGWVXYO0M2AF702M8Q30UH5FVO79SGNO43Y9B3'; // Replace with your actual token
const headers = { 'Authorization': `Bearer ${auth_token}` };
var jacopo=''

/*const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
var jacopo='tell me 2+2'
if (process.env.PROMPT1) {
  // La variabile d'ambiente esiste ed ha un valore assegnato diverso da "undefined"
  jacopo=process.env.PROMPT1;
} else {
  // La variabile d'ambiente non esiste o ha un valore "undefined"
  jacopo=process.env.PROMPT;
}


const openai = new OpenAIApi(configuration);*/

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/', async (req, res) => {
  try {
    var previous_message=req.body.previous_message
    
    previous_message = previous_message.replace(/^\[|\]$/g, '').trim();
    console.log(previous_message)
    
    var prompt = req.body.prompt;
    if (process.env.PROMPT1) {
      // La variabile d'ambiente esiste ed ha un valore assegnato diverso da "undefined"
      jacopo=process.env.PROMPT1; 
      
    }

    /*const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${jacopo}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });*/

    const data = {
      "input": {
        "prompt": `The following is a chat between a USER and a helpful ASSISTANT.${jacopo}.\nASSISTANT: ${previous_message}. \nUSER: ${prompt}. \nASSISTANT:`,
        "stream": false,
        "max_new_tokens": 400
      }
    }
    console.log(data)
    const url = 'https://api.runpod.ai/v2/806mdxkq592hd9/runsync';
    const response = await axios.post(url, data, { headers });
    const botResponse = response.data.output; // Get the 'output' from the response
    console.log(data.input.prompt)

    res.status(200).send({
      bot: botResponse
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))

app.get('/sse', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Invia un messaggio di benvenuto al client come primo evento
  //res.write('data: Hello! I am your Digital Evil Twin, a chatbot programmed to respond to any kind of message. Test me!\n\n');

  // Inserisci il client (frontend) nella lista degli ascoltatori
  const client = res;
  
  // Simula un'attività di backend (per esempio, invio di messaggi ad intervalli regolari)
  /*setInterval(() => {
    
    const message = 'Nuovo messaggio dal backend!';
    client.write(`data: ${message}\n\n`);
    
  }, 2000); // Invia un messaggio ogni 2 secondi (puoi regolare l'intervallo a tuo piacimento) */
  /*const checkForMessage = () => {
    if (process.env.GREETING) {
      client.write(`data: PROVA\n\n`); // Invia il messaggio al frontend
      //globalMessage = null; // Resetta la variabile globale dopo aver inviato il messaggio
    }
  };

  // Esegui la funzione di controllo una volta ogni secondo
  const messageInterval = setInterval(checkForMessage, 1000);*/
  const interval = setTimeout(() => {
    const message = 'The presentation has ended and I am no longer available. ';
    client.write(`data: ${message}\n\n`);
  }, "6000000");

  // Gestisci la chiusura della connessione del client
  client.on('close', () => {
    clearInterval(interval); // Smetti di inviare messaggi quando il client si disconnette
  });
});