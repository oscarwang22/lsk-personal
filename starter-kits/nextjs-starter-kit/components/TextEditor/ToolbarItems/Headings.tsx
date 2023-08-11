import { useCallback } from "react";
import { Editor } from "@tiptap/react";
import { Select } from "../../../primitives/Select";
import styles from "./Headings.module.css";

const headings = [
  { value: "p", title: "Paragraph" },
  { value: "h1", title: "Heading 1" },
  { value: "h2", title: "Heading 2" },
  { value: "h3", title: "Heading 3" },
];

type Props = {
  editor: Editor;
};

export function Headings({ editor }: Props) {
  const onHeadingChange = useCallback(
    (value: string) => {
      if (!editor) {
        return;
      }

      switch (value) {
        case "p":
          editor.chain().focus().setParagraph().run();
          break;

        case "h1":
          editor.chain().focus().setHeading({ level: 1 }).run();
          break;

        case "h2":
          editor.chain().focus().setHeading({ level: 2 }).run();
          break;

        case "h3":
          editor.chain().focus().setHeading({ level: 3 }).run();
          break;
      }
    },
    [editor]
  );

  return (
    <Select
      variant="subtle"
      className={styles.headingsSelect}
      value={getCurrentHeading(editor)}
      initialValue={headings[0].value}
      items={headings}
      onChange={onHeadingChange}
    />
  );
}

function getCurrentHeading(editor: Editor) {
  if (editor.isActive("heading", { level: 1 })) {
    return "h1";
  }

  if (editor.isActive("heading", { level: 2 })) {
    return "h2";
  }

  if (editor.isActive("heading", { level: 3 })) {
    return "h3";
  }

  return "p";
}
