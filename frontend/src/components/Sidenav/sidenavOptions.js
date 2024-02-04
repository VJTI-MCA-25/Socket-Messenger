import { faGear, faMessage, faUser, faArrowRightFromBracket, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { logoutUser } from "../../services/authFunctions";

const maxSidenavOptions = {
	messages: [
		{
			name: "friends",
			to: "friends",
			icon: faUserGroup,
			classes: "friends-icon-max",
			text: "Friends",
		},
	],
	settings: [
		{
			name: "profile",
			to: "/profile",
			icon: faUser,
			classes: "profile-icon-max",
			text: "Profile",
		},
		{
			name: "settings",
			to: "/settings",
			icon: faGear,
			classes: "settings-icon-max",
			text: "Settings",
		},
		{
			name: "logout",
			icon: faArrowRightFromBracket,
			classes: "logout-icon-max",
			text: "Logout",
			onClick: logoutUser,
		},
	],
};

const minSidenavOptions = [
	{
		icon: faMessage,
		name: "messages",
		iconClasses: "messages-icon-min",
	},
	{
		icon: faGear,
		name: "settings",
		iconClasses: "gear-icon-min",
	},
];

export { minSidenavOptions, maxSidenavOptions };
