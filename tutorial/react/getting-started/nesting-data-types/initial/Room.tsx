import { useStorage, useMutation } from "./liveblocks.config";
import { LiveObject } from "@liveblocks/client";

export function Room() {
  const person = useStorage((root) => root.person);

  // Update name mutation
  const updateName = useMutation(({ storage }, newName: string) => {
    const person = storage.get("person");
    person.set("name", newName);
  }, []);

  // Add name mutation

  return (
    <div>
      <input
        type="text"
        value={person.name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}
