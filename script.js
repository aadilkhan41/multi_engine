let id;
let users = JSON.parse(localStorage.getItem("users"));
window.addEventListener("load", function(){
    let log = users.filter((ele) => {
        return ele.status == 'logged in';
    });

    id = log[0].id;
    renderHistory();
});

function renderHistory(){
    let historyObj = document.querySelector("#history");
    historyObj.innerHTML = '';
    users[id].history.forEach(ele=>{
        let temp = `<p class="w-[230px] truncate m-0 mb-1 text-sm p-2 pl-7 bg-[url('./chevron-right.svg')] bg-no-repeat bg-[length:22px_22px] bg-[5px_center] box-border rounded-lg cursor-pointer hover:bg-[#212121]">${ele}</p>`;
        historyObj.innerHTML += temp;
    });
}

// Google Search API
const SEARCH_API_KEY = "AIzaSyBChQKhWne8R9TdgG5yjyaB6vgQkwPTQeM";
const CX = "16e53c083a9614b20";
async function googleSearch(searchQuery){
    try{
        let res = await fetch(`https://www.googleapis.com/customsearch/v1?q=${searchQuery}&key=${SEARCH_API_KEY}&cx=${CX}`);
        let data = await res.json();

        users[id].history.push(searchQuery);
        localStorage.setItem("users", JSON.stringify(users));
        renderHistory();

        let section = document.querySelector(".container section");
        section.innerHTML = "";
        data.items.forEach(element => {
            let thumbnail = element.pagemap?.cse_thumbnail != undefined ? element.pagemap?.cse_thumbnail[0].src : './globe.svg';
            let temp = `
            <div class="p-[15px] rounded-[10px] mb-[10px] bg-[#303030]">
                <a href="${element.link}" target="_blank">
                    <div class="flex items-center">
                        <span><img class="w-[30px] h-[30px] rounded-full p-[5px] bg-white" src="${thumbnail}" alt=""></span>
                        <span>
                            <h2 class="text-[15px] font-medium pl-[10px]">${element.displayLink}</h2>
                            <h3 class="text-[12px] pl-[10px]">${element.link}</h3>
                        </span>
                    </div>
                    <h4 class="text-[#7BA3F8] py-[5px] text-[18px] font-medium">${element.title}</h4>
                    <p class="text-[15px]">${element.htmlSnippet}</p>
                </a>
            </div>`;
            section.innerHTML += temp;
        });
    }catch(error){
        document.querySelector(".container section").innerHTML = `<h1 class="w-full text-[18px] font-semibold text-center mb-[20px]">There seems to be an issue. Please try again later.</h1>`;
    }
}

// Wiki Search API
async function wikiSearch(query) {
    try{
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`);
        const data = await response.json(); 
        let resultData = data.query.search.map((result)=>{
            return result;
        });

        users[id].history.push(query);
        localStorage.setItem("users", JSON.stringify(users));
        renderHistory();

        let section = document.querySelector(".container section");
        section.innerHTML = "";
        resultData.forEach(async (result) => {
            const title = result.title;
            const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
            const imageData = await imageResponse.json();
            const pageId = result.pageid;

            let imageUrl = 'user.png';
            if(imageData.query.pages[pageId].thumbnail){
                imageUrl = imageData.query.pages[pageId].thumbnail.source;
            }

            let link = `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`;           

            let temp = `
            <div class="p-[15px] rounded-[10px] mb-[10px] bg-[#303030]">
                <a href="${link}">
                    <div class="grid grid-cols-[80px_auto]">
                        <span class="w-[80px] h-[80px]">
                            <img class="w-full h-full rounded-full bg-white object-cover" src="${imageUrl}" alt="">
                        </span>
                        <span>
                            <h2 class="text-[16px] font-medium pl-[10px]">${title}</h2>
                            <h3 class="text-[15px] pl-[10px]">${result.snippet}</h3>
                        </span>
                    </div>
                </a>
            </div>`;
            section.innerHTML += temp;
        });
    }catch(error){
        document.querySelector(".container section").innerHTML = `<h1 class="w-full text-[18px] font-semibold text-center mb-[20px]">There seems to be an issue. Please try again later.</h1>`;
    }
}

// Google Gemini API
const GEMINI_API_Key = "AIzaSyADBgRwWAs-8mUSTwwNV8YKJDJ2TqWBkk4";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
const genAI = new GoogleGenerativeAI(GEMINI_API_Key);
async function googleGemini(prompt) {
    try{
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = marked.parse(response.text());

        users[id].history.push(prompt);
        localStorage.setItem("users", JSON.stringify(users));
        renderHistory();

        let section = document.querySelector(".container section");
        section.innerHTML = text;
    }catch(error){
        document.querySelector(".container section").innerHTML = `<h1 class="w-full text-[18px] font-semibold text-center mb-[20px]">There seems to be an issue. Please try again later.</h1>`;
    }
}

// Unsplash API
const accessToken = "AUEOLxLJlGgKmngzvkEe8E2A6GCwqbpZm6aWgw4m9WM";
async function unsplashSearch(searchQuery){
    searchQuery = searchQuery.toLowerCase();
    try{
        const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${searchQuery}&client_id=${accessToken}`);
        const data = await response.json();
        let section = document.querySelector(".container section");
        section.innerHTML = "";
        const div = document.createElement("div");
        div.classList.add("w-full", "grid", "gap-y-[50px]", "gap-x-[20px]", "justify-center", "px-[10px]", "box-border", "grid-cols-[repeat(auto-fit,_minmax(240px,_240px))]");
        section.append(div);

        users[id].history.push(searchQuery);
        localStorage.setItem("users", JSON.stringify(users));
        renderHistory();
        
        data.results.forEach(element => {
            let temp = `<img class="rounded w-[240px] h-[240px] object-cover" src="${element.links.download}" alt="">`;
            div.innerHTML += temp;
        });
    }catch (error) {
        document.querySelector(".container section").innerHTML = `<h1 class="w-full text-[18px] font-semibold text-center mb-[20px]">There seems to be an issue. Please try again later.</h1>`;
    }
}

