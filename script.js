// Google Search API
const SEARCH_API_KEY = "AIzaSyBChQKhWne8R9TdgG5yjyaB6vgQkwPTQeM";
const CX = "16e53c083a9614b20";

async function googleSearch(searchQuery){
    try{
        let res = await fetch(`https://www.googleapis.com/customsearch/v1?q=${searchQuery}&key=${SEARCH_API_KEY}&cx=${CX}`);
        let data = await res.json();

        data.items.forEach(element => {
            console.log("Title: "+element.title);
            console.log("Title Link: "+element.displayLink);
            console.log("Link: "+element.link);
            console.log("Description: "+element.htmlSnippet);
            let thumbnail = element.pagemap?.cse_thumbnail != undefined ? element.pagemap?.cse_thumbnail[0].src : '/assets/logo.png';
            console.log("Thumbnail: "+thumbnail);
            console.log("");
        });
    }catch(error){
        console.log(error);
    }
}

// Google Gemini API
const GEMINI_API_Key = "AIzaSyADBgRwWAs-8mUSTwwNV8YKJDJ2TqWBkk4";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
const genAI = new GoogleGenerativeAI(GEMINI_API_Key);

async function googleGemini(prompt) {
    if(prompt === "") return;
    try{
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
    
        document.querySelector("body").innerHTML = marked.parse(text);
    }catch(error){
        console.log(error);
    }
}

// Wiki Search API
async function wikiSearch(query) {
    if(query === "") return;

    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`);
    const data = await response.json(); 
    let resultData = data.query.search.map((result)=>{
        return result;
    });

    resultData.forEach(async (result) => {
        const title = result.title;
        const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
        const imageData = await imageResponse.json();
        const pageId = result.pageid;

        if (imageData.query.pages[pageId].thumbnail) {
            const imageUrl = imageData.query.pages[pageId].thumbnail.source;
            console.log("Profile Picture:", imageUrl);
        } else {
            console.log("No profile picture found");
        }

        console.log(title);
        console.log(`https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`);
        console.log(result.timestamp.slice(0, 10));
        console.log(result.snippet);
        console.log("");
    });
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
menu.addEventListener("click",function(event){
    let aside = document.querySelector("aside");
    aside.classList.toggle("ml-0");
    menu.classList.toggle("bg-[url('./x.svg')]");
});

let options = document.querySelector("#options");
options.addEventListener("click",function(event){
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
searchBtn.addEventListener("click", function(event){
    let query = document.querySelector("#query-input").value;
    if(query == '') return;

    let container = document.querySelector(".container");
    container.classList.add("h-full");

    let section = document.querySelector(".container section");
    section.innerHTML = "";

    let option = document.querySelector("#options .active").innerText;
    if(option == "Google"){
        googleSearch(query);
    }else if(option == "Wikipedia"){
        wikiSearch(query);
    }else{
        googleGemini(query);
    }
});