import { UserItem } from "./UserItem/UserItem";
import { sendInvite } from "services/userFunctions";
import { useTransition } from "@react-spring/web";
import { toast } from "materialize-css";
import styles from "./ListUsers.module.scss";

const ListUsers = ({ usersList }) => {
	async function handleInvite(sendTo) {
		try {
			let response = await sendInvite(sendTo);
			if (response === "invite/sent") {
				toast({ html: "Invite sent!" });
			}
		} catch (error) {
			if (error.statusText === "invite/already-sent") toast({ html: "Invite already sent!" });
			if (error.statusText === "invite/already-received") toast({ html: "Invite already received!" });
			else console.error(error);
		}
	}

	const friendsListAnim = useTransition(usersList, {
		from: { opacity: 0, transform: "translateY(-50px)" },
		enter: { opacity: 1, transform: "translateY(0px)" },
		leave: { opacity: 0, transform: "translateY(-50px)" },
		trail: 100,
		config: { duration: 200 },
		keys: (user) => user.uid,
	});

	return (
		<ul className={styles.friendsList} role="list">
			{friendsListAnim((anim, user) => (
				<UserItem key={user.id} friend={user} handleInvite={handleInvite} styles={styles} anim={anim} />
			))}
		</ul>
	);
};

export { ListUsers };
