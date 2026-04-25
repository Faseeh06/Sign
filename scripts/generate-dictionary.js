const fs = require("fs");
const path = require("path");

// Put your free Giphy API key here (get one at https://developers.giphy.com/)
const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY_HERE";

// 50 common words to start building your dictionary
const commonWords = [
  "hello", "thank you", "please", "sorry", "yes", "no", "help", 
  "love", "good", "bad", "happy", "sad", "eat", "drink", "water", 
  "sleep", "time", "day", "night", "work", "play", "friend", 
  "family", "home", "school", "learn", "understand", "more", 
  "finish", "where", "what", "who", "why", "when", "how", "beautiful",
  "name", "tired", "hungry", "bathroom", "stop", "go", "wait"
];

async function generateDictionary() {
  if (GIPHY_API_KEY === "YOUR_GIPHY_API_KEY_HERE") {
    console.error("❌ ERROR: Please add your Giphy API key to the script.");
    console.log("You can get a free one instantly at: https://developers.giphy.com/dashboard/");
    return;
  }

  console.log("🚀 Starting Giphy ASL Dictionary generation...");
  const dictionary = {};
  let count = 0;

  for (const word of commonWords) {
    try {
      // Search Giphy specifically for "Sign with Robert" or general ASL
      const query = encodeURIComponent(`ASL sign language ${word}`);
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=1&rating=g`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Extract the actual GIF url
        const gifUrl = data.data[0].images.original.url;
        // Clean the word for the dictionary key (e.g. "thank you" -> "thank you")
        dictionary[word.toLowerCase()] = gifUrl;
        count++;
        console.log(`✅ Loaded GIF for: ${word}`);
      } else {
        console.log(`⚠️ No ASL GIF found for: ${word}`);
      }

      // Small delay to avoid hitting rate limits instantly
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`❌ Failed to fetch word "${word}":`, error.message);
    }
  }

  // Write the resulting JSON to lib directory
  const outputPath = path.join(__dirname, "..", "lib", "extendedDictionary.json");
  
  // Ensure we are running from the script dir or root dir
  const finalPath = fs.existsSync(path.join(process.cwd(), "lib")) 
    ? path.join(process.cwd(), "lib", "extendedDictionary.json") 
    : outputPath;

  fs.writeFileSync(finalPath, JSON.stringify(dictionary, null, 2));
  
  console.log("\n🎉 Dictionary Built Successfully!");
  console.log(`Created mappings for ${count} words at ${finalPath}`);
  console.log("You can now import this JSON file right into your signDictionary.ts!");
}

generateDictionary();
