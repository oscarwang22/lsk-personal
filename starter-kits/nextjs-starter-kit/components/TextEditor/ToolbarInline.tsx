import { Button } from "../../primitives/Button";
import styles from "./Toolbar.module.css";
import { BoldIcon } from "../../icons/Bold";
import { ItalicIcon } from "../../icons/Italic";
import { StrikethroughIcon } from "../../icons/Strikethrough";
import { Editor } from "@tiptap/react";
import { CodeIcon } from "../../icons/Code";
import { useState } from "react";
import { Input } from "../../primitives/Input";
import { LinkIcon } from "../../icons";
import { Popover } from "../../primitives/Popover";

type Props = {
  editor: Editor;
};

export function ToolbarInline({ editor }: Props) {
  function addLink(link: string) {
    editor.chain().focus().setLink({ href: link }).run();
  }

  return (
    <>
      <Button
        variant="subtle"
        className={styles.toolbarButton}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        data-active={editor.isActive("bold") ? "is-active" : undefined}
        aria-label="Bold"
      >
        <BoldIcon />
      </Button>

      <Button
        variant="subtle"
        className={styles.toolbarButton}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        data-active={editor.isActive("italic") ? "is-active" : undefined}
        aria-label="Italic"
      >
        <ItalicIcon />
      </Button>

      <Button
        variant="subtle"
        className={styles.toolbarButton}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        data-active={editor.isActive("strike") ? "is-active" : undefined}
        aria-label="Strikethrough"
      >
        <StrikethroughIcon />
      </Button>

      <Button
        variant="subtle"
        className={styles.toolbarButton}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        data-active={editor.isActive("code") ? "is-active" : undefined}
        aria-label="Strikethrough"
      >
        <CodeIcon />
      </Button>

      <Popover content={<LinkPopover onSubmit={addLink} />}>
        <Button
          variant="subtle"
          className={styles.toolbarButton}
          disabled={!editor.can().chain().focus().setLink({ href: "" }).run()}
          data-active={editor.isActive("link") ? "is-active" : undefined}
          aria-label="Link"
        >
          <LinkIcon style={{ width: "17px" }} />
        </Button>
      </Popover>
    </>
  );
}

type LinkPopoverProps = {
  onSubmit: (url: string) => void;
};

function LinkPopover({ onSubmit }: LinkPopoverProps) {
  const [value, setValue] = useState("");

  return (
    <form
      className={styles.toolbarPopover}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <label className={styles.toolbarPopoverLabel} htmlFor="">
        Add link to selected text
      </label>
      <div className={styles.toolbarPopoverBar}>
        <Input
          className={styles.toolbarPopoverInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button className={styles.toolbarPopoverButton}>Add link</Button>
      </div>
    </form>
  );
}
