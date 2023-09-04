"use client";

// Use date of next game in Players component. DONE
//  update Play button to reflect login status.
// Add display name
// cancel logic
// add to waitlist. show break after 16 players. chnage the button text
// bibs and balls
// order by date added
// loading spinner
// dark mode
// upload profile photo

import { PostgrestError } from "@supabase/supabase-js";

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

interface PlayersProps {
  formatted_date: string;
}

type Player = {
  id: string;
  name: string;
  item_name: string;
};

type User = {
  id: string;
};

export default function Players(props: PlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
      setUser(user);
    }

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data: playersData, error } = await supabase
        .from("upcoming_fixture_attendees")
        .select("*")
        .order("timestamp", { ascending: true });

      console.log(playersData);

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
    if (!user) {
      console.log("User is null");
      return;
    }

    try {
      const { data: playerData, error } = await supabase
        .from("attendees")
        .insert({ fixture_id: 3, user_id: user.id, timestamp: new Date() })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      if (Array.isArray(playerData) && playerData.length > 0) {
        setPlayers((prevPlayers) => [...prevPlayers, playerData[0]]);
        setUpdateCount((prevCount) => prevCount + 1);
      } else if (playerData && typeof playerData === "object") {
        setPlayers((prevPlayers) => [
          ...prevPlayers,
          { id: playerData[0].id, name: playerData[0].name, item_name: "" },
        ]);
        setUpdateCount((prevCount) => prevCount + 1);
      } else {
        console.warn("Unexpected player data format:", playerData);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  async function cancelPlaying(id: string) {
    try {
      const { error }: { error: PostgrestError | null } = await supabase
        .from("attendees")
        .delete()
        .match({ user_id: id });

      if (error) {
        throw error;
      }

      // Update the UI or perform other actions after successful deletion
    } catch (error: any) {
      alert(error.message);
    }
    setUpdateCount((prevCount) => prevCount - 1);
  }

  function isCurrentUser(player: Player) {
    if (!player || !user) return false;
    return player.id === user.id;
  }

  function isPlaying(user: User | null) {
    if (!user) return false;
    return players.some((player) => player.id === user.id);
  }

  function displayPlayer(player: Player) {
    console.log(player);
    if (!player) return null;
    if (player.item_name === null) {
      return player.name;
    } else if (player.item_name === "bibs") {
      return player.name + " " + "🎽";
    } else if (player.item_name === "balls") {
      return player.name + " " + "⚽";
    }
  }

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{props.formatted_date}</CardTitle>
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
                  {displayPlayer(players[index])}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          {user && isPlaying(user) ? (
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
