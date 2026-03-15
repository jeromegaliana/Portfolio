import Groq from "groq-sdk";

export async function POST(request: Request) {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  const { make, model, year, query } = await request.json();

  if (!make || !model || !year) {
    return new Response(JSON.stringify({ error: "Missing car details" }), {
      status: 400,
    });
  }

  const carDescription = `${year} ${make} ${model}`;

  const systemPrompt = `Tu es un expert en voitures anciennes et classiques, avec une connaissance approfondie des pièces détachées, de la restauration et des spécifications techniques.
Tu aides les passionnés à trouver des pièces et des informations pour leurs véhicules vintage.
Réponds toujours en français.
Quand tu listes des sites ou ressources, formate-les en liens markdown : [Nom du site](URL).
Organise ta réponse en sections claires avec des titres.
Fournis des URLs réelles et connues pour les fournisseurs de pièces, forums et clubs automobiles.`;

  const userMessage =
    query ||
    `Je cherche des informations complètes sur la ${carDescription}. Merci de me fournir :

## 1. Fiche technique
- Moteur, cylindrée, puissance
- Boîte de vitesses
- Dimensions et poids
- Performances (0-100, vitesse max)

## 2. Points faibles & problèmes connus
- Les zones de rouille typiques
- Problèmes mécaniques récurrents
- Pièces difficiles à trouver

## 3. Où trouver des pièces détachées
Liste les meilleures sources avec des liens :
- Fournisseurs spécialisés en ligne (France & Europe)
- Clubs de propriétaires et forums
- Sites de petites annonces (Leboncoin, eBay Motors, etc.)
- Casses spécialisées

Sois précis et fournis des URLs réelles quand tu les connais.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 4096,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          stream: true,
        });

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text })}\n\n`
              )
            );
          }
          if (chunk.choices[0]?.finish_reason === "stop") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
            );
          }
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
