"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

async function addAttendee() {
  const supabase = createClientComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("attendees")
    .insert({ fixture_id: 3, user_id: user?.id })
    .select();

  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
}

export default async function BookButton() {
  const supabase = createClientComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);

  function handleButtonClick() {
    addAttendee();
  }

  return (
    <div>
      <button
        onClick={handleButtonClick}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 mt-8 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Play
      </button>
    </div>
  );
}
