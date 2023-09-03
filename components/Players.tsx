"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Player = {
  name: string;
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const supabase = createClientComponentClient();

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchUser();
  }, []);

  if (user) {
    // User is logged in
    console.log(user);
  } else {
    // User is not logged in
    console.log("no user");
  }

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: playersData, error } = await supabase
        .from("upcoming_fixture_attendees")
        .select("*");

      if (error) {
        console.log("error", error);
      }

      if (Array.isArray(playersData)) {
        setPlayers(playersData);
        console.log(playersData);
      } else {
        console.warn("Fetched data is not an array:", playersData);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
    };

    fetchTodos();
  }, [supabase, updateCount]);

  const addPlayer = async () => {
    console.log("addPlayer");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: playerData, error } = await supabase
      .from("attendees")
      .insert({ fixture_id: 3, user_id: user?.id })
      .select();

    if (error) {
      console.log(error.message);
    } else {
      if (Array.isArray(playerData) && playerData.length > 0) {
        setPlayers((prevPlayers) => [...prevPlayers, playerData[0]]);
        setUpdateCount((prevCount) => prevCount + 1);
      } else if (playerData && typeof playerData === "object") {
        setPlayers((prevPlayers) => [
          ...prevPlayers,
          { name: playerData[0].name },
        ]);

        setUpdateCount((prevCount) => prevCount + 1);
      } else {
        console.warn("Unexpected player data format:", playerData);
      }
    }
  };

  return (
    <>
      <h1 className="text-2xl">{players.length} players</h1>
      {players && (
        <ol className="list-decimal">
          {Array.from({ length: 16 }).map((_, index) => (
            <li key={index}>
              {players[index] ? players[index].name : `...`}
              {players[index] ? (
                players[index].id === user?.id ? (
                  <button className="text-white bg-red-500 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1">
                    X
                  </button>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </li>
          ))}
        </ol>
      )}
      <h1 className="text-2xl">Waitlist</h1>
      <button
        onClick={addPlayer}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 mt-8 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Play
      </button>
    </>
  );
}
