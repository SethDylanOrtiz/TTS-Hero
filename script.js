var correctedTextValue = document.querySelector('#newText') // correctedTextValue.textContent = 'new text'
                                                            // helro whasts goingr on?

document.querySelector('#reset').addEventListener('click', () => {
    document.getElementById("text-area").value = "";
    correctedTextValue.textContent = 'Insert text into the box below, and it will be turned into speech!'
    responsiveVoice.cancel();
});

document.querySelector('#STT').addEventListener('click', () => {
    var speechRecognition = window.webkitSpeechRecognition;
    var recognition = new speechRecognition(); // ctor
    var spokenText  = ''

    recognition.continuous = true;

    recognition.onstart = function(){
        document.getElementById("text-area").placeholder = "Voice Recognition is ON";
        document.getElementById('TTS').disabled = true; // disable TTS button
    }

    recognition.onspeechend = function(){
        recognition.stop();
        document.getElementById("text-area").placeholder = "Voice Recognition is OFF"; // or change to input value
        document.getElementById('TTS').disabled = false; //re-enable TTS button
    }

    recognition.onerror = function(){
        alert("ERROR USING SPEECH RECOGNITION (STT)");
    }

    recognition.onresult = async function(event){
        var spokenText = event.resultIndex;
        var transcript = event.results[spokenText][0].transcript;

        spokenText = transcript;
        document.getElementById("text-area").value = spokenText;

        correctedText = await spellCorrection(spokenText); // necessary?
        correctedTextValue.textContent = correctedText; // display corrected text

        recognition.stop();
    }

    if(spokenText.length){ // resets text
        spokenText = '';
    }
    recognition.start();
} );

async function spellCorrection (query){
    try{
        const response = await fetch('https://api.bing.microsoft.com/v7.0/spellcheck', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Ocp-Apim-Subscription-Key': '37b7c816fedc4a8aa94d65a1216cd556' 
            },
            body: 'text=' + query + '&mkt=en-us&mode=proof' 
        });
        response => response.json();
        var json = await response.json(); // stores response JSON object, set to var to exist outside of try/catch
        console.log(json);
    }catch(e){
        //correctedTextValue.textContent = e;
        console.error(e);
        alert('There was an error');
    }

    const totalSuggestions = json.flaggedTokens.length;
        for(var i = 0; i < totalSuggestions; i++)
        {
            const token = json.flaggedTokens[i].token; // word to replace
            const idx = query.indexOf(token); // find token's index + end to replace
            const suggestion = json.flaggedTokens[i].suggestions[0].suggestion; // word that should be instead
            console.log(token + ': ' + suggestion);
            query = query.replace(query.substring(idx, idx + token.length), suggestion); // replace word
        }
    return query; // returns corrected string
}

document.querySelector('#TTS').addEventListener('click', async (e) => {
    document.getElementById('STT').disabled = true;

    e.preventDefault();
    var input = document.getElementById("text-area").value;

    if (!responsiveVoice.isPlaying()){
        correctedTextValue.textContent = 'LOADING...';
        input = await spellCorrection(input);
    }
    
    // console.log("input: " + input);
    if (input && !responsiveVoice.isPlaying()){
        correctedTextValue.textContent = input; // display new text
        document.getElementById('TTS').disabled = true; // disable button, do we need this?
        responsiveVoice.speak(input, "UK English Male");
    }
    document.getElementById('TTS').disabled = false;
    document.getElementById('STT').disabled = false; 
});
