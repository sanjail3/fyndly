import { AzureOpenAI } from "openai";
import { AzureStorageClient } from '@/lib/azure-storage';

export async function generateDallePrompt(name: string, gender: 'boy' | 'girl'): Promise<string> {
    const llmEndpoint = "https://sanjai.openai.azure.com/openai/deployments/video-gpt/chat/completions?api-version=2025-01-01-preview";
    const llmApiKey = "ee0369b2f82e45e5bc84edee145a0f11";

    if (!llmApiKey) {
        throw new Error("Azure OpenAI API key is not configured.");
    }

    const systemPrompt = `You are a creative prompt generator for DALL·E 3. Your goal is to create a single, vivid descriptive paragraph for a semi-cartoonish, Pixar-style 3D avatar suitable for a profile picture. The character should appear friendly, expressive, and lifelike with soft stylization — not overly cartoonish, but detailed like a Pixar or DreamWorks character.

    Ensure the description includes:
    - Subtle Indian cultural or fashion elements when possible (e.g., hairstyle, skin tone, accessories).
    - Focus on expressive facial features, clothing style, and posture.
    - Background must always be clean white or neutral.
    - Emphasize 'Pixar-style Semi realistic', 'realistic 3D render', 'soft lighting', and 'vibrant colors'.

    Don't imclude multiple frame of characters only profile photo image angles
    
    Only output the descriptive paragraph. Do not include instructions, formatting, or any list. and also make sure the image propmt is for profile or avatar photo some times it is giveing multiple characters, I want  medium shot of the character with a clean background medium clsoe up shot
    and sometimes women gender bias will restrict from azure so propmt carfully don't add unnecessary words
    
    Example Prompt: A young adult male with neatly styled wavy black hair and a short, well-groomed beard, wearing rectangular dark-framed glasses. His expressive eyes and warm skin tone give him a welcoming look. He’s dressed in a navy blue hoodie layered over a casual kurta, blending modern and traditional Indian fashion. The character has a gentle, friendly smile and stands confidently against a clean white background. Rendered in a Pixar-style semi-realistic 3D cartoon look with vibrant colors and soft lighting, the avatar appears lifelike and charming—perfect for a modern professional profile picture.

    IMPORTANT INSTRUCTION PROPMT SHOULD FOLLOW SAME STRUCTURE:

    A young adult [gender] [description in a elobrated manner as like example prompt] [Outfit information in a elobarated way] [clean background] [style pixar style semi realistic 3d cartoon]

    `;
    
    const userPromptForLlm = `Generate a Pixar-style semi-realistic 3D cartoon avatar description for a profile picture with the following details:
- Gender: ${gender}
- Age descriptor: young adult
- Hair: Generate a culturally appropriate Indian hairstyle and realistic hair color
- Facial Features: Generate expressive, semi-cartoonish facial features suitable for South Asian context
- Clothing: Suggest casual or modern Indo-Western clothing (e.g., kurta with jeans, hoodie with joggers, etc.)
- Expression: a gentle, friendly smile
- Background: always use a clean white or soft neutral background`;


    const llmResponse = await fetch(llmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': llmApiKey },
        body: JSON.stringify({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPromptForLlm }],
            max_tokens: 250,
            temperature: 0.8,
        }),
    });

    if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        throw new Error(`Failed to generate prompt from LLM: ${llmResponse.status} ${errorText}`);
    }

    const llmData = await llmResponse.json();
    const dallePrompt = llmData.choices[0]?.message?.content?.trim();

    if (!dallePrompt) {
        throw new Error("LLM prompt generation failed, no content returned.");
    }
    return dallePrompt;
}

async function generateImage(prompt: string): Promise<Buffer> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const dalleDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME_DALLE;

    if (!endpoint || !apiKey || !dalleDeployment) {
        throw new Error("Azure OpenAI DALL-E endpoint, key, or deployment name is not configured.");
    }

    const client = new AzureOpenAI({ endpoint, apiKey, deployment: dalleDeployment, apiVersion: "2024-04-01-preview" });
    
    const results = await client.images.generate({ 
        prompt, 
        n: 1, 
        size: "1024x1024", 
        style: "vivid", 
        quality: "standard" 
    });
    
    if (!results.data || !results.data[0]?.url) {
      throw new Error("Image generation failed, no data returned from Azure.");
    }

    const imageUrl = results.data[0].url;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
        throw new Error("Failed to fetch the generated image from the temporary URL.");
    }

    return Buffer.from(await imageResponse.arrayBuffer());
}

export async function generateAndUploadAvatar(userId: string, name: string, gender: string): Promise<string> {
    const simpleGender = gender.toLowerCase() === 'male' ? 'boy' : 'girl';
    
    const storageClient = new AzureStorageClient();
    const avatarFolderPath = `avatars/${simpleGender}`;

    const dallePrompt = await generateDallePrompt(name, simpleGender);
    console.log(`Generated DALL-E Prompt for ${name}: ${dallePrompt}`);

    const imageBuffer = await generateImage(dallePrompt);
    if (imageBuffer.length === 0) {
      throw new Error("Generated image buffer is empty.");
    }

    const fileName = `${userId}-avatar`;
    return await storageClient.uploadMedia(imageBuffer, fileName, avatarFolderPath);
} 