let newChat = document.querySelector("#new-chat");
newChat.addEventListener("click", function(){
    location.reload();
});

let history = document.querySelector("#history");
history.addEventListener("click", function(event){
    let query = event.target.closest("p").innerText;
    document.querySelector("#query-input").value = query;
});

let menu = document.querySelector("#menu");
menu.addEventListener("click", function(){
    let aside = document.querySelector("aside");
    aside.classList.toggle("ml-0");
    menu.classList.toggle("bg-[url('./x.svg')]");
});

let options = document.querySelector("#options");
options.addEventListener("click", function(event){
    let opBtn = event.target.closest("button");
    if(opBtn){
        let opBtns = document.querySelectorAll("#options button");
        opBtns.forEach(element => {
            element.classList.remove("bg-[#303030]", "active");
        });
        opBtn.classList.add("bg-[#303030]", "active");
    }
});

let searchBtn = document.querySelector("#search-btn");
searchBtn.addEventListener("click", function(){
    let query = document.querySelector("#query-input").value;
    if(query == '') return;

    let container = document.querySelector(".container");
    container.classList.add("h-full");

    let section = document.querySelector(".container section");
    section.innerHTML = `<div class="text-[1.2rem] text-[#777] pl-[25px]">Loading...</div>`;

    let option = document.querySelector("#options .active").innerText;
    if(option == "Google"){
        googleSearch(query);
    }else if(option == "Wikipedia"){
        wikiSearch(query);
    }else if(option == "Gemini"){
        googleGemini(query);
    }else{
        unsplashSearch(query);
    }
});

let logOut = document.querySelector("#logout");
logOut.addEventListener("click", function(){
    users[id].status = "logged out";
    localStorage.setItem("users", JSON.stringify(users));
    window.location.href = './signin.html';
    console.log("Logout");
});

let micBtn = document.querySelector("#mic");
let recognition;
let isListening = false;

function initSpeechRecognition() {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function (event) {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
        }
        document.querySelector("#query-input").value = transcript;
    };

    recognition.onerror = function (event) {
        if (event.error === "no-speech") {
            alert(`${event.error}: Please select the correct mic from chrome://settings/content/microphone`);
        } else if (event.error === "network") {
            alert("Network error. Check your internet connection.");
        } else if (event.error === "audio-capture") {
            alert("Microphone access denied. Please enable microphone permissions.");
        } else {
            alert("Speech recognition error: " + event.error);
        }
    };

    recognition.onend = function () {
        if (isListening) {
            console.log("Restarting recognition...");
            recognition.start();
        } else {
            console.log("Recognition stopped by user.");
        }
    };
}

function toggleSpeechRecognition() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (!isListening) {
        recognition.start();
        isListening = true;
        micBtn.style.backgroundImage = "url('./stop.svg')";
    } else {
        recognition.stop();
        isListening = false;
        micBtn.style.backgroundImage = "url('./mic.svg')";
    }
}

micBtn.addEventListener("click", toggleSpeechRecognition);