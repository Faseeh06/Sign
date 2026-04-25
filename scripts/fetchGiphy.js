const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = "qQqAkOCjj8VIZiM2AybcdtQGuLgkoNpy";

// 50 common words for the dictionary
const words = [
  "hello", "thank you", "please", "sorry", "yes", "no", 
  "who", "what", "where", "when", "why", "how",
  "me", "you", "good", "bad", "happy", "sad",
  "eat", "drink", "sleep", "go", "stop", "help",
  "love", "like", "want", "need", "more", "finish",
  "mother", "father", "friend", "home", "school", "work",
  "name", "time", "day", "night", "morning", "tomorrow",
  "today", "yesterday", "beautiful", "ugly", "big", "small",
  "hot", "cold"
];

const gifsDir = path.join(__dirname, '../public/gifs');
if (!fs.existsSync(gifsDir)) {
  fs.mkdirSync(gifsDir, { recursive: true });
}

async function fetchGiphyUrl(word) {
  const query = encodeURIComponent(`american sign language ${word}`);
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}&limit=1`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data.length > 0) {
            // Get the URL for a small/medium gif so it downloads fast
            resolve(json.data[0].images.downsized.url);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadGif(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      // Giphy has redirects sometimes or different protocols, but usually 'downsized.url' works directly with https
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (redirectRes) => {
          const file = fs.createWriteStream(dest);
          redirectRes.pipe(file);
          file.on('finish', () => resolve(true));
        }).on('error', () => resolve(false));
      } else {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => resolve(true));
      }
    }).on('error', () => resolve(false));
  });
}

async function main() {
  const dictionary = {};
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const safeWord = word.replace(/\s+/g, ''); // "thank you" -> "thankyou"
    console.log(`Processing [${i+1}/${words.length}]: ${word}`);
    
    const url = await fetchGiphyUrl(word);
    if (url) {
      const dest = path.join(gifsDir, `${safeWord}.gif`);
      const success = await downloadGif(url, dest);
      if (success) {
        dictionary[safeWord] = `/gifs/${safeWord}.gif`;
        console.log(`  -> Downloaded to /gifs/${safeWord}.gif`);
      } else {
        console.log(`  -> Failed to download`);
      }
    } else {
      console.log(`  -> No results for "${word}"`);
    }
    
    // Slight delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Write the updated dictionary file
  const alpha = `export const aslAlphabet: Record<string, string> = {
  a: "https://upload.wikimedia.org/wikipedia/commons/2/27/Sign_language_A.svg",
  b: "https://upload.wikimedia.org/wikipedia/commons/1/18/Sign_language_B.svg",
  c: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Sign_language_C.svg",
  d: "https://upload.wikimedia.org/wikipedia/commons/0/06/Sign_language_D.svg",
  e: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Sign_language_E.svg",
  f: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sign_language_F.svg",
  g: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Sign_language_G.svg",
  h: "https://upload.wikimedia.org/wikipedia/commons/9/97/Sign_language_H.svg",
  i: "https://upload.wikimedia.org/wikipedia/commons/1/10/Sign_language_I.svg",
  j: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Sign_language_J.svg",
  k: "https://upload.wikimedia.org/wikipedia/commons/9/97/Sign_language_K.svg",
  l: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Sign_language_L.svg",
  m: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Sign_language_M.svg",
  n: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Sign_language_N.svg",
  o: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sign_language_O.svg",
  p: "https://upload.wikimedia.org/wikipedia/commons/0/08/Sign_language_P.svg",
  q: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sign_language_Q.svg",
  r: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Sign_language_R.svg",
  s: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Sign_language_S.svg",
  t: "https://upload.wikimedia.org/wikipedia/commons/1/13/Sign_language_T.svg",
  u: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Sign_language_U.svg",
  v: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sign_language_V.svg",
  w: "https://upload.wikimedia.org/wikipedia/commons/8/83/Sign_language_W.svg",
  x: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Sign_language_X.svg",
  y: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Sign_language_Y.svg",
  z: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Sign_language_Z.svg"
};`;

  let out = alpha + "\n\n// Downloaded local Giphy GIF mapping\nexport const signDictionary: Record<string, string> = {\n";
  for (const [key, val] of Object.entries(dictionary)) {
    out += `  "${key}": "${val}",\n`;
  }
  // add base unmapped versions for hyphenated/spaced
  if (dictionary["thankyou"]) out += `  "thank": "${dictionary["thankyou"]}",\n`;
  out += "};\n\nexport type SignAction = | { type: 'sign'; gif: string; word: string } | { type: 'fingerspell'; letters: string[]; word: string } | { type: 'none'; word: string };\n";
  
  fs.writeFileSync(path.join(__dirname, '../lib/signDictionary.ts'), out);
  console.log("Dictionary updated to use local downloaded GIFs!");
}

main();
