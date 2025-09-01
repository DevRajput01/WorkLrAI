import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from "form-data";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Choose Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate text
    const result = await model.generateContent(prompt);
    const content = result.response.text().slice(0, length);

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    // Track free usage
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


//////////////////////////////////////////////////////////////////////////////////////////////////


export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt} = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Choose Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate text
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Generate 5 creative blog titles for: ${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });


    const content = result.response.text();

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    // Track free usage
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};




/////////////////////////////////////////////////////////////////////////////////////////////////////////////





export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish} = req.body;
    const plan = req.plan;
    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only avaliable for premium Subscription "
      })
    }

   // Another AI use for generate image {Clipdrop}

const formData = new FormData()
formData.append('prompt', prompt)



const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData,{
    headers:{ 'x-api-key': process.env.CLIPDROP_API_KEY,},
    responseType:"arraybuffer",
})


const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;



const {secure_url} = await cloudinary.uploader.upload(base64Image)



    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    

    res.json({ success: true, content: secure_url });

  } 
  
  catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};





///////////////////////////////////////////////////////////////////////////////////////////////////////////





export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;
    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only avaliable for premium Subscription "
      })
    }

   // Another AI use for Remove background of image {Cloudnary}




const {secure_url} = await cloudinary.uploader.upload(image.path, {
  transformation: [
    {
      effect: 'background_removal',
      background_removal:'remove_the_background'
    }
  ]
})




    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    

    res.json({ success: true, content: secure_url });

  } 
  
  catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};





///////////////////////////////////////////////////////////////////////////////////////////////////////////




export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only avaliable for premium Subscription "
      })
    }

   // Another AI use for Remove object of image {Cloudnary}




const {public_id} = await cloudinary.uploader.upload(image.path)
const imageUrl = cloudinary.url(public_id, {
  //transformation: [{effect: `gen_remove: ${object}`}],
   transformation: [{effect: `gen_remove:prompt_${object}`}],
  resource_type: 'image'
})



    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    

    res.json({ success: true, content: imageUrl });

  } 
  
  catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};





///////////////////////////////////////////////////////////////////////////////////////////////////////////





// export const resumeReview = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const resume = req.file;
//     const plan = req.plan;

    

//     if (plan !== "premium") {
//       return res.json({
//         success: false,
//         message: "This Feature is only avaliable for premium Subscription "
//       })
//     }

//    // 

// if(resume.size > 5 * 1024 * 1024){
//   return res.json({success: false, message: "Resume file size exceeds allowed size(5MB)."})
// } 

// const dataBuffer = fs.readFileSync(resume.path)
// const pdfData = await pdf(dataBuffer)

// const prompt = `Review the following resume and provide constructive feedback on its strengths, weakness, and areas for improvement. Resume Content:\n\n${pdfData.text}`

// /////////////////

//  // Choose Gemini model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Generate text
//     const result = await model.generateContent(prompt);
//     const content = result.response.text().slice(0, length);

//    // const content = result.response.text().slice(0, length);


// //////////////////

//     // Save to DB
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    

//     res.json({ success: true, content: content });

//   } 
  
//   catch (error) {
//     console.log("AI Error:", error.message);
//     res.json({ success: false, message: error.message });
//   }
// };





export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // Read resume file
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    // Choose Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate AI review
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    // Limit output if needed
    const content = aiText.slice(0, 3000);

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.log("AI Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};






