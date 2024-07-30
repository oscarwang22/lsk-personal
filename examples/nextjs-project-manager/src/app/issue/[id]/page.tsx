import { Room } from "@/app/Room";
import RoomErrors from "@/components/RoomErrors";
import { Issue } from "@/components/Issue";
import { Nav } from "@/components/Nav";

export default function PageHome({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <Room issueId={id}>
      <div className="flex flex-row h-full">
        <nav className="p-2 w-[250px]">
          <Nav />
        </nav>
        <main className="m-2 border flex-grow bg-neutral-50 rounded">
          <Issue issueId={id} />
        </main>
      </div>
      <RoomErrors />
    </Room>
  );
}
