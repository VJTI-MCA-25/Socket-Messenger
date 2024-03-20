import { useState, useRef, useEffect } from "react";
import { Menu } from "barrel";
import { UserItem } from "./UserItem/UserItem";
import { removeFriend, sendInvite } from "services/userFunctions";
import { useTransition } from "@react-spring/web";
import { faUserSlash, faBan, faFlag } from "@fortawesome/free-solid-svg-icons";
import { toast } from "materialize-css";
import styles from "./ListUsers.module.scss";

const ListUsers = ({ usersList }) => {
	const menuRef = useRef(null);
	const [activeMenu, setActiveMenu] = useState(false);

	const options = [
		{
			text: "Remove Friend",
			icon: faUserSlash,
			clickFn: async (friend) => {
				if (confirm(`Are you sure you want to remove ${friend.displayName} from your friend's list?`)) {
					let res = await removeFriend(friend.uid);
				}
			},
		},
		{
			text: "Block",
			icon: faBan,
			clickFn: console.log,
		},
		{
			text: "Report",
			icon: faFlag,
			clickFn: console.log,
		},
	];

	useEffect(() => {
		function handleMouseDown(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setActiveMenu(null); // Close the menu
			}
		}

		// Bind the event listener
		document.addEventListener("mousedown", handleMouseDown);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	function toggleMenu(uid) {
		setActiveMenu(uid === activeMenu ? false : uid);
	}

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
			{friendsListAnim((anim, friend) => (
				<UserItem
					key={friend.id}
					friend={friend}
					handleInvite={handleInvite}
					styles={styles}
					anim={anim}
					toggleMenu={toggleMenu}>
					<Menu ref={menuRef} options={options} showMenu={activeMenu === friend.uid} friend={friend} />
				</UserItem>
			))}
		</ul>
	);
};

export { ListUsers };
