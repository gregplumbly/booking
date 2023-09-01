  import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
  import { cookies } from "next/headers";

  export default async function Index() {
    const supabase = createServerComponentClient({ cookies });


    const { data: fixtures} = await supabase
  .from('fixtures')
  .select('*')
  .order('date_time', { ascending: true })
  .gt('date_time', new Date().toISOString())
  .limit(1);

  console.log(fixtures)

    const { data:attendees, error } = await supabase.from('upcoming_fixture_attendees').select('*');

    console.log(attendees)

function formatFriendlyDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-UK', options);
}


    let date = new Date();

    // display the date in a readable format
    if (fixtures && fixtures.length > 0) {
         date = new Date(fixtures[0].date);
    }

    // TODO - insert a record when the user clicks play
    



    return (
        <>
        <h1 className="mt-10">Up next</h1>
      <ul className="">
        {fixtures?.map((fixture) => (
    
          <li className="text-2xl" key={fixture.id}>{formatFriendlyDate(fixture.date_time)} Pitch 3 xcel</li>
        ))}
      </ul>
      <br />
      <h1 className="mt-10">Starting line up</h1>
      <ol className="">
        {attendees?.map((attendee) => (
          <li className="list-decimal" key={attendee.id}>{attendee.name}</li>
        ))}
      </ol>
        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-8 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Play</button>



      </>
    );
  }