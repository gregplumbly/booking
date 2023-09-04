"use client";

// Add display name
// cancel logic
// add to waitlist
// bibs and balls

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Player = {
  name: string;
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [user, setUser] = useState(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
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

    fetchPlayers();
  }, [supabase, updateCount]);

  const addPlayer = async () => {
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

  async function cancelPlaying(id) {
    try {
      const { error } = await supabase
        .from("attendees")
        .delete()
        .match({ user_id: id });

      if (error) {
        throw error;
      }

      // Update the UI or perform other actions after successful deletion
    } catch (error) {
      alert(error.message);
    }
    setUpdateCount((prevCount) => prevCount - 1);
  }

  function isCurrentUser(player) {
    if (!player || !user) return false;
    return player.id === user.id;
  }

  function isPlaying(user) {
    if (!user) return false;
    return players.some((player) => player.id === user.id);
  }

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sep 5th</CardTitle>
          <CardDescription>{players.length} of 16 players</CardDescription>
        </CardHeader>
        <CardContent>
          {players && (
            <ul className="ml-3">
              {Array.from({ length: players.length }).map((_, index) => (
                <li
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2"
                  key={index}
                >
                  <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                    <svg
                      className="absolute w-12 h-12 text-gray-400 -left-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>

                  {players[index] ? players[index].name + "(⚽ 🎽 🍺) " : ``}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          {isPlaying(user) ? (
            <Button
              variant="destructive"
              onClick={() => cancelPlaying(user.id)}
            >
              I can no longer make it
            </Button>
          ) : (
            <Button onClick={addPlayer}>Play</Button>
          )}
        </CardFooter>
      </Card>

      {/* <h1 className="text-2xl"></h1> */}

      {/* <h1 className="text-2xl">Waitlist</h1> */}
    </>
  );
}
