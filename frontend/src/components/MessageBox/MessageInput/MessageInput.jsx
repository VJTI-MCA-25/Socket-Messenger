import { GifSelector } from "./GifSelector/GifSelector";
import styles from "./MessageInput.module.scss";

const MessageInput = ({ inputState, send }) => {
	const [input, setInput] = inputState;

	function onGifSelect(gif) {
		console.log(gif);
	}

	return (
		<div className={styles.container}>
			<GifSelector onGifSelect={onGifSelect} />
			<form onSubmit={send} className={styles.form}>
				<input
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
	);
};

export default MessageInput;
