import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval
let userID=''
let userEmail= false

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}
function generateUniqueUser(){
    
    const randomnumber = Math.random();
    const HexadecimalString = randomnumber.toString(16);

    userID=`user-${HexadecimalString}`;
    console.log(userID)
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

function firstSubmit(){
    const data = new FormData(form)
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
    form.reset()
        // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
    
        // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
        // specific message div 
    const messageDiv = document.getElementById(uniqueId)
    
        // messageDiv.innerHTML = "..."
    loader(messageDiv)

    var firstmessage=data.get('prompt')
    var phrases = [
        "Questa è una frase con una @",
        "Guarda cosa ho trovato: @",
        "Un esempio con @"
    ];
    if (firstmessage.includes("@")) {
        userEmail=true
        var randomIndex = Math.floor(Math.random() * phrases.length); // Genera un indice casuale nell'intervallo dell'array
        var selectedPhrase = phrases[randomIndex]; // Sceglie una frase casuale dall'array
        clearInterval(loadInterval)
        messageDiv.innerHTML = " "
        typeText(messageDiv, selectedPhrase)
        console.log(selectedPhrase);
        
        
    } else {
        console.log("La stringa non contiene il simbolo @");
    }

}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)
    var chatMessage = document.querySelectorAll('.message')
    
    let ciao=[]
    
    chatMessage.forEach((element) => ciao.push(element.innerHTML));
    
    var botmessage=ciao.slice(-1)
    var previousmessage = JSON.stringify(botmessage)
    
    
    
    
    

    
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://chatbot-test-zd9j.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
            previous_message: previousmessage,
            userID: userID
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita il comportamento predefinito del form

    if (userEmail===true) {
        // Fai qualcosa qui se la condizione è verificata
        handleSubmit(event);
    } else {
        firstSubmit()
    }
});


form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        if(userEmail===true){
        handleSubmit(e)
    }else{
        firstSubmit() 
    }
}
})
window.onload = generateUniqueUser()

//code for sending the greetings

const eventSource = new EventSource('https://chatbot-test-zd9j.onrender.com/sse');

eventSource.onmessage = (event) => {
  const message = event.data;
  // Aggiorna l'interfaccia della chat con il messaggio ricevuto dal backend
  // Ad esempio, puoi aggiungere il messaggio a #chat_container
  chatContainer.innerHTML += chatStripe(true, message);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

eventSource.onerror = (event) => {
  console.error('Error with SSE:', event);
  eventSource.close();
};