import { useContext } from "react";
import { Link } from "react-router-dom";
import { animated, useTrail } from "@react-spring/web";
import { UserDataContext } from "contexts/UserDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

const MaxNav = ({ maxNavSlide, activeOptionsList, bind, styles, isNavOpen, groups, activeOption }) => {
	const userData = useContext(UserDataContext);

	function handleClick(func) {
		return () => {
			func && func();
		};
	}

	function groupElements(groups) {
		//TODO Add Animation
		return groups.map((group) => {
			return (
				<li key={group.groupId}>
					<Link to={`${group.groupId}`} className="waves-effect waves-light">
						<div className={styles.groupContainer}>
							<div className={styles.groupImageContainer}>
								<img
									className={styles.groupImage}
									src={group.photoURL || "https://via.placeholder.com/150"}
								/>
							</div>
							<div className={styles.groupDetails}>
								<span className={styles.groupName}>{group.displayName}</span>
								<span className={styles.lastMessage}>{group.lastMessage.content}</span>
							</div>
						</div>
					</Link>
				</li>
			);
		});
	}

	function populateSidenav() {
		return activeOptionsList((anims, option) => {
			return (
				<animated.li style={anims} key={option.name}>
					<Link
						to={option.to}
						className="waves-effect waves-light"
						onClick={handleClick(option.onClick)}
						onKeyDown={(e) => e.key === "Enter" && handleClick(option.onClick)}
						role="menuitem"
						tabIndex={0} // Make the link focusable
					>
						<FontAwesomeIcon icon={option.icon} className={`${option.classes} ${styles.sidenavIcon}`} />
						{option.text}
					</Link>
				</animated.li>
			);
		});
	}

	return (
		<animated.nav
			{...bind()}
			style={{ ...maxNavSlide, touchAction: "none" }}
			className={`z-depth-1 sidenav sidenav-fixed ${styles.sidenavMax} ${isNavOpen ? "" : "hide"}`}
			role="navigation">
			<ul role="menu">
				<li role="none">
					<div className="user-view">
						<div className={`${styles.background} background`}></div>
						<img
							className="circle"
							src={userData?.photoURL ? userData.photoURL : "https://via.placeholder.com/150"}
							alt="User Profile"
						/>
						<span className="white-text name">{userData?.displayName}</span>
						<span className="white-text email">{userData?.email}</span>
					</div>
				</li>
				{populateSidenav()}
				{groups.length > 0 && activeOption === "messages" && (
					<>
						<li>
							<div className={`${styles.divider} divider`}></div>
						</li>
						<li>
							<a className={`${styles.subheader} subheader`}>Your DMs</a>
						</li>
						{groupElements(groups)}
					</>
				)}
			</ul>
		</animated.nav>
	);
};

// PropTypes
MaxNav.propTypes = {
	maxNavSlide: PropTypes.object.isRequired,
	activeOption: PropTypes.string.isRequired,
	activeOptionsList: PropTypes.func.isRequired,
	isNavOpen: PropTypes.bool.isRequired,
	slideNav: PropTypes.func.isRequired,
};

export { MaxNav };
