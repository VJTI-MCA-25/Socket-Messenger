import { Preview } from "./Preview/Preview.jsx";
import { Picker } from "./Picker/Picker.jsx";
import { Attach } from "./Attach/Attach.jsx";

import styles from "./MessageInput.module.scss";

const MessageInput = ({ input, setInput, media, setMedia, send, onGifSelect, onEmojiSelect }) => {
	return (
		<div className={`${styles.container} z-depth-3`}>
			{media && <Preview preview={media} setPreview={setMedia} />}
			<div className={styles.bar}>
				<Picker onGifSelect={onGifSelect} onEmojiSelect={onEmojiSelect} />
				<Attach />
				<form onSubmit={send} className={styles.form}>
					<input
						autoCorrect="true"
						autoFocus={true}
						autoComplete="off"
						name="message"
						placeholder="Type your message here..."
						className={styles.input}
						type="text"
						onChange={(e) => setInput(e.target.value)}
						value={input}
					/>
					<button type="submit" className={`${styles.send} waves-effect waves-light btn`}>
						Send
					</button>
				</form>
			</div>
		</div>
	);
};

export default MessageInput;
