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

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: players, error } = await supabase
        .from("upcoming_fixture_attendees")
        .select("*");

      if (error) console.log("error", error);
      setPlayers(players ?? []);
    };

    fetchTodos();
  }, [supabase, updateCount]);

  const addPlayer = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: player, error } = await supabase
      .from("attendees")
      .insert({ fixture_id: 3, user_id: user?.id })
      .select();

    if (error) {
      console.log(error.message);
    } else {
      setPlayers([...players, player]);
      setUpdateCount((prevCount) => prevCount + 1);
    }
  };

  return (
    <>
      {players && (
        <ol>
          {players.map((player, index) => (
            <li className="list-decimal" key={index}>
              {player.name}
            </li>
          ))}
        </ol>
      )}
      <button
        onClick={addPlayer}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 mt-8 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Play
      </button>
    </>
  );
}
