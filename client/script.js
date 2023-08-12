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
        "Thank you very much! now could you tell me your name?",
        "I like your email! Can I know your name too? ",
        "Thank you, now how about telling me your name?",
        "Perfect, do you even have a name?",
        "Great, thank you. Could you also type your name?",
        "Got it, what's your name? ",
        "I love your email, would you also have a name I can call you?",
        "You have been very kind! Now could you also give me your name?",
        "Thank you, tell me more about yourself. Do you have a name? ",
        "The first step is taken, do you have a name? what shall I call you?"
    ];
    var phrases1 = [
        "You have not entered a valid email, can you repeat?",
        "OK, could you please enter a valid e-mail?",
        "I do not read any emails, could you please try again? ",
        "are you sure you have entered a valid email? Why don't you try again?",
        "Mmm, before we start our conversation I would need your email. Could you type it in?",
        "Forgive me, perhaps I did not explain myself well. Could you please enter a valid email address?",
        "Sorry, I can't find any valid email. Can you type it again?",
        "No email has been typed",
        "Sorry to ask again, but could you please try typing your personal email again?",
        "I need your email in order to proceed!"
    ];
    if (firstmessage.includes("@")) {
        userEmail=true
        var randomIndex = Math.floor(Math.random() * phrases.length); // Genera un indice casuale nell'intervallo dell'array
        var selectedPhrase = phrases[randomIndex]; // Sceglie una frase casuale dall'array
        
        setTimeout(function() {
            clearInterval(loadInterval)
            messageDiv.innerHTML = " "
            typeText(messageDiv, selectedPhrase);
        }, 2500);
        
    } else {
        var randomIndex = Math.floor(Math.random() * phrases1.length); // Genera un indice casuale nell'intervallo dell'array
        var selectedPhrase = phrases1[randomIndex]; // Sceglie una frase casuale dall'array
        setTimeout(function() {
            clearInterval(loadInterval)
            messageDiv.innerHTML = " "
            typeText(messageDiv, selectedPhrase);
        }, 2500);
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