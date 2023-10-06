import { Room } from "@/app/Room";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Threads } from "@/components/Threads";
import styles from "./page.module.css";
import { Avatars } from "@/components/Avatars";

export default function Home() {
  return (
    <Room>
      <header className={styles.header}>
        <h1>Video title</h1>
        <Avatars />
      </header>
      <main className={styles.main}>
        <div className={styles.videoPanel}>
          <VideoPlayer />
        </div>
        <div className={styles.threadsPanel}>
          <Threads />
        </div>
      </main>
    </Room>
  );
}
