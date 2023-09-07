"use client";

// TODO dd display name
// TODO update the play button based on login status
// TODO add to waitlist. show break after 16 players. chnage the button text

import { PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface PlayersProps {
  formatted_date: string;
  fixture_id: string;
}

type CheckedState = boolean;

type Player = {
  id: string;
  name: string;
  items: string[] | null;
  item_name?: string;
  email?: string;
};

type User = {
  id: string;
};

export default function Players(props: PlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [ballIsChecked, setBallIsChecked] = useState(false);
  const [bibIsChecked, setBibIsChecked] = useState(false);

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
        .from("upcoming_attendees")
        .select("*")
        .eq("id", props.fixture_id);

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

    console.log(user.id);

    console.log("add player Ball Checkbox value:", ballIsChecked);
    console.log("add player Bib Checkbox value:", bibIsChecked);

    try {
      const { data: playerData, error } = await supabase
        .from("attendees")
        .insert({
          fixture_id: props.fixture_id,
          user_id: user.id,
          timestamp: new Date(),
        })
        .select();

      console.log("playt" + error);

      if (playerData && playerData.length > 0) {
        const attendeeId = playerData[0].id;

        if (ballIsChecked) {
          await supabase.from("items").insert([
            {
              attendee_id: attendeeId,
              item_name: "ball",
            },
          ]);
        }

        if (bibIsChecked) {
          await supabase.from("items").insert([
            {
              attendee_id: attendeeId,
              item_name: "bib",
            },
          ]);
        }
      }
      // get the value of the checkbox with the id of bibs

      if (error) {
        console.log("error", error);
        throw new Error(error.message);
      }

      if (Array.isArray(playerData) && playerData.length > 0) {
        setPlayers((prevPlayers) => [
          ...prevPlayers,
          { id: playerData[0].id, name: playerData[0].name, items: null },
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
        .eq("user_id", id)
        .eq("fixture_id", props.fixture_id);

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
    console.log(player.items);

    let display = player.email;

    if (!player) return null;

    if (!player.items) {
      return player.name;
    }
    if (player.items.includes("bib")) {
      display += "🎽";
    }
    if (player.items.includes("ball")) {
      display += "⚽";
    }

    return display;
  }

  function renderFormOptions() {
    if (!user) {
      return (
        <div>
          <Link
            href="/login"
            className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
          >
            Login to play
          </Link>
        </div>
      );
    } else if (isPlaying(user)) {
      return (
        <div>
          <Button variant="destructive" onClick={() => cancelPlaying(user.id)}>
            I can no longer make it
          </Button>
        </div>
      );
    } else if (user && !isPlaying(user)) {
      return (
        <div>
          <div className="flex items-center space-x-2 mb-3 mt-3">
            <Checkbox
              id="ball"
              checked={ballIsChecked}
              onCheckedChange={(checked: CheckedState) =>
                setBallIsChecked(checked)
              }
            />
            <label
              htmlFor="ball"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I can bring a ball
            </label>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="bibs"
              checked={bibIsChecked}
              onCheckedChange={(checked: CheckedState) =>
                setBibIsChecked(checked)
              }
            />
            <label
              htmlFor="bibs"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I can bring bibs
            </label>
          </div>
          <Button className="mb-3" onClick={addPlayer}>
            Play
          </Button>
        </div>
      );
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
        <CardFooter className="py-2 border-t-2 border-gray-100">
          {renderFormOptions()}
        </CardFooter>
      </Card>
    </>
  );
}
