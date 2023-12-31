import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import SupabaseLogo from "../components/SupabaseLogo";
import NextJsLogo from "../components/NextJsLogo";
import BookButton from "@/components/BookButton";
import Players from "@/components/Players";

export const dynamic = "force-dynamic";

export default async function Index() {
  const currentDate = new Date();

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .order("date_time", { ascending: true })
    .gt("date_time", new Date().toISOString())
    .limit(1);

  console.log(fixtures);

  function formatFriendlyDate(dateStr: string) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    };

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-UK", options);
  }

  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* start booking */}
      <h1 className="mt-10">Up next</h1>

      <Players
        formatted_date={
          fixtures
            ? formatFriendlyDate(fixtures[0].date_time)
            : "nothing scheduled"
        }
        fixture_id={fixtures ? fixtures[0].id : null}
      />
      {/* <Players
        formatted_date={
          fixtures
            ? formatFriendlyDate(fixtures[1].date_time)
            : "nothing scheduled"
        }
        fixture_id={fixtures ? fixtures[1].id : null}
      /> */}
    </div>
  );
}
