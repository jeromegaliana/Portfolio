import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { make, model, year, query } = await request.json();

  if (!make || !model || !year) {
    return new Response(JSON.stringify({ error: "Missing car details" }), {
      status: 400,
    });
  }

  const carDescription = `${year} ${make} ${model}`;

  const systemPrompt = `You are an expert on classic and vintage cars, with deep knowledge of parts sourcing, restoration, and technical specifications.
You help enthusiasts find parts and information for their vintage vehicles.
Always respond in the same language as the user's query.
When listing links or sources, always format them as markdown links: [Site Name](URL).
Organize your findings into clear sections.`;

  const userMessage =
    query ||
    `I need comprehensive information about the ${carDescription}. Please:
1. Provide key technical specifications (engine, transmission, dimensions, weight, performance)
2. List known weaknesses and common issues to watch for
3. Search the web for the best places to buy parts for this car, including:
   - Specialized parts suppliers (online shops)
   - Owner clubs and forums
   - Classified ads / marketplaces
   - French and European suppliers if available
   - Specialty salvage yards

Format the parts sources as clickable links with a brief description of each.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          system: systemPrompt,
          tools: [
            {
              type: "web_search_20260209",
              name: "web_search",
            },
          ],
          messages: [{ role: "user", content: userMessage }],
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = JSON.stringify({ type: "text", text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }

          if (event.type === "message_stop") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          }
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`)
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
