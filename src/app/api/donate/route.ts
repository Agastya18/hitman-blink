

import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    createPostResponse,
  } from "@solana/actions";

  import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
  } from "@solana/web3.js";


  export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload: ActionGetResponse = {
      icon: "https://wallpapercat.com/w/full/2/1/f/1633-3840x2160-desktop-4k-hitman-game-background-photo.jpg", // Local icon path
      title: "Donate to hitman",
      description: "Support me by donating SOL, and i will kill your enemies",
      label: "Donate",
      links: {
        actions: [
          {
            type: "url",
            label: "Donate 0.1 SOL",
            href: `${url.href}?amount=0.1`,
          },
        ],
      },
    };
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }


  export const OPTIONS = GET; // OPTIONS request handler

// POST request handler
export async function POST(request: Request) {
  const body: ActionPostRequest = await request.json();
  const url = new URL(request.url);
  const amount = Number(url.searchParams.get("amount")) || 0.1;
  let sender;

  try {
    sender = new PublicKey(body.account);
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid account",
        },
      }),
      {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey('7BurrxaWzwEFntUiBYGXhTQSeZdds5GDKtJGmWSarZiH'), // Sender public key
      toPubkey: new PublicKey("8QmrmTiGQt5ed7cd7QBzfSWpe3FjpZw3wkUrR6riG8pU"), // Replace with your recipient public key
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );
  transaction.feePayer = sender;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      type: "transaction",
      transaction,
      message: "your enemies will die soon",
    },
  });
  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS,
  });
}